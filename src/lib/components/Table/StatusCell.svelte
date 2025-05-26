<script>
    /**
     * Status cell component to display status with appropriate styling
     */
    export let value = "";
    export let row = {};

    /**
     * Get the appropriate icon and class based on status
     * @param {string} status - The status value to process
     * @returns {{icon: string, className: string}} Object with icon and className
     */
    function getStatusInfo(status) {
        switch (status.toLowerCase()) {
            case "in progress":
                return { icon: "⏱️", className: "status-in-progress" };
            case "backlog":
                return { icon: "⌛", className: "status-backlog" };
            case "todo":
                return { icon: "⭕", className: "status-todo" };
            case "completed":
                return { icon: "✅", className: "status-completed" };
            default:
                return { icon: "❓", className: "status-unknown" };
        }
    }

    $: statusInfo = getStatusInfo(value);
</script>

<div class="status-cell {statusInfo.className}">
    <span class="status-icon">{statusInfo.icon}</span>
    <span class="status-text">{value}</span>
</div>

<style>
    .status-cell {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
    }

    .status-icon {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .status-in-progress {
        color: #3182ce; /* Blue */
    }

    .status-backlog {
        color: #718096; /* Gray */
    }

    .status-todo {
        color: #a0aec0; /* Light Gray */
    }

    .status-completed {
        color: #48bb78; /* Green */
    }

    .status-unknown {
        color: #718096; /* Gray */
    }
</style>
