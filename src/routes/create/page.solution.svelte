<script>
    // @ts-nocheck

    import { setDoc, initJuno, getDoc } from "@junobuild/core";
    import { onMount } from "svelte";
    import { ListBox, ListBoxItem } from "@skeletonlabs/skeleton";
    import Modal from "$lib/components/modal.svelte";
    import { nanoid } from "nanoid";
    import { goto } from "$app/navigation";
    import { searchBar } from "$lib/stores/auth.state";
    import { isLoading } from "$lib/stores/loading";

    import {
        checkValidatorSolution,
        validateSolution,
    } from "$lib/validators/create.validator";
    import { createSolution } from "$lib/data_objects/data_objects";
    let myId = nanoid();
    // +page.solution.svelte
    console.log(myId);
    let kickoffDeadline = {
        newDate: { day: null, month: null, year: null },
        title: "Project kick-off",
    };
    let launchDeadline = {
        newDate: { day: null, month: null, year: null },
        title: "Solution launch",
    };

    let newDeadline = { newDate: { day: "", month: "", year: "" }, title: "" };
    /**
     * @type {any[]}
     */
    let deadlines = [];
    let showModal = false;
    function showMod() {
        showModal = true;
    }
    // Now you can use isLoading as a writable store in your component
    isLoading.set(false); // To set its initial value
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
    /** @type {import('./$types').PageData} */
    export let data;
    let under = data?.under || "";
    function goSee() {
        goto("idea/" + "?id=" + myId);
    }
    async function getSuggestion() {}
    let key = "";
    onMount(async () => {
        await initJuno({
            satelliteId: "vehbc-zaaaa-aaaal-acyba-cai",
        });
        console.log("Mounted");
        // @ts-ignore
        key = data.under;
        solution.topic = key;

        if (key != null) {
            const myDoc = await getDoc({
                collection: "ideas",
                // @ts-ignore
                key: key,
            });
            // @ts-ignore
        }
    });
    let image = "";
    let solution = createSolution();

    function closeModal() {
        showModal = false;
    }
    function addDeadline() {
        let deadlinePush = JSON.parse(JSON.stringify(newDeadline));

        deadlines = [...deadlines, deadlinePush];
        // deadlines = deadlines;
        console.log(deadlines);
        console.log(deadlinePush);
    }
    /**
     * @param {String} opt
     */
    function substractDeadline(opt) {
        const index = deadlines.indexOf(opt);

        if (index !== -1) {
            deadlines.splice(index, 1);
        }
        console.log(deadlines);
        deadlines = deadlines;
    }
    /**
     * @type {String[]}
     */
    let ideas = [];
    let localIdea = "";
    function addIdea() {
        if (localIdea != "") {
            ideas.push(localIdea);
            console.log(ideas);
            ideas = ideas;
        }

        localIdea = "";
    }
    /**
     * @param {string} opt
     */
    function substractIdea(opt) {
        // @ts-ignore
        const index = solution.ideasRelated.indexOf(opt);

        if (index !== -1) {
            solution.ideasRelated.splice(index, 1);
        }
        console.log(solution.ideasRelated);
        solution.ideasRelated = solution.ideasRelated;
    }

    /**
     * @param {string} opt
     * @param {string[]} list
     */
    function substractReq(list, opt) {
        const index = list.indexOf(opt);

        if (index !== -1) {
            list.splice(index, 1);
        }
        console.log(list);
        return list;
    }
    $: validator = {
        topicKey: "ok",
        title: "ok",
        subtitle: "ok",
        description: "ok",
        deadlines: {
            projectKO: "ok",
            solutionLaunch: "ok",
        },
        relatedCategories: "ok",
        image: "ok",
    };
    async function createSol() {
        // @ts-ignore
        solution.categories = categories;
        // @ts-ignore
        solution.opSystems = systems;
        key = under;
        // @ts-ignore
        solution.deadlines.push(kickoffDeadline);
        solution.deadlines = solution.deadlines;
        // @ts-ignore
        solution.deadlines.push(launchDeadline);
        solution.deadlines = solution.deadlines;
        validator = await validateSolution(solution);
        validator = validator;

        if (!checkValidatorSolution(validator)) {
            return;
        }
        isLoading.set(true);
        console.log("Adding solution's key to the topic's solutions list...");
        //1) We need to add this solution's key to the topic.solutions data
        const myDoc = await getDoc({
            collection: "ideas",
            // @ts-ignore
            key: solution.topic,
        });
        console.log(myDoc);
        let thisData = myDoc?.data;
        thisData.solutions.push(myId);
        thisData.solutions = thisData.solutions;
        await setDoc({
            collection: "ideas",
            doc: {
                // @ts-ignore
                key: solution.topic,
                // @ts-ignore
                updated_at: myDoc?.updated_at, // includes 'key' and 'updated_at'
                data: thisData,
            },
        });

        //2) We need to create the solution in the database with the data provided by the user
        console.log("Done!");
        console.log("Creating solution in the database...");

        await setDoc({
            collection: "solutions",
            doc: {
                key: myId,
                data: solution,
            },
        });
        console.log("Done!");
        systems = [];
        categories = [];
        created = true;
        isLoading.set(false);
        solution.title = "";
        solution.subtitle = "";
        solution.description = "";
        solution.images = [];
    }
    /**
     * @type {string | any[]}
     */
    let ideasRelated = [];
    $: searchWord = "";
    async function searchIdea() {
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (searchWord == "") {
            ideasRelated = [];
            return;
        }

        ideasRelated = await searchBar(searchWord, "subideas");
        console.log(ideasRelated);
    }
    /**
     * @param {any} idea
     */
    function addToList(idea) {
        searchWord = "";
        // @ts-ignore
        let addedIdea = {
            key: idea?.key,
            title: idea?.data.title,
        };
        // @ts-ignore
        solution.ideasRelated.push(addedIdea);
        solution.ideasRelated = solution.ideasRelated;
        ideasRelated = [];
    }
