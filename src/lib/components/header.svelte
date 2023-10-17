<script>
    import { TabGroup, Tab, TabAnchor } from "@skeletonlabs/skeleton";
    import { page } from "$app/stores";
    import { LightSwitch } from "@skeletonlabs/skeleton";
    import { signedIn } from "$lib/stores/auth.state";
    import { afterUpdate, onMount } from "svelte";
    import { signIn, signOut } from "@junobuild/core";
    import { loginedIn } from "$lib/stores/loading";
    let signed = false;
    export let profilePicture =
        "https://www.shareicon.net/data/2015/12/09/685026_arrow_512x512.png";
    onMount(async () => {
        signed = await signedIn();
        if (signed) {
            loginedIn.set(true);
        }
    });

    async function signOutPopUp() {
        await signOut();
        loginedIn.set(false);
        window.location.reload();
    }
    async function signInPopUp() {
        await signIn();
        loginedIn.set(true);
        window.location.reload();
    }
</script>

<TabGroup class="text-2xl px-10 py-5">
    <TabAnchor href="/homepage" selected={$page.url.pathname === "/homepage"}
        >Home</TabAnchor
    >
    <TabAnchor href="/about" selected={$page.url.pathname === "/about"}
        >About</TabAnchor
    >
    <TabAnchor href="/about" selected={$page.url.pathname === "/about"}
        >Profile</TabAnchor
    >
    <TabAnchor href="/about" selected={$page.url.pathname === "/about"}
        >Feed</TabAnchor
    >
    <TabAnchor href="/billetera" selected={$page.url.pathname === "/billetera"}
        >Wallet</TabAnchor
    >
    <TabAnchor href="/about" selected={$page.url.pathname === "/about"}
        >Contact</TabAnchor
    >
    <TabAnchor href="/about" selected={$page.url.pathname === "/about"}
        >Notifications</TabAnchor
    >
    <TabAnchor href="/create" selected={$page.url.pathname === "/create"}>
        <div><button> Create</button></div>
    </TabAnchor>
    <TabAnchor>
        <LightSwitch />
    </TabAnchor>
    {#if $loginedIn}
        <!-- svelte-ignore a11y-missing-attribute -->
        <button on:click={() => signOutPopUp()}>
            <img class="profile" src={profilePicture} /></button
        >
    {:else}
        <!-- svelte-ignore a11y-missing-attribute -->
        <button on:click={() => signInPopUp()}> Sign in</button>
    {/if}
</TabGroup>

<style>
    .profile {
        height: auto;
        margin: 5px;
        width: 1.2cm;
        margin-right: 0px;
    }
</style>
