<script>
    import Modal from "./modal.svelte";
    import {
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
    import LoadingModalNew from "./LoadingModalNew.svelte";
    import {
        completeSolution,
        getApprovalsByProject,
        getTotalAmountApprovedByProject,
        getTotalAmountApprovedForSignedInUser,
        getTransactions,
    } from "$lib/financial_functions/financial_functions";
    import ErrorModalNew from "./ErrorModalNew.svelte";
    export let solution_id = "";
    export let idea_id = "";
    let ownerAmount = 0;
    let total = 0;
    let error = false;
    let NoTokens = false;
    $: percentage = 0;
    let errorMsg = "";
    /**
     * @type {Array<import("../declarations/escrow_declarations").Approval>}
     */
    let approvals = [];
    onDestroy(() => {
        TransactionsSuccess.set(false);
        TransactionsInProgress.set(false);
        PaymentModal.set(false);
    });

    async function getInformation() {
        try {
            total = await getTotalAmountApprovedByProject(solution_id);
            if (total == 0) {
                NoTokens = true;
                return;
            }
            ownerAmount =
                await getTotalAmountApprovedForSignedInUser(solution_id);
            approvals = await getApprovalsByProject(solution_id);
        } catch (e) {
            error = true;
            errorMsg = String(e);
        }
    }

    async function completeProject() {
        let promise = completeSolution(solution_id, idea_id);
        let isPending = true;
        let interval = setInterval(async () => {
            if (isPending) {
                console.log("Promise is still pending...");
                // Execute your function here
                let transactionsAmount = (await getTransactions(solution_id))
                    .length;
                percentage = transactionsAmount / approvals.length;
            }
        }, 1000); // Polling interval in milliseconds

        try {
            await promise;
            isPending = false;
            console.log("Project completed successfully");
        } catch (error) {
            isPending = false;
            error = true;
            errorMsg = String(error);
            console.error("Project completion rejected with error:", error);
        } finally {
            clearInterval(interval);
        }
    }
</script>

<Modal
    bind:isOpen={$PaymentModal}
    close={() => {
        PaymentModal.set(false);
        TransactionsInProgress.set(false);
        TransactionsSuccess.set(false);
        PaymentModal.set(false);
    }}
>
    <h2>Complete solution</h2>
    {#await getInformation()}
        <LoadingModalNew message={"Getting approvals so far..."} />
    {:then}
        {#if !error && !NoTokens}
            <p>
                As soon as you hit the button, all approvals will begin to
                transfer to your Solutio wallter. You can see your balance in
                your <a
                    href="/profile"
                    style="color:blue; text-decoration:underline;">profile</a
                >.
            </p>
            <br />
            <p>{total} ICP tokens were approved in this project.</p>
            <p>
                {ownerAmount} ICP tokens were approved to transfer to your wallet.
            </p>
            <br />
            <p>
                <input type="checkbox" /> I accept the
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
                style="display: flex; justify-content:center; align-items:center; width:100%;align-self:center; flex-direction:column; gap:20px;"
            >
                <TransactionsProgress {percentage} />
                {#if $TransactionsInProgress == false && $TransactionsSuccess == false}
                    <BasicButtonDarkSmall
                        msg={"Start transfers"}
                        someFunction={async () => {
                            TransactionsInProgress.set(true);
                            await completeProject();
                        }}
                    />
                {:else if $TransactionsSuccess}
                    <BasicButtonDarkSmall
                        msg={"Audit transactions"}
                        someFunction={() => {
                            goto("/profile");
                        }}
                    />
                {:else}
                    <p style="font-style: italic;">Executing transactions...</p>
                {/if}
            </div>

            <br />
            <p>
                Each transaction made is available for audit. You can see them <a
                    href=""
                    style="color:blue; text-decoration:underline;">here</a
                >.
            </p>
        {:else if error}
            <ErrorModalNew
                error={errorMsg}
                someFunction={() => {
                    error = false;
                }}
            />
        {:else if NoTokens}
            <p style="text-align: center;">
                -- No tokens approved yet for this project--
            </p>
        {/if}
    {/await}
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
