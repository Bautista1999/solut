use crate::notifications::send_single_notification;
use crate::quickqueries::get_doc_owner;
use crate::reputation::{get_user_reputation, reverse_user_reputation, update_user_reputation};
use crate::types::interface::{
    Approval, ApprovalStatus, ClaimerInfo, Claimers, Discount, EnrichedPledgeData, FollowData,
    Idea, IndexResponse, IndexResponseBasicInfo, IndexSearch, Notification, PaymentType,
    PledgeData, PledgeUser, Referral, TotalPledging,
};
use crate::user_information::{
    get_available_balance, get_historical_pledged_balance, get_paginated_following_elements,
    get_user_profile_pic, get_user_username,
};
use crate::{delete_pledge, get_document_description_or_default, get_document_version_or_default};
use base64::encode; // make sure to add `base64` to dependencies in Cargo.toml
use bytes::Bytes;
use candid::{CandidType, Int, Nat, Principal};
use ic_cdk::api::{self, call, canister_balance128, set_global_timer, time};
use ic_cdk::spawn;
use ic_cdk_macros::{query, update};
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
const TOPIC_OWNER_PERCENTAGE: f64 = 0.05; // 5%
const FEATURE_CREATOR_PERCENTAGE: f64 = 0.10; // 10%
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

// Add this function to convert strings to subaccounts
fn string_to_subaccount(input: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();

    let mut subaccount = [0u8; 32];
    subaccount.copy_from_slice(&result);
    subaccount
}

async fn send_approval_notifications(
    solution_id: &str,
    pledge_id: &str,
    amount: u64,
    caller: Principal,
) -> Result<(), String> {
    // Get pledge data to find idea_id and feature_id
    let pledge_doc = get_doc_store(
        *CONTROLLER,
        "pledges_active".to_string(),
        pledge_id.to_string(),
    )?
    .ok_or("Pledge not found")?;

    // Decode as generic JSON Value
    let pledge_data: serde_json::Value = serde_json::from_slice(&pledge_doc.data)
        .map_err(|e| format!("Error parsing pledge JSON data: {}", e))?;

    // Extract ids from JSON
    let idea_id = pledge_data["idea_id"]
        .as_str()
        .ok_or("Missing or invalid idea_id")?;
    let feature_id = pledge_data["feature_id"]
        .as_str()
        .ok_or("Missing or invalid feature_id")?;

    // Get owners directly
    let solution_owner = get_doc_owner("solution".to_string(), solution_id.to_string())?;
    let idea_owner = get_doc_owner("idea".to_string(), idea_id.to_string())?;
    let feature_owner = get_doc_owner("feature".to_string(), feature_id.to_string())?;

    // Format amount for display
    let amount_string = format!("{} ICP", amount as f64 / 100_000_000.0);
    let caller_username: String = get_user_username(caller.to_text());

    // Create base notification
    let base_notification = Notification {
        title: "Pledge Approved".to_string(),
        subtitle: format!(
            "A pledge of {} has been approved by {}",
            amount_string, caller_username
        ),
        imageURL: "".to_string(),
        linkURL: format!("/solution/{}", solution_id),
        sender: caller.to_text(),
        description: format!(
            "{} has approved a pledge for your solution",
            caller_username
        ),
        typeOf: "pledge approval".to_string(),
        read: false,
    };

    // Send to solution owner
    let mut solution_notification = base_notification.clone();
    solution_notification.description = format!(
        "{} has approved a pledge for your solution",
        caller_username
    );
    send_single_notification(
        caller.to_text(),
        solution_owner.clone(),
        solution_notification,
    )?;

    // Send to idea owner
    let mut idea_notification = base_notification.clone();
    idea_notification.description = format!(
        "{} has approved a pledge for a solution in your idea",
        caller_username
    );
    send_single_notification(caller.to_text(), idea_owner, idea_notification)?;

    // Send to feature owner
    let mut feature_notification = base_notification.clone();
    feature_notification.description = format!(
        "{} has approved a pledge for a solution in your feature",
        caller_username
    );
    send_single_notification(caller.to_text(), feature_owner, feature_notification)?;

    // Check for referral and send notification if exists
    if let Ok(Some(referral_data)) = check_referral_reward(caller) {
        let mut referral_notification = base_notification.clone();
        referral_notification.description = format!(
            "You earned a referral reward from {}'s approved pledge",
            caller_username
        );
        send_single_notification(
            caller.to_text(),
            referral_data.inviter.to_text(),
            referral_notification,
        )?;
    }

    Ok(())
}

