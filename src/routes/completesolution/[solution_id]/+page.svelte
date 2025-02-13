<script>
    import { getDoc } from "@junobuild/core-peer";
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";
    import { ICPtoDecimal } from "$lib/financial_functions/financial_functions";
    import DistributionRow from "$lib/components/DistributionRow.svelte";
    import FeatureRow from "$lib/components/FeatureRow.svelte";

    import {
        completeSolution,
        getSolutionCompletionData,
    } from "../../../declarations/satellite/satellite.api";
    export let data;
    let solution_id = data.params.solution_id;
    let title = "";
    let loading = true;
    let error = "";
    let approvalRate = 0;
    let totalPledges = 0;
    let approvedPledges = 0;
    let deliveryDate = null;
    let totalAmount = 0;
    let isReadyForCompletion = false;

    /**
     * @type {{ title: string; profile_image: string; approved_amount: number; id: string }[]}
     */
    let features = [];

    /**
     * @type {Record<string, number>}
     */
    let feature_approval_counts = {};

    /**
     * @type {{
     *   id: string;
     *   username: string;
     *   profile_image: string;
     *   wallet_id: string;
     *   amount: number;
     * }}
     */
    let solutionProvider = {
        id: "",
        username: "",
        profile_image: "",
        wallet_id: "",
        amount: 0,
    };

    /**
     * @type {{
     *   id: string;
     *   username: string;
     *   profile_image: string;
     *   wallet_id: string;
     *   feature_id: string;
     *   feature_title: string;
     *   amount: number;
     * }[]}
     */
    let featureCreators = [];

    /**
     * @type {{
     *   id: string;
     *   username: string;
     *   profile_image: string;
     *   wallet_id: string;
     *   amount: number;
     * }}
     */
    let topicOwner = {
        id: "",
        username: "",
        profile_image: "",
        wallet_id: "",
        amount: 0,
    };

    let platformFee = {
        amount: 0,
    };

    // Track which section is expanded
    let expandedSection = "";

    // Function to toggle section expansion
    /**
     * @param {string} section
     */
    function toggleSection(section) {
        expandedSection = expandedSection === section ? "" : section;
    }

    // Function to calculate amounts
    function calculateAmounts() {
        if (totalAmount > 0) {
            solutionProvider.amount = totalAmount * 0.8;
            topicOwner.amount = totalAmount * 0.05;

            // Calculate feature creators amounts based on their feature's proportion
            const totalFeatureAmount = totalAmount * 0.1;
            const totalApprovedAmount = features.reduce(
                (sum, f) => sum + f.approved_amount,
                0,
            );

            featureCreators = featureCreators.map((creator) => {
                const feature = features.find(
                    (f) => f.id === creator.feature_id,
                );
                return {
                    ...creator,
                    amount: feature
                        ? totalFeatureAmount *
                          (feature.approved_amount / totalApprovedAmount)
                        : 0,
                };
            });
        }
    }

    onMount(async () => {
        try {
            let completionResult = await getSolutionCompletionData(solution_id);
            if ("Err" in completionResult) {
                error = completionResult.Err;
                loading = false;
                return;
            }
            let completionData = completionResult.Ok;

            // Convert feature_approval_counts from array to object
            const countsMap = Object.fromEntries(
                completionData.feature_approval_counts.map(([k, v]) => [
                    k,
                    Number(v),
                ]),
            );

            // Basic solution info
            title = completionData.solution.title;

            // Metrics
            approvalRate = completionData.approval_rate;
            totalPledges = Number(completionData.total_pledges);
            approvedPledges = Number(completionData.approved_pledges);
            deliveryDate = completionData.delivery_date;
            totalAmount = Number(completionData.total_amount);
            isReadyForCompletion = completionData.is_ready_for_completion;

            // Features
            features = completionData.features.map((feature) => ({
                title: feature.title,
                profile_image: feature.profile_image,
                approved_amount: Number(countsMap[feature.element_id] || 0),
                id: feature.element_id,
            }));

            // Distribution info
            solutionProvider = {
                id: completionData.solution_provider.principal.toString(),
                username: "", // We'll need to fetch this
                profile_image: "", // We'll need to fetch this
                wallet_id:
                    completionData.solution_provider.principal.toString(),
                amount: Number(completionData.solution_provider.amount),
            };

            featureCreators = completionData.feature_creators.map(
                (creator) => ({
                    id: creator.principal.toString(),
                    username: "", // We'll need to fetch this
                    profile_image: "", // We'll need to fetch this
                    wallet_id: creator.principal.toString(),
                    amount: Number(creator.amount),
                    feature_id: "", // Required by type
                    feature_title: "", // Required by type
                }),
            );

            topicOwner = {
                id: completionData.topic_owner.principal.toString(),
                username: "", // We'll need to fetch this
                profile_image: "", // We'll need to fetch this
                wallet_id: completionData.topic_owner.principal.toString(),
                amount: Number(completionData.topic_owner.amount),
            };

            platformFee = {
                amount: Number(completionData.platform_fee.amount),
            };

            loading = false;
        } catch (err) {
            error = String(err);
            loading = false;
        }
    });

    async function handleCompletion() {}
</script>

