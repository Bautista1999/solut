<script>
    import { validateImageUrl } from "$lib/data_functions/get_functions";
    import { onMount } from "svelte";

    export let src = "";
    let displaySrc = "";
    let isLoading = true;

    // Load the image when the component mounts

    $: if (src) {
        isLoading = true;
        (async () => {
            try {
                displaySrc = await validateImageUrl(
                    src,
                    "https://resource.rentcafe.com/image/upload/q_auto,f_auto,c_limit,w_576,h_500/s3/2/50552/image%20not%20available(12).jpg",
                );
            } catch {
                displaySrc =
                    "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";
            } finally {
                isLoading = false;
            }
        })();
    } else {
        displaySrc =
            "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";
        isLoading = false;
    }

    export let someFunction = (/** @type {string} */ image) => {};
</script>

<div class="image-holder">
    {#if isLoading}
        <div class="loadingHolder">
            <div class="spinner"></div>
        </div>
    {:else}
        <img
            alt="Uploaded image"
            src={displaySrc}
            on:load={() => {
                console.log("Image loaded successfully.");
                isLoading = false;
            }}
            on:error={() => {
                console.log("Image failed to load, setting fallback.");
                isLoading = false;
                displaySrc =
                    "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";
            }}
        />
    {/if}
    <button class="close-button" on:click={() => someFunction(src)}>✕</button>
</div>

<style>
    .image-holder {
        position: relative;
        width: 150px;
        aspect-ratio: 1200 / 628;
        overflow: hidden;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--primary-color);
        background-color: var(--background-color, #f0f0f0);
    }

    .loadingHolder {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%; /* Full height to match the image container */
    }

    .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .image-holder img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .close-button {
        position: absolute;
        top: 5px;
        right: 5px;
        background: rgba(255, 255, 255, 0.8);
        border: none;
        border-radius: 50%;
        color: var(--primary-color);
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
        background-color: var(--primary-color);
        color: #fff;
    }
</style>
