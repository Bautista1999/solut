<script>
    // @ts-nocheck

    import { goto } from "$app/navigation";
    import Header from "$lib/components/header.svelte";
    import Modal from "$lib/components/modal.svelte";
    import Loading from "$lib/components/loading.svelte";
    import {
        basicInfo,
        info,
        transferFrom,
        signedIn,
        decimalToBigInt,
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
    import {
        registerUser,
        followIdea,
        unfollowIdea,
        checkFollowIdea,
    } from "$lib/data_functions/user.functions";
    import MagicalDots from "$lib/components/magicalDots.svelte";

    /** @type {import('./$types').PageData} */
    // @ts-ignore
    export let data;
    /**
     * @type {String[]}
     */
    // @ts-ignore
    let subideasKeys = [];
    let moneyPledged = 0;
    let amountFollowers = 0;
    let tabs = 0;
    let creator = "";
    let amountUSD = 10;
    let showModal3 = false;
    let showModal4 = false;
    let showModal5 = false;
    let showModal6 = false;
    let showModal7 = false;
    let showModal8 = false;
    let showModal9 = false;
    let localSignIn = false;

    /**
     * @type {{ data: any; } | null}
     */
    let subIdeaOpen = null;
    let topicImage = "";
    /**
     * @type {String[]}
     */
    let ideas = [];
    let userFollows = false;
    let title = "";
    let subtitle = "";
    let description = "";
    // @ts-ignore
    let image = "";
    // @ts-ignore
    let images = [
        "/assets/appImageExample2.jpeg",
        "/assets/appImageExample3.png",
        "/assets/appImageExample4.png",
    ];
    let topicData = {};
    // @ts-ignore
    let profiles = [
        "/assets/profile.jpeg",
        "/assets/profile2.jpeg",
        "/assets/profile3.jpeg",
    ];
    let isLoading = true;
    var updated = 1693418652518035067;
    /**
     * @type {String[]}
     */
    let requirements = [];
    /**
     * @type {any[]}
     */
    let subIdeas = [];
    /**
     * @type {string | any[]}
     */
    let displayedIdeas = [];
    onMount(async () => {
        await initJuno({
            satelliteId: "vehbc-zaaaa-aaaal-acyba-cai",
        });
        const myDoc = await getDoc({
            collection: "ideas",
            // @ts-ignore
            key: data.id,
        });

        await basicInfo();

        title = myDoc?.data.title;
        subtitle = myDoc?.data.subtitle;
        description = myDoc?.data.description;
        ideas = myDoc?.data.ideas;
        // @ts-ignore
        updated = myDoc?.updated_at;
        topicData = myDoc?.data;
        // @ts-ignore
        if (topicData.image == "This is an image" || topicData.image == "") {
            // @ts-ignore
            topicImage =
                "https://www.ericfavre.com/lifestyle/es/wp-content/uploads/sites/8/2021/09/force-1-1024x637-1.jpg";
        } else {
            // @ts-ignore
            topicImage = topicData.image;
        }
        // @ts-ignore
        creator = myDoc?.owner;
        // @ts-ignore
        amountFollowers = topicData.amountFollowers;
        // @ts-ignore
        moneyPledged = fromICPtoUSD(topicData.moneyPledged);
        userFollows = await checkFollow($info.key, data.id);
        if (userFollows == "Not signed in") {
            userFollows = false;
        }
        console.log("User follows:", userFollows);
        image = "/assets/appImageExample.jpeg";
        const MyList = await listDocs({
            collection: "subideas",
        });
        let AllSubIdeas = MyList?.items;

        for (let i = 0; i < AllSubIdeas.length; i++) {
            // @ts-ignore
            if (AllSubIdeas[i]?.data.parent == data.id) {
                subIdeas.push(AllSubIdeas[i]);
                subIdeas = subIdeas;
            }
        }
        displayedIdeas = subList(subIdeas, 3);
        // @ts-ignore
        await getSolutions(data.id);
        isLoading = false;
    });

    /**
     * @type {{}[]}
     */
    // @ts-ignore
    let subideasDisp = [];

    /**
     * @param {any[]} list1
     * @param {number} amount
     */
    //receives one list and a number, and basically it copies the first {number} items
    // of the list into a new list and returns it. If {number} is greater than the list1 length,
    // it copies the whole list1.
    function subList(list1, amount) {
        let returnList = [];
        let limit = list1.length - 1;
        if (amount <= list1.length - 1) {
            limit = amount - 1;
        }
        for (let i = 0; i <= limit; i++) {
            returnList.push(list1[i]);
            returnList = returnList;
        }
        return returnList;
    }
    let counter = 3;
    function seeMoreIdeas() {
        counter += 3;
        displayedIdeas = subList(subIdeas, counter);
        displayedIdeas = displayedIdeas;
    }

    $: editTitle = title;
    $: editSubtitle = subtitle;
    $: editDescription = description;
    $: editImageURL = topicImage;
    $: editedIdea = {
        title: editTitle,
        subtitle: editSubtitle,
        description: editDescription,
        image: editImageURL,
    };

    /**
     * @param {String} [key]
     */

    // @ts-ignore
    function goToIdea(key) {
        window.location.href = "/idea?id=" + key;
    }
    // @ts-ignore
    async function createFeature() {
        goto("create/" + "?under=" + data.id);
    }
    /**
     * @param {String} ideas
     */
    // @ts-ignore
    async function getNames(ideas) {
        /**
         * @type {any[]}
         */
        let names = [];
        console.log("This ideas", ideas);
        console.log("Length", ideas.length);
        for (let i = 0; i < ideas.length; i++) {
            console.log(ideas[i]);
            const myDoc = await getDoc({
                collection: "ideas",
                // @ts-ignore
                key: ideas[i],
            });
            // @ts-ignore
            names.push({ key: ideas[i], title: myDoc?.data.title });
        }

        return names;
    }
    async function editInfo() {
        isLoading = true;
        // @ts-ignore
        topicData.image = editImageURL;
        // @ts-ignore
        topicData.title = editTitle;
        // @ts-ignore
        topicData.description = editDescription;
        // @ts-ignore
        topicData.subtitle = editSubtitle;
        await setDoc({
            collection: "ideas",
            doc: {
                // @ts-ignore
                key: data.id,
                // @ts-ignore
                updated_at: updated, // includes 'key' and 'updated_at'
                data: topicData,
            },
        });
        window.location.reload();
    }
    /**
     * @param {number} num
     */
    async function changeTab(num) {
        tabs = num;
    }
    /**
     * @type {any[]}
     */
    let solutions = [];
    /**
     * @param {string} [topicKey]
     */
    // @ts-ignore
    async function getSolutions(topicKey) {
        //1) We need to get the list of the solutions keys in this topic Data
        // @ts-ignore
        let topicSolutions = topicData.solutions;
        //2) Then we need to get the solutions colection with listDocs()
        const MyList = await listDocs({
            collection: "solutions",
        });
        let sols = MyList?.items;
        console.log("Index solutions:", topicSolutions);
        //3) Then we need to fetch the list, check the list's keys and compare
        //   each one of them with the solutions keys of the topic data
        for (let i = 0; i < sols.length; i++) {
            // @ts-ignore
            console.log("Index: ", i);
            const index = topicSolutions.indexOf(sols[i]?.key);
            if (index > -1) {
                // @ts-ignore
                solutions.push(sols[i]);
                solutions = solutions;
            }
        }
        console.log("Solutions: ", solutions);
    }

    let showModal = false;
    let showModal2 = false;

    function openModal() {
        showModal = true;
    }

    function closeModal() {
        showModal = false;
    }
    let changeDollarICP = 0.31; // 1 dollar = {changeDollarICP} ICP
    /**
     * @param {number} amount
     */
    function fromUSDtoICP(amount) {
        let icpAmount = amount * changeDollarICP;
        icpAmount = Math.round(icpAmount * 100) / 100;
        return icpAmount;
    }
    /**
     * @param {number} amount
     */
    function fromICPtoUSD(amount) {
        let usdAmount = amount / changeDollarICP;
        usdAmount = Math.round(usdAmount * 100) / 100;
        return usdAmount;
    }
    let newIdea = {
        title: "",
        subtitle: "",
        description: "",
        imageURL: "",
        parent: data.id,
        amountFollowers: 0,
        pledged: 0,
        funded: 0,
        followers: [],
        transactionHistory: [],
        comments: [],
    };
    async function addIdea() {
        if (!signedIn()) {
            showModal2 = false;
            showModal5 = true;
            return;
        }
        // @ts-ignore
        let newId = nanoid();
        isLoading = true;
        await setDoc({
            collection: "subideas",
            doc: {
                key: newId,
                data: newIdea,
            },
        });
        ideas.push(newId);
        ideas = ideas;
        console.log("Ideas: ", ideas);
        // @ts-ignore
        topicData.ideas = ideas;
        console.log("Topic data: ", topicData);
        const myDoc = await getDoc({
            collection: "ideas",
            // @ts-ignore
            key: data.id,
        });

        await setDoc({
            collection: "ideas",
            doc: {
                // @ts-ignore
                key: data.id,
                // @ts-ignore
                updated_at: myDoc?.updated_at,
                data: topicData,
            },
        });
        newIdea = {
            title: "",
            subtitle: "",
            description: "",
            imageURL: "",
            parent: data.id,
            amountFollowers: 0,
            pledged: 0,
            funded: 0,
            followers: [],
            transactionHistory: [],
            comments: [],
        };
        isLoading = false;
        window.location.reload();
    }
    let keyDeleteIdea = "";
    /**
     * @param {{stopPropagation: () => void;}} event
     * @param {String} [key]
     */
    function openDeleteModal(event, key) {
        event.stopPropagation();
        console.log("delete");
        showModal3 = true;
        // @ts-ignore
        keyDeleteIdea = key;
    }
    async function deleteSubIdea() {
        if (!signedIn()) {
            showModal3 = false;
            showModal5 = true;
            return;
        }
        isLoading = true;
        //Here we have to:
        //1) Delete the subidea from the database
        console.log(keyDeleteIdea);
        const myDoc = await getDoc({
            collection: "subideas",
            // @ts-ignore
            key: keyDeleteIdea,
        });
        await deleteDoc({
            collection: "subideas",
            // @ts-ignore
            doc: myDoc,
        });
        //2) Delete the subidea key from the subideas array in the topic data
        /**
         * @type {String[]}
         */
        // @ts-ignore
        let subideasKeys = topicData.ideas;
        console.log("Before", subideasKeys);
        const index = subideasKeys.indexOf(keyDeleteIdea);
        if (index > -1) {
            subideasKeys.splice(index, 1);
        }
        subideasKeys = subideasKeys;
        // @ts-ignore
        topicData.ideas = subideasKeys;
        console.log("After", subideasKeys);
        const myDoc2 = await getDoc({
            collection: "ideas",
            // @ts-ignore
            key: data.id,
        });

        await setDoc({
            collection: "ideas",
            doc: {
                // @ts-ignore
                key: data.id,
                // @ts-ignore
                updated_at: myDoc2?.updated_at,
                data: topicData,
            },
        });
        showModal3 = false;
        isLoading = false;
        window.location.reload();
    }
    let followSub = false;
    async function enterIdea() {
        console.log("enter idea");

        showModal8 = true;
        followSub = await checkFollow($info.key, subIdeaOpen?.key, "subideas");
        if (followSub == "Not signed in") {
            followSub = false;
        }
    }
    let copied = false;
    async function copyLink() {
        // Get the current webpage URL
        const url = window.location.href;

        // Create a temporary input element to hold the URL
        const tempInput = document.createElement("input");
        tempInput.value = url;
        document.body.appendChild(tempInput);

        // Select the URL text and copy it to the clipboard
        tempInput.select();
        document.execCommand("copy");

        // Clean up by removing the temporary input element
        document.body.removeChild(tempInput);
        copied = true;
        await setTimeout(() => {
            copied = false;
        }, 2000);
    }
    let followLoading = false;
    /**
     * @param {string} [userKey]
     * @param {string} [ideaKey]
     * @param {string} [collectionName]
     */
    async function follow(userKey, ideaKey, collectionName) {
        userFollows = true;
        followLoading = true;
        // @ts-ignore
        let result = await followIdea(userKey, ideaKey, collectionName);
        if (result == "Not signed in") {
            showModal5 = true;
            showModal4 = false;
            showModal6 = false;
            showModal7 = false;
            showModal8 = false;
            showModal3 = false;
            showModal2 = false;
            showModal = false;
            userFollows = false;
            followLoading = false;
            return "cancel";
        }
        followLoading = false;
    }

    /**
     * @param {string } [userKey]
     * @param {string } [ideaKey]
     * @param {string } [collectionName]
     */
    async function unfollow(userKey, ideaKey, collectionName) {
        userFollows = true;
        followLoading = true;
        // @ts-ignore
        let result = await unfollowIdea(userKey, ideaKey, collectionName);
        if (result == "Not signed in") {
            showModal5 = true;
            showModal4 = false;
            showModal6 = false;
            showModal7 = false;
            showModal8 = false;
            showModal3 = false;
            showModal2 = false;
            showModal = false;
            followLoading = false;
            return "cancel";
        }
        followLoading = false;
    }

    /**
     * @param {string} userKey
     *  @param {string} ideaKey
     */
    async function checkFollow(userKey, ideaKey) {
        let result = checkFollowIdea(userKey, ideaKey);
        if (result == "Not signed in") {
            return false;
        }
        return result;
    }

    /**
     * @param {number} amountICP
     * @param {string} address
     */
    async function pledgeFunds(amountICP, address) {
        if (!signedIn()) {
            showModal = false;
            showModal5 = true;
        }
        //1) We need to increase the amount of moneyPledged field of the idea
        //2) Create a transactionHistory in the idea
        console.log("Getting idea document...");
        const myDoc = await getDoc({
            collection: "ideas",
            // @ts-ignore
            key: data.id,
        });
        console.log("Done!");
        console.log("Creating transaction...");
        let now = Date.now();
        let newTransactionIdea = {
            user: $info.key,
            amountICP: amountICP,
            sentTo: address,
            date: now,
        };
        console.log("Increasing amount of money pledged in the idea...");
        // @ts-ignore
        topicData.moneyPledged += amountICP;
        // @ts-ignore
        topicData.transactionHistory.push(newTransactionIdea);
        // @ts-ignore
        topicData.transactionHistory = topicData.transactionHistory;
        console.log("Updating idea`s info in DB...");
        await setDoc({
            collection: "ideas",
            doc: {
                // @ts-ignore
                key: data.id,
                // @ts-ignore
                updated_at: myDoc?.updated_at,
                data: topicData,
            },
        });
        console.log("Done!");

        //3) We need to increase the amount of pledged field of the user
        //4) Create a transactionHistory in the user
        console.log("Getting user`s doc...");
        const myDoc2 = await getDoc({
            collection: "users",
            // @ts-ignore
            key: $info.key,
        });
        console.log("Done!");
        console.log("Creating transaction in the user...");
        let newTransactionUser = {
            idea: data.id,
            amountICP: amountICP,
            sentTo: address,
            date: now,
        };
        let userData = myDoc2?.data;
        userData.transactionHistory.push(newTransactionUser);
        userData.transactionHistory = userData.transactionHistory;
        console.log("Increasing amount of money pledged in the idea...");
        userData.pledged += amountICP;
        console.log("Updating user`s info in DB...");
        await setDoc({
            collection: "users",
            doc: {
                // @ts-ignore
                key: $info.key,
                // @ts-ignore
                updated_at: myDoc2?.updated_at,
                data: userData,
            },
        });
        console.log("Done!");
        // TODO
        //5) We need to transfer the amountICP tokens to the given address
        const bigIntRepresentation = decimalToBigInt(amountICP, 10 ** 8);
        console.log(bigIntRepresentation); // Expected: 200000
        // @ts-ignore
        let result = transferFrom(address, bigIntRepresentation);
    }
    async function addSolution() {
        if (!signedIn()) {
            showModal5 = true;
            return;
        }
        goto("create/" + "?under=" + data.id);
    }
</script>

<Header />
{#if !isLoading}
    <div class="body">
        <div class="content">
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
                            let result = await unfollow(
                                $info.key,
                                data.id || "",
                                "ideas"
                            );
                            if (result == "cancel") {
                                return;
                            }
                            userFollows = false;
                            amountFollowers--;
                        }}>Unfollow</button
                    >
                {:else}
                    <button
                        class="fundButton"
                        style="background-color: white; color:black; display: block;margin-right: 3em; width:fit-content; padding-left:12px;padding-right:12px;"
                        on:click={async () => {
                            let result = await follow(
                                $info.key,
                                data.id || "",
                                "ideas"
                            );
                            if (result == "cancel") {
                                return;
                            }
                            userFollows = true;
                            amountFollowers++;
                        }}>Follow 👍</button
                    >
                {/if}

                <button class="fundButton" on:click={() => openModal()}
                    >Pledge funds 🚀</button
                >
                {#if !copied}
                    <button class="copy" on:click={() => copyLink()}>📩</button>
                {:else}
                    <button
                        class="copy"
                        style="background-color: orangered; color:white; width: 2.5cm; border-radius : 0px;"
                        >Copied!👍</button
                    >
                {/if}
            </div>
            <br />
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
            <br />
            <div class="description">
                <h4
                    style="font-size: xx-large; line-height: 1.1;"
                    class="NormalColor"
                >
                    Description of the topic:
                </h4>
                <br />
                <p class="text-body NormalColor" style="text-align: justify;">
                    {description}
                </p>
            </div>

            {#if creator == $info.key}
                <br />
                <button
                    class="fundButton"
                    style="width:3cm;"
                    on:click={() => {
                        showModal7 = true;
                    }}>Edit idea</button
                >
            {/if}

            <br />
            <br />
            {#if tabs == 0}
                <div class="fundButtonBack">
                    <button class="tabs">Ideas</button>
                    <button class="tabClosed" on:click={() => changeTab(1)}
                        >Solutions</button
                    >
                    <button class="tabClosed" on:click={() => changeTab(2)}
                        >Comments</button
                    >
                </div>
                <br />
                <br />

                <div class="header-row">
                    <h1 style="font-size: xx-large; line-height:1.2;">
                        Ideas from the community
                    </h1>
                    <div class="dots">
                        <button
                            class="fundButton"
                            style="background-color: orangered; color:aliceblue; width:160px; margin-top:20px;"
                            on:click={() => {
                                showModal2 = true;
                            }}>Add an idea 💡</button
                        >
                    </div>
                </div>

                <br />

                {#if subIdeas.length == 0}
                    <p
                        style="color: grey;display: flex;
                    align-items: center; /* Vertical alignment */
                    justify-content: center; /* Horizontal alignment */"
                    >
                        -- No ideas yet --
                    </p>
                {:else}
                    <br />
                    {#each displayedIdeas as subidea}
                        {#if window.innerWidth < 500}
                            <button
                                class="ideaVertical"
                                on:click={() => {
                                    subIdeaOpen = subidea;
                                    enterIdea();
                                }}
                            >
                                <img
                                    src={subidea?.data.imageURL ||
                                        "https://www.apptunix.com/blog/wp-content/uploads/sites/3/2019/08/app-development-blog-image.jpg"}
                                />
                                <div class="horizontalLine" />
                                <div class="verticalTextContent">
                                    <div class="header-row" style="">
                                        <div class="text-content title-content">
                                            <h2 style="font-size:larger;">
                                                {subidea?.data.title.substring(
                                                    0,
                                                    40
                                                )}{#if subidea?.data.title.length > 25}...{/if}
                                            </h2>
                                        </div>

                                        {#if subidea?.owner == $info.key}
                                            <!-- checking if the user is the owner -->
                                            <div class="button-content">
                                                <button
                                                    class="fundButton"
                                                    style=" background-color:red; color:white;height:0.7cm;width: 100px; margin-right:10px"
                                                    on:click={(event) =>
                                                        openDeleteModal(
                                                            event,
                                                            subidea?.key
                                                        )}
                                                    >Delete
                                                </button>
                                            </div>
                                        {/if}
                                    </div>
                                    <h5>
                                        {subidea?.data.subtitle.substring(
                                            0,
                                            60
                                        )}{#if subidea?.data.subtitle.length > 60}...{/if}
                                    </h5>
                                    <p>
                                        <!-- list[index]?.description.substring(0, 145) -->
                                        {subidea?.data.description.substring(
                                            0,
                                            200
                                        )}{#if subidea?.data.description.length > 200}...
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
                                            >{subidea?.owner}
                                        </p>
                                    </div>
                                </div>
                                <div class="horizontalLine" />
                                <div class="horizontalBar">
                                    <div class="verticalSubBlock">
                                        <h5 style="font-size:xx-large;">
                                            {subidea?.data.amountFollowers}
                                        </h5>
                                        <div style="height:0.2cm;" />
                                        <p>follows</p>
                                    </div>
                                    <div class="verticalSubBlock">
                                        <h5 style="font-size:xx-large;">
                                            {subidea?.data.pledged}
                                        </h5>
                                        <div style="height:0.2cm;" />
                                        <p>funding</p>
                                    </div>
                                    <div class="verticalSubBlock">
                                        <button class="copy" on:click={() => {}}
                                            >👍</button
                                        >
                                    </div>
                                </div>
                            </button>

                            <br />
                        {:else}
                            <button
                                class="idea"
                                on:click={() => {
                                    subIdeaOpen = subidea;
                                    enterIdea();
                                }}
                                style="height:7.25cm;"
                            >
                                <div
                                    class="image2"
                                    style="background-image: url('{subidea?.data
                                        .imageURL ||
                                        'https://www.apptunix.com/blog/wp-content/uploads/sites/3/2019/08/app-development-blog-image.jpg'}'); "
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
                                                    {subidea?.data.title.substring(
                                                        0,
                                                        40
                                                    )}{#if subidea?.data.title.length > 25}...{/if}
                                                </h2>
                                            </div>
                                            <div class="spacer2" />
                                            {#if subidea?.owner == $info.key}
                                                <!-- checking if the user is the owner -->
                                                <div class="button-content">
                                                    <button
                                                        class="fundButton"
                                                        style=" background-color:red; color:white;height:0.7cm;width: 100px; margin:0x"
                                                        on:click={(event) =>
                                                            openDeleteModal(
                                                                event,
                                                                subidea?.key
                                                            )}
                                                        >Delete
                                                    </button>
                                                </div>
                                            {/if}
                                        </div>

                                        <h5 style="width:500px;">
                                            {subidea?.data.subtitle.substring(
                                                0,
                                                60
                                            )}{#if subidea?.data.subtitle.length > 60}...{/if}
                                        </h5>
                                        <p style="width:500px;">
                                            <!-- list[index]?.description.substring(0, 145) -->
                                            {subidea?.data.description.substring(
                                                0,
                                                200
                                            )}{#if subidea?.data.description.length > 200}...
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
                                                <span style="font-weight:bold;"
                                                    >Creator:</span
                                                >{subidea?.owner}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div class="verticalLine" />
                                <div class="numbersInfo2" style="height:7.2cm;">
                                    <h5>{subidea?.data.amountFollowers}</h5>
                                    <p>follows</p>
                                    <br />
                                    <h5>{subidea?.data.pledged}</h5>
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
                            on:click={() => seeMoreIdeas()}
                        >
                            See more ideas!
                        </button>
                    {/if}
                {/if}

                <br />

                <br />
            {:else if tabs == 1}
                <div class="fundButtonBack">
                    <button class="tabClosed" on:click={() => changeTab(0)}
                        >Ideas</button
                    >
                    <button class="tabs">Solutions</button>
                    <button class="tabClosed" on:click={() => changeTab(2)}
                        >Comments</button
                    >
                </div>
                <br />
                <br />
                <div class="header-row">
                    <h1 style="font-size: xx-large; line-height:1.2;">
                        Solutions from developers
                    </h1>
                    <div class="dots">
                        <button
                            class="fundButton"
                            style="background-color: green; color:aliceblue; width:fit-content; padding-left:16px; padding-right:16px; margin-top:20px;"
                            on:click={() => {
                                addSolution();
                            }}>Provide a solution 💡</button
                        >
                    </div>
                </div>
                <br />
                <br />
                {#if solutions.length > 0}
                    {#each solutions as sol}
                        {#if window.innerWidth < 500}
                            <button
                                class="ideaVertical"
                                style="margin-bottom:20px;"
                                on:click={() => {
                                    window.location.href =
                                        "/solution?id=" + sol.key;
                                }}
                            >
                                <img
                                    src={sol.data.images[0] ||
                                        "https://www.apptunix.com/blog/wp-content/uploads/sites/3/2019/08/app-development-blog-image.jpg"}
                                />
                                <div class="horizontalLine" />
                                <div class="verticalTextContent">
                                    <div class="header-row">
                                        <div class="text-content title-content">
                                            <h2 style="font-size:larger;">
                                                {sol.data.title.substring(
                                                    0,
                                                    40
                                                )}{#if sol?.data.title.length > 40}...{/if}
                                            </h2>
                                        </div>
                                        <div class="spacer2" />
                                        {#if sol?.owner == $info.key}
                                            <!-- checking if the user is the owner -->
                                            <div class="button-content">
                                                <button
                                                    class="fundButton"
                                                    style=" background-color:red; color:white;height:0.7cm;width: 100px; margin-right:10px"
                                                    on:click={(event) =>
                                                        openDeleteModal(
                                                            event,
                                                            sol?.key
                                                        )}
                                                    >Delete
                                                </button>
                                            </div>
                                        {/if}
                                    </div>
                                    <h5>
                                        {sol?.data.subtitle.substring(
                                            0,
                                            60
                                        )}{#if sol?.data.subtitle.length > 60}...{/if}
                                    </h5>
                                    <p>
                                        <!-- list[index]?.description.substring(0, 145) -->
                                        {sol?.data.description.substring(
                                            0,
                                            200
                                        )}{#if sol?.data.description.length > 200}...
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
                                            >{sol?.owner}
                                        </p>
                                    </div>
                                </div>
                                <div class="horizontalLine" />

                                <div class="horizontalBar" style="gap:14px;">
                                    <div class="verticalSubBlock">
                                        <h5 style="font-size:xx-large;">
                                            {sol?.data.amountFollowers}
                                        </h5>
                                        <div style="height:0.2cm;" />
                                        <p>follows</p>
                                    </div>
                                    <div class="verticalSubBlock">
                                        <h5>STATUS</h5>
                                        <p
                                            style=" width:fit-content;color:white; padding:5px;
                                        margin-top:5px;
                                    "
                                        >
                                            {sol.data.deadlines[0].title}
                                        </p>
                                    </div>
                                    <div class="verticalSubBlock">
                                        <h5>NXT DEADLINE</h5>
                                        <div
                                            style=" display: flex; 
                                align-items: center;
                                justify-content: center; 
                                margin-top:5px;"
                                        >
                                            <p
                                                style=" width:fit-content;color:white; padding:5px;
                                        border-style:solid;border-color:white;border-width:1px;
                                    "
                                            >
                                                {sol.data.deadlines[0].newDate
                                                    .month}/{sol.data
                                                    .deadlines[0].newDate
                                                    .day}/{sol.data.deadlines[0]
                                                    .newDate.year}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        {:else}
                            <button
                                class="idea NormalColor"
                                style="height:8.4cm;"
                                on:click={() => {
                                    window.location.href =
                                        "/solution?id=" + sol.key;
                                }}
                            >
                                <div
                                    class="image2"
                                    style="background-image: url({sol.data
                                        .images[0]}); "
                                />
                                <div class="verticalLine" />
                                <div class="ideaContent">
                                    <div class="header-row">
                                        <div class="text-content title-content">
                                            <h2
                                                style="font-size:larger; width:300px;"
                                            >
                                                {sol.data.title.substring(
                                                    0,
                                                    40
                                                )}{#if sol?.data.title.length > 40}...{/if}
                                            </h2>
                                        </div>
                                        <div class="spacer2" />
                                        {#if sol?.owner == $info.key}
                                            <!-- checking if the user is the owner -->
                                            <div class="button-content">
                                                <button
                                                    class="fundButton"
                                                    style=" background-color:red; color:white;height:0.7cm;width: 100px; margin:0x"
                                                    on:click={(event) =>
                                                        openDeleteModal(
                                                            event,
                                                            sol?.key
                                                        )}
                                                    >Delete
                                                </button>
                                            </div>
                                        {/if}
                                    </div>

                                    <h5>
                                        {sol.data.subtitle.substring(
                                            0,
                                            60
                                        )}{#if sol?.data.subtitle.length > 60}...{/if}
                                    </h5>
                                    <p>
                                        {sol?.data.description.substring(
                                            0,
                                            200
                                        )}{#if sol?.data.description.length > 200}...{/if}
                                    </p>
                                    <div style="height: 0.3cm;" />
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
                                            >{sol?.owner}
                                        </p>
                                    </div>
                                </div>
                                <div class="verticalLine" />
                                <div class="numbersInfo">
                                    <h5>{sol.data.amountFollowers}</h5>
                                    <p>follows</p>
                                    <div class="spacer" />
                                    <h5>STATUS</h5>
                                    <p>{sol.data.deadlines[0].title}</p>
                                    <div class="spacer" />
                                    <h5>NXT DEADLINE</h5>
                                    <div
                                        style=" display: flex; 
                                align-items: center;
                                justify-content: center; 
                                margin-top:5px;"
                                    >
                                        <p
                                            style=" width:fit-content;color:white; padding:5px;
                                        border-style:solid;border-color:white;border-width:1px;
                                    "
                                        >
                                            {sol.data.deadlines[0].newDate
                                                .month}/{sol.data.deadlines[0]
                                                .newDate.day}/{sol.data
                                                .deadlines[0].newDate.year}
                                        </p>
                                    </div>
                                </div>
                            </button>

                            <br />
                        {/if}
                    {/each}

                    <div class="dots">
                        <button class="dot" style="width: 20px;height: 20px;" />
                    </div>
                    <div class="dots">
                        <button class="dot" style="width: 16px;height: 16px;" />
                    </div>
                    <div class="dots">
                        <button class="dot" style="width: 12px;height: 12px;" />
                    </div>
                    <button
                        class="copy NormalColor"
                        style="border-radius: 0px ; width:100%; margin:0%; margin-top:2%"
                    >
                        See more solutions!
                    </button>
                {:else}
                    <p
                        style="color: grey;display: flex;
                    align-items: center; /* Vertical alignment */
                    justify-content: center; /* Horizontal alignment */"
                    >
                        -- No solutions provided yet --
                    </p>
                {/if}
            {:else}
                <div class="fundButtonBack">
                    <button class="tabClosed" on:click={() => changeTab(0)}
                        >Ideas</button
                    >
                    <button class="tabClosed" on:click={() => changeTab(1)}
                        >Solutions</button
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

                <div class="fundButtonBack" style="height: 10cm;" />
            {/if}
            <!--MODALS**********-->
            <div>
                <!--Pledge modal**********-->
                <Modal bind:isOpen={showModal} close={closeModal}>
                    <h2 style="font-size: 25px;">Funding process</h2>
                    <div class="spacer" />
                    <p>
                        Right now, you have 0.159 ICP tokens in your solutio
                        wallet. If you wish to add more, go to your <a
                            href="/billetera"
                            style="color:blue; text-decoration:underline;"
                            >Solutio wallet page</a
                        >.
                    </p>
                    <br />
                    <h3>Pick amount in US dollars.</h3>
                    <div class="spacer" />
                    <p>
                        <input
                            type="number"
                            class="inputNumber"
                            bind:value={amountUSD}
                        />
                        USD = {fromUSDtoICP(amountUSD)} ICP tokens
                    </p>
                    <br />
                    <p>
                        <input type="checkbox" /> I accept the
                        <a
                            on:click={() => {
                                showModal6 = true;
                            }}
                            style="color:blue; text-decoration:underline;"
                            >Terms and conditions.</a
                        >
                    </p>
                    <br />
                    <button
                        on:click={() => {
                            pledgeFunds(
                                fromUSDtoICP(amountUSD),
                                "e4204e024181e960a018a5cbdc51b8af834f33932bfe4d711909b492b16767eb"
                            );
                            closeModal;
                        }}
                        class="fundButton"
                        style="background-color: #ff6000; color:aliceblue; display: block; margin-left: auto; margin-right: auto;"
                        >Pledge</button
                    >
                    <br />
                    <p>
                        Your tokens won't go to the creator of the issue, nor
                        the developer, it will go to a smart contract that
                        represents this idea. Find out more <a
                            href=""
                            style="color:blue; text-decoration:underline;"
                            >here</a
                        >.
                    </p>
                </Modal>
                <!--AddIdea modal**********-->
                <Modal
                    bind:isOpen2={showModal2}
                    close={() => {
                        showModal2 = false;
                    }}
                >
                    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <h2
                        class="title"
                        style=" background-color: skyblue; color:black; display: block; margin-left: auto; margin-right: auto;"
                    >
                        Create an idea
                    </h2>

                    <h3>Title</h3>
                    <input
                        type="text"
                        style="border-width:1px;border-color:black;width:100%; padding:5px;"
                        bind:value={newIdea.title}
                    />
                    <div class="spacer" />
                    <h3>Subtitle</h3>
                    <textarea
                        class="textarea"
                        style="border-width:1px;border-color:black;width:100%; padding:5px; background-color:white;"
                        bind:value={newIdea.subtitle}
                    />
                    <h3>Description</h3>
                    <textarea
                        class="textarea"
                        style="border-width:1px;border-color:black;width:100%; padding:5px; background-color:white;"
                        bind:value={newIdea.description}
                    />
                    <div style="height: 0.1cm;" />
                    <h3>Add image url</h3>
                    <div style="height: 0.2cm;" />
                    <input
                        type="text"
                        style="border-width:1px;border-color:black;width:100%; padding:5px;"
                        bind:value={newIdea.imageURL}
                    />
                    <div style="height: 0.2cm;" />
                    <p>
                        Please, check the url of the image is working correctly
                        before creating the idea.
                    </p>
                    <div style="height: 0.3cm;" />
                    <button
                        on:click={closeModal}
                        class="fundButton"
                        style="background-color: #ff6000; color:white; display: block; margin-left: auto; margin-right: auto;"
                        on:click={() => {
                            addIdea();
                        }}>Create!</button
                    >
                </Modal>
                <!--Delete modal**********-->
                <Modal
                    bind:isOpen3={showModal3}
                    close={() => {
                        showModal3 = false;
                    }}
                >
                    <div class="delete">
                        <p>Are you sure you want to delete this idea?</p>
                        <br />
                        <br />
                    </div>
                    <div class="delete">
                        <button
                            class="fundButton"
                            style="width: 1.5cm; height:0.8cm; color:white; background-color:red"
                            on:click={() => deleteSubIdea()}>Yes</button
                        >

                        <button
                            class="fundButton"
                            style="width: 1.5cm; height:0.8cm; color:white; background-color:red"
                            on:click={() => {
                                showModal3 = false;
                            }}>No</button
                        >
                        <div class="spacer" />
                    </div>
                </Modal>
                <!--Funding info modal**********-->
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
                <!--Not Signed in modal**********-->
                <Modal
                    bind:isOpen5={showModal5}
                    close={() => {
                        showModal5 = false;
                    }}
                >
                    {#if localSignIn}
                        <h4>Sign in successful!</h4>
                        <br />
                        <div class="delete">
                            <button
                                class="fundButton"
                                style="width: 3.3cm; height:0.8cm; color:white; background-color:orangered;"
                                on:click={() => {
                                    showModal5 = false;
                                }}>Close</button
                            >
                            <div class="spacer" />
                        </div>
                    {:else}
                        <h4>Your are not signed in!</h4>
                        <div class="delete">
                            <p>
                                For using this method you need to be signed in
                                first.
                            </p>
                            <br />
                            <br />
                        </div>
                        <div class="delete">
                            <button
                                class="fundButton"
                                style="width: 3.3cm; height:0.8cm; color:white; background-color:orangered;"
                                on:click={async () => {
                                    await signIn();
                                    console.log(
                                        "This is the info key",
                                        $info.key
                                    );
                                    await registerUser($info.key);
                                    localSignIn = true;
                                    window.location.reload();
                                }}>Sign in here</button
                            >
                            <div class="spacer" />
                        </div>
                    {/if}
                </Modal>
                <!--Terms and conditions info modal**********-->
                <Modal
                    bind:isOpen6={showModal6}
                    close={() => {
                        showModal6 = false;
                    }}
                >
                    <h4>Terms and conditions</h4>
                    <div class="delete">
                        <p>
                            Here are the terms and conditions the user needs to
                            accept to pledge.
                        </p>
                    </div>
                    <br />
                    <div class="delete">
                        <button
                            class="fundButton"
                            style="width: 1.3cm; height:0.8cm; color:white; background-color:grey"
                            on:click={() => {
                                showModal6 = false;
                            }}>Ok</button
                        >
                        <div class="spacer" />
                    </div>
                </Modal>
                <!--Edit idea (creator only)**********-->
                <Modal
                    bind:isOpen7={showModal7}
                    close={() => {
                        showModal7 = false;
                    }}
                >
                    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <h2
                        on:click={closeModal}
                        class="title"
                        style=" background-color: skyblue; color:black; display: block; margin-left: auto; margin-right: auto;"
                    >
                        Edit idea
                    </h2>

                    <h3>Title</h3>
                    <input
                        type="text"
                        style="border-width:1px;border-color:black;width:100%; padding:5px;"
                        bind:value={editTitle}
                    />
                    <div class="spacer" />
                    <h3>Subtitle</h3>
                    <textarea
                        class="textarea"
                        style="border-width:1px;border-color:black;width:100%; padding:5px; background-color:white;"
                        bind:value={editSubtitle}
                    />
                    <h3>Description</h3>
                    <textarea
                        class="textarea"
                        style="border-width:1px;border-color:black;width:100%; padding:5px; background-color:white;"
                        bind:value={editDescription}
                    />
                    <h3>Image</h3>
                    <input
                        type="text"
                        style="border-width:1px;border-color:black;width:100%; padding:5px;"
                        bind:value={editImageURL}
                    />
                    <div style="height: 0.2cm;" />
                    <p>
                        Please, check the url of the image is working correctly
                        before editing the idea.
                    </p>
                    <div style="height: 0.3cm;" />
                    <button
                        on:click={closeModal}
                        class="fundButton"
                        style="background-color: #ff6000; color:white; display: block; margin-left: auto; margin-right: auto;"
                        on:click={() => {
                            editInfo();
                        }}>Save</button
                    >
                </Modal>
                <!--Enter subidea**********-->
                {#if window.innerWidth < 500}
                    <Modal
                        bind:isOpen9={showModal8}
                        close={() => {
                            showModal8 = false;
                            followSub = false;
                        }}
                    >
                        <img src={subIdeaOpen?.data.imageURL} alt={title} />
                        <br />
                        <div class="barra">
                            <div class="progreso" style="width: {65}%">
                                ICP tok: USD {moneyPledged}
                            </div>
                            {#if window.innerWidth < 500}
                                <div class="progreso2">BTC: 0 $</div>
                            {:else}
                                <div class="progreso2">BTC: 0 USD</div>
                            {/if}
                        </div>
                        <br />
                        {#if followLoading}
                            <button
                                class="fundButton"
                                style="background-color: skyblue; padding: 10px;color:white; display: block; margin-left: auto; margin-right: auto; display: flex; 
                                    align-items: center; 
                                    justify-content: center; "
                            >
                                <div
                                    style="transform: scale(0.7); margin-bottom:20px;"
                                >
                                    <MagicalDots />
                                </div></button
                            >
                        {:else if followSub}
                            <button
                                class="fundButton"
                                style="background-color: #ff6000; color:white; display: block; margin-left: auto; margin-right: auto;"
                                on:click={async () => {
                                    let result = await unfollow(
                                        $info.key,
                                        subIdeaOpen?.key || "",
                                        "subideas"
                                    );
                                    if (result == "cancel") {
                                        return;
                                    }
                                    followSub = false;
                                    subIdeaOpen.data.amountFollowers =
                                        subIdeaOpen?.data.amountFollowers - 1;
                                }}>Unfollow</button
                            >
                        {:else}
                            <button
                                class="fundButton"
                                style="background-color: white; color:black; display: block; margin-left: auto; margin-right: auto;"
                                on:click={async () => {
                                    let result = await follow(
                                        $info.key,
                                        subIdeaOpen?.key || "",
                                        "subideas"
                                    );
                                    if (result == "cancel") {
                                        return;
                                    }
                                    followSub = true;
                                    subIdeaOpen.data.amountFollowers =
                                        subIdeaOpen?.data.amountFollowers + 1;
                                }}>Follow 👍</button
                            >
                        {/if}
                        <div class="title-followers-row">
                            <h1 style="font-size:20px; margin-right:5px;">
                                {subIdeaOpen?.data.title}
                            </h1>

                            <div
                                class="followers"
                                style="margin-right:10px;margin-top:15px; "
                            >
                                <h2
                                    style="text-align: center; font-size:xx-large; "
                                >
                                    {subIdeaOpen?.data.amountFollowers}
                                </h2>
                                <p style="text-align: center;">followers</p>
                            </div>
                        </div>
                        <div class="spacer" />
                        <!-- Second Row -->
                        <h4>{subIdeaOpen?.data.subtitle}</h4>
                        <div class="spacer" />
                        <!-- Third Row -->
                        <p>{subIdeaOpen?.data.description}</p>
                        <div class="spacer" />
                    </Modal>
                {:else}
                    <Modal
                        bind:isOpen8={showModal8}
                        close={() => {
                            showModal8 = false;
                            followSub = false;
                        }}
                    >
                        <div class="topic-block">
                            <!-- First Column -->
                            <div class="image-column">
                                <img
                                    src={subIdeaOpen?.data.imageURL}
                                    alt={title}
                                />
                                <br />
                                <div class="barra">
                                    <div class="progreso" style="width: {65}%">
                                        ICP tok: USD {moneyPledged}
                                    </div>
                                    {#if window.innerWidth < 500}
                                        <div class="progreso2">BTC: 0 $</div>
                                    {:else}
                                        <div class="progreso2">BTC: 0 USD</div>
                                    {/if}
                                </div>
                                <br />
                                {#if followLoading}
                                    <button
                                        class="fundButton"
                                        style="background-color: skyblue; padding: 10px;color:white; display: block; margin-left: auto; margin-right: auto; display: flex; 
                                    align-items: center; 
                                    justify-content: center; "
                                    >
                                        <div
                                            style="transform: scale(0.7); margin-bottom:20px;"
                                        >
                                            <MagicalDots />
                                        </div></button
                                    >
                                {:else if followSub}
                                    <button
                                        on:click={closeModal}
                                        class="fundButton"
                                        style="background-color: #ff6000; color:white; display: block; margin-left: auto; margin-right: auto;"
                                        on:click={async () => {
                                            let result = await unfollow(
                                                $info.key,
                                                subIdeaOpen?.key || "",
                                                "subideas"
                                            );
                                            if (result == "cancel") {
                                                return;
                                            }
                                            followSub = false;
                                            subIdeaOpen.data.amountFollowers =
                                                subIdeaOpen?.data
                                                    .amountFollowers - 1;
                                        }}>Unfollow</button
                                    >
                                {:else}
                                    <button
                                        on:click={closeModal}
                                        class="fundButton"
                                        style="background-color: white; color:black; display: block; margin-left: auto; margin-right: auto;"
                                        on:click={async () => {
                                            let result = await follow(
                                                $info.key,
                                                subIdeaOpen?.key || "",
                                                "subideas"
                                            );
                                            if (result == "cancel") {
                                                return;
                                            }
                                            followSub = true;
                                            subIdeaOpen.data.amountFollowers =
                                                subIdeaOpen?.data
                                                    .amountFollowers + 1;
                                        }}>Follow 👍</button
                                    >
                                {/if}
                            </div>

                            <!-- Second Column -->
                            <div class="info-column">
                                <!-- First Row -->
                                <div class="title-followers-row">
                                    <h1
                                        style="font-size:20px; margin-right:5px;"
                                    >
                                        {subIdeaOpen?.data.title}
                                    </h1>

                                    <div
                                        class="followers"
                                        style="margin-right:10px;margin-top:15px; "
                                    >
                                        <h2
                                            style="text-align: center; font-size:xx-large; "
                                        >
                                            {subIdeaOpen?.data.amountFollowers}
                                        </h2>
                                        <p style="text-align: center;">
                                            followers
                                        </p>
                                    </div>
                                </div>
                                <div class="spacer" />
                                <!-- Second Row -->
                                <h4>{subIdeaOpen?.data.subtitle}</h4>
                                <div class="spacer" />
                                <!-- Third Row -->
                                <p>{subIdeaOpen?.data.description}</p>
                                <div class="spacer" />
                            </div>
                        </div>
                    </Modal>
                {/if}
            </div>
        </div>
    </div>
{:else}
    <div
        class="body"
        style="display:flex; justify-content:center;height:fit-content;"
    >
        <Loading />
    </div>
{/if}

<style>
    .content-wrapper2 {
        display: flex;
        flex-direction: column;
        height: 100%; /* ensure this container stretches as needed */
        width: 65%;
    }
    .spacer2 {
        flex: 1; /* CHANGE HERE: This ensures the spacer takes up any available space when there's no button */
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
    .profilePicture2 {
        width: 1.5cm; /* Set the maximum width */
        height: 1.5cm; /* Set the maximum height */
        max-width: 100%; /* Ensure it doesn't exceed the container width */
        max-height: 100%; /* Ensure it doesn't exceed the container height */
        border-radius: 50%; /* Create a perfect circle */
        border: 2px solid orange; /* Add an orange border */
        overflow: hidden; /* Hide any overflowing image */
        display: flex;
        justify-content: center; /* Center horizontally */
        align-items: center; /* Center vertically */
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
    .title {
        width: 4cm;
        height: 50px;
        /* background: linear-gradient(to right, rgb(255, 0, 0), orangered); */
        background-color: rgb(221, 243, 255);
        padding-top: 11px;
        border-style: groove;
        border-color: black;
        border-width: 1px;
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        font-size: large;
        font-weight: 330;
        box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.2); /* horizontal, vertical, blur, color */
        color: black;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        text-align: center;
    }
    .inputNumber {
        width: 50%;
        border-color: black;
        border-width: 1px;
        padding: 5px;
    }
    .spacer {
        height: 0.3cm;
    }
    .tabClosed {
        width: 25%;
        height: 50px;
        margin: auto;
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
    .description {
        background-color: white;
        padding: 2%;
        border: 1px solid black;
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
    .numbersInfo {
        padding-left: 15px;
        padding-top: 10px;
        padding-right: 15px;
        color: whitesmoke;
        background-color: #ff6000;
        height: 100%;
        width: 170px;
    }
    .numbersInfo2 {
        padding-left: 15px;
        padding-top: 10px;
        padding-right: 15px;
        color: whitesmoke;
        background-color: #ff6000;
        height: 100%;
    }
    .verticalLine {
        width: 0%;
        height: 100%;
        border: 0.5px solid black;
    }
    .horizontalLine {
        width: 100%;
        height: 0%;
        border: 0.5px solid black;
    }
    .verticalTextContent {
        display: inline;
        align-items: start; /* Center the emoji vertically */
        justify-content: start; /* Center the emoji horizontally */
        text-align: left;
        padding: 10px;
    }
    .ideaContent {
        width: 70%;
        height: 100%;
        padding: 1%;
        text-align: left;
        padding-left: 20px;
        padding-top: 10px;
        padding-right: 15px;
        text-align: justify;
    }
    .image2 {
        width: 100%;
        height: 100%;

        background-color: white;
        background-size: cover;
        background-position-x: center;
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

    .ideaVertical:hover {
        transform: scale(1.05);
    }
    .ideaVertical:active {
        transform: scale(
            0.97
        ); /* scales the button to 95% of its original size on click */
        box-shadow: none; /* removes the shadow */
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
    .snap-start {
        border-radius: 20px;
        width: 80%;
        z-index: 0;
    }
    .content-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .text-content {
        flex: 1;
    }

    .text-body {
        margin-bottom: 2%;
        width: 100%;
        z-index: 0;
    }

    .followers {
        margin-left: 10px; /* adjust this as needed */
        align-self: flex-start; /* This will align it to the top with the title */
        padding-top: 10px;
        padding-bottom: 10px;
        border-color: black;
        border-width: 1px;
        background: linear-gradient(to right, #ff6000, orangered);
        color: #e0e0e0;
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.2);
        width: 2.3cm;
        height: 1.7cm;
    }

    .body {
        display: flex;
        justify-content: center;
        align-items: flex-start; /* aligns items at the top */
        width: 100%;

        min-height: 100vh;
        z-index: 0;
    }

    .content {
        width: 80%;
        max-width: 800px;
        text-align: left; /* aligns the text to the left */
        height: 12cm;
        margin: 20px auto 0 auto; /* top margin creates space from the top */
        z-index: 0;
    }

    .image {
        width: 100%; /* Adjust as needed */
        padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center center; /* Centers the image */
        z-index: 0;
    }
    .topic-block {
        display: flex;
    }

    .image-column {
        flex: 2;
        margin-right: 20px;
    }

    .image-column img {
        width: 100%;
        height: fit-content;
    }

    .info-column {
        flex: 2;
        display: flex;
        flex-direction: column;
        padding: 10px;
    }

    .title-followers-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-right: 1cm;
        margin-right: 20px;
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
