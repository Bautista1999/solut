<script>
    /**
     * @type {string[]}
     */
    export let tabs = [];
    /**
     * @type {string}
     */
    export let activeTab; // activeTab is passed from the parent component
    /**
     * @type {(arg0: string) => any}
     */
    export let setActive; // A function passed from the parent to set the active tab
</script>

<div class="tabs">
    {#each tabs as tab}
        <div
            class="tab"
            class:active={tab === activeTab}
            on:click={() => setActive(tab)}
        >
            {tab}
        </div>
    {/each}
</div>

<style>
    .tabs {
        display: flex;
        justify-content: left;
        align-items: center;
        gap: 40px;
        cursor: pointer;
        font-weight: 100;
        font-size: larger;

        margin-bottom: 15px;
    }
    .tab:hover {
        color: var(--primary-color);
        border: 0px;
        font-family: Barlow;
    }
    .tab.active {
        /* styles for active tab */
        font-weight: 400;
    }
</style>
