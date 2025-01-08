use crate::{delete_many_images, eliminate_idea, get_document_version_or_default};
use candid::Principal;
use ic_cdk::api::{self, time};
use junobuild_satellite::delete_doc_store;
use junobuild_satellite::{
    get_doc_store, list_assets_store, list_docs_store, log, DelDoc, Doc, Key,
};
use junobuild_shared::types::list::{
    ListMatcher, ListOrder, ListOrderField, ListParams, ListResults, TimestampMatcher,
};
use junobuild_storage::{http::types::HeaderField, types::interface::AssetNoContent};
use regex::Regex;
use std::{cell::RefCell, fmt::format};

thread_local! {
    static LAST_TIME: RefCell<u64> = RefCell::new(0); // Stores the last execution timestamp
}
//TODO: When we check if the image's parent element exists or not, if it does we also need to check if its also using that image. In case not, we need to get rid of it.
//TODO: Only check for images older than 8 hours or something. Just to avoid deleting the images that were uploaded by the user on the create topic, idea or solution.
pub fn delete_unused_images() -> Result<(), String> {
    // Set the controller as the caller
    let controller = Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();
    let collection = "images".to_string();
    let mut deleted_images_count = 0;

    // Fetch the timestamp of the last run
    let last_run = LAST_TIME.with(|time| *time.borrow());

    // Set up filter parameters to retrieve only new images
    let filters = ListParams {
        matcher: None, // Some(ListMatcher {
        //     created_at: Some(TimestampMatcher::GreaterThan(last_run)),
        //     ..Default::default()
        // })
        order: Some(ListOrder {
            desc: false,
            field: ListOrderField::CreatedAt,
        }),
        ..Default::default()
    };

    // Get images added since the last run
    let assets_result: ListResults<AssetNoContent> =
        match list_assets_store(controller.clone(), &collection, &filters) {
            Ok(results) => results,
            Err(e) => return Err(format!("Error listing assets: {}", e)),
        };

    let mut images_to_delete: Vec<String> = Vec::new();
    // Process each image to check if the corresponding document exists
    for (_asset_key, asset) in assets_result.items.iter() {
        // Retrieve only the base name
        let mut filename = asset.key.full_path.clone();

        // Access each asset's description
        let description = asset.key.description.clone().unwrap_or_default();
        // Parse description to extract document id and type
        if let Some((doc_id, doc_type)) = parse_description(description.as_str()) {
            // Check if the document exists

            match get_doc_store(controller.clone(), doc_type.clone(), doc_id.clone()) {
                Ok(Some(doc)) => {
                    continue;
                } // Document exists, move to the next image
                Ok(None) => {
                    // log(format!(
                    //     "NEW IMAGE DELETED. Doc: {}, type: {}",
                    //     doc_id, doc_type
                    // ));
                    images_to_delete.push(filename); // Add the complete filename for deletion
                    deleted_images_count += 1;
                }
                Err(_) => {
                    // log(format!(
                    //     "ERROR FETCHING: Doc: {}, type: {}",
                    //     doc_id, doc_type
                    // ));
                }
            }
        } else {
            images_to_delete.push(filename); // Add the complete filename for deletion
            deleted_images_count += 1;
        }
    }

    // Delete all images marked for deletion
    if !images_to_delete.is_empty() {
        delete_many_images("images".to_string(), images_to_delete)?;
    }

    // Update LAST_TIME to the current timestamp
    let current_time = time();
    LAST_TIME.with(|time| *time.borrow_mut() = current_time);

    // Log the completion of the function with the number of images deleted
    log(format!(
        "delete_unused_images() ran successfully. Images deleted: {}",
        deleted_images_count
    ));
    Ok(())
}

/// Parses the description to extract the document id and type
fn parse_description(description: &str) -> Option<(String, String)> {
    let parts: Vec<&str> = description.split(",").collect();
    if parts.len() != 2 {
        return None;
    }

    let id_part = parts[0].trim_start_matches("id:");
    let type_part = parts[1].trim_start_matches("type:");

    if id_part.is_empty() || type_part.is_empty() {
        None
    } else {
        Some((id_part.to_string(), type_part.to_string()))
    }
}

