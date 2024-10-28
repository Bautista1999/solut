pub mod interface {
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
}
