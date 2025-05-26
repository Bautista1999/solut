<script>
    import { getDoc } from "@junobuild/core";
    import { onMount } from "svelte";
    import { fade, fly, slide } from "svelte/transition";
    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";
    import { ICPtoDecimal } from "$lib/financial_functions/financial_functions";
    import DistributionRow from "$lib/components/DistributionRow.svelte";
    import FeatureRow from "$lib/components/FeatureRow.svelte";
    import { formatDistanceToNow } from "date-fns";
    import SuccessNew from "$lib/components/Success_New.svelte";
    import { goto } from "$app/navigation";

    import {
        completeSolution,
        getSolutionCompletionData,
    } from "../../../declarations/satellite/satellite.api";
    import FlatButtonSmall from "$lib/components/FlatButtonSmall.svelte";
    import ModalConfirmationNew from "$lib/components/ModalConfirmationNew.svelte";
    import { DeleteModal } from "$lib/stores/other_stores";
    import ErrorMessage from "$lib/components/ErrorMessage.svelte";

    export let data;
    let solution_id = data.params.solution_id;
    let title = "";
    let loading = true;
    let error = "";
    let approvalRate = 0;
    let totalPledgesActive = 0;
    let approvedPledges = 0;
    /** @type {bigint} */
    let deliveryDate = 0n;
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
        profile_image: "default_image.png",
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
        profile_image: "default_image.png",
        wallet_id: "",
        amount: 0,
    };

    let platformFee = {
        amount: 0,
    };
    let acceptedTerms = false;

    // Track which section is expanded
    let expandedSection = "";

    // Calculate days since delivery
    function calculateDaysSinceDelivery() {
        // Convert nanoseconds to milliseconds, same as in ActivityPost.svelte
        const timestamp = Math.floor(Number(deliveryDate) / 1_000_000);
        const date = new Date(timestamp);

        if (isNaN(date.getTime())) {
            console.error("Invalid date generated from timestamp:", timestamp);
            return "0";
        }

        const timeDistance = formatDistanceToNow(date);
        // Extract just the number from strings like "about 15 days ago"
        const days = timeDistance.match(/\d+/);
        return days ? days[0] : "0";
    }

    // Modal state variables for completing solution
    let modalMessage = "";
    let modalSuccessMsg = "";
    let modalLoadingMsg = "";
    let modalErrorMsg = "";
    let modalLoading = false;
    let modalSuccess = false;
    let modalError = false;
    let modalAction = async () => {};
    let showCompleteSolutionModal = false;

    const setModalForCompleteSolution = () => {
        modalMessage =
            "Are you sure you want to complete the solution and accept payment? This action cannot be undone.";
        modalSuccessMsg =
            "Solution completed and payment accepted successfully!";
        modalLoadingMsg = "Completing solution...";
        modalLoading = false;
        modalError = false;
        modalSuccess = false;
        modalAction = async () => {
            modalLoading = true;
            try {
                const result = await completeSolution(solution_id);
                if ("Ok" in result) {
                    modalSuccess = true;
                } else {
                    modalError = true;
                    modalErrorMsg = result.Err;
                }
            } catch (e) {
                modalError = true;
                modalErrorMsg = e instanceof Error ? e.message : String(e);
            }
            modalLoading = false;
            setTimeout(() => {
                DeleteModal.set(false);
                showCompleteSolutionModal = false;
            }, 3000);
        };
    };

    function handleCompletion() {
        showCompleteSolutionModal = true;
        setModalForCompleteSolution();
        DeleteModal.set(true);
    }

    /**
     * @type {Array<{ feature: string, from: string, to: string, amount: string, description: string }>}
     */
    let transfersPreview = [];
    let transfersExpanded = false;
    function toggleTransfers() {
        transfersExpanded = !transfersExpanded;
    }
    /**
     * Handles keyboard events for the transfers toggle.
     * @param {KeyboardEvent} event
     */
    function handleTransfersKeydown(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleTransfers();
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
            console.log(completionResult);
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
            totalPledgesActive = Number(completionData.total_pledges);
            approvedPledges = Number(completionData.approved_pledges);
            deliveryDate = completionData.delivery_date;
            totalAmount = Number(completionData.total_amount);
            isReadyForCompletion = completionData.is_ready_for_completion;

            // Features
            features = completionData.features.map((feature) => ({
                title: feature.basic_info.title,
                profile_image: feature.basic_info.profile_image,
                approved_amount: Number(feature.approved_amount) / 1e8,
                id: feature.basic_info.element_id,
            }));

            // Distribution info
            solutionProvider = {
                id: "",
                username: completionData.solution_provider.user.username,
                profile_image:
                    completionData.solution_provider.user.profile_picture,
                wallet_id: "",
                amount: Number(completionData.solution_provider.amount) / 1e8,
            };

            featureCreators = completionData.feature_creators.map(
                (creator) => ({
                    id: "",
                    username: creator.user.username,
                    profile_image: creator.user.profile_picture,
                    wallet_id: "",
                    amount: Number(creator.amount) / 1e8,
                    feature_id: "",
                    feature_title: "",
                }),
            );

            topicOwner = {
                id: "",
                username: completionData.topic_owner.user.username,
                profile_image: completionData.topic_owner.user.profile_picture,
                wallet_id: "",
                amount: Number(completionData.topic_owner.amount) / 1e8,
            };

            platformFee = {
                amount: Number(completionData.platform_fee.amount) / 1e8,
            };

            loading = false;
        } catch (err) {
            error = String(err);
            loading = false;
        }

        transfersPreview = features.flatMap((f, index) => {
            let transfers = [];
            let candidate = featureCreators[index] || null;
            let combined =
                candidate &&
                solutionProvider.username === candidate.username &&
                solutionProvider.username === topicOwner.username;
            if (combined) {
                transfers.push({
                    feature: f.title,
                    from: f.id,
                    to: solutionProvider.username,
                    amount: (f.approved_amount * 0.95).toFixed(3),
                    description:
                        "Combined transfer to Developer/Feature Creator/Topic Owner",
                });
            } else {
                transfers.push({
                    feature: f.title,
                    from: f.id,
                    to: solutionProvider.username,
                    amount: (f.approved_amount * 0.8).toFixed(3),
                    description: "Transfer to Developer",
                });
                if (candidate) {
                    transfers.push({
                        feature: f.title,
                        from: f.id,
                        to: candidate.username,
                        amount: (f.approved_amount * 0.1).toFixed(3),
                        description: "Transfer to Feature Creator",
                    });
                }
                transfers.push({
                    feature: f.title,
                    from: f.id,
                    to: topicOwner.username,
                    amount: (f.approved_amount * 0.05).toFixed(3),
                    description: "Transfer to Topic Owner",
                });
            }
            transfers.push({
                feature: f.title,
                from: f.id,
                to: "Solutio Platform Fee",
                amount: (f.approved_amount * 0.05).toFixed(3),
                description: "Platform Fee",
            });
            return transfers;
        });
        // Filter out transfers with an amount of 0
        transfersPreview = transfersPreview.filter(
            (transfer) => parseFloat(transfer.amount) > 0,
        );
    });
