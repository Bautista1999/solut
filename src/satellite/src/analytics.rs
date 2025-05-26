use crate::config::images::{
    DEFAULT_LINK_PREVIEW_IMAGE, DEFAULT_PROFILE_IMAGE, DEFAULT_SEARCH_RESULT_IMAGE,
};
use crate::reputation::get_user_reputation;
use crate::types::interface::{
    EnrichedApprovalData, EnrichedPledgeData, Idea, IndexResponse, IndexResponseBasicInfo,
    PledgeBasicInfo, PledgeData, UserProfileBasicInfo,
};
use crate::user_information::{
    get_historical_pledged_balance, get_paginated_following_elements, get_user_basic_information,
    get_user_profile_pic, get_user_username,
};
use crate::Funding::get_solution_implemented_features;
use ic_cdk::api::{caller, time};
use ic_cdk_macros::query;
use junobuild_satellite::{get_doc_store, list_docs_store, log, Doc};
use junobuild_shared::types::list::{ListMatcher, ListParams};
use junobuild_utils::decode_doc_data;
use serde_json::Value;
use std::collections::HashMap;

use ic_cdk::api::canister_balance128;
use std::sync::LazyLock;
// For Rust 1.63 and later

static PLEDGE_TOTALS_CACHE: LazyLock<HashMap<String, u64>> = LazyLock::new(HashMap::new);
static FOLLOWER_TOTALS_CACHE: LazyLock<HashMap<String, u64>> = LazyLock::new(HashMap::new);

const NANOS_PER_MILLISECOND: u64 = 1_000_000;
const MILLISECONDS_PER_DAY: u64 = 24 * 60 * 60 * 1000;
const NANOS_PER_DAY: u64 = MILLISECONDS_PER_DAY * NANOS_PER_MILLISECOND;
const DAYS_PER_MONTH: u64 = 30; // Approximation

/// Fetches user registration data aggregated by day.
/// Returns a Vec of tuples where each tuple is (timestamp_ms_start_of_day, count).
#[query]
pub fn get_daily_user_registrations() -> Result<Vec<(u64, u64)>, String> {
    let caller = caller(); // Use caller for potential future permission checks

    // Fetch all documents from the 'user' collection
    let filter = ListParams::default();
    let user_docs = list_docs_store(caller, "user".to_string(), &filter)
        .map_err(|e| format!("Failed to list user documents: {}", e))?;

    let mut daily_counts: HashMap<u64, u64> = HashMap::new();

    for (_key, doc) in user_docs.items {
        let created_at_nanos = doc.created_at;
        let created_at_millis = created_at_nanos / NANOS_PER_MILLISECOND;

        // Calculate the timestamp for the start of the day (midnight UTC)
        let start_of_day_millis = (created_at_millis / MILLISECONDS_PER_DAY) * MILLISECONDS_PER_DAY;

        // Increment the count for that day
        *daily_counts.entry(start_of_day_millis).or_insert(0) += 1;
    }

    // Convert HashMap to Vec<(u64, u64)> for easier consumption by frontend
    let mut result_vec: Vec<(u64, u64)> = daily_counts.into_iter().collect();

    // Sort by timestamp (the day)
    result_vec.sort_unstable_by_key(|&(timestamp, _)| timestamp);

    Ok(result_vec)
}

#[query]
pub fn get_total_users() -> Result<u64, String> {
    let caller = caller();
    let filter = ListParams::default();
    let user_docs = list_docs_store(caller, "user".to_string(), &filter)
        .map_err(|e| format!("Failed to list users: {}", e))?;
    Ok(user_docs.items.len() as u64)
}

#[query]
pub fn get_total_pledges_count() -> Result<u64, String> {
    let caller = caller();
    let filter = ListParams::default();
    let pledge_docs = list_docs_store(caller, "pledges_active".to_string(), &filter)
        .map_err(|e| format!("Failed to list pledges: {}", e))?;
    Ok(pledge_docs.items.len() as u64)
}

#[query]
pub fn get_total_pledges_amount() -> Result<u64, String> {
    let caller = caller();
    let filter = ListParams::default();
    let pledge_docs = list_docs_store(caller, "pledges_active".to_string(), &filter)
        .map_err(|e| format!("Failed to list pledges: {}", e))?;

    let mut total_amount: u64 = 0;
    for (_key, doc) in pledge_docs.items {
        match decode_doc_data::<Value>(&doc.data) {
            Ok(pledge_json) => {
                total_amount += pledge_json
                    .get("amount")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(0);
            }
            Err(e) => {
                log(format!("Failed to decode pledge JSON: {}", e));
                // Skip this doc if decoding fails
            }
        }
    }
    Ok(total_amount)
}

#[query]
pub fn get_active_pledges_count() -> Result<u64, String> {
    let caller = caller();
    let filter = ListParams::default();
    let pledge_docs = list_docs_store(caller, "pledges_active".to_string(), &filter)
        .map_err(|e| format!("Failed to list pledges: {}", e))?;

    let mut active_count: u64 = 0;
    for (_key, doc) in pledge_docs.items {
        // Using PledgeData which has the status field
        match decode_doc_data::<PledgeData>(&doc.data) {
            Ok(pledge_data) => {
                if pledge_data.status.to_lowercase() == "active" {
                    active_count += 1;
                }
            }
            Err(e) => {
                log(format!("Failed to decode pledge data: {}", e));
                // Decide how to handle decode errors, here we just log and skip
            }
        }
    }
    Ok(active_count)
}

