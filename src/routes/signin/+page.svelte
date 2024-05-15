<script>
    import { goto } from "$app/navigation";
    import BasicButtonDarkLarger from "$lib/components/BasicButtonDarkLarger.svelte";
    import BasicButtonLarger from "$lib/components/BasicButtonLarger.svelte";
    import BasicButtonDarkSmall from "$lib/components/BasicButton_Dark_Small.svelte";
    import BasicButton from "$lib/components/basicButton.svelte";
    import { page } from "$app/stores";
    import { signIn } from "@junobuild/core";

    // Accessing the parameter
    let inviteCode;
    $: inviteCode = $page.url.searchParams.get("invite");
    /** @type {import('./$types').PageData} */
    // @ts-ignore
    export let data;
    let code = "";
    async function logIn() {
        await signIn();
    }
</script>

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
