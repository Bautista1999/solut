use crate::notifications::send_single_notification;
use crate::quickqueries::get_doc_owner;
use crate::reputation::{get_user_reputation, update_user_reputation};
use crate::types::interface::{
    Approval, ApprovalStatus, ClaimTransfer, ClaimerInfo, ClaimerType, Claimers, Discount,
    EnrichedPledgeData, FollowData, Idea, IndexResponse, IndexResponseBasicInfo, IndexSearch,
    Notification, OrderedClaimTransfer, PaymentType, PledgeApproval, PledgeData, PledgeUser,
    Referral, RejectionData, TotalPledging, Transaction,
};

use crate::user_information::{
    get_available_balance, get_historical_pledged_balance, get_paginated_following_elements,
    get_user_profile_pic, get_user_username,
};
use crate::ApprovalFunctions::{
    approve_pledge, get_feature_id_from_pledge, reverse_approval, validate_pledge_ownership,
    validate_solution_status,
};
use crate::{delete_pledge, get_document_description_or_default, get_document_version_or_default};
use base64::encode; // make sure to add `base64` to dependencies in Cargo.toml
use bytes::Bytes;
use candid::{CandidType, Int, Nat, Principal};
use ic_cdk::api::{self, call, canister_balance128, set_global_timer, time};
use ic_cdk::spawn;
use ic_cdk_macros::{query, update};
use ic_ledger_types::{
    account_balance, query_archived_blocks, query_blocks, transfer, AccountBalanceArgs,
    AccountIdentifier, Block, BlockIndex, GetBlocksArgs, Memo, Operation, Subaccount, Tokens,
    TransferArgs, DEFAULT_FEE, DEFAULT_SUBACCOUNT, MAINNET_LEDGER_CANISTER_ID,
};
use junobuild_satellite::{
    count_docs_store, delete_asset_store, delete_assets_store, delete_doc_store, error_with_data,
    get_doc_store, get_many_docs, list_docs_store, log, set_asset_handler, set_doc_store, DelDoc,
    Doc, Key, SetDoc,
};
use junobuild_shared::types::list::{ListMatcher, ListParams};
use junobuild_storage::http::response::error_response;
use junobuild_storage::http::types::HeaderField;
use junobuild_storage::types::store::AssetKey;
use junobuild_storage::well_known::update;
use junobuild_utils::{decode_doc_data, encode_doc_data};
use regex::Regex;
use serde_json::json;
use std::cell::RefCell;
use std::collections::HashMap;
use std::convert::TryFrom;
use std::iter::{Cycle, Filter};

use futures::future::join_all;
use sha2::{Digest, Sha256};
use std::sync::LazyLock;

// Constants for payment distribution
pub const TOPIC_OWNER_PERCENTAGE: f64 = 0.05; // 5%
pub const FEATURE_CREATOR_PERCENTAGE: f64 = 0.10; // 10%
pub const SOLUTION_PROVIDER_PERCENTAGE: f64 = 0.80; // 80%
pub const PLATFORM_FEE_PERCENTAGE: f64 = 0.05; // 5%

// Use LazyLock for Principal constants
static PLATFORM_FEE_RECEIVER: LazyLock<Principal> = LazyLock::new(|| {
    Principal::from_text("4mn74-2q4jr-tuf3f-giso4-nqrtg-b2wvc-m33xx-ivv5t-hy2ir-af7hz-zae")
        .expect("Invalid platform fee receiver principal")
});

static CONTROLLER: LazyLock<Principal> = LazyLock::new(|| {
    Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").expect("Invalid controller principal")
});