#[update]
pub async fn approve_pledge(
    solution_id: String,
    pledge_id: String,
    amount: u64,
    transaction_number: u64,
    payment_type: PaymentType,
) -> Result<String, String> {
    let caller = api::caller();

    // 1. Validate all conditions using ? operator
    validate_solution_status(&solution_id, "delivered")?;
    validate_pledge_ownership(&pledge_id, caller)?;
    validate_pledge_is_active(&pledge_id)?;
    check_existing_approval(&pledge_id, &solution_id)?;
    // 2. Calculate payment distribution
    let claimers = calculate_payment_distribution(amount, &solution_id, &pledge_id)?;

    // Generate subaccounts for each claimer based on the feature_id
    let feature_id = get_feature_id_from_pledge(&pledge_id)?;
    let subaccount = string_to_subaccount(&feature_id);

    // 3. Create approval record with subaccount
    let approval = Approval {
        approval_id: format!("APPR_{}_{}", pledge_id, solution_id),
        solution_id: solution_id.clone(),
        pledge_id: pledge_id.clone(),
        user_principal: caller,
        amount: amount.clone(),
        transaction_number,
        payment_type,
        timestamp: time(),
        status: ApprovalStatus::Pending,
        claimers,
        subaccount: Some(subaccount),
        feature_id,
    };

    let amount_promised = get_pledge_amount_promised(&pledge_id)?;
    // 4. Store approval and update related records
    store_approval_record(&approval)?;
    update_pledge_status(&pledge_id, amount)?;
    update_user_reputation(caller, amount, amount_promised)?;

    // 5. Send notifications to all relevant parties
    send_approval_notifications(&solution_id, &pledge_id, amount, caller).await?;

    Ok(approval.approval_id)
}

#[update]
pub async fn reverse_approval(approval_id: String) -> Result<(), String> {
    let controller = *CONTROLLER;
    // 1. Get the approval document to extract necessary information
    let approval_doc = get_doc_store(controller, "approval".to_string(), approval_id.to_string())
        .map_err(|e| format!("Error fetching approval: {}", e))?
        .ok_or("Approval not found")?;

    // Decode approval data using serde_json
    let approval_data: serde_json::Value = decode_doc_data(&approval_doc.data)
        .map_err(|e| format!("Error decoding approval data: {}", e))?;

    // Extract necessary fields from JSON
    let solution_id = approval_data["solution_id"]
        .as_str()
        .ok_or("Missing or invalid solution_id")?
        .to_string();

    let pledge_id = approval_data["pledge_id"]
        .as_str()
        .ok_or("Missing or invalid pledge_id")?
        .to_string();

    let amount = approval_data["amount"]
        .as_u64()
        .ok_or("Missing or invalid amount")?;

    let user_principal = Principal::from_text(
        approval_data["user_principal"]
            .as_str()
            .ok_or("Missing or invalid user_principal")?,
    )
    .map_err(|e| format!("Invalid principal format: {}", e))?;

    // 2. Validate solution status
    validate_solution_status(&solution_id, "delivered")?;

    // 3. Reverse changes in order (reputation first, then pledge, then delete approval)
    // Reverse reputation changes
    reverse_user_reputation(
        user_principal,
        amount,
        get_pledge_amount_promised(&pledge_id)?,
    )?;

    // Reverse pledge status
    reverse_changes_pledge_status(&pledge_id)?;

    // Delete approval record
    delete_approval_record(&approval_id)?;

    Ok(())
}

///*** HELPER FUNCTIONS */

