use crate::reputation::get_user_reputation;
use crate::types::interface::{
    Activity, IndexResponseBasicInfo, PledgeData, User, UserBasicInfo, UserProfileBasicInfo,
};
use crate::{delete_many_images, eliminate_idea, get_document_version_or_default};
use candid::Principal;
use ic_cdk::api::{self, time};
use ic_cdk_macros::{query, update};
use ic_ledger_types::{
    AccountBalanceArgs, AccountIdentifier, Subaccount, Tokens, DEFAULT_SUBACCOUNT,
};
use junobuild_satellite::delete_doc_store;
use junobuild_satellite::{
    get_doc_store, list_assets_store, list_docs_store, log, DelDoc, Doc, Key,
};
use junobuild_shared::types::list::{
    ListMatcher, ListOrder, ListOrderField, ListParams, ListResults, TimestampMatcher,
};
use junobuild_storage::{http::types::HeaderField, types::interface::AssetNoContent};
use junobuild_utils::decode_doc_data;
use regex::Regex;
use serde_bytes::ByteBuf;
use std::collections::HashSet;
use std::{cell::RefCell, fmt::format};

//TODO: Take into account that these pledges are inactive even if the solution hasnt implemented the IDEA targeted in the pledge.
// ---> For example. A user targeted "idea a" on his pledge, but the developer only implemented "idea b".
//      In this case, that pledge is counted as inactive.
#[query]
pub fn get_user_active_pledges(user_id: String) -> Result<Vec<PledgeData>, String> {
    let caller = api::caller();
    let caller_text = Principal::to_text(&caller);
    // if (caller_text != user_id) {
    //     return Err(format!("Permission denied!"));
    // }

    let controller = Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();
    let pledge_collection = "pledges_active".to_string();
    let solution_collection = "solution".to_string();
    let solution_status_collection = "solution_status".to_string();

    let mut active_pledges: Vec<PledgeData> = Vec::new();

    // Step 1: List all pledges in `pledges_active` that include the `user_id` in their description
    let filters = ListParams {
        matcher: Some(ListMatcher {
            description: Some(format!("pledger:{}", user_id)),
            ..Default::default()
        }),
        ..Default::default()
    };

    let user_pledges: ListResults<Doc> =
        match list_docs_store(controller.clone(), pledge_collection.clone(), &filters) {
            Ok(results) => results,
            Err(e) => return Err(format!("Error listing user pledges: {}", e)),
        };

    // Step 2: Iterate over each pledge, filter out inactive ones, and decode the data
    for (_pledge_key, pledge_doc) in user_pledges.items.iter() {
        // Decode pledge data
        let pledge_data: PledgeData = match decode_doc_data(&pledge_doc.data) {
            Ok(data) => data,
            Err(e) => return Err(format!("Failed to decode pledge data: {}", e)),
        };

        // Extract `idea_id` from the description
        let description = pledge_doc.description.clone().unwrap_or_default();
        let idea_id = match extract_parent_topic_id(&description) {
            Some(id) => id,
            None => {
                continue;
            } // Skip if `idea_id` couldn't be parsed
        };

        // Step 3.1: Verify if the parent topic exists in the "idea" collection
        match get_doc_store(controller.clone(), "idea".to_string(), idea_id.clone()) {
            Ok(Some(_)) => {
                // Parent topic exists, continue processing this pledge
            }
            Ok(None) => {
                // Parent topic does not exist; this pledge is considered inactive

                continue;
            }
            Err(err) => {
                continue;
            }
        };

        // Step 3.2: Check if the related solution status is "active"
        // Retrieve the solution document matching the `idea_id`
        let solution_filters = ListParams {
            matcher: Some(ListMatcher {
                description: Some(format!("idea_id:{}", idea_id)),
                ..Default::default()
            }),
            ..Default::default()
        };

        let solution_docs: ListResults<Doc> = match list_docs_store(
            controller.clone(),
            solution_collection.clone(),
            &solution_filters,
        ) {
            Ok(results) => results,
            Err(e) => {
                return Err(format!(
                    "Error listing solution for idea_id {}: {}",
                    idea_id, e
                ))
            }
        };

        // Only proceed if a solution document is found
        if let Some((solution_key, _)) = solution_docs.items.iter().next() {
            // Step 4: Retrieve the solution status document by constructing its key
            let solution_status_key = format!("SOL_STAT_{}", solution_key);

            let solution_status_doc: Option<Doc> = match get_doc_store(
                controller.clone(),
                solution_status_collection.clone(),
                solution_status_key.clone(),
            ) {
                Ok(doc) => doc,
                Err(e) => {
                    return Err(format!(
                        "Error fetching solution status for solution_id {}: {}",
                        solution_key, e
                    ))
                }
            };

            // Check the description for the status: if it contains "completed" or "delivered", skip this pledge
            if let Some(status_doc) = solution_status_doc {
                let status_description = status_doc.description.unwrap_or_default().to_lowercase();

                if status_description.contains("completed")
                    || status_description.contains("delivered")
                {
                    continue; // Skip pledge if target solution is inactive
                }
            }

            // If solution is active, add pledge to active pledges
            active_pledges.push(pledge_data);
        } else {
            active_pledges.push(pledge_data);
        };

        // Return the list of active pledges
    }
    Ok(active_pledges)
}

