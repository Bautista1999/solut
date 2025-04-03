use crate::config::currency::MIN_PLEDGE_AMOUNT;
use crate::indexed_queries::get_element_enriched_data;
use crate::notifications::send_single_notification;
use crate::quickqueries::get_doc_owner;
use crate::reputation::get_user_reputation;
use crate::types::interface::{Notification, PledgeData, PledgeUser, TotalPledging};
use crate::user_information::{
    get_available_balance_without_pledged_amount, get_user_profile_pic, get_user_username,
};
use crate::{delete_pledge, get_document_description_or_default, get_document_version_or_default};
use candid::Principal;
use ic_cdk::{caller, spawn};
use ic_cdk_macros::update;
use junobuild_satellite::{get_many_docs, log, set_doc_store, Doc, SetDoc};
use junobuild_shared::types::core::Key;
use junobuild_utils::{decode_doc_data, encode_doc_data};

// Main pledge creation function
#[update]
pub fn pledge_create(
    doc_key: String,
    idea_id: String,
    feature_id: String,
    amount: u64,
    account_blob: Vec<u8>,
) -> String {
    if amount == 0 {
        return "You can't pledge 0".to_string();
    }

    if idea_id.trim().is_empty() {
        return "idea_id is empty".to_string();
    }
    if amount < MIN_PLEDGE_AMOUNT {
        return "Minimum pledge amount is 1 ICP".to_string();
    }

    let caller = caller();
    if caller == Principal::anonymous() {
        return "Anonymous users cannot create pledges.".to_string();
    }

    // Prepare document keys
    let doc_keys = prepare_doc_keys(&caller, &idea_id, &feature_id);

    // Fetch required documents
    let fetched_docs = get_many_docs(doc_keys.clone());

    // Validate the fetched documents
    if let Err(err) = validate_documents(&fetched_docs, &caller, &idea_id, &feature_id) {
        return err;
    }

    // Extract required data
    let (user_reputation, total_pledge_idea_info, total_pledge_feature_info) =
        match extract_pledge_data(&fetched_docs, &caller, &idea_id, &feature_id) {
            Ok(data) => data,
            Err(err) => return format!("Failed to extract data: {}", err),
        };
    // Calculate expected amount
    let expected_amount = match calculate_expected_amount(&caller, amount, user_reputation) {
        Ok(val) => val,
        Err(err) => return format!("Failed to calculate expected amount: {}", err),
    };

    // Update pledge solution
    let solution_update = update_pledges_solution(
        "pledges_solution".to_string(),
        &caller.clone(),
        amount,
        expected_amount,
        &idea_id,
        &fetched_docs,
    );

    if let Err(err) = solution_update {
        return format!("Failed to update pledge solution: {}", err);
    }

    let mut updates = vec![(
        "pledges_solution".to_string(),
        format!("SOL_PL_{}", idea_id.clone()),
        solution_update.unwrap(),
    )];

    let idea_update = match update_idea_pledges(
        "idea_feature_pledge".to_string(),
        &idea_id,
        amount,
        expected_amount,
        &fetched_docs,
    ) {
        Ok(idea) => updates.push(idea),
        Err(err) => return (err),
    };

    if !feature_id.trim().is_empty() {
        let feature_update = match update_feature_pledges(
            "idea_feature_pledge".to_string(),
            &feature_id.clone(),
            amount,
            expected_amount,
            &fetched_docs,
        ) {
            Ok(None) => {
                return format!(
                    "Document not found: collection: idea_feature_pledge, doc: PLG_FEA_{}",
                    feature_id.clone()
                )
            }
            Ok(Some(feature)) => updates.push(feature),

            Err(err) => return (err),
        };
    }

    // Create pledge active document
    let active_doc = create_pledge_active(
        &doc_key,
        &idea_id.clone(),
        &feature_id,
        amount,
        expected_amount,
        &caller,
        &fetched_docs,
    );
    if let Err(err) = active_doc {
        return format!("Failed to create pledge active document: {}", err);
    }
    updates.push(active_doc.unwrap());

    // Apply updates
    if let Err(err) = apply_updates(updates) {
        return format!("Failed to apply updates: {}", err);
    }
    let user_id = Principal::to_text(&caller);
    spawn(async move {
        match validate_user_balance_or_delete_pledge(user_id, amount, doc_key.clone()).await {
            Ok(_) => {
                send_pledge_notifications(&caller.clone(), &idea_id, Some(&feature_id), amount);
            }
            Err(e) => {
                log(format!(
                    "Error in validate_user_balance_or_delete_pledge: {}",
                    e
                ));
            }
        }
    });

    "Pledge created successfully!".to_string()
}

