<script>
    import Modal from "./modal.svelte";
    import { FollowingModal } from "$lib/stores/other_stores";

    import BasicButton from "./basicButton.svelte";
    import BasicButtonSmall from "./BasicButton_Small.svelte";
    import BasicButtonDarkSmall from "./BasicButton_Dark_Small.svelte";
    import { onDestroy, onMount } from "svelte";
    import LoadingModalNew from "./LoadingModalNew.svelte";
    import ErrorModalNew from "./ErrorModalNew.svelte";
    import { getFollowingsAndTheirInformation } from "$lib/data_functions/get_functions";
    import FollowerDisplay from "./FollowerDisplay.svelte";

    export let amount = 0;
    export let isLoading = false;

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

    let isLoadingMore = false;

    // Handler for detecting scrolling to the bottom of the modal content
    // @ts-ignore
    async function handleScroll(event) {
        const element = event.target;

        // Check if user scrolled to the bottom of the modal
        if (
            element.scrollTop + element.clientHeight >= element.scrollHeight &&
            !isLoadingMore &&
            users.length < amount
        ) {
            isLoadingMore = true; // Prevent multiple triggers
            await getMoreUsersFunction();
            isLoadingMore = false;
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
    bind:isOpen={$FollowingModal}
    close={() => {
        FollowingModal.set(false);
    }}
    on:scroll={handleScroll}
>
    <h2>Following ({amount})</h2>
    <div class="SmallSeparator">
        <p class="idea-card-created-at">
            Showing {users.length} out of {amount}
        </p>
        <div class="SmallSeparator">
            {#if !errorFlag}
                {#if isLoading}
                    {#each Array(3) as _, i}
                        <div class="follower-skeleton">
                            <div class="skeleton profile-pic"></div>
                            <div class="skeleton-content">
                                <div class="skeleton username"></div>
                                <div class="skeleton type"></div>
                            </div>
                        </div>
                    {/each}
                {:else}
                    {#each users as user}
                        <FollowerDisplay
                            username={user.title}
                            profilePicture={user.profile_image}
                            key={user.element_id}
                            type={correctType(user.element_type)}
                        />
                    {/each}
                    {#if isLoadingMore}
                        <div class="follower-skeleton">
                            <div class="skeleton profile-pic"></div>
                            <div class="skeleton-content">
                                <div class="skeleton username"></div>
                                <div class="skeleton type"></div>
                            </div>
                        </div>
                    {/if}
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

    .follower-skeleton {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        margin-bottom: 8px;
        background: var(--tertiary-color);
        border-radius: 8px;
    }

    .skeleton {
        background: linear-gradient(
            90deg,
            var(--forth-color-v2) 0%,
            var(--ninth-color) 50%,
            var(--forth-color-v2) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
    }

    .profile-pic {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .skeleton-content {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .username {
        height: 16px;
        width: 120px;
    }

    .type {
        height: 12px;
        width: 80px;
    }

    @keyframes shimmer {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }
</style>
