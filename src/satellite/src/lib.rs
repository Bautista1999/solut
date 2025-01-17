use bytes::Bytes;
use candid::{CandidType, Int, Nat, Principal};

use ic_cdk_timers::{clear_timer, set_timer_interval, TimerId};
use junobuild_storage::http::types::HeaderField;
use junobuild_storage::types::store::AssetKey;
use mime::Mime;
mod quickqueries;
use serde_json::json;
use std::cell::RefCell;
use std::collections::HashMap;
use std::convert::TryFrom;
use std::iter::Filter;

use std::time::{Duration, SystemTime, UNIX_EPOCH};
use url::Url;
mod ApprovalFunctions;
mod Funding;
mod indexed_queries;
mod notifications;
mod pledges;
mod reputation;
mod scheduled;
mod types;
mod user_information;
use crate::types::interface::{UserBasicInfo, UserProfileBasicInfo};

use crate::types::interface::{
    Activity, EnrichedPledgeData, IndexResponse, IndexResponseBasicInfo, PledgeApproval,
};
use base64::encode; // make sure to add `base64` to dependencies in Cargo.toml
use ic_cdk::api::{self, set_global_timer, time};
use ic_cdk_macros::{query, update};
use junobuild_macros::{
    assert_delete_asset, assert_delete_doc, assert_set_doc, assert_upload_asset, on_delete_asset,
    on_delete_doc, on_delete_filtered_assets, on_delete_filtered_docs, on_delete_many_assets,
    on_delete_many_docs, on_set_doc, on_set_many_docs, on_upload_asset,
};
use junobuild_satellite::{
    count_docs_store, delete_asset_store, delete_assets_store, delete_doc_store, get_doc_store,
    list_docs_store, log, set_asset_handler, set_doc_store, DelDoc, Key,
    OnDeleteFilteredAssetsContext, OnDeleteFilteredDocsContext, SetDoc,
};
use junobuild_satellite::{
    include_satellite, AssertDeleteAssetContext, AssertDeleteDocContext, AssertSetDocContext,
    AssertUploadAssetContext, OnDeleteAssetContext, OnDeleteDocContext, OnDeleteManyAssetsContext,
    OnDeleteManyDocsContext, OnSetDocContext, OnSetManyDocsContext, OnUploadAssetContext,
};
use junobuild_shared::types::list::ListParams;
use junobuild_storage::well_known::update;
use junobuild_utils::{decode_doc_data, encode_doc_data};
use regex::Regex;
use scheduled::{delete_orphan_ideas, delete_orphan_solutions, delete_unused_images};
use types::interface::{
    Approval, ApprovalStatus, ClaimerInfo, Claimers, Discount, Idea, IdeaRevenueCounter,
    IndexSearch, Notification, PaymentType, PledgeData, PledgeUser, Product, Referral, SetIdea,
    Solution, Topic, TotalPledging,
};

#[on_delete_filtered_docs]
async fn on_delete_filtered_docs(_context: OnDeleteFilteredDocsContext) -> Result<(), String> {
    Ok(())
}

#[on_set_doc(collections = ["pledges_active"])]
async fn on_set_doc(_context: OnSetDocContext) -> Result<(), String> {
    log("The thing executed.".to_string());
    return Ok(());
}

fn create_pledge_validation_test() -> Result<(), String> {
    log("The thing executed.".to_string());
    return Err("We encountered an issue".to_string());
}

#[on_set_many_docs]
async fn on_set_many_docs(_context: OnSetManyDocsContext) -> Result<(), String> {
    Ok(())
}

#[on_delete_doc]
async fn on_delete_doc(_context: OnDeleteDocContext) -> Result<(), String> {
    Ok(())
}

#[on_delete_many_docs]
async fn on_delete_many_docs(_context: OnDeleteManyDocsContext) -> Result<(), String> {
    Ok(())
}

#[on_upload_asset]
async fn on_upload_asset(_context: OnUploadAssetContext) -> Result<(), String> {
    Ok(())
}

#[on_delete_asset]
async fn on_delete_asset(_context: OnDeleteAssetContext) -> Result<(), String> {
    Ok(())
}

#[on_delete_many_assets]
async fn on_delete_many_assets(_context: OnDeleteManyAssetsContext) -> Result<(), String> {
    Ok(())
}

#[assert_set_doc]
fn assert_set_doc(_context: AssertSetDocContext) -> Result<(), String> {
    Ok(())
}

#[assert_delete_doc]
fn assert_delete_doc(_context: AssertDeleteDocContext) -> Result<(), String> {
    Ok(())
}

#[assert_upload_asset]
fn assert_upload_asset(_context: AssertUploadAssetContext) -> Result<(), String> {
    Ok(())
}

#[assert_delete_asset]
fn assert_delete_asset(_context: AssertDeleteAssetContext) -> Result<(), String> {
    Ok(())
}

#[update]
async fn create_new_product(product: Product, key: String) -> Result<(), String> {
    let caller = api::caller();
    let versio_ver: u64 = 1;
    let data_vec = match encode_doc_data(&product) {
        Ok(data) => data,
        Err(err) => {
            return Err(format!("Failed to encode product data: {}", err));
        }
    };
    let value = SetDoc {
        data: data_vec,
        description: None,
        version: Some(versio_ver),
    };

    match set_doc_store(caller, "product".to_string(), key, value) {
        Ok(_) => {
            return Ok(());
        }
        Err(err) => {
            return Err(err);
        }
    }
}

#[update]
async fn eliminate_solution(key: String) -> Result<(), String> {
    let caller = api::caller();
    let controller = candid::Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();

    // Step 1: Fetch the main solution document and check ownership
    let solution_doc = match get_doc_store(caller, "solution".to_string(), key.clone()) {
        Ok(Some(doc)) => {
            if doc.owner != caller {
                return Err("Caller is not the owner of the solution.".to_string());
            }
            doc
        }
        Ok(None) => return Err("Solution not found.".to_string()),
        Err(err) => return Err(format!("Failed to retrieve solution: {}", err)),
    };

    let version = solution_doc.version; // Get the version of the solution document

    // Step 2: Prepare to validate the other documents, starting with their versions
    let index_key = format!("INDEX_{}", key.clone());
    let index_version = match get_document_version("index_search".to_string(), index_key.clone()) {
        Ok(version) => version,
        Err(err) => 1,
    };

    let foll_key = format!("FOLL_{}", key.clone());

    let sol_appr_key = format!("SOL_APPR_{}", key.clone());
    let sol_appr_version =
        match get_document_version("solution_approved".to_string(), sol_appr_key.clone()) {
            Ok(version) => version,
            Err(err) => {
                return Err(format!(
                    "Failed to get version for solution_approved document: {}",
                    err
                ))
            }
        };

    let sol_stat_key = format!("SOL_STAT_{}", key.clone());
    let sol_stat_version =
        match get_document_version("solution_status".to_string(), sol_stat_key.clone()) {
            Ok(version) => version,
            Err(err) => {
                return Err(format!(
                    "Failed to get version for solution_status document: {}",
                    err
                ))
            }
        };

    // Step 3: If all validations passed, proceed with deletion
    // Create the vector of documents to delete after all validations
    let mut docs_to_delete: Vec<(String, Key, DelDoc)> = Vec::new();

    // 1. Delete the main solution document
    docs_to_delete.push((
        "solution".to_string(),
        key.clone(),
        DelDoc {
            version: version.clone(),
        },
    ));

    // 2. Delete the index_search document
    docs_to_delete.push((
        "index_search".to_string(),
        index_key,
        DelDoc {
            version: Some(index_version),
        },
    ));

    // 3. Delete the followers document

    // 4. Delete the solution_approved document
    docs_to_delete.push((
        "solution_approved".to_string(),
        sol_appr_key,
        DelDoc {
            version: Some(sol_appr_version),
        },
    ));

    // 5. Delete the solution_status document
    docs_to_delete.push((
        "solution_status".to_string(),
        sol_stat_key,
        DelDoc {
            version: Some(sol_stat_version),
        },
    ));

    // Step 4: Delete all the documents using the controller as the caller
    for (collection, key, del_doc) in docs_to_delete {
        delete_doc_store(controller, collection, key, del_doc);
    }

    // Return success after all documents have been deleted
    return Ok(());
}

