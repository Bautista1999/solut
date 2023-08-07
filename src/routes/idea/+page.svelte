<script>
    import Header from "$lib/components/header.svelte";
    import Modal from "$lib/components/modal.svelte";
    import { initJuno, getDoc, setDoc } from "@junobuild/core";
    import { onMount } from "svelte";

    /** @type {import('./$types').PageData} */
    export let data;

    let showModal = false;
    let title = "";
    let subtitle = "";
    let description = "";
    let image = "";
    let isLoading = true;
    var updated = 34786473164919981;
    onMount(async () => {
        await initJuno({
            satelliteId: "xh6qb-uyaaa-aaaal-acuaq-cai",
        });
        const myDoc = await getDoc({
            collection: "ideas",
            // @ts-ignore
            key: data.id,
        });
        console.log(myDoc?.data);
        title = myDoc?.data.title;
        subtitle = myDoc?.data.subtitle;
        description = myDoc?.data.description;
        image = "/assets/appImageExample.jpeg";
        isLoading = false;
        // @ts-ignore
        updated = myDoc?.updated_at;
    });
    $: editTitle = title;
    $: editSubtitle = subtitle;
    $: editDescription = description;
    $: editedIdea = {
        title: editTitle,
        subtitle: editSubtitle,
        description: editDescription,
        image: "This is an image",
    };
    async function editInfo() {
        isLoading = true;
        await setDoc({
            collection: "ideas",
            doc: {
                // @ts-ignore
                key: data.id,
                // @ts-ignore
                updated_at: updated, // includes 'key' and 'updated_at'
                data: editedIdea,
            },
        });
        window.location.reload();
    }
</script>

<Header />
{#if !isLoading}
    <div class="body">
        <div class="content">
            <h2 class="h2 text-body">{title}</h2>
            <h3 class="h3 text-body">{subtitle}</h3>
            <p class="text-body">{description}</p>
            <div class="image" style="background-image: url({image}); " />
            <br />
            <button on:click={() => (showModal = true)}> Edit info </button>
        </div>
    </div>

    <Modal bind:showModal {editInfo}>
        <textarea
            class="textarea"
            name=""
            id=""
            bind:value={editTitle}
            style="height: 1cm;"
        />
        <br />
        <textarea
            class="textarea"
            name="demo"
            placeholder="Title"
            bind:value={editSubtitle}
        />

        <textarea class="textarea" name="demo" bind:value={editDescription} />
    </Modal>
{:else}
    <div
        class="body"
        style="display:flex; justify-content:center;height:fit-content;"
    >
        <div class="snap-start card" style="padding: 1%; width: 60%">
            <div
                class="snap-start placeholder animate-pulse"
                style="margin-left: 5%; margin-top: 5%; width: 20%; height: 2em"
            />
            <div
                class="snap-start placeholder animate-pulse"
                style="margin-left: 5%;margin-right: 5%; margin-top: 5%"
            />
            <div
                class="snap-start placeholder animate-pulse"
                style="margin-left: 5%;margin-right: 5%; margin-top: 5%"
            />
            <div
                class="snap-start placeholder animate-pulse"
                style="margin-left: 5%;margin-right: 5%; margin-top: 5%; width:30%;"
            />
            <br />
            <div
                class="  placeholder animate-pulse"
                style="margin: 5%; width: 37em; height: 15em;"
            />
        </div>
    </div>
{/if}

<style>
    .snap-start {
        border-radius: 20px;
        width: 80%;
    }
    .text-body {
        margin-bottom: 2%;
        width: 100%;
    }
    .body {
        display: flex;
        justify-content: center;
        align-items: flex-start; /* aligns items at the top */
        width: 100%;

        min-height: 100vh;
    }

    .content {
        width: 80%;
        max-width: 800px;
        text-align: left; /* aligns the text to the left */
        height: 12cm;
        margin: 20px auto 0 auto; /* top margin creates space from the top */
    }

    .image {
        width: 100%; /* Adjust as needed */
        padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center center; /* Centers the image */
    }

    @media (max-width: 768px) {
        .content {
            width: 95%;
        }

        .image {
            width: 100%;
        }
    }
</style>
