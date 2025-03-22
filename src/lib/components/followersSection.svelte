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
    import FollowersModal from "./FollowersModal.svelte";
    import { FollowersModal as modalFollowers } from "$lib/stores/other_stores";
    import { getPaginatedFollowersByType } from "../../declarations/satellite/satellite.api";

    /**
     * @param {number} num
     */
    export let amount = 0;
    export let element_key = "";
    export let type = "";
    let follows = false;
    let amount_sub = formatNumber(amount);
    let isLoading = false;

    /**
     * @type {import("../../declarations/satellite/satellite.did").IndexResponseBasicInfo[]}
     */
    let followerList = [];
    let offsetFollowers = 0;

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

    async function getFollowers() {
        debugger;
        isLoading = true;
        try {
            let result = await getPaginatedFollowersByType(
                element_key,
                type,
                [offsetFollowers],
                [],
            );
            if ("Ok" in result) {
                followerList = result.Ok[0];
                amount = Number(result.Ok[1]);
                amount_sub = formatNumber(amount);
            }
        } finally {
            isLoading = false;
        }
    }

    async function getMoreFollowers() {
        offsetFollowers += 20;
        let result = await getPaginatedFollowersByType(
            element_key,
            type,
            [offsetFollowers],
            [],
        );
        if ("Ok" in result) {
            followerList = [...followerList, ...result.Ok[0]];
        }
    }

    async function IncreaseFollowers() {
        if (!(await CheckIfSignedIn())) {
            path.set(window.location.toString());
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
            path.set(window.location.toString());
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

    <div
        class="Followers"
        on:click={() => {
            getFollowers();
            modalFollowers.set(true);
        }}
    >
        Followers: {amount_sub}
    </div>

    <FollowersModal
        users={followerList}
        {amount}
        {isLoading}
        getMoreUsersFunction={getMoreFollowers}
    />
</div>

<style>
    .FollowersSection {
        display: grid;
        grid-template-columns: 0fr 0fr;
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
        cursor: pointer;
    }
    .Followers:hover {
        grid-area: 1 / 2 / 2 / 3;
        display: flex;
        align-items: center; /* Ensures text is centered vertically */
        justify-content: center; /* Center horizontally */
        cursor: pointer;
        color: var(--primary-color);
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
