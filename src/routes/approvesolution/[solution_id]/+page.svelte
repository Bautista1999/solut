<script>
    import { onMount } from "svelte";
    import BasicButtonDarkSmall from "$lib/components/BasicButton_Dark_Small.svelte";
    import { fade, fly } from "svelte/transition";
    import {
        getPledgeFeatureId,
        ICPtoDecimal,
        transferToSubaccount,
    } from "$lib/financial_functions/financial_functions";
    import {
        approveSolutionPledges as approvePledge,
        getUserPledgesEnriched,
        getUserPledgesForSolution,
        withdrawApproval,
        rejectApproval,
        withdrawRejection,
    } from "../../../declarations/satellite/satellite.api";
    import { getDoc } from "@junobuild/core-peer";
    import ModalConfirmationNew from "$lib/components/ModalConfirmationNew.svelte";
    import { DeleteModal, UserKey } from "$lib/stores/other_stores";
    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";
    import { SetPath } from "$lib/stores/redirect_store";

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
    let refreshKey = 0; // Used to force re-runs of checkRejectionStatus

    // New variables for modal state
    let modalMessage = "";
    let modalSuccessMsg = "";
    let modalLoadingMsg = "";
    let modalAction = async () => {};

    const setModalForApprove = (
        /** @type {string} */ pledgeId,
        /** @type {string} */ featureId,
    ) => {
        selectedPledgeId = pledgeId;
        selectedFeatureId = featureId;
        modalMessage = "Are you sure you want to approve this pledge?";
        modalSuccessMsg = "Pledge approved successfully!";
        modalLoadingMsg = "Approving pledge...";
        modalLoading = false;
        modalError = false;
        modalSuccess = false;
        modalAction = () => {
            const amount = approvalAmount;
            return handleApprove(pledgeId, amount, featureId);
        };
    };

    const setModalForReject = (/** @type {string} */ pledgeId) => {
        selectedPledgeId = pledgeId;

        modalMessage = "Are you sure you want to reject this pledge?";
        modalSuccessMsg = "Pledge rejected successfully!";
        modalLoadingMsg = "Rejecting pledge...";
        modalLoading = false;
        modalError = false;
        modalSuccess = false;
        modalAction = () => handleReject(pledgeId);
    };

    const setModalForWithdrawRejection = (/** @type {string} */ pledgeId) => {
        selectedPledgeId = pledgeId;
        modalMessage = "Are you sure?";
        modalSuccessMsg = "Done!";
        modalLoadingMsg = "Loading...";
        modalLoading = false;
        modalError = false;
        modalSuccess = false;
        modalAction = async () => {
            modalLoading = true;
            modalError = false;
            modalSuccess = false;
            const result = await withdrawRejection(pledgeId, solution_id);
            if ("Ok" in result) {
                modalSuccess = true;
                refreshKey += 1; // Force re-check of rejection status

                // Close modal after success
                setTimeout(() => {
                    DeleteModal.set(false);
                }, 3000);
            } else {
                modalError = true;
                modalErrorMsg = result.Err;
            }
            modalLoading = false;
        };
        DeleteModal.set(true);
    };

    /**
     * @param {string} pledgeId
     */
    async function checkRejectionStatus(pledgeId) {
        const rejectionKey = `REJ_${pledgeId}_${solution_id}`;
        try {
            const rejection = await getDoc({
                collection: "rejection",
                key: rejectionKey,
            });
            return rejection != null;
        } catch (err) {
            console.error("Error checking rejection:", err);
            return false;
        }
    }

    onMount(async () => {
        try {
            if (!$UserKey) {
                SetPath(`/approvals/${solution_id}`);
                window.location.href = "/signin";
                return;
            }

            let solution = await getDoc({
                collection: "solution",
                key: solution_id,
            });

            if (!solution) {
                error = "Solution not found";
                loading = false;
                return;
            }

            title = solution?.data.title;
            let pledgesResult = await getUserPledgesForSolution(
                solution_id,
                $UserKey,
            );
            if ("Ok" in pledgesResult) {
                pledges = pledgesResult.Ok;
                loading = false;
            } else {
                error = pledgesResult.Err;
                loading = false;
            }
        } catch (err) {
            error = String(err);
            loading = false;
        }
    });

    const handleApprove = (
        /** @type {string} */ pledgeId,
        /** @type {number} */ amount,
        /** @type {string} */ featureId,
    ) => {
        selectedPledgeId = pledgeId;
        modalLoading = true;
        modalError = false;
        modalSuccess = false;
        const satelliteId = "svftd-daaaa-aaaal-adr3a-cai";

        const amountToTransfer = BigInt(amount * 100000000);

        return transferToSubaccount(amountToTransfer, satelliteId, featureId)
            .then((promise) => {
                const pledgeApproval = {
                    pledge_id: pledgeId,
                    amount: Number(amountToTransfer),
                    transaction_number: Number(promise),
                };
                return approvePledge(solution_id, { Crypto: null }, [
                    pledgeApproval,
                ]);
            })
            .then((result) => {
                if ("Ok" in result) {
                    modalSuccess = true;
                    pledges = pledges.filter((p) => p.pledge_id !== pledgeId);
                } else {
                    modalError = true;
                    modalErrorMsg = result.Err;
                }
            })
            .catch((error) => {
                modalError = true;
                modalErrorMsg = String(error);
            })
            .finally(() => {
                modalLoading = false;
                if (modalSuccess) {
                    setTimeout(() => {
                        DeleteModal.set(false);
                    }, 3000);
                }
            });
    };

    const handleReject = (/** @type {string} */ pledgeId) => {
        modalLoading = true;
        modalError = false;
        modalSuccess = false;

        return rejectApproval(pledgeId, solution_id, [])
            .then((result) => {
                if ("Ok" in result) {
                    modalSuccess = true;
                    refreshKey += 1; // Force re-check of rejection status
                } else {
                    modalError = true;
                    modalErrorMsg = result.Err;
                }
            })
            .catch((error) => {
                modalError = true;
                modalErrorMsg = String(error);
            })
            .finally(() => {
                modalLoading = false;
                if (modalSuccess) {
                    setTimeout(() => {
                        DeleteModal.set(false);
                    }, 3000);
                }
            });
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
    {:else if pledges.length === 0}
        <div class="empty-state">
            <p>You don't have any pledges to approve for this solution.</p>
            <p>Once you make a pledge, you'll be able to approve it here!</p>
        </div>
    {:else}
        <div class="pledge-list" transition:fly={{ y: 20, duration: 600 }}>
            {#each pledges as pledge (pledge.pledge_id)}
                <div
                    class="pledge-card"
                    in:fly={{ y: 20, duration: 400 }}
                    out:fade={{ duration: 300 }}
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
                    </div>

                    {#key refreshKey}
                        {#await checkRejectionStatus(pledge.pledge_id)}
                            <div class="loading-rejection">
                                Checking rejection status...
                            </div>
                        {:then isRejected}
                            {#if isRejected}
                                <div>
                                    <p>
                                        This pledge has been rejected. Changed
                                        your mind? Click the button below.
                                    </p>
                                </div>
                                <div>
                                    <BasicButtonDarkSmall
                                        msg="I changed my mind"
                                        someFunction={() => {
                                            setModalForWithdrawRejection(
                                                pledge.pledge_id,
                                            );
                                        }}
                                    />
                                </div>
                            {:else}
                                <div class="approval-actions">
                                    <input
                                        type="number"
                                        min="0"
                                        class="InputTextSmall"
                                        style=""
                                        max={ICPtoDecimal(pledge.amount)}
                                        step="0.001"
                                        placeholder="Amount to approve"
                                        bind:value={approvalAmount}
                                    />

                                    <button
                                        class="expand-button"
                                        on:click={toggleExpand}
                                    >
                                        {#if !expanded}
                                            <span
                                                class="material-symbols-outlined"
                                                >keyboard_arrow_down</span
                                            > Expand to see funding details
                                        {:else}
                                            <span
                                                class="material-symbols-outlined"
                                                >keyboard_arrow_up</span
                                            > Close to see less funding details
                                        {/if}
                                    </button>

                                    <div
                                        class="details {expanded
                                            ? 'visible'
                                            : ''}"
                                    >
                                        <div class="detail-row">
                                            <span class="label"
                                                >Solution Provider</span
                                            >
                                            <span class="value"
                                                >{approvalAmount * 0.8} ICP</span
                                            >
                                        </div>
                                        <div class="detail-row">
                                            <span class="label"
                                                >Feature Creator</span
                                            >
                                            <span class="value"
                                                >{approvalAmount * 0.1} ICP</span
                                            >
                                        </div>
                                        <div class="detail-row">
                                            <span class="label"
                                                >Topic Owner</span
                                            >
                                            <span class="value"
                                                >{approvalAmount * 0.05} ICP</span
                                            >
                                        </div>
                                        <div class="detail-row">
                                            <span class="label"
                                                >Solutio Fee</span
                                            >
                                            <span class="value"
                                                >{approvalAmount * 0.05} ICP</span
                                            >
                                        </div>
                                        <div class="detail-row">
                                            <span class="label"
                                                >Transfer Fee</span
                                            >
                                            <span class="value">0.0001 ICP</span
                                            >
                                        </div>
                                        <div class="detail-row total">
                                            <span class="label">Total</span>
                                            <span class="value"
                                                >{approvalAmount} ICP</span
                                            >
                                        </div>
                                    </div>
                                </div>
                                <div
                                    class="pledge-details"
                                    style="display: flex;
            grid-template-columns: none;
            gap: 1rem;"
                                >
                                    <div
                                        class="detail-item"
                                        style="width: fit-content;"
                                    >
                                        <span class="label"
                                            >Percentage of what you promised:</span
                                        >
                                    </div>
                                    <span class="value"
                                        >{(
                                            (approvalAmount /
                                                ICPtoDecimal(pledge.amount)) *
                                            100
                                        ).toFixed(2)}%</span
                                    >
                                </div>

                                <div class="action-buttons">
                                    <BasicButtonDarkSmall
                                        msg="Approve"
                                        someFunction={() => {
                                            setModalForApprove(
                                                pledge.pledge_id,
                                                pledge.feature.length == 0
                                                    ? ""
                                                    : pledge.feature[0]
                                                          .element_id,
                                            );
                                            DeleteModal.set(true);
                                        }}
                                    />
                                    <BasicButtonDarkSmall
                                        msg="Reject"
                                        someFunction={() => {
                                            setModalForReject(pledge.pledge_id);
                                            DeleteModal.set(true);
                                        }}
                                    />
                                </div>
                            {/if}
                        {:catch error}
                            <div class="error-message">
                                Error checking rejection status
                            </div>
                        {/await}
                    {/key}
                </div>
            {/each}
        </div>
    {/if}

    {#if selectedPledgeId}
        <ModalConfirmationNew
            message={modalMessage}
            someFunction={modalAction}
            error={modalError}
            loading={modalLoading}
            success={modalSuccess}
            errorMsg={modalErrorMsg}
            successMsg={modalSuccessMsg}
            loadingMsg={modalLoadingMsg}
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

    .empty-state {
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);
        background: var(--background-secondary);
        border-radius: 16px;
        margin-top: 2rem;
        border: 1px solid var(--primary-color);
        transition: all 0.3s ease;
    }

    .empty-state p:first-child {
        font-size: 1.4rem;
        margin-bottom: 1rem;
        font-weight: 500;
        color: var(--text-color);
    }

    .empty-state p:last-child {
        font-size: 1.1rem;
        opacity: 0.9;
        line-height: 1.5;
    }

    @media (max-width: 768px) {
        .empty-state {
            text-align: left;
            padding: 2rem;
        }

        .empty-state p:first-child {
            font-size: 1.2rem;
        }

        .empty-state p:last-child {
            font-size: 1rem;
        }
    }

    .rejection-message {
        background-color: var(--background-secondary);
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        text-align: center;
    }

    .rejection-message p {
        color: var(--text-secondary);
        margin-bottom: 1rem;
    }

    .loading-rejection {
        text-align: center;
        padding: 1rem;
        color: var(--text-secondary);
    }

    .error-message {
        text-align: center;
        padding: 1rem;
        color: var(--error-color);
    }
</style>
