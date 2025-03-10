<script>
    import IconButton from "./IconButton.svelte";

    /** @type {number|string} */
    export let value; // This will be the row ID

    /** @type {Record<string, any>} */
    export let row;

    // Create a reactive variable to trigger re-rendering
    $: isValid = row.checked && row.amount > 0 && row.status !== "loading";
    $: isLoading = row.status === "loading";

    function sendPledge() {
        if (!row.checked || row.amount <= 0 || isLoading) return;

        // Here would be the logic to send the pledge
        console.log(
            "Sending pledge for idea",
            row.id,
            "with amount",
            row.amount,
        );

        // Update the status to "loading"
        row.status = "loading";
        row = row; // Trigger reactivity

        // Simulate an API call
        setTimeout(() => {
            // 80% chance of success
            if (Math.random() > 0.2) {
                row.status = "completed";
            } else {
                row.status = "error";
            }
            row = row; // Trigger reactivity
        }, 2000);
    }
</script>

<div class="send-button-cell" class:loading={isLoading}>
    <IconButton icon="send" someFunction={sendPledge} />
</div>

<style>
    .send-button-cell {
        display: flex;
        justify-content: center;
    }

    .loading {
        opacity: 0.5;
        pointer-events: none;
    }
</style>
