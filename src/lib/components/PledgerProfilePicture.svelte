<script>
    import { validateImageUrl } from "$lib/data_functions/get_functions";
    import { onMount } from "svelte";

    export let image;
    export let index;

    let defaultSrc = "https://solutio.one/solutio-images/logo-01.png";
    let isLoading = true;
    $: displaySrc = image || defaultSrc;

    function handleImageLoad() {
        isLoading = false;
    }

    function handleImageError() {
        isLoading = false;
        displaySrc = defaultSrc;
        console.log("Image error");
    }

    /**
     * @param {{ stopPropagation: () => void; }} event
     */
    // function handleProfileClick(event) {
    //     // Stop the click event from bubbling up to parent elements
    //     event.stopPropagation();

    //     // Your logic for when the profile picture is clicked
    //     goto("/profile/" + userKey);
    // }

    onMount(async () => {
        isLoading = true;
        displaySrc = await validateImageUrl(displaySrc, defaultSrc);
    });
</script>

<div class="container">
    {#if isLoading}
        <div class="spinner"></div>
    {/if}
    <img
        src={displaySrc}
        alt={`Image number ${index + 1}`}
        on:load={handleImageLoad}
        on:error={handleImageError}
        class:loading={isLoading}
    />
</div>

<style>
    .container {
        position: relative;
        width: 100%;
        height: 100%;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        background-color: var(--primary-color);
        opacity: 1;
        transition: opacity 0.3s ease;
    }

    img.loading {
        opacity: 0;
        background-color: var(--forth-color);
    }

    .spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 18px;
        height: 18px;
        border: 2px solid var(--primary-color);
        border-top: 3px solid transparent;
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
</style>
