<script>
    import {
        getIdeasByKeyWords,
        getMostRecentTopics,
    } from "$lib/data_functions/get_functions";
    import { key } from "$lib/data_objects/testing_objects";
    import CardPreview from "./CardPreview.svelte";
    import CardPreviewUltraSmall from "./CardPreviewUltraSmall.svelte";
    import CardScroller from "./CardScroller.svelte";
    import IdeaCard from "./IdeaCard.svelte";
    import IdeaCardWide from "./IdeaCard_Wide.svelte";
    import LoadingNew from "./LoadingNew.svelte";
    import MagicalDotsAbsoluteSmall from "./MagicalDotsAbsolut.svelte";
    /**
     * @type {string[]}
     */
    export let keywords = [];
    export let amountDisplayed = 12;
    export let genericDatabase = false;

    /**
     * @type {Promise<{ key: string; data: import("../data_objects/data_types").IndexDataReturn; }[]>}
     */
    let ideasPromise; // Initialize the promise

    $: ideasPromise = !genericDatabase
        ? getMostRecentTopics(keywords, {
              start: "",
              limit: amountDisplayed,
          })
        : getIdeasByKeyWords(keywords, {
              start: "",
              limit: amountDisplayed,
          });

    $: ideasPromise.then((ideas) => {
        if (ideas.length > 0) {
            disableRightButton = true;
            checkNextPageFirstElementExistance(ideas[ideas.length - 1].key);
        }
        if (firstKeys.length <= 1) {
            disableLeftButton = true;
        } else {
            disableLeftButton = false;
        }
    });
    /**
     * @type {string[]}
     */
    export let firstKeys = [""];
    $: disableLeftButton = true;
    $: disableRightButton = false;

    /**
     * @param {any} lastKey
     */
    function forwardPage(lastKey) {
        if (!genericDatabase) {
            firstKeys.push(lastKey);
            firstKeys = firstKeys;
            ideasPromise = getMostRecentTopics(keywords, {
                start: lastKey,
                limit: amountDisplayed,
            });
        } else {
            firstKeys.push("INDEX_" + lastKey);
            firstKeys = firstKeys;
            ideasPromise = getIdeasByKeyWords(keywords, {
                start: "INDEX_" + lastKey,
                limit: amountDisplayed,
            });
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function backwardsPage() {
        if (firstKeys.length <= 1) {
            return;
        }
        if (!genericDatabase) {
            ideasPromise = getMostRecentTopics(keywords, {
                start: firstKeys[firstKeys.length - 2],
                limit: amountDisplayed,
            });
        } else {
            ideasPromise = getIdeasByKeyWords(keywords, {
                start: firstKeys[firstKeys.length - 2],
                limit: amountDisplayed,
            });
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        firstKeys.pop();
        firstKeys = firstKeys;
        if (firstKeys.length <= 1) {
            disableLeftButton = true;
        }
    }
    /**
     * @param {any} lastKey
     */
    async function checkNextPageFirstElementExistance(lastKey) {
        let firstElementNextPage = !genericDatabase
            ? await getMostRecentTopics(keywords, {
                  start: lastKey,
                  limit: 1,
              })
            : await getIdeasByKeyWords(keywords, {
                  start: "INDEX_" + lastKey,
                  limit: 1,
              });

        if (firstElementNextPage.length == 0) {
            disableRightButton = true;
        } else {
            disableRightButton = false;
        }
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
                forwardPage(ideas[ideas.length - 1].key);
            }}
            backFunction={() => {
                backwardsPage();
            }}
            {disableLeftButton}
            {disableRightButton}
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
    @media (max-width: 480px) {
        .features-container {
            display: grid;
            grid-template-columns: repeat(2, minmax(100px, 0.5fr));
            grid-gap: 1rem;
            padding: 0rem; /* Add some padding around the grid if needed */
            margin: 0; /* Center the grid container */
            max-width: 600px; /* Max width of the grid to avoid very wide cards */
        }
    }
</style>
