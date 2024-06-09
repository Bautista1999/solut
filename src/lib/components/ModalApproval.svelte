<script>
    import Modal from "./modal.svelte";
    import {
        ApprovalModal,
        NotSignedInModal,
        UserKey,
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
    import { onDestroy, onMount } from "svelte";
    import MagicalDots from "./magicalDots.svelte";
    import { FallingConfetti } from "svelte-canvas-confetti";
    import SuccessModalNew from "./SuccessModalNew.svelte";
    import {
        ICPtoDecimal,
        approveProject,
        getLedgerFee,
        getPledgesOfSignedInUserInProject,
        getUserBalance,
    } from "$lib/financial_functions/financial_functions";
    import { get } from "svelte/store";
    import { authSubscribe } from "@junobuild/core-peer";
    import { goto } from "$app/navigation";
    import {
        getElementTitleGivenKey,
        getIdeaOwner,
        getSolutionOwner,
        getUserKey,
    } from "$lib/data_functions/get_functions";
    import LoadingModalNew from "./LoadingModalNew.svelte";
    import Error from "../../routes/+error.svelte";
    import ErrorModalNew from "./ErrorModalNew.svelte";
    import { Principal } from "@dfinity/principal";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import { escrow_canister_id } from "$lib/data_functions/canisters";
    export let solution_id = "";
    export let idea_id = "";
    $: solutionOwnerPrincipal = "3f6pv-baaaa-aaaab-qacoq-cai";
    $: ideaOwnerPrincipal = "4j8ko-haaaa-aaaab-koedo-hei";
    let dots = "............";
    let ideaKey = "Idea Example";
    let solutionKey = "Solution Example";
    /**
     * @type {Array<import("$lib/declarations/admin.declarations").Pledge>}
     */
    export let pledges = [];
    let errorFlag = false;
    let errorMsg = "";

    /**
     * @type {any[]}
     */
    let approvalDetails = [];

    $: total = 0.0;
    let totalPledged = 0.0;
    let fee = BigInt(0);
    async function getPledgesProject() {
        let solutionItem = {
            category: "Solution creator (80%)",
            details: [
                {
                    name: solution_id,
                    percentage: 80,
                    owner: solutionOwnerPrincipal,
                    key: solution_id,
                },
            ],
        };
        approvalDetails = [];
        approvalDetails = [
            solutionItem,
            { category: "Features creators (14%)", details: [] },
        ];
        total = 0.0;
        totalPledged = 0.0;
        pledges = await getPledgesOfSignedInUserInProject(solution_id);
        for (let i = 0; i < pledges.length; i++) {
            total = total + ICPtoDecimal(pledges[i].amount);
            totalPledged = total;
        }
        for (let i = 0; i < pledges.length; i++) {
            let newPercentage =
                (Number(pledges[i].amount) / 1e8 / total) * 0.14 * 100;
            newPercentage = Math.round(newPercentage * 1e8) / 1e8;
            let listItem = {
                name:
                    pledges[i].feature_id +
                    " (" +
                    roundAmount(newPercentage) +
                    "%)",
                percentage: newPercentage,
                owner: pledges[i].target,
                key: pledges[i].feature_id,
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
                    owner: escrow_canister_id,
                    key: "Solutio",
                },
            ],
        };
        approvalDetails.push(solutio5percent);
        approvalDetails = approvalDetails;
        let ideaItem = {
            category: "Idea creator (1%)",
            details: [
                {
                    name: idea_id,
                    percentage: 1,
                    owner: ideaOwnerPrincipal,
                    key: idea_id,
                },
            ],
        };
        approvalDetails.push(ideaItem);
        approvalDetails = approvalDetails;
    }
    let balance = 0;
    async function getInformation() {
        if (!(await CheckIfSignedIn())) {
            goto("/signin/");
        } else {
            balance = await getUserBalance($UserKey);
            fee = await getLedgerFee();
            solutionOwnerPrincipal = await getSolutionOwner(solution_id);
            ideaOwnerPrincipal = await getIdeaOwner(idea_id);
            await getPledgesProject();
        }
    }
    onMount(() => {});
    let deliveryStatus = "";
    let isChecked = false;
    let error = "";
    const roundAmount = (/** @type {number} */ amount) =>
        Math.round(amount * 10000) / 10000;
