<script>
    import AnimatedBackground from "$lib/components/AnimatedBackground.svelte";
    import IdeaCard from "$lib/components/IdeaCard.svelte";
    import IdeaCardContainerWide from "$lib/components/IdeaCard_Container_Wide.svelte";
    import IdeaCardWide from "$lib/components/IdeaCard_Wide.svelte";
    import SearchBar from "$lib/components/SearchBar.svelte";
    import TagContainer from "$lib/components/TagContainer.svelte";
    import { featuresExamples } from "$lib/data_objects/testing_objects";
    import StatsItem from "$lib/components/StatsItem.svelte";
    import BasicButton from "$lib/components/basicButton.svelte";
    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";
    import { goto } from "$app/navigation";
    $: firstKeys = [""];
    let stats = [
        { label: "Ideas Created", count: 320, icon: "lightbulb" },
        { label: "Projects Completed", count: 85, icon: "check_circle" },
        { label: "Total Revenue", count: "150K", icon: "monetization_on" },
    ];
    $: searchText = "";
    /**
     * @type {Array<string>}
     */
    $: categories = [];
    /**
     * @type {Array<string>}
     */
    $: keywords = [];
    /**
     * @type {string[]}
     */
    $: searchTextArray = [];
    /**
     * @param {string} word
     */
    function addWordToKeywords(word) {
        //keywords = [...searchTextArray];
        searchTextArray = [searchText];
        firstKeys = [""];
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
                    addWordToKeywords(searchText);
                }}
                bind:searchText
            />
        </div>
        <div class="tagContainer">
            <TagContainer bind:keywords bind:firstKeys />
        </div>
    </section>
    <section class="search-bar">
        <SearchBar
            someFunction={() => {
                addWordToKeywords(searchText);
            }}
            bind:searchText
        />
    </section>

    <section class="featured-ideas">
        <h2>Most recent topics</h2>
        <div class="cards">
            <IdeaCardContainerWide
                keywords={[...keywords, ...searchTextArray]}
                bind:firstKeys
            />
        </div>
    </section>
    <!-- <div
        style="display: flex; align-items:center; justify-content:center; color: var(--tertiary-color);background-color: var(--primary-color); margin-top:15px;"
    >
        <h2>Our progress</h2>
    </div>

    <section class="stats-section">
        {#each stats as stat}
            <StatsItem label={stat.label} count={stat.count} icon={stat.icon} />
        {/each}
    </section> -->

    <section class="slogan-section" style="padding-top: 10px;">
        <h2 style="margin-bottom: 0em; font-size: 2em;">
            Just had an <span style="color: var(--primary-color);"> idea?</span>
        </h2>
        <!-- <div class="tagContainer">
            <p>Tell us more.</p>
        </div> -->
        <div style="display: flex; justify-content:center; align-items:center;">
            <BasicButtonDark
                msg={"Tell us more."}
                icon={"emoji_objects"}
                someFunction={() => {
                    goto("/create");
                }}
            />
        </div>
    </section>
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
        padding: 20px;
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
            padding-bottom: 20px;
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
