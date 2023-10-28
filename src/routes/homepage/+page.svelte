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

    // @ts-ignore
    /**
     * @type {{ title: string; subtitle: string; description: string; image: string; }[] | { [x: string]: any; }[]}
     */
    let list = []; //ListResults<Doc<any>>
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
    /**
     * @type {topic []}
     */
    let techIdeas = [];
    /**
     * @type {topic []}
     */
    let recentIdeas = [];
    /**
     * @type {topic []}
     */
    let popularIdeas = [];
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

        // @ts-ignore
        mostFunded = await listIdeas("none", "funding", "ideas", "all", false);
        // @ts-ignore
        techIdeas = await listIdeas(
            "🦾 Technology",
            "none",
            "ideas",
            "all",
            false
        );
        // @ts-ignore
        recentIdeas = await listIdeas("none", "recent", "ideas", "all", false);
        // @ts-ignore
        popularIdeas = await listIdeas(
            "none",
            "popularity",
            "ideas",
            "all",
            false
        );
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
</div>
<div
    class="horizontalLine"
    style="border-color: aliceblue; width:80%; border-width:0.5px; margin-left:auto;margin-right:auto; opacity:0.5;"
/>
<div class="itemsDisplay">
    <h1 class="elementTitle">Most funded topics</h1>
    <div class="projectsSection">
        {#each mostFunded as topic}
            <div style="width: fit-content;">
                <TopicBadge
                    topic={topic.data}
                    creator={topic.owner}
                    key={topic.key}
                />
            </div>
        {/each}
    </div>
</div>
<div class="itemsDisplay">
    <h1 class="elementTitle">Popular project solutions</h1>
    <div class="projectsSection">
        {#each popularIdeas as topic}
            <div style="width: fit-content;">
                <TopicBadge
                    topic={topic.data}
                    creator={topic.owner}
                    key={topic.key}
                />
            </div>
        {/each}
    </div>
</div>
<div class="itemsDisplay">
    <h1 class="elementTitle">Technology</h1>
    <div class="projectsSection">
        {#each techIdeas as topic}
            <div style="width: fit-content;">
                <TopicBadge
                    topic={topic.data}
                    creator={topic.owner}
                    key={topic.key}
                />
            </div>
        {/each}
    </div>
</div>
<div class="itemsDisplay">
    <h1 class="elementTitle">Most recent</h1>
    <div class="projectsSection">
        {#each recentIdeas as topic}
            <div style="width: fit-content;">
                <TopicBadge
                    topic={topic.data}
                    creator={topic.owner}
                    key={topic.key}
                />
            </div>
        {/each}
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
    .verticalLine {
        height: 1cm;
        border-color: #ff6000;
        border-width: 0.5px;
    }
    .horizontalLine {
        width: 100%;
        border-color: black;
        border-width: 0.5px;
    }
    .followersInfo {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 40px;
    }
    .centeredImage {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    .creatorPicture {
        width: 0.8cm;
        height: 0.8cm;
        overflow: hidden;
        border: 1px solid black;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .creatorPicture img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .barra {
        width: 90%;
        height: 30px;
        margin-top: 0px;
        margin-bottom: 0px;
        margin-left: auto;
        margin-right: auto;
        display: flex;
        align-items: center;
        background-color: #e0e0e0;
        border-radius: 2px;
        overflow: visible;
        border-style: groove;
        border-width: 1px;
        border-color: black;
    }
    .progreso {
        height: 100%;
        background: linear-gradient(
            to right,
            orange,
            orangered
        ); /* Naranja claro a naranja fuerte */
        transition: width 0.3s;
        padding: 1%;
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        color: #e0e0e0;
        font-size: larger;
        font-weight: 450;
        border-radius: 2px;
    }
    .progreso2 {
        margin: 3%;
        flex: 1; /* Ocupará todo el espacio restante después del div progreso */
        display: flex;
        align-items: center; /* Alineación vertical en el centro */
        justify-content: flex-start; /* Alineación horizontal al inicio */
        color: orangered;
        font-size: larger;
    }
    .projectBody {
        padding-top: 15px;
        padding-left: 15px;
        padding-right: 15px;
        padding-bottom: 5px;
        line-height: 1.5;
    }
    .profilePicture {
        width: 100%;
        height: 40%;
        overflow: hidden;
        border: 1px solid black;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .profilePicture img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .infoSection {
        width: 100%;
        height: 12.7cm;
    }
    .footerSection {
        width: 100%;
        height: 1.3cm;
        padding-left: 5px;
        padding-top: 6px;
        display: flex;
        flex-direction: row;
        gap: 10px;
        color: antiquewhite;
        background: linear-gradient(
            to right,
            #ff6000,
            rgb(255, 132, 9),
            #ff6000
        );
    }
    .project {
        width: 10cm;
        height: 14cm;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        text-align: left;
        background-color: antiquewhite;
        color: darkslategray;
        border-color: black;
        border-width: 2px;
        box-shadow: 10px 10px 0px rgb(0, 0, 0, 0.5);
    }
    .image-container {
        background-size: cover; /* Scale the image to cover the entire element */
        background-position: center; /* Center the image in the container */
        background-repeat: no-repeat; /* Do not repeat the image */
    }
    .card-container {
        position: relative;
        display: inline-block; /* Keep it inline with other content */
        z-index: 0; /* Normal layering */
    }
    .card-container:before {
        content: "";
        position: absolute;
        width: 103%; /* Extend beyond the div */
        height: 95%; /* Extend beyond the div */
        background: radial-gradient(
            circle at top left,
            orangered,
            /* Top-left color */ rgba(0, 255, 255, 0.5) 50%,
            /* Top-right color */ rgba(254, 2, 254, 0.5) 50%,
            /* Bottom-left color */ rgba(0, 255, 21, 0.5) 80%
        );
        filter: blur(40px);
        top: 5%;
        left: -5%;
        z-index: 0; /* Put it behind the card */
        transition: opacity 0.3s ease-in-out;
        opacity: 0;
    }
    .card-container:hover:before {
        opacity: 1; /* Make it visible when hovered */
    }
    .card-container:hover {
        z-index: 1; /* Raise above other content when hovered */
    }

    .trending {
        margin-left: 2%;
        margin-top: 1%;
        font-size: xx-large;
        font-weight: 200;
    }
    .snap-x {
        margin-left: 2%;
    }
    p {
        text-align: justify;
    }
    .snap-start {
        border-radius: 20px;
    }

    .title {
        font-size: 600%;
        position: relative; /* needed for z-index to work */
        z-index: 3; /* set to a number higher than the div's z-index to make it appear on top */
        margin: 0;
        margin-top: 0.2em;
        margin-bottom: 1.5em;
    }
    .div {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        text-align: left;
        margin-left: 2.5em;
        margin-right: 2.5em;
        height: 10cm;
        background-image: url("/assets/homeBackground.png");

        background-size: 10cm; /* changes here */
        background-repeat: no-repeat; /* add this to prevent the image from repeating */
        background-position: right; /* aligns the background image to the right */
        position: relative; /* needed for z-index to work */
    }
    .input {
        width: 70%;
        margin: 3em;
        border-radius: 20px; /* Adjust as needed */
        padding-left: 20px; /* adjust as necessary */
    }
    .rounded-top {
        border-top-left-radius: 20px; /* Adjust as needed */
        border-top-right-radius: 20px; /* Adjust as needed */
    }
    .rounded-bottom {
        border-bottom-left-radius: 20px; /* Adjust as needed */
        border-bottom-right-radius: 20px; /* Adjust as needed */
    }
    .card-hover {
        transition: transform 0.1s ease-in-out;
        z-index: 1; /* Put it in front of the blur */
        position: relative;
    }

    .card-hover:before {
        content: "";
        position: absolute;
        width: 100%; /* Adjusted to 100% */
        height: 100%; /* Adjusted to 100% */
        background-color: rgba(255, 115, 0, 0.5); /* White light */
        filter: blur(20px); /* Blur effect */
        opacity: 0; /* Set opacity to 0 to make it invisible when not hovered */
        transition: opacity 0.2s ease-in-out; /* Transition opacity */
    }

    .card-hover:hover:before {
        opacity: 0; /* Set opacity to 1 when hovered */
        transform: scale(1); /* Scale to full size when hovered */
    }

    .card-hover:hover {
        transform: scale(1.07); /* Scale the card when hovered */
    }
</style>