// Helper functions

fn update_pledges_solution(
    collection: String,
    caller: &Principal,
    amount: u64,
    expected_amount: u64,
    idea_id: &String,
    docs: &[(String, Option<Doc>)],
) -> Result<SetDoc, String> {
    let mut user_pledge_list: Vec<PledgeUser> = vec![];

    let doc_key = format!("SOL_PL_{}", idea_id);

    // Fetch the document version
    let version = get_document_version_or_default(collection.clone(), doc_key.clone())
        .map_err(|err| return format!("Failed to fetch document version: {}", err))?;

    if let Some(Some(doc)) = docs
        .iter()
        .find(|(key, _)| key == &format!("SOL_PL_{}", idea_id))
        .map(|(_, doc)| doc)
    {
        // Decode existing user pledges
        user_pledge_list = decode_doc_data(&doc.data)
            .map_err(|err| return format!("Failed to decode pledges solution: {}", err))?;
    }

    // Add or update the user's pledge in the list
    let user_pledge = PledgeUser {
        user: caller.to_text(),
        amount_pledged: amount,
        amount_paid: 0,
    };
    user_pledge_list = update_user_pledge_list(user_pledge_list, user_pledge);

    // Encode the updated list back
    let data = encode_doc_data(&user_pledge_list)
        .map_err(|err| return format!("Failed to encode pledges solution: {}", err))?;

    let description = get_document_description_or_default(
        "pledges_solution".to_string(),
        format!("SOL_PL_{}", idea_id),
    );
    // Return the `SetDoc` with the fetched version
    Ok(SetDoc {
        version: Some(version),
        data,
        description: Some(description),
    })
}

fn update_idea_pledges(
    collection: String,
    idea_id: &String,
    amount: u64,
    expected_amount: u64,
    docs: &[(String, Option<Doc>)], // Updated to use Vec<(String, Option<Doc>)>
) -> Result<(String, String, SetDoc), String> {
    let mut total_pledge_info = TotalPledging {
        pledges: 0,
        expected: 0,
    };

    // Find the document matching the collection
    if let Some((_, Some(doc))) = docs
        .iter()
        .find(|(key, _)| key == &format!("PLG_IDEA_{}", idea_id))
    {
        // Decode existing total pledges for the idea
        total_pledge_info = decode_total_pledging(&doc.data)
            .map_err(|err| return format!("Failed to decode idea pledges: {}", err))?;
    }

    // Update total pledge information
    total_pledge_info.pledges += amount;
    total_pledge_info.expected += expected_amount;

    // Encode the updated information back
    let data = encode_doc_data(&total_pledge_info)
        .map_err(|err| return format!("Failed to encode idea pledges: {}", err))?;

    // Fetch the current version of the document
    let version = get_document_version_or_default(
        "idea_feature_pledge".to_string(),
        format!("PLG_IDEA_{}", idea_id),
    )
    .map_err(|err| return format!("Failed to fetch version for idea pledge: {}", err))?;

    // Fetch the document description
    let description = get_document_description_or_default(
        "idea_feature_pledge".to_string(),
        format!("PLG_IDEA_{}", idea_id),
    );

    Ok((
        collection.clone(),
        format!("PLG_IDEA_{}", idea_id),
        SetDoc {
            data,
            description: Some(description),
            version: Some(version),
        },
    ))
}

