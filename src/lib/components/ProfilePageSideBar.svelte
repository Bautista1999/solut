<script>
    import {
        FollowingModal,
        UserKey,
        FollowersModal as modalFollowers,
    } from "$lib/stores/other_stores";
    import { get } from "svelte/store";
    import {
        getPaginatedCommonUsers,
        getPaginatedFollowers,
        getPaginatedFollowingElements,
    } from "../../declarations/satellite/satellite.api";
    import BasicButtonDark from "./basicButton_Dark.svelte";
    import BasicButtonDarkSmall from "./BasicButton_Dark_Small.svelte";
    import PledgersOverview from "./PledgersOverview.svelte";
    import UsersOverview from "./usersOverview.svelte";
    import FollowingsModal from "./FollowingsModal.svelte";
    import { onDestroy, onMount } from "svelte";
    import FollowersModal from "./FollowersModal.svelte";
    import FlatButtonSmall from "./FlatButtonSmall.svelte";
    import FlatButtonDarkSmall from "./FlatButtonDarkSmall.svelte";

    export let user_id = "";
    export let followers = 0;
    export let user_id_profile = user_id;
    export let following = 0;
    export let bio =
        "I am the founder of Solutio, the biggest crowdfunding platform in the world. I also like videogames, especially Sim Racing, and hanging out with my family. I only pledge to topics that have potential, not scams.";
    export let reputation = 75; // Reputation as a percentage
    export let totalPledged = 107.9; // Total amount pledged
    export let activePledges = 53; // Active pledges amount
    /**
     * @type {import("../../declarations/satellite/satellite.did").UserProfileBasicInfo[]}
     */
    let users = [];

    /**
     * @type {import("$lib/data_objects/data_types").UserProfilePic[]}
     */
    let usersImages = [];
    async function getFollowersInCommon() {
        let result = await getPaginatedCommonUsers(
            get(UserKey),
            user_id_profile,
            [],
            [],
        );
        if ("Ok" in result) {
            users = result.Ok;
            // Transform `users` into `usersImages`
            usersImages = users.map(
                ({ user_id: key, profile_picture: image }) => ({
                    key,
                    image,
                }),
            );
        }
    }
    /**
     * @type {import("../../declarations/satellite/satellite.did").IndexResponseBasicInfo[]}
     */
    $: followingElements = [];
    let offset = 0;
    let isLoadingFollowing = false;

    async function getFollowingElements() {
        isLoadingFollowing = true;
        try {
            let result = await getPaginatedFollowingElements(
                user_id,
                [offset],
                [],
            );
            if ("Ok" in result) {
                followingElements = result.Ok[0];
                following = Number(result.Ok[1]);
            }
        } finally {
            isLoadingFollowing = false;
        }
    }

    async function getMoreFollowingElements() {
        offset += 10;
        isLoadingFollowing = true;
        try {
            let result = await getPaginatedFollowingElements(
                user_id,
                [offset],
                [],
            );
            if ("Ok" in result) {
                followingElements = [...followingElements, ...result.Ok[0]];
                following = Number(result.Ok[1]);
            }
        } finally {
            isLoadingFollowing = false;
        }
    }

    /**
     * @type {import("../../declarations/satellite/satellite.did").IndexResponseBasicInfo[]}
     */
    $: followerList = [];
    let offsetFollowers = 0;
    let isLoading = false;

    async function getFollowers() {
        isLoading = true;
        try {
            let result = await getPaginatedFollowers(
                user_id,
                [offsetFollowers],
                [],
            );
            if ("Ok" in result) {
                followerList = result.Ok[0];
                followers = Number(result.Ok[1]);
            }
        } finally {
            isLoading = false;
        }
    }

    async function getMoreFollowers() {
        offsetFollowers += 10;
        isLoading = true;
        try {
            let result = await getPaginatedFollowers(
                user_id,
                [offsetFollowers],
                [],
            );
            if ("Ok" in result) {
                followerList = [...followerList, ...result.Ok[0]];
                followers = Number(result.Ok[1]);
            }
        } finally {
            isLoading = false;
        }
    }

    let isOwner = false;
    onMount(async () => {
        let callerPrincipal = get(UserKey);
        isOwner = callerPrincipal == user_id;
        window.addEventListener("scroll", handleScroll);
        await getFollowingElements();
        await getFollowers();
    });

    let isShrunk = false; // State to track header shrinkage

    function handleScroll() {
        isShrunk = window.scrollY > 20; // Shrink header if scrolled more than 50px
    }

    // Add a scroll event listener when the component mounts

    onDestroy(() => {
        window.removeEventListener("scroll", handleScroll);
    });
</script>

