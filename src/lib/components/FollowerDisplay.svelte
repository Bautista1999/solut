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
    import BasicButtonDarkSmall from "./BasicButton_Dark_Small.svelte";
    import BasicButtonSmall from "./BasicButton_Small.svelte";
    import PledgerProfilePicture from "./PledgerProfilePicture.svelte";
    import { UserKey } from "$lib/stores/other_stores";

    export let username = "";
    export let profilePicture = "";
    let follows = false;
    /**
     * @type {string}
     */
    export let key;

    export let type;

    async function follow() {
        if (!(await CheckIfSignedIn())) {
            path.set(window.location.toString());
            goto("/signin/");
            return;
        }
        follows = true;
        console.log("Follow: ", await followElement(key, "user"));
    }
    async function unfollow() {
        if (!(await CheckIfSignedIn())) {
            path.set(window.location.toString());
            goto("/signin/");
            return;
        }
        follows = false;
        console.log("Unfollow: ", await unFollowElement(key, "user"));
    }
    onMount(async () => {
        follows = await CheckIfFollow(key);
    });
</script>

<div class=" HorizontallyAligned" style="justify-content: space-between;">
    <div class=" HorizontallyAligned">
        <!-- <div class="">
            <PledgerProfilePicture image={profilePicture} index={1} />
        </div> -->
        <img src={profilePicture} alt="Profile" class="profile-image" />
        <a
            href="/{type.length === 0 || type === 'user'
                ? 'profile'
                : type}/{key}"
            style="text-decoration:none; font-family: 'Barlow'">{username}</a
        >
    </div>
    {#if key != $UserKey}
        {#if follows}
            <BasicButtonSmall msg={"Unfollow"} someFunction={unfollow} />
        {:else}
            <BasicButtonDarkSmall msg={"Follow"} someFunction={follow} />
        {/if}
    {/if}
</div>

<style>
    .profile-image {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
    }
</style>
