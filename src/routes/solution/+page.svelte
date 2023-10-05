<script>
    /** @type {import('./$types').PageData} */

    import Header from "$lib/components/header.svelte";
    import Loading from "$lib/components/loading.svelte";
    import { goto } from "$app/navigation";
    import Modal from "$lib/components/modal.svelte";

    import {
        basicInfo,
        info,
        transferFrom,
        signedIn,
        decimalToBigInt,
        fromICPtoUSD,
    } from "$lib/stores/auth.state.js";
    import {
        initJuno,
        getDoc,
        setDoc,
        listDocs,
        deleteDoc,
        signIn,
    } from "@junobuild/core";
    import { onMount } from "svelte";
    import { nanoid } from "nanoid";
    import { ProgressRadial } from "@skeletonlabs/skeleton";
    import {
        registerUser,
        followIdea,
        unfollowIdea,
        checkFollowIdea,
        checkFollow,
        subList,
    } from "$lib/data_functions/user.functions";

    // @ts-ignore
    export let data;
    let lastUpdate =
        "Team FitnessGo is thrilled to share our latest update! Over the past few months, we've been hard at work crafting a fitness app that's truly exceptional. We're excited to announce that our core features are now live and ready for you to experience. Whether you're a seasoned fitness enthusiast or just starting on your wellness journey, FitnessGo has something special in store for you.What can you expect from FitnessGo? Let's dive in: Personalized Workouts: Our app now offers tailored workout plans designed to meet your fitness goals. Whether you're looking to shed a few pounds, build muscle, or increase flexibility, we've got you covered.";
    let showModal4 = false;
    let followLoading = false;
    let copied = false;
    let title = "";
    let subtitle = "";
    let description = "";
    let ideas = [];
    let displayedIdeas = [];
    let topic = "";
    let topicData = {};
    let topicImage = "";
    let userFollows = false;
    let isLoading = false;
    let amountFollowers = 0;
    let creator = "";
    let updated = "";
    let moneyPledged = 10;
    onMount(async () => {
        isLoading = true;
        await initJuno({
            satelliteId: "vehbc-zaaaa-aaaal-acyba-cai",
        });
        const myDoc = await getDoc({
            collection: "solutions",
            // @ts-ignore
            key: data.id,
        });

        await basicInfo();
        console.log(myDoc);
        title = myDoc?.data.title;
        subtitle = myDoc?.data.subtitle;
        description = myDoc?.data.description;
        ideas = myDoc?.data.ideasRelated;
        // @ts-ignore
        updated = myDoc?.updated_at;
        topicData = myDoc?.data;
        // @ts-ignore
        topic = topicData.topic;
        // @ts-ignore
        if (topicData.images.length == 0) {
            // @ts-ignore
            topicImage =
                "https://www.ericfavre.com/lifestyle/es/wp-content/uploads/sites/8/2021/09/force-1-1024x637-1.jpg";
        } else {
            // @ts-ignore
            topicImage = topicData.images[0];
        }
        // @ts-ignore
        creator = myDoc?.owner;
        // @ts-ignore
        amountFollowers = topicData.amountFollowers;
        // @ts-ignore
        moneyPledged = fromICPtoUSD(topicData.moneyPledged);
        // @ts-ignore
        userFollows = await checkFollow($info.key, data.id);

        console.log("User follows:", userFollows);
        const MyList = await listDocs({
            collection: "subideas",
        });
        let AllSubIdeas = MyList?.items;

        // for (let i = 0; i < AllSubIdeas.length; i++) {
        //     // @ts-ignore
        //     if (AllSubIdeas[i]?.data.parent == data.id) {
        //         ideas.push(AllSubIdeas[i]);
        //         ideas = ideas;
        //     }
        // }
        displayedIdeas = subList(ideas, 3);
        isLoading = false;
    });
</script>