<div class="profile-sidebar {isShrunk ? 'shrink' : ''}">
    <!-- Follower Stats -->
    <div class="follower-stats">
        <p
            class="followers"
            on:click={() => {
                getFollowers();
                modalFollowers.set(true);
            }}
        >
            <strong>Followers:</strong>
            {followers}
        </p>
        <p
            class="followers"
            on:click={() => {
                getFollowingElements();
                FollowingModal.set(true);
            }}
        >
            <strong>Following:</strong>
            {following}
        </p>
    </div>
    {#await getFollowersInCommon() then}
        <div class="followed-by-section">
            <PledgersOverview
                users={usersImages}
                card={true}
                message={"No followers in common"}
            />

            <p class="followed-by">
                {#if users.length > 0}
                    Followed by
                    {#each users.slice(0, 2) as user, i}
                        <a
                            class="followers"
                            style="text-decoration: underline;"
                            href={"/profile/" + user.user_id}
                            rel="external"
                        >
                            @{user.username}
                        </a>{i === 0 && users.length > 1 ? " and " : ""}
                    {/each}
                {/if}
            </p>
        </div>
    {/await}
    <div class="divider"></div>
    <!-- Bio Section -->
    <div class="bio">
        <strong>Bio</strong>
        <p>{bio}</p>
    </div>
    <div class="divider"></div>
    <!-- Reputation -->
    <div class="reputation">
        <div class="field">
            <p><strong>Reputation:</strong></p>
            <div class="value">
                {reputation}%
                <div class="icon">
                    <span class="material-symbols-outlined"> psychiatry </span>
                </div>
            </div>
        </div>
    </div>

    <div class="divider"></div>
    <!-- Pledging Stats -->
    <div class="pledging-stats">
        <p class="field"><strong>Total pledged:</strong> {totalPledged} ICP</p>
    </div>
    <div class="divider"></div>
    <div class="pledging-stats">
        <div class="field">
            <p><strong>Active pledges:</strong></p>
            <div class="value">
                <span class="green-circle"></span>
                {activePledges} ICP
            </div>
            {#if isOwner}
                <div class="view-details-button" style="">
                    <FlatButtonDarkSmall
                        icon={"arrow_right_alt"}
                        msg={"Check your pledges "}
                        someFunction={() => {
                            window.location.href = "/mypledges";
                        }}
                    />
                </div>
            {/if}
        </div>
    </div>
    <div class="divider"></div>
    {#if isOwner}
        <div class="" style="">
            <FlatButtonDarkSmall
                icon={"arrow_right_alt"}
                msg={"Check your approvals "}
                someFunction={() => {
                    window.location.href = "/myapprovals";
                }}
            />
        </div>
    {/if}
    <div class="divider"></div>
    <!-- View Details Button -->
    {#if isOwner}
        <div class="view-details-button">
            <BasicButtonDarkSmall
                msg={"View details"}
                someFunction={() => {
                    window.location.href = "/account/" + user_id;
                }}
            />
        </div>
    {/if}
</div>
<FollowingsModal
    users={followingElements}
    amount={following}
    isLoading={isLoadingFollowing}
    getMoreUsersFunction={getMoreFollowingElements}
/>
<FollowersModal
    users={followerList}
    amount={followers}
    {isLoading}
    getMoreUsersFunction={getMoreFollowers}
/>

<style>
    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 24;
        color: green;
        text-align: left;
    }
    .view-details-button {
        display: flex;
        align-items: end;
        justify-content: end;
    }

    .followed-by {
        font-size: small;
    }
    .profile-sidebar {
        display: flex;
        flex-direction: column;
        gap: 15px; /* Spacing between elements */

        font-family: Arial, sans-serif;
        font-size: 0.9rem;
        color: var(--seventh-color);
    }
    .known-followers-images {
        height: 30px;
        display: flex;
        align-items: center;
    }

    .follower-stats,
    .bio,
    .reputation,
    .pledging-stats {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .field {
        display: flex;
        flex-direction: column;
        align-items: start;
        justify-content: start;
        text-align: left;
        gap: 10px;
        font-family: "Barlow";
    }

    .bio p {
        margin: 0;
        font-size: 0.85rem;
        color: #555;
        line-height: 1.4;
    }
    .bio strong {
        font-family: "Barlow";
        font-size: medium;
    }
    .divider {
        height: 0px;
        width: 95%;
        border: 1px solid rgba(0, 0, 0, 0.2);
        place-self: center;
    }
    .followers:hover {
        color: var(--primary-color);
        cursor: pointer;
        text-decoration: underline;
    }
    .green-circle {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: green;
        display: inline-block; /* Ensures the circle appears inline */
        margin-right: 5px; /* Adds spacing between the circle and the number */
    }

    .value {
        display: flex;
        align-items: center; /* Aligns the circle and number vertically */
        gap: 5px; /* Adds space between the circle and text */
        font-family: "Barlow";
        font-size: medium;
    }
    @media (max-width: 768px) {
        .followed-by-section {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 5px;
        }
        /* .profile-sidebar {
            overflow: hidden;
            transition: all 0.3s ease;
        }
        .profile-sidebar.shrink {
            height: 0px; 
        } */
        .divider {
            display: none;
        }
        .bio strong {
            display: none;
        }
        .follower-stats,
        .reputation,
        .pledging-stats {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
        }

        .field {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
        }
        .value {
            align-items: center;
        }

        .material-symbols-outlined {
            font-variation-settings:
                "FILL" 0,
                "wght" 400,
                "GRAD" 0,
                "opsz" 24;
            color: green;
            font-size: large;
            align-self: center;
        }
        .icon {
            display: flex;
            align-items: center;
        }
    }
</style>
