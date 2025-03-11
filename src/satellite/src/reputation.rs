use candid::{CandidType, Int, Nat, Principal};
use ic_cdk::api;
use ic_cdk_macros::{query, update};
use junobuild_satellite::{get_doc_store, set_doc_store, SetDoc};
use junobuild_utils::{decode_doc_data, encode_doc_data};
use std::u32;

use crate::get_document_version_or_default;

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

/// Calculates user reputation based on amount paid vs amount promised
/// Returns a percentage between 0 and 100
///
/// # Arguments
/// * `amount_paid` - Total amount the user has paid
/// * `amount_promised` - Total amount the user has promised
///
/// # Returns
/// * A percentage (0-100) representing the user's reputation
/// * Returns 100 if amount_promised is 0 and amount_paid > 0 (exceeded expectations)
/// * Returns 0 if both amount_promised and amount_paid are 0
pub fn calculate_reputation(amount_paid: u64, amount_promised: u64) -> u64 {
    if amount_promised == 0 {
        return if amount_paid > 0 { 100 } else { 0 };
    }
    let percentage = (amount_paid as f64 / amount_promised as f64) * 100.0;
    percentage.min(100.0) as u64
}

pub fn update_user_reputation(
    user: Principal,
    amount_paid: u64,
    amount_promised: u64,
) -> Result<(), String> {
    let user_text = Principal::to_text(&user);
    let doc_id = format!("REP_{}", user_text);
    let caller = api::caller();

    // Fetch existing document or create default values
    let (mut reputation_data, version) =
        match get_doc_store(caller, "reputation".to_string(), doc_id.clone()) {
            Ok(Some(doc)) => {
                let data: serde_json::Value = decode_doc_data(&doc.data)
                    .map_err(|e| format!("Error decoding reputation data: {}", e))?;

                // Get existing values and add new amounts
                let amount_paid_total = data["amount_paid"].as_u64().unwrap_or(0) + amount_paid;
                let amount_promised_total =
                    data["amount_promised"].as_u64().unwrap_or(0) + amount_promised;

                // Get reputation from description or default to 0
                let current_reputation = doc
                    .description
                    .and_then(|d| d.parse::<u64>().ok())
                    .unwrap_or(0);

                (
                    serde_json::json!({
                        "amount_paid": amount_paid_total,
                        "amount_promised": amount_promised_total,
                        "reputation": current_reputation
                    }),
                    get_document_version_or_default("reputation".to_string(), doc_id.clone())?,
                )
            }
            Ok(None) => (
                serde_json::json!({
                    "amount_paid": amount_paid,
                    "amount_promised": amount_promised,
                    "reputation": 0
                }),
                0,
            ),
            Err(e) => return Err(format!("Error fetching reputation: {}", e)),
        };

    // Calculate new reputation based on total amounts
    let amount_promised_total = reputation_data["amount_promised"].as_u64().unwrap();
    let amount_paid_total = reputation_data["amount_paid"].as_u64().unwrap();

    let new_reputation = calculate_reputation(amount_paid_total, amount_promised_total);
    reputation_data["reputation"] = serde_json::json!(new_reputation);

    // Convert the updated data to bytes
    let encoded_data = serde_json::to_vec(&reputation_data)
        .map_err(|e| format!("Error encoding reputation data: {}", e))?;

    // Store the updated document
    set_doc_store(
        caller,
        "reputation".to_string(),
        doc_id,
        SetDoc {
            data: encoded_data,
            description: Some(new_reputation.to_string()), // Keep description for backward compatibility
            version: Some(version),
        },
    )
    .map_err(|e| format!("Error storing reputation: {}", e))?;
    Ok(())
}

pub fn reverse_user_reputation(
    user: Principal,
    amount_paid: u64,
    amount_promised: u64,
) -> Result<(), String> {
    let user_text = Principal::to_text(&user);
    let doc_id = format!("REP_{}", user_text);
    let caller = api::caller();

    // Fetch existing document
    match get_doc_store(caller, "reputation".to_string(), doc_id.clone()) {
        Ok(Some(doc)) => {
            let data: serde_json::Value = decode_doc_data(&doc.data)
                .map_err(|e| format!("Error decoding reputation data: {}", e))?;

            // Get existing values and subtract the amounts
            let current_paid = data["amount_paid"].as_u64().unwrap_or(0);
            let current_promised = data["amount_promised"].as_u64().unwrap_or(0);

            // Ensure we don't underflow - use saturating_sub
            let amount_paid_total = current_paid.saturating_sub(amount_paid);
            let amount_promised_total = current_promised.saturating_sub(amount_promised);

            // Calculate new reputation based on updated totals
            let new_reputation = calculate_reputation(amount_paid_total, amount_promised_total);

            // Create updated reputation data
            let updated_data = serde_json::json!({
                "amount_paid": amount_paid_total,
                "amount_promised": amount_promised_total,
                "reputation": new_reputation
            });

            // Get version
            let version =
                get_document_version_or_default("reputation".to_string(), doc_id.clone())?;

            // Convert the updated data to bytes
            let encoded_data = serde_json::to_vec(&updated_data)
                .map_err(|e| format!("Error encoding reputation data: {}", e))?;

            // Store the updated document
            set_doc_store(
                caller,
                "reputation".to_string(),
                doc_id,
                SetDoc {
                    data: encoded_data,
                    description: Some(new_reputation.to_string()),
                    version: Some(version),
                },
            )
            .map_err(|e| format!("Error storing reputation: {}", e))?;

            Ok(())
        }
        Ok(None) => Err("User reputation record not found".to_string()),
        Err(e) => Err(format!("Error fetching reputation: {}", e)),
    }
}
