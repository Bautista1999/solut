<script>
    import { onMount } from "svelte";
    import { getUserKey, getCommunityActivities } from "$lib/data_functions/get_functions";
    import ActivityPost from "$lib/components/ActivityPost.svelte";
    import LoadingNew from "$lib/components/LoadingNew.svelte";

    /**
     * @type {import("../../declarations/satellite/satellite.did").Activity[]}
     */
    let activities = [];
    let isLoading = false;
    let hasMore = true;
    let page = 0;
    const ITEMS_PER_PAGE = 10;

    /**
     * @type {string}
     */
    let userKey = "";

    onMount(async () => {
        userKey = await getUserKey();
        await loadInitialActivities();
        setupInfiniteScroll();
    });

    async function loadInitialActivities() {
        if (isLoading) return;
        
        isLoading = true;
        try {
            await loadActivities(0);
        } catch (error) {
            console.error("Error loading initial activities:", error);
        } finally {
            isLoading = false;
        }
    }

    /**
     * @param {number} pageNum
     */
    async function loadActivities(pageNum) {
        try {
            const result = await getCommunityActivities(pageNum, ITEMS_PER_PAGE);
            
            if (pageNum === 0) {
                activities = result.activities;
            } else {
                activities = [...activities, ...result.activities];
            }

            hasMore = result.hasMore;
            page = pageNum;
        } catch (error) {
            console.error("Error in loadActivities:", error);
            hasMore = false;
        }
    }

    async function loadMoreActivities() {
        if (isLoading || !hasMore) return;
        
        isLoading = true;
        try {
            await loadActivities(page + 1);
        } catch (error) {
            console.error("Error loading more activities:", error);
        } finally {
            isLoading = false;
        }
    }

    function setupInfiniteScroll() {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasMore && !isLoading) {
                    loadMoreActivities();
                }
            },
            {
                rootMargin: "100px",
            }
        );

        const sentinel = document.getElementById("scroll-sentinel");
        if (sentinel) {
            observer.observe(sentinel);
        }

        return () => {
            if (sentinel) {
                observer.unobserve(sentinel);
            }
        };
    }

    function handleRefresh() {
        activities = [];
        page = 0;
        hasMore = true;
        loadInitialActivities();
    }
</script>

<svelte:head>
    <meta name="twitter:card" content="summary" />
    <meta charset="utf-8" />
    <title>Community Feed - Solutio</title>
    <meta name="description" content="Discover the latest activity from the Solutio community. See recent topics, ideas, solutions, and pledges from innovators and problem-solvers." />
</svelte:head>

<div class="content">
    <div class="feed-header">
        <h1>Community Feed</h1>
        <p>Discover the latest activity from the Solutio community</p>
        <button class="refresh-button" on:click={handleRefresh} disabled={isLoading}>
            {isLoading ? "Loading..." : "Refresh"}
        </button>
    </div>

    <div class="feed-container">
        {#if activities.length === 0 && !isLoading}
            <div class="empty-state">
                <h3>No activity yet</h3>
                <p>Be the first to create a topic, idea, solution, or make a pledge!</p>
            </div>
        {:else}
            <div class="activities-list">
                {#each activities as activity (activity.element_id + activity.created_at)}
                    <ActivityPost {activity} />
                {/each}
            </div>
        {/if}

        <!-- Loading indicator for initial load -->
        {#if isLoading && activities.length === 0}
            <div class="loading-container">
                <LoadingNew />
                <p>Loading community activities...</p>
            </div>
        {/if}

        <!-- Infinite scroll sentinel and loading indicator -->
        {#if activities.length > 0}
            <div id="scroll-sentinel" class="scroll-sentinel">
                {#if isLoading && hasMore}
                    <div class="loading-more">
                        <LoadingNew />
                        <p>Loading more activities...</p>
                    </div>
                {:else if !hasMore}
                    <div class="end-message">
                        <p>You've reached the end of the feed!</p>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    .feed-header {
        text-align: center;
        margin-bottom: 30px;
        padding: 20px 0;
    }

    .feed-header h1 {
        color: var(--secondary-color);
        margin-bottom: 10px;
    }

    .feed-header p {
        color: var(--eigth-color);
        margin-bottom: 20px;
    }

    .refresh-button {
        background-color: var(--primary-color);
        color: var(--tertiary-color);
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-family: 'Barlow';
        font-weight: 500;
        transition: all 0.3s ease;
    }

    .refresh-button:hover:not(:disabled) {
        background-color: var(--tenth-color);
        transform: translateY(-2px);
    }

    .refresh-button:disabled {
        background-color: var(--ninth-color);
        cursor: not-allowed;
        transform: none;
    }

    .feed-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
    }

    .activities-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
        width: 100%;
    }

    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        gap: 15px;
    }

    .loading-container p {
        color: var(--eigth-color);
        font-style: italic;
    }

    .scroll-sentinel {
        width: 100%;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 20px;
    }

    .loading-more {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .loading-more p {
        color: var(--eigth-color);
        font-style: italic;
        font-size: 0.9rem;
    }

    .end-message {
        text-align: center;
        padding: 20px;
    }

    .end-message p {
        color: var(--ninth-color);
        font-style: italic;
        font-size: 0.9rem;
    }

    .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--eigth-color);
    }

    .empty-state h3 {
        margin-bottom: 10px;
        color: var(--secondary-color);
    }

    .empty-state p {
        color: var(--ninth-color);
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .feed-header {
            padding: 15px 0;
            margin-bottom: 20px;
        }

        .feed-header h1 {
            font-size: 24px;
        }

        .feed-container {
            max-width: 100%;
        }

        .activities-list {
            gap: 15px;
        }

        .loading-container {
            padding: 30px 15px;
        }

        .scroll-sentinel {
            height: 80px;
            margin-top: 15px;
        }
    }

    @media (max-width: 480px) {
        .feed-header {
            padding: 10px 0;
            margin-bottom: 15px;
        }

        .refresh-button {
            padding: 8px 16px;
            font-size: 0.9rem;
        }

        .activities-list {
            gap: 12px;
        }

        .empty-state {
            padding: 40px 15px;
        }
    }
</style>
