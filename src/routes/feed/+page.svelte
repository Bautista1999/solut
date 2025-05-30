<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    import ActivityPost from "$lib/components/ActivityPost.svelte";
    import LoadingNew from "$lib/components/LoadingNew.svelte";
    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";

    // Auth helpers
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import { getUserKey } from "$lib/data_functions/get_functions";

    // Backend queries
    import {
        getPaginatedFollowingElements,
        getPaginatedMostRecentActivities,
    } from "../../declarations/satellite/satellite.api";

    // --- State variables ----------------------------------------------------
    let isSignedIn = false;
    let userKey = "";

    /** @type {Array<import("../../declarations/satellite/satellite.did").Activity>} */
    let feedActivities = [];

    // Pagination helpers
    const PAGE_LIMIT = 5;        // Items fetched per user per request

    /** @type {Record<string, number>} */
    let userOffsets = {};        // Keeps track of the current offset per user

    /** @type {string[]} */
    let followedUsers = [];      // List of user IDs the current user follows

    let isLoading = true;        // Global loading flag
    let loadingMore = false;     // Flag for the "Load more" button

    // -----------------------------------------------------------------------
    onMount(async () => {
        isLoading = true;
        // Check auth status
        isSignedIn = await CheckIfSignedIn();
        if (isSignedIn) {
            userKey = await getUserKey();
            await initializeFeed();
        }
        isLoading = false;
    });

    /**
     * Initialise feed by fetching followed users and their first batch of
     * activities (including the signed-in user).
     */
    async function initializeFeed() {
        try {
            // 1) Get the list of followed elements (users only)
            const followedRes = await getPaginatedFollowingElements(
                userKey,
                [],   // offset
                [],   // limit (default 20)
            );

            if ("Ok" in followedRes) {
                followedUsers = followedRes.Ok[0]
                    .filter((e) => e.element_type === "user")
                    .map((e) => e.element_id);
            }

            // Always include yourself at the start of the list
            if (!followedUsers.includes(userKey)) {
                followedUsers.unshift(userKey);
            }

            // Initialise offsets for each user
            followedUsers.forEach((uid) => (userOffsets[uid] = 0));

            await loadMoreActivities();
        } catch (err) {
            console.error("Failed to initialise feed:", err);
        }
    }

    /**
     * Fetch the next batch of activities for every followed user.
     * Aggregates them into `feedActivities` ordered by creation date.
     */
    async function loadMoreActivities() {
        if (loadingMore) return; // Prevent multiple parallel requests
        loadingMore = true;

        try {
            const activityPromises = followedUsers.map(async (uid) => {
                const offset = userOffsets[uid] || 0;
                const res = await getPaginatedMostRecentActivities(
                    uid,
                    [offset],
                    [PAGE_LIMIT],
                );

                if ("Ok" in res) {
                    userOffsets[uid] = offset + PAGE_LIMIT; // Increment offset
                    return res.Ok[0];                     // Activity array
                }
                return [];
            });

            const results = await Promise.all(activityPromises);
            const newActivities = results.flat();

            // Merge, deduplicate by (creator_id + created_at + description) to
            // avoid accidental duplicates, then sort by date desc.
            const combined = [...feedActivities, ...newActivities];
            /** @type {Record<string, boolean>} */
            const seen = {};
            feedActivities = combined.filter((act) => {
                const key = `${act.creator_id}_${act.created_at}_${act.description}`;
                if (seen[key]) return false;
                seen[key] = true;
                return true;
            });
            feedActivities.sort(
                (a, b) => Number(b.created_at) - Number(a.created_at),
            );
        } catch (err) {
            console.error("Failed loading more activities:", err);
        } finally {
            loadingMore = false;
        }
    }

    function signInRedirect() {
        goto("/signin");
    }
</script>

<main class="activity-feed-container">
    {#if !isSignedIn}
        <section class="signin-section">
            <h2>Sign in to view community activity</h2>
            <p>Connect with others and stay up-to-date on the latest moves.</p>
            <BasicButtonDark
                msg="Sign in"
                icon="login"
                someFunction={signInRedirect}
            />
        </section>
    {:else}
        <section class="activity-section">
            <h1 class="feed-title">
                <span class="material-symbols-outlined">timeline</span>
                Activity Feed
            </h1>

            {#if isLoading && feedActivities.length === 0}
                <div class="loading-wrapper">
                    <LoadingNew message="Loading activities..." />
                </div>
            {:else if feedActivities.length === 0}
                <div class="empty-message">
                    <p>No activity to display yet. Interact with ideas or follow other users to populate your feed.</p>
                </div>
            {:else}
                <div class="activities-list">
                    {#each feedActivities as activity}
                        <ActivityPost {activity} />
                    {/each}
                </div>

                <div class="load-more-wrapper">
                    <BasicButtonDark
                        msg={loadingMore ? "Loading..." : "Load more"}
                        icon={loadingMore ? "hourglass_empty" : "expand_more"}
                        someFunction={loadMoreActivities}
                    />
                </div>
            {/if}
        </section>
    {/if}
</main>

<svelte:head>
    <meta name="twitter:card" content="summary" />
    <meta charset="utf-8" />
    <title>Activity Feed - Solutio</title>
    <meta name="description" content="See what the Solutio community is up to in real-time." />
</svelte:head>

<style>
    .activity-feed-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 30px;
    }

    /* Sign-in prompt ------------------------------ */
    .signin-section {
        text-align: center;
        background: var(--forth-color);
        padding: 40px 20px;
        border: 1px solid var(--ninth-color);
        border-radius: 12px;
    }

    .signin-section h2 {
        margin-bottom: 10px;
        color: var(--secondary-color);
    }

    /* Feed header -------------------------------- */
    .feed-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.8rem;
        margin: 0 0 10px 0;
        color: var(--secondary-color);
    }

    /* Main activity list -------------------------- */
    .activities-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-left: 12px; /* slight left gutter */
        margin-right: 8px; /* slight right gutter */
        align-items: stretch;
    }

    .loading-wrapper,
    .empty-message {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
        text-align: center;
    }

    /* Load more button ---------------------------- */
    .load-more-wrapper {
        display: flex;
        justify-content: center;
        margin-top: 10px;
    }

    /* Responsive tweaks --------------------------- */
    @media (max-width: 480px) {
        .activity-feed-container {
            padding: 10px 16px; /* extra horizontal breathing room */
        }

        .feed-title {
            font-size: 1.5rem;
        }
    }

    @media (max-width: 768px) {
        .activities-list {
            margin-left: 10px;
            margin-right: 6px;
        }
    }
</style>