#[update]
pub async fn approve_solution_pledges(
    solution_id: String,
    payment_type: PaymentType,
    pledge_approvals: Vec<PledgeApproval>,
) -> Result<Vec<String>, String> {
    let caller = api::caller();

    let feature_approvals = get_feature_approvals(&pledge_approvals, solution_id.clone())?;

    // Verify that the sum of all pledge amounts equals the total transaction amount
    let sum_of_approvals: u64 = pledge_approvals
        .iter()
        .map(|approval| approval.amount)
        .sum();
    // Process each pledge approval
    let mut approval_ids = Vec::new();
    for pledge_approval in pledge_approvals {
        let approval_id = approve_pledge(
            solution_id.clone(),
            pledge_approval.pledge_id,
            pledge_approval.amount,
            pledge_approval.transaction_number,
            payment_type.clone(),
        )
        .await?;

        approval_ids.push(approval_id);
    }

    // Clone necessary values for the spawned task
    let feature_approvals_clone = feature_approvals.clone();
    let payment_type_clone = payment_type.clone();

    spawn(async move {
        // For each feature approval, verify its transaction
        for feature_approval in feature_approvals_clone {
            match verify_transaction_details(
                feature_approval.total_amount,
                feature_approval.transaction_number,
                payment_type_clone.clone(),
            )
            .await
            {
                Ok(_) => {
                    log(format!(
                        "Successfully verified transfer for feature {}",
                        feature_approval.feature_id
                    ));
                }
                Err(e) => {
                    log(format!(
                        "Failed to verify transfer for feature {}: {}",
                        feature_approval.feature_id, e
                    ));
                    // Only reverse the approval for this specific feature
                    match reverse_approval(feature_approval.approval_id.clone()).await {
                        Ok(_) => log(format!(
                            "Successfully reversed approval {} for failed feature {}",
                            feature_approval.approval_id, feature_approval.feature_id
                        )),
                        Err(e) => log(format!(
                            "Error reversing approval {} for feature {}: {}",
                            feature_approval.approval_id, feature_approval.feature_id, e
                        )),
                    };
                }
            };
        }
    });

    Ok(approval_ids)
}

// Transaction Validation

async fn verify_transaction_details(
    amount: u64,
    transaction_number: u64,
    payment_type: PaymentType,
) -> Result<(), String> {
    // Get the ledger canister ID
    let ledger_canister = Principal::from_text("ryjl3-tyaaa-aaaaa-aaaba-cai")
        .map_err(|e| format!("Invalid ledger canister ID: {}", e))?;

    // Query blocks to find the transaction
    let args = GetBlocksArgs {
        start: transaction_number,
        length: 1u64,
    };

    let blocks_result = query_blocks(ledger_canister, args.clone())
        .await
        .map_err(|e: (call::RejectionCode, String)| format!("Failed to query blocks: {:?}", e))?;

    log(format!("Blocks result: {:?}", blocks_result));

    // First check regular blocks
    if let Some(block) = blocks_result.blocks.first() {
        return verify_block_operation(block, amount);
    }

    // If not found in regular blocks, check archived blocks
    if let Some(archived) = blocks_result
        .archived_blocks
        .iter()
        .find(|b| b.start <= transaction_number && (transaction_number - b.start) < b.length)
    {
        // Query the archived blocks
        match query_archived_blocks(&archived.callback, args).await {
            Ok(Ok(range)) => {
                if let Some(block) = range.blocks.first() {
                    return verify_block_operation(block, amount);
                }
            }
            Ok(Err(e)) => return Err(format!("Error querying archived blocks: {}", e)),
            Err(e) => return Err(format!("Failed to call archived blocks: {:?}", e)),
        }
    }
    Err("Transaction not found in blocks or archives".to_string())
}

#[update]
pub async fn withdraw_from_feature_subaccount(
    amount: u64,
    feature_id: String,
    destination_principal: Principal,
) -> Result<u64, String> {
    let ledger_canister = MAINNET_LEDGER_CANISTER_ID;

    // Get the satellite principal (source of the transfer)
    let satellite_principal = Principal::from_text("svftd-daaaa-aaaal-adr3a-cai")
        .map_err(|e| format!("Invalid satellite principal: {}", e))?;

    // Convert feature_id to subaccount
    let subaccount_bytes = string_to_subaccount(&feature_id);
    let subaccount = Subaccount(subaccount_bytes);

    // Create the destination account identifier (just principal, no subaccount)
    let to_account = AccountIdentifier::new(&destination_principal, &Subaccount([0; 32]));

    // Create transfer arguments
    let transfer_args = TransferArgs {
        memo: Memo(0),
        amount: Tokens::from_e8s(amount),
        fee: DEFAULT_FEE,
        from_subaccount: Some(subaccount), // Transfer FROM the feature's subaccount
        to: to_account,
        created_at_time: None,
    };

    // Execute transfer
    let result = match transfer(ledger_canister, transfer_args)
        .await
        .map_err(|e| format!("Transfer call failed: {:?}", e))?
    {
        Ok(index) => index,
        Err(e) => return Err(format!("Transfer rejected: {:?}", e)),
    };

    Ok(result)
}

