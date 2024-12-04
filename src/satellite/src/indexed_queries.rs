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
    let mut description_of_filter = format!("_{}:{}", element, id); // Make it mutable
    if element == "user" {
        description_of_filter = format!("pledger:{}", id); // Reassign the variable
    }
    let filter = ListParams {
        matcher: Some(ListMatcher {
            description: Some(description_of_filter.clone()),
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
    search_term: Option<String>,
) -> Result<(Vec<IndexResponse>, usize, usize, usize), String> {
    let offset = offset.unwrap_or(0);
    let limit = limit.unwrap_or(12);

    // Step 1: Fetch all elements from the `idea` collection
    let filter = ListParams {
        matcher: None, // No specific filter; fetch all documents
        ..Default::default()
    };
    let collection = "idea".to_string(); // Collection name for topics
    let caller = api::caller(); // Use the caller principal for authorization
    let ideas_result = list_docs_store(caller, collection, &filter)?;

    // Normalize the search term for case-insensitive matching
    let search_lower = search_term.as_ref().map(|s| s.to_lowercase());

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
            let profile_image = data
                .get("images")
                .and_then(|images| images.as_array()) // Ensure it's an array
                .and_then(|arr| arr.get(0)) // Get the first element
                .and_then(|img| img.as_str()) // Ensure it's a string
                .map(|s| s.to_string()) // Convert to String
                .unwrap_or_else(|| "https://solutio.one/solutio-images/logo-01.png".to_string()); // Fallback to default image
            let creation_date = doc.created_at;

            // Calculate `total_pledged` and `total_followers`
            let total_pledged = get_total_pledged("idea".to_string(), key.clone()).unwrap_or(0);
            let total_followers = get_total_followers(key.clone());

            let element = IndexResponse {
                element_id: key.clone(), // Use database key as element_id
                title: title.clone(),
                subtitle: subtitle.clone(),
                description: description.clone(),
                profile_image,
                creation_date,
                total_pledged,
                total_followers,
                reputation: None,                  // Not applicable for topics
                element_type: "topic".to_string(), // Hardcoded to "topic" for this function
            };

            // Step 3: Apply search term filtering (if provided)
            if let Some(search) = &search_lower {
                if title.to_lowercase().contains(search)
                    || subtitle.to_lowercase().contains(search)
                    || description.to_lowercase().contains(search)
                {
                    Some(element)
                } else {
                    None
                }
            } else {
                Some(element) // No search term; include all elements
            }
        })
        .collect();

    // Step 4: Sort elements based on the `sort_by` parameter
    match sort_by.as_str() {
        "most_pledged" => elements.sort_by(|a, b| b.total_pledged.cmp(&a.total_pledged)),
        "most_followed" => elements.sort_by(|a, b| b.total_followers.cmp(&a.total_followers)),
        "most_recent" => elements.sort_by(|a, b| b.creation_date.cmp(&a.creation_date)),
        _ => {} // Default to no sorting
    }

    // Step 5: Implement pagination
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

#[query]
pub fn get_paginated_ideas(
    sort_by: String,
    offset: Option<usize>,
    limit: Option<usize>,
    search_term: Option<String>,
    topic_id: Option<String>,
) -> Result<(Vec<IndexResponse>, usize, usize, usize), String> {
    let offset = offset.unwrap_or(0);
    let limit = limit.unwrap_or(12);

    // Step 1: Build the filter with optional topic_id matcher
    let matcher = topic_id.map(|topic| ListMatcher {
        description: Some(format!("idea_id:{}", topic)), // Match description containing "idea_id:<topic_id>"
        ..Default::default()
    });

    let filter = ListParams {
        matcher,
        ..Default::default()
    };

    let collection = "feature".to_string(); // Targeting the "feature" collection
    let caller = api::caller(); // Use the caller principal for authorization
    let features_result = list_docs_store(caller, collection, &filter)?;

    // Normalize the search term for case-insensitive matching
    let search_lower = search_term.as_ref().map(|s| s.to_lowercase());

    // Step 2: Construct `IndexResponse` objects
    let mut elements: Vec<IndexResponse> = features_result
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
            let profile_image = data
                .get("images")
                .and_then(|images| images.as_array())
                .and_then(|arr| arr.get(0))
                .and_then(|img| img.as_str())
                .map(|s| s.to_string())
                .unwrap_or_else(|| "https://solutio.one/solutio-images/logo-01.png".to_string());
            let creation_date = doc.created_at;

            // Calculate `total_pledged` and `total_followers`
            let total_pledged = get_total_pledged("feature".to_string(), key.clone()).unwrap_or(0);
            let total_followers = get_total_followers(key.clone());

            let element = IndexResponse {
                element_id: key.clone(), // Use database key as element_id
                title: title.clone(),
                subtitle: subtitle.clone(),
                description: description.clone(),
                profile_image,
                creation_date,
                total_pledged,
                total_followers,
                reputation: None,                 // Not applicable for ideas
                element_type: "idea".to_string(), // Hardcoded to "idea" for this function
            };

            // Step 3: Apply search term filtering (if provided)
            if let Some(search) = &search_lower {
                if title.to_lowercase().contains(search) || subtitle.to_lowercase().contains(search)
                {
                    Some(element)
                } else {
                    None
                }
            } else {
                Some(element) // No search term; include all elements
            }
        })
        .collect();

    // Step 4: Sort elements based on the `sort_by` parameter
    match sort_by.as_str() {
        "most_pledged" => elements.sort_by(|a, b| b.total_pledged.cmp(&a.total_pledged)),
        "most_followed" => elements.sort_by(|a, b| b.total_followers.cmp(&a.total_followers)),
        "most_recent" => elements.sort_by(|a, b| b.creation_date.cmp(&a.creation_date)),
        _ => {} // Default to no sorting
    }

    // Step 5: Implement pagination
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

