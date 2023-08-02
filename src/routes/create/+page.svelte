<script>
    import Header from "$lib/components/header.svelte";
    import { setDoc, initJuno } from "@junobuild/core";
    import { onMount } from "svelte";
    import { FileDropzone } from "@skeletonlabs/skeleton";
    import { Configuration, OpenAIApi } from "openai";
    import { ProgressRadial } from "@skeletonlabs/skeleton";
    const API_KEY = "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"; // for suggestions

    import { nanoid } from "nanoid";
    let myId = nanoid();
    console.log(myId);
    let isLoading = false;
    let created = false;

    async function getSuggestion() {}

    onMount(async () => {
        await initJuno({
            satelliteId: "xh6qb-uyaaa-aaaal-acuaq-cai",
        });
        console.log("Mounted");
    });
    let idea = {
        title: "",
        subtitle: "",
        description: "",
        image: "This is an image",
    };
    //hellokkk
    async function createIdea() {
        isLoading = true;
        console.log(idea);
        await setDoc({
            collection: "ideas",
            doc: {
                key: myId,
                data: idea,
            },
        });
        created = true;
        isLoading = false;
        idea.title = "";
        idea.subtitle = "";
        idea.description = "";
    }
</script>

<Header />
{#if !isLoading && !created}
    <div>
        <h1 class="h1">Let's create a new idea! 🚀</h1>
        <br />
        <p>Title</p>
        <input
            class="input"
            type="search"
            name="demo"
            placeholder="Title"
            bind:value={idea.title}
        />

        <p>Subtitle</p>
        <textarea
            class="textarea"
            rows="4"
            placeholder="Subtitle"
            bind:value={idea.subtitle}
        />
        <p>Description</p>
        <label class="label">
            <textarea
                class="textarea"
                rows="4"
                placeholder="Lorem ipsum dolor sit amet consectetur adipisicing elit."
                bind:value={idea.description}
            />
        </label>
        <p>Image</p>
        <FileDropzone name="files">
            <svelte:fragment slot="lead">📁</svelte:fragment>
            <svelte:fragment slot="message">Upload an image</svelte:fragment>
            <svelte:fragment slot="meta"
                >PNG, JPEG, or GIFF allowed</svelte:fragment
            >
        </FileDropzone>
        <br />
        <div class="button-container">
            <button
                type="button"
                class="btn variant-filled"
                on:click={createIdea}
            >
                <span>🚀</span>
                <span>Create!</span>
            </button>
        </div>
    </div>
{:else if created}
    <div class="card p-4 centered-flexbox">
        <img
            src="src/assets/correct.png"
            alt=""
            style="width:20%;"
            class="centered-image"
        />
        <br />
        <h1>Idea created successfully!</h1>
        <br />
        <button
            type="button"
            class="btn variant-filled"
            style="border-radius: 1000px; background-color:orangered"
        >
            <span>➡️</span>
            <span>Go see the idea 🚀</span>
        </button>
    </div>
{:else}
    <div class="card p-4 centered-flexbox" style="width: 30%; height:44%;">
        <ProgressRadial />
    </div>
{/if}

<style>
    .btn {
        background-color: orangered;
        color: white;
    }
    .button-container {
        margin-top: auto;
        width: 100%;
        display: flex;
    }
    div {
        margin: 3%;
        border-radius: 20px;
    }
    .input {
        width: 40%;
        border-radius: 20px;
        padding-left: 20px;
    }
    .textarea {
        padding-left: 20px;
        padding-top: 10px;
    }
    .card {
        position: absolute;
        left: 47%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 25px;
        width: 30%;
        height: 30%;

        /* Add these to make content centered */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .centered-image {
        margin-left: auto;
        margin-right: auto;
        width: 100%;
    }
</style>