#[update]
pub async fn get_feature_subaccount_balance(feature_id: String) -> Result<u64, String> {
    let ledger_canister = MAINNET_LEDGER_CANISTER_ID;

    // Get the satellite principal
    let satellite_principal = Principal::from_text("svftd-daaaa-aaaal-adr3a-cai")
        .map_err(|e| format!("Invalid satellite principal: {}", e))?;

    // Convert feature_id to subaccount
    let subaccount_bytes = string_to_subaccount(&feature_id);
    let subaccount = Subaccount(subaccount_bytes);

    // Create the account identifier for the feature's subaccount
    let account = AccountIdentifier::new(&satellite_principal, &subaccount);
    // Query the balance
    let balance = account_balance(ledger_canister, AccountBalanceArgs { account })
        .await
        .map_err(|e| format!("Failed to query balance: {:?}", e))?;

    Ok(balance.e8s())
}

#[update]
pub async fn withdraw_approval(approval_id: String) -> Result<u64, String> {
    let caller = api::caller();

    // Get approval details
    let approval = get_approval_details(&approval_id)?;

    // Validate solution status
    validate_solution_status(&approval.solution_id, "delivered")?;
    // Validate pledge ownership
    validate_pledge_ownership(&approval.pledge_id, caller)?;

    // Check if approval is still pending
    match approval.status {
        ApprovalStatus::Pending => (),
        _ => return Err("Cannot withdraw approval: approval is not in pending status".to_string()),
    }

    // Get feature_id and generate subaccount
    let feature_id = get_feature_id_from_pledge(&approval.pledge_id)?;

    // Transfer funds back to user
    let transfer_result = withdraw_from_feature_subaccount(
        approval.amount - (DEFAULT_FEE.e8s()),
        feature_id.clone(),
        approval.user_principal,
    )
    .await?;

    // If transfer successful, reverse approval in database
    if let Err(e) = reverse_approval(approval_id.clone()).await {
        // CRITICAL ERROR: Transfer succeeded but approval reversal failed
        let error_data = json!({
            "approval_id": approval_id,
            "feature_id": feature_id,
            "amount": approval.amount,
            "user": approval.user_principal.to_string(),
            "transfer_block": transfer_result,
            "error": e
        });

        error_with_data(
            "CRITICAL: Transfer succeeded but approval reversal failed. Manual intervention required.".to_string(),
            &error_data
        )?;

        return Err("Critical error: Transfer completed but approval reversal failed. Manual intervention required.".to_string());
    }

    Ok(transfer_result)
}

