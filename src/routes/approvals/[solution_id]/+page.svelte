<script>
    import { onMount } from "svelte";
    import BasicButtonDarkSmall from "$lib/components/BasicButton_Dark_Small.svelte";
    import { fade } from "svelte/transition";
    import {
        getPledgeFeatureId,
        ICPtoDecimal,
        transferToSubaccount,
    } from "$lib/financial_functions/financial_functions";
    import {
        approveSolutionPledges as approvePledge,
        getUserPledgesEnriched,
        getUserPledgesForSolution,
    } from "../../../declarations/satellite/satellite.api";
    import { getDoc } from "@junobuild/core-peer";
    import ModalConfirmationNew from "$lib/components/ModalConfirmationNew.svelte";
    import { DeleteModal, UserKey } from "$lib/stores/other_stores";

    export let data;
    /**
     * @type {import("../../../declarations/satellite/satellite.did").EnrichedPledgeData[]}
     */
    let pledges = [];
    let loading = true;
    let error = "";
    let approvalAmount = 0;
    let expanded = false;
    let selectedPledgeId = "";
    let selectedFeatureId = "";
    let modalErrorMsg = "Something went wrong when approving the pledge.";
    let modalLoading = false;
    let modalSuccess = false;
    let modalError = false;
    let solution_id = data.params.solution_id;
    let title = "";
    onMount(async () => {
        try {
            // Replace with actual API call
            // pledges = await getEnrichedPledgesForSolution(data.solution_id);
            let solution = await getDoc({
                collection: "solution",
                key: solution_id,
            });
            title = solution?.data.title;
            console.log(solution);
            let pledgesResult = await getUserPledgesForSolution(
                solution_id,
                $UserKey,
            );
            if ("Ok" in pledgesResult) {
                pledges = pledgesResult.Ok;
            } else {
                error = pledgesResult.Err;
            }
            loading = false;
        } catch (err) {
            error = String(err);
            loading = false;
        }
    });

    const handleApprove = async (
        /** @type {string} */ pledgeId,
        /** @type {number} */ amount,
        /** @type {string} */ featureId,
    ) => {
        selectedPledgeId = pledgeId;
        modalLoading = true;
        modalError = false;
        modalSuccess = false;
        const satelliteId = "svftd-daaaa-aaaal-adr3a-cai";

        // Create array of transfer promises

        const amountToTransfer = BigInt(amount * 100000000);
        const featureTransfer = {
            promise: await transferToSubaccount(
                amountToTransfer,
                satelliteId,
                featureId,
            ),
            pledge_id: pledgeId,
            amount: Number(amountToTransfer),
        };
        const featureTransfers = [featureTransfer];
        // Execute all transfers atomically

        try {
            const result = await approvePledge(
                solution_id,
                { Crypto: null },
                featureTransfers,
            );
            if ("Ok" in result) {
                modalSuccess = true;
                // Update the pledges list
                pledges = pledges.map((p) =>
                    p.pledge_id === pledgeId ? { ...p, status: "approved" } : p,
                );
            } else {
                modalError = true;
                modalErrorMsg = result.Err;
            }
        } catch (error) {
            modalError = true;
            modalErrorMsg = String(error);
        } finally {
            modalLoading = true;
            setTimeout(() => {
                modalSuccess = true;
                modalError = false;
                modalLoading = false;
            }, 3000);
        }
    };

    const handleReject = (/** @type {any} */ pledgeId) => {
        console.log(`Rejecting pledge ${pledgeId}`);
        // Add rejection logic here
    };

    const toggleExpand = () => {
        expanded = !expanded;
    };
</script>