#[query]
pub fn get_paginated_users(
    sort_by: String,
    offset: Option<usize>,
    limit: Option<usize>,
    search_term: Option<String>,
) -> Result<(Vec<IndexResponse>, usize, usize, usize), String> {
    let offset = offset.unwrap_or(0);
    let limit = limit.unwrap_or(12);

    // Step 1: Fetch all users from the `user` collection
    let filter = ListParams {
        matcher: None, // No specific filter; fetch all documents
        ..Default::default()
    };
    let collection = "user".to_string(); // Targeting the "user" collection
    let caller = api::caller(); // Use the caller principal for authorization
    let users_result = list_docs_store(caller, collection, &filter)?;

    // Normalize the search term for case-insensitive matching
    let search_lower = search_term.as_ref().map(|s| s.to_lowercase());

    // Step 2: Construct `IndexResponse` objects
    let mut elements: Vec<IndexResponse> = users_result
        .items
        .iter()
        .filter_map(|(key, doc)| {
            // Decode the data field from the document structure
            let data: serde_json::Value = match decode_doc_data(&doc.data) {
                Ok(data) => data,
                Err(_) => return None, // Skip if decoding fails
            };

            // Extract user-specific fields from the database structure
            let username = data.get("username")?.as_str()?.to_string();
            let description = data.get("description")?.as_str()?.to_string();
            let profile_image = data
                .get("profile_image")
                .and_then(|img| img.as_str())
                .map(|s| s.to_string())
                .unwrap_or_else(|| "https://solutio.one/solutio-images/logo-01.png".to_string()); // Default image if not present
            let creation_date = doc.created_at; // Use the creation date from the document
            let reputation = get_user_reputation(doc.owner).unwrap_or(0); // Fetch reputation
            let total_pledged = get_total_pledged("user".to_string(), key.clone()).unwrap_or(0); // Fetch total pledged
            let total_followers = get_total_followers(key.clone()); // Fetch total followers

            let element = IndexResponse {
                element_id: key.clone(),       // Use database key as element_id
                title: username.clone(),       // Map `username` to `title`
                subtitle: description.clone(), // Map `description` to `subtitle`
                description,                   // Keep `description` as the detailed field
                profile_image,                 // Use profile image or default
                creation_date,                 // Always include creation date
                total_pledged,
                total_followers,
                reputation: Some(reputation),     // User-specific field
                element_type: "user".to_string(), // Set type to "user"
            };

            // Step 3: Apply search term filtering (if provided)
            if let Some(search) = &search_lower {
                if username.to_lowercase().contains(search) {
                    Some(element)
                } else {
                    None
                }
            } else {
                Some(element) // No search term; include all elements
            }
        })
        .collect();

    // Step 3: Sort elements based on the `sort_by` parameter
    match sort_by.as_str() {
        "most_reputation" => {
            elements.sort_by(|a, b| b.reputation.unwrap_or(0).cmp(&a.reputation.unwrap_or(0)))
        }
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
