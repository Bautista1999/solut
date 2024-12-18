<script>
    import IdeaCardContainerWide from "$lib/components/IdeaCard_Container_Wide.svelte";
    import SearchBar from "$lib/components/SearchBar.svelte";
    import TagContainer from "$lib/components/TagContainer.svelte";

    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";
    import { goto } from "$app/navigation";
    import { getIdeasByKeyWords } from "$lib/data_functions/get_functions";
    import SearchedIdeas from "$lib/components/SearchedIdeas.svelte";
    import MagicalDots from "$lib/components/magicalDots.svelte";
    import MagicalDotsAbsolut from "$lib/components/MagicalDotsAbsolut.svelte";
    import { onMount } from "svelte";
    import {
        checkCycles,
        getPaginatedIdeas,
        getPaginatedTopics,
        getPaginatedTopicsIdeas,
    } from "../declarations/satellite/satellite.api";

    $: searchText = "";
    $: totalItems = 0; // Total number of results available in the backend
    $: offset = 0;
    $: limit = 12;
    $: page = 0;
    $: totalPages = 0;
    let searchComponentOpen = false;
    $: disableLeftButton = true;
    // Sorting options for the user to choose
    let sortingOptions = [
        { label: "Most Pledged", value: "most_pledged" },
        { label: "Most Followed", value: "most_followed" },
        { label: "Most Recent", value: "most_recent" },
    ];
    $: selectedSorting = sortingOptions[0].value; // Default to "most_pledged"
    $: disableRightButton = false;
    $: searchLoading = false;
    /**
     * @type {Array<import("../declarations/satellite/satellite.did").IndexResponse>}
     */
    let data = [];
    /**
     * @type {Array<import("../declarations/satellite/satellite.did").IndexResponse>}
     */
    let cachedData = []; // we use this so we dont have to load things again once the user goes "back" from searching.
    let cachedTotalItems = 0;
    let cachedOffSet = 0;
    let cachedSorting = selectedSorting;
    let cachedTotalPages = totalPages;
    let cachedPage = page;
    async function searchName() {
        // searchLoading = true;
        // searchedIdeas = await getIdeasByKeyWords([searchText], {
        //     start: "",
        //     limit: 12,
        // });
        // firstKeys = [];
        // disableLeftButton = true;
        // searchLoading = false;
        // if (searchedIdeas.length > 0) {
        //     disableRightButton = true;
        //     checkNextPageFirstElementExistance(
        //         searchedIdeas[searchedIdeas.length - 1].key,
        //     );
        // }
    }

    async function fetchData() {
        searchLoading = true;
        if (!searchComponentOpen) {
            // Default state: Fetch only topics
            const topicsResult = await getPaginatedTopics(
                selectedSorting,
                [offset],
                [limit],
                [],
            );
            if ("Err" in topicsResult) {
                console.log("Error fetching topics:", topicsResult.Err);
                data = [];
                totalItems = 0;
                searchLoading = false;
                return;
            }
            data = topicsResult.Ok?.[0] ?? [];
            cachedData = data;
            totalItems = Number(topicsResult.Ok?.[1] ?? 0); // Total items from backend

            cachedPage = page;
            totalPages = Number(topicsResult.Ok?.[2]) - 1;
            cachedTotalPages = totalPages;
            cachedTotalItems = totalItems;
            cachedOffSet = offset;
            cachedSorting = selectedSorting;
            searchLoading = false;
        } else {
            // Search state: Fetch topics and ideas

            const [results] = await Promise.all([
                getPaginatedTopicsIdeas(
                    "most_pledged",
                    [offset],
                    [limit],
                    [searchText],
                ),
            ]);

            if ("Err" in results) {
                console.log("Error fetching search results:", {
                    results,
                });
                data = [];
                totalItems = 0;
                searchLoading = false;
                return;
            }

            data = [...(results.Ok?.[0] ?? [])];
            totalItems = Number(results.Ok?.[1] ?? 0);
            totalPages = Number(results.Ok?.[2]) - 1;
            searchLoading = false;
        }
        updatePaginationButtons();
    }

    async function forwardPage() {
        if (disableRightButton) return;

        offset += limit;
        page++;
        if (!searchComponentOpen) {
            cachedOffSet = offset;
            cachedPage = page;
        }
        searchLoading = true;
        window.scrollTo({ top: 0, behavior: "smooth" });
        searchLoading = false;
        await fetchData();
    }
    async function backwardsPage() {
        if (disableLeftButton) return;

        offset -= limit;
        page--;
        if (!searchComponentOpen) {
            cachedOffSet = offset;
            cachedPage = page;
        }
        searchLoading = true;
        window.scrollTo({ top: 0, behavior: "smooth" });
        searchLoading = false;
        await fetchData();
    }

    function updatePaginationButtons() {
        if (!searchComponentOpen) {
            disableLeftButton = cachedOffSet === 0;
            disableRightButton = cachedOffSet + limit >= cachedTotalItems;
            return;
        }
        disableLeftButton = offset === 0;
        disableRightButton = offset + limit >= totalItems;
    }
    function closeSearchPanel() {
        searchComponentOpen = false;
        // fetchData();
        updatePaginationButtons();
        data = cachedData;
        offset = cachedOffSet;
        page = cachedPage;
        totalPages = cachedTotalPages;
        selectedSorting = cachedSorting;
        totalItems = cachedTotalItems;
        searchText = "";
        // fetchData;
    }
    function openSearchPanel() {
        data = cachedData;
        offset = 0;
        totalItems = 0;
        searchComponentOpen = true;
    }

    onMount(async () => {
        window.addEventListener("popstate", () => {
            // Logic to handle page state when navigating back or forward
            location.reload(); // Basic approach to reload the current state
        });
        await fetchData();
    });

    /**
     * @param {{ target: { value: string; }; }} event
     */
    function onSortingChange(event) {
        selectedSorting = event.target.value;
        fetchData();
    }
