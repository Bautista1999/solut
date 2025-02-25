<script>
    import { onMount } from "svelte";
    import { getSolutionCompletionData } from "../../../declarations/satellite/satellite.api";
    import { fade, slide } from "svelte/transition";

    export let data;
    let solution_id = data.params.solution_id;
    let title = "";
    let error = "";
    let loading = true;
    /**
     * @type {any[]}
     */
    let transactions = [];

    onMount(async () => {
        let completionResult = await getSolutionCompletionData(solution_id);
        if ("Err" in completionResult) {
            error = completionResult.Err;
            loading = false;
            return;
        }
        console.log(completionResult);
        let completionData = completionResult.Ok;

        // Basic solution info
        title = completionData.solution.title;
        loading = false;
    });
</script>

<div class="complete-container" transition:fade>
    <div class="header-container">
        <h1>Transfers for</h1>
        <a href={`/solution/${solution_id}`} class="solution-link">
            {title || "Solution"}
        </a>
    </div>
    <div class="features-container" transition:slide|local={{ duration: 300 }}>
        <div class="column-headers" style="justify-content: space-between;">
            <span class="header-title">FROM</span>
            <span class="header-title">TO</span>
            <span class="header-title">DATE</span>
            <span class="header-amount">AMOUNT (ICP)</span>
            <span class="header-amount">TRANSACTION NUMBER</span>
        </div>
        {#each transactions as transfer}
            <div
                class="transfer-row"
                style="display: flex; justify-content: space-between; padding: 0.5rem 1rem; "
            >
                <div style="flex: 1;">
                    {transfer.sender}
                </div>
                <div style="flex: 1;">{transfer.target}</div>
                <div style="flex: 1;">{transfer.created_at}</div>
                <div style="flex: 1; text-align: right;">
                    {transfer.amount} ICP
                </div>
                <div style="flex: 1; text-align: right;">
                    {transfer.transaction_number}
                </div>
            </div>
        {/each}
    </div>
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
