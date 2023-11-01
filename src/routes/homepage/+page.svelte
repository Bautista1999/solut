<script>
    import Header from "$lib/components/header.svelte";
    import { TabGroup, Tab, TabAnchor } from "@skeletonlabs/skeleton";
    import Layout from "../+layout.svelte";
    import { initJuno, listDocs } from "@junobuild/core";
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { Modal, modalStore } from "@skeletonlabs/skeleton";
    import { goto } from "$app/navigation";
    import { listIdeas } from "$lib/data_functions/docu.functions";
    import TopicBadge from "$lib/components/topicBadge.svelte";
    import { createJunoTopic } from "$lib/data_objects/data_objects";
    import Loading from "$lib/components/loading.svelte";
    import LoadingBadge from "$lib/components/loadingBadge.svelte";

    // @ts-ignore
    /**
     * @type {{ title: string; subtitle: string; description: string; image: string; }[] | { [x: string]: any; }[]}
     */
    let list = []; //ListResults<Doc<any>>
    let loadingBadges = [0, 1, 3];
    if (window.innerWidth < 500) {
        loadingBadges = [0];
    }

    /**
     * @type {any[]}
     */
    let owners = [];
    let percentage = 80;
    let n = 10; // suppose the length of your array is 10
    let indices = Array.from({ length: n }, (_, i) => i);
    let showModal = false;
    let topic = createJunoTopic();
    /**
     * @type {topic []}
     */
    let mostFunded = [];
    let fundedLoading = true;
    /**
     * @type {topic []}
     */
    let techIdeas = [];
    let techLoading = true;
    /**
     * @type {topic []}
     */
    let recentIdeas = [];
    let recentLoading = true;
    /**
     * @type {topic []}
     */
    let popularIdeas = [];
    let popularLoading = true;
    let imageSrc = "/assets/appImageExample.jpeg";
    let id = "33";
    /**
     * @param {any} title
     * @param {any} subtitle
     * @param {any} description
     * @param {string} image
     * @param {string} key
     */
    function showIdea(title, subtitle, description, image, key) {
        showModal = true;
        console.log(key);
        goto("idea/" + "?id=" + key);
    }
    const modal = {
        type: "alert",
        // Data
        title: "Example Alert",
        body: "This is an example modal.",
        image: "/assets/appImageExample.jpeg",
    };
    let topicsLoading = true;

    let showSearch = false;
    // function limitDescription(string: desc) {}
    onMount(async () => {
        const MyList = await listDocs({
            collection: "ideas",
        });
        //     let fundedLoading = false;
        // let techLoading = false;
        // let recentLoading = false;
        // let popularLoading = false;
        fundedLoading = true;
        // @ts-ignore
        mostFunded = await listIdeas("none", "funding", "ideas", "all", false);
        fundedLoading = false;
        techLoading = true;
        // @ts-ignore
        techIdeas = await listIdeas(
            "🦾 Technology",
            "none",
            "ideas",
            "all",
            false
        );
        techLoading = false;
        recentLoading = true;
        // @ts-ignore
        recentIdeas = await listIdeas("none", "recent", "ideas", "all", false);
        recentLoading = false;
        popularLoading = true;
        // @ts-ignore
        popularIdeas = await listIdeas(
            "none",
            "popularity",
            "ideas",
            "all",
            false
        );
        popularLoading = false;
        console.log("Ordered ideas", mostFunded);
        // @ts-ignore
        n = list.length;
        indices = Array.from({ length: n }, (_, i) => i);
        topicsLoading = false;
    });
</script>

<div class="div">
    <h1 class="h1" style="font-family: Barlow;">
        <span
            class="bg-gradient-to-br from-blue-500 to-cyan-300 bg-clip-text text-transparent box-decoration-clone"
            >Dream.</span
        >
        <span
            class="bg-gradient-to-br from-red-500 to-yellow-500 bg-clip-text text-transparent box-decoration-clone"
            >Create.</span
        >
        <span
            class="bg-gradient-to-br from-pink-500 to-violet-500 bg-clip-text text-transparent box-decoration-clone"
            >Deploy.</span
        >
    </h1>

    <br />
    <h1 class="title" style="font-family: Barlow; line-height:1.1;">
        Welcome to Solutio.
    </h1>
    <button class="webButton">
        <p>Who are we?</p>
    </button>
</div>
<div
    class="horizontalLine"
    style="border-color: aliceblue; width:80%; border-width:0.5px; margin-left:auto;margin-right:auto; opacity:0.5;"