#[update]
pub fn eliminate_idea(key: String) -> Result<(), String> {
    let caller = api::caller();
    let controller = candid::Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();
    // Step 1: Fetch the main solution document and check ownership
    let idea_doc = match get_doc_store(caller, "feature".to_string(), key.clone()) {
        Ok(Some(doc)) => {
            if doc.owner != caller {
                return Err("Caller is not the owner of the idea.".to_string());
            }
            doc
        }
        Ok(None) => return Err("idea not found.".to_string()),
        Err(err) => return Err(format!("Failed to retrieve idea: {}", err)),
    };

    let version = idea_doc.version; // Get the version of the solution document

    // Step 2: Prepare to validate the other documents, starting with their versions
    let index_key = format!("INDEX_{}", key.clone());
    let index_version = match get_document_version("index_search".to_string(), index_key.clone()) {
        Ok(version) => version,
        Err(err) => 1,
    };

    let foll_key = format!("FOLL_{}", key.clone());

    let feature_pledge_document = format!("PLG_FEA_{}", key.clone());
    let pledge_version = match get_document_version(
        "idea_feature_pledge".to_string(),
        feature_pledge_document.clone(),
    ) {
        Ok(version) => version,
        Err(err) => {
            return Err(format!(
                "Failed to get version for the document that holds the total pledged: {}",
                err
            ))
        }
    };

    let revenue_document = format!("REV_FEA_{}", key.clone());
    let revenue_version =
        match get_document_version("idea_revenue_counter".to_string(), revenue_document.clone()) {
            Ok(version) => version,
            Err(err) => {
                return Err(format!(
                    "Failed to get version for the document that holds the total revenue: {}",
                    err
                ))
            }
        };

    // Step 3: If all validations passed, proceed with deletion
    // Create the vector of documents to delete after all validations
    let mut docs_to_delete: Vec<(String, Key, DelDoc)> = Vec::new();

    // 1. Delete the main solution document
    docs_to_delete.push((
        "feature".to_string(),
        key.clone(),
        DelDoc {
            version: version.clone(),
        },
    ));

    // 2. Delete the index_search document
    docs_to_delete.push((
        "index_search".to_string(),
        index_key,
        DelDoc {
            version: Some(index_version),
        },
    ));

    // 3. Delete the followers document

    // 4. Delete the amount funded document
    docs_to_delete.push((
        "idea_feature_pledge".to_string(),
        feature_pledge_document,
        DelDoc {
            version: Some(pledge_version),
        },
    ));

    // 5. Delete the revenue document
    docs_to_delete.push((
        "idea_revenue_counter".to_string(),
        revenue_document,
        DelDoc {
            version: Some(revenue_version),
        },
    ));

    // Step 4: Delete all the documents using the controller as the caller
    for (collection, key, del_doc) in docs_to_delete {
        delete_doc_store(controller, collection, key, del_doc);
    }

    // Return success after all documents have been deleted
    return Ok(());
}

fn extract_idea_id(description: &str) -> Option<String> {
    // Define a regex pattern to capture `idea_id:<value>`
    let re = Regex::new(r"idea_id:(\w+)").unwrap();

    // Try to find a match in the description
    if let Some(captures) = re.captures(description) {
        // Return the first capture group (the value after `idea_id:`)
        captures.get(1).map(|id| id.as_str().to_string())
    } else {
        None
    }
}

fn get_document_version(collection: String, key: String) -> Result<u64, String> {
    let caller = api::caller();
    let controller = candid::Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();

    match get_doc_store(controller, collection.clone(), key.clone()) {
        Ok(Some(doc)) => match doc.version {
            Some(version) => {
                return Ok(version);
            }
            None => {
                return Ok(1);
            }
        },
        Ok(None) => {
            return Err(format!(
                "Failed to retrieve document with id {} and collection {}",
                key, collection
            ))
        }
        Err(err) => return Err(format!("Failed to retrieve document's version: {}", err)),
    }
}

pub fn get_document_version_or_default(collection: String, key: String) -> Result<u64, String> {
    let caller = api::caller();
    let controller = candid::Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();

    match get_doc_store(controller, collection.clone(), key.clone()) {
        Ok(Some(doc)) => match doc.version {
            Some(version) => {
                return Ok(version);
            }
            None => {
                return Ok(1);
            }
        },
        Ok(None) => {
            return Ok(1);
        }
        Err(err) => return Err(format!("Failed get document's version: {}", err)),
    }
}

/// Fetches the document's description or returns an empty string if not found or an error occurs.
///
/// # Parameters:
/// - `collection`: The collection to search for the document.
/// - `key`: The key of the document.
///
/// # Returns:
/// - `String`: The document's description, or an empty string if not found or an error occurs.
pub fn get_document_description_or_default(collection: String, key: String) -> String {
    let caller = api::caller();
    let controller = Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();

    match get_doc_store(controller, collection, key) {
        Ok(Some(doc)) => doc.description.unwrap_or_default(),
        Ok(None) | Err(_) => "".to_string(),
    }
}