#[query]
pub fn get_user_total_pledges(user_id: String) -> Result<Vec<PledgeData>, String> {
    let caller = api::caller();
    let caller_text = Principal::to_text(&caller);
    // if (caller_text != user_id) {
    //     return Err(format!("Permission denied!"));
    // }

    let controller = Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();
    let pledge_collection = "pledges_active".to_string();

    let mut active_pledges: Vec<PledgeData> = Vec::new();

    // Step 1: List all pledges in `pledges_active` that include the `user_id` in their description
    let filters = ListParams {
        matcher: Some(ListMatcher {
            description: Some(format!("pledger:{}", user_id)),
            ..Default::default()
        }),
        ..Default::default()
    };

    let user_pledges: ListResults<Doc> =
        match list_docs_store(controller.clone(), pledge_collection.clone(), &filters) {
            Ok(results) => results,
            Err(e) => return Err(format!("Error listing user pledges: {}", e)),
        };

    // Step 2: Iterate over each pledge, filter out inactive ones, and decode the data
    for (_pledge_key, pledge_doc) in user_pledges.items.iter() {
        // Decode pledge data
        let pledge_data: PledgeData = match decode_doc_data(&pledge_doc.data) {
            Ok(data) => data,
            Err(e) => return Err(format!("Failed to decode pledge data: {}", e)),
        };

        active_pledges.push(pledge_data);

        // Return the list of active pledges
    }
    Ok(active_pledges)
}

fn extract_parent_topic_id(description: &str) -> Option<String> {
    // Look for `_idea:` in the description
    if let Some(start_idx) = description.find("_idea:") {
        let start = start_idx + "_idea:".len(); // Move past "_idea:"
        if let Some(end_idx) = description[start..].find(' ') {
            // Extract the ID up to the next space
            return Some(description[start..start + end_idx].to_string());
        } else {
            // No space found, take the rest of the string
            return Some(description[start..].to_string());
        }
    }

    // If `_idea:` is not found, return None
    None
}

#[query]
pub fn get_pledged_balance(user_id: String) -> Result<u64, String> {
    let caller = api::caller();
    let caller_text = Principal::to_text(&caller);
    // if (caller_text != user_id) {
    //     return Err(format!("Permission denied!"));
    // }
    // Step 1: Get all active pledges for the user
    let active_pledges = match get_user_active_pledges(user_id) {
        Ok(pledges) => pledges,
        Err(e) => return Err(format!("Error retrieving active pledges: {}", e)),
    };

    // Step 2: Calculate the total pledged amount
    let total_balance: u64 = active_pledges.iter().map(|pledge| pledge.amount).sum();

    // Step 3: Return the total pledged balance
    Ok(total_balance)
}

#[query]
pub fn get_historical_pledged_balance(user_id: String) -> Result<u64, String> {
    let caller = api::caller();
    let caller_text = Principal::to_text(&caller);
    // if (caller_text != user_id) {
    //     return Err(format!("Permission denied!"));
    // }
    // Step 1: Get all active pledges for the user
    let active_pledges = match get_user_total_pledges(user_id) {
        Ok(pledges) => pledges,
        Err(e) => return Err(format!("Error retrieving active pledges: {}", e)),
    };

    // Step 2: Calculate the total pledged amount
    let total_balance: u64 = active_pledges.iter().map(|pledge| pledge.amount).sum();

    // Step 3: Return the total pledged balance
    Ok(total_balance)
}

