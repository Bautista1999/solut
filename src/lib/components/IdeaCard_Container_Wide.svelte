<script>
    import { getIdeasByKeyWords } from "$lib/data_functions/get_functions";
    import { key } from "$lib/data_objects/testing_objects";
    import CardScroller from "./CardScroller.svelte";
    import IdeaCard from "./IdeaCard.svelte";
    import IdeaCardWide from "./IdeaCard_Wide.svelte";
    import LoadingNew from "./LoadingNew.svelte";
    import MagicalDotsAbsoluteSmall from "./MagicalDotsAbsoluteSmall.svelte";
    /**
     * @type {string[]}
     */
    export let keywords = [];
    export let amountDisplayed = 12;

    /**
     * @type {Promise<{ key: string; data: import("../data_objects/data_types").IndexDataReturn; }[]>}
     */
    let ideasPromise; // Initialize the promise

    // Reactive statement to refresh the await block
    $: ideasPromise = getIdeasByKeyWords(keywords, { start: "", limit: 12 });
    /**
     * @type {string[]}
     */
    export let firstKeys = [""];

    /**
     * @param {any} lastKey
     */
    function forwardPage(lastKey) {
        firstKeys.push("INDEX_" + lastKey);
        firstKeys = firstKeys;
        ideasPromise = getIdeasByKeyWords(keywords, {
            start: "INDEX_" + lastKey,
            limit: amountDisplayed,
        });
    }

    function backwardsPage() {
        if (firstKeys.length <= 1) {
            return;
        }
        console.log("Index: ", firstKeys[firstKeys.length - 2]);
        ideasPromise = getIdeasByKeyWords(keywords, {
            start: firstKeys[firstKeys.length - 2],
            limit: amountDisplayed,
        });
        firstKeys.pop();
        firstKeys = firstKeys;
    }
</script>

{#await ideasPromise}
    <div
        class="VerticallyAligned HorizontallyAligned"
        style="display: flex; flex-direction:row; justify-content:center;
            align-items:center; margin:auto;"
    >
        <MagicalDotsAbsoluteSmall />
    </div>
{:then ideas}
    <div class="features-container">
        {#each ideas as idea}
            <div class="">
                <IdeaCardWide {idea} padding={10} />
            </div>
        {/each}
    </div>

    <div class="" style="margin:auto;margin-top:20px;">
        <CardScroller
            forwardFunction={() => {
                if (ideas.length == 0) {
                    return;
                }
                if (ideas.length < amountDisplayed) {
                    return;
                }
                forwardPage(ideas[ideas.length - 1].key);
            }}
            backFunction={() => {
                backwardsPage();
            }}
        />
    </div>
{/await}

<style>
    .features-container {
        display: grid;
        grid-template-columns: repeat(4, minmax(260px, 0.5fr));
        grid-gap: 1.5rem;
        padding: 0rem; /* Add some padding around the grid if needed */
        margin: 0; /* Center the grid container */
        max-width: 1200px; /* Max width of the grid to avoid very wide cards */
    }
</style>
