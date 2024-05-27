<script>
    import { goto } from "$app/navigation";
    import BasicButtonDarkLarger from "$lib/components/BasicButtonDarkLarger.svelte";
    import BasicButtonLarger from "$lib/components/BasicButtonLarger.svelte";
    import BasicButtonDarkSmall from "$lib/components/BasicButton_Dark_Small.svelte";
    import BasicButton from "$lib/components/basicButton.svelte";
    import { page } from "$app/stores";
    import { authSubscribe, initJuno, signIn } from "@junobuild/core";
    import { isRegistered } from "$lib/data_functions/user.functions";
    import ErrorMessage from "$lib/components/ErrorMessage.svelte";

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
        await initJuno({
            satelliteId: "svftd-daaaa-aaaal-adr3a-cai",
        });
        try {
            await signIn();
            await authSubscribe(async (user) => {
                if (user == null) {
                    error = true;
                } else {
                    let isReg = await isRegistered(user.key);
                    switch (isReg) {
                        case true:
                            console.log("User key: ", user.key);
                            goto("/");
                            break;
                        case false:
                            console.log("User key: ", user.key);
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

{#if !error}
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
            <p>If you have an invite code, include it here:</p>
            <br />
            <div class="interests-container">
                <input
                    class="interest-input"
                    bind:value={code}
                    placeholder="Your invite code goes here."
                />
            </div>
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