#[update]
pub async fn reject_approval(
    pledge_id: String,
    solution_id: String,
    message: Option<String>,
) -> Result<(), String> {
    let caller = api::caller();

    // Validate pledge ownership
    validate_pledge_ownership(&pledge_id, caller)?;

    // Validate solution status
    validate_solution_status(&solution_id, "delivered")?;

    // Get feature_id from pledge
    let feature_id = get_feature_id_from_pledge(&pledge_id)?;

    // Check if rejection already exists
    let rejection_key = format!("REJ_{}_{}", pledge_id, solution_id);
    if let Ok(Some(_)) = get_doc_store(*CONTROLLER, "rejection".to_string(), rejection_key.clone())
    {
        return Err("Rejection already exists for this pledge-solution pair".to_string());
    }

    // Get pledge amount
    let pledge_doc = get_doc_store(*CONTROLLER, "pledges_active".to_string(), pledge_id.clone())?
        .ok_or("Pledge not found")?;
    let pledge_data: PledgeData = decode_doc_data(&pledge_doc.data)?;
    // Create rejection document
    let rejection = RejectionData {
        amount: pledge_data.amount,
        message: message.clone(),
        user_principal: caller,
        solution_id: solution_id.clone(),
        feature_id,
        pledge_id: pledge_id.clone(),
        timestamp: api::time(),
    };

    // Store rejection
    let encoded_data = encode_doc_data(&rejection)?;
    let doc = SetDoc {
        data: encoded_data,
        description: Some(format!("pledge:{}", pledge_id)),
        version: Some(1),
    };
    set_doc_store(*CONTROLLER, "rejection".to_string(), rejection_key, doc)?;

    // Send notification to solution owner
    let solution_owner = get_doc_owner("solution".to_string(), solution_id.clone())?;
    let amount_string = format!("{} ICP", pledge_data.amount as f64 / 100_000_000.0);
    let notification = Notification {
        title: "Pledge Rejected".to_string(),
        subtitle: format!("A pledge of {} ICP has been rejected", amount_string),
        imageURL: "".to_string(),
        linkURL: format!("/solution/{}", solution_id),
        sender: caller.to_text(),
        description: match message {
            Some(msg) => format!("Rejection reason: {}", msg),
            None => "No reason provided".to_string(),
        },
        typeOf: "pledge rejection".to_string(),
        read: false,
    };
    send_single_notification(caller.to_text(), solution_owner, notification)?;

    Ok(())
}

//***** HELPER FUNCTIONS *****//

#[derive(CandidType, Debug, Clone)]
pub struct FeatureApproval {
    feature_id: String,
    total_amount: u64,
    approval_id: String,
    transaction_number: u64,
}

pub fn get_feature_approvals(
    pledge_approvals: &Vec<PledgeApproval>,
    solution_id: String,
) -> Result<Vec<FeatureApproval>, String> {
    let mut feature_approvals: Vec<FeatureApproval> = Vec::new();

    // Iterate through all pledge approvals
    for approval in pledge_approvals {
        // Get the feature_id for this pledge
        let pledge_doc = get_doc_store(
            *CONTROLLER,
            "pledges_active".to_string(),
            approval.pledge_id.clone(),
        )
        .map_err(|e| format!("Error fetching pledge: {}", e))?
        .ok_or("Pledge not found")?;

        let pledge_data: serde_json::Value = decode_doc_data(&pledge_doc.data)
            .map_err(|e| format!("Error decoding pledge data: {}", e))?;

        let feature_id = pledge_data["feature_id"]
            .as_str()
            .ok_or("Missing or invalid feature_id")?
            .to_string();

        // Check if we already have an entry for this feature_id
        let mut found = false;
        for existing in feature_approvals.iter_mut() {
            if existing.feature_id == feature_id {
                existing.total_amount += approval.amount;
                found = true;
                break;
            }
        }

        if !found {
            // If not found, create a new entry
            feature_approvals.push(FeatureApproval {
                feature_id,
                total_amount: approval.amount,
                approval_id: format!("APPR_{}_{}", solution_id, approval.pledge_id),
                transaction_number: approval.transaction_number,
            });
        }
    }

    Ok(feature_approvals)
}

fn get_approval_details(approval_id: &str) -> Result<Approval, String> {
    let controller = *CONTROLLER;

    // Get the approval document
    let approval_doc = get_doc_store(controller, "approval".to_string(), approval_id.to_string())
        .map_err(|e| format!("Error fetching approval: {}", e))?
        .ok_or("Approval not found")?;

    // Decode the approval data
    let approval: Approval = decode_doc_data(&approval_doc.data)
        .map_err(|e| format!("Error decoding approval data: {}", e))?;

    Ok(approval)
}

fn verify_block_operation(block: &Block, amount: u64) -> Result<(), String> {
    if let Some(operation) = &block.transaction.operation {
        match operation {
            Operation::Transfer {
                amount: tx_amount, ..
            } => {
                if tx_amount.e8s() != amount {
                    Err("Transaction amount does not match".to_string())
                } else {
                    Ok(())
                }
            }
            _ => Err("Invalid transaction type".to_string()),
        }
    } else {
        Err("No operation found in transaction".to_string())
    }
}