fn update_feature_pledges(
    collection: String,
    feature_id: &String,
    amount: u64,
    expected_amount: u64,
    docs: &[(String, Option<Doc>)], // Updated to use Vec<(String, Option<Doc>)>
) -> Result<Option<(String, String, SetDoc)>, String> {
    let mut total_pledge_info = TotalPledging {
        pledges: 0,
        expected: 0,
    };

    // Find the document matching the collection
    if let Some((_, Some(doc))) = docs
        .iter()
        .find(|(key, _)| key == &format!("PLG_FEA_{}", feature_id))
    {
        // Decode existing total pledges for the feature
        total_pledge_info = decode_total_pledging(&doc.data)
            .map_err(|err| return format!("Failed to decode feature pledges: {}", err))?;
    }

    // Update total pledge information
    total_pledge_info.pledges += amount;
    total_pledge_info.expected += expected_amount;

    // Encode the updated information back
    let data = encode_doc_data(&total_pledge_info)
        .map_err(|err| return format!("Failed to encode feature pledges: {}", err))?;

    // Fetch the current version of the document
    let version = get_document_version_or_default(
        "idea_feature_pledge".to_string(),
        format!("PLG_FEA_{}", feature_id),
    )
    .map_err(|err| return format!("Failed to fetch version for feature pledge: {}", err))?;

    // Fetch the document description
    let description = get_document_description_or_default(
        "idea_feature_pledge".to_string(),
        format!("PLG_FEA_{}", feature_id),
    );

    Ok(Some((
        collection.clone(),
        format!("PLG_FEA_{}", feature_id),
        SetDoc {
            data,
            description: Some(description),
            version: Some(version),
        },
    )))
}

/// Prepare document keys
fn prepare_doc_keys(caller: &Principal, idea_id: &str, feature_id: &str) -> Vec<(String, Key)> {
    let mut doc_keys = vec![
        ("idea".to_string(), idea_id.to_string()),
        (
            "reputation".to_string(),
            format!("REP_{}", caller.to_text()),
        ),
        (
            "pledges_solution".to_string(),
            format!("SOL_PL_{}", idea_id),
        ),
        (
            "idea_feature_pledge".to_string(),
            format!("PLG_IDEA_{}", idea_id),
        ),
        (
            "solution_status".to_string(),
            format!("SOL_STAT_{}", idea_id), // New key for solution status validation
        ),
    ];

    if !feature_id.trim().is_empty() {
        doc_keys.push((
            "idea_feature_pledge".to_string(),
            format!("PLG_FEA_{}", feature_id),
        ));
        doc_keys.push(("feature".to_string(), feature_id.to_string()));
    }

    doc_keys
}
/// Validates the fetched documents to ensure they meet all conditions for pledge creation.
fn validate_documents(
    docs: &[(String, Option<Doc>)],
    caller: &Principal,
    idea_id: &str,
    feature_id: &str,
) -> Result<(), String> {
    // Check that the idea document exists
    if docs
        .iter()
        .all(|(key, doc)| key != idea_id || doc.is_none())
    {
        return Err("Idea document not found.".to_string());
    }

    // Check that the user's reputation document exists
    if docs
        .iter()
        .all(|(key, doc)| key != &format!("REP_{}", caller.to_text()) || doc.is_none())
    {
        return Err(format!(
            "Reputation document for user {} not found.",
            caller.to_text()
        ));
    }

    // Check feature document if a feature ID is provided
    if !feature_id.trim().is_empty() {
        if docs
            .iter()
            .all(|(key, doc)| key != feature_id || doc.is_none())
        {
            return Err(format!("Feature document for ID {} not found.", feature_id));
        }
    }

    // Validate solution delivery status
    if let Some((_, Some(doc))) = docs
        .iter()
        .find(|(key, _)| key == &format!("SOL_STAT_{}", idea_id))
    {
        if let Some(description) = &doc.description {
            if ["DELIVERED", "COMPLETED"].contains(&description.as_str()) {
                return Err("The solution has already been delivered or completed.".to_string());
            }
        }
    }

    Ok(())
}