#[update] // Use #[update] for async functions
pub async fn get_available_balance(user_id: String) -> Result<u64, String> {
    use ic_cdk::api; // Ensure you have the correct import for `api::caller`

    let caller = api::caller(); // Get the caller principal
    let caller_text = Principal::to_text(&caller);

    // Check if the caller is authorized
    if caller_text != user_id {
        return Err(format!("Permission denied!"));
    }

    // Call the asynchronous function to fetch the real balance
    let balance = get_user_real_balance(user_id.clone())
        .await
        .map_err(|e| format!("Failed to retrieve user balance: {}", e))?;
    let pledged_balance: u64 = match get_pledged_balance(user_id.clone()) {
        Ok(b) => b,
        Err(err) => 0,
    };

    if balance > pledged_balance {
        return Ok(balance - pledged_balance);
    } else {
        return Ok(0);
    }
    Ok(balance)
}

#[update]
pub async fn get_user_real_balance(user_id: String) -> Result<u64, String> {
    // Implement the logic for fetching the user's real ICP token balance
    // For example:
    let caller_principal =
        Principal::from_text(&user_id).map_err(|e| format!("Invalid principal: {}", e))?;
    let default_subaccount = DEFAULT_SUBACCOUNT;
    let account_identifier = AccountIdentifier::new(&caller_principal, &default_subaccount);

    let ledger_canister = Principal::from_text("ryjl3-tyaaa-aaaaa-aaaba-cai")
        .map_err(|e| format!("Invalid ledger canister ID: {}", e))?;
    let args = ic_ledger_types::AccountBalanceArgs {
        account: account_identifier,
    };

    let (balance,): (Tokens,) = ic_cdk::call(ledger_canister, "account_balance", (args,))
        .await
        .map_err(|(code, msg)| format!("Failed to call ledger: {:?} - {}", code, msg))?;

    Ok(balance.e8s())
}

#[query]
pub fn get_user_username(user_id: String) -> String {
    let caller = api::caller();
    let doc = match get_doc_store(caller, "user".to_string(), user_id.clone()) {
        Ok(None) => return user_id.clone(),
        Ok(Some(doc)) => {
            let decoded_data: User = match decode_doc_data(&doc.data) {
                Ok(data) => data,
                Err(err) => return err,
            };

            return decoded_data.username;
        }
        Err(err) => return user_id.clone(),
    };
}

#[query]
pub fn get_user_profile_pic(user_id: String) -> String {
    let caller = api::caller();
    let doc = match get_doc_store(caller, "user".to_string(), user_id.clone()) {
        Ok(None) => return "https://cdn-icons-png.freepik.com/512/8792/8792047.png".to_string(),
        Ok(Some(doc)) => {
            let decoded_data: User = match decode_doc_data(&doc.data) {
                Ok(data) => data,
                Err(err) => return user_id.clone(),
            };

            return decoded_data.profilePicture;
        }
        Err(err) => return "https://cdn-icons-png.freepik.com/512/8792/8792047.png".to_string(),
    };
}