// Helper function to extract the parent topic ID from the description
pub fn extract_parent_topic_id(description: &str) -> Option<String> {
    // let prefix = "idea_id:";
    // if description.starts_with(prefix) {
    //     Some(description[prefix.len()..].to_string())
    // } else {
    //     log(format!("Description: {}", description.clone()));
    //     None // Return None if the description format is incorrect
    // }
    let re = Regex::new(r"idea_id:([A-Za-z0-9_-]+)").unwrap();

    // Try to find a match in the description
    if let Some(captures) = re.captures(description) {
        // Return the first capture group (the value after `idea_id:`)
        captures.get(1).map(|id| id.as_str().to_string())
    } else {
        None
    }
}

pub fn delete_orphan_ideas() -> Result<(), String> {
    let controller = Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();
    let idea_collection = "feature".to_string(); // "idea" is stored in "feature"
    let topic_collection = "idea".to_string(); // "topic" is stored in "idea"
    let mut orphan_count = 0;

    // Define filter parameters to retrieve all ideas
    let filters = ListParams {
        order: Some(ListOrder {
            desc: false,
            field: ListOrderField::CreatedAt,
        }),
        ..Default::default()
    };

    // Retrieve all ideas from the "feature" collection
    let ideas_result: ListResults<Doc> =
        match list_docs_store(controller.clone(), idea_collection.clone(), &filters) {
            Ok(results) => results,
            Err(e) => return Err(format!("Error listing ideas: {}", e)),
        };

    // Vector to store orphaned idea keys for deletion
    let mut ideas_to_delete: Vec<(String, String)> = Vec::new();

    // Process each idea and check for the existence of the parent topic in "idea"
    for (_asset_key, asset) in ideas_result.items.iter() {
        let idea_key = _asset_key.clone();
        let description = asset.description.clone().unwrap_or_default();

        // Extract the parent topic ID
        if let Some(parent_topic_id) = extract_parent_topic_id(&description) {
            // Check if the parent topic exists in the "idea" collection

            match get_doc_store(
                controller.clone(),
                topic_collection.clone(),
                parent_topic_id.clone(),
            ) {
                Ok(Some(_)) => continue, // Parent topic exists, skip deletion
                Ok(None) => {
                    // Parent topic does not exist, mark idea for deletion
                    ideas_to_delete.push((idea_key.clone(), parent_topic_id.clone()));
                    orphan_count += 1;
                }
                Err(e) => return Err(format!("Error fetching parent topic: {}", e)),
            }
        }
        // else {
        //     // Invalid description format or missing parent_topic details
        //     ideas_to_delete.push((idea_key.clone(), "unknown".to_string()));
        //     orphan_count += 1;
        // }
    }

    // Delete all orphaned ideas
    for (idea_key, parent_topic_id) in &ideas_to_delete {
        // Log each deletion with the parent topic ID
        // ic_cdk::print(format!(
        //     "Deleting idea with parent topic id: {} and idea_id: {}",
        //     parent_topic_id, idea_key
        // ));

        match eliminate_idea_without_permission(idea_key.clone()) {
            Ok(_) => continue,
            Err(err) => {
                ic_cdk::print(format!("Error: {}", err));
            }
        };
    }

    // Log the completion of the function with the number of orphan ideas deleted
    log(format!(
        "delete_orphan_ideas() completed. Orphaned ideas deleted: {}",
        orphan_count
    ));

    Ok(())
}

