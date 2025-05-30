<script>
    import { validateImageUrl } from "$lib/data_functions/get_functions";
    import { formatDistanceToNow } from "date-fns";

    /**
     * @type {import("../../declarations/satellite/satellite.did").Activity}
     */

    export let activity;

    let formattedTimeAgo = "Unknown time";
    // Props for the component
    let profileImage = activity.profile_image; // User's profile picture
    let username = activity.creator_username; // User's username
    let createdAt = activity.created_at; // UNIX timestamp in seconds
    let description = activity.description; // Description message
    let activityImage =
        activity.activity_image.length == 0 ? "" : activity.activity_image[0]; // Optional activity image
    let activityTitle = activity.activity_title; // Activity title
    let link = activity.link; // Link to the activity
    if (createdAt) {
        // Convert nanoseconds to milliseconds
        const timestamp = Math.floor(Number(createdAt) / 1_000_000);

        const date = new Date(timestamp);

        if (!isNaN(date.getTime())) {
            formattedTimeAgo = formatDistanceToNow(date, { addSuffix: true });
        } else {
            console.error("Invalid date generated from timestamp:", timestamp);
        }
    }
    if (!activityImage) {
        activityImage = "https://solutio.one/solutio-images/logo-01.png";
    }

    $: displaySrc = activity.profile_image;
    let isLoading = true;
    // validation of profile picture
    $: if (displaySrc) {
        // debugger;
        isLoading = true;
        (async () => {
            try {
                displaySrc = await validateImageUrl(
                    displaySrc,
                    "https://cdn-icons-png.freepik.com/512/8792/8792047.png",
                );
            } catch {
                displaySrc =
                    "https://cdn-icons-png.freepik.com/512/8792/8792047.png";
            } finally {
                isLoading = false;
            }
        })();
    } else {
        displaySrc = "https://cdn-icons-png.freepik.com/512/8792/8792047.png";
        isLoading = false;
    }
</script>

<!-- Restructured card layout -->
<div class="activity-card">
    <!-- Profile picture column -->
    <a href={"/profile/" + username} class="avatar-wrapper">
        <img src={displaySrc} alt="Profile" class="profile-image" />
    </a>

    <!-- Main content column -->
    <div class="content-wrapper">
        <div class="card-body">
        <!-- User header (username & timestamp) -->
        <div class="user-info">
            <a href={"/profile/" + username} class="username">@{username}</a>
            <span class="created-at"> · {formattedTimeAgo}</span>
        </div>

        <!-- Activity description -->
        <p class="activity-description">{description}</p>

        <!-- Optional linked content -->
        {#if activityTitle}
            <a href={link} class="activity-link">
                {#if activityImage}
                    <img src={activityImage} alt="Activity" class="activity-image" />
                {/if}
                <p class="activity-title">{activityTitle}</p>
            </a>
        {/if}
        </div>
    </div>
</div>

<style>
    /* Grid layout with avatar column */
    .activity-card {
        display: grid;
        grid-template-columns: 48px 1fr;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid var(--forth-color);
        text-decoration: none;
        color: inherit;
        width: 100%;
        box-sizing: border-box;
    }

    /* Avatar */
    .avatar-wrapper {
        display: block;
        width: 48px;
        height: 48px;
        flex-shrink: 0;
    }
    .profile-image {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
    }

    /* Body */
    .content-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    /* Card-like body */
    .card-body {
        border: 1px solid var(--forth-color);
        border-radius: 8px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        background: var(--tertiary-color);
        box-sizing: border-box;
        width: 100%;
    }

    .user-info {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 4px;
        font-size: 0.9rem;
    }
    .username {
        font-weight: 600;
        color: var(--secondary-color);
        text-decoration: none;
    }
    .username:hover {
        text-decoration: underline;
    }

    .created-at {
        font-size: 0.8rem;
        color: var(--eigth-color);
    }

    .activity-description {
        margin: 0;
        color: var(--secondary-color);
        font-size: 0.95rem;
        line-height: 1.35;
    }

    /* Link preview */
    .activity-link {
        border: 1px solid var(--forth-color);
        border-radius: 8px;
        padding: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        color: inherit;
        max-width: 100%;
    }
    .activity-link:hover {
        background: var(--forth-color);
    }

    .activity-image {
        width: 60px;
        height: 60px;
        border-radius: 6px;
        object-fit: cover;
        flex-shrink: 0;
    }

    .activity-title {
        font-weight: 600;
        font-size: 0.9rem;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* Mobile tweaks */
    @media (max-width: 480px) {
        .activity-card {
            grid-template-columns: 40px 1fr;
            gap: 10px;
        }
        .avatar-wrapper,
        .profile-image {
            width: 40px;
            height: 40px;
        }
        .activity-image {
            width: 50px;
            height: 50px;
        }
    }
</style>
