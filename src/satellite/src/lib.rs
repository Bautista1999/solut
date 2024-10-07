use std::iter::Filter;

use candid::{CandidType, Int};
mod types;
use ic_cdk::api;
use ic_cdk_macros::{query, update};
use junobuild_storage::well_known::update;
use junobuild_utils::{decode_doc_data, encode_doc_data};
use regex::Regex;
use types::interface::Product;

use junobuild_macros::{
    assert_delete_asset, assert_delete_doc, assert_set_doc, assert_upload_asset, on_delete_asset,
    on_delete_doc, on_delete_many_assets, on_delete_many_docs, on_set_doc, on_set_many_docs,
    on_upload_asset,
};
use junobuild_satellite::{
    count_docs_store, get_doc_store, list_docs_store, log, set_doc_store, DelDoc, Key, SetDoc,
};
use junobuild_satellite::{
    include_satellite, AssertDeleteAssetContext, AssertDeleteDocContext, AssertSetDocContext,
    AssertUploadAssetContext, OnDeleteAssetContext, OnDeleteDocContext, OnDeleteManyAssetsContext,
    OnDeleteManyDocsContext, OnSetDocContext, OnSetManyDocsContext, OnUploadAssetContext,
};
use junobuild_shared::types::list::ListParams;

#[on_set_doc]
async fn on_set_doc(_context: OnSetDocContext) -> Result<(), String> {
    Ok(())
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
    match get_doc_store(caller, "solution".to_string(), key.clone()) {
        Ok(Some(doc)) => {
            // If we successfully retrieved the document, check ownership.
            if doc.owner == caller {
                // Implement your logic for deleting the document here.

                // Fetch the `version` attribute from the main solution document.
                let version = doc.version;

                // Create the vector of documents to delete.
                let mut docs_to_delete: Vec<(String, Key, DelDoc)> = Vec::new();

                // 1. Main solution document
                docs_to_delete.push((
                    "solution".to_string(),
                    key.clone(),
                    DelDoc {
                        version: version.clone(),
                    },
                ));

                // 2. Index search document
                docs_to_delete.push((
                    "index_search".to_string(),
                    format!("INDEX_{}", key.clone()),
                    DelDoc {
                        version: version.clone(),
                    },
                ));

                let parent_idea_id =
                    match doc.description.as_deref() {
                        Some(description) => match extract_idea_id(description.clone()) {
                            Some(idea_id) => idea_id,
                            None => {
                                return Err("Failed to extract parent idea ID from description."
                                    .to_string())
                            }
                        },
                        None => {
                            return Err("Description is missing, cannot extract parent idea ID."
                                .to_string())
                        }
                    };
                docs_to_delete.push((
                    "pledges_solution".to_string(),
                    format!("SOL_PL_{}", parent_idea_id.clone()),
                    DelDoc {
                        version: version.clone(),
                    },
                ));

                // 4. Followers document
                docs_to_delete.push((
                    "followers".to_string(),
                    format!("FOLL_{}", key.clone()),
                    DelDoc {
                        version: version.clone(),
                    },
                ));

                // 5. Solution approved document
                docs_to_delete.push((
                    "solution_approved".to_string(),
                    format!("SOL_APPR_{}", key.clone()),
                    DelDoc {
                        version: version.clone(),
                    },
                ));

                // 6. Solution status document
                docs_to_delete.push((
                    "solution_status".to_string(),
                    format!("SOL_STAT_{}", key.clone()),
                    DelDoc {
                        version: version.clone(),
                    },
                ));

                del_many_docs(docs_to_delete);

                // Return success after deleting documents.
                Ok(())
            } else {
                Err("Caller is not the owner of the solution.".to_string())
            }
        }
        Ok(None) => {
            // Document was not found in the collection.
            Err("Solution not found.".to_string())
        }
        Err(err) => {
            // An error occurred while retrieving the document.
            Err(format!("Failed to retrieve solution: {}", err))
        }
    }
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

// #[update]
// async fn get_most_liked_topics() -> Result<ListResults, String> {
//     match log("This is a test log message.".to_string()) {
//         Ok(_) => {
//             println!("Log successful.");
//             return Ok("Log successful.".to_string());
//         }
//         Err(err) => {
//             println!("Failed to log message: {}", err);
//             return Err(err); // Propagate the error or handle it
//         }
//     }
//     let caller = api::caller();

//     let params = ListParams {
//         matcher: None,
//         paginate: None,
//         order: None,
//         owner: None,
//     };

//     let docs = match list_docs_store(caller, "topic".to_string(), &params) {
//         Ok(result) => result,
//         Err(err) => return Err(format!("Error retrieving documents: {}", err)),
//     };

//     // If the list is empty, return a message
//     if docs.items.is_empty() {
//         return Err("No documents found".to_string());
//     }
//     struct itemFollowersList {
//         key: String,
//         amount: Int,
//     };

//     for item in docs.items.iter() {
//         let itemMatcher = ListMatcher {
//             key: item.0,
//             description: None,
//             created_at: None,
//             updated_at: None,
//         };
//         let itemParams = ListParams {
//             matcher: itemMatcher,
//             paginate: None,
//             order: None,
//             owner: None,
//         };
//         count_docs_store(caller, "follow".to_string, &itemParams)
//     }

// // Get the first two documents, or fewer if there are not enough
// let first_two_docs = &docs.items[..std::cmp::min(docs.items.len(), 2)];

// // Format the results into a string
// let result: Vec<String> = first_two_docs
//     .iter()
//     .map(|(key, doc)| format!("Key: {:?}, Document: [manual formatting of doc]", key)) // Replace with custom formatting
//     .collect();

// result.join("\n");
// Ok(())
// }

// fn sort_docs_by_followers(docs: &mut Vec<(Key, Document)>) -> Result<(), String> {
//     // Use sort_by to sort items based on the number of followers in descending order.
//     docs.sort_by(|(_, doc_a), (_, doc_b)| {
//         // Get the follower count for each document
//         let followers_a = get_follower_count(doc_a);
//         let followers_b = get_follower_count(doc_b);

//         // Sort in descending order, so more followers come first
//         followers_b.cmp(&followers_a)
//     });

//     Ok(())
// }

include_satellite!();