</script>

<Modal
    bind:isOpen={$ApprovalModal}
    close={() => {
        ApprovalModal.set(false);
    }}
>
    <h2>Approve project</h2>
    <div class="SmallSeparator">
        {#if !errorFlag}
            {#await getInformation()}
                <LoadingModalNew message={"Getting previous pledges..."} />
            {:then}
                <!-- {#await getPledgesProject} -->
                <p>
                    You have previously pledged {roundAmount(totalPledged)} amount
                    of ICP tokens into this project.
                </p>
                <p>
                    Right now, you have {balance} ICP tokens in your wallet. If you
                    wish to add more, go to your
                    <a
                        href="/account.{getUserKey()}"
                        style="color:blue; text-decoration:underline;"
                        >profile</a
                    >.
                </p>
                <p style="font-weight: 450;">
                    Choose the amount you wish to approve
                </p>
                <p>
                    <input
                        type="number"
                        class="inputNumber"
                        bind:value={total}
                    />
                    ICP
                </p>
                {#if error == "Amount0"}
                    <p class="InputErrorMessage">
                        ERROR: You have to approve something greater than 0.
                    </p>
                {/if}
                <p>
                    <input type="checkbox" bind:checked={isChecked} /> I accept
                    the
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
                                            {#await getElementTitleGivenKey(user.key)}
                                                {user.key}
                                            {:then title}
                                                {title}
                                            {/await}

                                            {dots}
                                            {roundAmount(
                                                (user.percentage * total) /
                                                    100 -
                                                    ICPtoDecimal(fee),
                                            )}
                                        </p>
                                        <p>
                                            {"Transfer fee"}
                                            {dots}
                                            {ICPtoDecimal(fee)}
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
                            someFunction={async () => {
                                if (!isChecked) {
                                    errorFlag = true;
                                    errorMsg =
                                        "You must accept terms and conditions in order to approve";
                                    return;
                                }
                                if (total <= 0) {
                                    errorFlag = true;
                                    errorMsg = "Amount cant be 0";
                                    return;
                                }
                                let bigTotal = Number(Math.round(total * 1e8));
                                error = "";
                                deliveryStatus = "Loading";
                                try {
                                    /**
                                     * @type {Array<import("../declarations/escrow_declarations").Approval>}
                                     */
                                    let approvals = [];
                                    for (
                                        let i = 0;
                                        i < approvalDetails.length;
                                        i++
                                    ) {
                                        let details =
                                            approvalDetails[i].details;
                                        for (
                                            let j = 0;
                                            j < details.length;
                                            j++
                                        ) {
                                            debugger;
                                            /**
                                             * @type {import("../declarations/escrow_declarations").Approval}
                                             */
                                            let newApproval = {
                                                approval_transaction_number: 0n,
                                                sender: Principal.fromText(
                                                    $UserKey,
                                                ),
                                                target: Principal.fromText(
                                                    details[j].owner,
                                                ),
                                                amount: BigInt(
                                                    Math.round(
                                                        Number(
                                                            details[j]
                                                                .percentage *
                                                                bigTotal,
                                                        ) / 100,
                                                    ),
                                                ),
                                            };
                                            approvals.push(newApproval);
                                            approvals = approvals;
                                        }
                                    }
                                    await approveProject(
                                        bigTotal,
                                        solution_id,
                                        approvals,
                                    );
                                } catch (e) {
                                    errorFlag = true;
                                    errorMsg = String(e);
                                    deliveryStatus = "";
                                    return;
                                }
                                deliveryStatus = "Success";
                                setTimeout(() => {
                                    window.location.reload();
                                }, 3000);
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
            {/await}
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
