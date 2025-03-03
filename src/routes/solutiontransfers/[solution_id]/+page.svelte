<script>
    import { onMount } from "svelte";
    // @ts-ignore
    import { getSolutionCompletionData } from "../../../declarations/satellite/satellite.api";
    // @ts-ignore
    import { fade, slide } from "svelte/transition";
    import Table from "$lib/components/Table/Table.svelte";
    import TransactionButton from "$lib/components/TransactionButton.svelte";
    import { getDoc, listDocs } from "@junobuild/core-peer";
    import AccountHex from "$lib/components/AccountHex.svelte";

    // @ts-ignore
    export let data;
    let solution_id = data.params.solution_id;
    let title = "";
    let error = "";
    let loading = true;
    /**
     * @type {any[]}
     */
    let transactions = [
        // Sample transaction data for demonstration
        {
            id: "TX-001",
            sender: "0x123...456",
            target: "0x789...012",
            created_at: "2025-02-28",
            amount: "1.25",
            transaction_number: "12345678",
        },
        {
            id: "TX-002",
            sender: "0x456...789",
            target: "0x012...345",
            created_at: "2025-02-27",
            amount: "0.75",
            transaction_number: "87654321",
        },
        {
            id: "TX-003",
            sender: "0x789...012",
            target: "0x345...678",
            created_at: "2025-02-26",
            amount: "2.50",
            transaction_number: "23456789",
        },
    ];

    // Define table columns
    const columns = [
        {
            id: "sender",
            header: "From",
            accessor: "sender",
            sortable: true,
            cellComponent: AccountHex,
        },
        {
            id: "target",
            header: "To",
            accessor: "target",
            sortable: true,
            cellComponent: AccountHex,
        },
        {
            id: "created_at",
            header: "Date",
            accessor: "created_at",
            sortable: true,
        },
        {
            id: "amount",
            header: "Amount (ICP)",
            accessor: "amount",
            sortable: true,
        },
        {
            id: "transaction_number",
            header: "Transaction number",
            accessor: "transaction_number",
            sortable: false,
            cellComponent: TransactionButton,
        },
    ];

    onMount(async () => {
        let queryTransactions = (
            await listDocs({
                collection: "transaction",
                filter: {
                    matcher: {
                        key: solution_id,
                    },
                },
            })
        ).items;
        transactions = [];
        for (let transaction of queryTransactions) {
            transactions.push({
                id: transaction.key,
                uniqueKey: `${transaction.key}`,
                sender: Buffer.from(transaction.data.sender).toString("hex"),
                target: Buffer.from(transaction.data.target).toString("hex"),
                // @ts-ignore
                created_at: new Date(Number(transaction.created_at / 1000000n))
                    .toISOString()
                    .split("T")[0],
                amount: (transaction.data.amount / 10 ** 8).toFixed(3),
                transaction_number: transaction.data.transaction_number,
            });
        }
        let solutionDoc = await getDoc({
            collection: "solution",
            key: solution_id,
        });
        loading = false;
        // @ts-ignore
        title = solutionDoc.data.title;

        console.log(transactions);

        // In a real implementation, you would map the actual transaction data here
        // transactions = completionData.transactions;
    });
</script>

<div class="complete-container" transition:fade>
    <div class="header-container">
        <h1>Transfers for</h1>
        <a href={`/solution/${solution_id}`} class="solution-link">
            {title || "Solution"}
        </a>
    </div>

    {#if error}
        <div class="error-message">
            {error}
        </div>
    {/if}

    {#if loading}
        <div class="loading-indicator">Loading transaction data...</div>
    {:else}
        <Table
            rows={transactions}
            {columns}
            showCheckboxes={false}
            showRowActions={false}
        />
    {/if}
</div>

<style>
    .complete-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .header-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
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

    h2 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
    }

    .error-message {
        background-color: rgba(239, 68, 68, 0.1);
        color: rgb(220, 38, 38);
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
    }

    .loading-indicator {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem;
        color: var(--text-secondary, #666);
        font-style: italic;
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

    @media (max-width: 768px) {
        .complete-container {
            padding: 0;
        }
        .header-container {
            margin-bottom: 0rem;
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
</style>
