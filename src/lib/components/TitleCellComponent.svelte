<script>
    /** @type {string} */
    export let value = "";

    /** @type {Record<string, any>} */
    export let row;

    // Determine if the row is in loading state
    $: isLoading = row.status === "loading";
</script>

<div class="title-cell" class:loading={isLoading}>
    {value}
</div>

<style>
    .title-cell {
        /* Keep styling minimal */
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .loading {
        opacity: 0.5;
    }
</style>
