<script>
    let copy = false;
    export async function copyLink() {
        // Get the current webpage URL
        const url = window.location.href;

        // Create a temporary input element to hold the URL
        const tempInput = document.createElement("input");
        tempInput.value = url;
        document.body.appendChild(tempInput);

        // Select the URL text and copy it to the clipboard
        tempInput.select();
        document.execCommand("copy");

        // Clean up by removing the temporary input element
        document.body.removeChild(tempInput);
        copy = true;
        await setTimeout(() => {
            copy = false;
        }, 2000);
    }
</script>

<div class="FollowersSection">
    <div class="Heart">
        <span class="material-symbols-outlined" on:click={copyLink}>
            share
        </span>
    </div>
    <div class="Followers">Share</div>
    {#if copy}
        <span class="copied-message">Link copied!</span>
    {/if}
</div>

<style>
    .FollowersSection {
        display: grid;
        grid-template-columns: 0fr 0.5fr;
        grid-template-rows: 1fr;
        gap: 0px 10px;
        grid-auto-flow: row;
        grid-area: FollowersSection;
        display: flex; /* Use flexbox for layout */
        justify-content: center; /* Center horizontally */
        align-items: center; /* Center vertically */
        flex-direction: row; /* Stack children vertically */
    }

    .Heart {
        grid-area: 1 / 1 / 2 / 2;
        display: flex;
        align-items: center; /* Ensures the icon is centered vertically within its container */
        justify-content: center; /* Center horizontally within its container */
    }

    .Followers {
        grid-area: 1 / 2 / 2 / 3;
        display: flex;
        align-items: center; /* Ensures text is centered vertically */
        justify-content: center; /* Center horizontally */
    }

    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 48;
        color: var(--primary-color);
        cursor: pointer;
    }
    .material-symbols-outlined:hover {
        font-variation-settings:
            "FILL" 1,
            "wght" 400,
            "GRAD" 0,
            "opsz" 48;
        color: var(--primary-color);
    }

    .copied-message {
        position: absolute;
        color: var(--primary-color);
        border-radius: 4px;
        transform: translateY(150%) translateX(10%);
        z-index: 1000;
        transition: opacity 0.3s ease-in-out;
    }
</style>