pub fn delete_orphan_solutions() -> Result<(), String> {
    let controller = Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();
    let idea_collection = "solution".to_string(); // "idea" is stored in "feature"
    let solution_collection = "idea".to_string(); // "topic" is stored in "idea"
    let mut orphan_count = 0;

    // Define filter parameters to retrieve all ideas
    let filters = ListParams {
        order: Some(ListOrder {
            desc: false,
            field: ListOrderField::CreatedAt,
        }),
        ..Default::default()
    };

    // Retrieve all ideas from the "feature" collection
    let solutions_result: ListResults<Doc> =
        match list_docs_store(controller.clone(), idea_collection.clone(), &filters) {
            Ok(results) => results,
            Err(e) => return Err(format!("Error listing ideas: {}", e)),
        };

    // Vector to store orphaned idea keys for deletion
    let mut solutions_to_delete: Vec<(String, String)> = Vec::new();

    // Process each idea and check for the existence of the parent topic in "idea"
    for (_asset_key, asset) in solutions_result.items.iter() {
        let key: String = _asset_key.clone();
        let description = asset.description.clone().unwrap_or_default();

        // Extract the parent topic ID
        if let Some(parent_topic_id) = extract_parent_topic_id(&description) {
            // Check if the parent topic exists in the "idea" collection

            match get_doc_store(
                controller.clone(),
                solution_collection.clone(),
                parent_topic_id.clone(),
            ) {
                Ok(Some(_)) => continue, // Parent topic exists, skip deletion
                Ok(None) => {
                    // Parent topic does not exist, mark idea for deletion
                    solutions_to_delete.push((key.clone(), parent_topic_id.clone()));
                    orphan_count += 1;
                }
                Err(e) => return Err(format!("Error fetching parent topic: {}", e)),
            }
        }
        // else {
        //     // Invalid description format or missing parent_topic details
        //     ideas_to_delete.push((idea_key.clone(), "unknown".to_string()));
        //     orphan_count += 1;
        // }
    }

    // Delete all orphaned ideas
    for (key, parent_topic_id) in &solutions_to_delete {
        // Log each deletion with the parent topic ID
        // ic_cdk::print(format!(
        //     "Deleting idea with parent topic id: {} and idea_id: {}",
        //     parent_topic_id, idea_key
        // ));

        match eliminate_solution_without_permission(key.clone()) {
            Ok(_) => continue,
            Err(err) => {
                ic_cdk::print(format!("Error: {}", err));
            }
        };
    }

    // Log the completion of the function with the number of orphan ideas deleted
    log(format!(
        "delete_orphan_solutions() completed. Orphaned solutions deleted: {}",
        orphan_count
    ));

    Ok(())
}

fn eliminate_idea_without_permission(key: String) -> Result<(), String> {
    let caller = api::caller();
    let controller = candid::Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();
    // Step 1: Fetch the main solution document and check ownership
    let idea_doc = match get_doc_store(caller, "feature".to_string(), key.clone()) {
        Ok(Some(doc)) => doc,
        Ok(None) => return Err("idea not found.".to_string()),
        Err(err) => return Err(format!("Failed to retrieve idea: {}", err)),
    };

    let version = idea_doc.version; // Get the version of the solution document

    // Step 2: Prepare to validate the other documents, starting with their versions
    let index_key = format!("INDEX_{}", key.clone());
    let index_version =
        match get_document_version_or_default("index_search".to_string(), index_key.clone()) {
            Ok(version) => version,
            Err(err) => 1,
        };

    let foll_key = format!("FOLL_{}", key.clone());

    let feature_pledge_document = format!("PLG_FEA_{}", key.clone());
    let pledge_version = match get_document_version_or_default(
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
    let revenue_version = match get_document_version_or_default(
        "idea_revenue_counter".to_string(),
        revenue_document.clone(),
    ) {
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

fn eliminate_solution_without_permission(key: String) -> Result<(), String> {
    let caller = api::caller();
    let controller = candid::Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();

    // Step 1: Fetch the main solution document and check ownership
    let solution_doc = match get_doc_store(caller, "solution".to_string(), key.clone()) {
        Ok(Some(doc)) => doc,
        Ok(None) => return Err("Solution not found.".to_string()),
        Err(err) => return Err(format!("Failed to retrieve solution: {}", err)),
    };

    let version = solution_doc.version; // Get the version of the solution document

    // Step 2: Prepare to validate the other documents, starting with their versions
    let index_key = format!("INDEX_{}", key.clone());
    let index_version =
        match get_document_version_or_default("index_search".to_string(), index_key.clone()) {
            Ok(version) => version,
            Err(err) => 1,
        };

    let foll_key = format!("FOLL_{}", key.clone());

    let sol_appr_key = format!("SOL_APPR_{}", key.clone());
    let sol_appr_version = match get_document_version_or_default(
        "solution_approved".to_string(),
        sol_appr_key.clone(),
    ) {
        Ok(version) => version,
        Err(err) => {
            return Err(format!(
                "Failed to get version for solution_approved document: {}",
                err
            ))
        }
    };

    let sol_stat_key = format!("SOL_STAT_{}", key.clone());
    let sol_stat_version = match get_document_version_or_default(
        "solution_status".to_string(),
        sol_stat_key.clone(),
    ) {
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
