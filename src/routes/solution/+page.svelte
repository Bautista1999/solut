<script>
    /** @type {import('./$types').PageData} */

    import Header from "$lib/components/header.svelte";
    import {
        createUpdate,
        createSubidea,
    } from "/Users/juanbautistamartinezrezzio/Documents/Dev/ic_project/solutio/src/lib/data_objects/data_objects.js";

    import Loading from "$lib/components/loading.svelte";
    import { goto } from "$app/navigation";
    import Modal from "$lib/components/modal.svelte";
    import {
        NotSignedIn,
        pledgeModal,
        subideaModal,
        updateModal,
        subideaLoading,
        PostUpdateModal,
    } from "$lib/stores/loading";

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
    import ModalNotSignedIn from "$lib/components/ModalNotSignedIn.svelte";
    import {
        copyLink,
        copied,
        pledgeFunds,
        getClosestDate,
    } from "$lib/other_functions/other.functions";
    import ModalPledgeFunds from "$lib/components/ModalPledgeFunds.svelte";
    import ModalUpdate from "$lib/components/ModalUpdate.svelte";
    import ModalSubidea from "$lib/components/ModalSubidea.svelte";
    import MagicalDots from "$lib/components/magicalDots.svelte";
    import { getSolutionSubIdeas } from "$lib/data_functions/docu.functions";
    import ModalPostUpdate from "$lib/components/ModalPostUpdate.svelte";

    // @ts-ignore
    export let data;
    let tabs = 0;

    let update = {
        creator: "",
        status: "",
        subject: "",
        picture: "",
        body: "",
        nxtTitle: "",
        nxtDate: "",
        date: "",
    };
    let updates = ["", "", "", ""];
    let lastUpdate =
        "Team FitnessGo is thrilled to share our latest update! Over the past few months, we've been hard at work crafting a fitness app that's truly exceptional. We're excited to announce that our core features are now live and ready for you to experience. Whether you're a seasoned fitness enthusiast or just starting on your wellness journey, FitnessGo has something special in store for you.What can you expect from FitnessGo? Let's dive in: Personalized Workouts: Our app now offers tailored workout plans designed to meet your fitness goals. Whether you're looking to shed a few pounds, build muscle, or increase flexibility, we've got you covered.";
    let showModal4 = false;
    let followLoading = false;
    let title = "";
    let subtitle = "";
    let description = "";
    let subIdeas = [];
    let ideas = [];
    let subidea = createSubidea();
    // Import only for type checking, not for actual code execution
    /// <reference path="$lib/data_objects/data_objects.d.ts" />

    /**
     * @type {subidea[]} displayedIdeas
     */
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
    let kickoffDeadline = {
        newDate: { day: 17, month: 8, year: 23 },
        title: "Project kick-off",
    };
    let launchDeadline = {
        newDate: { day: 22, month: 3, year: 24 },
        title: "Solution launch",
    };
    let devDeadline = {
        newDate: { day: 22, month: 8, year: 23 },
        title: "Development start",
    };
    let desDeadline = {
        newDate: { day: 27, month: 8, year: 23 },
        title: "Design part",
    };
    let deadlines = [kickoffDeadline, launchDeadline, devDeadline, desDeadline];
    let displayedDeadlines = deadlines;
    let closestDeadline = "";
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
        closestDeadline = getClosestDate(deadlines);
        displayedDeadlines = subList(deadlines, 3);
        console.log("User follows: ", userFollows);

        displayedIdeas = subList(ideas, 3);
        isLoading = false;
    });
    /**
     * @param {number} num
     */
    async function changeTab(num) {
        tabs = num;
    }
    /**
     * @param {update} updt
     */
    function openUpdate(updt) {
        update = {
            creator: updt.creator,
            status: updt.status,
            subject: updt.subject,
            picture: updt.picture,
            body: updt.body,
            nxtTitle: updt.nxtTitle,
            nxtDate: updt.nxtDate,
            date: updt.date,
        };
        updateModal.set(true);
    }
