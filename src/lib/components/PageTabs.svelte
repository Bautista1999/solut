<script>
    /**
     * @type {string[]}
     */
    export let tabs = [];
    export let chosen = "";
</script>

<div class="tabs">
    {#each tabs as tab}
        <div class="tab">
            <h3>{tab}</h3>
        </div>
    {/each}
</div>

<style>
    .tabs {
        display: flex;
        justify-content: left;
        align-items: center;
        gap: 20px;
        cursor: pointer;
    }
    .tab:hover {
        color: var(--primary-color);
        border: 0px;
        font-family: Barlow;
    }
</style>
