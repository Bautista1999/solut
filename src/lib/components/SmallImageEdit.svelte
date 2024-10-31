<script>
    export let src = "";
    export let someFunction = (/** @type {string} */ image) => {};
</script>

<div class="image-holder">
    <img {src} alt="Uploaded image" />
    <button class="close-button" on:click={() => someFunction(src)}>✕</button>
</div>

<style>
    .image-holder {
        position: relative;
        width: 150px; /* Width for small size */
        aspect-ratio: 1200 / 628;
        overflow: hidden;
        border-radius: 8px; /* Round shape */
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--primary-color); /* Customize border color */
        background-color: var(
            --background-color,
            #f0f0f0
        ); /* Placeholder background */
    }

    .image-holder img {
        width: 100%;
        height: 100%;
        object-fit: cover; /* Cover to maintain aspect ratio within container */
        display: block;
    }

    .close-button {
        position: absolute;
        top: 5px;
        right: 5px;
        background: rgba(255, 255, 255, 0.8); /* Semi-transparent background */
        border: none;
        border-radius: 50%;
        color: var(--primary-color); /* Customize icon color */
        font-size: 12px;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .close-button:hover {
        background-color: var(--primary-color); /* Change color on hover */
        color: #fff;
    }
</style>
