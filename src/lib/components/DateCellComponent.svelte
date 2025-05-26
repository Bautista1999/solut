<script>
    /**
     * @type {string}
     */
    export let value;

    /**
     * @type {any}
     */
    export let row;

    /**
     * Format the date in a more readable format
     * From YYYY-MM-DD to a more user-friendly format
     */
    $: formattedDate = formatDate(value);

    /**
     * Format the date string into a more readable format
     * @param {string} dateStr - ISO date string or similar format
     * @returns {string}
     */
    function formatDate(dateStr) {
        if (!dateStr) return "N/A";

        try {
            const date = new Date(dateStr);
            // Check if date is valid
            if (isNaN(date.getTime())) return dateStr;

            // Format as "Month Day, Year" (e.g., "Jan 15, 2023")
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateStr;
        }
    }
</script>

<span class="date-cell">
    {formattedDate}
</span>

<style>
    .date-cell {
        font-family: "Barlow", sans-serif;
        color: var(--eigth-color);
        font-size: 0.9rem;
    }
</style>