pub fn get_user_following(
    user_id: String,
    follow_type: Option<String>,
) -> Result<Vec<String>, String> {
    let caller = api::caller();

    // Filter to find documents where the key starts with "{user_id}_"
    let filter = ListParams {
        matcher: Some(ListMatcher {
            key: Some(format!("{}_", user_id)), // Keys starting with "{user_id}_"
            ..Default::default()
        }),
        ..Default::default()
    };

    let follow_collection = "follow".to_string(); // Name of the collection storing follow data
    let follow_result = list_docs_store(caller.clone(), follow_collection, &filter)?;

    // Extract IDs from the documents and filter by type
    let followed_ids: HashSet<String> = follow_result
        .items
        .iter()
        .filter_map(|(_key, doc)| {
            let decoded_data: serde_json::Value = match decode_doc_data(&doc.data) {
                Ok(data) => data,
                Err(_) => return None, // Skip decoding errors
            };

            // Filter by follow type (if specified)
            let follow_type_matches = follow_type.as_ref().map_or(true, |ft| {
                decoded_data
                    .get("type")
                    .and_then(|value| value.as_str()) // Safely attempt to convert to &str
                    .map_or(false, |type_str| type_str == ft)
            });

            if follow_type_matches {
                decoded_data.get("following")?.as_str().map(String::from)
            } else {
                None
            }
        })
        .collect();

    let mut valid_ids = Vec::new();

    if let Some(collection) = follow_type.as_deref() {
        // If a specific follow type is provided, validate only in that collection
        let collection_name = match collection {
            "idea" => "idea",
            "feature" => "feature",
            "solution" => "solution",
            "user" => "user",
            _ => return Err("Invalid follow type".to_string()),
        };

        for followed_id in followed_ids {
            if let Ok(Some(_doc)) = get_doc_store(
                caller.clone(),
                collection_name.to_string(),
                followed_id.clone(),
            ) {
                valid_ids.push(followed_id);
            }
        }
    } else {
        // No specific follow type: Check existence across all collections
        let collections = vec!["idea", "feature", "solution", "user"];

        for followed_id in followed_ids {
            for collection in &collections {
                if let Ok(Some(_doc)) =
                    get_doc_store(caller.clone(), collection.to_string(), followed_id.clone())
                {
                    valid_ids.push(followed_id);
                    break; // Once found in one collection, no need to check others
                }
            }
        }
    }

    Ok(valid_ids)
}

fn get_user_followers(user_id: String) -> Result<Vec<String>, String> {
    let caller = api::caller();

    // Filter to find documents where the key ends with "_{user_id}"
    let filter = ListParams {
        matcher: Some(ListMatcher {
            key: Some(format!("_{}", user_id)), // Keys ending with "_{user_id}"
            ..Default::default()
        }),
        ..Default::default()
    };

    let follow_collection = "follow".to_string(); // Collection storing follow data
    let follow_result = list_docs_store(caller.clone(), follow_collection, &filter)?;

    // Extract follower IDs from the documents
    let follower_ids: HashSet<String> = follow_result
        .items
        .iter()
        .filter_map(|(_key, doc)| {
            let decoded_data: serde_json::Value = match decode_doc_data(&doc.data) {
                Ok(data) => data,
                Err(_) => return None, // Skip decoding errors
            };

            // Extract the follower ID
            decoded_data.get("follower")?.as_str().map(String::from)
        })
        .collect();

    let mut valid_ids = Vec::new();

    // Validate the existence of each follower in the "user" collection
    for follower_id in follower_ids {
        if let Ok(Some(_doc)) =
            get_doc_store(caller.clone(), "user".to_string(), follower_id.clone())
        {
            valid_ids.push(follower_id);
        }
    }

    Ok(valid_ids)
}

pub fn get_common_follows(
    user_id_visitor: String,
    user_id_profile_viewed: String,
) -> Result<Vec<String>, String> {
    // Step 1: Get the list of users followed by `user_id_visitor`
    let following_of_visitor =
        match get_user_following(user_id_visitor.clone(), Some("user".to_string())) {
            Ok(users) => users,
            Err(err) => [].to_vec(),
        };

    // Step 2: Get the list of followers of `user_id_profile_viewed`
    let followers_of_profile = match get_user_followers(user_id_profile_viewed.clone()) {
        Ok(users) => users,
        Err(err) => [].to_vec(),
    };

    // Step 3: Find the intersection of the two lists
    let common_users: Vec<String> = following_of_visitor
        .into_iter()
        .filter(|user| followers_of_profile.contains(user))
        .collect();

    Ok(common_users)
}

