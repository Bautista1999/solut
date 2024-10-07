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
}
