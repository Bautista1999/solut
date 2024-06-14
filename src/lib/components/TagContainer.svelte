<script>
    let tags = [
        { name: "Technology", active: false },
        { name: "Open-source", active: false },
        { name: "Software", active: false },
        { name: "Crypto", active: false },
        { name: "Interner Computer Protocol", active: false },
        { name: "Finance", active: false },
        { name: "DAO", active: false },
        { name: "Tokenomics", active: false },
        { name: "Blockchain", active: false },
        { name: "Bitcoin", active: false },
        { name: "Ethereum", active: false },
    ];
    export let firstKeys = [""];
    /**
     * @type {string[]}
     */
    export let keywords = [];
    /**
     * @param {number} index
     */
    function toggleTag(index) {
        tags[index].active = !tags[index].active;
        firstKeys = [""];
        if (tags[index].active == true) {
            keywords.push(tags[index].name);
            keywords = keywords;
        } else {
            keywords = keywords.filter((key) => key != tags[index].name);
            keywords = keywords;
        }
    }
</script>

<div class="tag-container">
    {#each tags as tag, index}
        <button
            class="tag"
            class:active={tag.active}
            on:click={() => toggleTag(index)}
        >
            {tag.name}
        </button>
    {/each}
</div>

<style>
    .tag-container {
        display: flex;
        height: fit-content;
        padding: 10px;

        flex-wrap: wrap;
        justify-content: center;
        max-width: 60%;
        margin: auto; /* Centers the container */
        padding: 10px;
    }
    .tag {
        background-color: rgb(50, 50, 50);
        border: none;
        color: var(--tertiary-color);
        padding: 8px 16px;
        margin: 5px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        font-family: "Barlow";
    }

    button {
        margin: 0 5px;
        padding: 8px 16px;
        min-width: fit-content;
        border: none;

        color: var(--tertiary-color);
        cursor: pointer;
        transition: background 0.3s ease;
    }
    button:hover {
        background: var(--seventh-color);
        color: var(--primary-color);
    }
    .active {
        background: var(--primary-color);
    }
</style>
