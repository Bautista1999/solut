<script>
    import { validateImageUrl } from "$lib/data_functions/get_functions";
    import { onMount } from "svelte";

    export let src = "";
    export let enableFullscreen = false; // Add this to make fullscreen optional
    export let onFullscreenClick = () => {}; // Function to handle fullscreen click

    let displaySrc = "";
    let isLoading = true;

    // Reactive statement to handle `src` changes dynamically
    $: if (src) {
        isLoading = true;
        (async () => {
            displaySrc = await validateImageUrl(
                src,
                "https://resource.rentcafe.com/image/upload/q_auto,f_auto,c_limit,w_576,h_500/s3/2/50552/image%20not%20available(12).jpg",
            );
            isLoading = false; // Mark loading as complete once URL is validated
        })().catch(() => {
            displaySrc =
                "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";
            isLoading = false; // Handle errors and set fallback image
        });
    } else {
        displaySrc =
            "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";
        isLoading = false;
    }
</script>

{#if isLoading}
    <div class="loadingHolder">
        <div class="spinner"></div>
    </div>
{:else}
    <div
        class="image-container"
        class:clickable={enableFullscreen}
        on:click={() => enableFullscreen && onFullscreenClick()}
        on:keydown={(e) => {
            if (enableFullscreen && (e.key === "Enter" || e.key === " ")) {
                onFullscreenClick();
            }
        }}
        role={enableFullscreen ? "button" : undefined}
        tabindex={enableFullscreen ? 0 : undefined}
    >
        <img
            alt="Scroller Image"
            src={displaySrc}
            on:load={() => (isLoading = false)}
            on:error={() => {
                isLoading = false;
                displaySrc =
                    "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";
            }}
        />
        {#if enableFullscreen}
            <div class="hover-overlay">
                <div class="zoom-hint">
                    <span class="material-symbols-outlined">zoom_in</span>
                    Click to zoom
                </div>
            </div>
        {/if}
    </div>
{/if}

<style>
    .image-container {
        width: 100%;
        height: 100%;
        position: relative;
        display: block;
    }

    .clickable {
        cursor: pointer;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .loadingHolder {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%; /* Ensures it takes up the full height of the container */
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--tertiary-color);
        border-top-color: var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .hover-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0);
        display: flex;
        justify-content: center;
        align-items: center;
        transition: background-color 0.3s ease;
        opacity: 0;
    }

    .clickable:hover .hover-overlay {
        opacity: 1;
        background-color: rgba(0, 0, 0, 0.5);
    }

    .zoom-hint {
        color: var(--tertiary-color);
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        background-color: rgba(0, 0, 0, 0.7);
    }

    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 48;
    }
</style>
