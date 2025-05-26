<!-- <UnderConstruction /> -->
<script>
    import ProfileActivitySection from "$lib/components/ProfileActivitySection.svelte";
    import ProfilePageHeader from "$lib/components/ProfilePageHeader.svelte";
    import ProfilePageSideBar from "$lib/components/ProfilePageSideBar.svelte";
    import { onDestroy, onMount } from "svelte";
    import {
        getPaginatedMostRecentActivities,
        getUserBasicInformation,
    } from "../../../declarations/satellite/satellite.api";
    import { get } from "svelte/store";
    import { UserKey } from "$lib/stores/other_stores";
    import LoadingNew from "$lib/components/LoadingNew.svelte";
    import NotFound from "$lib/components/NotFound.svelte";

    /** @type {import('./$types').PageData} */
    // @ts-ignore
    export let data;
    let user_id = data.params.user_id;
    // Sample data for the username section
    let isOwner = false; // Change to false to simulate non-owner view
    let username = "";

    let profileImage = "https://cdn-icons-png.freepik.com/512/8792/8792047.png"; // Placeholder image URL
    let backgroundImage =
        "https://t4.ftcdn.net/jpg/06/44/91/89/360_F_644918917_2Wpbz2OwEOUJxD1FfailbhcZVuUhQcTh.jpg"; // Placeholder background image URL
    let followers = 104;
    let following = 27;
    let bio = "";
    let reputation = 75; // Reputation as a percentage
    let totalPledged = 107.9; // Total amount pledged
    let activePledges = 53; // Active pledges amount
    /**
     * @type {import("../../../declarations/satellite/satellite.did").Activity[]}
     */
    let posts = [];
    let error = false;
    let isLoading = false;
    onMount(async () => {
        window.addEventListener("popstate", () => {
            // Logic to handle page state when navigating back or forward
            location.reload(); // Basic approach to reload the current state
        });
        let callerPrincipal = get(UserKey);
        isOwner = callerPrincipal == user_id;
        isLoading = true;
        let result = await getUserBasicInformation(data.params.user_id);
        if ("Ok" in result) {
            followers = Number(result.Ok.followers_count);
            following = Number(result.Ok.followings_count);
            reputation = Number(result.Ok.reputation);
            totalPledged = parseFloat(
                (Number(result.Ok.total_pledged) / 100000000).toFixed(3),
            );
            activePledges = parseFloat(
                (Number(result.Ok.active_pledged) / 100000000).toFixed(3),
            );
            username = result.Ok.username;
            profileImage = result.Ok.profile_picture;
            bio = result.Ok.description;
            isLoading = false;
            user_id = result.Ok.user_id;
        } else {
            error = true;
            isLoading = false;
        }
        window.addEventListener("scroll", handleScroll);
        let postsResult = await getPaginatedMostRecentActivities(
            user_id,
            [],
            [],
        );
        if ("Ok" in postsResult) {
            posts = postsResult.Ok[0];
        }
    });
    let isShrunk = false; // State to track header shrinkage

    function handleScroll() {
        isShrunk = window.scrollY > 10; // Shrink header if scrolled more than 50px
    }

    onDestroy(() => {
        window.removeEventListener("scroll", handleScroll);
    });
</script>

<div class="profile-page">
    {#if !isLoading && !error}
        <!-- Username Section with Background -->
        <div class="username-section {isShrunk ? 'shrink' : ''}">
            <ProfilePageHeader
                {isOwner}
                {username}
                userPrincipal={user_id}
                {profileImage}
                {backgroundImage}
                bind:followers
            />
        </div>

        <!-- User Content -->
        <div class="user-content">
            <div class="basic-info-section">
                <!-- Basic Info Section Placeholder -->
                <ProfilePageSideBar
                    bind:followers
                    bind:following
                    {bio}
                    {reputation}
                    {totalPledged}
                    {activePledges}
                    {user_id}
                />
            </div>
            <div class="activity-section">
                <ProfileActivitySection {posts} />
            </div>
        </div>
    {:else if error}
        <NotFound />
    {:else}
        <LoadingNew />
    {/if}
</div>

<svelte:head>
    <meta name="twitter:card" content="summary" />
    <meta charset="utf-8" />
    <title>{username}</title>
    <meta
        name="description"
        content={"Check out " + { username } + " profile!"}
    />
    <meta property="og:title" content={{ username } + "'s profile"} />
    <meta
        property="og:description"
        content={"Check out " + { username } + " profile!"}
    />
    <meta property="og:type" content="profile" />
    <meta property="og:url" content={window.location.toString()} />
    <meta
        property="og:image"
        content={"http://solutio.one/assets/LogoSol3.png"}
    />
    <meta name="twitter:title" content={{ username } + "'s profile"} />
    <meta
        name="twitter:description"
        content={"Check out " + { username } + " profile!"}
    />
    <meta
        name="twitter:image"
        content={"http://solutio.one/assets/LogoSol3.png"}
    />
</svelte:head>

<style>
    /* Basic Styles for Profile Page */
    .profile-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: Arial, sans-serif;
        width: 70%;
        max-width: 1200px;
        padding-top: 10px;
        gap: 10px;
        margin: auto;
        margin-bottom: 10px;
    }

    /* Username Section */
    .username-section {
        position: relative;
        width: 100%;
        border-radius: 8px;
        height: 200px; /* Adjust height as needed */
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        z-index: 100;
    }
    .user-content {
        display: grid;
        grid-template-columns: 0.8fr 2.2fr; /* Single column by default */
        grid-template-rows: auto; /* Stack Basic Info and Activity Sections */
        grid-template-areas: "basic-info-section activity-section";
        gap: 10px; /* Spacing between sections */
        width: 100%; /* Matches username-section width */
        margin: auto; /* Center the grid */
    }

    /* Basic Info Section */
    .basic-info-section {
        grid-area: basic-info-section;
        background-color: var(--tertiary-color);
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        height: fit-content;
    }

    /* Activity Section */
    .activity-section {
        grid-area: activity-section;
        background-color: var(--tertiary-color);
        border-radius: 8px;
        display: flex;
        align-items: start;
        justify-content: center;
        padding-inline: 15px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .username-section.shrink {
        position: fixed;
        margin-top: -10px;
        height: 70px;
    }
    /* Responsive Design for Mobile (max-width: 768px) */
    @media (max-width: 768px) {
        /* Username Section Adjustments */
        .profile-page {
            padding-top: 0px;
            width: 100%;
            gap: 0px;
        }

        .username-section {
            width: 105%;
            /* Make the section slightly narrower */

            height: 120px;
            /* Let the height adjust based on content */
            border-radius: 0;
            transition: all 0.3s ease;
            /* Remove rounded corners for a cleaner look */
        }
        .username-section.shrink {
            margin-top: 0px;
            position: fixed;
            width: 105%;
            /* Make the section slightly narrower */

            height: 50px;
            /* Let the height adjust based on content */
            border-radius: 0;

            /* Remove rounded corners for a cleaner look */
        }

        .user-content {
            display: grid;
            grid-template-columns: 1fr; /* Single column layout */
            width: 100%;
            grid-template-areas:
                "basic-info-section"
                "activity-section";
            gap: 5px;
            place-items: center;
            padding: 0;
        }

        .basic-info-section,
        .activity-section {
            margin: 0;
            width: 100%;
            border-radius: 0;
            margin-left: -10px;
        }
    }
</style>