#[update]
fn cancel_pledge(id: String) -> Result<(), String> {
    let caller = api::caller();
    let caller_text = caller.to_text();
    let controller = candid::Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();

    // Step 2: Fetch the pledges_active document for the given id
    match get_doc_store(caller, "pledges_active".to_string(), id.clone()) {
        Ok(None) => return Err("Pledge not found.".to_string()),
        Err(err) => return Err(format!("Error retrieving pledge: {}", err)),
        Ok(Some(doc)) => {
            // Verify caller is in description
            if let Some(description) = &doc.description {
                if !description.contains(&caller_text) {
                    return Err("Caller is not mentioned in the pledge description.".to_string());
                }
            } else {
                return Err("Pledge description not found.".to_string());
            }

            // Decode current pledge data and update status
            let mut pledge_data: PledgeData = {
                let json: serde_json::Value =
                    decode_doc_data(&doc.data).unwrap_or(serde_json::json!({}));

                let mut pledge_data = PledgeData {
                    amount: json.get("amount").and_then(|v| v.as_u64()).unwrap_or(0),
                    doc_key: id.clone(),
                    expected_amount: json
                        .get("expected_amount")
                        .and_then(|v| v.as_u64())
                        .unwrap_or(0),
                    feature_id: json
                        .get("feature_id")
                        .and_then(|v| v.as_str())
                        .map(String::from),
                    idea_id: json
                        .get("idea_id")
                        .and_then(|v| v.as_str())
                        .unwrap_or("")
                        .to_string(),
                    target: json
                        .get("target")
                        .and_then(|v| v.as_str())
                        .unwrap_or("")
                        .to_string(),
                    user: json
                        .get("user")
                        .and_then(|v| v.as_str())
                        .unwrap_or("")
                        .to_string(),
                    status: "inactive".to_string(), // Change status to inactive
                    amount_paid: json
                        .get("amount_paid")
                        .and_then(|v| v.as_u64())
                        .unwrap_or(0),
                    payment_type: json
                        .get("payment_type")
                        .and_then(|v| v.as_str())
                        .unwrap_or("Crypto")
                        .to_string(),
                };
                pledge_data
            };
            let idea_id = pledge_data.idea_id.clone();
            let feature_id = pledge_data.feature_id.clone();
            let pledged_amount = pledge_data.amount.clone();
            let expected_amount = pledge_data.expected_amount.clone();

            // Update the pledge document with new status
            let updated_data = match encode_doc_data(&pledge_data.clone()) {
                Ok(data) => data,
                Err(err) => return Err(format!("Failed to encode updated pledge data: {}", err)),
            };

            // Step 4: Update the `pledges_solution` document for this idea
            let sol_doc_key = format!("SOL_PL_{}", idea_id); // solution pledge document
            match get_doc_store(
                controller,
                "pledges_solution".to_string(),
                sol_doc_key.clone(),
            ) {
                Ok(Some(mut sol_doc)) => {
                    // Decode the solution pledge data
                    let mut pledge_list: Vec<PledgeUser> = match decode_doc_data(&sol_doc.data) {
                        Ok(list) => list,
                        Err(err) => {
                            return Err(format!("Failed to decode solution pledge data: {}", err))
                        }
                    };

                    // Find the user's pledge and subtract the pledged and expected amounts
                    for (i, user_pledge) in pledge_list.iter_mut().enumerate() {
                        if user_pledge.user == caller_text {
                            // Ensure the amount doesn't go below zero
                            if user_pledge.amount_pledged >= pledged_amount {
                                user_pledge.amount_pledged -= pledged_amount;
                            } else {
                                user_pledge.amount_pledged = 0;
                            }

                            if user_pledge.amount_paid >= expected_amount {
                                user_pledge.amount_paid -= expected_amount;
                            } else {
                                user_pledge.amount_paid = 0;
                            }

                            // If the user's total pledge is now zero, remove them from the list
                            if user_pledge.amount_pledged == 0 {
                                pledge_list.remove(i);
                            }
                            break;
                        }
                    }

                    // Encode the updated pledges list back into the solution document
                    sol_doc.data = match encode_doc_data(&pledge_list) {
                        Ok(encoded) => encoded,
                        Err(err) => {
                            return Err(format!("Failed to encode updated pledges: {}", err))
                        }
                    };

                    // Use `set_doc_store` to update the `pledges_solution` document using the controller
                    set_doc_store(
                        controller,
                        "pledges_solution".to_string(),
                        sol_doc_key.clone(),
                        SetDoc {
                            data: sol_doc.data,
                            description: sol_doc.description.clone(),
                            version: sol_doc.version.clone(),
                        },
                    )?;
                }
                Ok(None) => {
                    // Continue even if solution pledge document is not found
                    ic_cdk::print(format!(
                        "Solution pledge document not found, continuing with deletion."
                    ));
                }
                Err(err) => {
                    return Err(format!("Error fetching solution pledge document: {}", err))
                }
            }

            // Step 5: Update the `idea_feature_pledge` document for the idea
            let idea_pledge_doc_key = format!("PLG_IDEA_{}", idea_id);
            match get_doc_store(
                controller,
                "idea_feature_pledge".to_string(),
                idea_pledge_doc_key.clone(),
            ) {
                Ok(Some(mut idea_doc)) => {
                    // Decode the idea pledge data
                    let mut total_idea_pledge: TotalPledging = match decode_doc_data(&idea_doc.data)
                    {
                        Ok(data) => data,
                        Err(err) => {
                            return Err(format!("Failed to decode idea pledge data: {}", err))
                        }
                    };

                    // Ensure subtraction doesn't go below zero
                    if total_idea_pledge.pledges >= pledged_amount {
                        total_idea_pledge.pledges -= pledged_amount;
                    } else {
                        total_idea_pledge.pledges = 0;
                    }

                    if total_idea_pledge.expected >= expected_amount {
                        total_idea_pledge.expected -= expected_amount;
                    } else {
                        total_idea_pledge.expected = 0;
                    }

                    // Encode the updated totals back into the document
                    idea_doc.data = match encode_doc_data(&total_idea_pledge) {
                        Ok(encoded) => encoded,
                        Err(err) => {
                            return Err(format!(
                                "Failed to encode updated idea pledge data: {}",
                                err
                            ))
                        }
                    };

                    // Use `set_doc_store` to update the `idea_feature_pledge` document for the idea using the controller
                    set_doc_store(
                        controller,
                        "idea_feature_pledge".to_string(),
                        idea_pledge_doc_key,
                        SetDoc {
                            data: idea_doc.data,
                            description: idea_doc.description.clone(),
                            version: idea_doc.version.clone(),
                        },
                    )?;
                }
                Ok(None) => {
                    // Continue even if idea pledge document is not found
                    ic_cdk::print(format!(
                        "Idea pledge document not found, continuing with deletion."
                    ));
                }
                Err(err) => return Err(format!("Error fetching idea pledge document: {}", err)),
            }

            // Step 6: Update the `idea_feature_pledge` document for the feature if it exists (PLG_FEA_ + feature_id)
            if let Some(feature_id) = feature_id {
                let feature_pledge_doc_key = format!("PLG_FEA_{}", feature_id);
                match get_doc_store(
                    controller,
                    "idea_feature_pledge".to_string(),
                    feature_pledge_doc_key.clone(),
                ) {
                    Ok(Some(mut feature_doc)) => {
                        let mut total_feature_pledge: TotalPledging =
                            match decode_doc_data(&feature_doc.data) {
                                Ok(data) => data,
                                Err(err) => {
                                    return Err(format!(
                                        "Failed to decode feature pledge data: {}",
                                        err
                                    ))
                                }
                            };

                        // Ensure subtraction doesn't go below zero
                        if total_feature_pledge.pledges >= pledged_amount {
                            total_feature_pledge.pledges -= pledged_amount;
                        } else {
                            total_feature_pledge.pledges = 0;
                        }

                        if total_feature_pledge.expected >= expected_amount {
                            total_feature_pledge.expected -= expected_amount;
                        } else {
                            total_feature_pledge.expected = 0;
                        }

                        // Encode the updated feature pledge data back into the document
                        feature_doc.data = match encode_doc_data(&total_feature_pledge) {
                            Ok(encoded) => encoded,
                            Err(err) => {
                                return Err(format!(
                                    "Failed to encode updated feature pledge data: {}",
                                    err
                                ))
                            }
                        };

                        // Use `set_doc_store` to update the `idea_feature_pledge` document for the feature using the controller
                        set_doc_store(
                            controller,
                            "idea_feature_pledge".to_string(),
                            feature_pledge_doc_key,
                            SetDoc {
                                data: feature_doc.data,
                                description: feature_doc.description.clone(),
                                version: feature_doc.version.clone(),
                            },
                        )?;
                    }
                    Ok(None) => (), // It's fine if the feature pledge doc is not found (some pledges don’t have features)
                    Err(err) => {
                        return Err(format!("Error fetching feature pledge document: {}", err))
                    }
                }
            }

            // Update the pledge document instead of deleting it
            set_doc_store(
                controller,
                "pledges_active".to_string(),
                id.clone(),
                SetDoc {
                    data: updated_data,
                    description: doc.description.clone(),
                    version: Some(get_document_version_or_default(
                        "pledges_active".to_string(),
                        id.clone(),
                    )?),
                },
            )?;

            Ok(())
        }
    }
}

