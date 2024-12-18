pub mod interface {
    use bytes::Bytes;
    use candid::CandidType; // Renaming the Candid `Deserialize`
    use candid::{Int, Principal}; // Candid for Internet Computer serialization
    use serde::{Deserialize, Serialize}; // Renaming the Serde `Deserialize`
    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct Product {
        pub name: String,
        pub description: String,
        pub owner: Option<Principal>,
        pub company: Option<String>,
        pub score: Option<Score>,
        pub link: String,
        pub image: Option<String>,
    }
    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct Score(u8); // u8 ensures the value is between 0 and 255

    impl Score {
        // Create a constructor to enforce the 0-100 range
        pub fn new(value: u8) -> Result<Self, String> {
            if value <= 100 {
                Ok(Score(value))
            } else {
                Err(format!("Score must be between 0 and 100, got: {}", value))
            }
        }

        // Getter to retrieve the inner value
        pub fn value(&self) -> u8 {
            self.0
        }
    }
    #[derive(Default, CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct PledgeData {
        pub amount: u64,
        pub doc_key: String,
        pub expected_amount: u64,
        pub feature_id: Option<String>, // Feature might be optional
        pub idea_id: String,
        pub target: String,
        pub user: String,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct PledgeUser {
        pub amount_pledged: u64, // Amount the user has pledged
        pub amount_paid: u64,    // Amount the user has paid
        pub user: String,        // The user (as a principal or a string)
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct Topic {
        pub title: String,
        pub subtitle: String,
        pub description: String,
        pub images: Vec<String>,
        pub videos: Vec<String>,
        pub categories: Vec<String>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct Idea {
        pub title: String,
        pub subtitle: String,
        pub description: String,
        pub images: Vec<String>,
        pub videos: Vec<String>,
        pub categories: Vec<String>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct Solution {
        pub title: String,
        pub subtitle: String,
        pub description: String,
        pub images: Vec<String>,
        pub videos: Vec<String>,
        pub categories: Vec<String>,
        pub features: Vec<String>,
        pub milestones: Vec<Milestone>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct Milestone {
        pub id: u64,
        pub title: String,
        pub date: u64,
        pub description: String,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct SolutionApproved {
        pub status: String, // e.g., "PENDING" or "APPROVED"
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct SolutionStatus {
        pub status: String, // e.g., "PROPOSAL", "APPROVED", etc.
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct SetIdea {
        pub key: String,
        pub idea: Idea, // Reference to the `Idea` struct
    }

    // IndexSearch data structure for the index_search collection
    #[derive(Default, CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct IndexSearch {
        pub title: String,
        pub subtitle: String,
        pub images: Vec<String>,
        pub videos: Vec<String>,
        pub element_id: String,
        pub element_type: String,
    }

    // TotalPledging data structure for the idea_feature_pledge collection
    #[derive(Default, CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct TotalPledging {
        pub pledges: u64,  // Total amount pledged for this idea or feature
        pub expected: u64, // Expected amount based on the pledges
    }

    // IdeaRevenueCounter data structure for the idea_revenue_counter collection
    #[derive(Default, CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct IdeaRevenueCounter {
        pub total_revenue: u64,
    }

    // Followers is a simple u32 for follower count
    pub type Followers = u32;

    //TODO: Notification's fields should have snake_case (e.g. imageURL ==> image_url).
    //      We are not doing it, because this brings complications on the front end at the time.
    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct Notification {
        pub title: String,
        pub subtitle: String,
        pub imageURL: String,
        pub linkURL: String,
        pub sender: String,
        pub description: String,
        pub typeOf: String,
        pub read: bool,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct User {
        pub username: String,
        pub profilePicture: String,
        pub images: Vec<String>,
        pub videos: Vec<String>,
        pub country: String,
        pub sex: String,
        pub categories: Vec<String>,
        pub description: String,
        pub xAccount: String,
        pub GitHubAccount: String,
        pub instaAccount: String,
        pub linkedInAccount: String,
        pub linkPage: String,
        pub otherlinks: Vec<String>,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct FollowData {
        pub follower: String,  // ID of the follower
        pub following: String, // ID of the entity being followed
        pub r#type: String, // Type of the followed entity (e.g., "idea", "topic", "solution", "user")
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct IndexResponse {
        pub element_id: String,      // Unique ID for the element
        pub title: String, // Title or username (e.g., "Blockchain for Healthcare" or "juanbautista")
        pub subtitle: String, // Subtitle or short description (e.g., "Improving healthcare data sharing" or "Web3 Developer")
        pub description: String, // Detailed description
        pub profile_image: String, // Profile image or main image URL
        pub creation_date: u64, // Creation date (for topics/ideas; not applicable to users)
        pub total_pledged: u64, // Total pledged amount
        pub total_followers: u64, // Total follower count
        pub reputation: Option<u64>, // Reputation (only for users)
        pub element_type: String, // Type of element (e.g., "topic", "idea", "user")
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct IndexResponseBasicInfo {
        pub element_id: String,    // Unique ID for the element
        pub title: String, // Title or username (e.g., "Blockchain for Healthcare" or "juanbautista")
        pub profile_image: String, // Profile image or main image URL
        pub creation_date: u64, // Creation date (for topics/ideas; not applicable to users)
        pub element_type: String, // Type of element (e.g., "topic", "idea", "user")
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct UserProfileBasicInfo {
        pub username: String,
        pub profile_picture: String,
        pub user_id: String,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Debug, Clone)]
    pub struct UserBasicInfo {
        pub user_id: String,
        pub username: String,
        pub profile_picture: String,
        pub background_image: String,
        pub description: String,
        pub followers_count: u64,
        pub followings_count: u64,
        pub total_pledged: u64,
        pub active_pledged: u64,
        pub reputation: u64,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Debug, Clone)]
    pub struct Activity {
        pub creator_username: String,
        pub creator_id: String,
        pub profile_image: String,
        pub activity_image: Option<String>, // Optional image (None for pledges)
        pub activity_title: String,         // Title of the topic, idea, or solution
        pub created_at: u64,                // Timestamp of activity creation
        pub description: String,            // Description message for the activity
        pub element_id: String,             // The element ID
        pub element_type: String,           // "topic", "idea", "solution", or "pledge"
        pub link: String,                   // Link for navigation
    }
}
