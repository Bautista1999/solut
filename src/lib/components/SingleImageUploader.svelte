<script>
    import { onMount, onDestroy } from "svelte";
    import FileUploader from "./FileUploader.svelte";
    import { nanoid } from "nanoid";

    import {
        deleteImages,
        saveImageDatabase,
    } from "$lib/data_functions/create_functions";
    import MagicalDotsAbsolut from "./MagicalDotsAbsolut.svelte";
    import MagicalDotsSmall from "./MagicalDotsSmall.svelte";
    import SingleFileUploader from "./SingleFileUploader.svelte";

    /**
     * @type {string[]}
     */
    export let uploadedImages = []; // Array of URLs to store uploaded images
    /**
     * @type {File[]}
     */
    let files = []; // Array to hold selected files
    /**
     * @type {string[]}
     */
    let imagesToDelete = []; // Array to track images that may need deletion if not saved

    export let localUrl = "";
    export let uploadedUrl = "";

    const maxFileSize = 1 * 1024 * 1024; // 2MB limit for image files
    const validExtensions = ["image/png", "image/jpeg"];
    const IMAGE_COLLECTION = "images"; // Define collection name for the image storage
    export let collection = "";
    export let key = "";
    let loading = false;
    /**
     * Handles the upload of a single file, after validating that it's a `File` object
     * with an `arrayBuffer` method.
     * @param {File} file - A file object that has type and arrayBuffer properties.
     */
    async function handleUpload(file) {
        if (!(file instanceof File) || !file.arrayBuffer) {
            console.error("Invalid file format.");
            return;
        }
        let name = nanoid();
        // Display the local URL instantly
        let localUrlProcessed = getLocalUrl(file);
        localUrl = localUrlProcessed ? localUrlProcessed : "";
        if (localUrl) {
            uploadedUrl =
                "https://solutio.one/images/" +
                name +
                "." +
                file.type.split("/").pop();
        } else {
            alert("Something went wrong when uploading file!");
            return;
        }
        loading = true;
        try {
            const response = await saveImageDatabase(
                IMAGE_COLLECTION,
                file,
                key,
                collection,
                name,
            );
            console.log("Uploaded image: ", response);
            if ("Ok" in response) {
                const url = response.Ok;
                uploadedImages = [...uploadedImages, url];
                const imageName = url.split("/").pop();
                imagesToDelete.push(imageName ? "/images/" + imageName : ""); // Track image name for potential deletion
            } else if ("Err" in response) {
                alert(`Failed to upload ${file.name}: ${response.Err}`);
            }
        } catch (error) {
            alert(`Unexpected error uploading ${file.name}: ${error}`);
        }
        loading = false;
    }

    // Helper function to convert a File to a local URL
    /**
     * @param {File} file
     */
    function getLocalUrl(file) {
        if (!(file instanceof File)) {
            console.error("Provided input is not a File.");
            return null;
        }
        return URL.createObjectURL(file); // Creates a local URL for the File
    }
    // Delete all images in the list `imagesToDelete`
    async function deleteAllImages() {
        if (imagesToDelete.length > 0) {
            console.log(await deleteImages(IMAGE_COLLECTION, imagesToDelete));
            uploadedImages = [];
            imagesToDelete = [];
        }
    }
</script>

<SingleFileUploader
    bind:files
    {maxFileSize}
    {validExtensions}
    handleUpload={async (file) => {
        handleUpload(file);
    }}
/>

<!-- {#if uploadedImages.length > 0}
    <div class="uploadedImages">
        <h3>Uploaded Image URLs:</h3>
        <ul>
            {#each uploadedImages as url}
                <li><a href={url} target="_blank">{url}</a></li>
            {/each}
        </ul>
    </div>
    <button on:click={deleteAllImages}>Delete All Images</button>
{/if} -->

<style>
</style>