// Solution Validation
pub fn validate_solution_status(solution_id: &str, status: &str) -> Result<(), String> {
    // Get controller principal
    let controller = *CONTROLLER;

    // Construct the status document ID
    let status_doc_id = format!("SOL_STAT_{}", solution_id);

    // Fetch the status document using get_doc_store from store.rs
    let status_doc = match get_doc_store(controller, "solution_status".to_string(), status_doc_id) {
        Ok(Some(doc)) => doc,
        Ok(None) => return Err(format!("Solution status with ID {} not found", solution_id)),
        Err(e) => return Err(format!("Error fetching solution status: {}", e)),
    };

    // Get the description which contains status and owner
    let description = match status_doc.description {
        Some(description) => description,
        None => return Err("Status document is empty".to_string()),
    };

    // Parse the status from the description
    // Format: "status:COMPLETED , owner:principal_id"

    // Verify the solution is in 'delivered' status (case insensitive)
    if description.to_uppercase().contains(&status.to_uppercase()) {
        Ok(())
    } else {
        Err(format!(
            "Solution must be in 'DELIVERED' status. Current status' description: {}",
            description
        ))
    }
}

// Approval Validation
fn check_existing_approval(pledge_id: &str, solution_id: &str) -> Result<(), String> {
    // Construct approval ID with APPR prefix
    let approval_id = format!("APPR_{}_{}", pledge_id, solution_id);
    // Check if approval document exists
    match get_doc_store(*CONTROLLER, "approval".to_string(), approval_id) {
        Ok(Some(_)) => Err("Approval already exists for this pledge".to_string()),
        Ok(None) => Ok(()),
        Err(e) => Err(format!("Error checking for existing approval: {}", e)),
    }
}

// Payment Distribution
fn calculate_payment_distribution(
    amount: u64,
    solution_id: &str,
    pledge_id: &str,
) -> Result<Claimers, String> {
    // Get all the principals first
    let solution_doc =
        match get_doc_store(*CONTROLLER, "solution".to_string(), solution_id.to_string()) {
            Ok(Some(doc)) => doc,
            Ok(None) => return Err("Solution not found".to_string()),
            Err(e) => return Err(format!("Error fetching solution: {}", e)),
        };

    let solution_owner = solution_doc.owner;

    // Get pledge data to find feature owner and idea_id
    let pledge_doc = match get_doc_store(
        *CONTROLLER,
        "pledges_active".to_string(),
        pledge_id.to_string(),
    ) {
        Ok(Some(doc)) => doc,
        Ok(None) => return Err("Pledge not found".to_string()),
        Err(e) => return Err(format!("Error fetching pledge: {}", e)),
    };

    // Parse pledge data
    let data: serde_json::Value = decode_doc_data(&pledge_doc.data)
        .map_err(|e| format!("Error decoding pledge data: {}", e))?;

    // Extract required fields using get() and as_str()
    let target = data
        .get("target")
        .and_then(|v| v.as_str())
        .ok_or("Missing or invalid 'target' field")?;

    let idea_id = data
        .get("idea_id")
        .and_then(|v| v.as_str())
        .ok_or("Missing or invalid 'idea_id' field")?;

    // Get feature owner from pledge target
    let feature_owner =
        Principal::from_text(&target).map_err(|_| "Invalid feature owner principal".to_string())?;

    // Get topic owner from idea document
    let idea_doc = match get_doc_store(*CONTROLLER, "idea".to_string(), idea_id.to_string()) {
        Ok(Some(doc)) => doc,
        Ok(None) => return Err("Idea not found".to_string()),
        Err(e) => return Err(format!("Error fetching idea: {}", e)),
    };

    let topic_owner = idea_doc.owner;

    // Calculate initial amounts
    let mut solution_provider_amount = (amount as f64 * SOLUTION_PROVIDER_PERCENTAGE) as u64;
    let mut feature_creator_amount = (amount as f64 * FEATURE_CREATOR_PERCENTAGE) as u64;
    let mut topic_owner_amount = (amount as f64 * TOPIC_OWNER_PERCENTAGE) as u64;
    let mut platform_fee_amount = (amount as f64 * PLATFORM_FEE_PERCENTAGE) as u64;

    // Check for applicable discount
    if let Some(discount) = check_applicable_discount(solution_owner, feature_owner, topic_owner)? {
        let discount_amount = (amount as f64 * discount.percentage) as u64;
        platform_fee_amount = platform_fee_amount.saturating_sub(discount_amount);

        // Add the discount to the corresponding beneficiary
        match discount.beneficiary {
            b if b == solution_owner => solution_provider_amount += discount_amount,
            b if b == feature_owner => feature_creator_amount += discount_amount,
            b if b == topic_owner => topic_owner_amount += discount_amount,
            _ => return Err("Invalid discount beneficiary".to_string()),
        }
    }

    // Check for referral reward and create optional ClaimerInfo
    let referral_reward = if let Some(referral) = check_referral_reward(solution_owner)? {
        let referral_amount = (platform_fee_amount as f64 * referral.percentage) as u64;
        platform_fee_amount = platform_fee_amount.saturating_sub(referral_amount);

        Some(ClaimerInfo {
            principal: referral.inviter,
            amount: referral_amount,
        })
    } else {
        None
    };

    // Create and return Claimers struct
    Ok(Claimers {
        solution_provider: ClaimerInfo {
            principal: solution_owner,
            amount: solution_provider_amount,
        },
        feature_creator: ClaimerInfo {
            principal: feature_owner,
            amount: feature_creator_amount,
        },
        topic_owner: ClaimerInfo {
            principal: topic_owner,
            amount: topic_owner_amount,
        },
        platform_fee: ClaimerInfo {
            principal: *PLATFORM_FEE_RECEIVER,
            amount: platform_fee_amount,
        },
        referral_reward, // Add the optional referral reward
    })
}

