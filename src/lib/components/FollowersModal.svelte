<script>
    import Modal from "./modal.svelte";
    import { FollowersModal, FollowingModal } from "$lib/stores/other_stores";

    import BasicButton from "./basicButton.svelte";
    import BasicButtonSmall from "./BasicButton_Small.svelte";
    import BasicButtonDarkSmall from "./BasicButton_Dark_Small.svelte";
    import { onDestroy, onMount } from "svelte";
    import LoadingModalNew from "./LoadingModalNew.svelte";
    import ErrorModalNew from "./ErrorModalNew.svelte";
    import { getFollowingsAndTheirInformation } from "$lib/data_functions/get_functions";
    import FollowerDisplay from "./FollowerDisplay.svelte";

    export let amount = 0;

    let errorFlag = false;
    let errorMsg = "";

    export let pages = {
        start: "",
        limit: 20,
    };

    /**
     * @type {import("../../declarations/satellite/satellite.did").IndexResponseBasicInfo[]}
     */
    export let users = [];

    export let getMoreUsersFunction = () => {};

    let isLoading = false;

    // Handler for detecting scrolling to the bottom of the modal content
    // @ts-ignore
    async function handleScroll(event) {
        const element = event.target;

        // Check if user scrolled to the bottom of the modal
        if (
            element.scrollTop + element.clientHeight >= element.scrollHeight &&
            !isLoading &&
            users.length < amount
        ) {
            isLoading = true; // Prevent multiple triggers
            await getMoreUsersFunction();
            isLoading = false;
        }
    }

    /**
     * @param {string} type
     */
    function correctType(type) {
        if (type == "user") {
            return "profile";
        } else if (type == "idea") {
            return "topic";
        } else if (type == "feature") {
            return "idea";
        } else {
            return type;
        }
    }
</script>

<Modal
    bind:isOpen={$FollowersModal}
    close={() => {
        FollowersModal.set(false);
    }}
    on:scroll={handleScroll}
>
    <h2>Followers ({amount})</h2>
    <div class="SmallSeparator">
        <p class="idea-card-created-at">
            Showing {users.length} out of {amount}
        </p>
        <div class="SmallSeparator">
            {#if !errorFlag}
                {#each users as user}
                    <FollowerDisplay
                        username={user.title}
                        profilePicture={user.profile_image}
                        key={user.element_id}
                        type={correctType(user.element_type)}
                    />
                {/each}
                {#if isLoading}
                    <p>Loading more...</p>
                {/if}
            {:else if errorFlag}
                <ErrorModalNew
                    error={errorMsg}
                    someFunction={() => {
                        errorFlag = false;
                    }}
                />
            {/if}
        </div>
    </div>
</Modal>

<style>
    /* Ensure the modal has a scrollable area */
    .SmallSeparator {
        max-height: 60vh; /* Adjust as needed */
        overflow-y: auto;
    }
</style>
