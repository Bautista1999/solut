<script>
    import { validateImageUrl } from "$lib/data_functions/get_functions";
    import { onMount } from "svelte";
    import MagicalDotsSmall from "./MagicalDotsSmall.svelte";

    export let src = "";
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
        <!-- <div class="spinner"></div> -->
        <MagicalDotsSmall />
    </div>
{:else}
    <img
        alt="Scroller Image"
        src={displaySrc}
        on:load={() => (isLoading = false)}
        on:error={() => {
            isLoading = false;
            displaySrc =
                "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg"; // Set fallback if error occurs
        }}
    />
{/if}

<style>
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
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: auto;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
