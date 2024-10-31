<script>
    import { editImages, UserKey } from "$lib/stores/other_stores";
    import IconButton from "./IconButton.svelte";
    import ImageUrl from "./ImageUrl.svelte";

    /**
     * @type {{ localUrl: string, uploadedUrl: string }[]}
     */
    export let newImages = []; // Updated type for newImages

    let currentImageIndex = 0;

    /**
     * Function to scroll through images.
     * @param {number} direction
     */
    function scroll(direction) {
        currentImageIndex =
            (currentImageIndex + direction + newImages.length) %
            newImages.length;
    }

    /**
     * Function to handle horizontal scroll events.
     * @param {WheelEvent} event
     */
    function handleScroll(event) {
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
            event.stopPropagation();
            event.preventDefault();
            if (event.deltaX < 0) {
                scroll(-1);
            } else if (event.deltaX > 0) {
                scroll(1);
            }
        }
    }

    function startEditingImages() {
        editImages.set(true);
    }

    export let saveChanges = () => {};
    export let cancelChanges = () => {};
    export let owner = "";
</script>

<div id="image-scroller" on:wheel={handleScroll}>
    {#if newImages.length > 0}
        <ImageUrl src={newImages[currentImageIndex].localUrl} />
        <!-- Display localUrl -->
    {:else}
        <div
            style="display: flex; justify-content:center; align-items:center; margin:auto; height:100%; background-color:black; color:var(--tertiary-color);"
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
                <span class="material-symbols-outlined">arrow_back</span>
            </button>

            {#if newImages.length > 0}
                {currentImageIndex + 1}/{newImages.length}
            {:else}
                0/0
            {/if}
            <button on:click={() => scroll(1)}>
                <span class="material-symbols-outlined">arrow_forward</span>
            </button>
        </div>
    </div>
</div>
{#if owner == $UserKey}
    <div class="actions">
        {#if !$editImages}
            <IconButton icon={"edit"} someFunction={startEditingImages} />
        {:else}
            <IconButton icon={"check"} someFunction={saveChanges} />
            <IconButton icon={"close"} someFunction={cancelChanges} />
        {/if}
    </div>
{/if}

<style>
    .actions {
        right: 10px;
        transform: translateY(-50px);
        display: flex;
        position: absolute;
        gap: 10px;
        z-index: 1000;
        align-items: center;
    }
    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 48;
        color: var(--tertiary-color);
    }
    .material-symbols-outlined:hover {
        color: var(--primary-color);
    }
    #image-scroller {
        width: 75%;
        aspect-ratio: 1200 / 628;
        margin: auto;
        position: relative;
        overflow: hidden;
        background-position: 10%;
    }
    #image-scroller img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
    .ButtonSection {
        position: absolute;
        bottom: 0;
        margin-bottom: 8px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1;
    }
    .buttons {
        display: flex;
        justify-content: center;
        align-items: center;
        color: var(--forth-color);
        margin-top: 10px;
        background-color: var(--secondary-color);
        width: fit-content;
        padding: 5px;
        border-radius: 5px;
        border: 0px solid var(--primary-color);
        opacity: 60%;
        transition:
            background-color 0.3s ease,
            opacity 0.3s ease,
            border 0.3s ease;
    }
    .buttons:hover {
        opacity: 100%;
        border: 1px solid var(--primary-color);
    }
    .buttons button {
        margin: 0 5px;
        background-color: transparent;
        cursor: pointer;
        border: 0px solid var(--primary-color);
    }
    @media (max-width: 480px) {
        #image-scroller {
            margin: 0 !important;
            padding: 0 !important;
            width: 75%;
            aspect-ratio: 1200 / 628;
            position: relative;
            overflow: hidden;
            background-position: 10%;
        }
        .actions {
            transform: translateY(-50px);
        }
    }
</style>
