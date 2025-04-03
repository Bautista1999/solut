<script>
    import UserHoveredTable from "./UserHoveredTable.svelte";

    /**
     * @type {import("../../declarations/satellite/satellite.did").UserBasicInfo | string}
     */
    export let value;

    /**
     * @type {any}
     */
    export let row;

    // For hover state
    let isHovered = false;
    let isImageLoading = true;

    // For hover functionality
    let showHover = false;
    let hoverElement;
    let hoverId = "";
    let hoverX = 0;
    let hoverY = 0;

    // Get the user object - could be passed directly or as part of the row
    // The value might now be just the username string because of our accessor change
    $: user =
        row && row.user ? row.user : typeof value === "object" ? value : null;
    $: userId = user && typeof user === "object" ? user.user_id : "";
    // If value is a string, use it as the username, otherwise get it from the user object
    $: username =
        typeof value === "string"
            ? value
            : user && typeof user === "object"
              ? user.username
              : "";
    $: profilePicture =
        user && typeof user === "object" ? user.profile_picture : "";

    function handleImageLoad() {
        isImageLoading = false;
    }

    function handleImageError() {
        isImageLoading = false;
        profilePicture = "https://solutio.one/solutio-images/logo-01.png";
    }

    /**
     * @param {MouseEvent} event
     */
    function handleMouseEnter(event) {
        // Capture mouse position for hover positioning
        hoverX = event.clientX;
        hoverY = event.clientY;

        if (userId) {
            hoverId = userId;
            showHover = true;
            console.log("Showing user hover:", hoverId);
        } else {
            console.log("No valid user id found for hover");
        }
    }

    function handleMouseLeave() {
        showHover = false;
    }
</script>

<div
    class="user-table-element"
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
>
    <a href={`/profile/${username}`} class="user-link">
        <div class="user-container">
            {#if profilePicture}
                <div class="image-container">
                    {#if isImageLoading}
                        <div class="spinner"></div>
                    {/if}
                    <img
                        src={profilePicture}
                        alt={username}
                        class="userSmallProfilePicture"
                        class:loading={isImageLoading}
                        on:load={handleImageLoad}
                        on:error={handleImageError}
                    />
                </div>
            {:else}
                <div class="userSmallProfilePicture user-placeholder"></div>
            {/if}
            <span class="username">{username || "Unknown User"}</span>
        </div>
    </a>

    {#if showHover && hoverId}
        <div
            class="hover-container"
            bind:this={hoverElement}
            style="left: {hoverX}px; top: {hoverY + 20}px;"
        >
            <UserHoveredTable id={hoverId} />
        </div>
    {/if}
</div>

<style>
    .user-table-element {
        position: relative;
        cursor: pointer;
    }

    .user-link {
        text-decoration: none;
        display: block;
        transition: all 0.2s ease;
    }

    .user-container {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 2px 0;
    }

    .image-container {
        position: relative;
        width: 32px;
        height: 32px;
        background-color: var(--forth-color);
        border-radius: 50%;
    }

    .userSmallProfilePicture {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
        opacity: 1;
        transition: opacity 0.3s ease;
    }

    .userSmallProfilePicture.loading {
        opacity: 0;
        background-color: var(--forth-color);
    }

    .spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 16px;
        height: 16px;
        border: 2px solid var(--primary-color);
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        background-color: var(--forth-color);
    }

    @keyframes spin {
        0% {
            transform: translate(-50%, -50%) rotate(0deg);
        }
        100% {
            transform: translate(-50%, -50%) rotate(360deg);
        }
    }

    .username {
        color: var(--secondary-color);
        font-size: 14px;
        transition: color 0.2s ease;
    }

    .user-link:hover .username {
        color: var(--primary-color);
        text-decoration: underline;
    }

    .user-placeholder {
        background-color: var(--ninth-color);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .hover-container {
        position: fixed;
        z-index: 9999;
        animation: fadeIn 0.2s ease forwards;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (max-width: 768px) {
        .user-container {
            gap: 4px;
        }

        .username {
            font-size: 12px;
        }
    }
</style>