// Database Operations
fn store_approval_record(approval: &Approval) -> Result<(), String> {
    // Convert approval to JSON data
    let encoded_data =
        encode_doc_data(&approval).map_err(|e| format!("Error encoding approval data: {}", e))?;

    // Create a description that includes key information
    let description = format!(
        "Approval for pledge {} and solution {}. Amount: {}. Status: {:?}. User: {}",
        approval.pledge_id,
        approval.solution_id,
        approval.amount,
        approval.status,
        approval.user_principal.to_text()
    );

    // Get the version (handles both new and existing documents)
    let version =
        get_document_version_or_default("approval".to_string(), approval.approval_id.clone())?;

    // Store the approval document
    set_doc_store(
        *CONTROLLER,
        "approval".to_string(),
        approval.approval_id.clone(),
        SetDoc {
            data: encoded_data,
            description: Some(description),
            version: Some(version),
        },
    )
    .map_err(|e| format!("Error storing approval record: {}", e))?;

    Ok(())
}

fn update_pledge_status(pledge_id: &str, amount: u64) -> Result<(), String> {
    // Get the current pledge document
    let pledge_doc = get_doc_store(
        *CONTROLLER,
        "pledges_active".to_string(),
        pledge_id.to_string(),
    )
    .map_err(|e| format!("Error fetching pledge: {}", e))?
    .ok_or("Pledge not found")?;

    // Decode the existing data as generic JSON
    let json_data: serde_json::Value = serde_json::from_slice(&pledge_doc.data)
        .map_err(|e| format!("Error parsing JSON data: {}", e))?;

    // Extract required fields from JSON
    let target = json_data
        .get("target")
        .and_then(|v| v.as_str())
        .ok_or("Missing or invalid 'target' field")?;

    let idea_id = json_data
        .get("idea_id")
        .and_then(|v| v.as_str())
        .ok_or("Missing or invalid 'idea_id' field")?;

    let expected_amount = json_data
        .get("expected_amount")
        .and_then(|v| v.as_u64())
        .ok_or("Missing or invalid 'expected_amount' field")?;

    // Create new PledgeData with updated values
    let updated_pledge = PledgeData {
        target: target.to_string(),
        idea_id: idea_id.to_string(),
        amount: json_data
            .get("amount")
            .and_then(|v| v.as_u64())
            .ok_or("Missing or invalid 'amount' field")?,
        expected_amount,
        amount_paid: amount,
        status: "inactive".to_string(),
        doc_key: pledge_id.to_string(),
        feature_id: Some(
            json_data
                .get("feature_id")
                .and_then(|v| v.as_str())
                .ok_or("Missing or invalid 'feature_id' field")?
                .to_string(),
        ),
        user: json_data
            .get("user")
            .and_then(|v| v.as_str())
            .ok_or("Missing or invalid 'user' field")?
            .to_string(),
        payment_type: json_data
            .get("payment_type")
            .and_then(|v| v.as_str())
            .ok_or("Missing or invalid 'payment_type' field")?
            .to_string(),
    };

    // Get version
    let version =
        get_document_version_or_default("pledges_active".to_string(), pledge_id.to_string())?;

    // Encode the new PledgeData struct
    let encoded_data = encode_doc_data(&updated_pledge)
        .map_err(|e| format!("Error encoding pledge data: {}", e))?;

    // Save the updated document
    set_doc_store(
        *CONTROLLER,
        "pledges_active".to_string(),
        pledge_id.to_string(),
        SetDoc {
            data: encoded_data,
            description: pledge_doc.description,
            version: Some(version),
        },
    )
    .map_err(|e| format!("Error updating pledge: {}", e))?;
    calculate_and_store_accuracy(expected_amount, amount);
    Ok(())
}

