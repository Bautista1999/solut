<script>
    import { onMount } from "svelte";
    import { signIn, signOut } from "@junobuild/core";

    import { ProgressRadial } from "@skeletonlabs/skeleton";
    import { goto } from "$app/navigation";
    import { LightSwitch } from "@skeletonlabs/skeleton";
    import Loading from "$lib/components/loading.svelte";

    import { basicInfo, info } from "../lib/stores/auth.state";
    import { registerUser } from "$lib/data_functions/user.functions";
    import { loginedIn } from "$lib/stores/loading";

    let SignedIn = false;
    let isLoading = false;

    onMount(async () => {
        await basicInfo();
    });

    async function LogIn() {
        isLoading = true;
        await signIn();
        // @ts-ignore
        await registerUser($info.key);
        SignedIn = true;
        loginedIn.set(true);
        isLoading = false;
        goto("homepage");
    }
    async function LogOut() {
        isLoading = true;
        await signOut();
        SignedIn = false;
        loginedIn.set(false);
        isLoading = false;
    }
</script>

{#if isLoading}
    <Loading msg="Awaiting signing in" />
{:else if SignedIn}
    <div class="card p-4" style="width: 30%; align:center">
        <img
            src="/assets/LogoSol3.png"
            alt=""
            style="width:30%;"
            class="centered-image"
        />
        <br />
        <h1>Successfully signed in!</h1>
        <br />
        <button
            type="button"
            class="btn variant-filled"
            style="border-radius: 1000px; background-color:orangered"
            on:click={LogOut}
        >
            <span>➡️</span>
            <span>Log Out</span>
        </button>
    </div>
{:else}
    <div class="card p-4" style="width: 30%; align:center">
        <img
            src="/assets/LogoSol3.png"
            alt=""
            style="width:30%;"
            class="centered-image"
        />
        <br />
        <h1>Welcome to Solutio</h1>
        <p>
            Visit <a href="https://kit.svelte.dev">solutio.com</a> to learn about
            us
        </p>
        <br />
        <button
            type="button"
            class="btn variant-filled"
            style="border-radius: 1000px; background-color:orangered"
            on:click={LogIn}
        >
            <span>🚀</span>
            <span style="color: aliceblue;">Sign In</span>
        </button>
        <div class="light-switch-container">
            <LightSwitch />
        </div>
    </div>
{/if}

<style>
    .light-switch-container {
        display: flex;
        justify-content: center;
    }

    div {
        margin-block-start: 20%;
        text-align: center;
        height: 44%;
    }
    .card {
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 25px;
    }
    .centered-image {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 30%;
    }
    .centered-flexbox {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
