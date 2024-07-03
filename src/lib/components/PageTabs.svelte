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
            style="font-weight: 50;"
            on:click={() => setActive(tab)}
        >
            <h3>{tab}</h3>
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
    @media (max-width: 480px) {
        .tabs {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: small;
            cursor: pointer;
        }
    }
</style>
