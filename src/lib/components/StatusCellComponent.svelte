<script>
    /**
     * @type {string}
     */
    export let value = "neutral"; // possible values: "neutral", "loading", "completed", "error"

    /**
     * @type {any}
     */
    export let row;
</script>

<div class="status-cell">
    {#if value === "completed"}
        <span class="status-icon completed material-symbols-outlined"
            >check_circle</span
        >
    {:else if value === "error"}
        <span class="status-icon error material-symbols-outlined">error</span>
    {:else if value === "loading"}
        <div class="loading-spinner"></div>
    {:else}
        <span class="status-icon neutral"></span>
    {/if}
</div>

<style>
    .status-cell {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        text-align: center;
    }

    .status-icon {
        font-size: 20px;
    }

    .completed {
        color: #38a169; /* Success color - typically green */
    }

    .error {
        color: #e53e3e; /* Error color - typically red */
    }

    .neutral {
        width: 20px;
        height: 20px;
    }

    .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-top-color: var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
