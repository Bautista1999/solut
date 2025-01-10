<script>
    import { fade, fly } from "svelte/transition";
    import BasicButtonDarkSmall from "./BasicButton_Dark_Small.svelte";
    import { DeleteModal, UserKey } from "$lib/stores/other_stores";
    import { getSolutionStatusFromIdeaId } from "$lib/data_functions/get_functions";
    import ModalConfirmationNew from "./ModalConfirmationNew.svelte";
    import { deletePledgeFromProject } from "$lib/financial_functions/financial_functions";
    import {
        ICPtoDecimal,
        roundUpToThreeDecimalPlaces,
    } from "$lib/financial_functions/financial_functions";
    import { onDestroy, onMount } from "svelte";
    import { getUserActivePledgesEnriched } from "../../declarations/satellite/satellite.api";

    /**
     * @type {import("../../declarations/satellite/satellite.did").EnrichedPledgeData[]}
     */
    export let pledges = [];
    export let loading = false;
    export let darkMode = false;
    let error = false;
    let success = false;
    let modalErrorMsg = "Something went wrong when canceling the pledge.";

    let renderCount = 0;

    // Monitor renders
    $: {
        renderCount++;
        console.log("TableForPledges rendered:", renderCount, "times");
    }

    // Monitor modal interactions
    const handleModalOpen = () => {
        console.log("Attempting to open modal from TableForPledges");
        DeleteModal.set(true);
    };

    onMount(() => {
        console.log("TableForPledges mounted");
    });

    onDestroy(() => {
        console.log("TableForPledges destroyed, total renders:", renderCount);
        DeleteModal.set(false);
        error = false;
        loading = false;
        success = false;
    });

    /**
     * @type {string}
     */
    let selectedPledgeId = "";
</script>

<div class="pledges-wrapper" class:dark-mode={darkMode} transition:fade>
    {#if loading}
        <div class="loading-state">
            <div class="loader" />
        </div>
    {:else}
        <div class="table-container" transition:fly={{ y: 20, duration: 600 }}>
            <div class="pledge-cards">
                {#each pledges as pledge (pledge.pledge_id)}
                    <div
                        class="pledge-card glass-effect"
                        transition:fly={{ y: 20, duration: 400 }}
                    >
                        <div class="card-header">
                            <img
                                src={pledge.idea.profile_image}
                                alt={pledge.idea.title}
                                class="idea-image"
                            />
                            <h3>{pledge.idea.title}</h3>
                        </div>
                        <div class="card-content">
                            <div class="info-item">
                                <span class="label">Feature</span>
                                <div class="value feature-value">
                                    {#if pledge.feature.length > 0}
                                        <img
                                            src={pledge.feature[0]
                                                ?.profile_image}
                                            alt={pledge.feature[0]?.title}
                                            class="feature-image"
                                        />
                                        <span
                                            class="truncate-text"
                                            title={pledge.feature[0]?.title}
                                        >
                                            {pledge.feature[0]?.title}
                                        </span>
                                    {:else}
                                        <span>N/A</span>
                                    {/if}
                                </div>
                            </div>
                            <div class="info-item">
                                <span class="label">Amount</span>
                                <span class="value highlight">
                                    {roundUpToThreeDecimalPlaces(
                                        ICPtoDecimal(pledge.amount),
                                    )} ICP
                                </span>
                            </div>
                            <div class="info-item">
                                <span class="label">Expected</span>
                                <span class="value">
                                    {roundUpToThreeDecimalPlaces(
                                        ICPtoDecimal(pledge.expected_amount),
                                    )} ICP
                                </span>
                            </div>
                            <div class="info-item">
                                <span class="label">Amount Paid</span>
                                <span class="value">
                                    {roundUpToThreeDecimalPlaces(
                                        ICPtoDecimal(pledge.amount_paid),
                                    )} ICP
                                </span>
                            </div>
                            <div class="info-item">
                                <span class="label">Status</span>
                                <span
                                    class="value status-tag"
                                    class:active={pledge.status === "active"}
                                >
                                    {pledge.status}
                                </span>
                            </div>
                            <div class="info-item">
                                <span class="label">Payment Type</span>
                                <span class="value payment-tag">
                                    {pledge.payment_type}
                                </span>
                            </div>
                            <div class="info-item">
                                <span class="label">Created</span>
                                <span class="value"
                                    >{new Date(
                                        Number(pledge.created_at) / 1000000,
                                    ).toLocaleDateString()}</span
                                >
                            </div>
                        </div>
                        <div class="card-actions">
                            <BasicButtonDarkSmall
                                msg="Check idea"
                                someFunction={() =>
                                    (window.location.href = `/idea/${pledge.feature[0]?.element_id}`)}
                            />

                            {#await getSolutionStatusFromIdeaId(pledge.idea.element_id)}
                                <!-- Loading state -->
                            {:then status}
                                {#if status.toLowerCase() !== "delivered" && pledge.status === "active"}
                                    <BasicButtonDarkSmall
                                        msg="Cancel Pledge"
                                        someFunction={() => {
                                            selectedPledgeId = pledge.pledge_id;
                                            DeleteModal.set(true);
                                        }}
                                    />
                                {/if}
                            {/await}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>

<!-- Single modal instance outside the loop -->
{#if selectedPledgeId}
    <ModalConfirmationNew
        message="Are you sure you want to cancel this pledge?"
        someFunction={async () => {
            loading = true;
            error = false;
            success = false;
            const result = await deletePledgeFromProject(selectedPledgeId);
            loading = false;
            if ("Ok" in result) {
                success = true;
                const activePledges =
                    await getUserActivePledgesEnriched($UserKey);
                if ("Ok" in activePledges) {
                    pledges = activePledges.Ok;
                }
            } else {
                error = true;
                modalErrorMsg = result.Err;
            }
        }}
        {error}
        {loading}
        {success}
        errorMsg={modalErrorMsg}
        successMsg="Your pledge was canceled successfully."
        loadingMsg="Deleting pledge..."
    />
{/if}

<style>
    .pledges-wrapper {
        width: 100%;
        /* max-width: 1200px; */
        margin: 0 0;
        padding-block: 0.5rem;
    }

    .pledge-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
    }

    .pledge-card {
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

    .pledge-card:hover {
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

    .idea-image,
    .feature-image {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        object-fit: cover;
        flex-shrink: 0;
    }

    .card-content {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .label {
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .value {
        font-weight: 500;
        color: var(--text-color);
    }

    .highlight {
        color: var(--primary-color);
        font-weight: 600;
    }

    .feature-value {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 0;
        padding: 0.25rem 0;
    }

    .card-actions {
        padding: 1rem;
        background: rgba(0, 0, 0, 0.1);
        display: flex;
        gap: 1rem;
        justify-content: center;
    }

    .loading-state {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
    }

    @media (max-width: 768px) {
        .pledges-wrapper {
            padding: 0.5rem;
        }

        .pledge-cards {
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .pledge-card {
            border-radius: 8px;
        }
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
    }

    .idea-image,
    .feature-image {
        margin-top: 0;
        width: 40px;
        height: 40px;
        flex-shrink: 0;
    }

    .status-tag {
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        text-transform: capitalize;
        background: gray;
        color: white;
    }

    .status-tag.active {
        background: var(--green);
    }

    .payment-tag {
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        text-transform: capitalize;
        background: var(--primary-color);
        color: white;
    }
</style>
