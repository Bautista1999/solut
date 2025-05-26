<script>
    import { onMount } from "svelte";
    import { getUserBasicInformation } from "../../declarations/satellite/satellite.api";

    /**
     * @type {string}
     */
    export let id;

    /**
     * @type {any}
     */
    let userData = null;
    let isLoading = true;
    /**
     * @type {string | null}
     */
    let error = null;

    // Default profile image
    const defaultProfileImage =
        "https://solutio.one/solutio-images/logo-01.png";

    onMount(async () => {
        console.log("UserHoveredTable mounted with id:", id);
        if (!id) {
            error = "No user ID provided";
            isLoading = false;
            return;
        }

        try {
            const userResult = await getUserBasicInformation(id);
            if ("Ok" in userResult) {
                userData = userResult.Ok;
                console.log("User data loaded:", userData);
            } else {
                error = userResult.Err || "Failed to load user";
                console.error("Error loading user data:", error);
            }
        } catch (err) {
            error = "Failed to load user data";
            console.error("Error in UserHoveredTable:", err);
        } finally {
            isLoading = false;
            console.log("Loading complete, state:", {
                userData,
                error,
                isLoading,
            });
        }
    });

    // Format pledge amounts (from BigInt to display number)
    $: activePledged = userData
        ? Number(userData.active_pledged) / 100000000
        : 0;
    $: totalPledged = userData ? Number(userData.total_pledged) / 100000000 : 0;
</script>

<div class="hover-card">
    {#if isLoading}
        <div class="hover-card-loading">
            <div class="skeleton-header">
                <div class="skeleton-image"></div>
                <div class="skeleton-info">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-subtitle"></div>
                </div>
            </div>
            <div class="skeleton-description"></div>
            <div class="skeleton-stats"></div>
        </div>
    {:else if error}
        <div class="error-container">
            <span class="material-symbols-outlined">error_outline</span>
            <p>{error}</p>
        </div>
    {:else if userData}
        <div class="hover-card-content">
            <div class="user-header">
                <!-- Profile image on the left -->
                <div class="user-image">
                    {#if userData.profile_picture}
                        <img
                            src={userData.profile_picture}
                            alt={userData.username}
                        />
                    {:else}
                        <div class="user-image-placeholder">
                            {userData.username.charAt(0).toUpperCase()}
                        </div>
                    {/if}
                </div>
                <!-- Username and reputation on the right -->
                <div class="user-info">
                    <h3 class="user-username">{userData.username}</h3>
                    <div class="user-reputation">
                        <span class="reputation-label">Reputation: </span>
                        <span class="reputation-value"
                            >{userData.reputation.toString()}</span
                        >
                    </div>
                </div>
            </div>

            <!-- Description -->
            {#if userData.description}
                <p class="user-description">
                    {userData.description.length > 100
                        ? userData.description.slice(0, 100) + "..."
                        : userData.description}
                </p>
            {/if}

            <!-- Stats -->
            <div class="user-stats">
                <div class="stat-item">
                    <span class="stat-label">Active Pledged:</span>
                    <span class="stat-value">{activePledged.toFixed(2)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Pledged:</span>
                    <span class="stat-value">{totalPledged.toFixed(2)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Followers:</span>
                    <span class="stat-value"
                        >{userData.followers_count.toString()}</span
                    >
                </div>
                <div class="stat-item">
                    <span class="stat-label">Following:</span>
                    <span class="stat-value"
                        >{userData.followings_count.toString()}</span
                    >
                </div>
            </div>
        </div>
    {:else}
        <div class="error-container">
            <span class="material-symbols-outlined">info</span>
            <p>No user data available</p>
        </div>
    {/if}
</div>

<style>
    .hover-card {
        position: absolute;
        z-index: 9999;
        width: 300px;
        background-color: var(--tertiary-color);
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.35);
        overflow: hidden;
        padding: 12px;
        animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        transform-origin: bottom center;
    }

    .hover-card-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    /* Header with image and info side by side */
    .user-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 5px;
    }

    .user-image {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        overflow: hidden;
        background-color: var(--ninth-color);
        flex-shrink: 0;
    }

    .user-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .user-image-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--primary-color);
        color: var(--tertiary-color);
        font-size: 24px;
        font-weight: bold;
    }

    .user-info {
        display: flex;
        flex-direction: column;
    }

    .user-username {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--secondary-color);
    }

    .user-reputation {
        font-size: 0.85rem;
        color: var(--eigth-color);
    }

    .reputation-value {
        font-weight: 500;
        color: var(--primary-color);
    }

    .user-description {
        font-size: 0.85rem;
        color: var(--eigth-color);
        line-height: 1.4;
        margin: 0;
    }

    .user-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 5px;
    }

    .stat-item {
        display: flex;
        flex-direction: column;
        font-size: 0.8rem;
    }

    .stat-label {
        color: var(--eigth-color);
    }

    .stat-value {
        font-weight: 600;
        color: var(--secondary-color);
    }

    /* Loading skeleton styles */
    .hover-card-loading {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .skeleton-header {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .skeleton-image {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .skeleton-info {
        display: flex;
        flex-direction: column;
        gap: 5px;
        flex-grow: 1;
    }

    .skeleton-title,
    .skeleton-subtitle,
    .skeleton-description,
    .skeleton-stats,
    .skeleton-image {
        background: linear-gradient(
            90deg,
            var(--forth-color-v2) 0%,
            var(--ninth-color) 50%,
            var(--forth-color-v2) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
    }

    .skeleton-title {
        height: 20px;
        width: 70%;
    }

    .skeleton-subtitle {
        height: 14px;
        width: 50%;
    }

    .skeleton-description {
        height: 40px;
        width: 100%;
    }

    .skeleton-stats {
        height: 60px;
        width: 100%;
    }

    @keyframes shimmer {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }

    /* Error styles */
    .error-container {
        padding: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--red-wine);
        text-align: center;
        background-color: #fff3f3;
        min-height: 80px;
    }

    .error-container span {
        font-size: 28px;
        margin-bottom: 8px;
    }

    .error-container p {
        margin: 0;
        font-size: 0.9rem;
        font-weight: 500;
    }

    @keyframes popIn {
        0% {
            opacity: 0;
            transform: scale(0.6) translateY(70px);
        }
        70% {
            transform: scale(1.05) translateY(-90px);
        }
        100% {
            opacity: 1;
            transform: scale(1) translateY(-100px);
        }
    }
</style>
