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
    import FollowersModalDisplay from "./FollowersModalDisplay.svelte";
    import { FollowersModal, FollowingModal } from "$lib/stores/other_stores";
    import {
        getFollowersAndFollowing,
        getTotalFollowers,
    } from "$lib/data_functions/get_functions";
    import FollowingModalDisplay from "./FollowingModalDisplay.svelte";

    /**
     * @param {number} num
     */
    export let amount = 0;
    export let element_key = "";
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
    onMount(async () => {
        follows = await CheckIfFollow(element_key);
    });
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="FollowersSection">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    {#await getFollowersAndFollowing(element_key)}
        <div class="Followers" on:click={() => {}}>
            Followers: {0}
        </div>
        <p>|</p>
        <div class="Followers" on:click={() => {}}>
            Following: {0}
        </div>
    {:then data}
        <div
            class="Followers"
            on:click={() => {
                FollowersModal.set(true);
            }}
        >
            Followers: {data.followers}
        </div>
        <p>|</p>
        <div
            class="Followers"
            on:click={() => {
                FollowingModal.set(true);
            }}
        >
            Following: {data.following}
        </div>
        <FollowersModalDisplay
            elementId={element_key}
            amount={data.followers}
        />
        <FollowingModalDisplay
            elementId={element_key}
            amount={data.following}
        />
    {/await}
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
</style>