/// Extracts necessary data from the fetched documents for pledge processing.
fn extract_pledge_data(
    docs: &[(String, Option<Doc>)],
    caller: &Principal,
    idea_id: &str,
    feature_id: &str,
) -> Result<(u64, TotalPledging, Option<TotalPledging>), String> {
    // Fetch user reputation
    let user_reputation = get_user_reputation(caller.clone())?;

    // Decode idea pledging info
    let total_pledge_idea_info = docs
        .iter()
        .find(|(key, _)| key == &format!("PLG_IDEA_{}", idea_id))
        .and_then(|(_, doc)| doc.as_ref())
        .ok_or_else(|| {
            format!(
                "Idea pledge document not found for ID {}.",
                format!("PLG_IDEA_{}", idea_id)
            )
        })
        .and_then(|doc| {
            decode_doc_data::<TotalPledging>(&doc.data)
                .map_err(|err| return format!("Failed to decode idea pledging data: {}", err))
        })?;

    // Decode feature pledging info if applicable
    let total_pledge_feature_info = if !feature_id.trim().is_empty() {
        docs.iter()
            .find(|(key, _)| key == &format!("PLG_FEA_{}", feature_id))
            .and_then(|(_, doc)| doc.as_ref())
            .and_then(|doc| decode_doc_data::<TotalPledging>(&doc.data).ok())
    } else {
        None
    };

    Ok((
        user_reputation,
        total_pledge_idea_info,
        total_pledge_feature_info,
    ))
}

/// Apply updates to the database
fn apply_updates(updates: Vec<(String, Key, SetDoc)>) -> Result<(), String> {
    let creator = Principal::from_text("rfamr-niaaa-aaaam-acmta-cai").unwrap();

    for (collection, key, set_doc) in updates {
        set_doc_store(creator, collection, key, set_doc)
            .map_err(|err| return format!("Failed to update document: {}", err))?;
    }
    Ok(())
}
/// Validate user's balance
/// TODO: Validate balance

#[update]
pub async fn validate_user_balance_or_delete_pledge(
    user_id: String,
    amount: u64,
    pledge_id: String,
) -> Result<(), String> {
    let balance = match get_available_balance_without_pledged_amount(user_id.clone(), amount).await
    {
        Ok(balance) => balance,
        Err(err) => {
            return Err(format!("Failed to fetch balance: {}", err));
        }
    };
    let username = get_user_username(user_id.clone());
    if balance < amount {
        log(format!("User {} has not sufficient funds!", username));
        delete_pledge(pledge_id.to_string());
        return Err("User has insufficient funds.".to_string());
    }
    Ok(())
}

/// Calculate expected amount
/// TODO: Get highest payment ever from the escrow.
fn calculate_expected_amount(
    caller: &Principal,
    amount: u64,
    user_reputation: u64,
) -> Result<u64, String> {
    let expected_given_reputation = (amount * user_reputation) / 100;
    // let highest_amount_paid = get_highest_payment_ever(caller.to_text())
    //     .map_err(|err| format!("Failed to fetch highest payment: {}", err))?;
    // Ok(expected_given_reputation.min(highest_amount_paid))
    return Ok((expected_given_reputation));
}

// Stubbed functions
//TODO: Update payment counter
fn update_pledges_counter(_doc_key: &str, _amount: u64) -> Result<(), String> {
    // TODO: Implement pledges counter update
    Ok(())
}

fn update_user_pledge_list(
    mut user_pledge_list: Vec<PledgeUser>,
    new_pledge: PledgeUser,
) -> Vec<PledgeUser> {
    let mut updated = false;

    for pledge in &mut user_pledge_list {
        if pledge.user == new_pledge.user {
            pledge.amount_pledged += new_pledge.amount_pledged;
            pledge.amount_paid += new_pledge.amount_paid;
            updated = true;
            break;
        }
    }

    if !updated {
        user_pledge_list.push(new_pledge);
    }

    user_pledge_list
}

