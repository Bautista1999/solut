use candid::{CandidType, Int, Nat, Principal};
use ic_cdk::api;
use ic_cdk_macros::{query, update};
use junobuild_satellite::get_doc_store;
use std::u32;

#[query]
pub fn get_user_reputation(user: Principal) -> Result<u64, String> {
    let caller = api::caller();
    let user_text = Principal::to_text(&user);
    let collection = "reputation".to_string();
    let key = format!("REP_{}", user_text);
    match get_doc_store(caller, collection, key.clone()) {
        Ok(Some(doc)) => {
            let text = match doc.description {
                Some(txt) => txt,
                None => "0".to_string(),
            };
            let number: u64 = text.parse().expect("Failed to parse text into u64");
            return Ok(number);
        }
        Ok(None) => return Err("User doesnt exist".to_string()),
        Err(err) => {
            return Err(format!(
                "Some error ocurred when retrieving reputation of key: {}",
                key.clone()
            ))
        }
    }
    return Ok(0);
}
