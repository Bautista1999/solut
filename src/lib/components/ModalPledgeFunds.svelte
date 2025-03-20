<script>
    import Modal from "./modal.svelte";
    import { UserKey, pledgeModal, termsModal } from "$lib/stores/other_stores";
    import Terms from "./terms.svelte";

    import BasicButtonDarkSmall from "./BasicButton_Dark_Small.svelte";
    import {
        CreatePledge,
        CreatePledgeNew,
        getUserAvailableBalance,
        getUserBalance,
    } from "$lib/financial_functions/financial_functions";
    import { onMount } from "svelte";
    import { authSubscribe } from "@junobuild/core";
    import FlatButtonDarkSmall from "./FlatButtonDarkSmall.svelte";
    import SuccessModalNew from "./SuccessModalNew.svelte";
    import LoadingModalNew from "./LoadingModalNew.svelte";
    import ErrorModalNew from "./ErrorModalNew.svelte";
    import MagicalDotsAbsoluteSmall from "./MagicalDotsAbsolut.svelte";
    import { getAvailableBalance } from "../../declarations/satellite/satellite.api";
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
        // @ts-ignore
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
    {#await getUserAvailableBalance()}
        <MagicalDotsAbsoluteSmall />
        <br />
        <p style="text-align: center;">Loading wallet...</p>
    {:then data}
        <p>
            Right now, you have {data} available ICP tokens in your wallet. If you
            wish to add more, go to your
            <a
                href="/account/{$UserKey}"
                style="color:blue; text-decoration:underline;">profile</a
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
                <a
                    href="https://forum.solutio.one/-205/terms-and-conditions"
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
                            if (amount > data) {
                                alert(
                                    "ERROR: Cant pledge more than your available balance.",
                                );
                                isLoading = false;
                                return;
                            }

                            let pledgeCreation = await CreatePledgeNew(
                                idea_id,
                                feature_id,
                                amount,
                                userKey,
                            );
                            success = true;
                            setTimeout(() => {
                                window.location.reload();
                            }, 3000);
                        } catch (e) {
                            if (
                                String(e).includes(
                                    "signature could not be verified",
                                )
                            ) {
                                success = true;
                                setTimeout(() => {
                                    window.location.reload();
                                }, 3000);
                            }
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
                }}
            />
        {:else}
            <LoadingModalNew message={"Executing pledge"} />
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
