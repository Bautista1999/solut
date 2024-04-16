<script>
    import UsersOverview from "./usersOverview.svelte";

    export let pledgersAmount = 100;
    /**
     * @type {string[]}
     */
    export let images = [];
</script>

<div class="container">
    <div class="PledgersAmount" style="margin:0px;">
        <span class="material-symbols-outlined"> people </span> Pledgers: {pledgersAmount}
    </div>
    <div class="PledgersPictures"><UsersOverview {images} /></div>
</div>

<style>
    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 200,
            "GRAD" 0,
            "opsz" 48;
        color: var(--primary-color);
        margin-right: 5px;
    }
    .container {
        display: grid;
        place-items: center; /* This shorthand centers items both horizontally and vertically */
        grid-template-columns: 1fr;
        grid-template-rows: auto auto; /* Set the rows to only take as much space as needed */
        gap: 5px; /* Add some space between your items */
        grid-template-areas:
            "PledgersAmount PledgersAmount"
            "PledgersPictures PledgersPictures";
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .PledgersAmount {
        grid-area: PledgersAmount;
        display: flex; /* Set the display to flex to enable flexbox properties */
        flex-direction: row; /* Align children in a row (horizontal alignment) */
        justify-content: center; /* Horizontally center the items in the container */
        align-items: center; /* Vertically align the items in the middle */
    }

    .PledgersPictures {
        grid-area: PledgersPictures;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