// Reputation Management

pub fn validate_pledge_ownership(pledge_id: &str, caller: Principal) -> Result<(), String> {
    // Get controller principal
    let controller = *CONTROLLER;

    // Fetch the pledge document
    let pledge_doc = match get_doc_store(
        controller,
        "pledges_active".to_string(),
        pledge_id.to_string(),
    ) {
        Ok(Some(doc)) => doc,
        Ok(None) => return Err(format!("Pledge with ID {} not found", pledge_id)),
        Err(e) => return Err(format!("Error fetching pledge: {}", e)),
    };

    // Get the description which contains status and owner
    let description = match pledge_doc.description {
        Some(desc) => desc,
        None => return Err("Pledge description not found".to_string()),
    };

    // Check if the caller's principal is included in the description
    if description.contains(&caller.to_string()) {
        Ok(())
    } else {
        Err("Caller is not the owner of this pledge".to_string())
    }
}

// Fix the validate_pledge_is_active function's type mismatch
fn validate_pledge_is_active(pledge_id: &str) -> Result<(), String> {
    // Get controller principal
    let controller = *CONTROLLER;

    // Fetch the pledge document
    let pledge_doc = match get_doc_store(
        controller,
        "pledges_active".to_string(),
        pledge_id.to_string(),
    ) {
        Ok(Some(doc)) => {
            let data: PledgeData = decode_doc_data(&doc.data)
                .map_err(|e| format!("Error decoding pledge data: {}", e))?;
            if data.status == "active" {
                Ok(())
            } else {
                Err("Pledge is not active".to_string())
            }
        }
        Ok(None) => Err("Pledge not found".to_string()),
        Err(e) => Err(format!("Error fetching pledge: {}", e)),
    }?;

    Ok(())
}

