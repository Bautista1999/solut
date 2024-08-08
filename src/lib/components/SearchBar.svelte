<script>
    export let searchText = ""; // To hold the search input text

    export let someFunction = () => {};
    function clear() {
        searchText = "";
    }
    export let searchComponentOpen = false;

    export let closeSearchPanel = () => {};
    export let openSearchPanel = () => {};
</script>

<div class="search-container">
    {#if searchComponentOpen}
        <span
            class="material-symbols-outlined btn_clear"
            on:click={closeSearchPanel}
            style="margin-left:10px ;">arrow_back_ios</span
        >
    {/if}
    <div class="search-content">
        <input
            class="search-box"
            id="search-box"
            type="text"
            placeholder={searchComponentOpen
                ? ""
                : "Search for a topic or idea..."}
            bind:value={searchText}
            on:focus={openSearchPanel}
            style="font-family: 'Barlow';"
            on:keydown={(event) => {
                if (event.key == "Enter") {
                    someFunction();
                    return;
                }
                if (event.key == "Backspace" && searchText.length == 1) {
                    searchText = "";
                    someFunction();
                    return;
                }
            }}
        />
    </div>
    {#if searchText != ""}
        <span class="material-symbols-outlined btn_clear" on:click={clear}
            >close</span
        >
    {/if}
    <button class="search-button" on:click={someFunction}>
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
        padding: 0.5rem 0.5rem;
        gap: 7px;
        border: 1px solid var(--seventh-color);
        border-radius: 8px;
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
        border-radius: 8px;
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
        border-radius: 8px;
    }

    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 24;
    }
    @media (max-width: 480px) {
        .search-container {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 93%;
            max-width: 93%;
            align-self: center;
            font-family: "Barlow";
        }
    }
</style>
