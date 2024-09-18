<script>
    import { goto } from "$app/navigation";
    import BasicButtonDarkLarger from "$lib/components/BasicButtonDarkLarger.svelte";
    import BasicButtonLarger from "$lib/components/BasicButtonLarger.svelte";
    import BasicButtonDarkSmall from "$lib/components/BasicButton_Dark_Small.svelte";
    import BasicButton from "$lib/components/basicButton.svelte";
    import { page } from "$app/stores";
    import {
        authSubscribe,
        initJuno,
        signIn,
        InternetIdentityProvider,
    } from "@junobuild/core-peer";
    import { isRegistered } from "$lib/data_functions/user.functions";
    import ErrorMessage from "$lib/components/ErrorMessage.svelte";
    import { GoToPath } from "$lib/stores/redirect_store";

    // Accessing the parameter
    let inviteCode;
    $: inviteCode = $page.url.searchParams.get("invite");
    /** @type {import('./$types').PageData} */
    // @ts-ignore
    export let data;
    let code = "";
    let error = false;
    let errorMsg = "Error: Sign in failed. Refresh to try again.";
    async function logIn() {
        try {
            await signIn({
                provider: new InternetIdentityProvider({
                    domain: "ic0.app",
                }),
            });
            await authSubscribe(async (user) => {
                if (user == null) {
                    error = true;
                } else {
                    let isReg = await isRegistered(user.key);
                    switch (isReg) {
                        case true:
                            console.log("User key: ", user.key);
                            GoToPath();
                            // location.reload();
                            break;
                        case false:
                            console.log("User key: ", user.key);
                            goto("/createaccount/" + user.key);
                            // location.reload();
                            break;
                    }
                }
            });
        } catch (e) {
            error = true;
            errorMsg = String(e);
        }
    }
</script>

{#if !error}
    <div class="body">
        <div class="content">
            <h1 style="font-size: 2.5em;">Sign in</h1>
            <p>Choose your option to sign in into Solutio.</p>
            <br />
            <BasicButtonLarger
                msg={"Sign in with interent identity"}
                icon={"all_inclusive"}
                someFunction={async () => {
                    await logIn();
                }}
            />
        </div>
    </div>
{:else if error}
    <ErrorMessage
        message={"Sign in failed"}
        error={errorMsg}
        someFunction={() => {
            error = false;
        }}
    />
{/if}
<svelte:head>
    <meta name="twitter:card" content="summary" />
    <meta charset="utf-8" />
    <title>Sign in</title>
</svelte:head>

<style>
    .body {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 80vh;
    }

    .content {
        display: flex;
        flex-direction: column;
        align-items: start;
        justify-content: left;

        width: 100%;
        max-width: 400px;
        margin: 20px auto;
        padding: 20px;
        padding-top: 0px;
        padding-inline: 40px;
        background-color: var(--tertiary-color);
        border: 1px solid var(--seventh-color);
    }
    @media (max-width: 480px) {
        .body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 80vh;
        }

        .content {
            display: flex;
            flex-direction: column;
            align-items: start;
            justify-content: left;

            width: fit-content;
            max-width: 400px;
            margin: 20px auto;
            padding: 20px;
            padding-top: 0px;
            padding-inline: 40px;
            background-color: var(--tertiary-color);
            border: 1px solid var(--seventh-color);
        }
    }
</style>