<div class="approval-container" transition:fade>
    <div class="header-container">
        <h1>Approving your pledges for</h1>
        <a href={`/solution/${solution_id}`} class="solution-link">
            {title || "Solution"}
        </a>
    </div>

    {#if loading}
        <div class="loading-state">
            <div class="loader" />
        </div>
    {:else if error}
        <div class="error-state">
            <p>Error: {error}</p>
        </div>
    {:else}
        <div class="pledge-list">
            {#each pledges as pledge (pledge.pledge_id)}
                <div
                    class="pledge-card {pledge.status == 'inactive'
                        ? 'inactive'
                        : ''}"
                >
                    <div class="pledge-header">
                        <img
                            src={pledge.feature.length == 0
                                ? "No image"
                                : pledge.feature[0].profile_image}
                            alt={pledge.feature.length == 0
                                ? "No feature"
                                : pledge.feature[0].title}
                            class="feature-image"
                        />
                        <div class="pledge-info">
                            <h2>
                                {pledge.feature.length == 0
                                    ? "No feature"
                                    : pledge.feature[0].title}
                            </h2>
                        </div>
                    </div>

                    <div class="pledge-details">
                        <div class="detail-item">
                            <span class="label">You pledged:</span>
                            <span class="value"
                                >{ICPtoDecimal(pledge.amount)} ICP</span
                            >
                        </div>
                        <div class="detail-item">
                            <span class="label">% of promised</span>
                            {#if approvalAmount > 0}
                                <span class="value"
                                    >{(ICPtoDecimal(pledge.amount) /
                                        approvalAmount) *
                                        100} %</span
                                >
                            {:else}
                                <span class="value">0 %</span>
                            {/if}
                        </div>
                        <div class="detail-item">
                            <span class="label">Status</span>
                            <span class="value status-tag {pledge.status}"
                                >{pledge.status}</span
                            >
                        </div>
                    </div>

                    <div class="approval-actions">
                        <input
                            type="number"
                            min="0"
                            class="InputTextSmall"
                            style=""
                            max={ICPtoDecimal(pledge.amount)}
                            step="0.001"
                            placeholder="Amount to approve"
                            disabled={pledge.status === "inactive"}
                            bind:value={approvalAmount}
                        />

                        <button
                            class="expand-button"
                            on:click={toggleExpand}
                            disabled={pledge.status == "inactive"}
                        >
                            {#if !expanded}
                                <span class="material-symbols-outlined"
                                    >keyboard_arrow_down</span
                                > Expand to see funding details
                            {:else}
                                <span class="material-symbols-outlined"
                                    >keyboard_arrow_up</span
                                > Close to see less funding details
                            {/if}
                        </button>

                        <div class="details {expanded ? 'visible' : ''}">
                            <div class="detail-row">
                                <span class="label">Solution Provider</span>
                                <span class="value"
                                    >{approvalAmount * 0.8} ICP</span
                                >
                            </div>
                            <div class="detail-row">
                                <span class="label">Feature Creator</span>
                                <span class="value"
                                    >{approvalAmount * 0.1} ICP</span
                                >
                            </div>
                            <div class="detail-row">
                                <span class="label">Topic Owner</span>
                                <span class="value"
                                    >{approvalAmount * 0.05} ICP</span
                                >
                            </div>
                            <div class="detail-row">
                                <span class="label">Solutio Fee</span>
                                <span class="value"
                                    >{approvalAmount * 0.05} ICP</span
                                >
                            </div>
                            <div class="detail-row">
                                <span class="label">Transfer Fee</span>
                                <span class="value">0.0001 ICP</span>
                            </div>
                            <div class="detail-row total">
                                <span class="label">Total</span>
                                <span class="value">{approvalAmount} ICP</span>
                            </div>
                        </div>
                    </div>
                    <div class="action-buttons">
                        <BasicButtonDarkSmall
                            msg="Approve"
                            disabled={pledge.status == "inactive"}
                            someFunction={() => {
                                selectedPledgeId = pledge.pledge_id;
                                selectedFeatureId =
                                    pledge.feature.length == 0
                                        ? ""
                                        : pledge.feature[0].element_id;
                                DeleteModal.set(true);
                            }}
                        />
                        <BasicButtonDarkSmall
                            msg="Reject"
                            disabled={pledge.status == "inactive"}
                        />
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    {#if selectedPledgeId}
        <ModalConfirmationNew
            message="Are you sure you want to approve this pledge?"
            someFunction={async () => {
                const amount = approvalAmount;
                const featureId = selectedFeatureId;
                await handleApprove(selectedPledgeId, amount);
            }}
            error={modalError}
            loading={modalLoading}
            success={modalSuccess}
            errorMsg={modalErrorMsg}
            successMsg="Pledge approved successfully!"
            loadingMsg="Approving pledge..."
        />
    {/if}
</div>

<style>
    .approval-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
    }

    h1 {
        text-align: center;
        color: var(--text-color);
    }

    .pledge-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .pledge-card {
        background: var(--tertiary-color);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .pledge-card.inactive {
        opacity: 1;
        cursor: not-allowed;
    }

    .pledge-header {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .feature-image {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        object-fit: cover;
    }

    .pledge-info {
        flex: 1;
    }

    .pledge-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
    }

    .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .label {
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .value {
        font-weight: 500;
        color: var(--text-color);
    }

    .status-tag {
        padding: 0.25rem 0.75rem;
        border-radius: 6px;
        font-size: 0.9rem;
        text-transform: capitalize;
    }

    .status-tag.inactive {
        background: rgba(128, 128, 128, 0.15);
        color: #808080;
    }

    .status-tag.active {
        background: rgba(40, 167, 69, 0.15);
        color: #28a745;
    }

    .approval-actions {
        display: flex;
        flex-direction: column;
        gap: 0;
    }

    .approval-actions *::before,
    .approval-actions *::after {
        box-sizing: border-box;
    }

    .approval-input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        background: var(--background-color);
        color: var(--text-color);
    }

    .reject-button {
        background: #dc3545;
    }

    .loading-state {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
    }

    .loader {
        border: 4px solid var(--background-color);
        border-top: 4px solid var(--accent-color);
        border-radius: 50%;
        width: 48px;
        height: 48px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 600px) {
        .approval-container {
            padding: 1rem;
        }

        .pledge-details {
            grid-template-columns: 1fr;
        }

        .approval-actions {
            flex-direction: column;
            gap: 0.5rem;
        }

        .approval-input {
            width: 100%;
        }
    }

    .breakdown-container {
        width: 100%;
        margin: 1rem 0;
        padding: 1rem;
        background: var(--background-secondary);
        border-radius: 8px;
    }

    .breakdown-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--border-color);
    }

    .breakdown-total {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        font-weight: bold;
    }

    .breakdown-item .label {
        color: var(--text-secondary);
    }

    .breakdown-item .value {
        color: var(--text-color);
    }

    .breakdown-total .label {
        color: var(--text-color);
    }

    .breakdown-total .value {
        color: var(--accent-color);
    }

    .expand-button {
        width: 100%;
        display: flex;
        gap: 0.5rem;
        font-size: 0.9rem;
        font-family: "Barlow";
        color: var(--primary-color);
        background: none;
        border: none;
        cursor: pointer;
        outline: none;
        margin-top: 0.5rem;
        transition:
            color 0.3s ease,
            font-weight 0.3s ease;
    }

    .expand-button:hover {
        color: var(--primary-color);
        font-weight: 450;
    }
    .expand-button:disabled {
        cursor: not-allowed;
        font-weight: normal;
        font-size: 0.9rem;
    }

    .material-symbols-outlined {
        font-size: 1.2rem;
    }

    .details {
        overflow: hidden;
        max-height: 0;
        opacity: 0;
        border-radius: 8px;
        transition:
            max-height 0.3s ease,
            padding 0.3s ease,
            opacity 0.3s ease;
    }

    .details.visible {
        max-height: 200px;
        padding-inline: 1rem;
        background-color: var(--tertiary-color);
        opacity: 1;
    }

    .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--border-color);
        font-size: 0.9rem;
        line-height: 1.5;
    }

    .detail-row.total {
        font-weight: bold;
        border-bottom: none;
    }

    .detail-row .label {
        color: var(--text-secondary);
    }

    .detail-row .value {
        color: var(--text-color);
    }

    .action-buttons {
        display: flex;
        gap: 1rem;
    }

    .header-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 2rem;
    }

    .solution-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        background: linear-gradient(
            135deg,
            rgba(255, 140, 0, 0.1),
            rgba(255, 69, 0, 0.1)
        );
        color: #ff8c00;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.2s ease;
        border: 1px solid rgba(255, 140, 0, 0.2);
    }

    .solution-link:hover {
        background: linear-gradient(
            135deg,
            rgba(255, 140, 0, 0.2),
            rgba(255, 69, 0, 0.2)
        );
        color: #ff4500;
        border-color: rgba(255, 69, 0, 0.3);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(255, 69, 0, 0.1);
    }

    .solution-link:active {
        transform: translateY(0);
        box-shadow: none;
    }
</style>
