<script>
    import { deleteImages } from "$lib/data_functions/create_functions";
    import ImageUploader from "./ImageUploader.svelte";
    import SmallImageEdit from "./SmallImageEdit.svelte";

    export let collection_db = "";
    export let key = "";
    /**
     * @type {{ localUrl: string, uploadedUrl: string }[]}
     */
    export let images = []; // Array of image URLs as strings

    /**
     * @type {{localUrl: string, uploadedUrl: string}[]}
     */
    let newImages = []; // Updated to an array of objects

    // Initialize `newImages` with existing `images`
    $: newImages = images;

    /**
     * Add a new image with local and uploaded URLs
     * @param {{ localUrl: string, uploadedUrl: string }} image
     */
    function addNewImage(image) {
        newImages = [...newImages, image];
        images = [...images, image];
        console.log("New image added:", image);
    }

    /**
     * Delete an image by index
     * @param {number} index
     */
    function deleteImage(index) {
        if (index >= 0 && index < images.length) {
            // Splice to remove only the item at the specific index
            images = [...images.slice(0, index), ...images.slice(index + 1)];
            // This reassigns the array to trigger reactivity properly
        } else {
            console.warn("Index out of bounds.");
        }
    }
</script>

<ImageUploader
    {key}
    collection={collection_db}
    addNewImage={(image) => addNewImage(image)}
/>

<div class="image-carousel">
    {#each newImages as image, index (image.uploadedUrl)}
        <div class="small-image-wrapper">
            <SmallImageEdit
                src={image.localUrl}
                someFunction={() => deleteImage(index)}
            />
        </div>
    {/each}
</div>

<style>
    .image-carousel {
        display: flex;
        flex-shrink: 0;
        gap: 10px; /* Space between images */
        overflow-x: auto;
        padding: 15px 0 15px; /* Add top and bottom padding */
        align-items: center; /* Center-align images vertically */
    }

    /* Styling for hiding scrollbars */
    .image-carousel::-webkit-scrollbar {
        height: 6px;
    }

    .image-carousel::-webkit-scrollbar-track {
        background: #e0e0e0;
    }

    .image-carousel::-webkit-scrollbar-thumb {
        background-color: var(--primary-color);
        border-radius: 10px;
    }

    .small-image-wrapper {
        flex-shrink: 0; /* Prevents the images from shrinking */
        overflow: hidden; /* Ensure content stays within bounds */
        border-radius: 8px; /* Optional: add rounded corners */
    }
</style>
