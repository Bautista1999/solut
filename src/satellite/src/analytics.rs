use crate::config::images::{
    DEFAULT_LINK_PREVIEW_IMAGE, DEFAULT_PROFILE_IMAGE, DEFAULT_SEARCH_RESULT_IMAGE,
};
use crate::reputation::get_user_reputation;
use crate::types::interface::{
    EnrichedApprovalData, EnrichedPledgeData, Idea, IndexResponse, IndexResponseBasicInfo,
    PledgeBasicInfo, UserProfileBasicInfo,
};
use crate::user_information::{
    get_historical_pledged_balance, get_paginated_following_elements, get_user_basic_information,
    get_user_profile_pic, get_user_username,
};
use crate::Funding::get_solution_implemented_features;
use ic_cdk::caller;
use ic_cdk_macros::query;
use junobuild_satellite::{get_doc_store, list_docs_store, log, Doc};
use junobuild_shared::types::list::{ListMatcher, ListParams};
use junobuild_utils::decode_doc_data;
use std::collections::HashMap;

use ic_cdk::api::canister_balance128;
use std::sync::LazyLock;
// For Rust 1.63 and later

static PLEDGE_TOTALS_CACHE: LazyLock<HashMap<String, u64>> = LazyLock::new(HashMap::new);
static FOLLOWER_TOTALS_CACHE: LazyLock<HashMap<String, u64>> = LazyLock::new(HashMap::new);

const NANOS_PER_MILLISECOND: u64 = 1_000_000;
const MILLISECONDS_PER_DAY: u64 = 24 * 60 * 60 * 1000;

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
