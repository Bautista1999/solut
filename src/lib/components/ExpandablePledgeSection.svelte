<script>
    import { slide } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import Table from "./Table/Table.svelte";
    import BasicButton from "./basicButton.svelte";
    import { createEventDispatcher } from "svelte";
    import { config, formatCurrency } from "$lib/stores/config_store";
    import { onMount } from "svelte";
    import { getPaginatedIdeas } from "../../declarations/satellite/satellite.api";

    // Import local components
    // If these imports cause linter errors, ensure the component files exist in the correct location
    import CheckboxCellComponent from "$lib/components/CheckboxCellComponent.svelte";
    import InputAmountCellComponent from "$lib/components/InputAmountCellComponent.svelte";
    import SendButtonCellComponent from "$lib/components/SendButtonCellComponent.svelte";
    import StatusCellComponent from "$lib/components/StatusCellComponent.svelte";
    import TitleCellComponent from "$lib/components/TitleCellComponent.svelte";
    import { afterUpdate } from "svelte";
    import {
        CreatePledgeNew,
        getUserAvailableBalance,
    } from "$lib/financial_functions/financial_functions";
    import { UserKey } from "$lib/stores/other_stores";
    // Props
    const dispatch = createEventDispatcher();
    export let isExpanded = false;
    export let availableFunds = 1000; // Sample value in configured currency
    export let topic_id = ""; // The ID of the topic

    // Store for ideas data
    /**
     * @type {any[]}
     */
    let ideas = [];
    let isLoading = true;

    // Helper function to convert e8s to ICP
    /**
     * Converts e8s (smallest unit of ICP) to ICP
     * @param {number | bigint} e8s - Amount in e8s
     * @returns {string} Amount in ICP
     */
    const e8sToIcp = (e8s) => (Number(e8s) / 100000000).toFixed(2);

    onMount(async () => {
        try {
            const response = await getPaginatedIdeas(
                "most_pledged",
                [0],
                [12],
                [],
                [topic_id],
            );
            if ("Ok" in response) {
                const [ideasData] = response.Ok;
                // Map backend data to our table format
                ideas = ideasData.map((idea, index) => ({
                    id: index + 1, // Use numeric IDs for compatibility
                    uniqueKey: `${idea.element_id}`,
                    title: idea.title,
                    checked: false,
                    amountPledged: e8sToIcp(idea.total_pledged), // Convert e8s to ICP
                    amount: 0,
                    status: "neutral",
                    handleCheckboxToggle: createToggleHandler(index + 1),
                    handleAmountChange: createAmountHandler(index + 1),
                    originalId: idea.element_id, // Store original ID if needed
                }));
                ideas = ideas; // Update the table data
            }
        } catch (error) {
            console.error("Error fetching ideas:", error);
        } finally {
            isLoading = false;
        }
    });

    // Function to reset all state to initial values
    function resetState() {
        ideas = ideas.map((idea) => ({
            ...idea,
            checked: false,
            amount: 0,
            status: "neutral",
        }));
        isExecuting = false;
    }

    function handleClose() {
        isExpanded = false;
        dispatch("expandedChange", false);
        // Reset all state when closing
        resetState();
    }

    // Also reset state when isExpanded becomes false from parent
    $: if (!isExpanded) {
        resetState();
    }

    $: if (isExpanded) {
        dispatch("expandedChange", true);
    }

    // Create a function factory for checkbox toggle handlers
    /**
     * Creates a toggle handler function for a specific row
     * @param {number} rowId - The ID of the row
     * @returns {function(boolean): void} A function that handles checkbox toggling
     */
    function createToggleHandler(rowId) {
        /**
         * @param {boolean} checked - The new checked state
         */
        return function (checked) {
            const index = ideas.findIndex((idea) => idea.id === rowId);
            if (index >= 0) {
                ideas[index].checked = checked;
                ideas = [...ideas]; // Trigger reactivity
                console.log(
                    `Toggle handled for idea ${rowId}, checked=${checked}`,
                );
            }
        };
    }

    /**
     * Creates an amount change handler for a specific row
     * @param {number} rowId - The ID of the row
     * @returns {function(number): void} A function that handles amount changes
     */
    function createAmountHandler(rowId) {
        /**
         * @param {number} amount - The new amount
         */
        return function (amount) {
            const index = ideas.findIndex((idea) => idea.id === rowId);
            if (index >= 0) {
                ideas[index].amount = amount;
                ideas = [...ideas]; // Trigger reactivity
                console.log(`Amount updated for idea ${rowId}: ${amount}`);
            }
        };
    }

    // Calculate total amount pledged
    $: totalAmount = ideas
        .filter((idea) => idea.checked && idea.amount > 0)
        .reduce((sum, idea) => sum + idea.amount, 0);

    // Track which ideas are ready to be pledged
    $: ideasToExecute = ideas
        .filter(
            (idea) =>
                idea.checked && idea.amount > 0 && idea.status === "neutral",
        )
        .map((idea) => ({
            id: idea.id,
            key: idea.uniqueKey,
            amount: idea.amount,
            index: ideas.findIndex((i) => i.id === idea.id),
        }));

    // Determine if the execute button should be enabled
    $: canExecutePledges = ideasToExecute.length > 0;

    // Is pledging in progress
    let isExecuting = false;

    // Define columns for the table
    const columns = [
        {
            id: "checkbox",
            header: "",
            accessor: "checked",
            width: "10px",
            cellComponent: CheckboxCellComponent,
        },
        {
            id: "title",
            header: "Idea",
            accessor: "title",
            sortable: true,
            width: "100px",
            cellComponent: TitleCellComponent,
        },
        {
            id: "Amount pledged",
            header: "Total Raised",
            accessor: "amountPledged",
            sortable: true,
            width: "50px",
            format: (/** @type {any} */ value) => $formatCurrency(value),
        },
        {
            id: "amount",
            header: "Amount",
            accessor: "amount",
            width: "100px",
            cellComponent: InputAmountCellComponent,
        },
        // {
        //     id: "sendButton",
        //     header: "",
        //     accessor: "id",
        //     width: "40px",
        //     cellComponent: SendButtonCellComponent,
        // },
        {
            id: "status",
            header: "Status",
            accessor: "status",
            width: "40px",
            cellComponent: StatusCellComponent,
        },
    ];

    // Track column ids for initial visibility
    const allColumnIds = columns.map((col) => col.id);

    /**
     * Execute all pledges sequentially
     */
    async function executePledges() {
        if (isExecuting || !canExecutePledges) return;

        isExecuting = true;

        // Process each pledge sequentially
        for (const idea of ideasToExecute) {
            // Update status to loading
            ideas[idea.index].status = "loading";
            ideas = [...ideas]; // Trigger reactivity

            try {
                // Simulate API call with delay
                // await new Promise((resolve) => setTimeout(resolve, 2000));
                let pledgeCreation = await CreatePledgeNew(
                    topic_id,
                    idea.key,
                    idea.amount,
                    $UserKey,
                );

                // Here you would call the actual pledge creation API
                // await pledgeCreate(topic_id, idea.id, idea.amount);
                console.log(
                    `Pledge created for idea ${idea.id} with amount ${$formatCurrency(idea.amount)}`,
                );

                // Update status to completed
                ideas[idea.index].status = "completed";
            } catch (error) {
                alert(`Error creating pledge for idea ${idea.id}:` + error);
                if (String(error).includes("signature could not be verified")) {
                    ideas[idea.index].status = "success";
                } else {
                    // Update status to error
                    ideas[idea.index].status = "error";
                }
            }

            // Trigger reactivity
            ideas = [...ideas];
        }

        isExecuting = false;
    }

    // Helper function to conditionally call executePledges based on canExecutePledges
    function handleExecutePledges() {
        if (canExecutePledges && !isExecuting) {
            executePledges();
        }
    }

    // For debugging, log when component updates
    afterUpdate(() => {
        console.log("ExpandablePledgeSection updated, ideas:", ideas);
    });

    async function getAvailableFunds() {
        const response = await getUserAvailableBalance();
        availableFunds = response;
    }

    // When displaying available funds, also convert from e8s to ICP
    // $: availableFundsIcp = e8sToIcp(availableFunds);