</script>

<Header />
{#if isLoading}
    <Loading />
{:else}
    <div class="body">
        <div class="content">
            <div class="breadcrumbDisplay">
                <button
                    class="breadcrumbClosed"
                    on:click={() => {
                        goto("idea/" + "?id=" + topic);
                    }}>Parent idea</button
                >
                <p
                    style="display: flex; align-items:center; justify-content:center; font-size:20px;"
                >
                    >
                </p>
                <button class="breadcrumb">{title}</button>
            </div>

            <br />
            <div class="content-wrapper">
                <div class="text-content">
                    <h2 style="font-weight: 700; font-size:xx-large;">
                        {title}
                    </h2>
                    <br />
                    <h3 style="font-weight: 400; font-size:x-large;">
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
                        <div style="transform: scale(0.7); margin-bottom:20px;">
                            <MagicalDots />
                        </div></button
                    >
                {:else if userFollows}
                    <button
                        class="fundButton"
                        style="background-color: orangered; color:white; display: block;margin-right: 3em; width:fit-content; padding-left:12px;padding-right:12px;"
                        on:click={async () => {
                            followLoading = true;
                            let result = await unfollowIdea(
                                $info.key,
                                data.id || "",
                                "solutions"
                            );
                            if (result == "Not signed in") {
                                NotSignedIn.set(true);
                                followLoading = false;
                                return;
                            }
                            followLoading = false;
                            userFollows = false;
                            amountFollowers--;
                        }}>Unfollow</button
                    >
                {:else}
                    <button
                        class="fundButton"
                        style="background-color: white; color:black; display: block;margin-right: 3em; width:fit-content; padding-left:12px;padding-right:12px;"
                        on:click={async () => {
                            followLoading = true;
                            let result = await followIdea(
                                $info.key,
                                data.id || "",
                                "solutions"
                            );
                            if (result == "Not signed in") {
                                NotSignedIn.set(true);
                                followLoading = false;
                                return;
                            }
                            userFollows = true;
                            followLoading = false;
                            amountFollowers++;
                        }}>Follow 👍</button
                    >
                {/if}

                <button
                    class="fundButton"
                    on:click={() => {
                        pledgeModal.set(true);
                    }}>Pledge funds 🚀</button
                >
                {#if !$copied}
                    <button
                        class="copy"
                        on:click={() => {
                            copyLink();
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
                <h1
                    style="font-size: xx-large; line-height: 1.1;"
                    class="NormalColor"
                >
                    Description of the project:
                </h1>
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
                Roadmap and deadlines:
            </h4>
            <br />
            <br />
            <div class="deadlinesBlock">
                {#each displayedDeadlines as date}
                    {#if date.title == closestDeadline}
                        {#if date.title != "Project kick-off"}
                            <div
                                class="horizontalLine"
                                style="width:25%;z-index:1000;border-color:rgb(224, 0, 224);"
                            />
                        {/if}
                        <div
                            class="deadline"
                            style="box-shadow: 0px 0px 30px skyblue; width:20%;height:6cm;"
                        >
                            <img
                                style="width: 100px;"
                                src="https://www.freepnglogos.com/uploads/rocket-png/animated-rocket-ship-taking-off-10.png"
                                alt=""
                            />
                            <div style="height: 0.5cm;" />
                            <p>{date.title.substring(0, 20)}</p>
                            <div
                                style="border-color: white; border-width:1px;color:white;"
                            >
                                <p>
                                    {date.newDate.day}/{date.newDate
                                        .month}/{date.newDate.year}
                                </p>
                            </div>
                        </div>
                    {:else}
                        {#if date.title != "Project kick-off"}
                            <div
                                class="horizontalLine"
                                style="width:25%;z-index:1000;border-color:rgb(224, 0, 224);"
                            />
                        {/if}
                        <div class="deadline">
                            <img
                                style="width: 80px;"
                                src="https://www.freepnglogos.com/uploads/rocket-png/animated-rocket-ship-taking-off-10.png"
                                alt=""
                            />
                            <p>{date.title.substring(0, 20)}</p>
                            <div
                                style="border-color: white; border-width:1px;color:white;"
                            >
                                <p>
                                    {date.newDate.day}/{date.newDate
                                        .month}/{date.newDate.year}
                                </p>
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>

            <br />
            <h4 style="font-size: xx-large; line-height: 1.1;">
                Latest update:
            </h4>
            <div class="spacer" />
            <button
                class="updateBlock"
                on:click={() => {
                    let update = {
                        creator: creator,
                        status: "Development",
                        subject: "New button feature",
                        picture:
                            "https://i.pinimg.com/736x/76/70/6e/76706e0a8c275e562d6d48fd5fbc7f4f.jpg",
                        body: lastUpdate,
                        nxtTitle: "Design start",
                        nxtDate: "12/10/23",
                        date: "17/08/23",
                    };
                    openUpdate(update);
                }}
            >
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
                <div class="horizontalLine" />
                <div class="updateDecoration" />
            </button>
            <br />
            {#if creator == $info.key}
                <button
                    class="fundButton"
                    on:click={() => PostUpdateModal.set(true)}
                    style="width: fit-content; padding:10px; background-color:green; color:white;"
                    >Post update</button
                >
            {/if}
            <br />
            {#if tabs == 0}
                <div class="fundButtonBack">
                    <button class="tabs">Updates</button>
                    <button
                        class="tabClosed"
                        on:click={async () => {
                            changeTab(1);
                            subideaLoading.set(true);
                            displayedIdeas = await getSolutionSubIdeas(
                                data.id || ""
                            );
                            subideaLoading.set(false);
                        }}>Related ideas</button
                    >
                    <button class="tabClosed" on:click={() => changeTab(2)}
                        >Comments</button
                    >
                </div>
                <br />
                <br />

                <h4 style="font-size: x-large; line-height: 1.1;">
                    Previous updates:
                </h4>
                <br />
                <div class="totalUpdates">
                    {#each updates as up}
                        <button
                            class="localUpdate"
                            on:click={() => {
                                let update = {
                                    creator: creator,
                                    status: "Development",
                                    subject: "Another button feature",
                                    picture:
                                        "https://i.pinimg.com/736x/76/70/6e/76706e0a8c275e562d6d48fd5fbc7f4f.jpg",
                                    body: lastUpdate,
                                    nxtTitle: "Design start",
                                    nxtDate: "12/10/23",
                                    date: "17/08/23",
                                };
                                openUpdate(update);
                            }}
                        >
                            <div class="updatesStart">
                                <div class="fit-content">
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
                                    {/if}
                                </div>
                                <div class="updatesColumn">
                                    <p>
                                        <span
                                            style="font-weight: 700; font-style:normal;"
                                            >SUBJECT:
                                        </span><span style=" font-style:italic;"
                                            >New button feature
                                        </span>
                                    </p>

                                    {#if window.innerWidth >= 500}
                                        <p>
                                            {description.substring(0, 150)}...
                                        </p>
                                    {/if}
                                </div>
                                <p
                                    style=" width:fit-content;color:darkslategray; padding:5px;
                                height:fit-content;
                                        border-style:solid;border-color:black;border-width:1px;
                                    "
                                >
                                    17/08/23
                                </p>
                            </div>
                            {#if window.innerWidth < 500}
                                <div style="text-align: left; width:100%;">
                                    <p>
                                        <span
                                            style="font-weight: 700; font-style:normal;"
                                            >STATUS:
                                        </span> Development
                                    </p>
                                    <p>{description.substring(0, 70)}...</p>
                                </div>
                            {/if}
                        </button>
                    {/each}
                </div>
            {:else if tabs == 1}
                <div class="fundButtonBack">
                    <button class="tabClosed" on:click={() => changeTab(0)}
                        >Updates</button
                    >
                    <button class="tabs">Related ideas</button>
                    <button class="tabClosed" on:click={() => changeTab(2)}
                        >Comments</button
                    >
                </div>
                <br />
                <br />
                <h4 style="font-size: x-large; line-height: 1.1;">
                    Related ideas:
                </h4>
                {#if $subideaLoading == false}
                    {#if displayedIdeas.length == 0}
                        <p
                            style="color: grey;display: flex;
                    align-items: center; /* Vertical alignment */
                    justify-content: center; /* Horizontal alignment */"
                        >
                            -- No ideas related --
                        </p>
                    {:else}
                        <br />
                        {#each displayedIdeas as sub}
                            {#if window.innerWidth < 500}
                                <button
                                    class="ideaVertical"
                                    on:click={() => {
                                        subideaModal.set(true);
                                    }}
                                >
                                    <img src={sub?.data.imageURL} />
                                    <div
                                        class="horizontalLine"
                                        style="margin-top: 0px;"
                                    />
                                    <div class="verticalTextContent">
                                        <div class="header-row" style="">
                                            <div class="title-content">
                                                <h2 style="font-size:larger;">
                                                    {sub?.data.title.substring(
                                                        0,
                                                        40
                                                    )}{#if sub?.data.title.length > 25}...{/if}
                                                </h2>
                                            </div>

                                            {#if "Title of subidea" == "Title of subidea"}
                                                <!-- checking if the user is the owner -->
                                                <div class="button-content">
                                                    <button
                                                        class="fundButton"
                                                        style=" background-color:red; color:white;height:0.7cm;width: 100px; margin-right:10px"
                                                        on:click={(event) => {
                                                            /*openDeleteModal(
                                                            event,
                                                            subidea?.key
                                                    )*/
                                                        }}
                                                        >Delete
                                                    </button>
                                                </div>
                                            {/if}
                                        </div>
                                        <h5>
                                            {sub?.data.subtitle.substring(
                                                0,
                                                60
                                            )}{#if sub?.data.subtitle.length > 60}...{/if}
                                        </h5>
                                        <p>
                                            <!-- list[index]?.description.substring(0, 145) -->
                                            {sub?.data.description.substring(
                                                0,
                                                200
                                            )}{#if sub?.data.description.length > 200}...
                                            {/if}
                                        </p>
                                        <div style="height: 0.3cm;" />

                                        <div class="creatorClass">
                                            <div
                                                class="profilePicture"
                                                style="margin-right:1em; width: 1.7cm; height:1.7cm;"
                                            >
                                                <img
                                                    src="https://beebom.com/wp-content/uploads/2022/02/Featured.jpg?w=750&quality=75"
                                                    alt="Profile Picture"
                                                />
                                            </div>
                                            <p
                                                class="text-body"
                                                style="width: 7.1cm; font-size:14px; margin-right:10px;"
                                            >
                                                <span style="font-weight:bold;"
                                                    >Creator:</span
                                                >{sub?.owner}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="horizontalLine" />
                                    <div class="horizontalBar">
                                        <div class="verticalSubBlock">
                                            <h5 style="font-size:xx-large;">
                                                {sub?.data.amountFollowers}
                                            </h5>
                                            <div style="height:0.2cm;" />
                                            <p>follows</p>
                                        </div>
                                        <div class="verticalSubBlock">
                                            <h5 style="font-size:xx-large;">
                                                {sub?.data.pledged}
                                            </h5>
                                            <div style="height:0.2cm;" />
                                            <p>funding</p>
                                        </div>
                                        <div class="verticalSubBlock">
                                            <button
                                                class="copy"
                                                on:click={() => {}}>👍</button
                                            >
                                        </div>
                                    </div>
                                </button>

                                <br />
                            {:else}
                                <button
                                    class="idea"
                                    on:click={() => {
                                        subideaModal.set(true);
                                    }}
                                    style="height:7.25cm;"
                                >
                                    <div
                                        class="image2"
                                        style="background-image: url('{sub?.data
                                            .imageURL}'); "
                                    />
                                    <div class="verticalLine" />

                                    <div
                                        class="content-wrapper2 NormalColor"
                                        style="padding: 12px;"
                                    >
                                        <div
                                            class="text-content"
                                            style="text-align:justify"
                                        >
                                            <div class="header-row" style="">
                                                <div
                                                    class="text-content title-content"
                                                >
                                                    <h2
                                                        style="font-size:larger;width:300px;"
                                                    >
                                                        {sub?.data.title.substring(
                                                            0,
                                                            40
                                                        )}{#if sub?.data.title.length > 40}...{/if}
                                                    </h2>
                                                </div>
                                                <div class="spacer2" />
                                                {#if creator == $info.key}
                                                    <!-- checking if the user is the owner -->
                                                    <div>
                                                        <button
                                                            class="fundButton"
                                                            style=" background-color:red; color:white;height:0.7cm;width: 100px; margin:0x"
                                                            on:click={(
                                                                event
                                                            ) => {
                                                                // openDeleteModal(
                                                                //     event,
                                                                //     subidea?.key)
                                                            }}
                                                            >Delete
                                                        </button>
                                                    </div>
                                                {/if}
                                            </div>

                                            <h5 style="width:500px;">
                                                {sub?.data.subtitle.substring(
                                                    0,
                                                    60
                                                )}{#if sub?.data.subtitle.length > 60}...{/if}
                                            </h5>
                                            <p style="width:500px;">
                                                <!-- list[index]?.description.substring(0, 145) -->
                                                {sub?.data.description.substring(
                                                    0,
                                                    200
                                                )}{#if sub?.data.description.length > 200}...
                                                {/if}
                                            </p>
                                            <div style="height: 0.3cm;" />
                                            <div class="creatorClass">
                                                <div
                                                    class="profilePicture"
                                                    style="margin-right:1em; width: 1.7cm; height:1.7cm;"
                                                >
                                                    <img
                                                        src="https://beebom.com/wp-content/uploads/2022/02/Featured.jpg?w=750&quality=75"
                                                        alt="Profile Picture"
                                                    />
                                                </div>
                                                <p
                                                    class="text-body"
                                                    style="width: 10.5cm; font-size:14px; margin-right:10px;"
                                                >
                                                    <span
                                                        style="font-weight:bold;"
                                                        >Creator:</span
                                                    >{sub?.owner}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="verticalLine" />
                                    <div
                                        class="numbersInfo2"
                                        style="height:7.2cm;"
                                    >
                                        <h5>{sub?.data.amountFollowers}</h5>
                                        <p>follows</p>
                                        <br />
                                        <h5>{sub?.data.pledged}</h5>
                                        <p>funding</p>
                                        <br />
                                        <button class="copy" on:click={() => {}}
                                            >👍</button
                                        >
                                        <p>Follow Idea</p>
                                        <br />
                                    </div>
                                </button>

                                <br />
                            {/if}
                        {/each}

                        {#if subIdeas.length > displayedIdeas.length}
                            <div class="dots">
                                <button
                                    class="dot"
                                    style="width: 20px;height: 20px;"
                                />
                            </div>
                            <div class="dots">
                                <button
                                    class="dot"
                                    style="width: 16px;height: 16px;"
                                />
                            </div>
                            <div class="dots">
                                <button
                                    class="dot"
                                    style="width: 12px;height: 12px;"
                                />
                            </div>
                            <button
                                class="copy NormalColor"
                                style="border-radius: 0px ; width:100%; margin:0%; margin-top:2%"
                                on:click={() => {
                                    /*seeMoreIdeas()}*/
                                }}
                            >
                                See more ideas!
                            </button>
                        {/if}
                    {/if}
                {:else}
                    <Loading msg="Subideas loading" marginTop={1} width={60} />
                {/if}
            {:else if tabs == 2}
                <div class="fundButtonBack">
                    <button class="tabClosed" on:click={() => changeTab(0)}
                        >Updates</button
                    >
                    <button
                        class="tabClosed"
                        on:click={async () => {
                            changeTab(1);
                            displayedIdeas = await getSolutionSubIdeas(
                                data.id || ""
                            );
                        }}>Related ideas</button
                    >
                    <button class="tabs">Comments</button>
                </div>
                <br />
                <br />
                <div
                    style="display: flex;
                align-items: center; /* Vertical alignment */
                justify-content: center;
                "
                >
                    <h1>COMMENT SECTION COMING SOON!</h1>
                </div>
            {/if}
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
    <ModalNotSignedIn />
    <ModalPledgeFunds documentID={data.id || ""} collectionName="solutions" />
    <ModalUpdate
        description={update.body}
        creator={update.creator}
        subject={update.subject}
        date={update.date}
        status={update.status}
        nxtDate={update.nxtDate}
        nxtStatus={update.nxtTitle}
        profile={update.picture}
    />
    <ModalSubidea />
    <ModalPostUpdate />
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
        );
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
        box-shadow: 0px 0px 15px rgb(243, 97, 0);
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
    .breadcrumbClosed {
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
    .breadcrumbClosed:hover {
        transform: scale(
            1.08
        ); /* scales the button to 105% of its original size on hover */
        box-shadow: -5px 5px 5px rgba(0, 0, 0, 0.2);
        border-width: 0.5px;
        /* background-color: rgba(255, 245, 191, 0.5); */
    }
    .breadcrumbDisplay {
        display: flex;
        gap: 15px;
    }
    .breadcrumb {
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
    .breadcrumb:hover {
        transform: scale(
            1.08
        ); /* scales the button to 105% of its original size on hover */
    }
    .breadcrumb:active {
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
        padding: 10px;
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
        padding: 0px;
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
    .updateDecoration {
        width: 100%;
        height: 0.4cm;
        background: linear-gradient(
            to right,
            rgb(154, 0, 154),
            rgb(215, 3, 215),
            rgb(154, 0, 154)
        );
    }
    .updateText {
        margin: 5px;
        margin-left: 30px;
        margin-right: 30px;
        font-style: italic;
    }
    .horizontalLine {
        width: 100%;
        height: 0px;
        border-color: black;
        border-width: 0.5px;
        margin-top: 10px;
    }
    .totalUpdates {
        width: 100%;
        height: fit-content;
        background-color: rgb(236, 248, 255);
        border-color: black;
        border-width: 1px;
        box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.2);
        color: darkslategray;
    }
    .localUpdate {
        padding: 10px;
        width: 100%;
        height: fit-content;
        background-color: white;

        border-color: black;
        border-width: 0.5px;
        transition: transform 0.3s ease, box-shadow 0.3s ease,
            background-color 0.3s ease;
    }
    .localUpdate:hover {
        transform: translateX(-10px) translateY(-10px);
        /* box-shadow: 8px 8px 0px rgba(21, 68, 78, 0.2); */
        border-width: 1px;
        background-color: rgb(239, 239, 239);
    }
    .localUpdate:active {
        transform: translateX(0px) translateY(0px);
        box-shadow: none; /* removes the shadow */
    }
    .updatesStart {
        gap: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .updatesColumn {
        display: flex;
        flex-direction: column;
        text-align: left;
        width: 82%;
    }
    .tabClosed {
        width: 25%;
        height: 50px;
        margin: auto;
        /* background: linear-gradient(to right, rgb(255, 0, 0), orangered); */
        border-style: groove;
        border-width: 0.2px;
        border-color: aliceblue;
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        font-size: large;
        font-weight: 330;
        /* box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.2); horizontal, vertical, blur, color */
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .tabClosed:hover {
        transform: scale(
            1.08
        ); /* scales the button to 105% of its original size on hover */
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.2);
        border-width: 0.5px;
        /* background-color: rgba(255, 245, 191, 0.5); */
    }
    .tabs {
        width: 25%;
        height: 50px;
        margin: auto;
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
    .verticalTextContent {
        display: inline;
        align-items: start; /* Center the emoji vertically */
        justify-content: start; /* Center the emoji horizontally */
        text-align: left;
        padding: 10px;
    }
    .header-row {
        display: flex;
        align-items: center; /* To vertically align items in the row */
        justify-content: space-between;
        width: 100%; /* Make sure it takes up full width */
        margin-top: auto;
    }
    .title-content {
        flex: 1; /* Allows it to grow and take up available space */
    }
    .horizontalBar {
        display: flex;
        justify-content: center; /* Center horizontally */
        align-items: center; /* Center vertically */
        width: 100%;
        background-color: orangered;
        height: fit-content;
        margin-bottom: 0px;
        gap: 15%;
        padding: 10px;
    }
    .verticalSubBlock {
        display: block;
        justify-content: center; /* Center horizontally */
        align-items: center; /* Center vertically */
        color: white;
    }
    .idea {
        width: 100%;
        height: 215px;
        border: 1px solid black;
        color: rgb(37, 88, 101);
        background-color: white;
        box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.2);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        display: flex; /* Use flexbox to center the emoji */
        align-items: left; /* Center the emoji vertically */
        justify-content: left; /* Center the emoji horizontally */
        position: relative;
        padding-bottom: 0px; /* Adjust as per the height of your Creator section */
    }
    .idea:hover {
        transform: scale(1.05);
    }
    .idea:active {
        transform: scale(
            0.97
        ); /* scales the button to 95% of its original size on click */
        box-shadow: none; /* removes the shadow */
    }
    .image2 {
        width: 100%;
        height: 100%;

        background-color: white;
        background-size: cover;
        background-position-x: center;
    }
    .verticalLine {
        width: 0%;
        height: 100%;
        border: 0.5px solid black;
    }
    .content-wrapper2 {
        display: flex;
        flex-direction: column;
        height: 100%; /* ensure this container stretches as needed */
        width: 65%;
    }
    .NormalColor {
        color: rgb(37, 88, 101);
    }
    .spacer2 {
        flex: 1; /* CHANGE HERE: This ensures the spacer takes up any available space when there's no button */
    }
    .numbersInfo2 {
        padding-left: 15px;
        padding-top: 10px;
        padding-right: 15px;
        color: whitesmoke;
        background-color: #ff6000;
        height: 100%;
    }
    .ideaVertical {
        background-color: white;
        border: 1px solid black;
        color: rgb(37, 88, 101);
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: column;
        box-shadow: 5px 13px 5px rgba(0, 0, 0, 0.3);
        box-sizing: border-box;
    }
    .dots {
        display: flex; /* Use flexbox to center the emoji */
        align-items: center; /* Center the emoji vertically */
        justify-content: center; /* Center the emoji horizontally */
        margin-bottom: 5px;
    }
    .dot {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: azure;
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.2);
        border: 1px solid black;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .dot:hover {
        transform: scale(1.1) translateX(7px);
    }
    .deadlinesBlock {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
    }
    .deadline {
        display: flex;
        justify-content: space-between;

        align-items: center;
        flex-direction: column;
        background: linear-gradient(
            to right,
            rgb(102, 13, 109),
            rgb(129, 0, 129),
            rgb(102, 13, 109)
        );
        padding: 12px;
        padding-top: 0.7cm;
        height: 5cm;
        width: 3.5cm;
        text-align: center;
        box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.4);
    }
    .deadline > *:last-child {
        margin-top: auto;
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