#[query]
pub fn get_paginated_common_users(
    user_id_visitor: String,
    user_id_profile_viewed: String,
    offset: Option<usize>,
    limit: Option<usize>,
) -> Result<Vec<UserProfileBasicInfo>, String> {
    let offset = offset.unwrap_or(0);
    let limit = limit.unwrap_or(5);

    // Step 1: Get the common users between the visitor and the profile
    let common_users = get_common_follows(user_id_visitor.clone(), user_id_profile_viewed.clone())?;

    // Step 2: Paginate the common users
    let paginated_users = common_users
        .into_iter()
        .skip(offset)
        .take(limit)
        .collect::<Vec<_>>();

    // Step 3: Fetch user information for each common user
    let mut user_profiles = Vec::new();
    for user_id in paginated_users {
        let username = get_user_username(user_id.clone());
        let profile_picture = get_user_profile_pic(user_id.clone());
        let username_display = if username.is_empty() {
            user_id[..7].to_string() // Fallback to a shortened user ID
        } else {
            username
        };

        user_profiles.push(UserProfileBasicInfo {
            user_id,
            username: username_display,
            profile_picture,
        });
    }

    Ok(user_profiles)
}

#[query]
pub fn get_paginated_following_elements(
    user_id: String,
    offset: Option<usize>,
    limit: Option<usize>,
) -> Result<(Vec<IndexResponseBasicInfo>, usize, usize, usize), String> {
    let caller = api::caller();
    let offset = offset.unwrap_or(0);
    let limit = limit.unwrap_or(20);

    // Step 1: Filter for keys starting with `{user_id}_` and of type "user", "idea", "feature", or "solution"
    let filter = ListParams {
        matcher: Some(ListMatcher {
            key: Some(format!("{}_", user_id)),
            ..Default::default()
        }),
        ..Default::default()
    };
    let follow_result = list_docs_store(caller.clone(), "follow".to_string(), &filter)?;

    // Step 2: Extract followed elements from the documents
    let mut elements: Vec<(String, String)> = follow_result
        .items
        .iter()
        .filter_map(|(_key, doc)| {
            // Decode the document data
            let decoded_data: serde_json::Value = match decode_doc_data(&doc.data) {
                Ok(data) => data,
                Err(_) => return None, // Skip invalid documents
            };

            // Extract `following` and `type` fields
            let following_id = decoded_data.get("following")?.as_str()?.to_string();
            let element_type = decoded_data
                .get("type")?
                .as_str()?
                .to_string()
                .to_lowercase();

            Some((following_id, element_type))
        })
        .collect();
    // Step 3: Validate the existence of each followed element
    let mut valid_elements = Vec::new();
    for (element_id, element_type) in elements {
        let collection = match element_type.as_str() {
            "idea" => "idea",
            "feature" => "feature",
            "solution" => "solution",
            "user" => "user",
            "topic" => "idea",
            _ => continue,
        }
        .to_string();

        if let Ok(Some(doc)) = get_doc_store(caller.clone(), collection, element_id.clone()) {
            let decoded_data: serde_json::Value = match decode_doc_data(&doc.data) {
                Ok(data) => data,
                Err(_) => return Err("Failed to decode document data".to_string()),
            };
            let title = decoded_data
                .get("title")
                .or_else(|| decoded_data.get("username"))
                .and_then(|v| v.as_str())
                .unwrap_or("Unknown Title")
                .to_string();
            let profile_image = decoded_data
                .get("profilePicture")
                .or_else(|| {
                    decoded_data
                        .get("images")
                        .and_then(|v| v.as_array()?.get(0))
                })
                .and_then(|v| v.as_str())
                .unwrap_or("https://cdn-icons-png.freepik.com/512/8792/8792047.png")
                .to_string();
            let creation_date = doc.created_at;

            valid_elements.push(IndexResponseBasicInfo {
                element_id,
                title,
                profile_image,
                creation_date,
                element_type,
            });
        }
    }

    // Step 4: Sort the elements by most recent follow
    valid_elements.sort_by(|a, b| b.creation_date.cmp(&a.creation_date));

    // Step 5: Apply pagination
    let total_items = valid_elements.len();
    let paginated_elements = valid_elements
        .into_iter()
        .skip(offset)
        .take(limit)
        .collect::<Vec<_>>();
    let total_pages = (total_items + limit - 1) / limit; // Calculate total pages

    Ok((
        paginated_elements,
        total_items,
        total_pages,
        offset / limit + 1, // Current page
    ))
}

