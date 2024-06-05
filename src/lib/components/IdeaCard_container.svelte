<script>
    import {
        getFeaturesOfIdea,
        getFeaturesOfSolution,
    } from "$lib/data_functions/get_functions";
    import IdeaCard from "./IdeaCard.svelte";
    import LoadingNew from "./LoadingNew.svelte";
    import MagicalDotsAbsoluteSmall from "./MagicalDotsAbsoluteSmall.svelte";
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
        <div class="features-container">
            {#each data as feature}
                <div class="">
                    <IdeaCard {feature} />
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

    .feature-card {
        /* Styles for your card */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        overflow: hidden;
        /* Add any other styles you need for your card */
    }
</style>
