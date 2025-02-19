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
                            <img
                                src={approval.solution.profile_image}
                                alt={approval.solution.title}
                                class="solution-image"
                            />
                            <h3>{approval.solution.title}</h3>
                        </div>
                        <div class="card-content">
                            <div class="info-item">
                                <span class="label">User</span>
                                <div class="value user-value">
                                    <a
                                        href={`/profile/${approval.user.user_id}`}
                                        class="user-link"
                                    >
                                        <div class="user-content">
                                            <img
                                                src={approval.user
                                                    .profile_picture}
                                                alt={approval.user.username}
                                                class="user-image"
                                            />
                                            <span class="username"
                                                >{approval.user.username}</span
                                            >
                                        </div>
                                    </a>
                                </div>
                            </div>
                            <div class="info-item">
                                <span class="label">Solution</span>
                                <span class="value"
                                    >{approval.solution.title}</span
                                >
                            </div>
                            <div class="info-item">
                                <span class="label">Idea</span>
                                <div class="value feature-value">
                                    {#if approval.feature}
                                        <div class="feature-content">
                                            <img
                                                src={approval.feature
                                                    .profile_image}
                                                alt={approval.feature.title}
                                                class="feature-image"
                                            />
                                            <a
                                                href={`/idea/${approval.feature.element_id}`}
                                                class="truncate-text feature-link"
                                                title={approval.feature.title}
                                            >
                                                {approval.feature.title}
                                            </a>
                                        </div>
                                    {:else}
                                        <span>N/A</span>
                                    {/if}
                                </div>
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
                                <a
                                    href={`https://dashboard.internetcomputer.org/transaction/${approval.transaction_number}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="value transaction-link"
                                >
                                    <span class="link-icon">🌐</span>
                                    <span class="link-text"
                                        >View Transaction</span
                                    >
                                </a>
                            </div>
                        </div>
                        <div class="card-actions">
                            <BasicButtonDarkSmall
                                msg="Check Solution"
                                someFunction={() =>
                                    (window.location.href = `/solution/${approval.solution.element_id}`)}
                            />

                            {#if approval.status === "Pending" && approval.user.user_id === $UserKey}
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
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 2rem;
        margin-top: 1.5rem;
    }

    .approval-card {
        display: flex;
        flex-direction: column;
        background: var(--tertiary-color);
        border-radius: 16px;
        overflow: hidden;
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        border: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;
    }

    .approval-card::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(
            90deg,
            var(--accent-color),
            var(--primary-color)
        );
    }

    .approval-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
    }

    .solution-image {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        object-fit: cover;
        flex-shrink: 0;
    }

    .card-header {
        padding: 1.25rem;
        background: var(--secondary-color);
        display: flex;
        align-items: center;
        color: var(--tertiary-color);
        gap: 1.25rem;
    }

    .card-header h3 {
        margin: 0;
        font-size: 1.2rem;
        color: var(--text-color);
        font-weight: 600;
    }

    .card-content {
        padding: 1.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .info-item:last-child {
        border-bottom: none;
    }

    .label {
        color: var(--text-secondary);
        font-size: 0.95rem;
        opacity: 0.8;
    }

    .value {
        font-weight: 500;
        color: var(--text-color);
        font-size: 0.95rem;
    }

    .highlight {
        color: var(--accent-color);
        font-weight: 600;
        font-size: 1.1rem;
    }

    .status-tag {
        padding: 0.3rem 0.75rem;
        border-radius: 6px;
        font-size: 0.9rem;
        text-transform: capitalize;
        font-weight: 500;
    }

    .status-tag.pending {
        background: rgba(255, 193, 7, 0.15);
        color: #ffc107;
    }

    .status-tag.completed {
        background: rgba(40, 167, 69, 0.15);
        color: #28a745;
    }

    .payment-tag {
        padding: 0.3rem 0.75rem;
        border-radius: 6px;
        font-size: 0.9rem;
        text-transform: capitalize;
        background: var(--primary-color);
        color: white;
        font-weight: 500;
    }

    .card-actions {
        padding: 1.25rem;
        background: rgba(0, 0, 0, 0.05);
        display: flex;
        gap: 1.25rem;
        justify-content: center;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .loading-state {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 300px;
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

    .dark-mode .approval-card {
        background: var(--dark-secondary);
        border-color: rgba(255, 255, 255, 0.05);
    }

    .dark-mode .card-header {
        background: var(--dark-primary);
    }

    .dark-mode .info-item {
        border-color: rgba(255, 255, 255, 0.05);
    }

    .transaction-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        background: linear-gradient(
            135deg,
            rgba(23, 162, 184, 0.1),
            rgba(13, 110, 253, 0.1)
        );
        color: #17a2b8;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.2s ease;
        border: 1px solid rgba(23, 162, 184, 0.2);
    }

    .transaction-link:hover {
        background: linear-gradient(
            135deg,
            rgba(23, 162, 184, 0.2),
            rgba(13, 110, 253, 0.2)
        );
        color: #0d6efd;
        border-color: rgba(13, 110, 253, 0.3);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(13, 110, 253, 0.1);
    }

    .transaction-link:active {
        transform: translateY(0);
        box-shadow: none;
    }

    .link-icon {
        font-size: 1rem;
    }

    .link-text {
        font-size: 0.95rem;
        font-weight: 600;
    }

    .feature-link {
        color: var(--accent-color);
        text-decoration: none;
        transition: opacity 0.2s ease;
    }

    .feature-link:hover {
        opacity: 0.8;
        text-decoration: underline;
    }

    .feature-value {
        display: flex;
        align-items: center;
        min-width: 0;
    }

    .feature-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .feature-image {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        object-fit: cover;
        flex-shrink: 0;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .truncate-text {
        max-width: 150px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        white-space: normal;
        line-height: 1.2em;
        height: 2.4em;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
    }

    .user-value {
        display: flex;
        align-items: center;
    }

    .user-link {
        text-decoration: none;
        color: inherit;
        transition: opacity 0.2s ease;
    }

    .user-link:hover {
        opacity: 0.8;
    }

    .user-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .user-image {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: cover;
    }

    .username {
        font-weight: 500;
        color: var(--text-color);
    }
</style>
