<script>
    import Header from "$lib/components/header.svelte";
    import Loading from "$lib/components/loading.svelte";
    import Modal from "$lib/components/modal.svelte";
    import {
        ICPtoDecimal,
        getDocu,
        getWalletAddress,
        updateData,
        usernameExists,
    } from "$lib/data_functions/docu.functions";
    import { createUser } from "$lib/data_objects/data_objects";
    import { onMount } from "svelte";
    import { clipboard } from "@skeletonlabs/skeleton";
    import { basicInfo, info } from "$lib/stores/auth.state";
    import Layout from "../+layout.svelte";
    /** @type {import('./$types').PageData} */
    // @ts-ignore
    export let data;
    let address = "aaaaa-bbbbbbb-cccccc-dddddd";
    let userLoading = false;
    let editPicture = false;
    let currencies = ["ICP"];
    let msg = "User data loading";
    let userData = createUser();
    let changeUserName = false;
    /**
     * @type {import("@junobuild/core").Doc<any> | null | undefined}
     */
    let myUserDoc = null;
    let amountTokens = 0;
    /**
     * @type {string[]}
     */
    onMount(async () => {
        debugger;
        userLoading = true;
        myUserDoc = await getDocu("users", data.id || "");
        userData = myUserDoc?.data;
        await basicInfo();
        // @ts-ignore
        amountTokens = ICPtoDecimal($info.userBalance).toFixed(3);
        // @ts-ignore
        address = await getWalletAddress(data.id || "");
        userLoading = false;
    });
    async function changeProfilePicture() {
        editPicture = false;
        // @ts-ignore
        myUserDoc.data = userData;
        msg = "Updating profile picture";
        userLoading = true;

        await updateData(myUserDoc, "users", data.id || "");
        userLoading = false;
        window.location.reload();
    }
    let nicknameError = "";
    async function changeNickname() {
        let exists = await usernameExists(userData.nickname);
        if (exists == true) {
            nicknameError = "username already taken";
        } else {
            nicknameError = "";
            changeUserName = false;
            // @ts-ignore
            myUserDoc.data = userData;
            msg = "Updating username";
            userLoading = true;

            await updateData(myUserDoc, "users", data.id || "");
            userLoading = false;
            window.location.reload();
        }
    }
</script>

