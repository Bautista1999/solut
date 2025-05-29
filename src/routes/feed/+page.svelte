<script>
    import { onMount } from "svelte";
    import { getPaginatedTopicsIdeas } from "../../declarations/satellite/satellite.api";
    import CardPreview from "$lib/components/CardPreview.svelte";
    import LoadingNew from "$lib/components/LoadingNew.svelte";
    import BasicButton from "$lib/components/basicButton.svelte";
    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";
    import { goto } from "$app/navigation";

    /**
     * @type {Array<import("../../declarations/satellite/satellite.did").IndexResponse>}
     */
    let feedItems = [];
    let isLoading = true;
    let error = false;
    let errorMessage = "";
    let currentSortBy = "most_recent";
    let offset = 0;
    let limit = 12;
    let totalItems = 0;
    let totalPages = 0;
    let currentPage = 1;
    let hasMoreItems = true;
    let searchTerm = "";
    /** @type {number | undefined} */
    let searchTimeout;

    const sortOptions = [
        { value: "most_recent", label: "Most Recent", icon: "schedule" },
        { value: "most_followed", label: "Most Liked", icon: "favorite" },
        { value: "most_pledged", label: "Most Pledged", icon: "payments" }
    ];

    /** 
     * @param {string} sortBy
     * @param {number} newOffset
     * @param {string} search
     * @param {boolean} append
     */
    async function loadFeedItems(sortBy = currentSortBy, newOffset = 0, search = searchTerm, append = false) {
        try {
            if (!append) {
                isLoading = true;
                error = false;
            }

            const result = await getPaginatedTopicsIdeas(
                sortBy,
                newOffset,
                limit,
                search || null
            );

            if ("Ok" in result) {
                const [items, total, pages, page] = result.Ok;
                
                if (append) {
                    feedItems = [...feedItems, ...items];
                } else {
                    feedItems = items;
                }
                
                totalItems = Number(total);
                totalPages = Number(pages);
                currentPage = Number(page);
                offset = newOffset;
                hasMoreItems = feedItems.length < totalItems;
            } else {
                error = true;
                errorMessage = "Failed to load feed items";
                console.error("API Error:", result.Err);
            }
        } catch (err) {
            error = true;
            errorMessage = "Network error occurred";
            console.error("Network Error:", err);
        } finally {
            isLoading = false;
        }
    }

    /** 
     * @param {string} sortBy
     */
    function handleSortChange(sortBy) {
        if (sortBy !== currentSortBy) {
            currentSortBy = sortBy;
            offset = 0;
            loadFeedItems(sortBy, 0, searchTerm, false);
        }
    }

    function handleSearch() {
        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Set new timeout for debounced search
        searchTimeout = setTimeout(() => {
            offset = 0;
            loadFeedItems(currentSortBy, 0, searchTerm, false);
        }, 500);
    }

    function loadMore() {
        if (!isLoading && hasMoreItems) {
            const newOffset = offset + limit;
            loadFeedItems(currentSortBy, newOffset, searchTerm, true);
        }
    }

    function clearSearch() {
        searchTerm = "";
        offset = 0;
        loadFeedItems(currentSortBy, 0, "", false);
    }

    onMount(() => {
        loadFeedItems();
    });
</script>

<svelte:head>
    <meta name="twitter:card" content="summary" />
    <meta charset="utf-8" />
    <title>Feed - Discover Ideas & Topics</title>
    <meta name="description" content="Discover the latest ideas and topics on Solutio. Join the community and support innovative projects." />
    <meta property="og:title" content="Feed - Discover Ideas & Topics" />
    <meta property="og:description" content="Discover the latest ideas and topics on Solutio. Join the community and support innovative projects." />
    <meta property="og:type" content="website" />
</svelte:head>

