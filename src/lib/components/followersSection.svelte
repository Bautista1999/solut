<script>
    import { goto } from "$app/navigation";
    import {
        CheckIfFollow,
        followElement,
        unFollowElement,
    } from "$lib/data_functions/create_functions";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import { path } from "$lib/stores/redirect_store";
    import { onMount } from "svelte";

    /**
     * @param {number} num
     */
    export let amount = 0;
    export let element_key = "";
    export let type = "";
    let follows = false;
    let amount_sub = formatNumber(amount);
    /**
     * @param {number} num
     */
    function formatNumber(num) {
        if (num < 1000) {
            return num.toString();
        } else if (num < 1000000) {
            return (num / 1000).toFixed(num % 1000 !== 0 ? 1 : 0) + "K";
        } else {
            return (num / 1000000).toFixed(num % 1000000 !== 0 ? 1 : 0) + "M";
        }
    }

    async function IncreaseFollowers() {
        if (!(await CheckIfSignedIn())) {
            path.set("/solution/" + element_key);
            goto("/signin/");
            return;
        }
        // @ts-ignore
        amount_sub++;
        follows = true;
        console.log("Follow: ", await followElement(element_key, type));
    }
    async function DecreaseFollowers() {
        if (!(await CheckIfSignedIn())) {
            path.set("/solution/" + element_key);
            goto("/signin/");
            return;
        }
        // @ts-ignore
        amount_sub--;
        follows = false;
        console.log("Unfollow: ", await unFollowElement(element_key, type));
    }
    onMount(async () => {
        follows = await CheckIfFollow(element_key);
    });
</script>

<div class="FollowersSection">
    <div class="Heart">
        {#if follows}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <span
                class="material-symbols-outlined"
                style="font-variation-settings: 'FILL'1;"
                on:click={() => DecreaseFollowers()}
            >
                favorite
            </span>
            <!-- svelte-ignore a11y-no-static-element-interactions -->
        {:else}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <span
                class="material-symbols-outlined"
                on:click={() => IncreaseFollowers()}
            >
                favorite
            </span>
        {/if}
    </div>

    <div class="Followers">Followers: {amount_sub}</div>
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
</style>