</script>

{#if modalSuccess}
    <SuccessNew
        message="Solution completed successfully! All payments have been distributed."
        buttonText="View Solution Details"
        someFunction={() => {
            goto(`/solutiontransfers/${solution_id}`);
        }}
    />
{:else if modalError}
    <ErrorMessage
        message={"Want to try again?"}
        error={modalErrorMsg}
        someFunction={() => {
            modalError = false;
        }}
    />
{:else}
    <div class="complete-container" transition:fade>
        <div class="header-container">
            <h1>Complete Your Solution</h1>
            <a href={`/solution/${solution_id}`} class="solution-link">
                {title || "Solution"}
            </a>
        </div>

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
                            >{approvedPledges}/{totalPledgesActive +
                                approvedPledges}</span
                        >
                    </div>
                    <span class="metric-label">Pledges Approved</span>
                    <span class="metric-requirement">From total pledges</span>
                </div>

                <div class="metric-card">
                    <div class="metric-circle success">
                        <span class="metric-value"
                            >{calculateDaysSinceDelivery()}d</span
                        >
                    </div>
                    <span class="metric-label">Time Since Delivery</span>
                    <span class="metric-requirement">No time limit</span>
                </div>
            </div>
            <FlatButtonSmall
                msg="Check approvals"
                someFunction={() => {
                    window.open(`/solution/${solution_id}/approvals`, "_blank");
                }}
            />
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
                            >{((totalAmount * 0.05) / 1e8).toFixed(3)} ICP</span
                        >
                    </div>

                    <div class="amount-row total">
                        <span class="label">Total Distribution</span>
                        <span class="amount"
                            >{(totalAmount / 1e8).toFixed(3)} ICP</span
                        >
                    </div>
                </div>
            </div>

            {#if transfersPreview && transfersPreview.length > 0}
                <div class="transfers-preview">
                    <div
                        class="amount-row expandable"
                        on:click={toggleTransfers}
                        on:keydown={handleTransfersKeydown}
                        role="button"
                        tabindex="0"
                    >
                        <div class="row-header">
                            <h3 style="margin: 0;">
                                <span class="material-symbols-outlined">
                                    {transfersExpanded
                                        ? "arrow_drop_down"
                                        : "arrow_right"}
                                </span>
                                Transfers Preview
                            </h3>
                        </div>
                    </div>
                    {#if transfersExpanded}
                        <div
                            class="features-container"
                            transition:slide|local={{ duration: 300 }}
                        >
                            <div
                                class="column-headers"
                                style="justify-content: space-between;"
                            >
                                <span class="header-title">From Feature</span>
                                <span class="header-title">To User</span>
                                <span class="header-amount">Amount (ICP)</span>
                                <span class="header-amount">Fee (ICP)</span>
                            </div>
                            {#each transfersPreview as transfer}
                                <div
                                    class="transfer-row"
                                    style="display: flex; justify-content: space-between; padding: 0.5rem 1rem; "
                                >
                                    <div style="flex: 1;">
                                        {transfer.feature}
                                    </div>
                                    <div style="flex: 1;">{transfer.to}</div>
                                    <div style="flex: 1; text-align: right;">
                                        {transfer.amount} ICP
                                    </div>
                                    <div style="flex: 1; text-align: right;">
                                        0.0001 ICP
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/if}

            <div class="action-section">
                <div class="terms-container">
                    <label>
                        <input type="checkbox" bind:checked={acceptedTerms} />
                        I agree to the
                        <a
                            href="https://forum.solutio.one/-205/terms-and-conditions"
                            target="_blank"
                            rel="noopener noreferrer">Terms and Conditions</a
                        >
                    </label>
                </div>
                <p class="disclaimer">
                    By completing this solution, all approved money will be
                    distributed to stakeholders based on their contributions.
                    This action cannot be undone.
                </p>
                <BasicButtonDark
                    msg="Accept Payment and Complete Solution"
                    someFunction={handleCompletion}
                    disabled={!acceptedTerms}
                />
            </div>
        </div>

        {#if showCompleteSolutionModal}
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
{/if}

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
    }

    .distribution-amounts {
        margin-top: 1rem;
    }

    .amount-row {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem;
    }

    .amount-row.total {
        margin-top: 1rem;
        padding-top: 1rem;
        font-weight: 600;
    }

    .action-section {
        margin-top: 1rem;
    }

    .terms-container {
        margin-bottom: 1rem;
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

    .transfer-row {
        display: block;
        padding: 0.75rem 0.5rem;
        text-decoration: none;
        color: inherit;

        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        margin-bottom: 1rem;
    }
    .transfer-row:hover {
        background: color-mix(
            in srgb,
            var(--primary-color) 4%,
            var(--tertiary-color)
        );
        transform: translateY(-1px);
    }
    .transfer-row:active {
        transform: translateY(0);
    }
    .transfer-header {
        margin-bottom: 0.5rem;
    }
    .transfer-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
    }
    .transfer-description {
        font-size: 0.85rem;
        color: var(--text-secondary);
    }

    /* Additional styling for Transfers Preview header */
    .transfers-preview .amount-row.expandable {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 0.75rem;
    }

    .transfers-preview .amount-row.expandable:hover {
        background: linear-gradient(
            to right,
            var(--background-hover),
            transparent
        );
        transition: all 0.2s ease;
    }
    .transfers-preview .row-header {
        display: flex;
        align-items: center;
    }

    .transfers-preview .row-header .material-symbols-outlined {
        vertical-align: middle;
        margin-right: 0.5rem;
    }

    .transfers-preview {
        border: 1px solid transparent; /* Initial transparent border to prevent layout shift */
        border-radius: 30px;
        transition: border-color 0.2s ease;
    }

    .transfers-preview:hover {
        border-color: var(--primary-color);
    }
</style>
