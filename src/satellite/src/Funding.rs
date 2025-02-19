use crate::notifications::send_single_notification;
use crate::quickqueries::get_doc_owner;
use crate::reputation::{get_user_reputation, update_user_reputation};
use crate::types::interface::{
    Approval, ApprovalStatus, ClaimTransfer, ClaimerInfo, ClaimerInfoEnriched, ClaimerType,
    Claimers, CompleteSolutionData, CompletionResult, Discount, EnrichedApprovalData,
    EnrichedPledgeData, FollowData, Idea, IndexResponse, IndexResponseBasicInfo,
    IndexResponseWithApproval, IndexSearch, Notification, OrderedClaimTransfer, PaymentType,
    PledgeApproval, PledgeBasicInfo, PledgeData, PledgeUser, Referral, RejectionData, Solution,
    TotalPledging, Transaction, UserProfileBasicInfo,
};

use crate::user_information::{
    get_available_balance, get_historical_pledged_balance, get_paginated_following_elements,
    get_user_basic_information, get_user_profile_pic, get_user_username,
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

#[update]
pub async fn withdraw_rejection(pledge_id: String, solution_id: String) -> Result<(), String> {
    let caller = api::caller();

    // Validate pledge ownership
    validate_pledge_ownership(&pledge_id, caller)?;

    // Validate solution status
    validate_solution_status(&solution_id, "delivered")?;

    // Check if rejection exists and get its version
    let rejection_key = format!("REJ_{}_{}", pledge_id, solution_id);
    let rejection = get_doc_store(*CONTROLLER, "rejection".to_string(), rejection_key.clone())?
        .ok_or("Rejection not found for this pledge-solution pair")?;

    // Get document version
    let version = get_document_version_or_default("rejection".to_string(), rejection_key.clone())?;

    // Delete the rejection document
    delete_doc_store(
        *CONTROLLER,
        "rejection".to_string(),
        rejection_key,
        DelDoc {
            version: Some(version),
        },
    )?;

    Ok(())
}

// Modify claim_tokens to update approval status
#[update]
pub async fn claim_tokens(solution_id: String) -> Result<Vec<u64>, String> {
    validate_claim_requirements(&solution_id)?;

    let approvals = get_solution_approvals(solution_id.clone())?;
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

#[update]
pub async fn complete_solution(solution_id: String) -> Result<CompletionResult, String> {
    // Step 1: Validate minimum time and other requirements
    validate_minimum_time_passed(&solution_id)?;
    validate_claim_requirements(&solution_id)?;

    // Step 2: Claim Tokens
    let transaction_blocks = match claim_tokens(solution_id.clone()).await {
        Ok(blocks) => blocks,
        Err(e) => return Err(format!("Failed to claim tokens: {}", e)),
    };

    // Step 3: Update Solution Status
    update_solution_status(&solution_id, "completed")?;
    let completion_timestamp = ic_cdk::api::time();

    // Step 4: Reputation Management
    let approval_rate = calculate_approval_rate(&solution_id)?;

    if approval_rate >= 60.0 {
        match update_users_reputation(&solution_id) {
            Ok(_) => log(format!(
                "Updated reputation for users for solution {}",
                solution_id
            )),
            Err(e) => log(format!(
                "Failed to update reputation for users: {} for solution {}",
                e, solution_id
            )),
        };
    };

    // Return completion result
    Ok(CompletionResult {
        transaction_blocks,
        approval_rate,
        completion_timestamp,
    })
}

#[query]
pub fn get_solution_completion_data(solution_id: String) -> Result<CompleteSolutionData, String> {
    let caller = api::caller();

    // 1. Get solution basic info
    let solution_doc = get_doc_store(caller, "solution".to_string(), solution_id.clone())?
        .ok_or("Solution not found")?;
    let solution_json: serde_json::Value = decode_doc_data(&solution_doc.data)?;

    // Get solution owner (solution provider)
    let solution_owner = solution_doc.owner;
    let solution_owner_username = get_user_username(solution_owner.to_string());
    let solution_owner_profile = get_user_profile_pic(solution_owner.to_string());

    // 2. Get approval metrics
    let approval_rate = calculate_approval_rate(&solution_id)?;
    let approvals = match get_solution_approvals(solution_id.clone()) {
        Ok(approvals) => approvals,
        Err(_) => Vec::new(), // If no approvals found, use empty vector
    };

    // Get all active pledges for the solution's features
    let feature_ids = get_solution_implemented_features(&solution_id)?;
    let active_pledges = get_active_pledges_for_features(&feature_ids)?;
    let total_pledges = active_pledges.len();
    let approved_pledges = approvals
        .iter()
        .filter(|a| matches!(a.status, ApprovalStatus::Pending))
        .count();

    // Create a map to track approvals per feature
    let mut feature_approval_counts: HashMap<String, u64> = HashMap::new();
    let mut feature_approval_amounts: HashMap<String, u64> = HashMap::new();

    // Count approvals and sum amounts per feature
    for approval in &approvals {
        if matches!(approval.status, ApprovalStatus::Pending) {
            *feature_approval_counts
                .entry(approval.feature_id.clone())
                .or_insert(0) += 1;
            *feature_approval_amounts
                .entry(approval.feature_id.clone())
                .or_insert(0) += approval.amount;
        }
    }

    // 3. Get implemented features and their creators
    let mut features: Vec<IndexResponseWithApproval> = Vec::new();
    let mut feature_creators = Vec::new();

    for feature_id in feature_ids {
        if let Ok(Some(feature_doc)) =
            get_doc_store(caller, "feature".to_string(), feature_id.clone())
        {
            let feature_json: serde_json::Value = decode_doc_data(&feature_doc.data)?;

            // Get the approved amount using the updated helper function
            let feature_amount = get_approved_amount_for_feature(&feature_id, &solution_id)?;

            // Get feature creator info
            let creator = feature_doc.owner;
            let creator_username = get_user_username(creator.to_string());
            let creator_profile = get_user_profile_pic(creator.to_string());

            // Add feature to the list
            features.push(IndexResponseWithApproval {
                basic_info: IndexResponseBasicInfo {
                    element_id: feature_id.clone(),
                    title: feature_json["title"]
                        .as_str()
                        .ok_or("Feature title not found")?
                        .to_string(),
                    profile_image: feature_json["images"]
                        .as_array()
                        .and_then(|imgs| imgs.first())
                        .and_then(|img| img.as_str())
                        .map(|s| s.to_string())
                        .unwrap_or_else(|| {
                            "https://solutio.one/solutio-images/logo-01.png".to_string()
                        }),
                    creation_date: feature_doc.created_at,
                    element_type: "feature".to_string(),
                },
                approved_amount: feature_amount,
            });

            // Add feature creator with their share based on feature's approval amount
            let creator_amount = (feature_amount as f64 * FEATURE_CREATOR_PERCENTAGE) as u64;
            feature_creators.push(ClaimerInfo {
                principal: creator,
                amount: creator_amount,
            });
        }
    }

    // 4. Calculate total amount and distribution
    let total_amount: u64 = approvals
        .iter()
        .filter(|a| matches!(a.status, ApprovalStatus::Pending))
        .map(|a| a.amount)
        .sum();

    // Get topic owner from the idea_id in the description
    let description = solution_doc
        .description
        .ok_or("No solution description found")?;
    let idea_id = description
        .split("idea_id:")
        .nth(1)
        .ok_or("No idea_id found")?
        .split_whitespace()
        .next()
        .ok_or("Invalid idea_id format")?;

    let topic_doc =
        get_doc_store(caller, "idea".to_string(), idea_id.to_string())?.ok_or("Topic not found")?;
    let topic_owner_principal = topic_doc.owner;

    // Calculate distributions
    let solution_provider_amount = (total_amount as f64 * SOLUTION_PROVIDER_PERCENTAGE) as u64;
    let topic_owner_amount = (total_amount as f64 * TOPIC_OWNER_PERCENTAGE) as u64;
    let platform_fee_amount = (total_amount as f64 * PLATFORM_FEE_PERCENTAGE) as u64;

    // 5. Check completion readiness
    let is_ready_for_completion = approval_rate >= 60.0 && !features.is_empty();

    // Correct the mapping to ClaimerInfo
    let feature_creators: Vec<ClaimerInfo> = feature_creators
        .into_iter()
        .map(|creator| ClaimerInfo {
            principal: creator.principal,
            amount: creator.amount,
        })
        .collect();

    // Correct the mapping for topic_owner
    let topic_owner = ClaimerInfo {
        principal: topic_owner_principal,
        amount: topic_owner_amount,
    };

    // Correct the mapping for solution_provider
    let solution_provider = ClaimerInfo {
        principal: solution_owner,
        amount: solution_provider_amount,
    };

    // Use ClaimerInfoEnriched instead of ClaimerInfo
    let enriched_solution_provider = ClaimerInfoEnriched {
        amount: solution_provider_amount,
        user: get_user_basic_information(solution_owner.to_string())?,
        type_of_claimer: "Solution Provider".to_string(),
    };

    let enriched_feature_creators: Vec<ClaimerInfoEnriched> = feature_creators
        .into_iter()
        .map(|creator| {
            let user_info = get_user_basic_information(creator.principal.to_string())?;
            Ok::<ClaimerInfoEnriched, String>(ClaimerInfoEnriched {
                amount: creator.amount,
                user: user_info,
                type_of_claimer: "Feature Creator".to_string(),
            })
        })
        .collect::<Result<Vec<_>, String>>()?;

    let enriched_topic_owner = ClaimerInfoEnriched {
        amount: topic_owner_amount,
        user: get_user_basic_information(topic_owner_principal.to_string())?,
        type_of_claimer: "Topic Owner".to_string(),
    };

    Ok(CompleteSolutionData {
        solution: IndexResponseBasicInfo {
            element_id: solution_id,
            title: solution_json["title"]
                .as_str()
                .ok_or("Solution title not found")?
                .to_string(),
            profile_image: solution_json["images"]
                .as_array()
                .and_then(|imgs| imgs.first())
                .and_then(|img| img.as_str())
                .map(|s| s.to_string())
                .unwrap_or_else(|| "https://solutio.one/solutio-images/logo-01.png".to_string()),
            creation_date: solution_doc.created_at,
            element_type: "solution".to_string(),
        },
        approval_rate,
        total_pledges: total_pledges.try_into().unwrap(),
        approved_pledges: approved_pledges.try_into().unwrap(),
        delivery_date: solution_doc.created_at,
        features,
        total_amount,
        solution_provider: enriched_solution_provider,
        feature_creators: enriched_feature_creators,
        topic_owner: enriched_topic_owner,
        platform_fee: ClaimerInfo {
            principal: *PLATFORM_FEE_RECEIVER,
            amount: platform_fee_amount,
        },
        is_ready_for_completion,
        feature_approval_counts,
    })
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

#[query]
pub fn get_solution_approvals_enriched(
    solution_id: String,
) -> Result<Vec<EnrichedApprovalData>, String> {
    let caller = api::caller();

    // Get base approvals using existing function
    let approvals = get_solution_approvals(solution_id.clone())?;

    // Process each approval to enrich it with related data
    let enriched_approvals = approvals
        .into_iter()
        .filter_map(|approval| {
            // Get solution info
            let solution_info =
                match get_doc_store(caller, "solution".to_string(), solution_id.clone()) {
                    Ok(Some(solution_doc)) => {
                        let solution_data: serde_json::Value =
                            match decode_doc_data(&solution_doc.data) {
                                Ok(data) => data,
                                Err(_) => return None, // Skip if we can't decode solution data
                            };

                        IndexResponseBasicInfo {
                            element_id: solution_id.clone(),
                            title: solution_data
                                .get("title")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown solution")
                                .to_string(),
                            profile_image: solution_data
                                .get("images")
                                .and_then(|images| images.as_array())
                                .and_then(|arr| arr.get(0))
                                .and_then(|img| img.as_str())
                                .unwrap_or("https://solutio.one/solutio-images/logo-01.png")
                                .to_string(),
                            creation_date: solution_doc.created_at,
                            element_type: "solution".to_string(),
                        }
                    }
                    _ => return None, // Skip if we can't get solution info
                };

            // Get feature info
            let feature_info =
                match get_doc_store(caller, "feature".to_string(), approval.feature_id.clone()) {
                    Ok(Some(feature_doc)) => {
                        let feature_data: serde_json::Value =
                            match decode_doc_data(&feature_doc.data) {
                                Ok(data) => data,
                                Err(_) => return None, // Skip if we can't decode feature data
                            };

                        IndexResponseBasicInfo {
                            element_id: approval.feature_id.clone(),
                            title: feature_data
                                .get("title")
                                .and_then(|v| v.as_str())
                                .unwrap_or("Unknown feature")
                                .to_string(),
                            profile_image: feature_data
                                .get("images")
                                .and_then(|images| images.as_array())
                                .and_then(|arr| arr.get(0))
                                .and_then(|img| img.as_str())
                                .unwrap_or("https://solutio.one/solutio-images/logo-01.png")
                                .to_string(),
                            creation_date: feature_doc.created_at,
                            element_type: "feature".to_string(),
                        }
                    }
                    _ => return None, // Skip if we can't get feature info
                };

            // Get pledge info
            let pledge_info = match get_doc_store(
                caller,
                "pledges_active".to_string(),
                approval.pledge_id.clone(),
            ) {
                Ok(Some(pledge_doc)) => {
                    let pledge_data: serde_json::Value = match decode_doc_data(&pledge_doc.data) {
                        Ok(data) => data,
                        Err(_) => return None, // Skip if we can't decode pledge data
                    };

                    Some(PledgeBasicInfo {
                        pledge_id: approval.pledge_id.clone(),
                        amount: pledge_data
                            .get("amount")
                            .and_then(|v| v.as_u64())
                            .unwrap_or(0),
                        feature_id: Some(approval.feature_id.clone()),
                        idea_id: pledge_data
                            .get("idea_id")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string())
                            .unwrap_or_default(),
                        status: pledge_data
                            .get("status")
                            .and_then(|v| v.as_str())
                            .unwrap_or("active")
                            .to_string(),
                    })
                }
                _ => None,
            };
            let user_id = approval.user_principal.to_string();
            let username = get_user_username(user_id.clone());
            let profile_picture = get_user_profile_pic(user_id.clone());
            let username_display = if username.is_empty() {
                user_id[..7].to_string() // Fallback to a shortened user ID
            } else {
                username
            };

            let user = UserProfileBasicInfo {
                user_id: user_id.clone(),
                username: username_display,
                profile_picture,
            };

            Some(EnrichedApprovalData {
                approval_id: approval.approval_id,
                amount: approval.amount,
                solution: solution_info,
                feature: feature_info,
                pledge: pledge_info,
                created_at: approval.timestamp,
                status: match approval.status {
                    ApprovalStatus::Pending => "Pending".to_string(),
                    ApprovalStatus::Completed => "Completed".to_string(),
                },
                payment_type: match approval.payment_type {
                    PaymentType::Crypto => "Crypto".to_string(),
                    PaymentType::Fiat => "Fiat".to_string(),
                },
                transaction_number: approval.transaction_number,
                user,
            })
        })
        .collect();

    Ok(enriched_approvals)
}

pub fn get_solution_approvals(solution_id: String) -> Result<Vec<Approval>, String> {
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
        ClaimerType::Solutio => "Solutio Fee", // Note: might want to fix this typo in the enum
    };
    let transaction = Transaction {
        sender: AccountIdentifier::new(&api::id(), &Subaccount(claim.subaccount)),
        target: AccountIdentifier::new(&claim.principal.clone(), &DEFAULT_SUBACCOUNT),
        amount: claim.amount,
        feature_id: claim.feature_id.clone(),
        claimer_id: claim.principal.clone(),
        claimer_type: claim.claimer_type.clone(),
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
        ClaimerType::Solutio => "Solutio Fee", // Note: might want to fix this typo in the enum
    };
    let transaction = Transaction {
        sender: AccountIdentifier::new(&api::id(), &Subaccount(claim.subaccount)),
        target: AccountIdentifier::new(&claim.principal.clone(), &DEFAULT_SUBACCOUNT),
        amount: claim.amount,
        feature_id: claim.feature_id.clone(),
        claimer_id: claim.principal.clone(),
        claimer_type: claim.claimer_type.clone(),
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

fn validate_minimum_time_passed(solution_id: &String) -> Result<(), String> {
    // TODO: Implement time validation
    Ok(())
}

fn update_solution_status(solution_id: &String, new_status: &str) -> Result<(), String> {
    let controller = *CONTROLLER;
    let status_key = format!("SOL_STAT_{}", solution_id);

    // Get the current status document
    let current_status_doc = get_doc_store(
        controller,
        "solution_status".to_string(),
        status_key.clone(),
    )
    .map_err(|e| format!("Failed to fetch solution status: {}", e))?
    .ok_or("Solution status not found")?;

    // Extract the owner from the current description
    let current_description = current_status_doc
        .description
        .ok_or("Status document has no description")?;

    // Use regex to extract the owner part
    let re = Regex::new(r"owner:([^,\s]+)").map_err(|e| format!("Regex error: {}", e))?;
    let owner = re
        .captures(&current_description)
        .ok_or("Could not find owner in status description")?
        .get(1)
        .ok_or("Owner capture group not found")?
        .as_str();

    // Create new description with updated status but same owner
    let new_description = format!("status:{} , owner:{}", new_status.to_uppercase(), owner);

    // Create updated document
    let doc = SetDoc {
        data: current_status_doc.data, // Keep the same data
        description: Some(new_description),
        version: current_status_doc.version, // Keep the same version
    };

    // Update the document
    set_doc_store(controller, "solution_status".to_string(), status_key, doc)
        .map_err(|e| format!("Failed to update solution status: {}", e))?;

    Ok(())
}

fn calculate_approval_rate(solution_id: &String) -> Result<f64, String> {
    // Create matcher for documents containing solution_id
    let matcher = ListMatcher {
        key: Some(format!("_{}", solution_id)),
        ..Default::default()
    };
    let params = ListParams {
        matcher: Some(matcher),
        ..Default::default()
    };

    // Get approvals
    let approval_docs = list_docs_store(*CONTROLLER, "approval".to_string(), &params)
        .map_err(|e| format!("Failed to fetch approvals: {}", e))?;
    let approval_count = approval_docs.items.len();

    // Get rejections
    let rejection_docs = list_docs_store(*CONTROLLER, "rejection".to_string(), &params)
        .map_err(|e| format!("Failed to fetch rejections: {}", e))?;
    let rejection_count = rejection_docs.items.len();

    // Calculate total decisions
    let total_decisions = approval_count + rejection_count;

    // Avoid division by zero
    if total_decisions == 0 {
        return Err("No decisions (approvals or rejections) found for this solution".to_string());
    }

    // Calculate approval rate as percentage
    let approval_rate = (approval_count as f64 / total_decisions as f64) * 100.0;

    Ok(approval_rate)
}

fn update_users_reputation(solution_id: &String) -> Result<String, String> {
    // Step 1: Get implemented features
    let implemented_features = get_solution_implemented_features(solution_id)?;

    // Step 2: Get inactive pledges for these features
    let defaulted_pledges = get_active_pledges_for_features(&implemented_features)?;

    // Step 3: Update reputation for each defaulting user
    for pledge in defaulted_pledges {
        // Convert string user to Principal
        let user_principal = Principal::from_text(&pledge.user)
            .map_err(|e| format!("Invalid principal format: {}", e))?;

        // Update reputation with promised amount (expected_amount) and 0 paid
        match update_user_reputation(user_principal, 0, pledge.expected_amount) {
            Ok(_) => {
                // Create notification for the user
                let notification = Notification {
                    title: "Reputation Update".to_string(),
                    subtitle: "Your reputation has been updated".to_string(),
                    imageURL: "".to_string(), // No image needed for this notification
                    linkURL: "".to_string(),  // Could add a link to user profile if needed
                    sender: "System".to_string(),
                    description: format!(
                        "Your reputation has been updated due to an unfulfilled pledge of {} tokens in solution {}",
                        pledge.amount, solution_id
                    ),
                    typeOf: "reputation_update".to_string(),
                    read: false,
                };

                // Send notification
                if let Err(e) = send_single_notification(
                    "System".to_string(),
                    pledge.user.clone(),
                    notification,
                ) {
                    error_with_data(
                        format!(
                            "Failed to send notification to user {} and solution {}",
                            pledge.user, solution_id
                        ),
                        &json!({ "error": e.to_string(), "timestamp": ic_cdk::api::time() }),
                    )?;
                }
            }
            Err(e) => {
                error_with_data(
                    format!(
                        "Failed to update reputation for user {} and solution {}",
                        pledge.user, solution_id
                    ),
                    &json!({
                        "error": e.to_string(),
                        "timestamp": ic_cdk::api::time(),
                    }),
                )?;
            }
        }
    }

    Ok("Successfully updated reputations for defaulting users".to_string())
}

// Helper function to get features implemented by a solution
pub fn get_solution_implemented_features(solution_id: &String) -> Result<Vec<String>, String> {
    // Get solution document
    let solution_doc = get_doc_store(*CONTROLLER, "solution".to_string(), solution_id.clone())
        .map_err(|e| format!("Failed to fetch solution: {}", e))?
        .ok_or("Solution not found")?;

    // Decode solution data
    let solution_data: serde_json::Value = decode_doc_data(&solution_doc.data)
        .map_err(|e| format!("Failed to decode solution data: {}", e))?;

    // Extract features array
    let features = solution_data["features"]
        .as_array()
        .ok_or("Features field not found or not an array")?
        .iter()
        .filter_map(|v| v.as_str())
        .map(|s| s.to_string())
        .collect();

    Ok(features)
}

// Helper function to get inactive pledges for specific features
fn get_active_pledges_for_features(feature_ids: &Vec<String>) -> Result<Vec<PledgeData>, String> {
    let mut active_pledges = Vec::new();

    // Create a regex pattern that matches any of our feature IDs
    let feature_pattern = feature_ids
        .iter()
        .map(|id| format!("_feature:{}", regex::escape(id)))
        .collect::<Vec<String>>()
        .join("|");

    // Create matcher for documents containing our feature pattern
    let matcher = ListMatcher {
        description: Some(feature_pattern), // Use our regex pattern in the matcher
        ..Default::default()
    };
    let params = ListParams {
        matcher: Some(matcher),
        ..Default::default()
    };

    // Get all pledges
    let pledge_docs = list_docs_store(*CONTROLLER, "pledges_active".to_string(), &params)
        .map_err(|e| format!("Failed to fetch pledges: {}", e))?;

    // Process each pledge
    for doc in pledge_docs.items {
        // First decode to JSON Value
        let pledge_json: serde_json::Value = decode_doc_data(&doc.1.data)
            .map_err(|e| format!("Failed to decode pledge data: {}", e))?;

        // Check status field, default to "inactive" if not found
        let status = pledge_json["status"].as_str().unwrap_or("inactive");

        // Only include if status is "active"
        if status == "active" {
            // Now we can safely try to decode into PledgeData
            if let Ok(pledge_data) = serde_json::from_value::<PledgeData>(pledge_json.clone()) {
                active_pledges.push(pledge_data);
            }
        }
    }

    Ok(active_pledges)
}

fn get_approved_amount_for_feature(feature_id: &str, solution_id: &str) -> Result<u64, String> {
    // Get solution approvals
    let approvals = get_solution_approvals(solution_id.to_string())?;

    // Sum amounts for the specified feature
    let approved_amount: u64 = approvals
        .iter()
        .filter(|approval| approval.feature_id == feature_id)
        .map(|approval| approval.amount)
        .sum();

    Ok(approved_amount)
}
