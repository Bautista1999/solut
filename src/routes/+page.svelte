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
    $: firstKeys = [""];
    let stats = [
        { label: "Ideas Created", count: 320, icon: "lightbulb" },
        { label: "Projects Completed", count: 85, icon: "check_circle" },
        { label: "Total Revenue", count: "150K", icon: "monetization_on" },
    ];
    $: searchText = "";

    /**
     * @type {{ key: string; data: import("../data_objects/data_types").IndexDataReturn; }[]}
     */
    let searchedIdeas = [];

    async function searchName() {
        searchLoading = true;
        searchedIdeas = await getIdeasByKeyWords([searchText], {
            start: "",
            limit: 12,
        });
        searchLoading = false;
        if (searchedIdeas.length > 0) {
            disableRightButton = true;
            checkNextPageFirstElementExistance(
                searchedIdeas[searchedIdeas.length - 1].key,
            );
        }
    }

    /**
     * @type {Array<string>}
     */
    $: keywords = [];

    let searchComponentOpen = false;
    $: disableLeftButton = true;
    $: disableRightButton = false;
    $: searchLoading = false;
    /**
     * @param {any} lastKey
     */
    async function forwardPage(lastKey) {
        firstKeys.push("INDEX_" + lastKey);
        firstKeys = firstKeys;
        searchLoading = true;
        searchedIdeas = await getIdeasByKeyWords(keywords, {
            start: "INDEX_" + lastKey,
            limit: 12,
        });
        searchLoading = false;

        window.scrollTo({ top: 0, behavior: "smooth" });
        if (searchedIdeas.length > 0) {
            disableRightButton = true;
            checkNextPageFirstElementExistance(
                searchedIdeas[searchedIdeas.length - 1].key,
            );
        }
        if (firstKeys.length <= 1) {
            disableLeftButton = true;
        } else {
            disableLeftButton = false;
        }
    }
    async function backwardsPage() {
        if (firstKeys.length <= 1) {
            return;
        }
        searchLoading = true;
        searchedIdeas = await getIdeasByKeyWords(keywords, {
            start: firstKeys[firstKeys.length - 2],
            limit: 12,
        });
        searchLoading = false;

        window.scrollTo({ top: 0, behavior: "smooth" });
        firstKeys.pop();
        firstKeys = firstKeys;
        if (firstKeys.length <= 1) {
            disableLeftButton = true;
        }
        if (searchedIdeas.length > 0) {
            disableRightButton = true;
            checkNextPageFirstElementExistance(
                searchedIdeas[searchedIdeas.length - 1].key,
            );
        }
        if (firstKeys.length <= 1) {
            disableLeftButton = true;
        } else {
            disableLeftButton = false;
        }
    }
    /**
     * @param {any} lastKey
     */
    async function checkNextPageFirstElementExistance(lastKey) {
        let firstElementNextPage = await getIdeasByKeyWords([searchText], {
            start: "INDEX_" + lastKey,
            limit: 1,
        });
        debugger;

        if (firstElementNextPage.length == 0) {
            disableRightButton = true;
        } else {
            disableRightButton = false;
        }
    }

    function closeSearchPanel() {
        searchedIdeas = [];
        searchComponentOpen = false;
        searchText = "";
    }
    function openSearchPanel() {
        searchComponentOpen = true;
    }
</script>

<main>
    <section class="visibilitySlogan slogan-section">
        <h1 class="slogan">
            A genius idea can come from <span
                style="color: var(--primary-color);">anywhere.</span
            ><br />Welcome to Solutio.
        </h1>
        <div style="display: flex; justify-content:center; align-items:center;">
            <SearchBar
                someFunction={() => {
                    searchName();
                }}
                bind:searchText
                bind:searchComponentOpen
                {openSearchPanel}
                {closeSearchPanel}
            />
        </div>
        <div class="tagContainer">
            <TagContainer bind:keywords bind:firstKeys />
        </div>
    </section>
    <section class="search-bar">
        <SearchBar
            someFunction={() => {
                searchName();
            }}
            bind:searchText
            bind:searchComponentOpen
            {openSearchPanel}
            {closeSearchPanel}
        />
    </section>
    {#if !searchComponentOpen}
        <section class="featured-ideas">
            <h2>Most recent topics</h2>
            <div class="cards">
                <IdeaCardContainerWide
                    keywords={[...keywords]}
                    bind:firstKeys
                />
            </div>
        </section>

        <section class="slogan-section">
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
                        goto("/create");
                    }}
                />
            </div>
        </section>
    {:else}
        <section class="featured-ideas">
            <br />
            <div class="cards">
                {#if !searchLoading}
                    <SearchedIdeas
                        ideas={searchedIdeas}
                        {forwardPage}
                        {backwardsPage}
                        {disableRightButton}
                        {disableLeftButton}
                    />
                {:else}
                    <MagicalDotsAbsolut />
                {/if}
            </div>
        </section>
    {/if}
</main>
<svelte:head>
    <meta name="twitter:card" content="summary" />
    <meta charset="utf-8" />
    <title>Home</title>
</svelte:head>

<style>
    .tagContainer {
        display: flex;
        justify-content: center;
        align-items: center;
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
        margin-bottom: 0.5em;
        color: var(
            --tertiary-color
        ); /* ensure it's readable on any background */
    }

    .featured-ideas {
        min-height: 140px;
        padding: 20px;
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
