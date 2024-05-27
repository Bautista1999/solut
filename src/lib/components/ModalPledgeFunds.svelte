<script>
    import Modal from "./modal.svelte";
    import { pledgeModal, termsModal } from "$lib/stores/other_stores";
    import Terms from "./terms.svelte";

    import BasicButtonDarkSmall from "./BasicButton_Dark_Small.svelte";
    import {
        CreatePledge,
        getUserBalance,
    } from "$lib/financial_functions/financial_functions";
    import { onMount } from "svelte";
    import { authSubscribe } from "@junobuild/core-peer";
    import FlatButtonDarkSmall from "./FlatButtonDarkSmall.svelte";
    import SuccessModalNew from "./SuccessModalNew.svelte";
    import LoadingModalNew from "./LoadingModalNew.svelte";
    import ErrorModalNew from "./ErrorModalNew.svelte";
    import MagicalDotsAbsoluteSmall from "./MagicalDotsAbsoluteSmall.svelte";
    let amount = 0;
    let max = 0;
    let isLoading = false;
    let success = false;
    /**
     * @param {string}idea_id
     * @param {string}feature_id
     */
    export let idea_id, feature_id;
    let error = false;
    let errorMsg = "Some error occurred while pledging!";
    export let userKey = "";
    let showModal6 = false;
    onMount(async () => {
        authSubscribe((user) => {
            if (user != undefined) {
                userKey = user?.key;
            }
        });
    });
</script>

<Modal
    bind:isOpen={$pledgeModal}
    close={() => {
        pledgeModal.set(false);
    }}
>
    <h2>Pledge funds</h2>
    {#await getUserBalance(userKey)}
        <MagicalDotsAbsoluteSmall />
        <br />
        <p style="text-align: center;">Loading wallet...</p>
    {:then data}
        <p>
            Right now, you have {data} ICP tokens in your wallet. If you wish to
            add more, go to your
            <a href="/profile" style="color:blue; text-decoration:underline;"
                >profile</a
            >.
        </p>

        <br />
        {#if !isLoading && !success && !error}
            <div
                class="VerticallyAligned HorizontallyAligned"
                style="justify-content: left;"
            >
                <input
                    type="number"
                    class="InputTextSmall"
                    bind:value={amount}
                />
                ICP <FlatButtonDarkSmall
                    msg={"MAX"}
                    someFunction={() => {
                        amount = data;
                    }}
                />
            </div>

            <br />
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <p>
                <input type="checkbox" /> I accept the
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-missing-attribute -->
                <a
                    on:click={() => {
                        termsModal.set(true);
                    }}
                    style="color:blue; text-decoration:underline;"
                    >Terms and conditions.</a
                >
            </p>
            <br />
            <div
                style="display: flex; justify-content:center; align-items:center; width:100%;align-self:center;"
            >
                <BasicButtonDarkSmall
                    msg={"Pledge"}
                    someFunction={async () => {
                        isLoading = true;
                        try {
                            let pledgeCreation = await CreatePledge(
                                idea_id,
                                feature_id,
                                amount,
                                userKey,
                            );
                            success = true;
                        } catch (e) {
                            isLoading = false;
                            error = true;
                            errorMsg = String(e);
                        }
                    }}
                />
            </div>
        {:else if success}
            <SuccessModalNew message={"Pledge created successfully!"} />
        {:else if error}
            <ErrorModalNew
                error={errorMsg}
                someFunction={() => {
                    error = false;
                    pledgeModal.set(false);
                }}
            />
        {:else}
            <LoadingModalNew message={"Uploading pledge"} />
        {/if}

        <br />
        <p>
            Your pledge will be displayed along with the expected payout. Find
            out more <a href="" style="color:blue; text-decoration:underline;"
                >here</a
            >.
        </p>
    {/await}
</Modal>
<Terms />

<style>
</style>
