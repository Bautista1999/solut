<script>
    /** @type {number} */
    export let value = 0;

    /** @type {Record<string, any>} */
    export let row;

    // Use a string for the input value
    /** @type {string} */
    let inputValue = "";

    $: isLoading = row.status === "loading";
    $: isDisabled = isLoading || !row.checked;

    /**
     * @param {Event} e
     */
    function updateAmount(e) {
        if (isDisabled) return;

        const input = /** @type {HTMLInputElement} */ (e.target);
        inputValue = input.value;

        // Convert to number, allowing zero values
        const amount = inputValue === "" ? 0 : Number(inputValue);

        // Update the row
        row.amount = amount;

        if (row.handleAmountChange) {
            row.handleAmountChange(amount);
        } else {
            row = { ...row };
        }
    }

    // Keep inputValue in sync with row.amount when it changes externally
    $: if (row.amount !== undefined && !isNaN(row.amount) && row.amount > 0) {
        inputValue = row.amount.toString();
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

    /* Style for the placeholder */
    input::placeholder {
        color: var(--forth-color);
    }
</style>