pub async fn transfer_tokens_to_subaccount(
    amount: u64,
    feature_id: &str,
) -> Result<BlockIndex, String> {
    let ledger_canister = MAINNET_LEDGER_CANISTER_ID;

    // Define the satellite principal
    let satellite_principal = Principal::from_text("svftd-daaaa-aaaal-adr3a-cai")
        .map_err(|e| format!("Invalid satellite principal: {}", e))?;

    // Convert feature_id to subaccount
    let subaccount_bytes = string_to_subaccount(feature_id);
    let subaccount = Subaccount(subaccount_bytes);
    // Create the destination account (satellite principal with feature_id subaccount)
    let to_account = AccountIdentifier::new(&satellite_principal, &subaccount);

    // Create transfer arguments
    let transfer_args = TransferArgs {
        memo: Memo(0),
        amount: Tokens::from_e8s(amount),
        fee: DEFAULT_FEE,
        from_subaccount: None, // Transfer from caller's main account
        to: to_account,
        created_at_time: None, // Let the ledger set this
    };

    // Execute transfer
    transfer(ledger_canister, transfer_args)
        .await
        .map_err(|e| format!("Transfer call failed: {:?}", e))?
        .map_err(|e| format!("Transfer rejected: {:?}", e))
}

pub async fn transfer_tokens_to_many_subaccounts(
    transfers: Vec<FeatureApproval>,
) -> Result<Vec<BlockIndex>, String> {
    let mut block_indices = Vec::new();

    for transfer_info in transfers {
        match transfer_tokens_to_subaccount(transfer_info.total_amount, &transfer_info.feature_id)
            .await
        {
            Ok(block_index) => {
                block_indices.push(block_index);
            }
            Err(e) => {
                if block_indices.is_empty() {
                    match reverse_approval(transfer_info.approval_id.clone()).await {
                        Ok(_) => log(format!(
                            "Successfully reversed approval {}",
                            transfer_info.approval_id
                        )),
                        Err(e) => log(format!(
                            "Error reversing approval {}: {}",
                            transfer_info.approval_id, e
                        )),
                    };
                    return Err(format!("Transfer failed: {}. No successful transfers.", e));
                } else {
                    log(format!(
                        "Reversing approval because transfer failed: {}",
                        transfer_info.approval_id
                    ));
                    match reverse_approval(transfer_info.approval_id.clone()).await {
                        Ok(_) => log(format!(
                            "Successfully reversed approval {}",
                            transfer_info.approval_id
                        )),
                        Err(e) => log(format!(
                            "Error reversing approval {}: {}",
                            transfer_info.approval_id, e
                        )),
                    };

                    return Err(format!(
                        "Transfer failed: {}. Successfully processed {} transfers with block indices: {:?}",
                        e,
                        block_indices.len(),
                        block_indices
                    ));
                }
            }
        }
    }
    Ok(block_indices)
}

// Add this function to convert strings to subaccounts
fn string_to_subaccount(input: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();

    let mut subaccount = [0u8; 32];
    subaccount.copy_from_slice(&result);
    subaccount
}

async fn update_approval_status(approval_id: &str, status: ApprovalStatus) -> Result<(), String> {
    let controller = *CONTROLLER;

    // Get the existing approval document
    let approval_doc = get_doc_store(controller, "approval".to_string(), approval_id.to_string())
        .map_err(|e| format!("Error fetching approval: {}", e))?
        .ok_or("Approval not found")?;

    // Decode the existing approval
    let mut approval: Approval = decode_doc_data(&approval_doc.data)
        .map_err(|e| format!("Error decoding approval data: {}", e))?;

    // Update the status
    approval.status = status;

    // Encode the updated approval
    let encoded_data = encode_doc_data(&approval)?;

    // Create the updated document
    let doc = SetDoc {
        data: encoded_data,
        description: (approval_doc.description),
        version: (approval_doc.version),
    };

    // Store the updated document
    set_doc_store(
        controller,
        "approval".to_string(),
        approval_id.to_string(),
        doc,
    )
    .map_err(|e| format!("Failed to update approval status: {}", e))
    .map(|_| ())
}

