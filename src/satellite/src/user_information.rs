use crate::types::interface::{PledgeData, User};
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
use std::{cell::RefCell, fmt::format};

//TODO: Take into account that these pledges are inactive even if the solution hasnt implemented the IDEA targeted in the pledge.
// ---> For example. A user targeted "idea a" on his pledge, but the developer only implemented "idea b".
//      In this case, that pledge is counted as inactive.
#[query]
pub fn get_user_active_pledges(user_id: String) -> Result<Vec<PledgeData>, String> {
    let caller = api::caller();
    let caller_text = Principal::to_text(&caller);
    if (caller_text != user_id) {
        return Err(format!("Permission denied!"));
    }

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
    if (caller_text != user_id) {
        return Err(format!("Permission denied!"));
    }
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
