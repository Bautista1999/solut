<script>
    import ActivityPost from "./ActivityPost.svelte";

    /**
     * @type {import("../../declarations/satellite/satellite.did").Activity[]}
     */
    export let posts = [];
</script>

{#if posts.length == 0}
    <p style="text-align: center; ">No activity available</p>
{:else}
    <div class="Activity">
        {#each posts as post}
            <ActivityPost activity={post} />
        {/each}
    </div>
{/if}

<style>
    .Activity {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        width: 100%;
        margin: 10px;
        margin-left: 10px;
        margin-right: 10px;

        gap: 10px;
    }

    @media (max-width: 768px) {
        .Activity {
            margin-left: 20px;
        }
    }
</style>
