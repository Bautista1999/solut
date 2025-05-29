<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { 
        getPaginatedTopicsIdeas,
        getPaginatedMostRecentActivities,
        getPaginatedIdeas,
        getPaginatedTopics
    } from "../../declarations/satellite/satellite.api";
    import { getUserKey } from "$lib/data_functions/get_functions";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    
    // Components
    import ActivityPost from "$lib/components/ActivityPost.svelte";
    import CardPreview from "$lib/components/CardPreview.svelte";
    import SearchBar from "$lib/components/SearchBar.svelte";
    import MagicalDots from "$lib/components/magicalDots.svelte";
    import LoadingNew from "$lib/components/LoadingNew.svelte";
    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";

    // State variables
    let isSignedIn = false;
    let userKey = "";
    let isLoading = true;
    let selectedTab = "all"; // all, ideas, topics, solutions, activities
    let selectedSort = "most_recent"; // most_recent, most_pledged, most_followed
    
    // Data arrays
    /**
     * @type {Array<import("../../declarations/satellite/satellite.did").Activity>}
     */
    let recentActivities = [];
    
    /**
     * @type {Array<import("../../declarations/satellite/satellite.did").IndexResponse>}
     */
    let trendingContent = [];
    
    /**
     * @type {Array<import("../../declarations/satellite/satellite.did").IndexResponse>}
     */
    let feedContent = [];

    // Pagination
    let currentPage = 0;
    let itemsPerPage = 12;
    let totalPages = 0;
    let hasMoreContent = true;

    // Tab options
    const tabOptions = [
        { value: "all", label: "All Content", icon: "dashboard" },
        { value: "ideas", label: "Ideas", icon: "lightbulb" },
        { value: "topics", label: "Topics", icon: "topic" },
        { value: "activities", label: "Recent Activity", icon: "timeline" }
    ];

    // Sort options
    const sortOptions = [
        { value: "most_recent", label: "Most Recent" },
        { value: "most_pledged", label: "Most Pledged" },
        { value: "most_followed", label: "Most Followed" }
    ];

    onMount(async () => {
        isLoading = true;
        
        // Check if user is signed in
        try {
            isSignedIn = await CheckIfSignedIn();
            if (isSignedIn) {
                userKey = await getUserKey();
            }
        } catch (error) {
            console.error("Authentication check failed:", error);
            isSignedIn = false;
        }

        // Load initial content
        await loadFeedContent();
        await loadTrendingContent();
        
        if (isSignedIn && userKey) {
            await loadRecentActivities();
        }
        
        isLoading = false;
    });

    async function loadFeedContent() {
        try {
            let result;
            const offset = currentPage * itemsPerPage;
            
            switch (selectedTab) {
                case "ideas":
                    result = await getPaginatedIdeas(selectedSort, [offset], [itemsPerPage], [], []);
                    break;
                case "topics":
                    result = await getPaginatedTopics(selectedSort, [offset], [itemsPerPage], []);
                    break;
                case "all":
                default:
                    result = await getPaginatedTopicsIdeas(selectedSort, [offset], [itemsPerPage], []);
                    break;
            }

            if ("Ok" in result) {
                feedContent = result.Ok[0] || [];
                totalPages = Number(result.Ok[2]) || 0;
                hasMoreContent = (currentPage + 1) < totalPages;
            } else {
                console.error("Error loading feed content:", result.Err);
                feedContent = [];
            }
        } catch (error) {
            console.error("Failed to load feed content:", error);
            feedContent = [];
        }
    }

    async function loadTrendingContent() {
        try {
            const result = await getPaginatedTopicsIdeas("most_pledged", [0], [6], []);
            
            if ("Ok" in result) {
                trendingContent = result.Ok[0] || [];
            } else {
                console.error("Error loading trending content:", result.Err);
                trendingContent = [];
            }
        } catch (error) {
            console.error("Failed to load trending content:", error);
            trendingContent = [];
        }
    }

    async function loadRecentActivities() {
        if (!userKey) return;
        
        try {
            const result = await getPaginatedMostRecentActivities(userKey, [0], [8]);
            
            if ("Ok" in result) {
                recentActivities = result.Ok[0] || [];
            } else {
                console.error("Error loading recent activities:", result.Err);
                recentActivities = [];
            }
        } catch (error) {
            console.error("Failed to load recent activities:", error);
            recentActivities = [];
        }
    }

    async function handleTabChange(tab) {
        if (selectedTab === tab) return;
        
        selectedTab = tab;
        currentPage = 0;
        isLoading = true;
        
        if (tab === "activities") {
            await loadRecentActivities();
        } else {
            await loadFeedContent();
        }
        
        isLoading = false;
    }

    async function handleSortChange() {
        currentPage = 0;
        isLoading = true;
        await loadFeedContent();
        isLoading = false;
    }

    async function loadMoreContent() {
        if (!hasMoreContent || isLoading) return;
        
        currentPage++;
        isLoading = true;
        
        try {
            let result;
            const offset = currentPage * itemsPerPage;
            
            switch (selectedTab) {
                case "ideas":
                    result = await getPaginatedIdeas(selectedSort, [offset], [itemsPerPage], [], []);
                    break;
                case "topics":
                    result = await getPaginatedTopics(selectedSort, [offset], [itemsPerPage], []);
                    break;
                case "all":
                default:
                    result = await getPaginatedTopicsIdeas(selectedSort, [offset], [itemsPerPage], []);
                    break;
            }

            if ("Ok" in result) {
                const newContent = result.Ok[0] || [];
                feedContent = [...feedContent, ...newContent];
                hasMoreContent = (currentPage + 1) < Number(result.Ok[2]);
            }
        } catch (error) {
            console.error("Failed to load more content:", error);
            currentPage--; // Revert page increment on error
        }
        
        isLoading = false;
    }

    function navigateToCreate() {
        goto("/createtopic");
    }

    function navigateToExplore() {
        goto("/");
    }