<div class="content">
    <!-- Header Section -->
    <div class="feed-header">
        <div class="header-content">
            <h1>Discover Ideas & Topics</h1>
            <p class="header-subtitle">Explore innovative projects and join the community</p>
        </div>
        
        <!-- Create Actions -->
        <div class="create-actions">
            <BasicButton 
                msg="Create Topic" 
                icon="add_circle"
                someFunction={() => goto("/createtopic")}
            />
            <BasicButtonDark 
                msg="Create Idea" 
                icon="emoji_objects"
                someFunction={() => goto("/createidea")}
            />
        </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="filter-section">
        <!-- Search Bar -->
        <div class="search-container">
            <div class="search-input-wrapper">
                <span class="material-symbols-outlined search-icon">search</span>
                <input 
                    type="text" 
                    class="search-input"
                    placeholder="Search ideas and topics..."
                    bind:value={searchTerm}
                    on:input={handleSearch}
                />
                {#if searchTerm}
                    <button class="clear-search" on:click={clearSearch}>
                        <span class="material-symbols-outlined">close</span>
                    </button>
                {/if}
            </div>
        </div>

        <!-- Sort Options -->
        <div class="sort-options">
            {#each sortOptions as option}
                <button 
                    class="sort-button {currentSortBy === option.value ? 'active' : ''}"
                    on:click={() => handleSortChange(option.value)}
                >
                    <span class="material-symbols-outlined">{option.icon}</span>
                    {option.label}
                </button>
            {/each}
        </div>
    </div>

    <!-- Feed Content -->
    {#if isLoading && feedItems.length === 0}
        <LoadingNew message="Loading feed..." />
    {:else if error && feedItems.length === 0}
        <div class="error-state">
            <span class="material-symbols-outlined">error_outline</span>
            <h3>Unable to load feed</h3>
            <p>{errorMessage}</p>
            <BasicButton 
                msg="Try Again" 
                icon="refresh"
                someFunction={() => loadFeedItems()}
            />
        </div>
    {:else if feedItems.length === 0}
        <div class="empty-state">
            <span class="material-symbols-outlined">lightbulb</span>
            <h3>No items found</h3>
            <p>Try adjusting your search or filters, or be the first to create something!</p>
            <div class="empty-actions">
                <BasicButton 
                    msg="Create Topic" 
                    icon="add_circle"
                    someFunction={() => goto("/createtopic")}
                />
                <BasicButtonDark 
                    msg="Create Idea" 
                    icon="emoji_objects"
                    someFunction={() => goto("/createidea")}
                />
            </div>
        </div>
    {:else}
        <!-- Feed Items Grid -->
        <div class="feed-grid">
            {#each feedItems as item (item.element_id)}
                <div class="feed-item">
                    <CardPreview idea={item} padding={10} />
                </div>
            {/each}
        </div>

        <!-- Load More Section -->
        {#if hasMoreItems}
            <div class="load-more-section">
                {#if isLoading}
                    <LoadingNew message="Loading more..." />
                {:else}
                    <BasicButtonDark 
                        msg="Load More" 
                        icon="expand_more"
                        someFunction={loadMore}
                    />
                {/if}
            </div>
        {:else if totalItems > limit}
            <div class="end-of-feed">
                <p>You've reached the end of the feed!</p>
                <p class="feed-stats">Showing {feedItems.length} of {totalItems} items</p>
            </div>
        {/if}
    {/if}
</div>

<!-- Include Material Icons -->
<link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
/>

<style>
    .feed-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding: 1.5rem 0;
        border-bottom: 1px solid var(--ninth-color);
    }

    .header-content h1 {
        margin: 0 0 0.5rem 0;
        color: var(--secondary-color);
        font-size: 2rem;
        font-weight: 600;
    }

    .header-subtitle {
        margin: 0;
        color: var(--eigth-color);
        font-size: 1.1rem;
    }

    .create-actions {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .filter-section {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        margin-bottom: 2rem;
        padding: 1.5rem;
        background-color: var(--tertiary-color);
        border: 1px solid var(--ninth-color);
        border-radius: 12px;
        box-shadow: 2px 2px 0px 0px var(--ninth-color);
    }

    .search-container {
        width: 100%;
    }

    .search-input-wrapper {
        position: relative;
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
    }

    .search-input {
        width: 100%;
        padding: 12px 45px 12px 45px;
        border: 2px solid var(--ninth-color);
        border-radius: 25px;
        font-size: 1rem;
        font-family: 'Barlow';
        background-color: var(--forth-color);
        color: var(--secondary-color);
        transition: all 0.3s ease;
    }

    .search-input:focus {
        outline: none;
        border-color: var(--primary-color);
        background-color: var(--tertiary-color);
        box-shadow: 0 0 0 3px rgba(255, 129, 44, 0.1);
    }

    .search-icon {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--eigth-color);
        font-size: 20px;
    }

    .clear-search {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        color: var(--eigth-color);
        transition: all 0.2s ease;
    }

    .clear-search:hover {
        background-color: var(--ninth-color);
        color: var(--secondary-color);
    }

    .sort-options {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .sort-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        border: 2px solid var(--ninth-color);
        background-color: var(--tertiary-color);
        color: var(--secondary-color);
        border-radius: 25px;
        font-family: 'Barlow';
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
    }

    .sort-button:hover {
        background-color: var(--forth-color);
        border-color: var(--primary-color);
        transform: translateY(-1px);
    }

    .sort-button.active {
        background-color: var(--primary-color);
        color: var(--tertiary-color);
        border-color: var(--primary-color);
        box-shadow: 2px 2px 0px 0px var(--seventh-color);
    }

    .sort-button.active:hover {
        background-color: var(--tenth-color);
        color: var(--tertiary-color);
    }

    .feed-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 2rem;
        margin-bottom: 3rem;
    }

    .feed-item {
        display: flex;
        justify-content: center;
    }

    .load-more-section {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem 0;
    }

    .end-of-feed {
        text-align: center;
        padding: 2rem;
        color: var(--eigth-color);
    }

    .feed-stats {
        font-size: 0.9rem;
        color: var(--ninth-color);
        margin-top: 0.5rem;
    }

    .error-state,
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 4rem 2rem;
        min-height: 300px;
    }

    .error-state span,
    .empty-state span {
        font-size: 4rem;
        color: var(--ninth-color);
        margin-bottom: 1rem;
    }

    .error-state h3,
    .empty-state h3 {
        margin: 0 0 1rem 0;
        color: var(--secondary-color);
        font-size: 1.5rem;
    }

    .error-state p,
    .empty-state p {
        margin: 0 0 2rem 0;
        color: var(--eigth-color);
        font-size: 1.1rem;
        max-width: 400px;
    }

    .empty-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: center;
    }

    /* Mobile Responsiveness */
    @media (max-width: 768px) {
        .feed-header {
            flex-direction: column;
            gap: 1.5rem;
            text-align: center;
        }

        .header-content h1 {
            font-size: 1.75rem;
        }

        .header-subtitle {
            font-size: 1rem;
        }

        .create-actions {
            flex-direction: column;
            width: 100%;
        }

        .filter-section {
            padding: 1rem;
            gap: 1rem;
        }

        .sort-options {
            gap: 0.25rem;
        }

        .sort-button {
            padding: 0.5rem 0.75rem;
            font-size: 0.85rem;
        }

        .feed-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }

        .search-input {
            padding: 10px 40px 10px 40px;
            font-size: 0.9rem;
        }

        .empty-actions {
            flex-direction: column;
            width: 100%;
        }
    }

    @media (max-width: 480px) {
        .header-content h1 {
            font-size: 1.5rem;
        }

        .header-subtitle {
            font-size: 0.9rem;
        }

        .sort-options {
            justify-content: stretch;
        }

        .sort-button {
            flex: 1;
            min-width: 0;
            padding: 0.5rem;
            font-size: 0.8rem;
        }

        .error-state span,
        .empty-state span {
            font-size: 3rem;
        }

        .error-state h3,
        .empty-state h3 {
            font-size: 1.25rem;
        }

        .error-state p,
        .empty-state p {
            font-size: 1rem;
        }
    }
</style>
