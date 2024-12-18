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
pub fn get_total_pledged_and_expected(element: String, id: String) -> Result<(u64, u64), String> {
    let caller = api::caller();

    // Determine the description filter based on the element type
    let mut description_of_filter = format!("_{}:{}", element, id); // Default for "idea" or "feature"
    if element == "user" {
        description_of_filter = format!("pledger:{}", id); // Special case for "user"
    }

    let filter = ListParams {
        matcher: Some(ListMatcher {
            description: Some(description_of_filter.clone()),
            ..Default::default()
        }),
        ..Default::default()
    };

    let collection = "pledges_active".to_string(); // Directly use the collection name
    let pledges_result = match list_docs_store(caller, collection, &filter) {
        Ok(result) => result,
        Err(err) => {
            // Return 0 for both fields if there's an error
            return Err(format!("Failed to fetch documents: {}", err));
        }
    };

    // Sum up the total pledged and expected amounts
    let (total_pledged, total_expected) = pledges_result.items.iter().fold(
        (0u64, 0u64),
        |(sum_pledged, sum_expected), (_key, doc)| {
            // Decode the `data` field into a `PledgeData` struct
            let pledge_data: PledgeData = match decode_doc_data(&doc.data) {
                Ok(data) => data,
                Err(_) => return (sum_pledged, sum_expected), // Skip if decoding fails
            };

            (
                sum_pledged + pledge_data.amount,
                sum_expected + pledge_data.expected_amount,
            )
        },
    );

    Ok((total_pledged, total_expected))
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
    let amount = canister_balance128();
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
    let cycles_consumed = amount - canister_balance128();
    log(format!(
        "This function has spent:{}",
        cycles_consumed.to_string()
    ));
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

#[query]
pub fn get_paginated_topics_ideas(
    sort_by: String,
    offset: Option<usize>,
    limit: Option<usize>,
    search_term: Option<String>,
) -> Result<(Vec<IndexResponse>, usize, usize, usize), String> {
    let offset = offset.unwrap_or(0);
    let limit = limit.unwrap_or(12);

    // Step 1: Fetch topics and ideas in parallel
    let topics_result = get_paginated_topics(sort_by.clone(), None, None, search_term.clone());
    let ideas_result = get_paginated_ideas(sort_by.clone(), None, None, search_term.clone(), None);

    // Step 2: Check for errors in the results
    let topics = match topics_result {
        Ok((items, _, _, _)) => items,
        Err(err) => {
            return Err(format!("Failed to fetch topics: {}", err));
        }
    };

    let ideas = match ideas_result {
        Ok((items, _, _, _)) => items,
        Err(err) => {
            return Err(format!("Failed to fetch ideas: {}", err));
        }
    };

    // Step 3: Combine topics and ideas
    let mut all_elements = [topics, ideas].concat();

    // Step 4: Sort combined elements
    match sort_by.as_str() {
        "most_pledged" => all_elements.sort_by(|a, b| b.total_pledged.cmp(&a.total_pledged)),
        "most_followed" => all_elements.sort_by(|a, b| b.total_followers.cmp(&a.total_followers)),
        "most_recent" => all_elements.sort_by(|a, b| b.creation_date.cmp(&a.creation_date)),
        _ => {} // Default to no sorting
    }

    // Step 5: Implement pagination
    let total_items = all_elements.len();
    let paginated_elements = all_elements
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
pub fn get_paginated_ideas_by_solution(
    sort_by: String,
    offset: Option<usize>,
    limit: Option<usize>,
    search_term: Option<String>,
    solution_id: String, // Solution ID to fetch related ideas
) -> Result<(Vec<IndexResponse>, usize, usize, usize), String> {
    let offset = offset.unwrap_or(0);
    let limit = limit.unwrap_or(12);

    // Step 1: Retrieve the solution document
    let caller = api::caller();
    let collection = "solution".to_string(); // Collection containing solution documents

    let solution_doc = match get_doc_store(caller.clone(), collection.clone(), solution_id.clone())
    {
        Ok(Some(doc)) => doc,
        Ok(None) => return Err(format!("Solution with ID '{}' not found.", solution_id)),
        Err(err) => return Err(format!("Error fetching solution: {}", err)),
    };

    // Decode the solution document to extract features
    let solution_data: serde_json::Value = match decode_doc_data(&solution_doc.data) {
        Ok(data) => data,
        Err(err) => return Err(format!("Failed to decode solution data: {}", err)),
    };

    // Extract the features (idea IDs) from the solution
    let feature_ids = match solution_data.get("features").and_then(|f| f.as_array()) {
        Some(ids) => ids
            .iter()
            .filter_map(|id| id.as_str().map(String::from))
            .collect::<Vec<_>>(),
        None => return Err("Solution has no associated features.".to_string()),
    };

    if feature_ids.is_empty() {
        return Ok((vec![], 0, 0, 0)); // No features, return empty result
    }

    // Step 2: Construct a regex matcher to filter ideas by feature IDs
    let regex_pattern = format!("^({})$", feature_ids.join("|")); // Regex: "^(xNZ2pPBGL90f4abtMCpbE|p-xXb3rII2a8Y1vvKcAiG)$"
    let filter = ListParams {
        matcher: Some(ListMatcher {
            key: Some(regex_pattern), // Match the `key` against the regex pattern
            ..Default::default()
        }),
        ..Default::default()
    };

    let feature_collection = "feature".to_string(); // Collection containing feature (idea) documents
    let features_result = list_docs_store(caller.clone(), feature_collection, &filter)?;

    // Normalize the search term for case-insensitive matching
    let search_lower = search_term.as_ref().map(|s| s.to_lowercase());

    // Step 3: Construct `IndexResponse` objects
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

            // Apply search term filtering (if provided)
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
pub fn get_funding_details(
    element_type: String,
    id: String,
) -> Result<(u64, u64, usize, Vec<(String, String)>), String> {
    let caller = api::caller();
    let mut pledges: Vec<Doc> = vec![]; // Store pledges here
    let collection = match element_type.as_str() {
        "idea" | "feature" => "pledges_active".to_string(),
        "solution" => "solution".to_string(),
        _ => return Err("Invalid element type".to_string()),
    };

    // Step 1: Collect pledges
    if element_type == "solution" {
        // Fetch features associated with the solution
        let solution_doc = match get_doc_store(caller.clone(), collection.clone(), id.clone()) {
            Ok(Some(doc)) => doc,
            Ok(None) => {
                log(format!("Solution with ID '{}' not found.", id));
                return Ok((0, 0, 0, vec![])); // No solution, return default
            }
            Err(err) => {
                log(format!("Error fetching solution: {}", err));
                return Err(format!("Error fetching solution: {}", err));
            }
        };

        // Decode the solution data to extract features
        let solution_data: serde_json::Value = match decode_doc_data(&solution_doc.data) {
            Ok(data) => data,
            Err(err) => {
                log(format!("Failed to decode solution data: {}", err));
                return Err(format!("Failed to decode solution data: {}", err));
            }
        };

        let feature_ids = match solution_data.get("features").and_then(|f| f.as_array()) {
            Some(ids) => ids
                .iter()
                .filter_map(|id| id.as_str().map(String::from))
                .collect::<Vec<_>>(),
            None => {
                log("Solution has no associated features.".to_string());
                return Ok((0, 0, 0, vec![])); // No features, return default
            }
        };

        if feature_ids.is_empty() {
            log("No features extracted.".to_string());
            return Ok((0, 0, 0, vec![])); // No features, return default
        }

        // Create regex pattern for feature IDs
        // Construct a description filter using feature IDs
        let description_filter = feature_ids
            .iter()
            .map(|id| format!("_feature:{}", id))
            .collect::<Vec<_>>()
            .join("|");

        let filter = ListParams {
            matcher: Some(ListMatcher {
                description: Some(description_filter),
                ..Default::default()
            }),
            ..Default::default()
        };

        // Fetch pledges for features
        let pledges_result = list_docs_store(caller.clone(), "pledges_active".to_string(), &filter);
        pledges = match pledges_result {
            Ok(result) => {
                // Extract and log the keys (first element of the tuples in the vector)
                let keys: Vec<_> = result.items.iter().map(|(key, _)| key).collect();

                result.items.into_iter().map(|(_, doc)| doc).collect()
            }
            Err(err) => {
                log(format!("Error fetching pledges for solution: {}", err));
                return Err(format!("Error fetching pledges for solution: {}", err));
            }
        };
    } else {
        // Collect pledges for idea or feature
        let description_filter = format!("_{}:{}", element_type, id);
        let filter = ListParams {
            matcher: Some(ListMatcher {
                description: Some(description_filter),
                ..Default::default()
            }),
            ..Default::default()
        };

        pledges = match list_docs_store(caller.clone(), "pledges_active".to_string(), &filter) {
            Ok(result) => result.items.into_iter().map(|(_, doc)| doc).collect(),
            Err(err) => {
                return Err(format!(
                    "Error fetching pledges for {}: {}",
                    element_type, err
                ))
            }
        };
    }

    // Step 2: Aggregate data
    let mut total_pledged: u64 = 0;
    let mut total_expected: u64 = 0;
    let mut pledgers: Vec<String> = vec![];

    for pledge in pledges.iter() {
        // Decode pledge data
        let pledge_data: PledgeData = match decode_doc_data(&pledge.data) {
            Ok(data) => data,
            Err(_) => continue, // Skip invalid pledges
        };
        total_pledged += pledge_data.amount;
        total_expected += pledge_data.expected_amount;
        pledgers.push(pledge_data.user);
    }

    // Step 3: Deduplicate pledgers and get top 5
    pledgers.sort();
    pledgers.dedup();
    let top_pledgers = pledgers
        .iter()
        .take(5)
        .map(|user_id| {
            let profile_pic = get_user_profile_pic(user_id.clone());
            (user_id.clone(), profile_pic)
        })
        .collect::<Vec<_>>();

    // Return the result
    Ok((total_pledged, total_expected, pledgers.len(), top_pledgers))
}

#[query]
pub fn check_cycles() -> u128 {
    return canister_balance128();
}
