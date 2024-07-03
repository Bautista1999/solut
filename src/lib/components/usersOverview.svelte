<script>
    import { onMount } from "svelte";
    import PledgerProfilePicture from "./PledgerProfilePicture.svelte";

    // Import the images or define their URLs
    /**
     * @type {Array<import("$lib/data_objects/data_types").UserProfilePic>}
     */
    export let users = [];
    export let card = false;
</script>

{#if card}
    <div class="image-scroller_card" style="">
        {#each users as user, index (user)}
            <div
                class="image-container_card"
                style="left: {index * 15}px; z-index: {100 - index}; "
            >
                <PledgerProfilePicture image={user.image} {index} />
            </div>
        {/each}
    </div>
{:else}
    <div class="image-scroller">
        {#each users as user, index (user)}
            <div
                class="image-container"
                style="left: {index * 25}px; z-index: {100 - index};"
            >
                <PledgerProfilePicture image={user.image} {index} />
            </div>
        {/each}
    </div>
{/if}

<style>
    .image-scroller {
        margin-top: 15px;
        position: absolute;
        height: 0px; /* Adjust if necessary */
        display: flex;
        /* Removed justify-content: center; to allow starting from the beginning */
        flex-wrap: nowrap; /* Prevent images from wrapping onto multiple lines */
    }

    .image-container {
        /* Removed position: absolute; to keep images in the flow of the document */
        margin-right: -25px; /* Adjust space between images */
        border-radius: 50%; /* Make images round */
        overflow: hidden; /* Hide overflow to maintain the circular shape */
        width: 45px; /* Width of the images */
        height: 45px; /* Height of the images */
        border: 2px solid var(--secondary-color);
        cursor: pointer;
        transition:
            border-color 0.3s ease,
            width 0.1s ease,
            height 0.1s ease;
    }

    .image-container:last-child {
        margin-right: 3px; /* No margin for the last image */
    }
    .image-container:hover {
        bottom: 0; /* Align images to the bottom */
        border-radius: 50%; /* Make images round */
        overflow: hidden; /* Hide overflow to maintain the circular shape */
        width: 60px; /* Width of the images */
        height: 60px; /* Height of the images */
        border: 2px solid var(--primary-color);
        z-index: 300;
    }
    .image-container:active {
        bottom: 0; /* Align images to the bottom */
        border-radius: 50%; /* Make images round */
        overflow: hidden; /* Hide overflow to maintain the circular shape */
        width: 45px; /* Width of the images */
        height: 45px; /* Height of the images */
        border: 2px solid var(--primary-color);
    }

    .image-container img {
        width: 100%;
        height: 100%;
        object-fit: cover; /* Ensure images cover the container without distortion */
    }
    .image-scroller_card {
        position: absolute;
        display: flex;
        /* Removed justify-content: center; to allow starting from the beginning */
        flex-wrap: nowrap; /* Prevent images from wrapping onto multiple lines */
        margin-top: 0px;
        height: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .image-container_card {
        /* Removed position: absolute; to keep images in the flow of the document */
        margin-right: -25px; /* Adjust space between images */
        border-radius: 50%; /* Make images round */
        overflow: hidden; /* Hide overflow to maintain the circular shape */
        width: 45px; /* Width of the images */
        height: 45px; /* Height of the images */
        border: 2px solid var(--secondary-color);
        width: 30px;
        height: 30px;
        transition:
            border-color 0.3s ease,
            width 0.1s ease,
            height 0.1s ease;
    }

    .image-container_card:last-child {
        margin-right: 3px; /* No margin for the last image */
    }

    .image-container_card img {
        width: 100%;
        height: 100%;
        object-fit: cover; /* Ensure images cover the container without distortion */
    }
    @media (max-width: 480px) {
        .image-container {
            /* Removed position: absolute; to keep images in the flow of the document */
            margin-right: -25px; /* Adjust space between images */
            border-radius: 50%; /* Make images round */
            overflow: hidden; /* Hide overflow to maintain the circular shape */
            transform: translateY(-5px);
            width: 30px; /* Width of the images */
            height: 30px; /* Height of the images */
            border: 2px solid var(--secondary-color);
            cursor: pointer;
            transition:
                border-color 0.3s ease,
                width 0.1s ease,
                height 0.1s ease;
        }
    }
</style>