</script>

<main>
    <section class="visibilitySlogan slogan-section">
        <h1
            class="slogan"
            style="margin: 0px;font-weight:500;font-size: xx-large;"
        >
            <span style="font-size: 150%;">
                Welcome to <span style="color: var(--primary-color);"
                    >Solutio</span
                ></span
            >. <br /> Request software
            <span style="color: var(--primary-color);">you need</span> and share
            the costs with others
        </h1>

        <div style="display: flex; justify-content:center; align-items:center;">
            <SearchBar
                someFunction={() => {
                    fetchData();
                }}
                bind:searchText
                bind:searchComponentOpen
                {openSearchPanel}
                {closeSearchPanel}
            />
            <section class="sorting-section">
                <select
                    id="sorting-dropdown"
                    bind:value={selectedSorting}
                    on:change={onSortingChange}
                >
                    {#each sortingOptions as option}
                        <option value={option.value}>{option.label}</option>
                    {/each}
                </select>
            </section>
        </div>
        <!-- <div class="tagContainer">
            <TagContainer bind:keywords bind:firstKeys />
        </div> -->
    </section>
    <section class="search-bar">
        <SearchBar
            someFunction={() => {
                fetchData();
            }}
            bind:searchText
            bind:searchComponentOpen
            {openSearchPanel}
            {closeSearchPanel}
        />
    </section>

    <section class="featured-ideas">
        <section class="sorting-section sorting-mobile">
            <label for="sorting-dropdown">Sort by:</label>
            <select
                id="sorting-dropdown"
                bind:value={selectedSorting}
                on:change={onSortingChange}
            >
                {#each sortingOptions as option}
                    <option value={option.value}>{option.label}</option>
                {/each}
            </select>
        </section>
        <!-- {#if !searchComponentOpen}
            <h2 style="margin: 0;">Most recent topics</h2>
        {/if} -->
        <div class="cards">
            {#if !searchLoading}
                <SearchedIdeas
                    ideas={data}
                    {forwardPage}
                    {backwardsPage}
                    {disableRightButton}
                    {disableLeftButton}
                    offset={page}
                    total={totalPages}
                />
            {:else}
                <MagicalDotsAbsolut />
            {/if}
        </div>
    </section>

    <section class="slogan-section">
        {#if !searchComponentOpen}
            <h2 style="margin-bottom: 0em; font-size: 2em;">
                Just had an <span style="color: var(--primary-color);">
                    idea?</span
                >
            </h2>
            <div
                style="display: flex; justify-content:center; align-items:center;"
            >
                <BasicButtonDark
                    msg={"Tell us more."}
                    icon={"emoji_objects"}
                    someFunction={() => {
                        window.location.href = "/createtopic";
                    }}
                />
            </div>
        {/if}
    </section>
</main>
<svelte:head>
    <meta name="twitter:card" content="summary" />
    <meta charset="utf-8" />
    <title>Home</title>
    <meta
        name="description"
        content="Solutio its a place where users request products and devs deliver them."
    />
    <meta name="author" content="Solutio" />
    <link rel="canonical" href="https://solutio.one" />

    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<style>
    .sorting-mobile {
        height: 0;
        width: 0;
        overflow: hidden;
    }

    .sorting-section {
        display: flex;
        align-items: center;
        justify-content: left;

        padding-left: 10px;
        margin-top: 10px;
        cursor: pointer;
    }
    #sorting-dropdown {
        padding: 10px;
        font-size: 16px;
        margin-left: 10px;
        border-radius: 8px;
        border: solid 1.5px var(--primary-color);
        color: var(--primary-color);
        font-family: "Barlow";
        cursor: pointer;
    }
    #sorting-dropdown:hover {
        background-color: var(--forth-color);
    }
    .slogan-section {
        text-align: center;
        padding: 40px 20px;
        position: relative;
        overflow: hidden;
        color: var(--tertiary-color); /* ensures text color is white */
        display: flex;
        flex-direction: column;
        gap: 30px;
    }
    .slogan-section::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;

        opacity: 1; /* Set the desired opacity here */
        z-index: -1;

        background-blend-mode: hue;
    }
    .slogan-section::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(
            circle,
            var(--secondary-color),
            var(--seventh-color)
        );
        opacity: 1; /* Set the desired opacity here */
        z-index: -1;
        background-size: cover;
    }
    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .slogan {
        animation: fadeInDown 2s ease-out forwards;
        font-size: 2.5em;
        margin-bottom: 0em;
        color: var(
            --tertiary-color
        ); /* ensure it's readable on any background */
    }

    .featured-ideas {
        display: flex;
        flex-direction: column;
        min-height: 140px;
        padding: 20px;

        gap: 10px;
        padding-bottom: 0px;
        background: var(--forth-color);
        text-align: center;
    }
    .cards {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        flex-wrap: wrap;
    }
    .search-bar {
        visibility: hidden;
        height: 0px;
    }
    @media (max-width: 480px) {
        .featured-ideas {
            padding: 5px;
            padding-bottom: 0px;
        }
        .sorting-mobile {
            display: block;
            align-items: center;
            justify-content: left;
            height: fit-content;
            width: fit-content;
        }
        .visibilitySlogan {
            visibility: hidden;
            height: 0px;
            padding: 0px;
        }
        .slogan {
            animation: fadeInDown 2s ease-out forwards;
            font-size: 2em;
            margin-bottom: 0.5em;
            color: var(
                --tertiary-color
            ); /* ensure it's readable on any background */
        }
        .search-bar {
            visibility: visible;
            height: fit-content;
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
    }
</style>
