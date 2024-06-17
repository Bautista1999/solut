<script>
    import ImageUrl from "./ImageUrl.svelte";

    /**
     * @type {string | any[]}
     */
    export let images = []; // Array of image URLs passed in as a prop
    let currentImageIndex = 0;

    /**
     * @param {number} direction
     */
    function scroll(direction) {
        currentImageIndex =
            (currentImageIndex + direction + images.length) % images.length;
    }
</script>

<div id="image-scroller">
    {#if images.length > 0}
        <ImageUrl src={images[currentImageIndex]} />
    {:else}
        <div
            style="display: flex; justify-content:center ;align-items:center; margin:auto;height:100%; background-color:black;color:var(--tertiary-color)"
        >
            No images included.
        </div>
    {/if}
    <div class="ButtonSection">
        <div class="buttons">
            <button on:click={() => scroll(-1)}>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
                />
                <span class="material-symbols-outlined"> arrow_back </span>
            </button>

            {#if images.length > 0}{currentImageIndex +
                    1}/{images.length}{:else}0/0{/if}
            <button on:click={() => scroll(1)}>
                <span class="material-symbols-outlined">
                    arrow_forward
                </span></button
            >
        </div>
    </div>
</div>

<style>
    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 48;
        color: var(--tertiary-color);
    }
    .material-symbols-outlined:hover {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 48;
        color: var(--primary-color);
    }

    #image-scroller {
        width: 75%; /* Set width to 80% of the parent container */
        aspect-ratio: 1200 / 628; /* Maintain the aspect ratio */
        margin: auto; /* Center the scroller */
        position: relative; /* Establish a positioning context for absolutely positioned children */
        overflow: hidden; /* Hide any overflowing content */
        background-position: 10%;
    }

    #image-scroller img {
        width: 100%; /* Make the image fill the width */
        height: 100%; /* Make the image fill the height */
        object-fit: cover; /* Cover the container, cropping where necessary */
        display: block; /* Prevent inline default spacing */
    }
    .ButtonSection {
        position: absolute; /* Absolute position relative to #image-scroller */
        bottom: 0; /* Position at the bottom of the #image-scroller */
        margin-bottom: 8px;
        left: 50%; /* Start at 50% from the left */
        transform: translateX(-50%); /* Center align the .ButtonSection */
        z-index: 1; /* Ensure it's above the images */
        /* rest of your styles */
    }
    .buttons {
        display: flex; /* Set the display to flex to enable flexbox properties */
        flex-direction: row; /* Align children in a row (horizontal alignment) */
        justify-content: center; /* Horizontally center the items in the container */
        align-items: center; /* Vertically align the items in the middle */
        color: var(--forth-color);
        margin-top: 10px; /* Space between image and buttons */
        background-color: var(
            --secondary-color
        ); /* Background color of the buttons container */
        width: fit-content; /* Container width to fit its content */
        padding: 5px; /* Padding around the content inside the container */
        border-radius: 5px; /* Rounded corners for the container */
        border: 0px solid var(--primary-color);
        opacity: 60%;
        transition:
            background-color 0.3s ease,
            opacity 0.3s ease,
            border 0.3s ease; /* Smooth transition for background color and border */
    }
    .buttons:hover {
        opacity: 100%;
        border: 1px solid var(--primary-color);
    }

    .buttons button {
        margin: 0 5px; /* Space between buttons */
        background-color: transparent;
        cursor: pointer;
        border: 0px solid var(--primary-color);
    }
</style>