#[query]
pub fn get_paginated_followers(
    user_id: String,
    offset: Option<usize>,
    limit: Option<usize>,
) -> Result<(Vec<IndexResponseBasicInfo>, usize, usize, usize), String> {
    let caller = api::caller();
    let offset = offset.unwrap_or(0);
    let limit = limit.unwrap_or(20);

    // Step 1: Filter for keys ending with `_{user_id}` and of type "user"
    let filter = ListParams {
        matcher: Some(ListMatcher {
            key: Some(format!("_{}", user_id)), // Match keys ending with `_{user_id}`
            ..Default::default()
        }),
        ..Default::default()
    };
    let follow_result = list_docs_store(caller.clone(), "follow".to_string(), &filter)?;

    // Step 2: Extract followers from the documents
    let mut followers: Vec<String> = follow_result
        .items
        .iter()
        .filter_map(|(_key, doc)| {
            // Decode the document data
            let decoded_data: serde_json::Value = match decode_doc_data(&doc.data) {
                Ok(data) => data,
                Err(_) => return None, // Skip invalid documents
            };

            // Extract the `follower` field if the type is "user"
            let follower_id = decoded_data.get("follower")?.as_str()?.to_string();
            let element_type = decoded_data.get("type")?.as_str()?.to_lowercase();

            if element_type == "user" {
                Some(follower_id)
            } else {
                None // Only include followers of type "user"
            }
        })
        .collect();

    // Step 3: Validate the existence of each follower
    let mut valid_followers = Vec::new();
    for follower_id in followers {
        if let Ok(Some(doc)) =
            get_doc_store(caller.clone(), "user".to_string(), follower_id.clone())
        {
            let decoded_data: serde_json::Value = match decode_doc_data(&doc.data) {
                Ok(data) => data,
                Err(_) => return Err("Failed to decode document data".to_string()),
            };
            let title = decoded_data
                .get("username")
                .and_then(|v| v.as_str())
                .unwrap_or("Unknown User")
                .to_string();
            let profile_image = decoded_data
                .get("profilePicture")
                .and_then(|v| v.as_str())
                .unwrap_or("https://cdn-icons-png.freepik.com/512/8792/8792047.png")
                .to_string();
            let creation_date = doc.created_at;

            valid_followers.push(IndexResponseBasicInfo {
                element_id: follower_id,
                title,
                profile_image,
                creation_date,
                element_type: "user".to_string(),
            });
        }
    }

    // Step 4: Sort the followers by most recent follow
    valid_followers.sort_by(|a, b| b.creation_date.cmp(&a.creation_date));

    // Step 5: Apply pagination
    let total_items = valid_followers.len();
    let paginated_followers = valid_followers
        .into_iter()
        .skip(offset)
        .take(limit)
        .collect::<Vec<_>>();
    let total_pages = (total_items + limit - 1) / limit; // Calculate total pages

    Ok((
        paginated_followers,
        total_items,
        total_pages,
        offset / limit + 1, // Current page
    ))
}

#[query]
pub fn get_user_basic_information(user_id: String) -> Result<UserBasicInfo, String> {
    use ic_cdk::api::caller;
    let caller = api::caller();

    // Initialize default UserBasicInfo

    let user_key = get_userid_by_id_or_username(user_id.clone());
    let mut user_info = UserBasicInfo {
        user_id: user_key.clone(),
        ..Default::default()
    };
    // Step 1: Fetch user document to get basic user details
    match get_doc_store(caller.clone(), "user".to_string(), user_key.clone()) {
        Ok(Some(doc)) => {
            if let Ok(data) = decode_doc_data::<serde_json::Value>(&doc.data) {
                user_info.username = data
                    .get("username")
                    .and_then(|v| v.as_str())
                    .unwrap_or(&user_key) // Fallback to user_id if no username
                    .to_string();
                user_info.profile_picture = data
                    .get("profilePicture")
                    .and_then(|v| v.as_str())
                    .unwrap_or("https://cdn-icons-png.freepik.com/512/8792/8792047.png")
                    .to_string();
                user_info.background_image = data
                    .get("images")
                    .and_then(|v| v.as_array())
                    .and_then(|arr| arr.get(0)) // Assuming the first image is background
                    .and_then(|v| v.as_str())
                    .unwrap_or("https://example.com/default-background.png")
                    .to_string();
                user_info.description = data
                    .get("description")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
            }
        }
        _ => {
            // If the user document fetch fails, log an error and continue with defaults
            return Err("User not found".to_string());
        }
    }

    // Step 2: Fetch followers count
    user_info.followers_count = match get_user_followers(user_key.clone()) {
        Ok(followers) => followers.len() as u64,
        Err(_) => 0, // Default to 0 if an error occurs
    };

    // Step 3: Fetch followings count
    user_info.followings_count =
        match get_user_following(user_key.clone(), Some("user".to_string())) {
            Ok(followings) => followings.len() as u64,
            Err(_) => 0, // Default to 0 if an error occurs
        };

    // Step 4: Fetch total pledged
    user_info.total_pledged = match get_historical_pledged_balance(user_key.clone()) {
        Ok(amount) => amount,
        Err(err) => return Err(err), // Default to 0 if an error occurs
    };

    // Step 5: Fetch active pledged
    user_info.active_pledged = match get_pledged_balance(user_key.clone()) {
        Ok(amount) => amount,
        Err(err) => return Err(err), // Default to 0 if an error occurs
    };

    // Step 6: Fetch user reputation
    user_info.reputation = match get_user_reputation(caller) {
        Ok(reputation) => reputation,
        Err(_) => 0, // Default to 0 if an error occurs
    };

    Ok(user_info)
}

