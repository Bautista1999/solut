<script>
    let searchText = ""; // To hold the search input text
</script>

<div class="search-container">
    <div class="search-content">
        <input
            class="search-box"
            id="search-box"
            type="text"
            placeholder="Search for a topic or idea..."
            bind:value={searchText}
            style="font-family: 'Barlow';"
        />
    </div>
    <button class="search-button">
        <span class="material-symbols-outlined">search</span>
    </button>
</div>

<style>
    .search-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 50%;
        background: linear-gradient(
            to right,
            var(--tertiary-color),
            var(--forth-color)
        );
        padding: 0.5rem 1rem;
        border: 2px solid var(--seventh-color);
        box-shadow: 4px 4px 0px 0px var(--seventh-color);
        align-self: center;
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
</style>