#[update]
fn delete_pledge(id: String) -> Result<(), String> {
    // Step 1: Get the caller and transform it into text
    let caller = api::caller();
    let caller_text = caller.to_text();
    // Prepare the controller for database operations
    let controller = candid::Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();

    // Step 2: Fetch the pledges_active document for the given id
    match get_doc_store(caller, "pledges_active".to_string(), id.clone()) {
        Ok(None) => {
            // Document was not found in the pledges_active collection.
            return Err("Pledge not found.".to_string());
        }
        Err(err) => {
            // An error occurred while retrieving the document.
            return Err(format!("Error retrieving pledge: {}", err));
        }
        Ok(Some(doc)) => {
            // Instead of checking the owner, verify that the caller is in the description
            if let Some(description) = &doc.description {
                if !description.contains(&caller_text) {
                    return Err("Caller is not mentioned in the pledge description.".to_string());
                }
            } else {
                return Err("Pledge description not found.".to_string());
            }

            // Step 3: Decode the data field to extract the idea_id, feature_id, pledged_amount, and expected_amount
            let pledge_data: PledgeData = {
                let json: serde_json::Value =
                    decode_doc_data(&doc.data).unwrap_or(serde_json::json!({}));

                PledgeData {
                    amount: json.get("amount").and_then(|v| v.as_u64()).unwrap_or(0),
                    doc_key: id.clone(),
                    expected_amount: json
                        .get("expected_amount")
                        .and_then(|v| v.as_u64())
                        .unwrap_or(0),
                    feature_id: json
                        .get("feature_id")
                        .and_then(|v| v.as_str())
                        .map(String::from),
                    idea_id: json
                        .get("idea_id")
                        .and_then(|v| v.as_str())
                        .unwrap_or("")
                        .to_string(),
                    target: json
                        .get("target")
                        .and_then(|v| v.as_str())
                        .unwrap_or("")
                        .to_string(),
                    user: json
                        .get("user")
                        .and_then(|v| v.as_str())
                        .unwrap_or("")
                        .to_string(),
                    status: json
                        .get("status")
                        .and_then(|v| v.as_str())
                        .unwrap_or("active")
                        .to_string(),
                    amount_paid: json
                        .get("amount_paid")
                        .and_then(|v| v.as_u64())
                        .unwrap_or(0),
                    payment_type: json
                        .get("payment_type")
                        .and_then(|v| v.as_str())
                        .unwrap_or("Crypto")
                        .to_string(),
                }
            };
            let idea_id = pledge_data.idea_id;
            let feature_id = pledge_data.feature_id;
            let pledged_amount = pledge_data.amount;
            let expected_amount = pledge_data.expected_amount;

            // Create the DelDoc struct for the version
            let version: Option<u64> = doc.version;

            // Step 4: Update the `pledges_solution` document for this idea
            let sol_doc_key = format!("SOL_PL_{}", idea_id); // solution pledge document
            match get_doc_store(
                controller,
                "pledges_solution".to_string(),
                sol_doc_key.clone(),
            ) {
                Ok(Some(mut sol_doc)) => {
                    // Decode the solution pledge data
                    let mut pledge_list: Vec<PledgeUser> = match decode_doc_data(&sol_doc.data) {
                        Ok(list) => list,
                        Err(err) => {
                            return Err(format!("Failed to decode solution pledge data: {}", err))
                        }
                    };

                    // Find the user's pledge and subtract the pledged and expected amounts
                    for (i, user_pledge) in pledge_list.iter_mut().enumerate() {
                        if user_pledge.user == caller_text {
                            // Ensure the amount doesn't go below zero
                            if user_pledge.amount_pledged >= pledged_amount {
                                user_pledge.amount_pledged -= pledged_amount;
                            } else {
                                user_pledge.amount_pledged = 0;
                            }

                            if user_pledge.amount_paid >= expected_amount {
                                user_pledge.amount_paid -= expected_amount;
                            } else {
                                user_pledge.amount_paid = 0;
                            }

                            // If the user's total pledge is now zero, remove them from the list
                            if user_pledge.amount_pledged == 0 {
                                pledge_list.remove(i);
                            }
                            break;
                        }
                    }

                    // Encode the updated pledges list back into the solution document
                    sol_doc.data = match encode_doc_data(&pledge_list) {
                        Ok(encoded) => encoded,
                        Err(err) => {
                            return Err(format!("Failed to encode updated pledges: {}", err))
                        }
                    };

                    // Use `set_doc_store` to update the `pledges_solution` document using the controller
                    set_doc_store(
                        controller,
                        "pledges_solution".to_string(),
                        sol_doc_key.clone(),
                        SetDoc {
                            data: sol_doc.data,
                            description: sol_doc.description.clone(),
                            version: sol_doc.version.clone(),
                        },
                    )?;
                }
                Ok(None) => {
                    // Continue even if solution pledge document is not found
                    ic_cdk::print(format!(
                        "Solution pledge document not found, continuing with deletion."
                    ));
                }
                Err(err) => {
                    return Err(format!("Error fetching solution pledge document: {}", err))
                }
            }

            // Step 5: Update the `idea_feature_pledge` document for the idea
            let idea_pledge_doc_key = format!("PLG_IDEA_{}", idea_id);
            match get_doc_store(
                controller,
                "idea_feature_pledge".to_string(),
                idea_pledge_doc_key.clone(),
            ) {
                Ok(Some(mut idea_doc)) => {
                    // Decode the idea pledge data
                    let mut total_idea_pledge: TotalPledging = match decode_doc_data(&idea_doc.data)
                    {
                        Ok(data) => data,
                        Err(err) => {
                            return Err(format!("Failed to decode idea pledge data: {}", err))
                        }
                    };

                    // Ensure subtraction doesn't go below zero
                    if total_idea_pledge.pledges >= pledged_amount {
                        total_idea_pledge.pledges -= pledged_amount;
                    } else {
                        total_idea_pledge.pledges = 0;
                    }

                    if total_idea_pledge.expected >= expected_amount {
                        total_idea_pledge.expected -= expected_amount;
                    } else {
                        total_idea_pledge.expected = 0;
                    }

                    // Encode the updated totals back into the document
                    idea_doc.data = match encode_doc_data(&total_idea_pledge) {
                        Ok(encoded) => encoded,
                        Err(err) => {
                            return Err(format!(
                                "Failed to encode updated idea pledge data: {}",
                                err
                            ))
                        }
                    };

                    // Use `set_doc_store` to update the `idea_feature_pledge` document for the idea using the controller
                    set_doc_store(
                        controller,
                        "idea_feature_pledge".to_string(),
                        idea_pledge_doc_key,
                        SetDoc {
                            data: idea_doc.data,
                            description: idea_doc.description.clone(),
                            version: idea_doc.version.clone(),
                        },
                    )?;
                }
                Ok(None) => {
                    // Continue even if idea pledge document is not found
                    ic_cdk::print(format!(
                        "Idea pledge document not found, continuing with deletion."
                    ));
                }
                Err(err) => return Err(format!("Error fetching idea pledge document: {}", err)),
            }

            // Step 6: Update the `idea_feature_pledge` document for the feature if it exists (PLG_FEA_ + feature_id)
            if let Some(feature_id) = feature_id {
                let feature_pledge_doc_key = format!("PLG_FEA_{}", feature_id);
                match get_doc_store(
                    controller,
                    "idea_feature_pledge".to_string(),
                    feature_pledge_doc_key.clone(),
                ) {
                    Ok(Some(mut feature_doc)) => {
                        let mut total_feature_pledge: TotalPledging =
                            match decode_doc_data(&feature_doc.data) {
                                Ok(data) => data,
                                Err(err) => {
                                    return Err(format!(
                                        "Failed to decode feature pledge data: {}",
                                        err
                                    ))
                                }
                            };

                        // Ensure subtraction doesn't go below zero
                        if total_feature_pledge.pledges >= pledged_amount {
                            total_feature_pledge.pledges -= pledged_amount;
                        } else {
                            total_feature_pledge.pledges = 0;
                        }

                        if total_feature_pledge.expected >= expected_amount {
                            total_feature_pledge.expected -= expected_amount;
                        } else {
                            total_feature_pledge.expected = 0;
                        }

                        // Encode the updated feature pledge data back into the document
                        feature_doc.data = match encode_doc_data(&total_feature_pledge) {
                            Ok(encoded) => encoded,
                            Err(err) => {
                                return Err(format!(
                                    "Failed to encode updated feature pledge data: {}",
                                    err
                                ))
                            }
                        };

                        // Use `set_doc_store` to update the `idea_feature_pledge` document for the feature using the controller
                        set_doc_store(
                            controller,
                            "idea_feature_pledge".to_string(),
                            feature_pledge_doc_key,
                            SetDoc {
                                data: feature_doc.data,
                                description: feature_doc.description.clone(),
                                version: feature_doc.version.clone(),
                            },
                        )?;
                    }
                    Ok(None) => (), // It's fine if the feature pledge doc is not found (some pledges don’t have features)
                    Err(err) => {
                        return Err(format!("Error fetching feature pledge document: {}", err))
                    }
                }
            }

            // Step 7: Delete the `pledges_active` document using the controller
            let mut docs_to_delete: Vec<(String, Key, DelDoc)> = Vec::new();
            docs_to_delete.push((
                "pledges_active".to_string(),
                id.clone(),
                DelDoc {
                    version: version.clone(),
                },
            ));

            match delete_doc_store(
                controller,
                "pledges_active".to_string(), // Collection key
                id.clone(),                   // Document key
                DelDoc {
                    version: version.clone(),
                },
            ) {
                Ok(doc_context) => {
                    // Successfully deleted the document
                    ic_cdk::print(format!("Successfully deleted pledge!"));
                }
                Err(e) => {
                    // Log the error if deletion failed
                    ic_cdk::print(format!("Error deleting pledge: {}", e));
                    return Err(format!("Error deleting pledge: {}", e));
                }
            };

            return Ok(());
        }
    }

    return Ok(());
}

