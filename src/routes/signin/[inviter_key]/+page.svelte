<script>
    import BasicButtonLarger from "$lib/components/BasicButtonLarger.svelte";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import { onMount } from "svelte";
    import ErrorMessage from "$lib/components/ErrorMessage.svelte";
    import {
        InternetIdentityProvider,
        authSubscribe,
        signIn,
    } from "@junobuild/core-peer";
    import { isRegistered } from "$lib/data_functions/user.functions";
    import { GoToPath } from "$lib/stores/redirect_store";
    import { goto } from "$app/navigation";
    import {
        CheckInviteExistance,
        CheckUserExistance,
        getUserImages,
        getUsername,
    } from "$lib/data_functions/get_functions";
    import LoadingNew from "$lib/components/LoadingNew.svelte";
    import SuccessNew from "$lib/components/Success_New.svelte";
    import ProfilePicture from "$lib/components/profilePicture.svelte";
    import ProfilePictureSmall from "$lib/components/ProfilePicture_Small.svelte";
    import { setInvitationDocument } from "$lib/data_functions/create_functions";

    /** @type {import('./$types').PageData} */
    // @ts-ignore
    export let data;
    let inviterKey = data.params.inviter_key;
    let error = false;
    let errorMsg = "";
    let success = false;
    let notFound = false;
    let isLoading = false;

    onMount(async () => {
        isLoading = true;
        if (await CheckIfSignedIn()) {
            error = true;
            errorMsg = "You are already signed in.";
        }
        if (!(await CheckUserExistance(inviterKey))) {
            error = true;
            errorMsg = "Inviter key not found!";
        }
        isLoading = false;
    });
    async function logIn() {
        try {
            await signIn({
                provider: new InternetIdentityProvider({
                    domain: "ic0.app",
                }),
            });
            authSubscribe(async (user) => {
                if (user == null) {
                    error = true;
                } else {
                    let isReg = await isRegistered(user.key);
                    switch (isReg) {
                        case true:
                            GoToPath();
                            break;
                        case false:
                            if (user.key != inviterKey) {
                                try {
                                    await setInvitationDocument(inviterKey);
                                } catch (e) {
                                    console.log(e);
                                }
                            }
                            goto("/createaccount/" + user.key);
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

{#if !error && !success && !isLoading}
    <div class="body">
        <div class="container">
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
            <br />
            {#await getUsername(inviterKey)}
                <p>You have been invited by the user with key {inviterKey}</p>
            {:then data}
                <p>You have been invited by the user {data}</p>
                <br />
                {#await getUserImages([inviterKey])}
                    <ProfilePictureSmall src={""} userKey={inviterKey} />
                {:then data}
                    <ProfilePictureSmall
                        src={data[0].image}
                        userKey={inviterKey}
                    />
                {/await}
            {/await}
        </div>
    </div>
{:else if error}
    <ErrorMessage
        message={"Sign in failed"}
        error={errorMsg}
        someFunction={() => {
            goto("/");
        }}
    />
{:else if success}
    <SuccessNew />
{:else}
    <LoadingNew message={"Checking inviter..."} />
{/if}

<style>
    .body {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 80vh;
    }

    .container {
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
    .interests-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%; /* Adjust based on parent container */
        gap: 20px;
    }
    .interest-input {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        width: 90%; /* Ensure it matches input width */
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 50%;

        padding: 0.5rem 1rem;
        border: 2px solid var(--seventh-color);
        align-self: center;
        font-family: "Barlow";
    }
    .interest-input {
        border: 1px solid var(--seventh-color);
        background: var(black, #fff);
    }
</style>
