<script>
    import { onMount } from "svelte";
    import PledgerProfilePicture from "./PledgerProfilePicture.svelte";

    // Import the images or define their URLs
    /**
     * @type {Array<import("$lib/data_objects/data_types").UserProfilePic>}
     */
    export let users = [];
    export let card = false;
    export let message = " -- No pledgers yet";
</script>

{#if card}
    <div class="image-scroller_card" style="">
        {#each users as user, index (user)}
            <div
                class="image-container_card"
                style="left: {index * 7}px; z-index: {5 -
                    index}; background-color:red;"
            >
                <PledgerProfilePicture image={user.image} {index} />
            </div>
        {/each}
        {#if users.length == 0}
            <div
                class=""
                style="width:100%; border:1px solid transparent; display:flex ; height :30px; align-items:center; justify-content:start;"
            >
                <p
                    style="text-align: left; font-style:italic; font-size:small; "
                >
                    {message}
                </p>
            </div>
        {/if}
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
        {#if users.length == 0}
            <p style="text-align: center; font-style:italic;">
                {message}
            </p>
        {/if}
    </div>
{/if}

<style>
    .image-scroller {
        margin-top: 15px;
        position: absolute;
        height: 0px;
        display: flex;
        flex-wrap: nowrap;
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

    .image-scroller_card {
        display: flex;
        margin-top: 0px;
        margin-block: 4px;
        height: 30px;
        min-height: 30px;
    }

    .image-container_card {
        position: relative;
        margin-right: -20px;
        border-radius: 50%;
        overflow: hidden;

        border: 1px solid var(--tertiary-color);
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
