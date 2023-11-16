<script>
    import { signIn } from "@junobuild/core";
    import Modal from "./modal.svelte";
    import { info } from "$lib/stores/auth.state";
    import { registerUser } from "$lib/data_functions/user.functions";
    import Loading from "./loading.svelte";
    import { writable } from "svelte/store";
    import { onDestroy, onMount } from "svelte";
    import { NotSignedIn } from "$lib/stores/other_storestores";

    export let localSignIn = false;
    export let waiting = false;
    onMount(() => {});
</script>

<Modal
    bind:isOpen5={$NotSignedIn}
    close={() => {
        NotSignedIn.set(false);
    }}
>
    {#if localSignIn}
        <h4>Sign in successful!</h4>
        <br />
        <div class="delete">
            <button
                class="fundButton"
                style="width: 3.3cm; height:0.8cm; color:white; background-color:orangered;"
                on:click={() => {
                    NotSignedIn.set(false);
                }}>Close</button
            >
            <div class="spacer" />
        </div>
    {:else if waiting}
        <Loading msg={"Awaiting signing in"} modal={true} />
    {:else}
        <h4>Your are not signed in!</h4>
        <div class="delete">
            <p>For using this method you need to be signed in first.</p>
            <br />
            <br />
        </div>
        <div class="delete">
            <button
                class="fundButton"
                style="width: 3.3cm; height:0.8cm; color:white; background-color:orangered;"
                on:click={async () => {
                    waiting = true;
                    await signIn();
                    console.log("This is the info key", $info.key);
                    await registerUser($info.key);
                    localSignIn = true;
                    waiting = false;
                    window.location.reload();
                }}>Sign in here</button
            >
            <div class="spacer" />
        </div>
    {/if}
</Modal>

<style>
    .fundButton {
        width: 25%;
        height: 50px;
        /* background: linear-gradient(to right, rgb(255, 0, 0), orangered); */
        background-color: rgb(221, 243, 255);
        border-style: groove;
        border-color: black;
        border-width: 1px;
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        font-size: large;
        font-weight: 330;
        box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.2); /* horizontal, vertical, blur, color */
        color: black;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .fundButton:hover {
        transform: scale(
            1.08
        ); /* scales the button to 105% of its original size on hover */
    }
    .fundButton:active {
        transform: scale(
            0.95
        ); /* scales the button to 95% of its original size on click */
        box-shadow: none; /* removes the shadow */
    }
    .delete {
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        gap: 20px;
    }
    .spacer {
        height: 0.3cm;
    }
</style>
