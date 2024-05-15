<script>
    export let tags;
    export let deleteFunction = (/** @type {string} */ tag) => {};
</script>

<div class="tags">
    {#each tags as tag}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="tag">
            <p>{tag}</p>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <span
                class="material-symbols-outlined"
                style="cursor: pointer;"
                on:click={() => {
                    deleteFunction(tag);
                }}
            >
                delete
            </span>
        </div>
    {/each}
</div>

<style>
    .tags {
        display: flex;
        justify-content: start;
        align-items: center;
        gap: 5px;
        padding-block: 10px;
        flex-wrap: wrap; /* Wrap tags to the next line when full */
    }

    .tag {
        width: fit-content;
        padding-inline: 5px;
        padding-block: 2px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--primary-color);
        border: 1px solid var(--secondary-color);
        color: var(--tertiary-color);
    }
</style>
