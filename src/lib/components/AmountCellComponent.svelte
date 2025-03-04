<script>
    /**
     * @type {number}
     */
    export let value;

    /**
     * @type {any}
     */
    export let row;

    // Determine which formatted field to use based on which numeric field matches the passed value
    $: isExpectedAmount =
        row &&
        row.expected_amount_numeric !== undefined &&
        value === row.expected_amount_numeric;

    // Use the appropriate formatted field
    $: formattedAmount =
        isExpectedAmount && row.expected_amount_formatted
            ? row.expected_amount_formatted
            : row && row.amount_formatted
              ? row.amount_formatted
              : typeof value === "number"
                ? value.toFixed(2)
                : value;
</script>

<span class="amount">{formattedAmount}</span>

<style>
    .amount {
        font-family: "Barlow", sans-serif;
        color: var(--secondary-color);
        text-align: right;
        display: block;
    }
</style>
