<script>
    import { editImages, UserKey } from "$lib/stores/other_stores";
    import IconButton from "./IconButton.svelte";
    import ImageUrl from "./ImageUrl.svelte";
    import FullscreenImageViewer from "./FullscreenImageViewer.svelte";
    import { onMount } from "svelte";
    import { spring } from "svelte/motion";

    /**
     * @type {{ localUrl: string, uploadedUrl: string }[]}
     */
    export let newImages = [];
    let currentImageIndex = 0;
    let isFullscreen = false;
    let containerWidth = 0;

    // Sliding animation state
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;
    let slidePosition = spring(0, {
        stiffness: 0.15,
        damping: 0.8,
    });

    /**
     * Preloads an image in the background
     * @param {string} src - The image source URL
     */
    function preloadImage(src) {
        const img = new Image();
        img.src = src;
    }

    onMount(() => {
        if (newImages.length > 0) {
            newImages.slice(1).forEach((img) => {
                preloadImage(img.localUrl);
            });
        }
    });

    /**
     * Handles touch start event
     * @param {TouchEvent} e
     */
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        isDragging = true;
    }

    /**
     * Handles touch move event
     * @param {TouchEvent} e
     */
    function handleTouchMove(e) {
        if (!isDragging) return;
        touchEndX = e.touches[0].clientX;
        const distance = touchEndX - touchStartX;
        slidePosition.set(currentImageIndex * -containerWidth + distance);
    }

    /**
     * Handles touch end event
     */
    function handleTouchEnd() {
        if (!isDragging) return;
        isDragging = false;
        const distance = touchEndX - touchStartX;

        if (Math.abs(distance) > containerWidth * 0.2) {
            if (distance > 0 && currentImageIndex > 0) {
                currentImageIndex--;
            } else if (
                distance < 0 &&
                currentImageIndex < newImages.length - 1
            ) {
                currentImageIndex++;
            }
        }
        slidePosition.set(currentImageIndex * -containerWidth);
    }

    /**
     * Handles mouse wheel events for horizontal scrolling
     * @param {WheelEvent} event
     */
    function handleScroll(event) {
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
            event.preventDefault();
            const threshold = 50;

            if (Math.abs(event.deltaX) > threshold) {
                if (
                    event.deltaX > 0 &&
                    currentImageIndex < newImages.length - 1
                ) {
                    currentImageIndex++;
                    slidePosition.set(currentImageIndex * -containerWidth);
                } else if (event.deltaX < 0 && currentImageIndex > 0) {
                    currentImageIndex--;
                    slidePosition.set(currentImageIndex * -containerWidth);
                }
            }
        }
    }

    /**
     * Function to scroll through images with buttons
     * @param {number} direction
     */
    function scroll(direction) {
        const newIndex = currentImageIndex + direction;
        if (newIndex >= 0 && newIndex < newImages.length) {
            currentImageIndex = newIndex;
            slidePosition.set(currentImageIndex * -containerWidth);
        }
    }

    $: {
        // Update slide position when currentImageIndex changes
        if (!isDragging) {
            slidePosition.set(currentImageIndex * -containerWidth);
        }
    }

    function startEditingImages() {
        editImages.set(true);
    }

    export let saveChanges = () => {};
    export let cancelChanges = () => {};
    export let owner = "";
</script>

<div
    id="image-scroller"
    on:wheel={handleScroll}
    bind:clientWidth={containerWidth}
    on:touchstart={handleTouchStart}
    on:touchmove={handleTouchMove}
    on:touchend={handleTouchEnd}
>
    <div
        class="images-container"
        style="transform: translateX({$slidePosition}px)"
    >
        {#each newImages as image, i}
            <div class="image-slide">
                <ImageUrl
                    src={image.localUrl}
                    enableFullscreen={true}
                    onFullscreenClick={() => {
                        currentImageIndex = i;
                        isFullscreen = true;
                    }}
                />
            </div>
        {/each}
    </div>

    <div class="ButtonSection">
        <div class="buttons">
            <button
                on:click={() => scroll(-1)}
                disabled={currentImageIndex === 0}
            >
                <span class="material-symbols-outlined">arrow_back</span>
            </button>

            {#if newImages.length > 0}
                {currentImageIndex + 1}/{newImages.length}
            {:else}
                0/0
            {/if}
            <button
                on:click={() => scroll(1)}
                disabled={currentImageIndex === newImages.length - 1}
            >
                <span class="material-symbols-outlined">arrow_forward</span>
            </button>
        </div>
    </div>
</div>

<FullscreenImageViewer
    bind:isOpen={isFullscreen}
    images={newImages}
    bind:currentIndex={currentImageIndex}
/>

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
        background-color: black;
        touch-action: pan-y pinch-zoom;
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
        z-index: 4;
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
    .buttons button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .images-container {
        display: flex;
        width: 100%;
        height: 100%;
        transition: transform 0.3s ease-out;
        will-change: transform;
    }
    .image-slide {
        flex: 0 0 100%;
        width: 100%;
        height: 100%;
    }
    @media (max-width: 480px) {
        #image-scroller {
            margin: 0 !important;
            padding: 0 !important;
            width: 75%;
        }
        .actions {
            transform: translateY(-50px);
        }
    }
</style>
