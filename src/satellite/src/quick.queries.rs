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
