use crate::delete_many_images;
use candid::Principal;
use ic_cdk::api::{self, time};
use junobuild_satellite::{get_doc_store, list_assets_store, log, Key};
use junobuild_shared::types::list::{
    ListMatcher, ListOrder, ListOrderField, ListParams, ListResults, TimestampMatcher,
};
use junobuild_storage::{http::types::HeaderField, types::interface::AssetNoContent};
use std::cell::RefCell;

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
        matcher: Some(ListMatcher {
            created_at: Some(TimestampMatcher::GreaterThan(last_run)),
            ..Default::default()
        }),
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
                Ok(Some(_)) => continue, // Document exists, move to the next image
                Ok(None) | Err(_) => {
                    images_to_delete.push(filename); // Add the complete filename for deletion
                    deleted_images_count += 1;
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