// Function signatures now use the imported types
fn check_applicable_discount(
    solution_owner: Principal,
    feature_owner: Principal,
    topic_owner: Principal,
) -> Result<Option<Discount>, String> {
    // Get all active discounts for these principals
    let discounts = list_docs_store(
        *CONTROLLER,
        "discount".to_string(),
        &ListParams {
            matcher: None,
            ..Default::default()
        },
    )
    .map_err(|e| format!("Error fetching discounts: {}", e))?;

    let mut valid_discounts: Vec<Discount> = Vec::new();

    // Process each discount
    for doc in discounts.items {
        let discount: Discount = decode_doc_data(&doc.1.data)
            .map_err(|e| format!("Error decoding discount data: {}", e))?;

        // Only consider active discounts
        if !discount.active {
            continue;
        }

        // Check if discount applies to any of our principals
        let applies_to = match discount.context_type.as_str() {
            "solution" => solution_owner == discount.beneficiary,
            "idea" => feature_owner == discount.beneficiary,
            "topic" => topic_owner == discount.beneficiary,
            _ => continue, // Skip invalid context types
        };

        if applies_to {
            valid_discounts.push(discount);
        }
    }

    // If no valid discounts found, return None
    if valid_discounts.is_empty() {
        return Ok(None);
    }

    // Sort discounts by priority (solution > feature > topic)
    valid_discounts.sort_by(|a, b| {
        let priority = |d: &Discount| match d.context_type.as_str() {
            "solution" => 3,
            "feature" => 2,
            "topic" => 1,
            _ => 0,
        };
        priority(b).cmp(&priority(a))
    });

    // Return the highest priority discount
    Ok(Some(valid_discounts[0].clone()))
}

fn check_referral_reward(user: Principal) -> Result<Option<Referral>, String> {
    // Get all referrals
    let referrals = list_docs_store(
        *CONTROLLER,
        "referral".to_string(),
        &ListParams {
            matcher: None,
            ..Default::default()
        },
    )
    .map_err(|e| format!("Error fetching referrals: {}", e))?;

    let current_time = time();

    // Find valid referral for this user
    for doc in referrals.items {
        let referral: Referral = decode_doc_data(&doc.1.data)
            .map_err(|e| format!("Error decoding referral data: {}", e))?;

        // Check if this referral applies to our user and is still valid
        if referral.invitee == user
            && referral.active
            && current_time >= referral.start_date
            && current_time <= referral.expiration_date
        {
            return Ok(Some(referral));
        }
    }

    Ok(None)
}

fn calculate_and_store_accuracy(expected_amount: u64, amount_paid: u64) -> Result<(), String> {
    // Get existing accuracy document if it exists
    let doc = get_doc_store(
        *CONTROLLER,
        "solutio_numbers".to_string(),
        "expected_prediction_accuracy_rate".to_string(),
    )
    .map_err(|e| format!("Error fetching accuracy document: {}", e))?;

    // Parse existing data or create new defaults
    let existing_data: serde_json::Value = if let Some(doc) = &doc {
        serde_json::from_slice(&doc.data)
            .map_err(|e| format!("Error parsing existing data: {}", e))?
    } else {
        serde_json::json!({
            "total_amount_paid": 0u64,
            "total_amount_expected": 0u64,
            "accuracy": 0.0
        })
    };

    // Extract existing values
    let total_paid = existing_data["total_amount_paid"].as_u64().unwrap_or(0) + amount_paid;

    let total_expected =
        existing_data["total_amount_expected"].as_u64().unwrap_or(0) + expected_amount;

    // Calculate new accuracy
    let accuracy = if total_expected > 0 {
        (total_paid as f64 / total_expected as f64) * 100.0
    } else {
        0.0
    };

    // Create updated document
    let updated_data = serde_json::json!({
        "total_amount_paid": total_paid,
        "total_amount_expected": total_expected,
        "accuracy": accuracy
    });

    // Get version (handles both existing and new documents)
    let version = get_document_version_or_default(
        "solutio_numbers".to_string(),
        "expected_prediction_accuracy_rate".to_string(),
    )?;

    // Save the document
    set_doc_store(
        *CONTROLLER,
        "solutio_numbers".to_string(),
        "expected_prediction_accuracy_rate".to_string(),
        SetDoc {
            data: serde_json::to_vec(&updated_data)
                .map_err(|e| format!("Error encoding accuracy data: {}", e))?,
            description: doc.map(|d| d.description).unwrap_or_default(),
            version: Some(version),
        },
    )
    .map_err(|e| format!("Error updating accuracy document: {}", e))?;

    Ok(())
}

