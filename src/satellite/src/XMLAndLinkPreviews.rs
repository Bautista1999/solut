use crate::types::interface::{MetaTagsInput, MetaTagsResult};
use crate::user_information::get_user_username;
use candid::{CandidType, Principal};
use chrono::{DateTime, TimeZone, Utc};
use ic_cdk::api::caller;
use ic_cdk::api::management_canister::http_request::{HttpResponse, TransformArgs};
use ic_cdk_macros::*;
use junobuild_satellite::{delete_asset_store, get_doc_store, list_docs_store, set_asset_handler};
use junobuild_shared::types::list::ListResults;
use junobuild_shared::types::list::{ListMatcher, ListParams};
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

#[update]
pub fn generate_sitemap() -> Result<String, String> {
    // Start XML with static URLs
    let mut sitemap = String::from(
        r#"<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>https://solutio.one</loc>
<lastmod>2024-09-18T19:39:50+00:00</lastmod>
<priority>1</priority>
</url>"#,
    );

    // Function to format a URL entry
    fn format_url_entry(path_type: &str, id: &str, last_modified: u64) -> String {
        // Simple direct formatting approach - convert timestamp to ISO date
        // Using a fixed date format for simplicity - will always return a date
        let timestamp_millis = last_modified / 1_000_000; // Convert nanos to millis
        let timestamp_secs = timestamp_millis / 1000; // Convert to seconds

        // Use a fixed current date if timestamp is obviously wrong
        let iso_date = if timestamp_secs < 1000000000 || timestamp_secs > 2000000000 {
            "2024-09-20T00:00:00Z".to_string() // Fallback to fixed date if timestamp is invalid
        } else {
            // Convert from IC timestamp to DateTime using chrono without now()
            let dt = Utc
                .timestamp_opt(timestamp_secs as i64, 0)
                .single()
                .unwrap();
            dt.format("%Y-%m-%dT%H:%M:%SZ").to_string()
        };

        format!(
            r#"
<url>
<loc>https://solutio.one/{}/{}</loc>
<lastmod>{}</lastmod>
<priority>0.8</priority>
</url>"#,
            path_type, id, iso_date
        )
    }

    // Create empty filter params
    let filter = ListParams {
        order: None,
        owner: None,
        matcher: None,
        paginate: None,
    };

    // Get topics (stored as "idea" collection)
    let topics_result = list_docs_store(caller(), "idea".to_string(), &filter)?;
    for (key, doc) in topics_result.items {
        sitemap.push_str(&format_url_entry("topic", &key, doc.updated_at));
    }

    // Get ideas (stored as "feature" collection)
    let ideas_result = list_docs_store(caller(), "feature".to_string(), &filter)?;
    for (key, doc) in ideas_result.items {
        sitemap.push_str(&format_url_entry("idea", &key, doc.updated_at));
    }

    // Get solutions
    let solutions_result = list_docs_store(caller(), "solution".to_string(), &filter)?;
    for (key, doc) in solutions_result.items {
        sitemap.push_str(&format_url_entry("solution", &key, doc.updated_at));
    }

    // Get users
    let users_result = list_docs_store(caller(), "user".to_string(), &filter)?;
    for (key, doc) in users_result.items {
        sitemap.push_str(&format_url_entry("profile", &key, doc.updated_at));
    }

    // Close the XML
    sitemap.push_str("\n</urlset>");

    // Create the asset key for sitemap.xml
    let key = AssetKey {
        name: "sitemap.xml".to_string(),
        full_path: "/solutio-files/sitemap.xml".to_string(),
        token: None,
        collection: "solutio-files".to_string(),
        owner: caller(),
        description: Some("Sitemap XML file".to_string()),
    };

    // Create headers for XML content
    let headers = vec![
        HeaderField("Content-Type".to_string(), "application/xml".to_string()),
        HeaderField(
            "Cache-Control".to_string(),
            "public, max-age=3600".to_string(),
        ),
    ];

    // Convert string to Vec<u8>
    let sitemap_bytes: Vec<u8> = sitemap.clone().into_bytes();

    // Upload the sitemap using set_asset_handler
    match set_asset_handler(&key, &sitemap_bytes, &headers) {
        Ok(_) => Ok(sitemap.clone()),
        Err(e) => Err(format!("Failed to upload sitemap: {}", e)),
    }
}
