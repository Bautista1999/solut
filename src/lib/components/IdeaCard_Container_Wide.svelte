<script>
    import { getIdeasByKeyWords } from "$lib/data_functions/get_functions";
    import { key } from "$lib/data_objects/testing_objects";
    import IdeaCard from "./IdeaCard.svelte";
    import IdeaCardWide from "./IdeaCard_Wide.svelte";
    import LoadingNew from "./LoadingNew.svelte";
    import MagicalDotsAbsoluteSmall from "./MagicalDotsAbsoluteSmall.svelte";
    /**
     * @type {string[]}
     */
    export let keywords = [];

    let ideasPromise; // Initialize the promise

    // Reactive statement to refresh the await block
    $: ideasPromise = getIdeasByKeyWords(keywords, { start: "", limit: 12 });
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

    .feature-card {
        /* Styles for your card */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        overflow: hidden;
        /* Add any other styles you need for your card */
    }
</style>