#[update]
fn eliminate_topic(key: String) -> Result<(), String> {
    let caller = api::caller();
    let controller = candid::Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();

    // Step 1: Fetch the main solution document and check ownership
    let idea_doc = match get_doc_store(caller, "idea".to_string(), key.clone()) {
        Ok(Some(doc)) => {
            if doc.owner != caller {
                return Err("Caller is not the owner of the topic.".to_string());
            }
            doc
        }
        Ok(None) => return Err("idea not found.".to_string()),
        Err(err) => return Err(format!("Failed to retrieve topic: {}", err)),
    };

    let version = idea_doc.version; // Get the version of the solution document

    // Step 2: Prepare to validate the other documents, starting with their versions
    let index_key = format!("INDEX_{}", key.clone());
    let index_version = match get_document_version("index_search".to_string(), index_key.clone()) {
        Ok(version) => version,
        Err(err) => 1,
    };

    let foll_key = format!("FOLL_{}", key.clone());

    let idea_pledge_document = format!("PLG_IDEA_{}", key.clone());
    let pledge_version = match get_document_version(
        "idea_feature_pledge".to_string(),
        idea_pledge_document.clone(),
    ) {
        Ok(version) => version,
        Err(err) => 1,
    };

    let revenue_document = format!("REV_IDEA_{}", key.clone());
    let revenue_version =
        match get_document_version("idea_revenue_counter".to_string(), revenue_document.clone()) {
            Ok(version) => version,
            Err(err) => 1,
        };

    let sol_pl_key = format!("SOL_PL_{}", key.clone());
    let sol_pl_version =
        match get_document_version("pledges_solution".to_string(), sol_pl_key.clone()) {
            Ok(version) => version,
            Err(err) => {
                // return Err(format!(
                //     "Failed to get version for pledges_solution document: {}",
                //     err
                // ))
                1
            }
        };

    // Step 3: If all validations passed, proceed with deletion
    // Create the vector of documents to delete after all validations
    let mut docs_to_delete: Vec<(String, Key, DelDoc)> = Vec::new();

    // 1. Delete the main solution document
    docs_to_delete.push((
        "idea".to_string(),
        key.clone(),
        DelDoc {
            version: version.clone(),
        },
    ));

    // 2. Delete the index_search document
    docs_to_delete.push((
        "index_search".to_string(),
        index_key,
        DelDoc {
            version: Some(index_version),
        },
    ));

    // 3. Delete the followers document

    // 4. Delete the amount funded document
    docs_to_delete.push((
        "idea_feature_pledge".to_string(),
        idea_pledge_document,
        DelDoc {
            version: Some(pledge_version),
        },
    ));

    // 5. Delete the revenue document
    docs_to_delete.push((
        "idea_revenue_counter".to_string(),
        revenue_document,
        DelDoc {
            version: Some(revenue_version),
        },
    ));

    // 6. Delete the revenue document
    docs_to_delete.push((
        "pledges_solution".to_string(),
        sol_pl_key,
        DelDoc {
            version: Some(sol_pl_version),
        },
    ));

    // Step 4: Delete all the documents using the controller as the caller
    for (collection, key, del_doc) in docs_to_delete {
        delete_doc_store(controller, collection, key, del_doc);
    }

    // Return success after all documents have been deleted
    return Ok(());
}