<div class="complete-container" transition:fade>
    <div class="header-container">
        <h1>Complete Your Solution</h1>
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
            <p>{error}</p>
        </div>
    {:else}
        <div class="completion-status-card" in:fly={{ y: 20, duration: 400 }}>
            <div class="status-header">
                <h2 style="margin-top: 0;">Completion details</h2>
                <div
                    class="overall-status {approvalRate >= 60
                        ? 'ready'
                        : 'not-ready'}"
                >
                    {approvalRate >= 60 ? "Ready to Complete" : "Not Ready"}
                </div>
            </div>

            <div class="metrics-grid">
                <div class="metric-card">
                    <div
                        class="metric-circle {approvalRate >= 60
                            ? 'success'
                            : 'warning'}"
                    >
                        <span class="metric-value">{approvalRate}%</span>
                    </div>
                    <span class="metric-label">Approval Rate</span>
                    <span class="metric-requirement">Users approved</span>
                </div>

                <div class="metric-card">
                    <div class="metric-circle success">
                        <span class="metric-value"
                            >{approvedPledges}/{totalPledges}</span
                        >
                    </div>
                    <span class="metric-label">Pledges Approved</span>
                    <span class="metric-requirement">From total pledges</span>
                </div>

                <div class="metric-card">
                    <div class="metric-circle success">
                        <span class="metric-value">15d</span>
                    </div>
                    <span class="metric-label">Time Since Delivery</span>
                    <span class="metric-requirement">No time limit</span>
                </div>
            </div>

            <div class="features-section">
                <h3>Implemented Features</h3>
                <div class="features-container">
                    <div class="column-headers">
                        <span class="header-title">Features</span>
                        <span class="header-amount">Amount</span>
                    </div>
                    {#each features || [] as feature}
                        <FeatureRow
                            title={feature.title}
                            profile_image={feature.profile_image}
                            approved_amount={feature.approved_amount}
                            id={feature.id}
                        />
                    {/each}
                </div>
            </div>

            <div class="distribution-preview">
                <h3>Payment Distribution Preview</h3>
                <div class="distribution-amounts">
                    <DistributionRow
                        type="Solution Provider"
                        percentage={80}
                        {totalAmount}
                        users={[solutionProvider]}
                    />

                    <DistributionRow
                        type="Feature Creators"
                        percentage={10}
                        {totalAmount}
                        users={featureCreators}
                    />

                    <DistributionRow
                        type="Topic Owner"
                        percentage={5}
                        {totalAmount}
                        users={[topicOwner]}
                    />

                    <div class="amount-row" style="margin-left: 0.5rem;">
                        <span class="label">Platform Fee (5%)</span>
                        <span class="amount"
                            >{(totalAmount * 0.05).toFixed(3)} ICP</span
                        >
                    </div>

                    <div class="amount-row total">
                        <span class="label">Total Distribution</span>
                        <span class="amount">{totalAmount.toFixed(3)} ICP</span>
                    </div>
                </div>
            </div>

            <div class="action-section">
                <p class="disclaimer">
                    By completing this solution, all approved money will be
                    distributed to stakeholders based on their contributions.
                    This action cannot be undone.
                </p>
                <BasicButtonDark
                    msg="Accept Payment and Complete Solution"
                    someFunction={handleCompletion}
                />
            </div>
        </div>
    {/if}
</div>

<style>
    .complete-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
    }

    .header-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
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

    .completion-status-card {
        background: var(--tertiary-color);
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .status-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    .overall-status {
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: 500;
    }

    .overall-status.ready {
        background: rgba(0, 200, 83, 0.1);
        color: rgb(0, 200, 83);
    }

    .overall-status.not-ready {
        background: rgba(255, 149, 0, 0.1);
        color: rgb(255, 149, 0);
    }

    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .metric-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 0.5rem;
    }

    .metric-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0.05)
        );
        border: 2px solid transparent;
        transition: all 0.3s ease;
    }

    .metric-circle.success {
        border-color: var(--primary-color);
        color: var(--primary-color);
    }

    .metric-circle.warning {
        border-color: rgba(255, 149, 0, 0.5);
        color: rgb(255, 149, 0);
    }

    .metric-label {
        font-weight: 500;
        color: var(--text-color);
    }

    .metric-requirement {
        font-size: 0.8rem;
        color: var(--text-secondary);
    }

    .features-section {
        margin: 1.5rem 0;
    }

    .features-container {
        background: var(--tertiary-color);
        border-radius: 12px;
        overflow: hidden;
    }

    .column-headers {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--secondary-color);
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.02em;
        background: linear-gradient(
            to right,
            color-mix(in srgb, var(--primary-color) 15%, var(--tertiary-color)),
            color-mix(in srgb, var(--primary-color) 8%, var(--tertiary-color))
        );
    }

    .header-title,
    .header-amount {
        position: relative;
        padding: 0.5rem 1rem;

        border-radius: 6px;
    }

    .distribution-preview {
        background: var(--background-secondary);
        border-radius: 12px;
    }

    .distribution-amounts {
        margin-top: 1rem;
    }

    .amount-row {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem;
        border-bottom: 1px solid var(--border-color);
    }

    .amount-row.total {
        border-bottom: none;
        margin-top: 0.5rem;
        padding-top: 1rem;
        border-top: 2px solid var(--border-color);
        font-weight: 600;
    }

    .action-section {
        margin-top: 1rem;
    }

    .disclaimer {
        color: var(--text-secondary);
        margin-bottom: 1.5rem;
        line-height: 1.5;
    }

    @media (max-width: 768px) {
        .metrics-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
        }

        .status-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }

        .metric-circle {
            width: 100px;
            height: 100px;
            font-size: 1.3rem;
        }

        .features-section {
            margin: 1rem 0;
        }

        .column-headers {
            padding: 0.75rem 1rem;
        }
    }
</style>
