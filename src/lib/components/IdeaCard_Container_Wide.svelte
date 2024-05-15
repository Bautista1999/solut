<script>
    import IdeaCard from "./IdeaCard.svelte";
    import IdeaCardWide from "./IdeaCard_Wide.svelte";

    // Let's assume 'features' is the array of feature objects you receive from the database
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
        amountFollowers: 0,
    };
    /**
     * @type {featureExample[]}
     */
    export let features = []; // This should come from your database or store
</script>

<div class="features-container">
    {#each features as feature}
        <div class="">
            <IdeaCardWide featureExample={feature} padding={10} />
        </div>
    {/each}
</div>

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
