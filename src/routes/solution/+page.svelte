<script>
    /** @type {import('./$types').PageData} */

    import Loading from "$lib/components/loading.svelte";

    // @ts-ignore
    export let data;
</script>

<h1>Solution page. This is the solution:</h1>
<h1>{data.id}</h1>

<Loading />
