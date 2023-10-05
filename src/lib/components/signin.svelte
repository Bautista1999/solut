<script>
    import { login } from "../data_functions/user.functions";
    import { isLoading, signInSuccessful } from "$lib/stores/loading";
    import { onMount } from "svelte";
    import Loading from "./loading.svelte";
    import Success from "./success.svelte";
    onMount(() => {
        isLoading.set(false);
    });
</script>

{#if $isLoading}
    <Loading msg="Awating signing in" />
{:else if $signInSuccessful}
    <Success />
{:else}
    <div class="loginBlock">
        <div class="loginContent">
            <img
                src="/assets/warningSymbol.png"
                alt=""
                style="width:35%;"
                class="centered-image"
            />
            <h3>Not signed in!</h3>
            <div class="textbody">
                <p>For using this feature you need to be signed in first.</p>
            </div>

            <div class="signinButton">
                <button
                    on:click={async () => {
                        login();
                    }}
                >
                    Sign in here</button
                >
            </div>
        </div>
    </div>
{/if}

<style>
    .textbody {
        text-align: left;
        padding-left: 10px;
        padding-right: 10px;
        margin-bottom: 10px;
    }
    .signinButton {
        border-color: black;
        background-color: orangered;
        color: white;
        box-shadow: 7px 7px 5px rgba(0, 0, 0, 0.3);
        height: auto;
        border-width: 1px;
        padding-top: 10px;
        padding-bottom: 10px;
        padding-left: 15px;
        padding-right: 15px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .loginBlock {
        display: flex;
        justify-content: center;
        width: 100%;
        min-height: 100vh;
        z-index: 0;
        margin-top: 4cm;
    }

    .loginContent {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: white;
        border-color: black;
        border-width: 2px;
        width: 30%;
        height: fit-content;
        padding-bottom: 20px;
        padding-top: 7px;
        box-shadow: 10px 10px 0px rgba(0, 0, 0, 1);
        color: rgb(0, 91, 91);
    }
    @media (max-width: 768px) {
        .loginContent {
            width: 90%; /* Adjust the width for smaller screens */
            height: 7cm; /* Adjust the height for smaller screens */
            box-shadow: 5px 5px 0px rgba(0, 0, 0, 1); /* Adjust the box-shadow for smaller screens */
        }
        .loginBlock {
            display: flex;
            justify-content: center;
            width: 100%;
            margin-top: 5cm;
            min-height: 100vh;
            z-index: 0;
        }
    }
</style>