// Modify claim_tokens to update approval status
#[update]
pub async fn claim_tokens(solution_id: String) -> Result<Vec<u64>, String> {
    validate_claim_requirements(&solution_id)?;

    let approvals = get_solution_approvals(&solution_id)?;
    let ordered_transfers = aggregate_claimer_amounts(&approvals)?;

    // Extract just the ClaimTransfer parts
    let transfers: Vec<ClaimTransfer> = ordered_transfers
        .into_iter()
        .map(|ot| ot.transfer)
        .collect();

    // Process in batches of 10
    let block_numbers = process_transfers_in_batches(&transfers, solution_id.as_str()).await?;

    // Update approval statuses after successful transfers
    for approval in approvals {
        if matches!(approval.status, ApprovalStatus::Pending) {
            update_approval_status(&approval.approval_id, ApprovalStatus::Completed).await?;
        }
    }

    Ok(block_numbers)
}

fn validate_claim_requirements(solution_id: &str) -> Result<(), String> {
    let caller = api::caller();
    let caller_text = caller.to_text();

    // 1. Verify solution status is "delivered"
    validate_solution_status(solution_id, "delivered")?;

    // 2. Verify caller is solution owner
    let solution_owner = get_doc_owner("solution".to_string(), solution_id.to_string())?;

    if caller_text != solution_owner {
        return Err("Only the solution owner can claim tokens".to_string());
    }

    Ok(())
}

fn get_solution_approvals(solution_id: &str) -> Result<Vec<Approval>, String> {
    let matcher = ListMatcher {
        key: Some(format!("_{}", solution_id)), // Keys starting with "{user_id}_"
        ..Default::default()
    };
    let params = ListParams {
        matcher: Some(matcher),
        ..Default::default()
    };

    let approval_docs = list_docs_store(*CONTROLLER, "approval".to_string(), &params)
        .map_err(|e| format!("Failed to fetch approvals: {}", e))?;

    let approvals: Vec<Approval> = approval_docs
        .items
        .iter()
        .filter_map(|(_, doc)| {
            decode_doc_data::<Approval>(&doc.data)
                .map_err(|e| log(format!("Failed to decode approval: {}", e)))
                .ok()
        })
        .collect();

    if approvals.is_empty() {
        return Err("No approvals found for this solution".to_string());
    }

    Ok(approvals)
}

fn aggregate_claimer_amounts(approvals: &[Approval]) -> Result<Vec<OrderedClaimTransfer>, String> {
    // First, aggregate amounts by feature_id and claimer
    let mut aggregated: HashMap<(String, Principal), (ClaimerType, u64, [u8; 32])> = HashMap::new();

    for approval in approvals {
        if matches!(approval.status, ApprovalStatus::Pending) {
            // Developer (Solution Provider)
            add_to_aggregated(
                &mut aggregated,
                &approval.claimers.solution_provider,
                &approval.feature_id,
                ClaimerType::Developer,
                approval.subaccount,
            );

            // Ideator (Feature Creator)
            add_to_aggregated(
                &mut aggregated,
                &approval.claimers.feature_creator,
                &approval.feature_id,
                ClaimerType::Ideator,
                approval.subaccount,
            );

            // Topic Owner
            add_to_aggregated(
                &mut aggregated,
                &approval.claimers.topic_owner,
                &approval.feature_id,
                ClaimerType::TopicOwner,
                approval.subaccount,
            );

            // Referral (if exists)
            if let Some(ref referral) = approval.claimers.referral_reward {
                add_to_aggregated(
                    &mut aggregated,
                    referral,
                    &approval.feature_id,
                    ClaimerType::Referral,
                    approval.subaccount,
                );
            }

            // Solutio Platform
            add_to_aggregated(
                &mut aggregated,
                &approval.claimers.platform_fee,
                &approval.feature_id,
                ClaimerType::Solutio,
                approval.subaccount,
            );
        }
    }

    // Convert to ordered vector
    let mut ordered_transfers: Vec<OrderedClaimTransfer> = aggregated
        .into_iter()
        .map(
            |((feature_id, principal), (claimer_type, amount, subaccount))| OrderedClaimTransfer {
                claimer_type: claimer_type.clone(),
                transfer: ClaimTransfer {
                    principal,
                    amount,
                    feature_id,
                    subaccount,
                    claimer_type: claimer_type.clone(),
                },
            },
        )
        .collect();

    // Sort by feature_id first, then by claimer_type
    ordered_transfers.sort_by(|a, b| {
        a.transfer
            .feature_id
            .cmp(&b.transfer.feature_id)
            .then(a.claimer_type.cmp(&b.claimer_type))
    });

    Ok(ordered_transfers)
}

