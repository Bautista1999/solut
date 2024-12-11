<script>
    import CardPreview from "./CardPreview.svelte";
    import CardScroller from "./CardScroller.svelte";

    export let amountDisplayed = 12;

    /**
     * @type {Array<import("../../declarations/satellite/satellite.did").IndexResponse>}[]}
     */
    export let ideas; // Initialize the promise

    export let disableLeftButton = true;
    export let disableRightButton = false;

    export let offset = 0;
    export let total = 0;

    export let forwardPage = async (/** @type {string} */ lastKey) => {};
    export let backwardsPage = async () => {};
</script>

{#if ideas.length == 0}
    <p>No results</p>
{/if}
{#if ideas.length > 0}
    <div class="features-container">
        {#each ideas as idea}
            <div class="">
                <!-- <IdeaCardWide {idea} padding={10} /> -->
                <CardPreview {idea} padding={10} />
            </div>
        {/each}
    </div>

    <div class="" style="margin-bottom:20px;margin-top:20px; ">
        <CardScroller
            forwardFunction={() => {
                if (ideas.length == 0) {
                    return;
                }
                if (ideas.length < amountDisplayed) {
                    return;
                }
                forwardPage(ideas[ideas.length - 1].element_id);
            }}
            backFunction={() => {
                backwardsPage();
            }}
            {disableLeftButton}
            {disableRightButton}
            {offset}
            {total}
        />
    </div>
{/if}

<style>
    .features-container {
        display: grid;
        grid-template-columns: repeat(4, minmax(260px, 0.5fr));
        grid-gap: 1.5rem;
        padding: 0rem; /* Add some padding around the grid if needed */
        margin: 0; /* Center the grid container */
        max-width: 1200px; /* Max width of the grid to avoid very wide cards */
    }
    @media (max-width: 1000px) {
        .features-container {
            display: grid;
            grid-template-columns: repeat(3, minmax(200px, 0.5fr));
            max-width: 800px;
        }
    }
    @media (max-width: 900px) {
        .features-container {
            display: grid;
            grid-template-columns: repeat(2, minmax(200px, 0.5fr));
            max-width: 600px; /* Max width of the grid to avoid very wide cards */
        }
    }
    @media (max-width: 480px) {
        .features-container {
            display: grid;
            grid-template-columns: repeat(2, minmax(100px, 0.5fr));
            grid-gap: 1rem;
            padding: 0rem; /* Add some padding around the grid if needed */
            margin: 0; /* Center the grid container */
            max-width: 400px; /* Max width of the grid to avoid very wide cards */
        }
    }
</style>