</script>

<main class="feed-container">
    <!-- Header Section -->
    <section class="feed-header">
        <div class="header-content">
            <h1>
                <span class="material-symbols-outlined">dynamic_feed</span>
                Your Feed
            </h1>
            <p>Discover the latest ideas, solutions, and activities from the Solutio community</p>
            
            {#if !isSignedIn}
                <div class="signin-prompt">
                    <p>Sign in to see personalized content and your activity feed</p>
                    <BasicButtonDark 
                        msg="Sign In" 
                        icon="login"
                        someFunction={() => goto("/signin")}
                    />
                </div>
            {/if}
        </div>
    </section>

    <!-- Navigation Tabs -->
    <section class="feed-navigation">
        <div class="tabs-container">
            {#each tabOptions as tab}
                <button
                    class="tab-button {selectedTab === tab.value ? 'active' : ''}"
                    on:click={() => handleTabChange(tab.value)}
                >
                    <span class="material-symbols-outlined">{tab.icon}</span>
                    {tab.label}
                </button>
            {/each}
        </div>

        {#if selectedTab !== "activities"}
            <div class="sort-container">
                <label for="sort-select">Sort by:</label>
                <select id="sort-select" bind:value={selectedSort} on:change={handleSortChange}>
                    {#each sortOptions as option}
                        <option value={option.value}>{option.label}</option>
                    {/each}
                </select>
            </div>
        {/if}
    </section>

    <!-- Main Content -->
    <div class="feed-layout">
        <!-- Sidebar with Trending Content -->
        {#if selectedTab !== "activities"}
            <aside class="sidebar">
                <div class="trending-section">
                    <h3>
                        <span class="material-symbols-outlined">trending_up</span>
                        Trending Now
                    </h3>
                    
                    {#if trendingContent.length > 0}
                        <div class="trending-grid">
                            {#each trendingContent as item}
                                <div class="trending-item">
                                    <a href="/{item.element_type}/{item.element_id}" class="trending-link">
                                        <img src={item.profile_image} alt={item.title} class="trending-image" />
                                        <div class="trending-info">
                                            <h4>{item.title}</h4>
                                            <p>{item.subtitle?.substring(0, 80)}...</p>
                                            <div class="trending-stats">
                                                <span class="pledged">{(Number(item.total_pledged) / 100000000).toFixed(1)} ICP</span>
                                                <span class="followers">{item.total_followers} followers</span>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <p>No trending content available</p>
                    {/if}

                    <div class="sidebar-actions">
                        <BasicButtonDark 
                            msg="Explore All" 
                            icon="explore"
                            someFunction={navigateToExplore}
                        />
                        <BasicButtonDark 
                            msg="Create Idea" 
                            icon="add"
                            someFunction={navigateToCreate}
                        />
                    </div>
                </div>
            </aside>
        {/if}

        <!-- Main Feed Content -->
        <main class="main-content {selectedTab === 'activities' ? 'full-width' : ''}">
            {#if isLoading && feedContent.length === 0 && recentActivities.length === 0}
                <div class="loading-container">
                    <LoadingNew message="Loading your feed..." />
                </div>
            {:else if selectedTab === "activities"}
                <!-- Activities Feed -->
                <div class="activities-container">
                    <h2>Recent Activities</h2>
                    {#if recentActivities.length > 0}
                        <div class="activities-list">
                            {#each recentActivities as activity}
                                <ActivityPost {activity} />
                            {/each}
                        </div>
                    {:else}
                        <div class="empty-state">
                            <span class="material-symbols-outlined">timeline</span>
                            <h3>No Recent Activities</h3>
                            <p>Your activities will appear here as you interact with ideas and solutions.</p>
                            {#if !isSignedIn}
                                <BasicButtonDark 
                                    msg="Sign In to See Activities" 
                                    icon="login"
                                    someFunction={() => goto("/signin")}
                                />
                            {/if}
                        </div>
                    {/if}
                </div>
            {:else}
                <!-- Content Feed -->
                <div class="content-container">
                    {#if feedContent.length > 0}
                        <div class="content-grid">
                            {#each feedContent as item}
                                <CardPreview idea={item} />
                            {/each}
                        </div>

                        <!-- Load More Button -->
                        {#if hasMoreContent}
                            <div class="load-more-container">
                                <BasicButtonDark 
                                    msg={isLoading ? "Loading..." : "Load More"}
                                    icon={isLoading ? "hourglass_empty" : "expand_more"}
                                    someFunction={loadMoreContent}
                                />
                            </div>
                        {/if}
                    {:else}
                        <div class="empty-state">
                            <span class="material-symbols-outlined">
                                {selectedTab === "ideas" ? "lightbulb" : selectedTab === "topics" ? "topic" : "dashboard"}
                            </span>
                            <h3>No {selectedTab} Found</h3>
                            <p>Be the first to contribute to the community!</p>
                            <BasicButtonDark 
                                msg="Create {selectedTab === 'ideas' ? 'Idea' : 'Topic'}" 
                                icon="add"
                                someFunction={navigateToCreate}
                            />
                        </div>
                    {/if}
                </div>
            {/if}
        </main>
    </div>
</main>

<svelte:head>
    <meta name="twitter:card" content="summary" />
    <meta charset="utf-8" />
    <title>Feed - Solutio</title>
    <meta name="description" content="Discover the latest ideas, solutions, and activities from the Solutio community" />
</svelte:head>

<style>
    .feed-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
    }

    .feed-header {
        text-align: center;
        margin-bottom: 40px;
        padding: 40px 20px;
        background: linear-gradient(135deg, var(--primary-color), var(--sixth-color));
        border-radius: 12px;
        color: var(--tertiary-color);
    }

    .header-content h1 {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-bottom: 10px;
        font-size: 2.5em;
        font-weight: 600;
    }

    .header-content p {
        font-size: 1.2em;
        margin-bottom: 20px;
        opacity: 0.9;
    }

    .signin-prompt {
        background: rgba(255, 255, 255, 0.1);
        padding: 20px;
        border-radius: 8px;
        margin-top: 20px;
    }

    .signin-prompt p {
        margin-bottom: 15px;
    }

    .feed-navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding: 20px;
        background: var(--tertiary-color);
        border-radius: 12px;
        border: 1px solid var(--forth-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .tabs-container {
        display: flex;
        gap: 5px;
    }

    .tab-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: var(--forth-color);
        border: 1px solid var(--ninth-color);
        border-radius: 8px;
        color: var(--secondary-color);
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: 'Barlow';
        font-size: 14px;
        font-weight: 500;
    }

    .tab-button:hover {
        background: var(--fifth-color);
        border-color: var(--primary-color);
    }

    .tab-button.active {
        background: var(--primary-color);
        color: var(--tertiary-color);
        border-color: var(--primary-color);
    }

    .sort-container {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .sort-container label {
        font-weight: 500;
        color: var(--secondary-color);
    }

    .sort-container select {
        padding: 8px 12px;
        border: 1px solid var(--ninth-color);
        border-radius: 6px;
        font-family: 'Barlow';
        background: var(--tertiary-color);
        color: var(--secondary-color);
        cursor: pointer;
    }

    .sort-container select:focus {
        outline: none;
        border-color: var(--primary-color);
    }

    .feed-layout {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 30px;
        align-items: start;
    }

    .sidebar {
        position: sticky;
        top: 20px;
    }

    .trending-section {
        background: var(--tertiary-color);
        border-radius: 12px;
        padding: 20px;
        border: 1px solid var(--forth-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .trending-section h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
        color: var(--secondary-color);
        font-size: 1.3em;
    }

    .trending-grid {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-bottom: 20px;
    }

    .trending-item {
        border-radius: 8px;
        overflow: hidden;
        transition: transform 0.2s ease;
    }

    .trending-item:hover {
        transform: translateY(-2px);
    }

    .trending-link {
        display: flex;
        gap: 12px;
        padding: 12px;
        background: var(--forth-color);
        border-radius: 8px;
        text-decoration: none;
        color: inherit;
        transition: background 0.2s ease;
    }

    .trending-link:hover {
        background: var(--fifth-color);
    }

    .trending-image {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 6px;
        flex-shrink: 0;
    }

    .trending-info {
        flex: 1;
        min-width: 0;
    }

    .trending-info h4 {
        margin: 0 0 5px 0;
        font-size: 14px;
        font-weight: 600;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .trending-info p {
        margin: 0 0 8px 0;
        font-size: 12px;
        color: var(--eigth-color);
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .trending-stats {
        display: flex;
        gap: 10px;
        font-size: 11px;
        color: var(--primary-color);
        font-weight: 500;
    }

    .sidebar-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .main-content {
        min-height: 400px;
    }

    .main-content.full-width {
        grid-column: 1 / -1;
        max-width: 800px;
        margin: 0 auto;
    }

    .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 300px;
    }

    .content-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .activities-container {
        background: var(--tertiary-color);
        border-radius: 12px;
        padding: 30px;
        border: 1px solid var(--forth-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .activities-container h2 {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 25px;
        color: var(--secondary-color);
    }

    .activities-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .load-more-container {
        display: flex;
        justify-content: center;
        margin-top: 30px;
    }

    .empty-state {
        text-align: center;
        padding: 60px 20px;
        background: var(--tertiary-color);
        border-radius: 12px;
        border: 1px solid var(--forth-color);
    }

    .empty-state .material-symbols-outlined {
        font-size: 4em;
        color: var(--ninth-color);
        margin-bottom: 20px;
    }

    .empty-state h3 {
        margin-bottom: 10px;
        color: var(--secondary-color);
    }

    .empty-state p {
        margin-bottom: 20px;
        color: var(--eigth-color);
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
        .feed-layout {
            grid-template-columns: 1fr;
        }

        .sidebar {
            order: -1;
            position: static;
        }

        .trending-section {
            margin-bottom: 30px;
        }

        .trending-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
    }

    @media (max-width: 768px) {
        .feed-container {
            padding: 10px;
        }

        .feed-header {
            padding: 30px 15px;
            margin-bottom: 20px;
        }

        .header-content h1 {
            font-size: 2em;
        }

        .header-content p {
            font-size: 1em;
        }

        .feed-navigation {
            flex-direction: column;
            gap: 20px;
            padding: 15px;
        }

        .tabs-container {
            flex-wrap: wrap;
            justify-content: center;
        }

        .tab-button {
            padding: 10px 15px;
            font-size: 13px;
        }

        .content-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
        }

        .trending-grid {
            grid-template-columns: 1fr;
        }

        .activities-container {
            padding: 20px;
        }
    }

    @media (max-width: 480px) {
        .header-content h1 {
            font-size: 1.8em;
            flex-direction: column;
            gap: 5px;
        }

        .tabs-container {
            flex-direction: column;
            width: 100%;
        }

        .tab-button {
            width: 100%;
            justify-content: center;
        }

        .content-grid {
            grid-template-columns: 1fr;
        }

        .trending-link {
            flex-direction: column;
            text-align: center;
        }

        .trending-image {
            width: 80px;
            height: 80px;
            margin: 0 auto;
        }
    }
</style>