fn create_pledge_active(
    doc_key: &str,
    idea_id: &str,
    feature_id: &str,
    amount: u64,
    expected_amount: u64,
    caller: &Principal,
    docs: &[(String, Option<Doc>)],
) -> Result<(String, String, SetDoc), String> {
    // Check if feature_id is empty
    if feature_id.trim().is_empty() {
        return Err("Feature ID is required for pledging".to_string());
    }

    let owner = match get_doc_owner("feature".to_string(), feature_id.to_string()) {
        Ok(doc_owner) => doc_owner,
        Err(err) => return Err(err),
    };
    let target = owner;

    let pledge = PledgeData {
        amount,
        doc_key: doc_key.to_string(),
        expected_amount,
        feature_id: Some(feature_id.to_string()), // Always Some since we validated it's not empty
        idea_id: idea_id.to_string(),
        target,
        user: caller.to_text(),
        status: "active".to_string(),
        amount_paid: 0,
        payment_type: "Crypto".to_string(),
    };

    // Encode the pledge data
    let data = encode_doc_data(&pledge)
        .map_err(|err| return format!("Failed to encode pledge data: {}", err))?;

    Ok((
        "pledges_active".to_string(),
        doc_key.to_string(),
        SetDoc {
            data,
            description: Some(format!(
                "pledger:{} _amount:{} _idea:{} _feature:{}",
                caller.to_text(),
                amount,
                idea_id,
                feature_id
            )),
            version: Some(1),
        },
    ))
}

fn send_pledge_notifications(
    caller: &Principal,
    idea_id: &str,
    feature_id: Option<&str>,
    amount: u64,
) -> Result<(), String> {
    let user_id = Principal::to_text(caller);
    let topic_title = match get_element_enriched_data("idea".to_string(), idea_id.to_string()) {
        Ok(topic) => topic.title,
        Err(err) => "Unknown topic".to_string(),
    };
    let username = get_user_username(user_id.clone());
    let image = get_user_profile_pic(user_id.clone());
    let amount_string = format!("{:.1}", amount as f64 / 100_000_000.0);
    let title = "New pledge!".to_string();
    let subtitle_idea = format!(
        "{} has pledged {} ICP into the topic: {}",
        username.clone(),
        amount_string.clone(),
        topic_title.clone()
    );
    let description = format!(
        "{} has pledged {} ICP into the topic: {}",
        username.clone(),
        amount_string.clone(),
        topic_title.clone()
    );
    let type_of = "Pledge".to_string();
    let link_url_feature = match feature_id {
        None => idea_id.to_string().clone(),
        Some(feature) => feature.to_string().clone(),
    };
    let link_url_idea = idea_id.to_string().clone();
    let sender = user_id.clone();
    let idea_owner_notification: Notification = Notification {
        title: title.clone(),
        subtitle: subtitle_idea.clone(),
        imageURL: image.clone(),
        linkURL: link_url_idea.clone(),
        sender: user_id.clone(),
        description: description.clone(),
        typeOf: type_of.clone(),
        read: false,
    };
    let idea_owner = match get_doc_owner("idea".to_string(), idea_id.to_string()) {
        Ok(owner) => owner,
        Err(err) => idea_id.to_string().clone(),
    };
    send_single_notification(user_id.clone(), idea_owner, idea_owner_notification);

    match feature_id {
        None => {}
        Some(feature) => {
            let feature_title =
                match get_element_enriched_data("feature".to_string(), feature.to_string()) {
                    Ok(feature) => feature.title,
                    Err(err) => "Unknown idea".to_string(),
                };

            let subtitle_feature = format!(
                "{} has pledged {} ICP into the idea: {}",
                username.clone(),
                amount_string.clone(),
                feature_title.clone()
            );
            let description_feature = format!(
                "{} has pledged {} ICP into the idea: {}",
                username.clone(),
                amount_string.clone(),
                feature_title.clone()
            );
            let feature_owner_notification: Notification = Notification {
                title: title.clone(),
                subtitle: subtitle_feature.clone(),
                imageURL: image.clone(),
                linkURL: link_url_feature.clone(),
                sender: user_id.clone(),
                description: description_feature.clone(),
                typeOf: type_of.clone(),
                read: false,
            };
            let feature_owner = match get_doc_owner("feature".to_string(), feature.to_string()) {
                Ok(owner) => owner,
                Err(err) => feature.to_string().clone(),
            };
            send_single_notification(user_id.clone(), feature_owner, feature_owner_notification);
        }
    };

    Ok(())
}

fn decode_total_pledging(data: &[u8]) -> Result<TotalPledging, String> {
    decode_doc_data::<TotalPledging>(data)
}