</script>

<br />
<div>
    <div class="block" style="color: rgb(37, 88, 101);">
        <p>Topic's Key</p>
        <div class="spacer" />
        <input
            class="input"
            type="search"
            name="demo"
            placeholder={solution.topic}
            style="height: 1cm; border-radius:0px;color: rgb(37, 88, 101); background-color:white; border-color:black;border-width:1px; "
            on:change={() => {}}
            bind:value={solution.topic}
        />
        {#if validator.topicKey == "empty"}
            <p style="color: red; font-style:italic;">
                A topic key is required
            </p>
        {:else if validator.topicKey == "doesnt exist"}
            <p style="color: red; font-style:italic;">Topic doesnt exist.</p>
        {/if}
        <div class="spacer" />
        <p>Title of your solution</p>

        <div class="spacer" />
        <input
            class="input"
            type="search"
            name="demo"
            placeholder="Title"
            style="height: 1cm; border-radius:0px;color: rgb(37, 88, 101); background-color:white; border-color:black;border-width:1px; "
            bind:value={solution.title}
        />
        {#if validator.title == "empty"}
            <p style="color: red; font-style:italic;">A title is required</p>
        {/if}
        <div class="spacer" />
        <p>Subtitle</p>
        <div class="spacer" />
        <textarea
            class="textarea"
            rows="4"
            placeholder="Subtitle"
            style="color: rgb(37, 88, 101); background-color:white; border-color:black;border-width:1px; "
            bind:value={solution.subtitle}
        />
        {#if validator.subtitle == "empty"}
            <p style="color: red; font-style:italic;">A subtitle is required</p>
        {/if}
        <p>Description</p>
        <div class="spacer" />
        <label class="label">
            <textarea
                class="textarea"
                rows="4"
                placeholder="Lorem ipsum dolor sit amet consectetur adipisicing elit."
                style="color: rgb(37, 88, 101);background-color:white; border-color:black;border-width:1px; "
                bind:value={solution.description}
            />
        </label>
        {#if validator.description == "empty"}
            <p style="color: red; font-style:italic;">
                A description is required
            </p>
        {/if}

        <div class="spacer" />

        <p>Ideas related</p>
        <div class="spacer" />
        <input
            class="input"
            type="search"
            name="demo"
            placeholder="Search idea..."
            style="height: 1cm; border-radius:0px;color: rgb(37, 88, 101);
             background-color:white; border-color:black;border-width:1px;"
            bind:value={searchWord}
            on:input={() => {
                console.log("hola");
                searchIdea();
            }}
        />

        {#if ideasRelated.length > 0}
            <div class="searchedIdeas">
                <ul>
                    {#each ideasRelated as idea}
                        <li>
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <div
                                class="clickableIdea"
                                on:click={() => {
                                    addToList(idea);
                                }}
                            >
                                <div class="image">
                                    <img
                                        src={idea?.data.imageURL}
                                        alt={idea?.data.title}
                                    />
                                </div>

                                <div class="info">
                                    <h2>{idea?.data.title}</h2>
                                    <p>Creator: {idea?.owner}</p>
                                </div>
                            </div>
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
        <div class="spacer" />
        <ul>
            {#each solution.ideasRelated as opt}
                <li>
                    <button
                        style="background-color: 
                            red; color: white; 
                            width: 0.5cm; height: 0.5cm; border-radius:0%;
                            text-align: center; line-height: 0.5cm; 
                            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.4);
                            margin-right:10px;
                             "
                        on:click={() => substractIdea(opt)}
                    >
                        x
                    </button>
                    {opt.title}
                </li>
            {/each}
        </ul>
        <br />
        <p>Deadlines</p>
        <div class="spacer" />
        <ul>
            <p>
                - Project kick-off <span style="color: red;">(required)</span>
            </p>
            <li>
                <input
                    type="number"
                    name=""
                    id=""
                    placeholder="MM"
                    max="12"
                    min="1"
                    style="height: 1cm; width: 1.8cm; padding: 
                    10px; margin-left:10px;margin-top:10px; border-width:1px; border-color:black;
                    "
                    bind:value={kickoffDeadline.newDate.month}
                    on:change={() => console.log(kickoffDeadline)}
                />
                /<input
                    type="number"
                    name=""
                    id=""
                    placeholder="DD"
                    max="31"
                    min="1"
                    style="height: 1cm; width: 1.8cm; padding: 
                    10px; margin-left:10px;margin-top:10px; border-width:1px; border-color:black;
                    "
                    bind:value={kickoffDeadline.newDate.day}
                />
                /<input
                    type="number"
                    name=""
                    id=""
                    placeholder="YY"
                    min="23"
                    style="height: 1cm; width: 1.8cm; padding: 
                    10px; margin-left:10px;margin-top:10px; border-width:1px; border-color:black;
                    "
                    bind:value={kickoffDeadline.newDate.year}
                />
            </li>
            {#if validator.deadlines.projectKO == "empty"}
                <p style="color: red; font-style:italic;">
                    A project kick off date is required
                </p>
            {:else if validator.deadlines.projectKO == "not in the future"}
                <p style="color: red; font-style:italic;">
                    Date needs to be in the future.
                </p>
            {/if}
            <div class="spacer" />
            <p>
                - Solution launch <span style="color: red;">(required)</span>
            </p>
            <li>
                <input
                    type="number"
                    name=""
                    id=""
                    placeholder="MM"
                    max="12"
                    min="1"
                    style="height: 1cm; width: 1.8cm; padding: 
                    10px; margin-left:10px;margin-top:10px; border-width:1px; border-color:black;
                    "
                    bind:value={launchDeadline.newDate.month}
                />
                /<input
                    type="number"
                    name=""
                    id=""
                    placeholder="DD"
                    max="31"
                    min="1"
                    style="height: 1cm; width: 1.8cm; padding: 
                    10px; margin-left:10px;margin-top:10px; border-width:1px; border-color:black;
                    "
                    bind:value={launchDeadline.newDate.day}
                />
                /<input
                    type="number"
                    name=""
                    id=""
                    placeholder="YY"
                    min="23"
                    style="height: 1cm; width: 1.8cm; padding: 
                    10px; margin-left:10px;margin-top:10px; border-width:1px; border-color:black;
                    "
                    bind:value={launchDeadline.newDate.year}
                />
            </li>
            {#if validator.deadlines.solutionLaunch == "empty"}
                <p style="color: red; font-style:italic;">
                    A solution launch date is required
                </p>
            {:else if validator.deadlines.solutionLaunch == "not in the future"}
                <p style="color: red; font-style:italic;">
                    Date needs to be in the future.
                </p>
            {:else if validator.deadlines.solutionLaunch == "not in order"}
                <p style="color: red; font-style:italic;">
                    The solution launch should be after the project kick-off.
                </p>
            {/if}
            <div class="spacer" />
            <div class="spacer" />
            {#each deadlines as date}
                <p>
                    - {date.title}
                </p>
                <li>
                    <input
                        type="number"
                        name=""
                        id=""
                        placeholder="MM"
                        max="12"
                        min="1"
                        style="height: 1cm; width: 1.8cm; padding: 
                    10px; margin-left:10px;margin-top:10px; border-width:1px; border-color:black;
                    "
                        bind:value={date.newDate.month}
                    />
                    /<input
                        type="number"
                        name=""
                        id=""
                        placeholder="DD"
                        max="31"
                        min="1"
                        style="height: 1cm; width: 1.8cm; padding: 
                    10px; margin-left:10px;margin-top:10px; border-width:1px; border-color:black;
                    "
                        bind:value={date.newDate.day}
                    />
                    /<input
                        type="number"
                        name=""
                        id=""
                        placeholder="YY"
                        min="23"
                        style="height: 1cm; width: 1.8cm; padding: 
                    10px; margin-left:10px;margin-top:10px; border-width:1px; border-color:black;
                    "
                        bind:value={date.newDate.year}
                    />
                    <button
                        class="inline-button"
                        on:click={() => substractDeadline(date)}>x</button
                    >
                </li>
                <div class="spacer" />
            {/each}
        </ul>
        <br />
        <button
            class="tabs"
            style="background-color:chartreuse; width: 5cm; height: 1cm;"
            on:click={() => showMod()}>Add a Deadline +</button
        >
        <br />
        <p>Operating systems</p>
        <div class="spacer" />

        <ListBox multiple>
            <div class="option">
                <ListBoxItem
                    bind:group={systems}
                    name="medium"
                    value="Android"
                    style="color:azure;"
                    class="option"
                    ><span style="color:darkslategray;">🤖 Android</span
                    ></ListBoxItem
                >
            </div>
            <div class="option">
                <ListBoxItem
                    bind:group={systems}
                    name="medium"
                    value="IOS"
                    style="color:azure;"
                    class="option"
                    ><span style="color:darkslategray;">💻 IOS</span
                    ></ListBoxItem
                >
            </div>
            <div class="option">
                <ListBoxItem
                    bind:group={systems}
                    name="medium"
                    value="other"
                    style="color:azure;"
                    class="option"
                    ><span style="color:darkslategray;">Other</span
                    ></ListBoxItem
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
                        name="other"
                        value={opt}
                        class="option"
                        ><span style="color:darkslategray;">{opt}</span
                        ></ListBoxItem
                    >
                </div>
            </ListBox>
        {/each}

        <br />

        <h3>Add image url</h3>
        <div class="spacer" />
        <input
            type="text"
            style="border-width:1px;border-color:black;width:100%; padding:5px;"
            bind:value={image}
        />

        <p>
            Please, check the url of the image is working correctly before
            creating the idea.
        </p>
        {#if validator.image == "empty"}
            <p style="color: red; font-style:italic;">
                An image url is required
            </p>
        {/if}
        <div class="spacer" />
        <ul>
            {#each solution.images as opt}
                {#if window.innerWidth < 500}
                    <li>
                        <button
                            style="background-color: 
                    grey; color: white; 
                    width: 0.5cm; height: 0.5cm; border-radius:50%;
                    text-align: center; line-height: 0.5cm; 
                     "
                            on:click={() => {
                                solution.images = substractReq(
                                    solution.images,
                                    opt
                                );
                            }}
                        >
                            -
                        </button>
                        {opt.substring(0, 33)}...
                    </li>
                {:else}
                    <li>
                        <button
                            style="background-color: 
                        grey; color: white; 
                        width: 0.5cm; height: 0.5cm; border-radius:50%;
                        text-align: center; line-height: 0.5cm; 
                         "
                            on:click={() => {
                                solution.images = substractReq(
                                    solution.images,
                                    opt
                                );
                            }}
                        >
                            -
                        </button>
                        {opt}
                    </li>
                {/if}
            {/each}
        </ul>
        <div class="spacer" />
        <br />
        <button
            class="tabs"
            style="background-color:chartreuse; width: 5cm; height: 1cm;"
            on:click={() => {
                solution.images.push(image);
                solution.images = solution.images;
                image = "";
            }}>Add an image +</button
        >
        <br />
        <br />
        <div class="button-container">
            <button
                type="button"
                class="tabs"
                style="background-color:orangered; color:white; width: 5cm; height:1.5cm"
                on:click={() => createSol()}
            >
                🚀 Create Solution!
            </button>
        </div>
    </div>
</div>
{#if showModal}
    <Modal bind:isOpen2={showModal} close={closeModal}
        ><h1>New deadline</h1>
        <div class="spacer" />
        <div class="spacer" />
        <p>Deadline Title</p>
        <div class="spacer" />
        <input
            type="text"
            class="input"
            style="border-radius: 0px; padding:5px; border-color:black; border-width:1px;color:aliceblue; background-color:rgb(37, 88, 101);"
            bind:value={newDeadline.title}
        />
        <div class="spacer" />
        <div class="spacer" />
        <p>Date</p>

        <input
            type="number"
            name=""
            id=""
            placeholder="MM"
            min="1"
            max="12"
            style="height: 1cm; width: 1.8cm; padding: 
                    10px; margin-top:5px; border-width:1px; border-color:black;
                    "
            bind:value={newDeadline.newDate.month}
        />
        /
        <input
            type="number"
            name=""
            id=""
            placeholder="DD"
            min="1"
            max="31"
            style="height: 1cm; width: 1.8cm; padding: 
                    10px; margin-left:10px;margin-top:5px; border-width:1px; border-color:black;
                    "
            bind:value={newDeadline.newDate.day}
        />
        /
        <input
            type="number"
            name=""
            id=""
            placeholder="YY"
            min="23"
            style="height: 1cm; width: 1.8cm; padding: 
                    10px; margin-left:10px;margin-top:5px; border-width:1px; border-color:black;
                    "
            bind:value={newDeadline.newDate.year}
        />
        <br />
        <div style="height:0.1cm" />
        <div
            style="display: flex;
        align-items: center; 
        justify-content: center; "
        >
            <button
                class="tabs"
                style="background-color:orangered; width: 5cm; height: 1cm; color:white;"
                on:click={() => addDeadline()}>Confirm deadline</button
            >
        </div>
    </Modal>
{/if}

<style>
    .inline-button {
        width: 0.7cm;
        height: 0.7cm;
        background-color: red;
        color: white;
        border-width: 1px;
        border-color: black;
        margin-left: 10px;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        box-shadow: 6px 6px 5px rgba(0, 0, 0, 0.2);
    }
    .inline-button:hover {
        transform: scale(
            1.08
        ); /* scales the button to 105% of its original size on hover */
    }
    .inline-button:active {
        transform: scale(
            0.95
        ); /* scales the button to 95% of its original size on click */
        box-shadow: none; /* removes the shadow */
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
        transition: transform 0.3s ease, box-shadow 0.3s ease;
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
        border-radius: 0px;
        margin: 0%;
    }
    .spacer {
        margin: 0%;
        margin-bottom: 1%;
    }
    .searchedIdeas {
        border: 0.5px solid black;
        background-color: white;
        padding: 0px;
        margin: 0; /* Remove margin to fix the space at the top */
        border-radius: 0px;
    }

    .searchedIdeas ul {
        list-style-type: none;
        padding: 0px;
        margin: 0; /* Remove margin to fix the space between the list and the border */
    }

    .clickableIdea {
        display: flex;
        align-items: start;
        width: 100%;
        border: 0.5px solid black;
        border-radius: 0px;
        margin-bottom: 0px; /* Adjust this margin to control the space between ideas */
        margin-top: 0px;
        margin-left: 0px;
    }
    .clickableIdea:hover {
        background-color: antiquewhite;
    }

    .clickableIdea img {
        width: 100px; /* Increase image size */
        height: auto; /* Increase image size */
    }

    .clickableIdea h2 {
        font-size: 1rem;
        margin: 0;
    }

    .clickableIdea p {
        font-size: 0.8rem;
        margin: 0;
    }
    .image {
        margin-left: 10px;
        margin-top: 10px;
        margin-bottom: 10px;
        margin-right: 10px;
    }
    .info {
        margin-left: 0px;
        margin-top: 10px;
        margin-bottom: 10px;
    }
</style>
