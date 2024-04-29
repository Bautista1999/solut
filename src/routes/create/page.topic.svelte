<script>
    import { setDoc, initJuno, getDoc } from "@junobuild/core";
    import { onMount } from "svelte";

    import { nanoid } from "nanoid";
    import { goto } from "$app/navigation";
    import Loading from "$lib/components/loading.svelte";
    import {
        checkValidatorTopic,
        validateTopic,
    } from "$lib/validators/create.validator";
    import { isLoading } from "$lib/stores/other_stores";
    let myId = nanoid();
    console.log(myId);

    let localIdea = {
        title: "",
        subtitle: "",
        description: "",
        imageURL: "",
        parent: myId,
        amountFollowers: 0,
        pledged: 0,
        funded: 0,
        followers: [],
        transactionHistory: [],
        comments: [],
    };

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
    /**
     * @type {any[]}
     */
    let ideas = [];
    function goSee() {
        goto("idea/" + "?id=" + myId);
    }
    onMount(async () => {
        await initJuno({
            satelliteId: "vehbc-zaaaa-aaaal-acyba-cai",
        });
    });
    let idea = {
        title: "",
        subtitle: "",
        description: "",
        image: "",
        followers: [],
        amountFollowers: 0,
        moneyPledged: 0,
        moneyFunded: 0,
        transactionHistory: [],
        comments: [],
        opSystems: [],
        categories: [],
        solutions: [],
        ideas: [],
    };
    function addOverIdea() {
        // @ts-ignore
        idea.overIdeas.push(under);
    }

    $: validator = {
        title: "ok",
        subtitle: "ok",
        description: "ok",
        relatedCategories: "ok",
        image: "ok",
    };
    async function createIdea() {
        console.log(systems);
        console.log(categories);
        // @ts-ignore
        idea.categories = categories;
        // @ts-ignore
        idea.opSystems = systems;
        // @ts-ignore
        idea.ideas = ideas;
        validator = await validateTopic(idea);
        validator = validator;

        if (!checkValidatorTopic(validator)) {
            return;
        }
        isLoading.set(true);
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
        isLoading.set(false);
        idea.title = "";
        idea.subtitle = "";
        idea.description = "";
    }

    function addIdea() {
        if (localIdea.title != "") {
            ideas.push(localIdea);
            console.log(ideas);
            ideas = ideas;
        }

        localIdea = {
            title: "",
            subtitle: "",
            description: "",
            imageURL: "",
            parent: myId,
            amountFollowers: 0,
            pledged: 0,
            funded: 0,
            followers: [],
            transactionHistory: [],
            comments: [],
        };
    }
    /**
     * @param {string} opt
     */
    function substractIdea(opt) {
        const index = ideas.indexOf(opt);

        if (index !== -1) {
            ideas.splice(index, 1);
        }
        console.log(ideas);
        ideas = ideas;
    }
</script>

