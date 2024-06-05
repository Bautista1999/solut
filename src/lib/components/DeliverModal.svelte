<script>
    import Modal from "./modal.svelte";
    import {
        DeliveryModal,
        NotSignedInModal,
        PaymentModal,
        TransactionsInProgress,
        TransactionsSuccess,
        isLoading,
        loginedIn,
        pledgeModal,
        success,
        termsModal,
    } from "$lib/stores/other_stores";
    import {
        fromUSDtoICP,
        pledgeFunds,
    } from "$lib/data_functions/docu.functions";
    import Terms from "./terms.svelte";
    import BasicButton from "./basicButton.svelte";
    import BasicButtonSmall from "./BasicButton_Small.svelte";
    import BasicButtonDarkSmall from "./BasicButton_Dark_Small.svelte";
    import TransactionsProgress from "./TransactionsProgress.svelte";
    import { goto } from "$app/navigation";
    import { onDestroy } from "svelte";
    import MagicalDots from "./magicalDots.svelte";
    import { FallingConfetti } from "svelte-canvas-confetti";
    import { deliverSolution } from "$lib/data_functions/create_functions";
    import ErrorModalNew from "./ErrorModalNew.svelte";
    export let solution_id = "";
    let error = "";
    let deliveryStatus = "";
    onDestroy(() => {
        TransactionsSuccess.set(false);
        TransactionsInProgress.set(false);
        PaymentModal.set(false);
    });
    let linkUrl = "";
    let errorMsg = "";
    let termsAccepted = false;
</script>

<Modal
    bind:isOpen={$DeliveryModal}
    close={() => {
        DeliveryModal.set(false);
        // TransactionsInProgress.set(false);
        // TransactionsSuccess.set(false);
        // PaymentModal.set(false);
    }}
>
    <h2>Deliver solution</h2>
    <div class="SmallSeparator">
        <p>
            As soon as you hit the button, you are going to start the approval
            process. This involves the process on which users review your
            product, and either approve or disapprove it.
        </p>
        <p>
            If users approve it, they are going to approve the escrow canister
            to take money out of their wallet and send it over to you and
            ideators, when you decide to claim your tokens.
        </p>
        <p>
            You can learn more about this in the terms and conditions contract.
        </p>
        {#if deliveryStatus != "Loading" && deliveryStatus != "Success"}
            <p>
                Include the link to your product below (Github, playstore,
                appstore, etc):
            </p>
            <input
                type="text"
                class="InputTextSmall"
                placeholder="Product link"
                bind:value={linkUrl}
            />
            <p>
                <input type="checkbox" bind:checked={termsAccepted} /> I accept
                the
                <a
                    on:click={() => {
                        termsModal.set(true);
                    }}
                    style="color:blue; text-decoration:underline;"
                    >Terms and conditions.</a
                >
            </p>
            {#if error == "NotLink"}
                <p class="InputErrorMessage">
                    ERROR: You should include a link for your product. Otherwise
                    you cant deliver.
                </p>
            {:else if error == "NotChecked"}
                <p class="InputErrorMessage">
                    ERROR:You should accept terms and conditions before
                    delivering.
                </p>
            {/if}
        {/if}
        {#if deliveryStatus == "Loading"}
            <MagicalDots />
        {:else if deliveryStatus == "Success"}
            <div
                style=" text-align:center; color: var(--tertiary-color);  background:linear-gradient(to right, var(--primary-color), var(--red-wine)); padding:15px;"
            >
                <p style="font-size: larger; ">Success!</p>
                <br />
                <p>You have successfully delivered the product!</p>
                <FallingConfetti />
                <FallingConfetti />
                <FallingConfetti />
                <FallingConfetti /><FallingConfetti /><FallingConfetti
                /><FallingConfetti /><FallingConfetti />
            </div>
        {:else if deliveryStatus == "Error"}
            <ErrorModalNew
                error={errorMsg}
                someFunction={() => {
                    deliveryStatus = "";
                }}
            />
        {:else}
            <div class="VerticallyAligned">
                <BasicButtonDarkSmall
                    msg={"Deliver product"}
                    someFunction={async () => {
                        if (linkUrl.length == 0) {
                            error = "NotLink";
                            setTimeout(() => {
                                error = "";
                            }, 2000);
                            return;
                        }
                        if (termsAccepted == false) {
                            error = "NotChecked";
                            setTimeout(() => {
                                error = "";
                            }, 2000);
                            return;
                        }
                        deliveryStatus = "Loading";
                        try {
                            let deliveryProcess = await deliverSolution(
                                solution_id,
                                linkUrl,
                            );
                        } catch (e) {
                            errorMsg = String(e);
                            deliveryStatus = "Error";
                            return;
                        }
                        deliveryStatus = "Success";
                        setTimeout(() => {
                            deliveryStatus = "";
                            goto("/solution/" + solution_id);
                        }, 5000);
                    }}
                />
            </div>
        {/if}
        <p>
            Each approval made is available for audit. You can see them <a
                href=""
                style="color:blue; text-decoration:underline;">here</a
            >.
        </p>
    </div>
</Modal>
<Terms />

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
        font-weight: 330;
        box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.2); /* horizontal, vertical, blur, color */
        color: black;
        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
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

    .inputNumber {
        width: 25%;
        border-color: black;
        border-width: 1px;
        padding: 5px;
    }
</style>
