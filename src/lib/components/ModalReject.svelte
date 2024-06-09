<script>
    import Modal from "./modal.svelte";
    import {
        ApprovalModal,
        NotSignedInModal,
        RejectModal,
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
    import { onMount } from "svelte";
    import MagicalDots from "./magicalDots.svelte";
    import { FallingConfetti } from "svelte-canvas-confetti";
    import ErrorModalNew from "./ErrorModalNew.svelte";
    import { rejectProject } from "$lib/financial_functions/financial_functions";
    let amountUSD = 10;
    // export let documentID = "";
    // export let collectionName = "";
    // export let solutionOwnerPrincipal = "3f6pv-baaaa-aaaab-qacoq-cai";
    // export let ideaOwnerPrincipal = "4j8ko-haaaa-aaaab-koedo-hei";

    let ideaKey = "Idea Example";
    export let solution_id = "";
    let solutionKey = "Solution Example";
    let SolutioPrincipal = "SolutioPrincipalId";

    let pledges = [];
    // let solutionItem = {
    //     category: "Solution creator (80%)",
    //     details: [
    //         {
    //             name: solutionKey,
    //             percentage: 80,
    //             owner: solutionOwnerPrincipal,
    //         },
    //     ],
    // };

    // we need to know how much percentage has each approval of the total approval.
    // /**
    //  * @type {any[]}
    //  */
    // let approvalDetails = [
    //     solutionItem,
    //     { category: "Features creators (14%)", details: [] },
    // ];
    $: total = 0.0;

    let errorFlag = false;
    let errorMsg = "";
    onMount(() => {
        // for (let i = 0; i < pledges.length; i++) {
        //     total = total + pledges[i].amount;
        // }
        // for (let i = 0; i < pledges.length; i++) {
        //     let newPercentage = ((pledges[i].amount * 100) / total) * 0.14;
        //     let listItem = {
        //         name:
        //             pledges[i].feature +
        //             " (" +
        //             roundAmount(newPercentage) +
        //             "%)",
        //         percentage: newPercentage,
        //         owner: pledges[i].ownerPrincipal,
        //     };
        //     approvalDetails[1].details.push(listItem);
        //     approvalDetails[1].details = approvalDetails[1].details;
        // }
        // let solutio5percent = {
        //     category: "Platform's fee (5%)",
        //     details: [
        //         {
        //             name: "Solutio",
        //             percentage: 5,
        //             owner: solutionOwnerPrincipal,
        //         },
        //     ],
        // };
        // approvalDetails.push(solutio5percent);
        // approvalDetails = approvalDetails;
        // let ideaItem = {
        //     category: "Idea creator (1%)",
        //     details: [
        //         {
        //             name: ideaKey,
        //             percentage: 1,
        //             owner: ideaOwnerPrincipal,
        //         },
        //     ],
        // };
        // approvalDetails.push(ideaItem);
        // approvalDetails = approvalDetails;
    });
    let deliveryStatus = "";
    let isChecked = false;
    let error = "";
    const roundAmount = (/** @type {number} */ amount) =>
        Math.round(amount * 100) / 100;
</script>

<Modal
    bind:isOpen={$RejectModal}
    close={() => {
        RejectModal.set(false);
    }}
>
    <h2>Reject project</h2>
    <div class="SmallSeparator">
        {#if !errorFlag}
            <p>
                You are about to reject this project. Rejecting a project that
                you have previously pledged will affect your reputation as a
                user.
            </p>
            <p>
                <input type="checkbox" bind:checked={isChecked} /> I accept the
                <a
                    on:click={() => {
                        termsModal.set(true);
                    }}
                    style="color:blue; text-decoration:underline;"
                    >Terms and conditions.</a
                >
            </p>
            {#if error == "NotChecked"}
                <p class="InputErrorMessage">
                    ERROR: You have to accept the terms and conditions.
                </p>
            {/if}
            {#if deliveryStatus == "Success"}
                <div
                    style=" text-align:center; color: var(--tertiary-color);  background:linear-gradient(to right, var(--primary-color), var(--red-wine)); padding:15px;"
                >
                    <p style="font-size: larger; ">Project rejected!</p>
                    <br />
                    <p>You have successfully rejected the delivered product!</p>
                    <FallingConfetti />
                    <FallingConfetti />
                    <FallingConfetti />
                    <FallingConfetti /><FallingConfetti /><FallingConfetti
                    /><FallingConfetti /><FallingConfetti />
                </div>
            {:else if deliveryStatus == "Loading"}
                <MagicalDots />
            {:else}
                <p style="font-weight: 450; text-align:center;">
                    Are you sure you want to reject the project?
                </p>
                <div class="VerticallyAligned HorizontallyAligned">
                    <BasicButtonDarkSmall
                        msg={"Yes, reject"}
                        icon={"check_circle"}
                        someFunction={async () => {
                            if (!isChecked) {
                                errorFlag = true;
                                errorMsg = "NotChecked";
                                return;
                            }
                            error = "";
                            deliveryStatus = "Loading";
                            try {
                                await rejectProject(solution_id);
                            } catch (e) {
                                errorFlag = true;
                                errorMsg = String(e);
                                deliveryStatus = "";
                                return;
                            }
                            deliveryStatus = "Success";
                        }}
                    />
                    <BasicButtonDarkSmall
                        msg={"No, cancel"}
                        icon={"cancel"}
                        someFunction={() => {
                            RejectModal.set(false);
                        }}
                    />
                </div>
            {/if}

            <p>
                You can see your all of your previous pledges <a
                    href="/profile"
                    style="color:blue; text-decoration:underline;">here</a
                >.
            </p>
        {:else if errorFlag}
            <ErrorModalNew
                error={errorMsg}
                someFunction={() => {
                    errorFlag = false;
                }}
            />
        {/if}
    </div>
</Modal>
<Terms />

<style>
    .inputNumber {
        width: 25%;
        border-color: var(--seventh-color);
        border-width: 1px;
        padding: 5px;
    }

    .approval-distribution p {
        position: relative;
        font-family: monospace;
        margin: 5px 0;
    }
    .approval-distribution p::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        border-bottom: 1px dotted var(--seventh-color);
        z-index: -1;
    }
    .approval-distribution strong {
        display: block;
        margin-bottom: 5px;
    }
</style>