/>
<div class="itemsDisplay">
    {#if !fundedLoading}
        <h1 class="elementTitle">Most funded topics</h1>
    {/if}
    <div class="projectsSection">
        {#if fundedLoading}
            {#each loadingBadges as lod}
                <LoadingBadge msg={"Most funded topics loading"} />
            {/each}
        {:else}
            {#each mostFunded as topic}
                <div style="width: fit-content;">
                    <TopicBadge
                        topic={topic.data}
                        creator={topic.owner}
                        key={topic.key}
                    />
                </div>
            {/each}
        {/if}
    </div>
</div>
<div class="itemsDisplay">
    {#if !popularLoading}
        <h1 class="elementTitle">Popular project solutions</h1>
    {/if}
    <div class="projectsSection">
        {#if popularLoading}
            {#each loadingBadges as lod}
                <LoadingBadge msg={"Most popular topics loading"} />
            {/each}
        {:else}
            {#each popularIdeas as topic}
                <div style="width: fit-content;">
                    <TopicBadge
                        topic={topic.data}
                        creator={topic.owner}
                        key={topic.key}
                    />
                </div>
            {/each}
        {/if}
    </div>
</div>
<div class="itemsDisplay">
    {#if !techLoading}
        <h1 class="elementTitle">Technology</h1>
    {/if}
    <div class="projectsSection">
        {#if techLoading}
            {#each loadingBadges as lod}
                <LoadingBadge msg={"Tech topics loading"} />
            {/each}
        {:else}
            {#each techIdeas as topic}
                <div style="width: fit-content;">
                    <TopicBadge
                        topic={topic.data}
                        creator={topic.owner}
                        key={topic.key}
                    />
                </div>
            {/each}
        {/if}
    </div>
</div>
<div class="itemsDisplay">
    {#if !recentLoading}
        <h1 class="elementTitle">Most recent</h1>
    {/if}
    <div class="projectsSection">
        {#if recentLoading}
            {#each loadingBadges as lod}
                <LoadingBadge msg={"Most recent topics loading"} />
            {/each}
        {:else}
            {#each recentIdeas as topic}
                <div style="width: fit-content;">
                    <TopicBadge
                        topic={topic.data}
                        creator={topic.owner}
                        key={topic.key}
                    />
                </div>
            {/each}
        {/if}
    </div>
</div>

{#if showModal}
    <Modal />
{/if}

<style>
    .itemsDisplay {
        margin-left: 10%;
        margin-top: 20px;
    }
    .elementTitle {
        font-size: 30px;
        opacity: 0.8;
        font-weight: 400;
        line-height: 1.5;
        color: white;
    }
    .projectsSection {
        height: fit-content;
        width: 150vh;
        padding-top: 20px;
        padding-bottom: 20px;
        /* border-color: black;
        border-width: 2px;
        background-color: rgba(255, 128, 0, 0.863); */
        background-size: cover; /* Optional: Scale the image to cover the entire element */
        background-position: center; /* Optional: Position the image in the center */
        background-repeat: no-repeat;
        max-width: 150vh;
        padding-left: 20px;
        gap: 40px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        overflow-x: auto;
    }

    p {
        text-align: justify;
    }

    .title {
        font-size: 600%;
        position: relative; /* needed for z-index to work */
        margin: 0;
        margin-top: 0.2em;
    }
    .webButton {
        width: fit-content;
        height: 1.5cm;
        border: 1px groove black;
        background: linear-gradient(
            to right,
            #ff6000,
            rgb(255, 132, 9),
            #ff6000
        );
        margin-top: 1cm;
        font-size: 200%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding-top: 5px;
        padding-bottom: 5px;
        padding-left: 10px;
        padding-right: 10px;
        box-shadow: 5px 5px 0px rgb(0, 0, 0, 0.5);
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease;
    }
    .webButton:hover {
        transform: scale(1.05);
    }
    .webButton:active {
        transform: scale(0.98);
        box-shadow: none;
    }
    .div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        margin-top: 1cm;
        margin-bottom: 1cm;
    }

    @media (max-width: 768px) {
        .projectsSection {
            height: fit-content;
            width: 40vh;
            padding-top: 20px;
            padding-bottom: 20px;
            /* border-color: black;
        border-width: 2px;
        background-color: rgba(255, 128, 0, 0.863); */
            background-size: cover; /* Optional: Scale the image to cover the entire element */
            background-position: center; /* Optional: Position the image in the center */
            background-repeat: no-repeat;
            max-width: 150vh;
            gap: 40px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            overflow-x: auto;
        }
        .title {
            font-size: 400%;
            position: relative; /* needed for z-index to work */
            margin: 0;
            margin-top: 0.2em;
        }
        .webButton {
            width: fit-content;
            height: 1cm;
            border: 1px groove black;
            background: linear-gradient(
                to right,
                #ff6000,
                rgb(255, 132, 9),
                #ff6000
            );
            margin-top: 1cm;
            font-size: 150%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding-top: 5px;
            padding-bottom: 5px;
            padding-left: 10px;
            padding-right: 10px;
            box-shadow: 5px 5px 0px rgb(0, 0, 0, 0.5);
            transition: transform 0.2s ease-in-out, box-shadow 0.2s ease;
        }
        .webButton:hover {
            transform: scale(1.05);
        }
        .webButton:active {
            transform: scale(0.98);
            box-shadow: none;
        }
        .div {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            margin-top: 1cm;
            margin-bottom: 1cm;
        }
        .itemsDisplay {
            margin-left: 5%;
            margin-top: 20px;
        }
    }
</style>