// Helper function to extract feature_id from pledge
pub fn get_feature_id_from_pledge(pledge_id: &str) -> Result<String, String> {
    let pledge_doc = get_doc_store(
        *CONTROLLER,
        "pledges_active".to_string(),
        pledge_id.to_string(),
    )
    .map_err(|e| format!("Error fetching pledge: {}", e))?
    .ok_or("Pledge not found")?;

    let data: PledgeData = decode_doc_data(&pledge_doc.data)
        .map_err(|e| format!("Error decoding pledge data: {}", e))?;

    data.feature_id
        .ok_or_else(|| "Feature ID not found in pledge".to_string())
}

fn get_pledge_amount_promised(pledge_id: &str) -> Result<u64, String> {
    let pledge_doc = get_doc_store(
        *CONTROLLER,
        "pledges_active".to_string(),
        pledge_id.to_string(),
    )?;
    let pledge_doc = match pledge_doc {
        Some(doc) => doc,
        None => return Err("Pledge not found".to_string()),
    };

    // Decode the existing data as generic JSON
    let json_data: serde_json::Value = serde_json::from_slice(&pledge_doc.data)
        .map_err(|e| format!("Error parsing JSON data: {}", e))?;

    // Extract expected_amount field from JSON
    let expected_amount = json_data
        .get("expected_amount")
        .and_then(|v| v.as_u64())
        .ok_or("Missing or invalid 'expected_amount' field")?;

    Ok(expected_amount)
}

pub fn delete_approval_record(approval_id: &str) -> Result<(), String> {
    let controller = *CONTROLLER;

    // First verify the approval exists and get its version
    match get_doc_store(controller, "approval".to_string(), approval_id.to_string()) {
        Ok(Some(_)) => {
            // Get the current version
            let version =
                get_document_version_or_default("approval".to_string(), approval_id.to_string())?;

            // Delete the approval document using delete_doc_store
            delete_doc_store(
                controller,
                "approval".to_string(),
                approval_id.to_string(),
                DelDoc {
                    version: Some(version),
                },
            )
            .map_err(|e| format!("Error deleting approval: {}", e))?;
            Ok(())
        }
        Ok(None) => Err(format!("Approval with ID {} not found", approval_id)),
        Err(e) => Err(format!("Error checking approval existence: {}", e)),
    }
}

pub fn reverse_changes_pledge_status(pledge_id: &str) -> Result<(), String> {
    let controller = *CONTROLLER;

    // Get the current pledge document
    let pledge_doc = get_doc_store(
        controller,
        "pledges_active".to_string(),
        pledge_id.to_string(),
    )
    .map_err(|e| format!("Error fetching pledge: {}", e))?
    .ok_or("Pledge not found")?;

    // Decode the existing data
    let json_data: serde_json::Value = serde_json::from_slice(&pledge_doc.data)
        .map_err(|e| format!("Error parsing JSON data: {}", e))?;

    // Create updated PledgeData with reverted values
    let updated_pledge = PledgeData {
        target: json_data["target"].as_str().unwrap_or("").to_string(),
        idea_id: json_data["idea_id"].as_str().unwrap_or("").to_string(),
        amount: json_data["amount"].as_u64().unwrap_or(0),
        expected_amount: json_data["expected_amount"].as_u64().unwrap_or(0),
        amount_paid: 0,               // Reset amount_paid to 0
        status: "active".to_string(), // Reset status to active
        doc_key: pledge_id.to_string(),
        feature_id: json_data["feature_id"].as_str().map(|s| s.to_string()),
        user: json_data["user"].as_str().unwrap_or("").to_string(),
        payment_type: json_data["payment_type"].as_str().unwrap_or("").to_string(),
    };

    // Get version
    let version =
        get_document_version_or_default("pledges_active".to_string(), pledge_id.to_string())?;

    // Encode the updated PledgeData
    let encoded_data = encode_doc_data(&updated_pledge)
        .map_err(|e| format!("Error encoding pledge data: {}", e))?;

    // Save the updated document
    set_doc_store(
        controller,
        "pledges_active".to_string(),
        pledge_id.to_string(),
        SetDoc {
            data: encoded_data,
            description: pledge_doc.description, // Keep the original description
            version: Some(version),
        },
    )
    .map_err(|e| format!("Error updating pledge: {}", e))?;

    Ok(())
}
