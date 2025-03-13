<script>
    /** @type {number} */
    export let value = 0;

    /** @type {Record<string, any>} */
    export let row;

    // Use a string for the input value
    /** @type {string} */
    let inputValue = row.amount ? row.amount.toString() : "";

    $: isLoading = row.status === "loading";
    $: isDisabled = isLoading || !row.checked; // Disable if row is loading or not checked

    /**
     * @param {Event} e
     */
    function updateAmount(e) {
        if (isDisabled) return; // Prevent updates when disabled

        const input = /** @type {HTMLInputElement} */ (e.target);
        inputValue = input.value;

        // Convert to number only if there's a value
        const amount = inputValue === "" ? 0 : parseFloat(inputValue);

        // Update the row
        row.amount = amount;

        // Use the handleAmountChange handler if available
        if (row.handleAmountChange) {
            row.handleAmountChange(amount);
        } else {
            // If no handler, at least ensure reactivity
            row = { ...row };
        }
    }

    // Keep inputValue in sync with row.amount when it changes externally
    $: if (row.amount !== undefined && !isNaN(row.amount)) {
        inputValue = row.amount > 0 ? row.amount.toString() : "";
    }
</script>

<div class="input-cell" class:loading={isLoading}>
    {#if row.checked}
        <input
            type="number"
            min="0"
            step="0.01"
            value={inputValue}
            on:input={updateAmount}
            placeholder="0.00"
            disabled={isLoading}
        />
    {:else}
        <div class="placeholder-text">—</div>
    {/if}
</div>

<style>
    .input-cell {
        width: 50%;
    }

    .loading {
        opacity: 0.5;
        pointer-events: none;
    }

    .placeholder-text {
        color: var(--forth-color);
        text-align: center;
        font-size: medium;
    }

    input {
        width: 100%;
        padding: 8px;
        border: 1px solid var(--seventh-color);
        border-radius: 8px;
        font-size: medium;
        font-family: "Barlow";
    }

    input:focus {
        outline: none;
        border-color: var(--primary-color);
    }

    input:disabled {
        background-color: var(--tertiary-color);
        cursor: not-allowed;
    }
</style>
