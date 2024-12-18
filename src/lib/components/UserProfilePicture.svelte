<script>
    import { validateImageUrl } from "$lib/data_functions/get_functions";

    export let displaySrc = "";

    let isLoading = true;

    // Load the image when the component mounts

    $: if (displaySrc) {
        // debugger;
        isLoading = true;
        (async () => {
            try {
                displaySrc = await validateImageUrl(
                    displaySrc,
                    "https://cdn-icons-png.freepik.com/512/8792/8792047.png",
                );
            } catch {
                displaySrc =
                    "https://cdn-icons-png.freepik.com/512/8792/8792047.png";
            } finally {
                isLoading = false;
            }
        })();
    } else {
        displaySrc = "https://cdn-icons-png.freepik.com/512/8792/8792047.png";
        isLoading = false;
    }
</script>

{#if isLoading}
    <div class="loadingHolder">
        <div class="spinner"></div>
    </div>
{:else}
    <div class="profile-image">
        <img src={displaySrc} alt="Profile Image" />
    </div>
{/if}

<style>
    .profile-image img {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
        box-shadow: 0px 2px 8px 0px rgb(243, 81, 0);
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
    .loadingHolder {
        width: 100px;
        height: 100px; /* Full height to match the image container */
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--tertiary-color);
    }
    @media (max-width: 768px) {
        /* Username Section Adjustments */

        .profile-image img {
            width: 80px; /* Smaller profile image */
            height: 80px;
        }
        .loadingHolder {
            min-width: 80px;
            max-height: 80px;
        }
    }
</style>
