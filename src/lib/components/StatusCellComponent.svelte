<script>
    /**
     * @type {string}
     */
    export let value;

    /**
     * @type {any}
     */
    export let row;

    // Status values and their corresponding classes
    // Using the same styling approach as TableForApprovals.svelte
    $: statusClass = getStatusClass(value);

    /**
     * Get the appropriate CSS class based on the status value
     * @param {string} status
     * @returns {string}
     */
    function getStatusClass(status) {
        switch (status?.toLowerCase()) {
            case "pending":
                return "pending";
            case "completed":
                return "completed";
            case "approved":
                return "completed";
            case "cancelled":
                return "cancelled";
            case "rejected":
                return "rejected";
            default:
                return "default";
        }
    }
</script>

<span class="status-tag {statusClass}">
    {value || "Unknown"}
</span>

<style>
    .status-tag {
        padding: 0.3rem 0.75rem;
        border-radius: 6px;
        font-size: 0.9rem;
        text-transform: capitalize;
        font-weight: 500;
        display: inline-block;
        text-align: center;
    }

    .status-tag.pending {
        background: rgba(255, 193, 7, 0.15);
        color: #ffc107;
    }

    .status-tag.completed {
        background: rgba(40, 167, 69, 0.15);
        color: #28a745;
    }

    .status-tag.cancelled {
        background: rgba(108, 117, 125, 0.15);
        color: #6c757d;
    }

    .status-tag.rejected {
        background: rgba(220, 53, 69, 0.15);
        color: #dc3545;
    }

    .status-tag.default {
        background: rgba(13, 110, 253, 0.15);
        color: #0d6efd;
    }
</style>
