pub mod images {
    // Default images for various use cases
    pub const DEFAULT_LINK_PREVIEW_IMAGE: &str =
        "https://solutio.one/solutio-images/LogoSolutio_Wide_Orange_Black.png";
    pub const DEFAULT_SEARCH_RESULT_IMAGE: &str =
        "https://solutio.one/solutio-images/LogoSolutio_Wide_Orange_Black.png";
    pub const DEFAULT_PROFILE_IMAGE: &str = "https://solutio.one/solutio-images/logo-01.png";

    // Image constraints
    pub const MAX_IMAGE_SIZE_BYTES: usize = 2 * 1024 * 1024; // 2MB
    pub const MAX_IMAGES_PER_IDEA: usize = 5;
}

pub mod currency {
    // Currency configurations
    pub const DEFAULT_CURRENCY: &str = "ICP";
    pub const SUPPORTED_CURRENCIES: &[&str] = &["ICP", "USDC"];
    pub const DEFAULT_DECIMAL_PLACES: u8 = 8; // For ICP

    // Minimum amounts
    pub const MIN_PLEDGE_AMOUNT: u64 = 1_000_000; // 0.01 ICP in e8s
}

pub mod limits {
    // Text length limits
    pub const MAX_TITLE_LENGTH: usize = 70;
    pub const MAX_SUBTITLE_LENGTH: usize = 200;
    pub const MAX_DESCRIPTION_LENGTH: usize = 3000;
}

pub mod time {
    // Time-related constants (in seconds)
    pub const DEFAULT_CACHE_DURATION: u64 = 3600; // 1 hour
    pub const SCHEDULED_TASK_INTERVAL: u64 = 86_400; // 24 hours
}

pub mod urls {
    // Base URLs
    pub const FRONTEND_BASE_URL: &str = "https://solutio.one";
    pub const API_BASE_URL: &str = "https://api.solutio.one";
    pub const ASSETS_BASE_URL: &str = "https://assets.solutio.one";
}
