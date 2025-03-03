<script>
    export let value;
    // Construct the transaction URL
    const transactionUrl = `https://dashboard.internetcomputer.org/transaction/${value}`;
</script>

<a
    href={transactionUrl}
    target="_blank"
    rel="noopener noreferrer"
    class="value transaction-link"
>
    <span class="link-icon">🌐</span>
    <span class="link-text">View Transaction</span>
</a>

<style>
    .transaction-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        color: #007bff; /* Adjust color as needed */
        font-weight: 500;
        transition: color 0.2s ease;
    }

    .transaction-link:hover {
        color: #0056b3; /* Adjust hover color as needed */
    }

    .link-icon {
        font-size: 1rem;
    }

    .link-text {
        font-size: 0.875rem;
    }
    @media (max-width: 768px) {
        .link-text {
            font-size: 0.75rem;
        }
    }
</style>
