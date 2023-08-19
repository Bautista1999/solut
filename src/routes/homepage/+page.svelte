<script>
    // @ts-nocheck

    import Header from "$lib/components/header.svelte";
    import { TabGroup, Tab, TabAnchor } from "@skeletonlabs/skeleton";
    import { initJuno, listDocs } from "@junobuild/core";
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { Modal, modalStore } from "@skeletonlabs/skeleton";
    import { goto } from "$app/navigation";

    // @ts-nocheck

    // @ts-ignore
    /**
     * @type {{ title: string; subtitle: string; description: string; image: string; }[] | { [x: string]: any; }[]}
     */
    let list = []; //ListResults<Doc<any>>
    /**
     * @type {any[]}
     */
    let owners = [];
    let n = 10; // suppose the length of your array is 10
    let indices = Array.from({ length: n }, (_, i) => i);
    let showModal = false;
    let imageSrc = "/assets/appImageExample.jpeg";
    let id = "33";
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
    let titulo = "";
    let topicsLoading = true;

    let showSearch = false;
    // function limitDescription(string: desc) {}
    onMount(async () => {
        await initJuno({
            satelliteId: "xh6qb-uyaaa-aaaal-acuaq-cai",
        });
        console.log("Mounted");
        const MyList = await listDocs({
            collection: "ideas",
        });
        console.log(MyList);

        let ideas = MyList.items;
        for (let i = 0; i < ideas.length - 1; i++) {
            const idea = {
                title: "",
                subtitle: "",
                description: "",
                image: "",
                key: "",
            };
            idea.title = ideas[i].data.title;
            owners.push(ideas[i].owner);
            idea.subtitle = ideas[i].data.subtitle;
            idea.description = ideas[i].data.description;
            idea.image = ideas[i].data.image;
            idea.key = ideas[i].key;
            list.push(idea);
        }
        // @ts-ignore
        console.log(list);
        n = list.length;
        console.log(n);
        indices = Array.from({ length: n }, (_, i) => i);
        topicsLoading = false;
    });
</script>

<Header />
<div class="div">
    <h1 class="h1">
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
    <h1 class="title">Welcome to Solutio.</h1>
</div>
{#if showSearch}
    <input class="input" type="search" name="demo" placeholder="Search..." />
{/if}
<TabGroup class="text-2xl px-10 py-5" />

<div class="snap-x">
    <h2 class="h3 trending">Trending Ideas</h2>
</div>
<div
    class="snap-x scroll-px-4 snap-mandatory scroll-smooth flex gap-4 overflow-x-auto px-4 py-10"
>
    {#each indices as index (index)}
        {#if topicsLoading}
            <div class="snap-start card w-50 h-80 md:w-80">
                <div
                    class=" py-20 w-80 placeholder animate-pulse rounded-top"
                />
                <div
                    class="snap-start py-3 h-3 w-20 md:w-40 placeholder animate-pulse"
                    style="margin-left: 5%; margin-top: 5%"
                />
                <div
                    class="snap-start py-2 h-2 md:w-70 placeholder animate-pulse"
                    style="margin-left: 5%;margin-right: 5%; margin-top: 5%"
                />
                <div
                    class="snap-start py-2 h-2 md:w-70 placeholder animate-pulse"
                    style="margin-left: 5%;margin-right: 5%; margin-top: 5%"
                />
                <div
                    class="snap-start py-2 h-2 md:w-20 placeholder animate-pulse"
                    style="margin-left: 5%;margin-right: 5%; margin-top: 5%"
                />
            </div>
        {:else}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
                class="card-container"
                style="height: 11.5cm;  "
                role="button"
                tabindex="0"
                on:click={() =>
                    showIdea(
                        list[index]?.title,
                        list[index]?.subtitle,
                        list[index]?.description,
                        imageSrc,
                        list[index]?.key
                    )}
                on:keydown={() =>
                    showIdea(
                        list[index]?.title,
                        list[index]?.subtitle,
                        list[index]?.description,
                        list[index]?.key,
                        imageSrc
                    )}
            >
                <div
                    class="snap-start card-hover card md:w-80 text-start"
                    style="height: 11.5cm; position: relative; "
                >
                    <div
                        class=" py-16 w-80 text-center rounded-top image-container"
                        style=" background-image: url('/assets/appImageExample.jpeg');"
                    />

                    <p class="h3" style="margin-left: 5%;margin-top: 5%;">
                        {list[index]?.title}
                    </p>
                    <TabGroup class="text-2xl px-5 py-2" />

                    <p class="h5" style="margin-left: 5%;margin-right: 5%;">
                        {list[index]?.subtitle}
                    </p>

                    {#if list[index]?.description.length > 145}
                        <p style="margin-left: 5%; margin-right: 5%">
                            {list[index]?.description.substring(0, 145)}...<a
                                href="/homepage"
                                role="button"
                                on:click={showIdea}
                                on:keydown={showIdea}
                                on:keyup={showIdea}
                                style="text-decoration: underline; cursor: pointer; "
                                >Read more</a
                            >
                        </p>
                    {:else}
                        <p style="margin-left: 5%; margin-right: 5%; ">
                            {list[index]?.description}
                        </p>
                    {/if}
                    <div
                        class="rounded-bottom w-80"
                        style="position: absolute; bottom: 0; background-color:#EC5800;"
                    >
                        <p
                            style="margin-left: 5%; margin-right: 5%; margin-bottom:4%; margin-top: 4%;"
                        >
                            Creator: {owners[index]}
                        </p>
                    </div>
                </div>
            </div>
        {/if}
    {/each}
</div>
{#if showModal}
    <Modal />
{/if}

<style>
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
