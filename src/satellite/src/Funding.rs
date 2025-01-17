use crate::notifications::send_single_notification;
use crate::quickqueries::get_doc_owner;
use crate::reputation::{get_user_reputation, update_user_reputation};
use crate::types::interface::{
    Approval, ApprovalStatus, ClaimerInfo, Claimers, Discount, EnrichedPledgeData, FollowData,
    Idea, IndexResponse, IndexResponseBasicInfo, IndexSearch, Notification, PaymentType,
    PledgeApproval, PledgeData, PledgeUser, Referral, TotalPledging,
};
use crate::user_information::{
    get_available_balance, get_historical_pledged_balance, get_paginated_following_elements,
    get_user_profile_pic, get_user_username,
};
use crate::ApprovalFunctions::{approve_pledge, reverse_approval};
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
    TransferArgs, DEFAULT_FEE, MAINNET_LEDGER_CANISTER_ID,
};
use junobuild_satellite::{
    count_docs_store, delete_asset_store, delete_assets_store, delete_doc_store, get_doc_store,
    get_many_docs, list_docs_store, log, set_asset_handler, set_doc_store, DelDoc, Doc, Key,
    SetDoc,
};
use junobuild_shared::types::list::{ListMatcher, ListParams};
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

use sha2::{Digest, Sha256};
use std::sync::LazyLock;

// Constants for payment distribution
const TOPIC_OWNER_PERCENTAGE: f64 = 0.01; // 1%
const FEATURE_CREATOR_PERCENTAGE: f64 = 0.14; // 14%
const SOLUTION_PROVIDER_PERCENTAGE: f64 = 0.80; // 80%
const PLATFORM_FEE_PERCENTAGE: f64 = 0.05; // 5%

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

// Add this function to convert strings to subaccounts
fn string_to_subaccount(input: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();

    let mut subaccount = [0u8; 32];
    subaccount.copy_from_slice(&result);
    subaccount
}

// Transaction Validation
#[update]
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
