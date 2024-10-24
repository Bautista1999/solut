use std::iter::Filter;

use candid::{CandidType, Int};
mod types;
use ic_cdk::api;
use ic_cdk_macros::{query, update};
use junobuild_storage::well_known::update;
use junobuild_utils::{decode_doc_data, encode_doc_data};
use regex::Regex;
use types::interface::{PledgeData, PledgeUser, Product, TotalPledging};

use junobuild_macros::{
    assert_delete_asset, assert_delete_doc, assert_set_doc, assert_upload_asset, on_delete_asset,
    on_delete_doc, on_delete_many_assets, on_delete_many_docs, on_set_doc, on_set_many_docs,
    on_upload_asset,
};
use junobuild_satellite::{
    count_docs_store, delete_doc_store, get_doc_store, list_docs_store, log, set_doc_store, DelDoc,
    Key, SetDoc,
};
use junobuild_satellite::{
    include_satellite, AssertDeleteAssetContext, AssertDeleteDocContext, AssertSetDocContext,
    AssertUploadAssetContext, OnDeleteAssetContext, OnDeleteDocContext, OnDeleteManyAssetsContext,
    OnDeleteManyDocsContext, OnSetDocContext, OnSetManyDocsContext, OnUploadAssetContext,
};
use junobuild_shared::types::list::ListParams;

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
        Err(err) => {
            return Err(format!(
                "Failed to get version for index_search document: {}",
                err
            ))
        }
    };

    let foll_key = format!("FOLL_{}", key.clone());
    let foll_version = match get_document_version("followers".to_string(), foll_key.clone()) {
        Ok(version) => version,
        Err(err) => {
            return Err(format!(
                "Failed to get version for followers document: {}",
                err
            ))
        }
    };

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
    docs_to_delete.push((
        "followers".to_string(),
        foll_key,
        DelDoc {
            version: Some(foll_version),
        },
    ));

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
fn eliminate_idea(key: String) -> Result<(), String> {
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
        Err(err) => {
            return Err(format!(
                "Failed to get version for index_search document: {}",
                err
            ))
        }
    };

    let foll_key = format!("FOLL_{}", key.clone());
    let foll_version = match get_document_version("followers".to_string(), foll_key.clone()) {
        Ok(version) => version,
        Err(err) => {
            return Err(format!(
                "Failed to get version for followers document: {}",
                err
            ))
        }
    };

    let feature_pledge_document = format!("PLG_FEA_{}", key.clone());
    let pledge_version = match get_document_version(
        "idea_feature_pledge".to_string(),
        feature_pledge_document.clone(),
    ) {
        Ok(version) => version,
        Err(err) => {
            return Err(format!(
                "Failed to get version for the documnt that holds the total pledged: {}",
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
                    "Failed to get version for the documnt that holds the total pledged: {}",
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
    docs_to_delete.push((
        "followers".to_string(),
        foll_key,
        DelDoc {
            version: Some(foll_version),
        },
    ));

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
    match get_doc_store(caller, collection.clone(), key.clone()) {
        Ok(Some(doc)) => match doc.version {
            Some(version) => {
                return Ok(version);
            }
            None => {
                return Ok(0);
            }
        },
        Ok(None) => return Err(format!("Failed to retrieve document with id {}", key)),
        Err(err) => return Err(format!("Failed to retrieve document's version: {}", err)),
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
            let pledge_data: PledgeData = match decode_doc_data(&doc.data) {
                Ok(data) => data,
                Err(err) => return Err(format!("Failed to decode pledge data: {}", err)),
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
                Ok(None) => return Err("Solution pledge document not found.".to_string()),
                Err(err) => {
                    return Err(format!("Error fetching solution pledge document: {}", err))
                }
            }

            // Step 5: Update the `idea_feature_pledge` document for the idea (PLG_IDEA_ + idea_id)
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
                Ok(None) => return Err("Idea pledge document not found.".to_string()),
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

            // Execute the deletion using the controller
            del_many_docs(docs_to_delete);

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
        Err(err) => {
            return Err(format!(
                "Failed to get version for index_search document: {}",
                err
            ))
        }
    };

    let foll_key = format!("FOLL_{}", key.clone());
    let foll_version = match get_document_version("followers".to_string(), foll_key.clone()) {
        Ok(version) => version,
        Err(err) => {
            return Err(format!(
                "Failed to get version for followers document: {}",
                err
            ))
        }
    };

    let idea_pledge_document = format!("PLG_IDEA_{}", key.clone());
    let pledge_version = match get_document_version(
        "idea_feature_pledge".to_string(),
        idea_pledge_document.clone(),
    ) {
        Ok(version) => version,
        Err(err) => {
            return Err(format!(
                "Failed to get version for the document that holds the total pledged: {}",
                err
            ))
        }
    };

    let revenue_document = format!("REV_IDEA_{}", key.clone());
    let revenue_version =
        match get_document_version("idea_revenue_counter".to_string(), revenue_document.clone()) {
            Ok(version) => version,
            Err(err) => {
                return Err(format!(
                    "Failed to get version for the documnt that holds the total pledged: {}",
                    err
                ))
            }
        };

    let sol_pl_key = format!("SOL_PL_{}", key.clone());
    let sol_pl_version =
        match get_document_version("pledges_solution".to_string(), sol_pl_key.clone()) {
            Ok(version) => version,
            Err(err) => {
                return Err(format!(
                    "Failed to get version for pledges_solution document: {}",
                    err
                ))
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
    docs_to_delete.push((
        "followers".to_string(),
        foll_key,
        DelDoc {
            version: Some(foll_version),
        },
    ));

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

include_satellite!();
