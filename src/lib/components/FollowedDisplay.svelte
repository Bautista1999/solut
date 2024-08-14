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
    import { getElementType } from "$lib/data_functions/get_functions";

    export let username = "";
    export let profilePicture = "";
    let follows = false;
    /**
     * @type {string}
     */
    export let key;

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
    let type = "";
    onMount(async () => {
        follows = await CheckIfFollow(key);
        type = await getElementType(key);
        switch (type) {
            case "user":
                type = "profile";
                break;
        }
    });
</script>

<div class=" HorizontallyAligned" style="justify-content: space-between;">
    <div class=" HorizontallyAligned">
        <div class="userSmallProfilePicture">
            <PledgerProfilePicture image={profilePicture} index={1} />
        </div>
        {#if type != ""}
            <a href="/{type}/{key}" style="text-decoration:none">{username}</a>
        {:else}
            <!-- svelte-ignore a11y-missing-attribute -->
            <a style="text-decoration:none">{username}</a>
        {/if}
    </div>
    {#if key != $UserKey}
        {#if follows}
            <BasicButtonSmall msg={"Unfollow"} someFunction={unfollow} />
        {:else}
            <BasicButtonDarkSmall msg={"Follow"} someFunction={follow} />
        {/if}
    {/if}
</div>
