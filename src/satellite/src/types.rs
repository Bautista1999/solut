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
    pub struct TotalPledging {
        pub pledges: u64,  // Total amount pledged for this idea or feature
        pub expected: u64, // Expected amount based on the pledges
    }
}
