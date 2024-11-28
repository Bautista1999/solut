use crate::quickqueries::get_doc_owner;
use crate::reputation::get_user_reputation;
use crate::types::interface::{IndexSearch, PledgeData, PledgeUser, TotalPledging};
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

//TODO: Figure out how to create a random key.
pub fn send_single_notification(target_user: String, receiver: String) -> Result<(), String> {
    // encode_doc_data(data)
    let id = Uuid::new_v4();
    let key = id.to_string();

    Ok(())
}