{#if "" != ""}
    <Loading />
{:else if created}
    <div class="loading">
        <div class="success">
            <img
                src="/assets/correct.png"
                alt=""
                style="width:40%;"
                class="centered-image"
            />
        </div>

        <br />
        <h1>Idea created successfully!</h1>
        <br />
        <button
            type="button"
            class="btn variant-filled"
            style="border-radius: 1000px; background-color:orangered"
            on:click={goSee}
            on:keydown={goSee}
        >
            <span>➡️</span>
            <span>Go see the idea 🚀</span>
        </button>
    </div>
{:else}
    <br />
    <div>
        <div class="block" style="color: rgb(37, 88, 101);">
            <p>Title</p>
            <div class="spacer" />
            <input
                class="input"
                type="search"
                name="demo"
                placeholder="Title"
                style="height: 1cm; border-radius:0px; color: rgb(37, 88, 101); background-color:white; border-color:black;border-width:1px;"
                bind:value={idea.title}
            />
            {#if validator.title == "empty"}
                <p style="color: red; font-style:italic;">
                    A title is required
                </p>
            {/if}
            <div class="spacer" />
            <p>Subtitle</p>
            <div class="spacer" />
            <textarea
                class="textarea"
                rows="4"
                placeholder="Subtitle"
                style="color: rgb(37, 88, 101); background-color:white; border-color:black;border-width:1px;"
                bind:value={idea.subtitle}
            />
            {#if validator.subtitle == "empty"}
                <p style="color: red; font-style:italic;">
                    A subtitle is required
                </p>
            {/if}
            <p>Description</p>
            <div class="spacer" />
            <label class="label">
                <textarea
                    class="textarea"
                    rows="4"
                    style="color: rgb(37, 88, 101); background-color:white; border-color:black;border-width:1px;"
                    placeholder="Lorem ipsum dolor sit amet consectetur adipisicing elit."
                    bind:value={idea.description}
                />
            </label>
            {#if validator.description == "empty"}
                <p style="color: red; font-style:italic;">
                    A description is required
                </p>
            {/if}
            <div class="spacer" />
            <p>Have an idea for this topic? Include it here!</p>
            <div class="spacer" />

            <div class="spacer" />
            <button
                class="tabs"
                style="background-color:chartreuse; width: 5cm; height: 1cm;"
                on:click={() => {}}>Add an idea +</button
            >
            <div class="spacer" />
            <ul>
                {#each ideas as opt}
                    <li>
                        <button
                            style="background-color: 
                            grey; color: white; 
                            width: 0.5cm; height: 0.5cm; border-radius:50%;
                            text-align: center; line-height: 0.5cm; 
                             "
                            on:click={() => substractIdea(opt)}
                        >
                            -
                        </button>
                        {opt}
                    </li>
                {/each}
            </ul>

            <br />

            <p>Operating systems</p>
            <div class="spacer" />

            {#if validator.relatedCategories == "empty"}
                <p style="color: red; font-style:italic;">
                    Choose at least one category.
                </p>
            {/if}

            <br />

            <h3>Add image url</h3>
            <div class="spacer" />
            <input
                type="text"
                style="border-width:1px;border-color:black;width:100%; padding:5px;"
                bind:value={idea.image}
            />
            {#if validator.image == "empty"}
                <p style="color: red; font-style:italic;">
                    An image url is required.
                </p>
            {/if}

            <p>
                Please, check the url of the image is working correctly before
                creating the idea.
            </p>

            <br />
            <br />
            <div class="button-container">
                <button
                    type="button"
                    class="tabs"
                    style="background-color:orangered; color:white; width: 5cm; height:1.5cm"
                    on:click={() => createIdea()}
                >
                    🚀 Create Topic!
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .success {
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        margin-top: 12%;
        background-size: 100%;
    }
    .loadingProgress {
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        margin-top: 12%;
    }
    .loading {
        width: 300px;
        height: 300px;
        border-radius: 0px;
        background-color: white;
        border-color: black;
        border-width: 1px;
        text-align: center; /* This centers the content horizontally */
        align-items: center;
        margin: auto;

        margin-top: 10%;
    }
    .tabs {
        width: 150px;
        height: 50px;

        /* background: linear-gradient(to right, rgb(255, 0, 0), orangered); */
        background-color: rgb(255, 245, 191);
        border-style: groove;
        border-color: black;
        border-width: 1px;
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        font-size: large;
        font-weight: 330;
        box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.2); /* horizontal, vertical, blur, color */
        color: black;
        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
    }
    .tabs:hover {
        transform: scale(
            1.08
        ); /* scales the button to 105% of its original size on hover */
    }
    .tabs:active {
        transform: scale(
            0.95
        ); /* scales the button to 95% of its original size on click */
        box-shadow: none; /* removes the shadow */
    }

    .button-container {
        margin-top: auto;
        width: 100%;
        display: flex;
        justify-content: center; /* Horizontal alignment */
        align-items: center;
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
