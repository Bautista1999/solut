<script>
    import { slide } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import Table from "./Table/Table.svelte";
    import BasicButton from "./basicButton.svelte";

    // Import local components
    // If these imports cause linter errors, ensure the component files exist in the correct location
    import CheckboxCellComponent from "$lib/components/CheckboxCellComponent.svelte";
    import InputAmountCellComponent from "$lib/components/InputAmountCellComponent.svelte";
    import SendButtonCellComponent from "$lib/components/SendButtonCellComponent.svelte";
    import StatusCellComponent from "$lib/components/StatusCellComponent.svelte";
    import { afterUpdate } from "svelte";
    // Props
    export let isExpanded = false;
    export let availableFunds = 1000; // Sample value in ICP
    export let topic_id = ""; // The ID of the topic

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
            const index = sampleIdeas.findIndex((idea) => idea.id === rowId);
            if (index >= 0) {
                sampleIdeas[index].checked = checked;
                sampleIdeas = [...sampleIdeas]; // Trigger reactivity
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
            const index = sampleIdeas.findIndex((idea) => idea.id === rowId);
            if (index >= 0) {
                sampleIdeas[index].amount = amount;
                sampleIdeas = [...sampleIdeas]; // Trigger reactivity
                console.log(`Amount updated for idea ${rowId}: ${amount}`);
            }
        };
    }

    // Sample data for the table with event handlers
    let sampleIdeas = [
        {
            id: 1,
            uniqueKey: "idea-1",
            title: "Add dark mode to the application",
            checked: false,
            amount: 0,
            status: "neutral",
            handleCheckboxToggle: createToggleHandler(1),
            handleAmountChange: createAmountHandler(1),
        },
        {
            id: 2,
            uniqueKey: "idea-2",
            title: "Implement real-time notifications",
            checked: false,
            amount: 0,
            status: "neutral",
            handleCheckboxToggle: createToggleHandler(2),
            handleAmountChange: createAmountHandler(2),
        },
        {
            id: 3,
            uniqueKey: "idea-3",
            title: "Create a mobile app version",
            checked: false,
            amount: 0,
            status: "neutral",
            handleCheckboxToggle: createToggleHandler(3),
            handleAmountChange: createAmountHandler(3),
        },
        {
            id: 4,
            uniqueKey: "idea-4",
            title: "Add export functionality for reports",
            checked: false,
            amount: 0,
            status: "neutral",
            handleCheckboxToggle: createToggleHandler(4),
            handleAmountChange: createAmountHandler(4),
        },
        {
            id: 5,
            uniqueKey: "idea-5",
            title: "Improve search functionality",
            checked: false,
            amount: 0,
            status: "neutral",
            handleCheckboxToggle: createToggleHandler(5),
            handleAmountChange: createAmountHandler(5),
        },
    ];

    // Calculate total amount pledged
    $: totalAmount = sampleIdeas
        .filter((idea) => idea.checked && idea.amount > 0)
        .reduce((sum, idea) => sum + idea.amount, 0);

    // Track which ideas are ready to be pledged
    $: ideasToExecute = sampleIdeas
        .filter(
            (idea) =>
                idea.checked && idea.amount > 0 && idea.status === "neutral",
        )
        .map((idea) => ({
            id: idea.id,
            amount: idea.amount,
            index: sampleIdeas.findIndex((i) => i.id === idea.id),
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
        },
        {
            id: "amount",
            header: "Amount",
            accessor: "amount",
            // width: "",
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
            sampleIdeas[idea.index].status = "loading";
            sampleIdeas = [...sampleIdeas]; // Trigger reactivity

            try {
                // Simulate API call with delay
                await new Promise((resolve) => setTimeout(resolve, 2000));

                // Here you would call the actual pledge creation API
                // await pledgeCreate(topic_id, idea.id, idea.amount);
                console.log(
                    `Pledge created for idea ${idea.id} with amount ${idea.amount}`,
                );

                // Update status to completed
                sampleIdeas[idea.index].status = "completed";
            } catch (error) {
                console.error(
                    `Error creating pledge for idea ${idea.id}:`,
                    error,
                );
                // Update status to error
                sampleIdeas[idea.index].status = "error";
            }

            // Trigger reactivity
            sampleIdeas = [...sampleIdeas];
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
        console.log("ExpandablePledgeSection updated, ideas:", sampleIdeas);
    });
</script>

{#if isExpanded}
    <div
        class="expandable-section"
        transition:slide={{ duration: 300, easing: quintOut }}
    >
        <div class="section-header">
            <h2 style="margin-top: 0px">Pledge Funds</h2>
            <p>
                Choose the ideas you want to fund for this topic. You currently
                have {availableFunds} ICP available to pledge.
            </p>
        </div>

        <div class="table-container">
            <Table
                rows={sampleIdeas}
                {columns}
                showCheckboxes={false}
                showRowActions={false}
                showFilters={true}
                initialVisibleColumns={allColumnIds}
                showColumnToggle={false}
            />
        </div>

        <div class="summary-section">
            <div class="total-amount">
                <span class="total-label">Total:</span>
                <span class="total-value">{totalAmount.toFixed(2)} ICP</span>
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
</style>
