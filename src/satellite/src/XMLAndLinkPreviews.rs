use crate::types::interface::{MetaTagsInput, MetaTagsResult};
use crate::user_information::get_user_username;
use candid::{CandidType, Principal};
use ic_cdk::api::caller;
use ic_cdk::api::management_canister::http_request::{HttpResponse, TransformArgs};
use ic_cdk_macros::*;
use junobuild_satellite::{delete_asset_store, get_doc_store, set_asset_handler};
use junobuild_storage::http::types::HeaderField;
use junobuild_storage::types::store::AssetKey;
use junobuild_utils::decode_doc_data;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::fmt;

// Function to create metatags similar to metadataTagsCreator in JavaScript
#[update]
pub fn create_metatags(input: MetaTagsInput) -> MetaTagsResult {
    let MetaTagsInput {
        title,
        description,
        image,
        content_type,
        url,
        user,
    } = input;

    // Build HTML with metatags matching the JavaScript template
    let html = format!(
        r#"<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="description" content="{description}" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:image" content="{image}" />
  <meta property="og:type" content="{content_type}" />
  <meta property="og:url" content="{url}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{description}" />
  <meta name="twitter:image" content="{image}" />
  <meta name="twitter:creator" content="{user}" />
  <title>{title}</title>
  <meta name="author" content="{user}" />
</head>
<body>
  <noscript>Please enable JavaScript to view the full content.</noscript>

  <div id="app"></div> 

  <script>
    // This JavaScript will load the full Svelte app for users
    window.onload = function() {{
      // Load the full Svelte app dynamically
      if (!window.navigator.userAgent.includes("bot") && !window.navigator.userAgent.includes("crawler")) {{
        const currentUrl = window.location.href;
        if (!currentUrl.endsWith('/')) {{
          window.location.href = currentUrl + '/'; // Redirect to URL with trailing slash
        }}
      }}
    }}
  </script>
</body>
</html>"#
    );

    MetaTagsResult {
        html,
        success: true,
        error: None,
    }
}

// Function to upload HTML to asset storage using Juno's set_asset_handler
#[update]
pub fn upload_html_to_storage(
    html: String,
    collection: String,
    id: String,
) -> Result<String, String> {
    // Convert the HTML string to a blob
    let content = (html.into_bytes());

    // Create the asset key
    let key = AssetKey {
        name: id.clone(),
        full_path: format!("/{}/{}.html", collection, id),
        token: None,
        collection,
        owner: caller(),
        description: Some(format!("HTML metatags for {}", id)),
    };

    // Create headers for HTML content
    let headers = vec![
        HeaderField("Content-Type".to_string(), "text/html".to_string()),
        HeaderField(
            "Cache-Control".to_string(),
            "public, max-age=3600".to_string(),
        ),
    ];

    // Upload the asset
    match set_asset_handler(&key, &content, &headers) {
        Ok(_) => Ok(format!("HTML stored for {}/{}.html", key.collection, id)),
        Err(e) => Err(format!("Failed to upload HTML: {}", e)),
    }
}

// Utility function to create and upload HTML
#[update]
pub fn create_and_upload_html(
    input: MetaTagsInput,
    collection: String,
    id: String,
) -> Result<String, String> {
    // Create the metatags
    let metatags_result = create_metatags(input);

    if !metatags_result.success {
        return Err(metatags_result
            .error
            .unwrap_or("Unknown error creating metatags".to_string()));
    }

    // Upload to storage
    upload_html_to_storage(metatags_result.html, collection, id)
}
#[update]
pub fn create_or_update_html_metatags(content_type: String, id: String) -> Result<(), String> {
    let caller = caller();

    let database_type = match content_type.as_str() {
        "topic" | "topics" => "idea".to_string(),
        "idea" | "ideas" => "feature".to_string(),
        "solution" | "solutions" => "solution".to_string(),
        _ => content_type.clone(),
    };
    // Get the document from the specified collection
    let element_doc = match get_doc_store(caller, database_type.clone(), id.clone()) {
        Ok(Some(doc)) => doc,
        Ok(None) => return Err(format!("{} with ID {} not found", content_type, id)),
        Err(e) => return Err(format!("Error fetching document: {}", e)),
    };

    // Parse the document data using decode_doc_data
    let json_data = match decode_doc_data::<serde_json::Value>(&element_doc.data) {
        Ok(data) => data,
        Err(e) => return Err(format!("Error decoding document data: {}", e)),
    };

    // Extract common fields based on document type
    let title = json_data
        .get("title")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .unwrap_or_else(|| format!("Solutio - {}", content_type));

    let description = json_data
        .get("subtitle")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .unwrap_or_else(|| format!("Check out this {} on Solutio", content_type));

    // Get the first image or use a default
    let image = json_data
        .get("images")
        .and_then(|v| v.as_array())
        .and_then(|arr| arr.first())
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .unwrap_or_else(|| "https://solutio.one/solutio-images/logo-01.png".to_string());

    // Determine the element type for URL construction
    let element_type = match content_type.as_str() {
        "topic" | "topics" => "topic",
        "idea" | "ideas" => "idea",
        "solution" | "solutions" => "solution",
        _ => content_type.as_str(),
    };
    let user_id_text = Principal::to_text(&element_doc.owner);
    let user_name = get_user_username(user_id_text);
    // Create the input for metatags
    let input = MetaTagsInput {
        title,
        description,
        image,
        content_type: element_type.to_string(),
        url: format!("https://solutio.one/{}/{}", element_type, id),
        user: user_name,
    };

    // Create and upload HTML
    match create_and_upload_html(input, content_type.clone().to_string(), id) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to create and upload HTML: {}", e)),
    }
}
