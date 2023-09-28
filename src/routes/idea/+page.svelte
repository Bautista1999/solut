<script>
    // @ts-nocheck

    import { goto } from "$app/navigation";
    import Header from "$lib/components/header.svelte";
    import Modal from "$lib/components/modal.svelte";
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
    import { ProgressRadial } from "@skeletonlabs/skeleton";
    import {
        registerUser,
        followIdea,
        unfollowIdea,
        checkFollowIdea,
    } from "$lib/data_functions/user.functions";

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

        console.log(myDoc?.data);
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
        console.log("This is the info.key in the onMount", $info.key);
        userFollows = await checkFollow($info.key, data.id);
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
            console.log("Subideas: ", subIdeas);
        }
        displayedIdeas = subList(subIdeas, 3);
        // @ts-ignore
        await getSolutions(data.id);
        console.log(MyList);
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
            return;
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
            return;
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
    }
</script>

<Header />
{#if !isLoading || isLoading}
    <div class="body">
        <div class="content">
            <!-- <h2 class="h2 text-body">{title}</h2>

            <h3 class="h3 text-body" style="font-weight: 400;">{subtitle}</h3> -->
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
            <!-- <iframe
                title="hello"
                src="https://www.youtube.com/embed/Yko3GMseY40?controls=0&showinfo=0&rel=0&autoplay=1&loop=1&playlist=Yko3GMseY40&mute=1"
                frameborder="0"
                allowfullscreen
            /> -->

            <br />

            <div class="barra">
                <div class="progreso" style="width: {75}%">
                    ICP tok: USD {moneyPledged}
                </div>
                <div class="progreso2">BTC: 0 USD</div>
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
                    <button class="copy" style="padding:5px;">
                        <ProgressRadial /></button
                    >
                {:else if userFollows}
                    <button
                        class="copy"
                        style="background-color: orangered;"
                        on:click={() =>
                            unfollow($info.key, data.id || "", "ideas")}
                        >👍</button
                    >
                {:else}
                    <button
                        class="copy"
                        on:click={() =>
                            follow($info.key, data.id || "", "ideas")}
                        >👍</button
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
                <div
                    class="profilePicture"
                    style="background-image: url(data:image/jpeg;base64,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); "
                />
                <p>
                    Creator: <span style="font-style: italic;">{creator}</span>
                </p>
            </div>
            <br />
            <br />
            <div class="description">
                <h4 style="font-size: xx-large;" class="NormalColor">
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
                    <h1 style="font-size: xx-large;">
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
                                        <div class="text-content title-content">
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
                                    <div
                                        class="creatorClass"
                                        style="text-align: left;"
                                    >
                                        <div
                                            class="profilePicture"
                                            style="width:1cm;height:1cm;box-shadow: 0px 0px 0px rgba(247, 4, 255, 0.5);
                                            background-image: url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoGBxMTExYUFBMYFhYWFhYaFhkYFhkWGRYWGBYZGRYWGBgaHysiGiAoHRYZIzQjKCwuMTExGSE3PDcwOyswMS4BCwsLDw4PHBERHTAoIig2MDIwLjAwMDAuMDIwMDAwMDAwMDAwMDAwMDAwMDAuMDAwMDAwMDAwMDAwMDAwMDAwMP/AABEIAOEA4QMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAADAAIEBQYBBwj/xABJEAACAQIEAwUEBgYIBQMFAAABAgMAEQQSITEFQVEGEyJhcTKBkaEUI0JSsdFicoKSwfAHJDNDY4Oi4VOTo7Lxc8LTFXWks7T/xAAaAQACAwEBAAAAAAAAAAAAAAAAAQIDBQQG/8QALxEAAgIBAwMCBAYCAwAAAAAAAAECAxEEEjEhQVEFYRMigZFxobHR4fAywRRCUv/aAAwDAQACEQMRAD8A8brtq4KdVgjldAroFOC0ETgFOC10CnBaBHAKcFp6inBKBNjAtOC06xHLSjCOngTkACU7JRgldI8vwp4I7wGSuGKpSRc+tdZLUbSPxCIIqWSpapXHh0+fw1o2h8QjGOmlKkgeX4VzJRge8jFK4VqSY6Ew10pNE1ICVphWpBWmstIeSOVppFGK0wigYOm0UimEUDGUrU6lQSOUq7SoAaKcKQpwFACUU8CkBRFWggcVaKFrirR0SmkRbGpHRFSnAU9Ir71JIqlMHp/vy9a6IORvppb+d6lfR7j+dRUrhWEWVlDyd2uQtI+XMQI42ZiBzJCWt50PC6sjFuXREFYbWPL+B0ogRTsQbdDVu0GEaOPuJ4HkK/WfSHkSz9IggFl/Xa/lUCThOPY+BEYf4U0chPoBIzVLr4Fjy0vx6DI4eVtvLrb8q68FxUSfheL/ALzDYj3xyAfhTYkkUWEMgHTI/wCVPI/hPlMnLBvXHgsNvLbqQKAqTMLdxKb6WCOfwFEh4Pi90weIA693IF9SSLUC+G+7GtEBvp60Jo77bfyak93MDZ3jjI5PMhP7qZm+VSoMLG5RS+d5HRFKDILsdSWfxEAXPsjanKOF1JKuXbr+BTNFby/npXMttOn8mpkaA2N7jf1FDih0BO51951J+dQwLd5I5WhulSZIrUyk0SUiGy01lqU6UBlqLRbGQAimkUVhTCKRIEabRGFMNAxUqVKgkdFPUVxRT1FBFjlFFUU1RR40pohJnY0ogFOQUaOK+/8A4qaRRKQJIr87Hr1HX3dPfR4msPELDra49bDUU+ODNvsD8SDufyqbHHUlErnNIiEsRdRa2ozfatytyB6mpPBVHfxasFkYxsp5d8jRX9LyXuNKcsDuSI1DWIDM5yxx3IAztzJvoouzcgTRsXwMoN3kmGt8pBQixBWIEd3a4IMjA6f2dU3WQScW+S/Twm2pJdDGyxFWZDupIPqDanRJrVr22hAxTOossypKo6d6oYj3E1W4epVS3RTOm1bW0aXgHaXFYa3jd4xuMxDKOoYa+46eleydh+1AxMBYPnym1z7QB2DdCNR8K8W4OgOhq97G4hsFxAR3+qxIy2vYZ/aiPqWGT9o12SjmPXqv0Mm6PzSlX0kl24f08nqHG+JNyYj0Yj8K8c/pF42+In7jvGZIuRYkFz7R1PIHL8etejdouICOJ5DsilvWwvavIuHRF80r6kksT5k3J+NTnBRiopHB6ZvlZO+xt46L8WQoYrMFAuSQABuSdgKteGTZHeTfuY5LG+neFTt6HS/nRccowcRJH9amXwjnh4GHtHpJINhuqG+hYWgcPjPcsF3dlUa2vrmtex+7Wfe0lg9LQ3Lr2Q3AgstszZQLEW19L7n3VLjLWzZfDyUbgDQeR9KnYTgAcAeOKT7NhYk6bRk5ZNifq2DW/u2oMkMsRtKBYkhZE1R2G6kGxVxzUhW6ilXZGXTPU57q5LrjoRXcH2QT7rfEmgGLS+55cv8AwBVq0Y5VEnhy3Ye/z8/WrnE54TRCtQ3WpkkNvXmfyoDCotE4yIbrQnFS5FoDioM6IsjkUwijMKGwpEkMtSrtKgmPWioKGoo6Cggx8a1IRaZEtFAqaRTNjoz10/D39D8vSpSgk2GnU9PIef4fgKEjUcwrEe4bfz0p2BxyN4QMrfd/LrTTWcFbhLbuSJ0MYFqscBgM/ibRMubfKWUnKGL2Pdxk6BrFmOiKxuVXC+Hh7O9strgMCVYZsveOo1ZM3hVBrK/hHhDmvROAdnwlppx4r51RyCVa1u9lI0aXLpp4UFlUADXn1OpUFtjyWabSOb3z48FbwTs0zBWa8Mag5AoySEN7Xdrc9wpvqbmVtMznUUbtPJhsNBk8EY5Io1J9BqTr663tT+L9o5JZDh8GM8mzya5Y/eOfkNfS2ufnSKLMYx9KxGoeZz9VGeYUj2rE+ylhuL8qzoQnbPy/H7mjZZXTHMnhGL7ZjPDhpspX+2jIYWIyyF0BH6jr7rVQQmtN2gzPhJM7ZnjxEbnQKAJY2WwA5XhrLQVqUJxzF9mUWSU0pLujScEbUVoeJwXbCyDdMRDb/mLas3wU6itph4g4iv8AZljf9w5//bWpFbotGPZLZZkj/wBImJthcgOrsij09o/JareB4ZIoe+dQwjAKodpJTfu1I5qLFm8lt9qpHbvxyYeMbF2P7q2/91C42csaoNlHzNrn5AfsipWLdN+yKaVspjFd22YzjM7SSM7sWZmJZjuSdyasMDIUji8Be7MxC72AAvb9qqrHHxVdQZ1aLIxUhLjQEEk6gg6HYfGsq9OUlFG7TJQrcmemdmJ8PiYMnhcbMjAXv0seeh89L0zi3Z1kDMl5EIswYCR8o1CsGP16D7rEMt/A6mqbBGGbL3o+jYjQJMn9lIeStf2bkey9weTa2rR8L47LFIIMYuV9kl1yye8638jrz1vplWRnXLwzqrnC2OU8oxON4bkBePxR2LFbliiA2Z0YgGSNTowIDx/bFvGa6RL1ve2U2Gw5EnehZCVYxofE5A8MqZb5JANm2YXBuDavMuJcaTOe6jyg8vZUNzZUHsg6HJeym9tLAaemtnKHzL6mbqdMt2YP6BHXLofZ5eXl6VGmGun+w9evoPlRYMYGHiAPuv8AjQDML5fhVu9N4E6JRjuYNhQJFqSaHItDQoMiOKCwqS4oDCoFyB0qVqVBIelHjoSCpEQpojIMDYUeML1t5NYH3HY0KJQTrUtUFrddORH828qmjnk0AE3dyB7CQC+ZbkBgylSLjUaE2PI232rk+Ahm8WHksb/2UpCPfoknsPuNND5VOfh2eyot3YqqAWBLMQqr01JA1p0vZ8nRfEgUMWGzKT4WH/qEFx+gI+tU24g85OnTz3R29iV2X4xNh5Rorsj37ua6+PLlBufZcKSBn010bWx2OO7XNi2XDJfDM39uZSEdALEhb2ve+h259CPNsRK0dkcFwNFBNmQfoPuo/RN18qscDxVWURuFmjW2VHBzx/qFTnQ6f3bEdUqqVcLevDLt8ofgbmJEZO4gBjww9phcSYg8yTuIz8W56aVMxGFVY7AAADQDQAVkeH450F8POCo3jnOZRYagToNP8xU9TVlj+1RWK0kEkZI0s0YRzcWCzNeMi1zoSdLC2476fh1Qwlh/mzD1Wn1F9u7Ka/HovoUXarjCRqmEaENG8cUzlTkl72QF75rEGyMi2YGwWs/DgIHP1WICn7syFLDpnTMCfcKd2qMjzd662DhAp2BCIq2sdRtsfdca1GwkVVVQfL57mtNqMUlwuDRcI4PKCCAjj7ySIw/G/wARWwwKZR4hYgf7fhf41hMHCCRpXrvYCDu4Gck2A69BXdGThHJj34lLqY3iuCaWeFgCVQPc7AE5bb+hqu4/GdczIg+87qB8ASflXe2nEWlle7G1zpc2+FYvGOBSnNrLLqK1NL2DzwQBrvMXP3YluD0HePYD901aDHhjAgAVQzWUHMdVALO/NjlS9gB4RYaVRR8MlezZCqm1meyKb/dZrZvQXNaXgXYeZrSt4UWx72S8US21B8Vnk5aAL6muBpymmjRnOEYNN4yjUJLCkN5WUKRqDz8rVAxWMkOHySN3OFBBjaVQ0pUahIg2uXpfbUbaVB4hxrCYU/Vf1qYbSyC0aH/Dj5+p19azWJ4vJPJ3krGR+Rb2V/VXb+A6V0WbGvmWcdji0tMotuLaz3/ZFhiXMhOQd0h+2/jlkHUDe3wFRmggiFytz1fxMfRRp/O9RZOI2O9yd2OoH50fhOBaWXI9y51BP2h/Onwrjssb54NWEYx46vyRcVxB2HgGVfn0HkNdKDhIze5+J/Otq3Y4x5SULJJcZRuXtrEDyLqCFPJ1jqofhYiZkJD5bZXto8bKHjkUcgyMre+3KlTOM3hFOocorLK9wOvw1J93L1NCJvUwxgXAG3IWG/X51GmW1dDRyxaIktRnqVKKjvUGdEQdKlSpEgyLR41I2oSUcbU0Qkw2HN6lBmBuFDBd9bG5HLlt161EjjUnQi/rlb52qYoAATW7nKL3v4jYm56C/wAKmiiXJo+ymHDkytmVFS17EFc6O0rAg7rAktujSxHpXoz8DSPCmSRQrsDJIBsCR4Y18lGVB5AVmuxHDQywJYfWsHax+wxWY/8AShwK2/xG61o/6S8UzRR4ZDZsRIqG3JTuSOlsx/ZrK1Nm6ZoaeG2KR5JxTBHI2JYazOVhFvsi/jt0tdveorPnDFa9K47hVnnZEt3eGUQxgbZlt3x9c1k/yxVJi+BEcq0tPTLYpPlmdqNbBWOHgzWHxjAgkm42YEhh+0NbeV7VaYbtAUvcBgRdjcxsRoCXaOwfce0pFDxPCiOVCxXDCuBebrie6/ciSQf97fAVKblBFlTja+hZYfG4ZhcM0N9WLRhkPq8BUfEE1Ki4fE/sfRJb/dn7hj8UrJLwmRYllFwT4ha4OTYG/nv6EUfC4GWSIyqqyBSA4K+JSfZYstmsbWvepxmu8fs8E5Ra4l91k2MHAJB7ODY/qYyNvxWreBMeE7tYJVQ7hsZCo+IiJry/6WFOqOp55JbD1AZWPzpxxyf8aYeRjVvn3g/Cpb17lTqm/H2N/J2WJ1kGEjPWXFyyn92NkvTfovD4NZMYt7arhIEjPumYGT/VXnzYlD/eyn/LUfPvDTEYMbKhY8s7X+SgfjUd8fDYfCs7ySXssG4l7a4WAn6HhFMn/FlJmkPndtqzHH+0uJxLXmlLdBfQegGg91MxmCeGMGUhWcXjjUZTlOztbWx5A7+m4sHwV3BIF3sSotfXe3mTtSc32ROFFae7l+WQMhOv46X9L6n3CnIlcw8JbxHmL3P6wX+NXWB4dflUEnIlbYoIr4MGTyrX9nuHd5CxUf1jC2kTrJDsRfqNV0/Q613h/BDuRVphpRhZop9lRrS+cL+GS/po3qgpXadut45OanXJWpPh9DcYcJjMIMptnQWI0KOLFWHQg2YdK8+7T4YlUmtYqSkgANhnd9Bc7JOsoH6M0I2tWz7Ij6PiMThNlVs8XIZHuwVetvEL/oioPa3hmaSaIWHfrmS/35MsfynjwZ97dayKJ/DsRr3RU4NHl3elrNlsp0uT4jfbQaDX8aBiNN6kJKrArrr4hv7LjMLW6Eke6o00Sg6kX/SN2+G/yraZlpdSM4J9KA61JNuXzFvPagPUGXxYC1KnWpUiYaOisdvWgowoyv0/D86aIMKFuD6VKVPZVBZsrZRtdyMi/N6DE3kPw9NqtOEZGxWFQkEticPYWN7GVAfTS9SfSLZSuskj1/shhQJ3sAFiiZUt0aZol/6WEh+NVvaLGD/6i0japg8NJL5Xy7W6+3Vz2HuRMTuPoy//AIsTn/VIayHHJvFxZ/OCJfSSXKf/ANlYyW6WPP8Atmk3ti34InBwRGmY3ZvEx5lm8TE+pJq7ihUjUVUYcajyq6wp2r1MEkkjw9025Nsi47gqkEgVku0CBcC8Q3XGM50OzYN1FuozQML9VI5GvQMbNkjZuik/AXrzLjvFe9YwAoWR542sCpYs83cMAb7NO4Optnrm1eOiXk1fRt8pSk30Sx9TfY/ssoTu1GkaJGPRFCa/u1gc0nC8T3qrmie6uh9llPtRt67g+XlXs/DcSsrMdCH8Q81fxKfgwrAf04cOKRw92jEEyO5VSQqx5FBYjYXlG9KWEl+B00WOc5QfGWUfabh0LKuIg8WHl9luaN9qJ+jDpz3GhrLHAgrIbbZVH6zN+QqT2d49JBfuwskb6TYd9VkA5qN79CviX0qyxWPwkuRcOkkQDGWZHs2URqXYBxqwsthcDeo7ouOTqjCUJY7FNgsCvcq5GrSEe4LcVoOHCHDwtiZVBVTliQ/301r5f1FHiY+g3YUzs/Pg5MOsWJlbDvEc1whfvo9SuW2z6ka6WtrpVZx7i/euJcuSNBkwkO4VAT9a/wB43ubn2m/RW1JzjGPQFGU5tPhEnh+ClxErSzEtKzeK/wBi4BAI5GxGnIWHUD0PgHZ4R5JCNiD8Desv/Qpgmlnlzq2V0ZwxBszRugazHc/W616nxpgiZV3Og9ToKnSk+eWcutucHiPCPCuLYNYJ5YtlTEYmMekcyAfhWt7OcPBtesf2xxQfFzOCMvfTuNd+8ndxbr4GQ1suyeMzqD1opxkXqEXsUkX00AUaVT8RjDAqdiCD6HSr3FHSqPG710sxYN5LDhOMPecOxBuTJE+HlY/ehbKWPmcsnxq/7ZRMO5dfa+tT3mJpIv8AqxR/CsdhJD9EUj+54nlH6kkak/OU1ve1GsUbDlicMfcZ0B+RNeWvjtta92e2qluqjLykeK8bgCYmZLDL3kuUfod5ni/0SCqox2FrW1PwvV72kUJi5FJAYx4bfcgYaIHX1B0qnmPkD8a2K3ugn7GdPpNoiX1NCeiyP/NvyoMjChlkQdKlSpEgsf8AOlF06qPUgUGM0U8qaIyDIy/eX3H8quezqqMThStrfSsNqNR/bJuapovL+TR8FiFjkWXJZo3jkuDuEkUnTam/8WitL5ke9dkBb6QOkkP/APJBWH40PBxQcxiMKT6d/HW94LZcTiEH2kgkHplaK/8A0axvaKG0/E47ayYYTAdTEzOLf6Kx63iafuv1NCazBr2ZBwra1cYNqoMFLex6gVbwTWFeoizxFseobGP3jiIv3aABpWG4XWwXpfKdeWnW4iHhPCMYhhiKhxfKy2WRW+9e1zrv86rpuJJ32V7ZZAF12uCbKfJsxHuHWrPi3DY4z9KhUd2QoxMYX2MvszKo1BTmByuRrXl/VbLHqcOTXT5ccZ/dntfRdPStImuW3n/RM7KYiWI9zNYSw2jfSwZR/YyKPumMAesb9Kue2sjLAsyKHVM8c6HUPh51yyr7mEZvyCmqvSZVJe0iiySWz6aHI4BBddBqDfY32NFXjWIhUpJhGnQgg908cilTp4g5Q6j7Nj6muzSeqUXQjGxpSXKfRM4tV6ZfRe51xzF+O2TyePsmockyEoCSLrl8I5tr0qmfDEkm5Cnqdhyr0PG8GnxDlIImw0JFmMzrI9vuoE1y+TMT59b3s/wLBYdwgi72UKGzyIZDc6ABiuVCdSFFjYE2trVmu9U0daSpTb5aXX7vwdOm0eplFytwvB5FdrAXWRV9m4zZfIEbj9E3HlVlLwBprSZz4wDcjNe4FueltrbC1es9puF4SXKk0C5mIVXWMhhfb6xBdRfTU2uQDvrmI+zsuHYBQ0+H1OVSkcy3N7AsMjDe/s76WO9Wh9V0ljxemk+P4ZPUaTUqGasNo039G0bLFfaGBO5gBABJLd5PIbb5nye9SOVc7WcVcA92M0hIWNesrf2fwIzH9FGPKlFxiVkEUGCkiVRZe8eNEA82V3Pvym9dgiEV5WYNLY+IDwRA7lb+01gPEemmlgLtV6rpqIydbTk+Euxn0+l6nUXL4kWkuc9ypwHZ/h/D4h9LZGmceNmsTruqA7KPKoU0EMMqNh3zQSjwD7h+6P0bfDSp2B4euJkaSTTDxPmck6zSr9lj9pU59W8Oy1n+0nFIjOEiAUKxYgaBc3K3Ine3p1rJ0Ntn/Jj1bb/y8Jfubuu01L001Lsuj9/Y1LS3WqnHHWu8PxeZaDjHr1jeUeEUMSwP4ef6pL/9xw494SEn5VvO0Q/qyjn3mGHv76OsNgIc2FwyDfEY+SX17pWj/GNa3naXUQIPt4rD/upIJW/0oa8xqnm1/iz2GmWKor2R5N25QHGSggWCQb7D6lTvy0IrMuU5OtvWrrty6tjsQcuYiRY7XsPqoY0bTnqpFUsh6i3l0+Fa1X+EV7HDZ/mwLWOzKfQg0J/50onWhSU2TQKlXKVIkFSjAXqOhow2oFIOmm5A9Tr8N6KFzEaaNmU73AYG1/eBUeGw5e7YfKpFi2hYgEbL4RfztqamVPk9q7J8S7wYGckfX4doZD/jReID95Jqb2ujEWOw05HglzRSeecWF+guqD9qsp/R1xFmw0+HBvNhnTFQgWJNrGRF9SGH+fW97W4RcXgy0Z3QSxsD5Zgb/A/s1j2R2TZowe6KZ5xhoTCzQtfNC7Rm+5CGyt71sffViZfBUbjMucw4sC3fqIpha2XERAjX1VSP8oda5A9xW9prN9af9yeY11Pw7WZvjhJJ99TOynbR4GEczXTQBzqQOSv1HRtxzuNpHFMBfWs1jcERyqjV6aNyaksmh6fqnVjD/k9QwZSMq0f9hKbLbXun3Efkp+zytpoAL24jryzsb2g+jydzN4sPL4HB+xc6MvSx18q9WwqMBkY5itrN99T7L+8fMGvF+o6WVM+v38/yev0+pjbHKOFKfgsN4gbnpvsOYHSjCKpmDhrNJ2WYiyNxPD3sddNRrseo6VDWOrzFRXFV7w0EabPlwQylVnFFMjCFWy3GeR/+HGPtXOl+nnblermaygk8h8fIVgP6ReMtAn0ZD9dNZ52H2V/u4gegH512aGh22pLn+9R23quDkyF2s7YqAMNhRlSMZQRytpfzb8PM7ZbAKb31PUncknUk0LCYS9XvDuHeVe00uljSsL6vuzy+t1jnzx2XgtuEsQK7xPEZVY72BsBqSeQA9aMiZBT+BQrLiA7/ANjhh38p/U1iX1LjNbmI2Fd1s1CtyfYx6a/i3JLuaDg+AtjMNh9GGCwy5yOU8lmY25Xy/wCutBxSVTioQ2iYeKadzyHh7pb/ALLyH9moXYPDMY5MTILPiHL6/ZQ+yt+gAUfs1RdtOLZcHiZr2bGSiCLl9RHmVj6Ed8b/AOIledSdlmP71PUNqMTzbEztLI8rCxkLyH1lkLkefKgO19iPS9j8DrXURh9o9WB1X4H4UyYg7i3zHwNbSWFgzOZZBEW3FqDIaJsKDIaTLYjKVcpUhiU0eO550BBUhTQJjwbc6k4dxfUel9L+7pQB5b/OnowHmfLr5t19L1JFcllGg7P8X+i4iLED2UOWQDnC+j6c7aMB1UV7B2dmCM+HuMo+tw5Gxhc3KL5IxIA+6UPOvC4pBbU+otrW47B8XeSJYAbYjDEvhS395ELB4S3ocp8u7P2DXJrKsrcvqXaWzHyv6FpxrhaQTyQP4cNjCMjC31OIGqMPO6jrcrro1Z6PPG7RyC0kZyuAbi+4YHmpBBB6GvSMbDDxDC25ODvo0cgNip6EMLEciPKvOuP4oqVjxCsMTDdTIth30GuUm4IuGIJOtvERfNpXpNQ65YfD5/cet0nxorHKJaMGGtV3EcIhuARfmBqR7hVMO0eR7NAdNbGTOjgjQnLlLLz0ax53GlAi4rPjMRDDJJaJ5VBjjHdRiO93si2t4b1pT1HTKXT3M+r01xl80voh+K4UuaHvDlWZlWMD2pAzAZ1HJNfaO/K+43v9GXaNcRAkMjfWxgqhJ1ZRyJ6jT3V51xLipxHEBMdhNGF6KiuAAOgAqv4NimgcMDpmyuCbC4Omo1U/pDbXcXBy9Zpv+VXh9HyvY2tPKNEtvbhv/Z9EDQ+yxPlG5+drVIiEn/CI83ZFHyJPyryjCdvpFUZndRtZlzWI0KllYX1B1yj0pk/b8n+9c+YhB/7pBWBH02xcrP1NN1qX/ZfZnrrd6f7tD+rICfgQB86jShh7Ubr+xm+aZhXksfbsg6ySH/IX/wCap0X9ILbLI97bCM3+Ge3zpy9On/5/P+BRqS4kvsz0DieMjgjMj6BdQpBUsw9kAG3OvCuI4/6TiJJSbu7Ej9IXsMv5f+KldqO1UuJJTMx1IJY6kcwqjRB11JPW1xWbVdR/PM1sem6B0JyfL/JHBq7Yv5E8+X+xr+FQx6XYa7a7+nWtHEqqNK87h4lMjeB28W6+0rNexup0Nzr76t5ceyEgyohUeMIrOufmqjMBpsbaX26nahbjo0Yt2ic+sZfc0GMxHQEkkBQNSzE2VVHMkm1qu8LwlvBgFILuyzY5gbgc44L9AAOlwpI9q1U3ZfEtGBK6CTEvphU5LmBDTONwQNPQm2pOX0Ds/wANXCQs8r3dryTSNzJ1a/T/AGA1tc5+t1O75Vx+rOrQ6P4Scpcv8kSOOylYkw8JyyTHu0PNEteSU/qoCfM2HOvLu3PEkmxPdRi0OETuYhyzCwkI62yqnnkvzrVdpuPPh4XxJuMRiVMeFQjxQwaEysDsdnPmYgRoa81TKqgA6Ae//eo6KrruZZqrMLageJYDYeoHTfQe7lURmvsaLK4O+nrqP9v51oZuN/z+daDZzQWEBkBHOgMakMajuKgWoZmrtcpUEhy0VKCpoimgRIjNOGh8qGpoq66VIg0Gibl1+XnRYcS0LrLGxDIwbP0I5qvNeTA+0CaAum+3zNHi18j5cx09aeMrDK87XlHqPZvtKsqnEwi+wxkK6srAaTxj7Wg/aUfeUg2vajgEPEIVZWGa2aGVT121HKvJ+FYuTDSLNAQrroV2WRb6o4H47g61v+zXH1kBmwwJF/6xhSQGjc7vFy16bNys1wcu+iVUt0eP70NCm6Nix3PPONcOlhLQzLlljJaM8nX7YQ/Bsvmd7ionB5LSpINwJgfJu5e3xr2TjXD8PxKDSzWvlOzow3UjdSDfQ7eRryPH8Jkws5VtVJte3Plf11H7VX0XKcXF8sLIuLUvBA4dhsw150aCMd80cuiyaEnkx9l/jqfU1I4Xhnyhk101U8/Q1Z/Q48UpQeCZNlbRh5eYrThX0TM6VuG0+P0IXCML9c2Fm8LN4QT98DwkedgPXKOpoMvCXjkaNxZkNj+II6gggjyNWGKjM8OoK4nD7n7TouoIPNk0N+a/qm1/wrER8QiBNhiYRZxt3ieXzI9SOlZGvjKiW+PD59mb3pWojYvh2cr9DHy8OsKmnAfR8KZ39qXSMHcjYH3kFvRR1rUQcEVzeS6RLrIT4dB9keZ28t6ouJY1cbO0r+HCYYaBdM3IKo6tYKOgF65dLOepmox45b9vH1O71GdWng8c9vxM/Fw/uoTNJ7Ul1iB3I2aT05e+g4DAlkZrenuqyWGXHzliMsa2AA9lEGgRau8VgAi5QNAK9FGnPVcHkp3NdHy/yMZhoyXHIi+vTbX8aPgoWllVY1zG/gXlvbM3lf3nandyxZkQXZzb0Xn8Tp8a9L7Edn48JEcROQthcs2lhauDUWxgsdztqg5vL4Lbsh2ZXDL3spDTMPEx2UfdHQD+eVu8W4tEUOImOXBwm6jnipQfCADulxoPtEa+EG4+NcUTuzNiSYcKPZiIPeYht1Vl3Cn7m53bKoN/P+0fG5MbIHkGSJNIYvsou125FiLa8thpXDVTK6WWXW2xrRX8b4xJjZ3nl0vYKFN8iqSVRfvKLm/Ukmoszct+d+R9Ke9l5eg5D1/KgMenvH8RWrGKgsIznLe8sGdaa5px0oLGgmuoxzQmp7GhsaiWDKVKlQM6DTwaGKcpoEwymiK1ABoimgTRIQX3p+e387+lBjajb1JFckHixB+18fz/ADqXh5nRxJE5jkXZh05qwOjA9DpVZmI059eg8vP8KJC9vMdPyP8ACnysMhhrqjc8I7VLI4Ln6PiTYZwfBN0BzEBuXhcgjZX+zVnx/usTGROojddDIt+7vyz3AaI7aOB5X3rz45SCTa3O+1vMcqlcL4pPEFyNmQXyo5bwLcWWORSHTT7IOXXUGuOzSYe6B1V6rKxMkvwefCnMnjj6Xup/VYbe74VYQmDFWs3dTr7OyuCOn3x6U3DdoYTo2aBja9/CpudfHGjRt+1Enm1Cx3DRMMyhZAT7SqSNOrwGVP3svoKtp1NlXyyWUFtFdnzReGO4hFKGDMAuITZgPBOo3IH3wL3XmMw5ms/i5CjrPAxS9ypB9k/bQ9QD/Cp0fEpo7xsRNGN0aVHYW2KOrZ0I5XGluVQMRYMxXMUk1KsuV0fmcux66aEX6G3XKyu2L9+UyiELKpJ+OGguP41i8TlieTMGt4VFsxPWjywl+7wsJ0vcsNmOzyny0Kr6MelVsGIVASLsSLEre5H3FPK/NuQ0GtOwuLmBIDCMvoSHRGItYKCWuoAsAFA0AFUwVVKxBYXfBdZK215k8vtn9TafSMPgohGWGYD2V1dj1sNvU2FVDyYjFk5F7qPmedv0mOg93xNRMHwoxjO4Ci4JZkNjf/EmMaH3FvfUyXi8KiwJmIvYD6xb8vE6rCv/AC5fWlbq7J/LBYRGvTQh803l+5adn+HRQWZFEzXsHJyxZtdM9iZGuPZQM3lUvi3aWOF7tfEYhfYjFlSE33IF1iIt1aT/ANO9ZXiHFsRLfxd0CpHhYlyOSvK3iy/orlX9GoMWUKCoyjptY8weprnhpXJ5myc9SksQJXEcfLiJO9nfO+uUDRI1P2Y15eu55kmoUs+un5i9DnlvsbD5n8qFm5fDy8j5fh+HWsRWEcuHJ7pHS999+f5+dMceetOGlClegnFeBrPehsa6TQyagWJHCaYxrpNMoGKlXL0qBiFOBpgrooJBAaepoYNdBoIB1NFV6jBqIDTQmiVcGlYigK1GV6eSto7n5D3/AJVIixR5i/mND+R+VRmA3ri3p5IuKaLFMSvX46E/w+dOMCEhstm5Mpyn3EVWZ9fT8aIstgLabn+H8KeU+SOxrhlq88pFjPIR0kbvR/rBqBNgS2uZPdDGP+1RTe/bSzEb7H0p8eINwLnfy/Klth4DfYu4yLh5GuZf+Uh/Famo8gFhM4HSMiMf6AKiy4g336dKH37G92Y6dfSjbDwPfY+5L+jJfMRmb7zEsfeTXGnUXFx6DX8KhGW++un+/wDChmTWnlLgSi3yyVJiOg951+Q0HzqO0uup3+RppvSQDnrSbySUUkd1Nd0FJnoLvSJJHXehsaTGhsaTZYkcY0w10mmk0hnCaaa7TTQMVKu0qCRwV2minUAdroNNpUEQgNPBoQNdDUCDhqeGqPenBqBNBs1/Sih6jBqfmp5E4knMK4VB/m1AzV3PRkjtCqvmdPT8qdltregd5XHk0oyG1ki1+dNZfM/L8qAsldL0ZDDDhQP/ADXcwoGem56eQ2hzJQi1jptTS1ML0sklEIWphamFqaTSHjA5mppNNLVwmgZ0mmk1wmlQMVKlSoJCpUqVADRTqVKgDldpUqAO12lSoInRSFdpUIDtOFKlQIcKdSpUAcNcelSoBHF/hThSpUC7iNKlSoGNNNNKlQgGGlSpUDOGuUqVADTSFKlQMVKlSoGKlSpUAf/Z); "
                                        />
                                        <p style="width:450px;">
                                            Creator: <span
                                                style="font-style: italic;"
                                                >{subidea?.owner}</span
                                            >
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
                <h1 style="font-size: xx-large;">Solutions from developers</h1>
                <br />
                <br />
                {#if solutions.length > 0}
                    {#each solutions as sol}
                        <button class="idea NormalColor">
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
                                            {sol.data.title.substring(0, 25)}
                                        </h2>
                                    </div>
                                    <div class="spacer2" />
                                    {#if sol?.owner != $info.key}
                                        <!-- checking if the user is the owner -->
                                        <div class="button-content">
                                            <button
                                                class="fundButton"
                                                style=" background-color:red; color:white;height:1cm;width: 125px;"
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
                                    {sol.data.subtitle.substring(0, 70)}
                                </h5>
                                <p>
                                    {sol?.data.description.substring(0, 160)}...
                                </p>
                                <div style="height:0.3cm;" />
                                <div class="creatorClass">
                                    <div
                                        class="profilePicture"
                                        style="width:1cm;height:1cm;background-image: url(data:image/jpeg;base64,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); "
                                    />
                                    <p>
                                        Creator: <span
                                            style="font-style: italic;"
                                            >{sol?.owner}</span
                                        >
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
                                <p>
                                    {sol.data.deadlines[0].newDate.month}/{sol
                                        .data.deadlines[0].newDate.day}/{sol
                                        .data.deadlines[0].newDate.year}
                                </p>
                            </div>
                        </button>

                        <br />
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
                <br />
                <div class="dots">
                    <button
                        class="fundButton"
                        style="background-color: green; color:aliceblue"
                        on:click={() => addSolution()}
                        >Provide a solution</button
                    >
                </div>
                <br />
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
                            <img src={subIdeaOpen?.data.imageURL} alt={title} />
                            <br />
                            <div class="barra">
                                <div class="progreso" style="width: {65}%">
                                    ICP tok: USD {moneyPledged}
                                </div>
                                <div class="progreso2">BTC: 0 USD</div>
                            </div>
                            <br />
                            {#if followLoading}
                                <button
                                    class="fundButton"
                                    style="background-color: skyblue; padding: 10px;color:white; display: block; margin-left: auto; margin-right: auto; display: flex; 
                                    align-items: center; 
                                    justify-content: center; "
                                >
                                    <div style="transform: scale(0.3);">
                                        <!-- You can adjust the scale value as needed -->
                                        <ProgressRadial />
                                    </div></button
                                >
                            {:else if followSub}
                                <button
                                    on:click={closeModal}
                                    class="fundButton"
                                    style="background-color: #ff6000; color:white; display: block; margin-left: auto; margin-right: auto;"
                                    on:click={async () => {
                                        await unfollow(
                                            $info.key,
                                            subIdeaOpen?.key || "",
                                            "subideas"
                                        );
                                        followSub = false;
                                        subIdeaOpen.data.amountFollowers =
                                            subIdeaOpen?.data.amountFollowers -
                                            1;
                                    }}>Unfollow</button
                                >
                            {:else}
                                <button
                                    on:click={closeModal}
                                    class="fundButton"
                                    style="background-color: white; color:black; display: block; margin-left: auto; margin-right: auto;"
                                    on:click={async () => {
                                        await follow(
                                            $info.key,
                                            subIdeaOpen?.key || "",
                                            "subideas"
                                        );
                                        followSub = true;
                                        subIdeaOpen.data.amountFollowers =
                                            subIdeaOpen?.data.amountFollowers +
                                            1;
                                    }}>Follow 👍</button
                                >
                            {/if}
                        </div>

                        <!-- Second Column -->
                        <div class="info-column">
                            <!-- First Row -->
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
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    </div>
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
                class="placeholder animate-pulse"
                style="margin: 5%; width: 90%; height: 15em;"
            />
        </div>
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
        width: 1.5cm;
        height: 1.5cm;
        border-radius: 50%;
        background-size: cover;
        border-color: orangered;
        border-width: 2px;
        box-shadow: 0px 0px 15px rgba(247, 4, 255, 0.5); /* horizontal, vertical, blur, color */
        /* background-position-x: ; */
    }
    .creatorClass {
        display: flex;
        align-items: center; /* Vertical alignment */
        gap: 14px;
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

    .progress-bar {
        background-color: #e0e0e0;
        height: 20px;
        border-radius: 10px;
    }

    .progress-fill {
        background-color: #007bff; /* Choose your desired color */
        height: 100%;
        border-radius: 10px;
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