#[query]
pub fn get_active_pledges_amount() -> Result<u64, String> {
    let caller = caller();
    let filter = ListParams::default();
    let pledge_docs = list_docs_store(caller, "pledges_active".to_string(), &filter)
        .map_err(|e| format!("Failed to list pledges: {}", e))?;

    let mut active_amount: u64 = 0;
    for (_key, doc) in pledge_docs.items {
        match decode_doc_data::<Value>(&doc.data) {
            Ok(pledge_json) => {
                // Check status, default to "inactive" if missing or not a string
                let status = pledge_json
                    .get("status")
                    .and_then(|v| v.as_str())
                    .unwrap_or("inactive");
                if status.to_lowercase() == "active" {
                    active_amount += pledge_json
                        .get("amount")
                        .and_then(|v| v.as_u64())
                        .unwrap_or(0);
                }
            }
            Err(e) => {
                log(format!(
                    "Failed to decode pledge JSON for active check: {}",
                    e
                ));
                // Skip this doc if decoding fails
            }
        }
    }
    Ok(active_amount)
}

#[query]
pub fn get_monthly_user_growth_percentage() -> Result<f64, String> {
    let caller = caller();
    let filter = ListParams::default();
    let user_docs = list_docs_store(caller, "user".to_string(), &filter)
        .map_err(|e| format!("Failed to list users: {}", e))?;

    let now_nanos = time();
    let thirty_days_ago_nanos = now_nanos - (DAYS_PER_MONTH * NANOS_PER_DAY);
    let sixty_days_ago_nanos = now_nanos - (2 * DAYS_PER_MONTH * NANOS_PER_DAY);

    let mut current_month_users: u64 = 0;
    let mut previous_month_users: u64 = 0;

    for (_key, doc) in user_docs.items {
        let created_at = doc.created_at;
        if created_at >= thirty_days_ago_nanos && created_at < now_nanos {
            current_month_users += 1;
        }
        if created_at >= sixty_days_ago_nanos && created_at < thirty_days_ago_nanos {
            previous_month_users += 1;
        }
    }

    if previous_month_users == 0 {
        if current_month_users > 0 {
            return Ok(100.0); // Growth from 0 to >0 is 100%
        } else {
            return Ok(0.0); // Growth from 0 to 0 is 0%
        }
    }

    let growth =
        (current_month_users as f64 - previous_month_users as f64) / (previous_month_users as f64);
    Ok(growth * 100.0)
}

#[query]
pub fn get_total_transactions_count() -> Result<u64, String> {
    let caller = caller();
    let filter = ListParams::default();
    let transaction_docs = list_docs_store(caller, "transaction".to_string(), &filter)
        .map_err(|e| format!("Failed to list transactions: {}", e))?;
    Ok(transaction_docs.items.len() as u64)
}

#[query]
pub fn get_total_transactions_amount() -> Result<u64, String> {
    let caller = caller();
    let filter = ListParams::default();
    let transaction_docs = list_docs_store(caller, "transaction".to_string(), &filter)
        .map_err(|e| format!("Failed to list transactions: {}", e))?;

    let mut total_amount: u64 = 0;
    for (_key, doc) in transaction_docs.items {
        match decode_doc_data::<Value>(&doc.data) {
            Ok(tx_json) => {
                total_amount += tx_json.get("amount").and_then(|v| v.as_u64()).unwrap_or(0);
            }
            Err(e) => {
                log(format!("Failed to decode transaction JSON: {}", e));
                // Skip this doc if decoding fails
            }
        }
    }
    Ok(total_amount)
}

#[query]
pub fn get_completed_solutions_count() -> Result<u64, String> {
    let caller = caller();
    let filter = ListParams::default(); // Consider filtering description later if needed
    let status_docs = list_docs_store(caller, "solution_status".to_string(), &filter)
        .map_err(|e| format!("Failed to list solution statuses: {}", e))?;

    let completed_count = status_docs
        .items
        .iter()
        .filter(|(_, doc)| {
            doc.description
                .as_deref()
                .unwrap_or("")
                .to_lowercase()
                .contains("status:completed")
        })
        .count();

    Ok(completed_count as u64)
}

#[query]
pub fn get_total_ideas_count() -> Result<u64, String> {
    let caller = caller();
    let filter = ListParams::default();
    // Assuming 'ideas' are stored in the 'feature' collection
    let idea_docs = list_docs_store(caller, "feature".to_string(), &filter)
        .map_err(|e| format!("Failed to list ideas (features): {}", e))?;
    Ok(idea_docs.items.len() as u64)
}

#[query]
pub fn get_total_topics_count() -> Result<u64, String> {
    let caller = caller();
    let filter = ListParams::default();
    // Assuming 'topics' are stored in the 'idea' collection
    let topic_docs = list_docs_store(caller, "idea".to_string(), &filter)
        .map_err(|e| format!("Failed to list topics (ideas): {}", e))?;
    Ok(topic_docs.items.len() as u64)
}
