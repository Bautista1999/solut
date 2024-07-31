<script>
    import {
        getFeaturesOfIdea,
        getFeaturesOfSolution,
    } from "$lib/data_functions/get_functions";
    import CardPreview from "./CardPreview.svelte";
    import IdeaCard from "./IdeaCard.svelte";
    import LoadingNew from "./LoadingNew.svelte";
    import MagicalDotsAbsoluteSmall from "./MagicalDotsAbsolut.svelte";
    import MagicalDots from "./magicalDots.svelte";
    export let type = "idea";
    let featureExample = {
        title: "title",
        subtitle: "subtitle",
        description: "description",
        expected: 100,
        total: 100,
        image: "",
        user: "user",
        userPicture: "",
        createdAt: "17 August, 2023",
        key: "",
        /**
         * @type {string[]}
         */
        pledgersImages: [],
    };
    /**
     * @type {string}
     */
    export let idea_id = ""; // This should come from your database or store
    export let solution_id = "";
</script>

{#await type == "idea" ? getFeaturesOfIdea(idea_id) : getFeaturesOfSolution(idea_id, solution_id)}
    <div>
        <MagicalDots />
    </div>
{:then data}
    {#if data.length > 0}
        <!-- IndexDataReturn = { title: string, subtitle: string, images: string, videos: string, owner: string, type: string }; -->
        <div class="features-container">
            {#each data as feature}
                <div class="">
                    <!-- <IdeaCard {feature} /> -->
                    <CardPreview
                        idea={{
                            key: feature.key,
                            data: {
                                title: feature.data.title,
                                subtitle: feature.data.subtitle,
                                images:
                                    feature.data.images[0] == undefined
                                        ? ""
                                        : feature.data.images[0],
                                videos:
                                    feature.data.videos[0] == undefined
                                        ? ""
                                        : feature.data.videos[0],
                                owner: feature.owner,
                                type: type,
                            },
                        }}
                        padding={10}
                    />
                </div>
            {/each}
        </div>
    {:else}
        <p>No features added</p>
    {/if}
{/await}

<style>
    .features-container {
        display: grid;
        grid-template-columns: repeat(3, minmax(260px, 0.5fr));
        grid-gap: 1.2rem;
        padding: 0rem; /* Add some padding around the grid if needed */
        margin: 0; /* Center the grid container */
        max-width: 1200px; /* Max width of the grid to avoid very wide cards */
    }

    @media (max-width: 950px) {
        .features-container {
            display: grid;
            grid-template-columns: repeat(3, minmax(150px, 0.5fr));
            grid-gap: 1rem;
            padding: 0rem; /* Add some padding around the grid if needed */
            margin: 0; /* Center the grid container */
            max-width: 800px; /* Max width of the grid to avoid very wide cards */
        }
    }
    @media (max-width: 880px) {
        .features-container {
            display: grid;
            grid-template-columns: repeat(2, minmax(100px, 0.5fr));
            grid-gap: 1rem;
            padding: 0rem; /* Add some padding around the grid if needed */
            margin: 0; /* Center the grid container */
            max-width: 800px; /* Max width of the grid to avoid very wide cards */
        }
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
