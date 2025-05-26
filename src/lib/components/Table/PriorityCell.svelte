<script>
    /**
     * Priority cell component to display priority with appropriate styling and icons
     */
    export let value = "";
    export let row = {};

    /**
     * Get the appropriate icon and class based on priority
     * @param {string} priority - The priority value to process
     * @returns {{icon: string, className: string}} Object with icon and className
     */
    function getPriorityInfo(priority) {
        switch (priority.toLowerCase()) {
            case "high":
                return { icon: "↑", className: "priority-high" };
            case "medium":
                return { icon: "→", className: "priority-medium" };
            case "low":
                return { icon: "↓", className: "priority-low" };
            default:
                return { icon: "•", className: "priority-unknown" };
        }
    }

    $: priorityInfo = getPriorityInfo(value);
</script>

<div class="priority-cell {priorityInfo.className}">
    <span class="priority-icon">{priorityInfo.icon}</span>
    <span class="priority-text">{value}</span>
</div>

<style>
    .priority-cell {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
    }

    .priority-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
    }

    .priority-high {
        color: #e53e3e; /* Red */
    }

    .priority-medium {
        color: #ed8936; /* Orange */
    }

    .priority-low {
        color: #718096; /* Gray */
    }

    .priority-unknown {
        color: #718096; /* Gray */
    }
</style>