fn add_to_aggregated(
    aggregated: &mut HashMap<(String, Principal), (ClaimerType, u64, [u8; 32])>,
    claimer: &ClaimerInfo,
    feature_id: &str,
    claimer_type: ClaimerType,
    subaccount: Option<[u8; 32]>,
) {
    let key = (feature_id.to_string(), claimer.principal);
    let subaccount = string_to_subaccount(feature_id);

    aggregated
        .entry(key)
        .and_modify(|(_, amount, _)| {
            *amount += claimer.amount;
        })
        .or_insert((claimer_type, claimer.amount, subaccount));
}

async fn process_transfers_in_batches(
    claims: &[ClaimTransfer],
    solution_id: &str,
) -> Result<Vec<u64>, String> {
    let mut all_block_numbers = Vec::new();
    let mut current_batch = Vec::new();
    const BATCH_SIZE: usize = 10;

    for claim in claims {
        current_batch.push(process_single_transfer(claim));

        if current_batch.len() >= BATCH_SIZE {
            let results = join_all(current_batch).await;

            // Process batch results
            for (result, claim) in results.into_iter().zip(claims.iter()) {
                match result {
                    Ok(block_number) => {
                        all_block_numbers.push(block_number);
                        record_successful_transfer(solution_id, claim, block_number)?;
                    }
                    Err(e) => {
                        error_with_data(
                            format!(
                                "Transfer failed for feature {} to claimer {}",
                                claim.feature_id, claim.principal
                            ),
                            &json!({
                                "solution_id": solution_id,
                                "feature_id": claim.feature_id,
                                "claimer": claim.principal.to_string(),
                                "amount": claim.amount,
                                "claimer_type": claim.claimer_type,
                                "error": e,
                                "timestamp": ic_cdk::api::time(),
                            }),
                        )?;
                        let _ = record_failed_transfer(solution_id, claim, &e.to_string());
                    }
                }
            }
            current_batch = Vec::new();
        }
    }

    // Process remaining transfers
    if !current_batch.is_empty() {
        let results = join_all(current_batch).await;
        for (result, claim) in results.into_iter().zip(claims.iter()) {
            match result {
                Ok(block_number) => {
                    all_block_numbers.push(block_number);
                    record_successful_transfer(solution_id, claim, block_number)?;
                }
                Err(e) => {
                    error_with_data(
                        format!(
                            "Transfer failed for feature {} to claimer {}",
                            claim.feature_id, claim.principal
                        ),
                        &json!({
                            "solution_id": solution_id,
                            "feature_id": claim.feature_id,
                            "claimer": claim.principal.to_string(),
                            "amount": claim.amount,
                            "claimer_type": format!("{:?}", claim.claimer_type),
                            "error": e,
                            "timestamp": ic_cdk::api::time(),
                        }),
                    )?;
                    return Err(format!("Transfer failed: {}", e));
                }
            }
        }
    }

    Ok(all_block_numbers)
}

