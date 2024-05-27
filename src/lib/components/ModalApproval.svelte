<script>
    import Modal from "./modal.svelte";
    import {
        ApprovalModal,
        NotSignedInModal,
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
    import SuccessModalNew from "./SuccessModalNew.svelte";
    let amountUSD = 10;
    export let documentID = "";
    export let collectionName = "";
    export let solutionOwnerPrincipal = "3f6pv-baaaa-aaaab-qacoq-cai";
    export let ideaOwnerPrincipal = "4j8ko-haaaa-aaaab-koedo-hei";
    let dots = ".....................";
    let pledge1 = {
        amount: 2.4,
        feature: "Feature 1",
        ownerPrincipal: "SomePrincipalId",
    };
    let pledge2 = {
        amount: 0.3,
        feature: "Feature 2",
        ownerPrincipal: "SomePrincipalId",
    };
    let pledge3 = {
        amount: 0.4,
        feature: "Feature 3",
        ownerPrincipal: "SomePrincipalId",
    };
    let ideaKey = "Idea Example";
    let solutionKey = "Solution Example";
    let SolutioPrincipal = "SolutioPrincipalId";
    /**
     * @type {pledge3[]}
     */
    let pledges = [pledge1, pledge2, pledge3];
    let solutionItem = {
        category: "Solution creator (80%)",
        details: [
            {
                name: solutionKey,
                percentage: 80,
                owner: solutionOwnerPrincipal,
            },
        ],
    };

    // we need to know how much percentage has each approval of the total approval.
    /**
     * @type {any[]}
     */
    let approvalDetails = [
        solutionItem,
        { category: "Features creators (14%)", details: [] },
    ];
    $: total = 0.0;

    // {
    //   category: "Features creators (14%)",
    //   details: [
    //     { name: "Feature1 (8%)", percentage: "10.9" },
    //     { name: "Feature2 (4%)", percentage: "5.45" },
    //     { name: "Feature3 (2%)", percentage: "2.7" },
    //   ],
    // },
    onMount(() => {
        for (let i = 0; i < pledges.length; i++) {
            total = total + pledges[i].amount;
        }
        for (let i = 0; i < pledges.length; i++) {
            let newPercentage = ((pledges[i].amount * 100) / total) * 0.14;
            let listItem = {
                name:
                    pledges[i].feature +
                    " (" +
                    roundAmount(newPercentage) +
                    "%)",
                percentage: newPercentage,
                owner: pledges[i].ownerPrincipal,
            };
            approvalDetails[1].details.push(listItem);
            approvalDetails[1].details = approvalDetails[1].details;
        }

        let solutio5percent = {
            category: "Platform's fee (5%)",
            details: [
                {
                    name: "Solutio",
                    percentage: 5,
                    owner: solutionOwnerPrincipal,
                },
            ],
        };
        approvalDetails.push(solutio5percent);
        approvalDetails = approvalDetails;
        let ideaItem = {
            category: "Idea creator (1%)",
            details: [
                {
                    name: ideaKey,
                    percentage: 1,
                    owner: ideaOwnerPrincipal,
                },
            ],
        };
        approvalDetails.push(ideaItem);
        approvalDetails = approvalDetails;
    });
    let deliveryStatus = "";
    let isChecked = false;
    let error = "";
    const roundAmount = (/** @type {number} */ amount) =>
        Math.round(amount * 100) / 100;
</script>

<Modal
    bind:isOpen={$ApprovalModal}
    close={() => {
        ApprovalModal.set(false);
    }}
>
    <h2>Approve project</h2>
    <div class="SmallSeparator">
        <p>
            You have previously pledged {roundAmount(total)} amount of ICP tokens
            into this project.
        </p>
        <p>
            Right now, you have 12.159 ICP tokens in your wallet. If you wish to
            add more, go to your <a
                href="/profile"
                style="color:blue; text-decoration:underline;">profile</a
            >.
        </p>
        <p style="font-weight: 450;">Choose the amount you wish to approve</p>
        <p>
            <input type="number" class="inputNumber" bind:value={total} />
            ICP
        </p>
        {#if error == "Amount0"}
            <p class="InputErrorMessage">
                ERROR: You have to approve something greater than 0.
            </p>
        {/if}
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
        <p style="font-weight: 450;">Distribution of approval</p>
        <div class="PaymentDetails">
            <div class="approval-distribution SmallSeparator">
                {#each approvalDetails as detail}
                    <div>
                        <strong>{detail.category}</strong>
                        <div>
                            {#each detail.details as user}
                                <p>
                                    {user.name}
                                    {dots}
                                    {roundAmount(
                                        (user.percentage * total) / 100,
                                    )}
                                </p>
                            {/each}
                        </div>
                    </div>
                {/each}
                <div class="HorizontalLine"></div>
                <div>
                    <strong>Total</strong>
                    <div>
                        <p>
                            {"Payment total"}
                            {dots}
                            {roundAmount(total)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
        {#if deliveryStatus == "Success"}
            <div
                style=" text-align:center; color: var(--tertiary-color);  background:linear-gradient(to right, var(--primary-color), var(--red-wine)); padding:15px;"
            >
                <p style="font-size: larger; ">Success!</p>
                <br />
                <p></p>
                <FallingConfetti />
                <FallingConfetti />
                <FallingConfetti />
                <FallingConfetti /><FallingConfetti /><FallingConfetti
                /><FallingConfetti /><FallingConfetti />
            </div>
            <!-- <SuccessModalNew
                message={"You have successfully approved the delivered product!"}
            /> -->
        {:else if deliveryStatus == "Loading"}
            <MagicalDots />
        {:else}
            <div
                style="display: flex; justify-content:center; align-items:center; width:100%;align-self:center;"
            >
                <BasicButtonDarkSmall
                    msg={"Approve"}
                    icon={"verified_user"}
                    someFunction={() => {
                        if (!isChecked) {
                            error = "NotChecked";
                            return;
                        }
                        if (total <= 0) {
                            error = "Amount0";
                            return;
                        }
                        error = "";
                        deliveryStatus = "Loading";

                        setTimeout(() => {
                            deliveryStatus = "Success";
                        }, 2500);
                    }}
                />
            </div>
        {/if}

        <p>
            You can see your all of your approvals <a
                href="/profile"
                style="color:blue; text-decoration:underline;">here</a
            >.
        </p>
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