</script>

{#if isExpanded}
    <div
        class="expandable-section"
        transition:slide={{ duration: 300, easing: quintOut }}
    >
        <div class="section-header">
            <div class="header-content">
                <h2 style="margin-top: 0px">Pledge Funds</h2>
                <button class="close-button" on:click={handleClose}>
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <p>Choose the ideas you want to fund for this topic.</p>
        </div>

        {#if isLoading}
            <div class="loading-container">
                <span>Loading ideas...</span>
            </div>
        {:else}
            <div class="table-container">
                <Table
                    rows={ideas}
                    {columns}
                    showCheckboxes={false}
                    showRowActions={false}
                    showFilters={true}
                    initialVisibleColumns={allColumnIds}
                    showColumnToggle={false}
                />
            </div>
        {/if}

        <div class="summary-section">
            <div class="total-amount">
                <span class="total-label">Total:</span>
                <span class="total-value">{$formatCurrency(totalAmount)}</span>
            </div>
            <div class="total-amount">
                <span class="total-label">Total Available:</span>

                {#await getAvailableFunds()}
                    <span
                        class="total-value"
                        style="font-weight: 400; color:  var(--eigth-color)"
                        >Loading...</span
                    >
                {:then}
                    <span
                        class="total-value"
                        style="color: {availableFunds >= totalAmount
                            ? 'var(--green)'
                            : 'var(--red-wine)'}"
                        >{$formatCurrency(availableFunds)}</span
                    >
                {/await}
            </div>

            <div class="action-button">
                <div
                    class={!canExecutePledges || isExecuting
                        ? "button-disabled"
                        : ""}
                >
                    <BasicButton
                        msg={"Pledge funds"}
                        someFunction={handleExecutePledges}
                        icon={""}
                    />
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .expandable-section {
        display: flex;
        flex-direction: column;
        background-color: var(--tertiary-color);
        border-radius: 8px;
        padding: 15px;
        gap: 15px;

        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .table-container {
        width: 100%;
    }

    .summary-section {
        display: flex;
        flex-direction: column;
        gap: 15px;
        padding-top: 15px;
        border-top: 1px solid var(--seventh-color);
    }

    .total-amount {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 10px;
    }

    .total-label {
        font-weight: 600;
        color: var(--secondary-color);
    }

    .total-value {
        font-size: large;
        font-weight: 600;
        color: var(--primary-color);
    }

    .action-button {
        display: flex;
        justify-content: end;
    }

    .button-disabled {
        opacity: 0.5;
        pointer-events: none;
    }

    .section-header {
        width: 100%;
    }

    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .close-button {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--secondary-color);
        padding: 8px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
            background-color 0.2s,
            color 0.2s;
    }

    .close-button:hover {
        color: var(--primary-color);
    }
</style>