{#if userLoading}
    <Loading {msg} />
{:else}
    <div class="body">
        <div class="content">
            <div class="leftImage">
                <div class="profilePicture">
                    <img
                        src={userData.picture ||
                            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                        alt=""
                    />
                </div>
                <br />
                <button
                    class="fundButton"
                    on:click={() => {
                        editPicture = true;
                    }}>Change profile picture</button
                >
            </div>

            <br />

            <p style="font-size:larger;">
                User key: <span style="font-size:medium;">{data.id}</span>
            </p>
            <div style="height: 0.1cm;" />
            {#if changeUserName}
                <p style="font-size:larger;">
                    Username: <input
                        type="text"
                        style="width: 70%; border-color:black; border-width:1px; padding-left:5px;padding-right:5px;
                        color:darkslategray; font-size:medium;"
                        bind:value={userData.nickname}
                    />
                </p>
                <p style="font-style: italic; color:red;">{nicknameError}</p>
                <button
                    class="textButton"
                    on:click={async () => {
                        await changeNickname();
                    }}>Save</button
                >
                <button
                    class="textButton"
                    on:click={async () => {
                        changeUserName = false;
                    }}>Cancel</button
                >
            {:else}
                <p style="font-size:larger;">
                    Username: <span style="font-size:medium;"
                        >{userData.nickname || "- None -"}</span
                    >
                </p>

                <button
                    class="textButton"
                    on:click={() => {
                        changeUserName = true;
                    }}>Change username</button
                >
            {/if}
            <br />
            <br />
            <div class="followersInfo">
                <div class="centeredImage">
                    <p>{userData.followers.length}</p>
                    <p>followers</p>
                </div>
                <div class="verticalLine" />
                <div class="centeredImage">
                    <p>{userData.followedIdeas.length}</p>
                    <p>followed</p>
                </div>
                <div class="verticalLine" />
                <div class="centeredImage">
                    <p>{userData.pledged} USD</p>
                    <p>pledged</p>
                </div>
            </div>
            <br />

            <div class="walletSection">
                <h1 style="text-align: left;">Your Solutio wallet:</h1>
                <br />
                <div class="wallet">
                    <div class="horizontalBar" />
                    <div
                        class="walletInfo"
                        style="color:darkslategray; align-self:flex-start; margin-top:10px;"
                    >
                        <p>Right now, you have:</p>
                        <div style="height: 0.2cm;" />
                        <div class="balanceSection">
                            <div class="balance">
                                <p>{amountTokens}</p>
                            </div>

                            <select
                                style="background-color:#ff6200; color:antiquewhite; border-color:black; border-width:1px;"
                            >
                                {#each currencies as curr}
                                    <option value="">
                                        {curr}
                                    </option>
                                {/each}
                            </select>
                        </div>
                        <div style="height: 0.3cm;" />
                        <p style="text-align:justify">
                            To be able to fund projects, you will need to send
                            some tokens to your solutio crypto wallet. If you
                            wish to send some tokens, send some to the following
                            address:
                        </p>
                        {#if window.innerWidth < 500}
                            <div
                                data-clipboard="exampleElement"
                                style="color:darkslategray; display:flex; justify-content:center;
                             text-decoration:underline; max-width:100%; line-height:1.1; white-space: nowrap;
                             overflow: hidden; text-overflow: ellipsis;
                             "
                            >
                                {address}
                            </div>
                        {:else}
                            <div
                                data-clipboard="exampleElement"
                                style="color:darkslategray; display:flex; justify-content:center;
                             text-decoration:underline;"
                            >
                                {address}
                            </div>
                        {/if}
                        <div style="height: 0.3cm;" />
                        <div style="display:flex; justify-content:center;">
                            <button
                                use:clipboard={{
                                    element: "exampleElement",
                                }}
                                class="btn variant-filled"
                                style="border-radius: 0px; padding:5px;
                            padding-left:10px;
                            padding-right:10px;
                            
                            ">Copy address</button
                            >
                        </div>
                        <div style="height: 0.3cm;" />
                        <p>
                            This address belongs to you, not to Solutio or
                            anyone else. It was created when you signed in with
                            your internet identity.
                        </p>
                    </div>
                </div>
            </div>
            <div style="height: 3cm;" />
        </div>
    </div>

    <Modal
        bind:isOpen7={editPicture}
        close={() => {
            editPicture = false;
        }}
    >
        <br />
        <div class="centeredImage">
            <div class="profilePicture">
                <img
                    src={userData.picture ||
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                    alt=""
                />
            </div>
        </div>

        <br />
        <p>Place your image URL here:</p>

        <input
            type="text"
            bind:value={userData.picture}
            style="width: 100%; border-color:black; border-width:1px; padding:5px;"
        />

        <br />
        <br />
        <button
            class="fundButton"
            on:click={() => {
                changeProfilePicture();
            }}>Save</button
        >
    </Modal>
{/if}

<style>
    .body {
        display: flex;
        justify-content: center;
        align-items: flex-start; /* aligns items at the top */
        width: 100%;

        min-height: 100vh;
        z-index: 0;
    }

    .horizontalBar {
        height: 100%;
        width: 8%;
        background: linear-gradient(to bottom, #b34500, #ff6200, #b34500);
    }
    .walletSection {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
    }
    .textButton {
        text-decoration: underline;
    }
    .wallet {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        box-shadow: 10px 10px 0px rgba(0, 0, 0, 0.7);
        width: 100%;
        margin: auto;
        height: 8.7cm;
        overflow: hidden;
        border: 2px solid black;
        background-color: white;
        gap: 2%;
        padding-right: 10px;
    }
    .balanceSection {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        max-width: fit-content;
        font-size: large;
        gap: 4%;
    }
    .balance {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: xx-large;
        font-weight: 900;
        margin: auto;
        box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.7);
        margin-top: 5px;
        width: 3cm;
        height: 1.5cm;
        overflow: hidden;
        border: 1px solid black;
        background-color: white;
        gap: 2%;
    }
    .textButton:hover {
        text-decoration: none;
        padding-left: 5px;
        padding-right: 5px;
        background-color: rgba(255, 255, 255, 0.2);
    }
    .centeredImage {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    .leftImage {
        display: flex;
        align-self: flex-start;
        align-items: end;
        gap: 10px;
    }
    .verticalLine {
        height: 2cm;
        border-color: antiquewhite;
        border-width: 1px;
    }
    .content {
        width: 80%;
        max-width: 800px;
        text-align: left; /* aligns the text to the left */
        height: 12cm;
        margin: 20px auto 0 auto; /* top margin creates space from the top */
        z-index: 0;
    }
    .followersInfo {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 40px;
    }
    .profilePicture {
        width: 5cm;
        height: 5cm;
        overflow: hidden;
        border: 1px solid black;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 10px 10px 0px rgba(0, 0, 0, 0.7);
    }

    .profilePicture img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .fundButton {
        width: 25%;
        height: 50px;
        /* background: linear-gradient(to right, rgb(255, 0, 0), orangered); */
        background-color: #ff6000;
        color: antiquewhite;
        border-style: groove;
        border-color: black;
        border-width: 1px;
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        font-size: large;
        font-weight: 330;
        box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.2); /* horizontal, vertical, blur, color */

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
    .walletInfo {
        color: darkslategray;
        align-self: flex-start;
        margin-top: 10px;
    }
    @media (max-width: 768px) {
        .content {
            width: 95%;
        }
        .fundButton {
            width: fit-content;
        }
        .wallet {
            height: fit-content;
        }
        .walletInfo {
            max-width: 100%;
            padding-left: 5px;
            padding-right: 5px;
            padding-bottom: 10px;
        }
    }
</style>