#[update]
fn create_or_update_topic(key: String, topic: Topic) -> Result<(), String> {
    let caller = api::caller();
    let controller = candid::Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();

    // Step 1: Basic field validation
    match validate_basic_fields(
        &topic.title,
        &topic.subtitle,
        &topic.description,
        &topic.images,
    ) {
        Ok(_) => {
            //do nothing
        }
        Err(error) => return Err(format!("Validation failed: {}", error)),
    }

    // Step 2: Check if the topic document already exists in the database
    let is_update = match get_doc_store(caller, "idea".to_string(), key.clone()) {
        Ok(Some(doc)) => {
            if (doc.owner != caller) {
                return Err(format!("Caller is not the owner of the document!"));
            };
            true
        } // Existing topic, proceed with update
        Ok(None) => false, // New topic, proceed with creation
        Err(err) => return Err(format!("Failed to retrieve topic: {}", err)),
    };

    // Step 3: Generate document data and descriptions for each collection
    let idea_data =
        encode_doc_data(&topic).map_err(|e| format!("Failed to encode topic data: {}", e))?;
    let idea_description = None; // Empty description for the idea document

    let joined_categories = topic.categories.join(", ");
    let index_search_data = encode_doc_data(&IndexSearch {
        title: topic.title.clone(),
        subtitle: topic.subtitle.clone(),
        images: topic.images.clone(),
        videos: topic.videos.clone(),
        element_id: key.clone(),
        element_type: "topic".to_string(),
    })
    .map_err(|e| format!("Failed to encode index_search data: {}", e))?;
    let index_search_description = Some(format!(
        "title:{} subtitle:{} type:topic idea_id:{} categories:{}",
        topic.title, topic.subtitle, key, joined_categories
    ));

    let total_pledging_data = encode_doc_data(&TotalPledging {
        pledges: 0,
        expected: 0,
    })
    .map_err(|e| format!("Failed to encode pledging data: {}", e))?;
    let total_pledging_description = Some(topic.title.clone());

    let idea_revenue_data = encode_doc_data(&IdeaRevenueCounter { total_revenue: 0 })
        .map_err(|e| format!("Failed to encode revenue data: {}", e))?;
    let idea_revenue_description = Some("0".to_string());

    let followers_data =
        encode_doc_data(&0u32).map_err(|e| format!("Failed to encode followers data: {}", e))?;
    let followers_description = Some("0".to_string());

    // Encode an empty array for pledges_solution
    let pledges_solution_data = encode_doc_data::<Vec<PledgeUser>>(&vec![])
        .map_err(|e| format!("Failed to encode pledges_solution data: {}", e))?;
    let pledges_solution_description = Some("SOL_ID:".to_string());

    // Step 4: Retrieve versions for each document (for updates), or default to 1 for new documents
    let idea_version = Some(get_document_version_or_default(
        "idea".to_string(),
        key.clone(),
    )?);
    let index_search_version = Some(get_document_version_or_default(
        "index_search".to_string(),
        format!("INDEX_{}", key),
    )?);
    let total_pledging_version = Some(get_document_version_or_default(
        "idea_feature_pledge".to_string(),
        format!("PLG_IDEA_{}", key),
    )?);
    let idea_revenue_version = Some(get_document_version_or_default(
        "idea_revenue_counter".to_string(),
        format!("REV_IDEA_{}", key),
    )?);

    let pledges_solution_version = Some(get_document_version_or_default(
        "pledges_solution".to_string(),
        format!("SOL_PL_{}", key),
    )?);

    // Step 5: Perform validation only (skip doc creation if errors exist)
    if !is_update {
        // Create additional docs only if this is a new topic creation, not an update
        let docs_to_create_admin = vec![
            (
                "idea_feature_pledge".to_string(),
                format!("PLG_IDEA_{}", key),
                SetDoc {
                    data: total_pledging_data.clone(),
                    description: total_pledging_description.clone(),
                    version: total_pledging_version,
                },
            ),
            (
                "idea_revenue_counter".to_string(),
                format!("REV_IDEA_{}", key),
                SetDoc {
                    data: idea_revenue_data.clone(),
                    description: idea_revenue_description.clone(),
                    version: idea_revenue_version,
                },
            ),
            (
                "pledges_solution".to_string(),
                format!("SOL_PL_{}", key),
                SetDoc {
                    data: pledges_solution_data.clone(),
                    description: pledges_solution_description.clone(),
                    version: pledges_solution_version,
                },
            ),
        ];

        for (collection, key, set_doc) in docs_to_create_admin {
            set_doc_store(controller, collection, key, set_doc)?;
        }
    }

    // Step 6: Insert or update the user-owned documents
    let docs_to_create_user = vec![
        (
            "idea".to_string(),
            key.clone(),
            SetDoc {
                data: idea_data,
                description: idea_description.clone(),
                version: idea_version,
            },
        ),
        (
            "index_search".to_string(),
            format!("INDEX_{}", key),
            SetDoc {
                data: index_search_data,
                description: index_search_description.clone(),
                version: index_search_version,
            },
        ),
    ];

    for (collection, key, set_doc) in docs_to_create_user {
        set_doc_store(caller, collection, key, set_doc)?;
    }

    Ok(())
}

