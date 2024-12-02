use crate::quickqueries::get_doc_owner;
use crate::reputation::get_user_reputation;
use crate::types::interface::{IndexSearch, Notification, PledgeData, PledgeUser, TotalPledging};
use crate::{get_document_description_or_default, get_document_version_or_default};
use base64::encode; // make sure to add `base64` to dependencies in Cargo.toml
use bytes::Bytes;
use candid::{CandidType, Int, Nat, Principal};
use ic_cdk::api::{self, set_global_timer, time};
use ic_cdk_macros::{query, update};
use junobuild_satellite::{
    count_docs_store, delete_asset_store, delete_assets_store, delete_doc_store, get_doc_store,
    get_many_docs, list_docs_store, log, set_asset_handler, set_doc_store, DelDoc, Doc, Key,
    SetDoc,
};
use junobuild_shared::types::list::ListParams;
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
use uuid::Uuid;

#[update]
pub fn send_single_notification(
    sender: String,
    receiver: String,
    notification: Notification,
) -> Result<(), String> {
    // encode_doc_data(data)
    let id = Uuid::new_v4();
    let key = id.to_string();
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
