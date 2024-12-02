use crate::notifications::send_single_notification;
use crate::quickqueries::get_doc_owner;
use crate::reputation::get_user_reputation;
use crate::types::interface::{
    FollowData, IndexResponse, IndexSearch, Notification, PledgeData, PledgeUser, TotalPledging,
};
use crate::user_information::{get_available_balance, get_user_profile_pic, get_user_username};
use crate::{delete_pledge, get_document_description_or_default, get_document_version_or_default};
use base64::encode; // make sure to add `base64` to dependencies in Cargo.toml
use bytes::Bytes;
use candid::{CandidType, Int, Nat, Principal};
use ic_cdk::api::{self, call, set_global_timer, time};
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
use std::iter::Filter;

use std::sync::LazyLock; // For Rust 1.63 and later

static PLEDGE_TOTALS_CACHE: LazyLock<HashMap<String, u64>> = LazyLock::new(HashMap::new);
static FOLLOWER_TOTALS_CACHE: LazyLock<HashMap<String, u64>> = LazyLock::new(HashMap::new);

const DEFAULT_LIMIT: usize = 12;

#[query]
pub fn get_total_pledged(element: String, id: String) -> Result<u64, String> {
    let caller = api::caller();
    // Filter to find documents where the description contains the given element and id
    let filter = ListParams {
        matcher: Some(ListMatcher {
            description: Some(format!("_{}:{}", element, id)), // Match _idea:<id> or _feature:<id>
            ..Default::default()
        }),
        ..Default::default()
    };

    let collection = "pledges_active".to_string(); // Directly use the collection name as a string
    let pledges_result = list_docs_store(caller, collection, &filter)?;

    // Sum the total amount by decoding the data field
    let total_pledged: u64 = pledges_result
        .items
        .iter()
        .map(|(_key, doc)| {
            // Decode the `data` field into a `PledgeData` struct
            let pledge_data: PledgeData = match decode_doc_data(&doc.data) {
                Ok(data) => data,
                Err(_) => return 0, // Skip if decoding fails
            };

            pledge_data.amount
        })
        .sum();

    Ok(total_pledged)
}

#[query]
pub fn get_total_followers(element_id: String) -> u64 {
    let caller = api::caller();
    // Filter to find documents where the key ends with "_{FOLLOWED_ID}"
    let filter = ListParams {
        matcher: Some(ListMatcher {
            key: Some(format!("_{}", element_id)), // Match keys ending with "_{FOLLOWED_ID}"
            ..Default::default()
        }),
        ..Default::default()
    };

    let collection = "follow".to_string(); // Name of the collection storing follow data
    let followers_result = match list_docs_store(caller, collection, &filter) {
        Ok(docs) => docs,
        Err(_) => return 0,
    };

    // Count the documents where the follower exists (validation TODO)
    let total_followers: u64 = followers_result
        .items
        .iter()
        .filter_map(|(_key, doc)| {
            // TODO: Check if the follower exists
            let follower_exists = true; // Placeholder for future validation logic

            if follower_exists {
                Some(1) // Count this follower
            } else {
                None
            }
        })
        .sum();

    (total_followers)
}

#[query]
pub fn get_paginated_topics(
    sort_by: String,
    offset: Option<usize>,
    limit: Option<usize>,
) -> Result<(Vec<IndexResponse>, usize, usize, usize), String> {
    let offset = offset.unwrap_or(0);
    let limit = limit.unwrap_or(12);

    // Step 1: Fetch all elements from the `idea` collection
    let filter = ListParams {
        matcher: None, // No specific filter; fetch all documents
        ..Default::default()
    };
    let collection = "idea".to_string(); // Corrected to "idea" collection
    let caller = api::caller(); // Use the caller principal for authorization
    let ideas_result = list_docs_store(caller, collection, &filter)?;

    // Step 2: Construct `IndexResponse` objects
    let mut elements: Vec<IndexResponse> = ideas_result
        .items
        .iter()
        .filter_map(|(key, doc)| {
            // Decode the data field from the document structure
            let data: serde_json::Value = match decode_doc_data(&doc.data) {
                Ok(data) => data,
                Err(_) => return None, // Skip if decoding fails
            };

            // Extract required fields from the database structure
            let title = data.get("title")?.as_str()?.to_string();
            let subtitle = data.get("subtitle")?.as_str()?.to_string();
            let description = data.get("description")?.as_str()?.to_string();
            let creation_date = doc.created_at;

            // Calculate `total_pledged` and `total_followers`
            let total_pledged = get_total_pledged("idea".to_string(), key.clone()).unwrap_or(0);
            let total_followers = get_total_followers(key.clone());

            Some(IndexResponse {
                element_id: key.clone(), // Use database key as element_id
                title,
                subtitle,
                description,
                creation_date,
                total_pledged,
                total_followers,
                element_type: "topic".to_string(), // Hardcoded to "topic" for this function
            })
        })
        .collect();

    // Step 3: Sort elements based on the `sort_by` parameter
    match sort_by.as_str() {
        "most_pledged" => elements.sort_by(|a, b| b.total_pledged.cmp(&a.total_pledged)),
        "most_followed" => elements.sort_by(|a, b| b.total_followers.cmp(&a.total_followers)),
        "most_recent" => elements.sort_by(|a, b| b.creation_date.cmp(&a.creation_date)),
        _ => {} // Default to no sorting
    }

    // Step 4: Implement pagination
    let total_items = elements.len();
    let paginated_elements = elements
        .into_iter()
        .skip(offset)
        .take(limit)
        .collect::<Vec<_>>();
    let total_pages = (total_items + limit - 1) / limit; // Round up for total pages

    Ok((
        paginated_elements,
        total_items,
        total_pages,
        offset / limit + 1,
    ))
}
