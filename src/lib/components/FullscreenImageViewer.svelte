<script>
    import { fade, slide } from "svelte/transition";
    import { spring } from "svelte/motion";
    import { onMount } from "svelte";

    /**
     * @typedef {Object} ImageType
     * @property {string} localUrl - The local URL of the image
     * @property {string} uploadedUrl - The uploaded URL of the image
     */

    /** @type {ImageType[]} */
    export let images = [];
    export let currentIndex = 0;
    export let isOpen = false;

    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;
    let dragDistance = spring(0, {
        stiffness: 0.1,
        damping: 0.7,
    });

    /** @type {number} */
    let containerWidth = 0;
    /** @type {HTMLImageElement} */
    let imageElement;

    onMount(() => {
        /**
         * @param {KeyboardEvent} e
         */
        const handleEscape = (e) => {
            if (e.key === "Escape" && isOpen) {
                isOpen = false;
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    });

    /**
     * @param {TouchEvent} e
     */
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        isDragging = true;
    }

    /**
     * @param {TouchEvent} e
     */
    function handleTouchMove(e) {
        if (!isDragging) return;
        touchEndX = e.touches[0].clientX;
        const distance = touchEndX - touchStartX;
        dragDistance.set(distance);
    }

    function handleTouchEnd() {
        if (!isDragging) return;
        isDragging = false;
        const distance = touchEndX - touchStartX;

        if (Math.abs(distance) > containerWidth * 0.2) {
            if (distance > 0 && currentIndex > 0) {
                currentIndex--;
            } else if (distance < 0 && currentIndex < images.length - 1) {
                currentIndex++;
            }
        }

        dragDistance.set(0);
    }

    function nextImage() {
        if (currentIndex < images.length - 1) {
            currentIndex++;
        }
    }

    function previousImage() {
        if (currentIndex > 0) {
            currentIndex--;
        }
    }

    $: currentImage = images[currentIndex]?.localUrl || "";
</script>

{#if isOpen}
    <div
        class="fullscreen-overlay"
        transition:fade={{ duration: 200 }}
        on:click|self={() => (isOpen = false)}
    >
        <button class="close-button" on:click={() => (isOpen = false)}>
            <span class="material-symbols-outlined">close</span>
        </button>

        <div
            class="image-container"
            bind:clientWidth={containerWidth}
            on:touchstart={handleTouchStart}
            on:touchmove={handleTouchMove}
            on:touchend={handleTouchEnd}
        >
            <button
                class="nav-button prev"
                on:click={previousImage}
                style="opacity: {currentIndex === 0 ? '0.5' : '1'}"
                disabled={currentIndex === 0}
            >
                <span class="material-symbols-outlined">chevron_left</span>
            </button>

            <div
                class="image-wrapper"
                style="transform: translateX({$dragDistance}px)"
            >
                <div class="img-container">
                    <img
                        src={currentImage}
                        alt="Fullscreen view"
                        bind:this={imageElement}
                    />
                </div>
            </div>

            <button
                class="nav-button next"
                on:click={nextImage}
                style="opacity: {currentIndex === images.length - 1
                    ? '0.5'
                    : '1'}"
                disabled={currentIndex === images.length - 1}
            >
                <span class="material-symbols-outlined">chevron_right</span>
            </button>
        </div>

        <div class="image-counter">
            {currentIndex + 1} / {images.length}
        </div>
    </div>
{/if}

<style>
    .fullscreen-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .image-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        touch-action: pan-y pinch-zoom;
    }

    .image-wrapper {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease-out;
    }

    .img-container {
        max-height: 70vh;
        max-width: 90vw;
        width: auto;
        height: 90vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
    }

    .img-container img {
        height: 100%;
        width: auto;
        max-width: 90vw;
        object-fit: contain;
        user-select: none;
        -webkit-user-drag: none;
    }

    .close-button {
        position: absolute;
        top: 20px;
        right: 20px;
        background: transparent;
        border: none;
        color: var(--tertiary-color);
        cursor: pointer;
        z-index: 10000;
        padding: 8px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.3s ease;
    }

    .close-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .nav-button {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        color: var(--tertiary-color);
        cursor: pointer;
        padding: 16px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.3s ease;
        z-index: 10000;
    }

    .nav-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .nav-button.prev {
        left: 20px;
    }

    .nav-button.next {
        right: 20px;
    }

    .image-counter {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        color: var(--tertiary-color);
        background-color: rgba(0, 0, 0, 0.5);
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
    }

    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 48;
        font-size: 24px;
    }

    @media (max-width: 768px) {
        .nav-button {
            padding: 12px;
        }

        .close-button {
            top: 12px;
            right: 12px;
        }

        .image-counter {
            bottom: 12px;
        }
    }
</style>