<Header />
{#if isLoading}
    <Loading />
{:else}
    <div class="body">
        <div class="content">
            <div class="tabsDisplay">
                <button
                    class="tabClosed"
                    on:click={() => {
                        goto("idea/" + "?id=" + topic);
                    }}>Main title</button
                >
                <p
                    style="display: flex; align-items:center; justify-content:center; font-size:20px;"
                >
                    >
                </p>
                <button class="tabs">{title}</button>
            </div>

            <br />
            <div class="content-wrapper">
                <div class="text-content">
                    <h2 class="h2 text-body">{title}</h2>

                    <h3 class="h3 text-body" style="font-weight: 400;">
                        {subtitle}
                    </h3>
                </div>
                <div
                    class="followers"
                    style="margin-right:10px;margin-top:15px;"
                >
                    <h2 style="text-align: center; font-size:xx-large; ">
                        {amountFollowers}
                    </h2>
                    <p style="text-align: center;">followers</p>
                </div>
            </div>
            <br />
            <div class="image" style="background-image: url({topicImage}); " />
            <br />
            <div class="barra">
                <div class="progreso" style="width: {75}%">
                    ICP tok: USD {moneyPledged}
                </div>
                {#if window.innerWidth < 500}
                    <div class="progreso2">BTC: 0</div>
                {:else}
                    <div class="progreso2">BTC: 0 USD</div>
                {/if}
            </div>
            <br />
            <p class="text-body">
                Fully refundable if a solution never appears or doesnt reach out
                community's expectations. <button
                    style="text-decoration:underline;"
                    on:click={() => {
                        showModal4 = true;
                    }}>Find out more</button
                >
            </p>
            <br />
            <div class="fundButtonBack">
                {#if followLoading}
                    <button
                        class="fundButton"
                        style="background-color: skyblue;color:white; display: flex; 
                align-items: center; 
                justify-content: center; 
                margin-right: 3em; width:3cm;;
                "
                    >
                        <div style="transform: scale(0.3);">
                            <!-- You can adjust the scale value as needed -->
                            <ProgressRadial />
                        </div></button
                    >
                {:else if userFollows}
                    <button
                        class="fundButton"
                        style="background-color: orangered; color:white; display: block;margin-right: 3em; width:fit-content; padding-left:12px;padding-right:12px;"
                        on:click={async () => {
                            /*let result = await unfollow(
                                $info.key,
                                data.id || "",
                                "ideas"
                            );
                            if (result == "cancel") {
                                return;
                            }
                            userFollows = false;
                            amountFollowers--;*/
                        }}>Unfollow</button
                    >
                {:else}
                    <button
                        class="fundButton"
                        style="background-color: white; color:black; display: block;margin-right: 3em; width:fit-content; padding-left:12px;padding-right:12px;"
                        on:click={async () => {
                            /*let result = await follow(
                                $info.key,
                                data.id || "",
                                "ideas"
                            );
                            if (result == "cancel") {
                                return;
                            }
                            userFollows = true;
                            amountFollowers++;*/
                        }}>Follow 👍</button
                    >
                {/if}

                <button class="fundButton" on:click={() => {}}
                    >Pledge funds 🚀</button
                >
                {#if !copied}
                    <button
                        class="copy"
                        on:click={() => {
                            /*copyLink();*/
                        }}>📩</button
                    >
                {:else}
                    <button
                        class="copy"
                        style="background-color: orangered; color:white; width: 2.5cm; border-radius : 0px;"
                        >Copied!👍</button
                    >
                {/if}
            </div>
            <br />
            <div class="creatorClass">
                {#if window.innerWidth < 500}
                    <div
                        class="profilePicture"
                        style="margin-right:1em; width: 2.2cm;"
                    >
                        <img
                            src="https://beebom.com/wp-content/uploads/2022/02/Featured.jpg?w=750&quality=75"
                            alt="Profile Picture"
                        />
                    </div>
                {:else}
                    <div
                        class="profilePicture"
                        style="margin-right:1em; width: 2.3cm;"
                    >
                        <img
                            src="https://beebom.com/wp-content/uploads/2022/02/Featured.jpg?w=750&quality=75"
                            alt="Profile Picture"
                        />
                    </div>
                {/if}

                {#if window.innerWidth < 500}
                    <p class="text-body" style="width: 8cm;">
                        Creator: {creator}
                    </p>
                {:else}
                    <p class="text-body">
                        Creator: {creator}
                    </p>
                {/if}
            </div>

            <br />
            <div class="description">
                <h4
                    style="font-size: xx-large; line-height: 1.1;"
                    class="NormalColor"
                >
                    Description of the topic:
                </h4>
                <br />
                {#if description.length > 500}
                    <p
                        class="text-body NormalColor"
                        style="text-align: justify;"
                    >
                        {description.substring(0, 1000)}...
                        <button
                            style="font-style: italic; text-decoration:underline;"
                            >(see more)</button
                        >
                    </p>
                {:else}
                    <p
                        class="text-body NormalColor"
                        style="text-align: justify;"
                    >
                        {description}
                    </p>
                {/if}
            </div>

            {#if creator == $info.key}
                <br />
                <button
                    class="fundButton"
                    style="width:3cm;"
                    on:click={() => {
                        // showModal7 = true;
                    }}>Edit idea</button
                >
            {/if}
            <br />
            <h4 style="font-size: xx-large; line-height: 1.1;">
                Latest update:
            </h4>
            <div class="spacer" />
            <button class="updateBlock">
                <div class="updateHeader">
                    <div class="updateUser">
                        {#if window.innerWidth < 500}
                            <div
                                class="profilePicture"
                                style=" width: 1.7cm; height: 1.7cm;box-shadow:none;"
                            >
                                <!-- svelte-ignore a11y-img-redundant-alt -->
                                <img
                                    src="https://beebom.com/wp-content/uploads/2022/02/Featured.jpg?w=750&quality=75"
                                    alt="Profile Picture"
                                />
                            </div>
                            <p style="width: 5cm;">
                                {"2dgol-6t7gr-wbceo-axkyn-3qinp-vxv32-zrqbv-oj6tr-ztuvk-el3ln-3ae".substring(
                                    0,
                                    37
                                )}...
                            </p>
                        {:else}
                            <div
                                class="profilePicture"
                                style="width: 1.7cm; height: 1.7cm; box-shadow:none;"
                            >
                                <!-- svelte-ignore a11y-img-redundant-alt -->
                                <img
                                    src="https://beebom.com/wp-content/uploads/2022/02/Featured.jpg?w=750&quality=75"
                                    alt="Profile Picture"
                                />
                            </div>
                            <p style="width: 8cm;">
                                {"2dgol-6t7gr-wbceo-axkyn-3qinp-vxv32-zrqbv-oj6tr-ztuvk-el3ln-3ae"}
                            </p>
                            <div
                                style="height: 1cm; border-color:black; border-width:0.5px;"
                            />
                            <p>
                                <span
                                    style="font-weight: 700;display:flex;justify-content:center;text-align:center;"
                                    >STATUS:
                                </span>Development
                            </p>
                        {/if}
                    </div>

                    <p
                        style=" width:fit-content;color:darkslategray; padding:5px;
                                        border-style:solid;border-color:black;border-width:1px;
                                    "
                    >
                        17/08/23
                    </p>
                </div>
                <p class="updateText" style="margin-bottom:0px ;">
                    <span style="font-weight: 700; font-style:normal;"
                        >SUBJECT:
                    </span>New button feature
                </p>
                <p class="updateText">"{lastUpdate.substring(0, 400)}..."</p>
            </button>
            <br />
            {#if creator == $info.key}
                <button
                    class="fundButton"
                    style="width: fit-content; padding:10px; background-color:green; color:white;"
                    >Post update</button
                >
            {/if}
            <br />
            <h4 style="font-size: x-large; line-height: 1.1;">
                Previous updates:
            </h4>
            <br />
            <br />
            <br />
        </div>
    </div>

    <Modal
        bind:isOpen4={showModal4}
        close={() => {
            showModal4 = false;
        }}
    >
        <h4>Funding process</h4>
        <div class="delete">
            <p>Here is the explanation of how funding works.</p>
            <br />
            <br />
        </div>
        <div class="delete">
            <button
                class="fundButton"
                style="width: 1.9cm; height:0.8cm; color:white; background-color:grey"
                on:click={() => {
                    showModal4 = false;
                }}>Cancel</button
            >
            <div class="spacer" />
        </div>
    </Modal>
{/if}

<style>
    .spacer {
        height: 20px;
    }
    .body {
        display: flex;
        justify-content: center;
        align-items: flex-start; /* aligns items at the top */
        width: 100%;

        min-height: 100vh;
        z-index: 0;
    }
    .followers {
        margin-left: 10px; /* adjust this as needed */
        align-self: flex-start; /* This will align it to the top with the title */
        padding-top: 10px;
        padding-bottom: 10px;
        border-color: black;
        border-width: 1px;
        background: linear-gradient(
            to right,
            rgb(154, 0, 154),
            rgb(102, 13, 109)
        );
        color: #e0e0e0;
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.2);
        width: 2.3cm;
        height: 1.7cm;
    }

    .content {
        width: 80%;
        max-width: 800px;
        text-align: left; /* aligns the text to the left */
        height: 12cm;
        margin: 20px auto 0 auto; /* top margin creates space from the top */
        z-index: 0;
    }

    .text-content {
        flex: 1;
    }
    .content-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .barra {
        width: 100%;
        height: 40px;
        display: flex; /* Convertimos la barra en un contenedor flex */
        align-items: center; /* Alineación vertical en el centro */
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
            rgb(154, 0, 154),
            rgb(102, 13, 109)
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
        color: rgb(102, 13, 109);
        font-size: larger;
    }
    .copy {
        margin: 10%;
        font-size: larger;
        font-weight: 330;
        width: 50px; /* Set width of the circle */
        height: 50px; /* Set height of the circle */
        border-radius: 50%; /* Makes the button circular */
        display: flex; /* Use flexbox to center the emoji */
        align-items: center; /* Center the emoji vertically */
        justify-content: center; /* Center the emoji horizontally */
        border: 1px solid black; /* Add a black border */
        background-color: white; /* Optional: Set a background color */
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.2); /* horizontal, vertical, blur, color */
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .copy:hover {
        transform: scale(1.08);
    }
    .copy:active {
        transform: scale(
            0.95
        ); /* scales the button to 95% of its original size on click */
        box-shadow: none; /* removes the shadow */
    }

    .fundButton {
        width: 25%;
        height: 50px;
        /* background: linear-gradient(to right, rgb(255, 0, 0), orangered); */
        background-color: rgb(221, 243, 255);
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
    .fundButton:hover {
        transform: scale(
            1.08
        ); /* scales the button to 105% of its original size on hover */
    }
    .fundButton:active {
        transform: scale(
            0.95
        ); /* scales the button to 95% of its original size on click */
        box-shadow: none; /* removes the shadow */
    }
    .fundButtonBack {
        width: 100%;
        height: 40px;
        display: flex; /* Convertimos la barra en un contenedor flex */
        align-items: center; /* Alineación vertical en el centro */

        border-radius: 10px;
        overflow: visible;
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
    }
    .profilePicture {
        width: 2.3cm;
        height: 2cm;
        border-radius: 50%;
        overflow: hidden; /* Hide any overflowing image */
        border: 2px solid orangered;
        box-shadow: 0px 0px 15px rgba(247, 4, 255, 0.5);
        display: flex;
        justify-content: center; /* Center horizontally */
        align-items: center; /* Center vertically */
    }

    .profilePicture img {
        width: auto;
        height: 100%;
        display: block;
        margin: 0 auto;
        object-fit: cover;
    }
    .creatorClass {
        width: 100%;
        height: auto;
        display: flex; /* Convertimos la barra en un contenedor flex */
        align-items: center; /* Alineación vertical en el centro */

        border-radius: 10px;
        overflow: visible;
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: left; /* Horizontal alignment */
    }
    .NormalColor {
        color: rgb(37, 88, 101);
    }
    .delete {
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        gap: 20px;
    }
    .text-body {
        margin-bottom: 2%;
        width: 100%;
        z-index: 0;
    }
    .description {
        background-color: white;
        padding: 2%;
        border: 1px solid black;
    }
    .tabClosed {
        width: fit-content;
        height: fit-content;
        padding-left: 15px;
        padding-right: 15px;
        padding-top: 5px;
        padding-bottom: 5px;
        /* background: linear-gradient(to right, rgb(255, 0, 0), orangered); */
        border-style: groove;
        border-width: 0.2px;
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        font-size: large;
        font-weight: 330;
        /* box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.2); horizontal, vertical, blur, color */
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        margin-top: 10px;
    }
    .tabClosed:hover {
        transform: scale(
            1.08
        ); /* scales the button to 105% of its original size on hover */
        box-shadow: -5px 5px 5px rgba(0, 0, 0, 0.2);
        border-width: 0.5px;
        /* background-color: rgba(255, 245, 191, 0.5); */
    }
    .tabsDisplay {
        display: flex;
        gap: 15px;
    }
    .tabs {
        width: fit-content;
        height: fit-content;
        padding-left: 20px;
        padding-right: 20px;
        padding-top: 8px;
        padding-bottom: 8px;
        /* background: linear-gradient(to right, rgb(255, 0, 0), orangered); */
        background-color: rgb(255, 245, 191);
        border-style: groove;
        border-color: black;
        border-width: 1px;
        display: flex;
        justify-content: flex-start; /* Horizontal alignment */
        font-size: large;
        font-weight: 330;
        box-shadow: -7px 7px 0px rgba(0, 0, 0, 1); /* horizontal, vertical, blur, color */
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
        transform: translateX(-7px);
        transform: translatey(7px);
        box-shadow: none; /* removes the shadow */
    }
    .updateHeader {
        display: flex;
        justify-content: space-between;
        padding-right: 20px;
        gap: 20px;
        align-items: center;
        width: 100%;
    }
    .updateUser {
        display: flex;
        justify-content: center; /* Distributes space evenly between items */
        gap: 10px;
        align-items: center;
    }
    .updateBlock {
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: column;
        padding: 10px;
        align-items: start;
        border-color: black;
        background-color: white;
        border-width: 1px;
        text-align: justify;
        color: darkslategray;

        transition: transform 0.3s ease, box-shadow 0.3s ease;
        box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.2); /* horizontal, vertical, blur, color */
    }
    .updateBlock:hover {
        transform: scale(
            1.08
        ); /* scales the button to 105% of its original size on hover */
    }
    .updateBlock:active {
        transform: scale(
            0.95
        ); /* scales the button to 95% of its original size on click */
        box-shadow: none; /* removes the shadow */
    }
    .updateText {
        margin: 5px;
        margin-left: 30px;
        margin-right: 30px;
        font-style: italic;
    }
    .image {
        width: 100%; /* Adjust as needed */
        padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center center; /* Centers the image */
        z-index: 0;
    }
    @media (max-width: 768px) {
        .content {
            width: 95%;
        }

        .image {
            width: 100%;
        }
        .updateHeader {
            display: flex;
            align-items: center;
            margin-right: 10px;
            gap: 0px;
            width: 100%;
        }
    }
</style>
