<script>
    import { description } from "$lib/data_objects/testing_objects";
    import { listDocs } from "@junobuild/core-peer";
    import AddFeaturesSection from "./AddFeaturesSection.svelte";
    import MagicalDots from "./magicalDots.svelte";
    import MagicalDotsAbsoluteSmall from "./MagicalDotsAbsoluteSmall.svelte";

    let searchText = ""; // To hold the search input text
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
        try {
            isLoading = true;
            let counterDoc = await listDocs({
                collection: "index_search",
                filter: {
                    matcher: {
                        description: query /*+ "|" + parentIdeaKey*/,
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

<div class="search-container">
    <div class="search-content">
        <input
            class="search-box"
            id="search-box"
            type="text"
            placeholder="Search for a topic or idea..."
            bind:value={searchText}
            on:input={(event) => {
                /*handleInput;*/
            }}
            on:keydown={handleKeydown}
            style="font-family: 'Barlow';"
        />
    </div>
    {#if !isLoading}
        <button class="search-button">
            <span
                class="material-symbols-outlined"
                on:click={async () => {
                    await searchDatabase(searchText);
                }}>search</span
            >
        </button>
    {:else}
        <MagicalDotsAbsoluteSmall />
    {/if}
</div>
<div class="results">
    {#each results as result}
        <div
            class="result-card"
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
            <div class="content SmallSeparator">
                <p>{result.data.title}</p>
                <p>{result.data.subtitle}</p>
            </div>
            <div class="badge">Feature</div>
        </div>
    {/each}
</div>

<style>
    .search-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 100%;
        background: linear-gradient(to right, var(--tertiary-color));
        padding: 0.5rem 1rem;
        border: 1px solid var(--seventh-color);
        font-family: "Barlow";
    }

    .search-content {
        display: flex;
        align-items: center;
        flex-grow: 1;
    }

    .search-box {
        flex-grow: 1;
        padding: 0.5rem;
        margin-right: 1rem;
        border: none;
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
    }

    .result-card {
        display: flex;
        align-items: center;
        padding: 10px;
        border: 1px solid var(--seventh-color);
        margin-bottom: 10px;
        position: relative;
        background-color: var(--tertiary-color);
        border-top: 0px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
    .result-card:hover {
        background-color: var(--fifth-color);
    }

    .image {
        width: 150px;
        height: 80px;
        background-size: cover;
        background-position: center;
        border: 1px solid var(--seventh-color);
    }

    .content {
        margin-left: 20px;
        flex: 1;
    }

    .badge {
        background-color: var(--green);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-weight: bold;
    }
</style>
