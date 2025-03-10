<script>
    /** @type {number} */
    export let value = 0;

    /** @type {Record<string, any>} */
    export let row;

    $: isLoading = row.status === "loading";
    $: isDisabled = isLoading || !row.checked; // Disable if row is loading or not checked

    /**
     * @param {Event} e
     */
    function updateAmount(e) {
        if (isDisabled) return; // Prevent updates when disabled

        const newValue = parseFloat(
            /** @type {HTMLInputElement} */ (e.target).value,
        );

        const amount = isNaN(newValue) ? 0 : newValue;

        // Update the row directly
        row.amount = amount;

        // Use the handleAmountChange handler if available
        if (row.handleAmountChange) {
            row.handleAmountChange(amount);
        } else {
            // If no handler, at least ensure reactivity
            row = { ...row };
        }
    }
</script>

<div class="input-cell" class:loading={isLoading}>
    {#if row.checked}
        <input
            type="number"
            min="0"
            step="0.01"
            bind:value={row.amount}
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
