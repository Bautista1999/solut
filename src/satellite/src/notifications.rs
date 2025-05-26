use crate::types::interface::{Notification};
use candid::{Principal};
use ic_cdk::api::{time};
use ic_cdk_macros::{update};
use junobuild_satellite::{
    set_doc_store,
    SetDoc,
};
use junobuild_utils::{encode_doc_data};
use junobuild_satellite::random;
use junobuild_shared::types::core::Key;

#[update]
pub fn send_single_notification(
    sender: String,
    receiver: String,
    notification: Notification,
) -> Result<(), String> {
    // encode_doc_data(data)

    let nonce = random()?;

    let key: Key = format!("{}-{}", time(), nonce);

    let encoded_data = match encode_doc_data(&notification) {
        Ok(vec) => vec,
        Err(err) => return Err(format!("Failed to encode notification: {}", err)),
    };

    // Specify the collection key
    let collection_key = "notification".to_string(); // Adjust collection name as needed
    let controller = Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();
    // Create a document for storage
    let doc = SetDoc {
        data: encoded_data,
        version: Some(1),                    // Optional versioning
        description: Some(receiver.clone()), // Optional description
    };
    match set_doc_store(controller, collection_key, key, doc) {
        Ok(_) => {}
        Err(err) => return Err(format!("Failed to store notification: {}", err)),
    };
    Ok(())
}