async fn process_single_transfer(claim: &ClaimTransfer) -> Result<u64, String> {
    let transfer_args = TransferArgs {
        memo: Memo(0),
        amount: Tokens::from_e8s(claim.amount - DEFAULT_FEE.e8s()),
        fee: DEFAULT_FEE,
        from_subaccount: Some(Subaccount(string_to_subaccount(&claim.feature_id))),
        to: AccountIdentifier::new(&claim.principal, &DEFAULT_SUBACCOUNT),
        created_at_time: None,
    };

    match transfer(MAINNET_LEDGER_CANISTER_ID, transfer_args).await {
        Ok(result) => match result {
            Ok(block_index) => Ok(block_index),
            Err(e) => Err(format!(
                "Transfer failed for principal {} with amount {}: {:?}",
                claim.principal, claim.amount, e
            )),
        },
        Err(e) => Err(format!(
            "Transfer Rejected: Failed for principal {} with amount {}: {:?}",
            claim.principal, claim.amount, e
        )),
    }
}

fn record_successful_transfer(
    solution_id: &str,
    claim: &ClaimTransfer,
    block_number: u64,
) -> Result<(), String> {
    let claimer = match claim.claimer_type {
        ClaimerType::Developer => "Developer",
        ClaimerType::Ideator => "Ideator",
        ClaimerType::TopicOwner => "Topic Owner",
        ClaimerType::Referral => "Referral",
        ClaimerType::Solutio => "Solution Provider", // Note: might want to fix this typo in the enum
    };
    let transaction = Transaction {
        sender: AccountIdentifier::new(&api::id(), &Subaccount(claim.subaccount)),
        target: AccountIdentifier::new(&claim.principal, &DEFAULT_SUBACCOUNT),
        amount: claim.amount,
        transaction_number: Some(block_number),
        status: "completed".to_string(),
        message: format!(
            "Claim transfer for feature {} and the claimer {}",
            claim.feature_id,
            claimer.clone()
        ),
        solution_id: solution_id.to_string(),
        created_at: ic_cdk::api::time(),
    };

    // Generate a unique key for the transaction
    let key = format!(
        "TRANS_{}_{}_{}",
        solution_id, claim.feature_id, block_number
    );
    let description =
        format!(
        "Transaction successfull for solution {} and feature {} for claimer {}. Block Number: {}",
        solution_id, claim.feature_id, claimer.clone(), block_number.to_string()
    );
    // Store transaction in "transaction" collection
    set_doc_store(
        *CONTROLLER,
        "transaction".to_string(),
        key.clone(),
        SetDoc {
            data: encode_doc_data(&transaction)?,
            description: Some(description),
            version: Some(0),
        },
    )
    .map_err(|e| format!("Failed to store transaction: {}", e))?;

    Ok(())
}

fn record_failed_transfer(
    solution_id: &str,
    claim: &ClaimTransfer,
    error: &str,
) -> Result<(), String> {
    let claimer = match claim.claimer_type {
        ClaimerType::Developer => "Developer",
        ClaimerType::Ideator => "Ideator",
        ClaimerType::TopicOwner => "Topic Owner",
        ClaimerType::Referral => "Referral",
        ClaimerType::Solutio => "Solution Provider", // Note: might want to fix this typo in the enum
    };
    let transaction = Transaction {
        sender: AccountIdentifier::new(&api::id(), &Subaccount(claim.subaccount)),
        target: AccountIdentifier::new(&claim.principal, &DEFAULT_SUBACCOUNT),
        amount: claim.amount,
        transaction_number: None, // No block number for failed transfers
        status: "failed".to_string(),
        message: format!(
            "Failed claim transfer for feature {} and claimer {}. Error: {}",
            claim.feature_id,
            error,
            claimer.clone()
        ),
        solution_id: solution_id.to_string(),
        created_at: ic_cdk::api::time(),
    };

    // Generate a unique key for the failed transaction
    let key = format!(
        "TRANS_FAILED_{}_{}_{}",
        solution_id,
        claim.feature_id,
        ic_cdk::api::time()
    );
    let description = format!(
        "Transaction failed for solution {} and feature {} for claimer {}.",
        solution_id,
        claim.feature_id,
        claimer.clone(),
    );
    // Store transaction in "transaction" collection
    set_doc_store(
        *CONTROLLER,
        "transaction".to_string(),
        key,
        SetDoc {
            data: encode_doc_data(&transaction)?,
            description: Some(description),
            version: Some(0),
        },
    )
    .map_err(|e| format!("Failed to store failed transaction: {}", e))?;

    Ok(())
}
