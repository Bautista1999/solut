<script>
    /**
     * @type {string[]}
     */
    let images = []; // Array of image URLs passed in as a prop
    export let currentImageIndex = images.length;

    /**
     * @param {number} direction
     */
    function scroll(direction) {
        currentImageIndex =
            (currentImageIndex + direction + images.length) % images.length;
    }
    function deleteImage() {
        if (images.length > 0 && currentImageIndex >= 0) {
            images.splice(currentImageIndex, 1); // Remove the image at the current index
            images = [...images];
            if (currentImageIndex > 0) {
                currentImageIndex--; // Adjust the index if needed
            }
        }
    }
    /**
     * @param {string} newImage
     */
    export function addNewImage(newImage) {
        if (newImage == "") {
            return;
        }
        images = [...images, newImage]; // Use spread syntax to trigger reactivity
        currentImageIndex = images.length - 1;
        newImage = "";
    }
</script>

<div id="image-scroller">
    {#if images.length > 0}
        <div class="delete-button-container">
            <button class="delete-button" on:click={deleteImage}>
                <span class="material-symbols-outlined deleteIconHover">
                    delete
                </span>
            </button>
        </div>
        <img alt="Scroller Image" src={images[currentImageIndex]} />
    {:else}
        <div
            style="display: flex; justify-content:center ;align-items:center; margin:auto;height:100%; background-color:black;color:var(--tertiary-color)"
        >
            You havent included any image. Include some images in the text
            field.
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
    .deleteIconHover {
        color: var(--tertiary-color);
    }
    .deleteIconHover:hover {
        color: var(--red-wine);
    }

    #image-scroller {
        width: 75%; /* Set width to 80% of the parent container */
        aspect-ratio: 1200 / 628; /* Maintain the aspect ratio */
        margin: auto; /* Center the scroller */
        position: relative; /* Establish a positioning context for absolutely positioned children */
        overflow: hidden; /* Hide any overflowing content */
        background-position: 10%;
        background-image: url(" https://st3.depositphotos.com/23594922/31822/v/450/depositphotos_318221368-stock-illustration-missing-picture-page-for-website.jpg ");
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

    .delete-button-container {
        position: absolute; /* Position relative to image-scroller */
        top: 10px; /* Adjust as needed */
        right: 10px; /* Adjust as needed */
        z-index: 2; /* Ensure it's above the image */
    }

    .delete-button {
        background-color: var(
            --red-wine
        ); /* Use a color that indicates a delete action */
        color: var(--tertiary-color);
        box-shadow: 4px 4px 0px 0px var(--tertiary-color);
        border: 1px solid var(--tertiary-color);
        padding: 2px;
        cursor: pointer;
        /* Additional styles as needed */
    }

    .delete-button:hover {
        background-color: var(
            --tertiary-color
        ); /* Use a color that indicates a delete action */
        color: var(--red-wine);
        box-shadow: 4px 4px 0px 0px var(--red-wine);
        border: 1px solid var(--red-wine);
    }
</style>