#[update]
fn create_or_update_idea(key: String, idea: Idea, parent_idea_id: String) -> Result<(), String> {
    let caller = api::caller();
    let controller = candid::Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();

    // Step 1: Basic field validation
    match validate_basic_fields(&idea.title, &idea.subtitle, &idea.description, &idea.images) {
        Ok(_) => {
            //do nothing
        }
        Err(error) => return Err(format!("Validation failed: {}", error)),
    }
    // Step 2: Check if the idea document already exists in the database
    let is_update = match get_doc_store(caller, "feature".to_string(), key.clone()) {
        Ok(Some(doc)) => {
            if (doc.owner != caller) {
                return Err(format!("Caller is not the owner of the document!"));
            };
            true
        }
        Ok(None) => false, // New idea, proceed with creation
        Err(err) => return Err(format!("Failed to retrieve idea: {}", err)),
    };

    // Step 3: Generate document data and descriptions for each collection
    let idea_data =
        encode_doc_data(&idea).map_err(|e| format!("Failed to encode idea data: {}", e))?;
    let idea_description = Some(format!("idea_id:{}", parent_idea_id));

    // Join categories for the index_search description
    let joined_categories = idea.categories.join(", ");
    let index_search_data = encode_doc_data(&IndexSearch {
        title: idea.title.clone(),
        subtitle: idea.subtitle.clone(),
        images: idea.images.clone(),
        videos: idea.videos.clone(),
        element_id: key.clone(),
        element_type: "idea".to_string(),
    })
    .map_err(|e| format!("Failed to encode index_search data: {}", e))?;
    let index_search_description = Some(format!(
        "title:{} subtitle:{} type:idea idea_id:{} categories:{}",
        idea.title, idea.subtitle, parent_idea_id, joined_categories
    ));

    // Only create additional documents if this is a new idea
    let total_pledging_data = encode_doc_data(&TotalPledging {
        pledges: 0,
        expected: 0,
    })
    .map_err(|e| format!("Failed to encode pledging data: {}", e))?;
    let total_pledging_description = Some(idea.title.clone());

    let idea_revenue_data = encode_doc_data(&IdeaRevenueCounter { total_revenue: 0 })
        .map_err(|e| format!("Failed to encode revenue data: {}", e))?;
    let idea_revenue_description = Some("0".to_string());

    let followers_data =
        encode_doc_data(&0u32).map_err(|e| format!("Failed to encode followers data: {}", e))?;
    let followers_description = Some("0".to_string());

    // Step 4: Retrieve versions for each document (for updates), or default to 1 for new documents
    let idea_version = Some(get_document_version_or_default(
        "feature".to_string(),
        key.clone(),
    )?);
    let index_search_version = Some(get_document_version_or_default(
        "index_search".to_string(),
        format!("INDEX_{}", key),
    )?);
    let total_pledging_version = Some(get_document_version_or_default(
        "idea_feature_pledge".to_string(),
        format!("PLG_FEA_{}", key),
    )?);
    let idea_revenue_version = Some(get_document_version_or_default(
        "idea_revenue_counter".to_string(),
        format!("REV_FEA_{}", key),
    )?);

    // Step 5: Perform validation only (skip doc creation if errors exist)
    if !is_update {
        // Create additional docs only if this is a new idea creation, not an update
        let docs_to_create_admin = vec![
            (
                "idea_feature_pledge".to_string(),
                format!("PLG_FEA_{}", key),
                SetDoc {
                    data: total_pledging_data.clone(),
                    description: total_pledging_description.clone(),
                    version: total_pledging_version,
                },
            ),
            (
                "idea_revenue_counter".to_string(),
                format!("REV_FEA_{}", key),
                SetDoc {
                    data: idea_revenue_data.clone(),
                    description: idea_revenue_description.clone(),
                    version: idea_revenue_version,
                },
            ),
        ];

        for (collection, key, set_doc) in docs_to_create_admin {
            set_doc_store(controller, collection, key, set_doc)?;
        }
    }

    // Step 6: Insert or update the user-owned documents
    let docs_to_create_user = vec![
        (
            "feature".to_string(),
            key.clone(),
            SetDoc {
                data: idea_data,
                description: idea_description.clone(),
                version: idea_version,
            },
        ),
        (
            "index_search".to_string(),
            format!("INDEX_{}", key),
            SetDoc {
                data: index_search_data,
                description: index_search_description.clone(),
                version: index_search_version,
            },
        ),
    ];

    for (collection, key, set_doc) in docs_to_create_user {
        set_doc_store(caller, collection, key, set_doc)?;
    }

    Ok(())
}

#[update]
fn create_ideas(set_ideas: Vec<SetIdea>, parent_topic_id: String) -> Result<(), String> {
    // Step 1: Validate each idea independently
    for set_idea in &set_ideas {
        let validation_result = validate_basic_fields(
            &set_idea.idea.title,
            &set_idea.idea.subtitle,
            &set_idea.idea.description,
            &set_idea.idea.images,
        );
        if let Err(error) = validation_result {
            return Err(format!(
                "Validation failed for idea with key {}: {}",
                set_idea.key, error
            ));
        }
    }

    // Step 2: If all ideas are validated, proceed with creating each one
    for set_idea in set_ideas {
        // Call the create_idea function with each idea's unique key, the idea itself, and the parent topic ID
        if let Err(error) =
            create_or_update_idea(set_idea.key.clone(), set_idea.idea, parent_topic_id.clone())
        {
            return Err(format!(
                "Failed to create idea with key {}: {}",
                set_idea.key, error
            ));
        }
    }

    return Ok(()); // Return success if all ideas were created successfully
}

fn validate_basic_fields(
    title: &String,
    subtitle: &String,
    description: &String,
    images: &Vec<String>,
) -> Result<(), String> {
    if title.len() > 70 {
        return Err("Title length exceeds 70 characters".to_string());
    }
    if subtitle.len() > 200 {
        return Err("Subtitle length exceeds 200 characters".to_string());
    }
    if description.len() > 3000 {
        return Err("Description length exceeds 3000 characters".to_string());
    }
    if images.len() > 5 {
        return Err("They idea shouldnt have more than 5 images".to_string());
    }
    Ok(())
}

#[update]
fn create_or_update_solution(
    key: String,
    solution: Solution,
    parent_idea_id: String,
) -> Result<(), String> {
    let caller = api::caller();
    let controller: Principal =
        candid::Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();

    // Step 1: Basic field validation
    match validate_basic_fields(
        &solution.title,
        &solution.subtitle,
        &solution.description,
        &solution.images,
    ) {
        Ok(_) => {
            //do nothing
        }
        Err(error) => return Err(format!("Validation failed: {}", error)),
    }

    // Step 2: Check if the solution document already exists in the database
    let is_update = match get_doc_store(caller, "solution".to_string(), key.clone()) {
        Ok(Some(doc)) => {
            if (doc.owner != caller) {
                return Err(format!("Caller is not the owner of the document!"));
            };
            true
        } // Existing solution, proceed with update
        Ok(None) => false, // New solution, proceed with creation
        Err(err) => return Err(format!("Failed to retrieve solution: {}", err)),
    };

    // Step 3: Generate document data and descriptions for each collection
    let solution_data =
        encode_doc_data(&solution).map_err(|e| format!("Failed to encode solution data: {}", e))?;
    let solution_description = Some(format!("idea_id:{}", parent_idea_id));

    // Join categories for the index_search description
    let joined_categories = solution.categories.join(", ");

    let index_search_data = encode_doc_data(&IndexSearch {
        title: solution.title.clone(),
        subtitle: solution.subtitle.clone(),
        images: solution.images.clone(),
        videos: solution.videos.clone(),
        element_id: key.clone(),
        element_type: "solution".to_string(), // Specify the type as "solution"
    })
    .map_err(|e| format!("Failed to encode index_search data: {}", e))?;

    let index_search_description = Some(format!(
        "title:{} subtitle:{} type:solution idea_id:{} categories:{}",
        solution.title, solution.subtitle, parent_idea_id, joined_categories
    ));

    let followers_data =
        encode_doc_data(&0u32).map_err(|e| format!("Failed to encode followers data: {}", e))?;
    let followers_description = Some("0".to_string());

    let solution_approved_data = encode_doc_data(&String::new())
        .map_err(|e| format!("Failed to encode solution_approved data: {}", e))?;
    let solution_approved_description = Some("0".to_string());

    let solution_status_data = encode_doc_data(&String::new())
        .map_err(|e| format!("Failed to encode solution_status data: {}", e))?;
    let solution_status_description = Some("status:PROPOSAL".to_string());

    // Step 4: Retrieve versions for each document (for updates), or default to 1 for new documents
    let solution_version = Some(get_document_version_or_default(
        "solution".to_string(),
        key.clone(),
    )?);
    let index_search_version = Some(get_document_version_or_default(
        "index_search".to_string(),
        format!("INDEX_{}", key),
    )?);

    let solution_approved_version = Some(get_document_version_or_default(
        "solution_approved".to_string(),
        format!("SOL_APPR_{}", key),
    )?);
    let solution_status_version = Some(get_document_version_or_default(
        "solution_status".to_string(),
        format!("SOL_STAT_{}", key),
    )?);

    // Step 5: Update the description for the `pledges_solution` document
    let doc_key = format!("SOL_PL_{}", parent_idea_id);
    let sol_id_desc = format!("SOL_ID:{}", key);

    update_doc_description(controller, doc_key.clone(), sol_id_desc)?;

    // Step 6: Create or update user-owned documents
    let docs_to_create_user = vec![
        (
            "solution".to_string(),
            key.clone(),
            SetDoc {
                data: solution_data,
                description: solution_description.clone(),
                version: solution_version,
            },
        ),
        (
            "index_search".to_string(),
            format!("INDEX_{}", key),
            SetDoc {
                data: index_search_data,
                description: index_search_description.clone(),
                version: index_search_version,
            },
        ),
    ];

    for (collection, key, set_doc) in docs_to_create_user {
        set_doc_store(caller, collection, key, set_doc)?;
    }

    // Step 7: Create additional docs that require admin access only if this is a new solution
    if !is_update {
        let docs_to_create_admin = vec![
            (
                "solution_approved".to_string(),
                format!("SOL_APPR_{}", key),
                SetDoc {
                    data: solution_approved_data,
                    description: solution_approved_description.clone(),
                    version: solution_approved_version,
                },
            ),
            (
                "solution_status".to_string(),
                format!("SOL_STAT_{}", key),
                SetDoc {
                    data: solution_status_data,
                    description: solution_status_description.clone(),
                    version: solution_status_version,
                },
            ),
        ];

        for (collection, key, set_doc) in docs_to_create_admin {
            set_doc_store(controller, collection, key, set_doc)?;
        }
    }

    return Ok(());
}

