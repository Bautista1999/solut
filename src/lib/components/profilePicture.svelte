<script>
    import { goto } from "$app/navigation";
    import { validateImageUrl } from "$lib/data_functions/get_functions";
    import { onMount } from "svelte";

    // You can pass the image source as a prop if it needs to be dynamic
    export let src = "";
    export let userKey = "";
    let isLoading = true;

    const defaultSrc = "https://solutio.one/solutio-images/logo-01.png";

    /**
     * @param {{ stopPropagation: () => void; }} event
     */
    function handleProfileClick(event) {
        // Stop the click event from bubbling up to parent elements
        event.stopPropagation();

        // Your logic for when the profile picture is clicked
        goto("/profile/" + userKey);
    }

    function handleImageLoad() {
        isLoading = false;
    }

    function handleImageError() {
        isLoading = false;
        displaySrc = defaultSrc;
        console.log("Image error");
    }

    $: displaySrc = src || defaultSrc;

    onMount(async () => {
        isLoading = true;
        displaySrc = await validateImageUrl(displaySrc, defaultSrc);
    });
</script>

<div class="profile-pic-container">
    {#if isLoading}
        <div class="spinner"></div>
    {/if}
    <img
        class="profile-pic"
        class:loading={isLoading}
        src={displaySrc}
        alt="Profile Picture"
        on:click={handleProfileClick}
        on:load={handleImageLoad}
        on:error={handleImageError}
    />
</div>

<style>
    .profile-pic-container {
        width: 60px;
        height: 60px;
        position: absolute;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border: 2px solid var(--primary-color);
        transition:
            border 0.3s ease,
            width 0.3s ease,
            height 0.3s ease,
            transform 0.3s ease;
    }

    .profile-pic-container:hover {
        position: absolute;
        transform: scale(1.2);
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 2px solid var(--primary-color);
    }

    .profile-pic-container:active {
        position: absolute;
        transform: scale(1);
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 2px solid var(--primary-color);
    }

    .profile-pic {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 1;
        transition: opacity 0.3s ease;
    }

    .profile-pic.loading {
        opacity: 0;
    }

    .spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 32px;
        height: 32px;
        border: 2px solid var(--primary-color);
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: translate(-50%, -50%) rotate(0deg);
        }
        100% {
            transform: translate(-50%, -50%) rotate(360deg);
        }
    }

    @media (max-width: 480px) {
        .profile-pic-container {
            width: 40px;
            height: 40px;
        }

        .spinner {
            width: 18px;
            height: 18px;
        }
    }
</style>
