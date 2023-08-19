<script>
    import Header from "$lib/components/header.svelte";
    import { setDoc, initJuno } from "@junobuild/core";
    import { onMount } from "svelte";
    import { FileDropzone } from "@skeletonlabs/skeleton";
    import { Configuration, OpenAIApi } from "openai";
    import { ProgressRadial } from "@skeletonlabs/skeleton";
    import { ListBox, ListBoxItem } from "@skeletonlabs/skeleton";
    const API_KEY = "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"; // for suggestions

    import { nanoid } from "nanoid";
    import { encodePath } from "@dfinity/agent/lib/cjs/canisterStatus";
    let myId = nanoid();
    console.log(myId);
    let isLoading = false;
    let created = false;
    /**
     * @type {String[]}
     */
    let systems = [];
    /**
     * @type {String[]}
     */
    let categories = [];
    let options = [
        "🦾 Technology",
        "💰 Business",
        "👨‍⚕️ Health care",
        "💵 E-commerce",
        "🪙 Crypto",
        "🏦 Finance",
        "🎸 Music",
        "👥 Social",
        "⚡ ICP",
        "🏋️‍♂️ Sports and Fitness",
        "Other",
    ];

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
        followers: [],
        amountFollowers: 0,
        moneyPledged: 0,
        moneyFunded: 0,
        comments: [],
        opSystems: [],
        categories: [],
    };
    //hellokkk
    async function createIdea() {
        isLoading = true;
        console.log(systems);
        console.log(categories);
        await setDoc({
            collection: "ideas",
            doc: {
                key: myId,
                data: idea,
            },
        });
        systems = [];
        categories = [];
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
        <div class="block">
            <p>Title</p>
            <div class="spacer" />
            <input
                class="input"
                type="search"
                name="demo"
                placeholder="Title"
                bind:value={idea.title}
            />
            <div class="spacer" />
            <p>Subtitle</p>
            <div class="spacer" />
            <textarea
                class="textarea"
                rows="4"
                placeholder="Subtitle"
                bind:value={idea.subtitle}
            />
            <p>Description</p>
            <div class="spacer" />
            <label class="label">
                <textarea
                    class="textarea"
                    rows="4"
                    placeholder="Lorem ipsum dolor sit amet consectetur adipisicing elit."
                    bind:value={idea.description}
                />
            </label>
            <p>Operating systems</p>
            <div class="spacer" />

            <ListBox multiple>
                <div class="option">
                    <ListBoxItem
                        bind:group={systems}
                        name="medium"
                        value="Android"
                        class="option">🤖 Android</ListBoxItem
                    >
                </div>
                <div class="option">
                    <ListBoxItem
                        bind:group={systems}
                        name="medium"
                        value="IOS"
                        class="option">💻 IOS</ListBoxItem
                    >
                </div>
                <div class="option">
                    <ListBoxItem
                        bind:group={systems}
                        name="medium"
                        value="other"
                        class="option">Other</ListBoxItem
                    >
                </div>
            </ListBox>
            <br />
            <p>Related categories</p>
            <div class="spacer" />
            {#each options as opt}
                <ListBox multiple>
                    <div class="option">
                        <ListBoxItem
                            bind:group={categories}
                            name="ohter"
                            value={opt}
                            class="option">{opt}</ListBoxItem
                        >
                    </div>
                </ListBox>
            {/each}

            <p>Image</p>
            <div class="spacer" />
            <FileDropzone name="files">
                <svelte:fragment slot="lead">📁</svelte:fragment>
                <svelte:fragment slot="message">Upload an image</svelte:fragment
                >
                <svelte:fragment slot="meta"
                    >PNG, JPEG, or GIFF allowed</svelte:fragment
                >
            </FileDropzone>

            <br />
        </div>
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
            src="/assets/correct.png"
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
        width: 100%;
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
    .block {
        margin-left: 3%;
        margin-top: 0%;
        background-color: aliceblue;
        border-color: black;
        border-width: 1px;
        border-radius: 0px;
        padding: 3%;
        box-shadow: 10px 10px 4px rgba(0, 0, 0, 0.4); /* This adds the shadow */
    }
    .option {
        border-color: darkgray;
        border-width: 1px;
        border-radius: 2px;
        margin: 0%;
    }
    .spacer {
        margin: 0%;
        margin-bottom: 1%;
    }
</style>
