<script>
    import {
        getFeaturesOfIdea,
        getFeaturesOfSolution,
    } from "$lib/data_functions/get_functions";
    import {
        getPaginatedIdeas,
        getPaginatedIdeasBySolution,
    } from "../../declarations/satellite/satellite.api";
    import CardPreview from "./CardPreview.svelte";
    import IdeaCard from "./IdeaCard.svelte";
    import LoadingNew from "./LoadingNew.svelte";
    import MagicalDotsAbsoluteSmall from "./MagicalDotsAbsolut.svelte";
    import MagicalDots from "./magicalDots.svelte";
    export let type = "idea";
    /**
     * @type {string}
     */
    export let idea_id = ""; // This should come from your database or store
    export let solution_id = "";
</script>

{#await type == "idea" ? getPaginatedIdeas("most_pledged", [0], [12], [], [idea_id]) : getPaginatedIdeasBySolution("most_pledged", [0], [12], [], solution_id)}
    <div>
        <MagicalDots />
    </div>
{:then data}
    {#if "Ok" in data}
        {#if data.Ok?.[1] > 0n}
            <!-- IndexDataReturn = { title: string, subtitle: string, images: string, videos: string, owner: string, type: string }; -->
            <div class="features-container">
                {#each data.Ok?.[0] as idea}
                    <div class="">
                        <!-- <IdeaCard {feature} /> -->

                        <CardPreview {idea} padding={10} />
                    </div>
                {/each}
            </div>
        {:else}
            <p>No features added</p>
        {/if}
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
