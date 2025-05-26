<script>
    /**
     * @type {string}
     */
    export let value;

    /**
     * @type {any}
     */
    export let row;
</script>

<span class="payment-tag">
    {value || "N/A"}
</span>

<style>
    .payment-tag {
        padding: 0.3rem 0.75rem;
        border-radius: 6px;
        font-size: 0.9rem;
        text-transform: capitalize;
        background: var(--primary-color);
        color: white;
        font-weight: 500;
        display: inline-block;
    }
</style>
