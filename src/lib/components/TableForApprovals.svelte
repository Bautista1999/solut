<script>
    import { fade, fly } from "svelte/transition";
    import BasicButtonDarkSmall from "./BasicButton_Dark_Small.svelte";
    import { DeleteModal, UserKey } from "$lib/stores/other_stores";
    import ModalConfirmationNew from "./ModalConfirmationNew.svelte";
    import {
        ICPtoDecimal,
        roundUpToThreeDecimalPlaces,
    } from "$lib/financial_functions/financial_functions";
    import { onDestroy, onMount } from "svelte";
    import { withdrawApproval } from "../../declarations/satellite/satellite.api";

    /**
     * @type {import("../../declarations/satellite/satellite.did").EnrichedApprovalData[]}
     */
    export let approvals = [];
    export let loading = false;
    export let darkMode = false;
    let error = false;
    let success = false;
    let modalErrorMsg = "Something went wrong when withdrawing the approval.";

    let renderCount = 0;

    // Monitor renders
    $: {
        renderCount++;
        console.log("TableForApprovals rendered:", renderCount, "times");
    }

    // Monitor modal interactions
    const handleModalOpen = () => {
        console.log("Attempting to open modal from TableForApprovals");
        DeleteModal.set(true);
    };

    onMount(() => {
        console.log("TableForApprovals mounted");
    });

    onDestroy(() => {
        console.log("TableForApprovals destroyed, total renders:", renderCount);
        DeleteModal.set(false);
        error = false;
        loading = false;
        success = false;
    });

    /**
     * @type {string}
     */
    let selectedApprovalId = "";
</script>

<div class="approvals-wrapper" class:dark-mode={darkMode} transition:fade>
    {#if loading}
        <div class="loading-state">
            <div class="loader" />
        </div>
    {:else}
        <div class="table-container" transition:fly={{ y: 20, duration: 600 }}>
            <div class="approval-cards">
                {#each approvals as approval (approval.approval_id)}
                    <div
                        class="approval-card glass-effect"
                        transition:fly={{ y: 20, duration: 400 }}
                    >
                        <div class="card-header">
                            <h3>Approval {approval.approval_id}</h3>
                        </div>
                        <div class="card-content">
                            <div class="info-item">
                                <span class="label">Solution ID</span>
                                <span class="value"
                                    >{approval.solution.title}</span
                                >
                            </div>
                            <div class="info-item">
                                <span class="label">Amount</span>
                                <span class="value highlight">
                                    {roundUpToThreeDecimalPlaces(
                                        ICPtoDecimal(approval.amount),
                                    )} ICP
                                </span>
                            </div>
                            <div class="info-item">
                                <span class="label">Status</span>
                                <span
                                    class="value status-tag"
                                    class:pending={approval.status ===
                                        "Pending"}
                                    class:completed={approval.status ===
                                        "Completed"}
                                >
                                    {approval.status}
                                </span>
                            </div>
                            <div class="info-item">
                                <span class="label">Payment Type</span>
                                <span class="value payment-tag">
                                    {approval.payment_type}
                                </span>
                            </div>
                            <div class="info-item">
                                <span class="label">Created</span>
                                <span class="value"
                                    >{new Date(
                                        Number(approval.created_at) / 1000000,
                                    ).toLocaleDateString()}</span
                                >
                            </div>
                            <div class="info-item">
                                <span class="label">Transaction</span>
                                <span class="value"
                                    >{approval.transaction_number}</span
                                >
                            </div>
                        </div>
                        <div class="card-actions">
                            <BasicButtonDarkSmall
                                msg="Check Solution"
                                someFunction={() =>
                                    (window.location.href = `/solution/${approval.solution.element_id}`)}
                            />

                            {#if approval.status === "Pending"}
                                <BasicButtonDarkSmall
                                    msg="Withdraw Approval"
                                    someFunction={() => {
                                        selectedApprovalId =
                                            approval.approval_id;
                                        DeleteModal.set(true);
                                    }}
                                />
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>

<!-- Single modal instance outside the loop -->
{#if selectedApprovalId}
    <ModalConfirmationNew
        message="Are you sure you want to withdraw this approval?"
        someFunction={async () => {
            loading = true;
            error = false;
            success = false;
            try {
                const result = await withdrawApproval(selectedApprovalId);
                console.log("Withdrawal result:", result);
                loading = false;
                if ("Ok" in result) {
                    success = true;
                    // Refresh approvals list
                    approvals = approvals.filter(
                        (a) => a.approval_id !== selectedApprovalId,
                    );
                } else {
                    error = true;
                    modalErrorMsg = String(result.Err);
                }
            } catch (err) {
                error = true;
                modalErrorMsg = String(err);
                loading = false;
            }
        }}
        {error}
        {loading}
        {success}
        errorMsg={modalErrorMsg}
        successMsg="Your approval was withdrawn successfully."
        loadingMsg="Withdrawing approval..."
    />
{/if}

<style>
    .approvals-wrapper {
        width: 100%;
        margin: 0 0;
        padding-block: 0.5rem;
    }

    .approval-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
    }

    .approval-card {
        display: flex;
        flex-direction: column;
        background: var(--tertiary-color);
        border-radius: 12px;
        overflow: hidden;
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .approval-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .card-header {
        padding: 1rem;
        background: var(--secondary-color);
        display: flex;
        align-items: center;
        color: var(--tertiary-color);
        gap: 1rem;
    }

    .card-header h3 {
        margin: 0;
        font-size: 1.1rem;
        color: var(--text-color);
    }

    .card-content {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .label {
        color: var(--text-color-secondary);
        font-size: 0.9rem;
    }

    .value {
        color: var(--text-color);
        font-weight: 500;
    }

    .highlight {
        color: var(--accent-color);
        font-weight: 600;
    }

    .status-tag {
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.85rem;
        text-transform: capitalize;
    }

    .status-tag.pending {
        background: var(--warning-color);
        color: var(--dark-color);
    }

    .status-tag.completed {
        background: var(--success-color);
        color: var(--dark-color);
    }

    .payment-tag {
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.85rem;
        background: var(--accent-color);
        color: var(--dark-color);
    }

    .card-actions {
        padding: 1rem;
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
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
        width: 40px;
        height: 40px;
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

    .dark-mode {
        /* Add dark mode specific styles if needed */
    }
</style>
