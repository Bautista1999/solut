<script>
    import { fade } from "svelte/transition";
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

    let containerWidth = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isDragging = false;
    let isVerticalDrag = false;
    let isClosing = false;

    let slidePosition = spring(0, {
        stiffness: 0.2,
        damping: 1,
    });

    let verticalOffset = spring(0, {
        stiffness: 0.3,
        damping: 0.7,
    });

    let scale = spring(1, {
        stiffness: 0.3,
        damping: 0.7,
    });

    let opacity = spring(1, {
        stiffness: 0.3,
        damping: 0.7,
    });

    /** @type {HTMLImageElement} */
    let imageElement;

    function resetSpringValues(hard = false) {
        const opts = hard ? { hard: true } : {};
        verticalOffset.set(0, opts);
        scale.set(1, opts);
        opacity.set(1, opts);
        isClosing = false;
    }

    // Initialize slide position as soon as the component is created
    $: if (isOpen && containerWidth) {
        slidePosition.set(-currentIndex * containerWidth, { hard: true });
        resetSpringValues(true);
    }

    // Handle subsequent changes to currentIndex
    $: if (!isDragging && isOpen && containerWidth) {
        slidePosition.set(-currentIndex * containerWidth);
    }

    onMount(() => {
        /**
         * @param {KeyboardEvent} e
         */
        const handleKeydown = (e) => {
            if (!isOpen || isClosing) return;

            if (e.key === "Escape") {
                closeViewer();
            } else if (e.key === "ArrowLeft") {
                previousImage();
            } else if (e.key === "ArrowRight") {
                nextImage();
            }
        };

        window.addEventListener("keydown", handleKeydown);
        return () => window.removeEventListener("keydown", handleKeydown);
    });

    /**
     * @param {TouchEvent} e
     */
    function handleTouchStart(e) {
        if (isClosing) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].pageY;
        isDragging = true;
        isVerticalDrag = false;
    }

    /**
     * @param {TouchEvent} e
     */
    function handleTouchMove(e) {
        if (!isDragging) return;

        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].pageY;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        if (
            !isVerticalDrag &&
            Math.abs(deltaY) > 10 &&
            Math.abs(deltaY) > Math.abs(deltaX)
        ) {
            isVerticalDrag = true;
        }

        if (isVerticalDrag) {
            verticalOffset.set(deltaY, { hard: true });
            const progress = Math.min(Math.abs(deltaY) / 200, 1);
            scale.set(1 - progress * 0.2, { hard: true });
            opacity.set(1 - progress, { hard: true });
        } else {
            slidePosition.set(currentIndex * -containerWidth + deltaX, {
                hard: true,
            });
        }
    }

    function handleTouchEnd() {
        if (!isDragging) return;
        isDragging = false;

        if (isVerticalDrag) {
            const deltaY = touchEndY - touchStartY;
            if (Math.abs(deltaY) > 100) {
                isOpen = false;
            } else {
                verticalOffset.set(0);
                scale.set(1);
                opacity.set(1);
            }
        } else {
            const deltaX = touchEndX - touchStartX;
            if (Math.abs(deltaX) > containerWidth * 0.2) {
                if (deltaX > 0 && currentIndex > 0) {
                    currentIndex--;
                } else if (deltaX < 0 && currentIndex < images.length - 1) {
                    currentIndex++;
                }
            }
            slidePosition.set(-currentIndex * containerWidth);
        }
    }

    function onRelease() {
        isOpen = false;
    }

    function closeViewer() {
        onRelease();
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
        transition:fade={{ duration: 100 }}
        on:click|self={closeViewer}
        style="opacity: {$opacity};"
    >
        <button class="close-button" on:click={closeViewer}>
            <span class="material-symbols-outlined">close</span>
        </button>

        <div
            class="image-container"
            bind:clientWidth={containerWidth}
            on:touchstart={handleTouchStart}
            on:touchmove={handleTouchMove}
            on:touchend={handleTouchEnd}
            style="transform: translateY({$verticalOffset}px);"
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
                class="images-wrapper"
                style="transform: translateX({$slidePosition}px) scale({$scale});"
            >
                {#each images as image, i}
                    <div class="image-slide">
                        <img
                            src={image.localUrl}
                            alt="Fullscreen view"
                            draggable="false"
                        />
                    </div>
                {/each}
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
        pointer-events: auto;
    }

    .image-container {
        position: relative;
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        touch-action: none;
        pointer-events: none;
        will-change: transform;
    }

    .images-wrapper {
        position: absolute;
        left: 0;
        display: flex;
        height: 100%;
        transition: transform 0.3s ease-out;
        will-change: transform;
        pointer-events: none;
        transform-origin: center;
    }

    .image-slide {
        flex: 0 0 100vw;
        width: 100vw;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
    }

    .image-slide img {
        max-height: 90vh;
        max-width: 90vw;
        object-fit: contain;
        user-select: none;
        -webkit-user-drag: none;
        pointer-events: auto;
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
        pointer-events: auto;
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
        transition: all 0.3s ease;
        z-index: 10000;
        pointer-events: auto;
    }

    .nav-button:hover:not(:disabled) {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .nav-button:disabled {
        cursor: not-allowed;
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
