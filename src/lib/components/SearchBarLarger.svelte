<script>
    import { description } from "$lib/data_objects/testing_objects";
    import { listDocs } from "@junobuild/core";
    import AddFeaturesSection from "./AddFeaturesSection.svelte";
    import MagicalDots from "./magicalDots.svelte";
    import MagicalDotsAbsoluteSmall from "./MagicalDotsAbsolut.svelte";
    import {
        createOrRegexInput,
        createVariationsOfKeywords,
    } from "$lib/data_functions/get_functions";

    let searchText = ""; // To hold the search input text
    export let noIdeas = false;
    /**
     * @type {string[]}
     */
    export let ideas = [];
    export let parentIdeaKey = "";
    /**
     * @type {any[]}
     */
    export let ideasNames = [];

    /**
     * @type {any[]}
     */
    let results = [];
    let query = "";
    let isLoading = false;

    /**
     * @param {any} query
     */
    async function searchDatabase(query) {
        if (!query) {
            results = [];
            return;
        }
        const regex = `(?=.*${query})(?=.*${parentIdeaKey})`;
        let variatedQuery = createVariationsOfKeywords([query]);
        let regexInput = createOrRegexInput(variatedQuery);
        try {
            isLoading = true;
            let counterDoc = await listDocs({
                collection: "index_search",
                filter: {
                    matcher: {
                        description: regexInput /*+ "|" + parentIdeaKey*/,
                    },
                },
            });

            // If no documents are found
            // console.log("Doc: ", counterDoc);
            if (!counterDoc) {
                results = [];
                results = results;
            } else {
                results = counterDoc.items.filter((doc) => {
                    if (doc.description == undefined) {
                    } else if (doc.key.includes(parentIdeaKey)) {
                    } else {
                        return doc.description.includes(parentIdeaKey);
                    }
                });
                results = results;
            }
            isLoading = false;
        } catch (error) {
            console.error("Error fetching documents:", error);
            results = [];
            isLoading = false;
        }
    }

    // Call the search function when the input changes
    /**
     * @param {{ target: { value: any; }; }} event
     */
    function handleInput(event) {
        query = event.target.value;
        searchDatabase(query);
    }

    /**
     * @param {bigint} bigInt
     */
    function formatDate(bigInt) {
        return new Date(Number(bigInt / 1000000n)).toLocaleDateString();
    }

    /**
     * @param {string} feature
     */
    function AddFeature(feature) {
        let currentIndex = ideas.indexOf(feature);
        if (currentIndex != -1) {
            return;
        }
        ideas.push(feature);
        ideas = ideas;
        results = [];
        searchText = "";
    }

    /**
     * @param {string} feature
     */
    function AddFeatureName(feature) {
        let currentIndex = ideasNames.indexOf(feature);
        if (currentIndex != -1) {
            return;
        }
        ideasNames.push(feature);
        ideasNames = ideasNames;
    }

    /**
     * @param {{ key: string; }} event
     */
    function handleKeydown(event) {
        if (event.key === "Enter") {
            searchDatabase(searchText);
        }
    }
</script>

<div
    class="search-container"
    style={results.length == 0
        ? "border-radius: 8px;"
        : "border-radius: 8px 8px 0 0;"}
>
    {#if searchText.length > 0}
        <button
            class="close-button"
            on:click={async () => {
                results = [];
                searchText = "";
            }}
        >
            <span class="material-symbols-outlined">close</span>
        </button>
    {/if}
    <div class="search-content">
        <input
            class="search-box"
            id="search-box"
            type="text"
            placeholder="Search for an idea..."
            bind:value={searchText}
            on:input={(event) => {
                /*handleInput;*/
            }}
            on:keydown={handleKeydown}
            style="font-family: 'Barlow';"
        />
    </div>

    {#if !isLoading}
        <button
            class="search-button"
            on:click={async () => {
                await searchDatabase(searchText);
            }}
        >
            <span class="material-symbols-outlined">search</span>
        </button>
    {:else}
        <MagicalDotsAbsoluteSmall />
    {/if}
</div>
<div class="results" style="background-color: transparent;">
    {#each results as result, index}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
            class="result-card"
            class:last-result={index === results.length - 1}
            on:click={() => {
                AddFeature(result.key.substring(6));
                AddFeatureName(result.data.title);
            }}
        >
            <!-- <div class="date">{formatDate(result.updated_at)}</div> -->
            <div
                class="image"
                style="background-image: url({result.data.images[0] || ''})"
            ></div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <p style="font-size: medium; font-weight: bold;">
                    {result.data.title}
                </p>
                <p style="font-size: 0.8rem;">{result.data.subtitle}</p>
            </div>
        </div>
    {/each}
    {#if noIdeas}
        <p class="InputErrorMessage">
            ERROR: At least one idea is required. Select at least one idea to
            implement.
        </p>
    {/if}
</div>

<style>
    .search-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 760px;
        background: linear-gradient(to right, var(--tertiary-color));
        padding: 10px;
        padding-right: 10px;
        border: 1px solid var(--seventh-color);
        font-family: "Barlow";
        border-radius: 8px;
    }

    .search-content {
        display: flex;
        align-items: center;
        flex-grow: 1;
        width: 100%;
    }

    .search-box {
        flex-grow: 1;
        padding: 0.5rem;
        margin-right: 1rem;

        border: none;
        border-radius: 8px;
        background: transparent;
        font-size: 1rem;
        width: 100%; /* Ensures it takes available space */
    }
    .search-box:focus {
        outline: none; /* Removes the default focus outline */
    }

    .search-button {
        background: var(--primary-color);
        border: none;
        padding: 0.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--seventh-color);
        color: var(--tertiary-color);
        border-radius: 8px;
    }

    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 24;
    }

    .results {
        z-index: 2;
        border-radius: 8px;
        box-shadow: 0 5px 5px 0 rgba(0, 0, 0, 0.1);
    }

    .result-card {
        display: flex;
        align-items: center;
        padding: 10px;
        border: 1px solid var(--seventh-color);
        position: relative;
        /* background-color: var(--tertiary-color); */
        border-top: none;
        border-radius: 0;
        border-top-left-radius: 0px;
        border-top-right-radius: 0px;
        cursor: pointer;
        gap: 10px;
        transition: background-color 0.3s ease;
    }

    .result-card.last-result {
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
    }

    .result-card:hover {
        /* background-color: var(--fifth-color); */
    }

    .image {
        min-width: 80px;
        max-width: 80px;
        height: 80px;
        background-size: cover;
        background-position: center;
        border: 1px solid var(--seventh-color);
        border-radius: 8px;
    }

    .content {
        flex: 1;
    }

    .badge {
        background-color: var(--green);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-weight: bold;
    }

    .close-button {
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .close-button:hover {
        color: var(--primary-color);
    }

    @media (max-width: 480px) {
        .search-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            max-width: 100%;
            background: linear-gradient(to right, var(--tertiary-color));
            padding: 0.5rem 1rem;
            border: 1px solid var(--seventh-color);
            font-family: "Barlow";
        }
    }
</style>