#[query]
pub fn get_paginated_most_recent_activities(
    user_id: String,
    offset: Option<usize>,
    limit: Option<usize>,
) -> Result<(Vec<Activity>, usize, usize, usize), String> {
    let caller = api::caller();
    let offset = offset.unwrap_or(0);
    let limit = limit.unwrap_or(12);
    let username = get_user_username(user_id.clone());
    let profile_image = get_user_profile_pic(user_id.clone());
    let mut activities: Vec<Activity> = Vec::new();

    // Step 1: Fetch pledges by the user
    let pledges_filter = ListParams {
        matcher: Some(ListMatcher {
            description: Some(format!("pledger:{}", user_id)),
            ..Default::default()
        }),
        ..Default::default()
    };
    if let Ok(pledges_result) = list_docs_store(
        caller.clone(),
        "pledges_active".to_string(),
        &pledges_filter,
    ) {
        for (_key, doc) in pledges_result.items {
            if let Ok(data) = decode_doc_data::<serde_json::Value>(&doc.data) {
                let feature_id = data
                    .get("feature_id")
                    .and_then(|v| v.as_str())
                    .unwrap_or("");
                let pledged_amount = data.get("amount").and_then(|v| v.as_u64()).unwrap_or(0);

                // Fetch idea title for the pledge
                let activity_title = if let Ok(Some(feature_doc)) = get_doc_store(
                    caller.clone(),
                    "feature".to_string(),
                    feature_id.to_string(),
                ) {
                    let feature_data: serde_json::Value =
                        decode_doc_data(&feature_doc.data).unwrap_or_default();
                    feature_data
                        .get("title")
                        .and_then(|v| v.as_str())
                        .unwrap_or("Unknown Idea")
                        .to_string()
                } else {
                    "Unknown Idea".to_string()
                };
                let converted_amount = pledged_amount as f64 / 100_000_000.0;

                // Round to one decimal place
                let rounder_amount = (converted_amount * 1_000.0).round() / 1_000.0;
                activities.push(Activity {
                    creator_username: username.clone(),
                    creator_id: user_id.clone(),
                    profile_image: profile_image.clone(),
                    activity_image: None, // Pledges don’t have images
                    activity_title: activity_title.clone(),
                    created_at: doc.created_at,
                    description: format!(
                        "Just pledged {} ICP to the idea '{}'",
                        rounder_amount, activity_title
                    ),
                    element_id: feature_id.to_string(),
                    element_type: "pledge".to_string(),
                    link: format!("/idea/{}", feature_id),
                });
            }
        }
    }

    let owner = match Principal::from_text(user_id.clone()) {
        Ok(pr) => pr,
        Err(_) => return Err("User id is not a principal".to_string()),
    };
    // Step 2: Fetch topics (collection: "idea")
    let topics_filter = ListParams {
        owner: Some(owner.clone()),
        ..Default::default()
    };
    if let Ok(topics_result) = list_docs_store(caller.clone(), "idea".to_string(), &topics_filter) {
        for (key, doc) in topics_result.items {
            let data: serde_json::Value = decode_doc_data(&doc.data).unwrap_or_default();
            activities.push(Activity {
                creator_username: username.clone(),
                creator_id: user_id.clone(),
                profile_image: profile_image.clone(),
                activity_image: data
                    .get("images")
                    .and_then(|imgs| imgs.as_array())
                    .and_then(|arr| arr.get(0))
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string()),
                activity_title: data
                    .get("title")
                    .and_then(|v| v.as_str())
                    .unwrap_or("Untitled Topic")
                    .to_string(),
                created_at: doc.created_at,
                description: "Created a topic".to_string(),
                element_id: key.clone(),
                element_type: "topic".to_string(),
                link: format!("/topic/{}", key),
            });
        }
    }

    // Step 3: Fetch ideas (collection: "feature")
    let ideas_filter = ListParams {
        owner: Some(owner.clone()),
        ..Default::default()
    };
    if let Ok(ideas_result) = list_docs_store(caller.clone(), "feature".to_string(), &ideas_filter)
    {
        for (key, doc) in ideas_result.items {
            let data: serde_json::Value = decode_doc_data(&doc.data).unwrap_or_default();
            activities.push(Activity {
                creator_username: username.clone(),
                creator_id: user_id.clone(),
                profile_image: profile_image.clone(),
                activity_image: data
                    .get("images")
                    .and_then(|imgs| imgs.as_array())
                    .and_then(|arr| arr.get(0))
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string()),
                activity_title: data
                    .get("title")
                    .and_then(|v| v.as_str())
                    .unwrap_or("Untitled Idea")
                    .to_string(),
                created_at: doc.created_at,
                description: "Just had an idea...".to_string(),
                element_id: key.clone(),
                element_type: "idea".to_string(),
                link: format!("/idea/{}", key),
            });
        }
    }

    // Step 4: Fetch solutions (collection: "solution")
    let solutions_filter = ListParams {
        owner: Some(owner.clone()),
        ..Default::default()
    };
    if let Ok(solutions_result) =
        list_docs_store(caller.clone(), "solution".to_string(), &solutions_filter)
    {
        for (key, doc) in solutions_result.items {
            let data: serde_json::Value = decode_doc_data(&doc.data).unwrap_or_default();
            activities.push(Activity {
                creator_username: username.clone(),
                creator_id: user_id.clone(),
                profile_image: profile_image.clone(),
                activity_image: data
                    .get("images")
                    .and_then(|imgs| imgs.as_array())
                    .and_then(|arr| arr.get(0))
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string()),
                activity_title: data
                    .get("title")
                    .and_then(|v| v.as_str())
                    .unwrap_or("Untitled Solution")
                    .to_string(),
                created_at: doc.created_at,
                description: "Contributed a solution".to_string(),
                element_id: key.clone(),
                element_type: "solution".to_string(),
                link: format!("/solution/{}", key),
            });
        }
    }

    // Step 5: Sort all activities by `created_at` descending
    activities.sort_by(|a, b| b.created_at.cmp(&a.created_at));

    // Step 6: Pagination
    let total_items = activities.len();
    let paginated_activities = activities
        .into_iter()
        .skip(offset)
        .take(limit)
        .collect::<Vec<_>>();
    let total_pages = (total_items + limit - 1) / limit;

    Ok((
        paginated_activities,
        total_items,
        total_pages,
        offset / limit + 1, // Current page
    ))
}

pub fn get_userid_by_id_or_username(user_prop: String) -> String {
    let caller = api::caller();
    let collection = "user".to_string();

    // Step 1: Attempt to find the user document directly by key
    if let Ok(Some(doc)) = get_doc_store(caller.clone(), collection.clone(), user_prop.clone()) {
        return user_prop; // Direct match found, return the user ID
    }

    let description_regex = format!("(?i)username:{}", regex::escape(&user_prop));

    let filter = ListParams {
        matcher: Some(ListMatcher {
            description: Some(description_regex),
            ..Default::default()
        }),
        ..Default::default()
    };
    // Fetch documents from the "user" collection that match the description filter
    if let Ok(results) = list_docs_store(caller, collection, &filter) {
        for (key, _doc) in results.items {
            return key; // Return the key of the first matching document
        }
    }

    // Step 3: If no matches found, return the input `user_prop` as fallback
    user_prop
}