fn update_doc_description(
    controller: candid::Principal,
    doc_key: String,
    description: String,
) -> Result<(), String> {
    // Fetch the document to retrieve its version
    let doc_version =
        get_document_version_or_default("pledges_solution".to_string(), doc_key.clone())?;

    // Update the description for the `pledges_solution` document
    let update = SetDoc {
        data: encode_doc_data(&Vec::<u8>::new())
            .map_err(|e| format!("Failed to encode empty pledges_solution data: {}", e))?,
        description: Some(description),
        version: Some(doc_version),
    };

    // Set the document in `pledges_solution` with the controller as the caller
    set_doc_store(controller, "pledges_solution".to_string(), doc_key, update)?;

    Ok(())
}

use std::str;

#[update]
pub fn upload_image(
    collection: String,
    image_name: String,
    image_data: Vec<u8>,
    element_id: String,
    element_type: String,
    content_type: String,
) -> Result<String, String> {
    let owner = api::caller();
    if owner == Principal::anonymous() {
        return Err("Anonymous principal not allowed to make upload files.".to_string());
    }
    let max_file_size = 2 * 1024 * 1024; // 2 MB limit

    if image_data.len() > max_file_size {
        return Err("File size exceeds the 2 MB limit.".to_string());
    }

    let file_extension = match content_type.as_str() {
        "image/png" => "png",
        "image/jpeg" => "jpeg",
        _ => return Err("Unsupported format. Only PNG and JPEG are allowed.".to_string()),
    };

    let full_path = format!("/{}/{}.{}", collection, image_name, file_extension);
    let asset_key = AssetKey {
        name: image_name.clone(),
        full_path: full_path.clone(),
        token: None,
        collection: collection.clone(),
        owner,
        description: Some(format!(
            "id:{},type:{}",
            element_id.clone(),
            element_type.clone()
        )),
    };

    let headers = vec![HeaderField("content-type".to_string(), content_type)];

    // Bypass UTF-8 check using from_utf8_unchecked
    let binary_data_as_str = unsafe { str::from_utf8_unchecked(&image_data) };

    match set_asset_handler(&asset_key, &image_data, &headers) {
        Ok(()) => Ok(format!("https://solutio.one{}", full_path)),
        Err(e) => Err(format!("Failed to upload image: {}", e)),
    }
}

#[update]
pub fn delete_many_images(collection: String, fullpaths: Vec<String>) -> Result<String, String> {
    // Get the caller's Principal for permission checks
    let caller = api::caller();
    let caller_text = candid::Principal::to_text(&caller);
    let controller = candid::Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();

    // Loop through each image and attempt to delete it
    for name in fullpaths.iter() {
        // Construct the full path for the image
        let full_path = name.clone();

        match delete_asset_store(controller, &collection, full_path.clone()) {
            Ok(Some(_)) => continue, // Successfully deleted, continue to the next image
            Ok(None) => return Err(format!("Image {} not found in collection.", name)),
            Err(e) if e.contains("NOT_ALLOWED") => {
                return Err(format!("Permission denied to delete image {}.", name));
            }
            Err(e) => return Err(format!("Failed to delete image {}: {}", name, e)),
        }
    }

    Ok("Selected images deleted successfully.".to_string())
}

thread_local! {
    static SCHEDULED_TASKS: RefCell<HashMap<String, TimerId>> = RefCell::new(HashMap::new());
}

#[update]
fn start_scheduled_tasks() -> String {
    let global_interval = Duration::from_secs(86_400); // 24 hours for all scheduled tasks

    // Schedule delete_unused_images
    let image_timer_id = set_timer_interval(global_interval, || {
        delete_unused_images();
    });

    // Schedule delete_orphan_ideas
    let orphan_ideas_timer_id = set_timer_interval(global_interval, || {
        delete_orphan_ideas()
            .unwrap_or_else(|e| ic_cdk::print(format!("Error deleting orphan ideas: {}", e)));
    });

    // Schedule delete_orphan_solutions
    let orphan_solutions_timer_id = set_timer_interval(global_interval, || {
        delete_orphan_solutions()
            .unwrap_or_else(|e| ic_cdk::print(format!("Error deleting orphan solutions: {}", e)));
    });

    SCHEDULED_TASKS.with(|tasks| {
        let mut tasks = tasks.borrow_mut();
        tasks.insert("image_deletion".to_string(), image_timer_id);
        tasks.insert("orphan_idea_deletion".to_string(), orphan_ideas_timer_id);
        tasks.insert(
            "orphan_solution_deletion".to_string(),
            orphan_solutions_timer_id,
        );
    });

    "Scheduled tasks started".to_string()
}

#[update]
fn stop_scheduled_tasks() -> String {
    SCHEDULED_TASKS.with(|tasks| {
        for (_, timer_id) in tasks.borrow_mut().drain() {
            clear_timer(timer_id);
        }
    });

    "Scheduled tasks stopped".to_string()
}

#[query]
fn query_scheduled_tasks_state() -> String {
    let task_states = SCHEDULED_TASKS.with(|tasks| {
        tasks
            .borrow()
            .iter()
            .map(|(task_name, _)| format!("{}: Active", task_name))
            .collect::<Vec<String>>()
    });

    if task_states.is_empty() {
        "No active scheduled tasks".to_string()
    } else {
        task_states.join("\n")
    }
}

#[update]
fn trigger_delete_unused_images() -> Result<(), String> {
    return delete_unused_images();
}

#[update]
fn trigger_delete_orphan_ideas() -> Result<(), String> {
    return delete_orphan_ideas();
}

#[update]
fn trigger_delete_orphan_solutions() -> Result<(), String> {
    return delete_orphan_solutions();
}

include_satellite!();
