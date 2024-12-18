<script>
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
</script>

<a class="activity-card" href={link}>
    <!-- Top Section: Profile Image, Username, Time Ago -->
    <div class="activity-header">
        <a href={"/profile/" + username}
            ><img src={profileImage} alt="Profile" class="profile-image" /></a
        >
        <div class="user-info">
            <a href={"/profile/" + username} class="username">@{username}</a>
            <span class="created-at"> - {formattedTimeAgo}</span>
        </div>
    </div>

    <!-- Description -->
    <p class="activity-description">{description}</p>

    <!-- Activity Content -->
    {#if activityTitle}
        <a href={link} class="activity-link">
            <img
                src={activityImage}
                alt="Activity Image"
                class="activity-image"
            />
            <p class="activity-title">{activityTitle}</p>
        </a>
    {/if}
</a>

<style>
    .activity-card {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: start;
        text-decoration: none;
        width: 100%;
        gap: 10px;
        padding: 15px;
        border: 1px solid #ccc;
        border-radius: 8px;
        background-color: #fff;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    }

    .activity-header {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .profile-image {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
    }
    .profile-image:hover {
        transform: translateY(-2px) translateX(-2px);
        /* border: 2px solid var(--primary-color); */
        box-shadow: 2px 2px 0px 0px var(--seventh-color);
    }
    .profile-image:active {
        transform: translateY(-0px) translateX(-0px);
        /* border: 2px solid var(--primary-color); */
        box-shadow: 0px 0px 0px 0px var(--seventh-color);
    }

    .user-info {
        display: flex;
        flex-direction: row;
        align-items: end;
        justify-content: center;

        gap: 5px;
    }

    .username {
        font-weight: bold;
        color: var(--primary-color, #333);
        text-decoration: none;
        font-family: "Barlow";
    }
    .username:hover {
        text-decoration: underline;
    }

    .created-at {
        font-size: 0.8rem;
        color: #777;
        font-family: "Barlow";
    }

    .activity-description {
        margin: 0;
        color: #555;
        font-size: 0.9rem;
        font-style: italic;
    }

    .activity-link {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: inherit;
        width: 97%;
        padding: 10px;
        border-radius: 8px;
        /* border: 0.2px solid #ccc; */
    }
    .activity-card:hover {
        background-color: var(--forth-color);
    }

    .activity-image {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        object-fit: cover;
    }

    .activity-title {
        font-weight: bold;
        color: var(--primary-color, #333);
        margin: 0;
    }
    @media (max-width: 768px) {
        .activity-link {
            width: 94%;
        }
    }
</style>
