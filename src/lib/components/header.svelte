<script>
    import { basicInfo, info, initDB, signedIn } from "$lib/stores/auth.state";
    import { afterUpdate, beforeUpdate, onDestroy, onMount } from "svelte";
    import { signIn, signOut } from "@junobuild/core";
    import { amountNotis, loginedIn } from "$lib/stores/other_stores";
    import { createNotification } from "$lib/data_objects/data_objects";
    import { howLongAgo } from "$lib/other_functions/other.functions";
    import {
        check_new_notifications,
        get_user_notifications,
    } from "$lib/data_functions/docu.functions";
    import MagicalDots from "./magicalDots.svelte";
    export let profilePicture =
        "https://www.shareicon.net/data/2015/12/09/685026_arrow_512x512.png";
    let notification = createNotification();
    /**
     * @type {notification[]} userNotifications
     */
    $: userNotifications = [];
    let notisLoading = false;
    $: newNotis = $amountNotis;

    onMount(async () => {
        await initDB();
        await basicInfo();
        // @ts-ignore
        check_new_notifications();
    });

    async function signOutPopUp() {
        await signOut();
        loginedIn.set(false);

        goToIdea("homepage");
    }
    async function signInPopUp() {
        await signIn();
        loginedIn.set(true);
        window.location.reload();
    }

    let isDropdownOpen = false;

    let today = new Date();
    let menuOpen = false;
    let currentDay = today.getDate();
    let currentMonth = today.getMonth() + 1;

    let currentYear = today.getFullYear();
    notification = {
        link: "xh6qb-uyaaa-aaaal-acuaq-cai.icp0.io/homepage",
        seen: false,
        picture:
            "https://cdn1.vectorstock.com/i/1000x1000/10/95/cute-young-man-avatar-character-cartoon-style-vector-36081095.jpg",
        createBy: "aaaaaa-bbbbb-ccccc-ddddd-eeeee",
        subject: "New update on the project FitnessGo.",
        body: "Hey guys! Been working really hard this last couple of weeks. The team is thrilled to anounce the creation of new buttons.",

        date: {
            day: today.getDate(),
            month: today.getMonth() + 1,
            year: today.getFullYear(),
            hour: today.getHours(),
            minutes: today.getMinutes(),
            seconds: today.getSeconds(),
        },
        elementName: "FitnessGo",
    };
    let backgroundcolor = "transparent";
    let color = "azure";
    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
        if (backgroundcolor == "transparent") {
            backgroundcolor = "rgba(255, 255, 255, 0.100)";
            color = "azure";
        } else {
            backgroundcolor = "transparent";
            color = "azure";
        }
    }
    /**
     * @param {string} where
     */
    function goToIdea(where) {
        window.location.href = "/" + where;
    }
    async function loadNotifications() {
        if (!isDropdownOpen) {
            amountNotis.set(0);
            return;
        }
        if (loginedIn) {
            if (userNotifications.length == 0) {
                notisLoading = true;
            }
            userNotifications = await get_user_notifications();
            notisLoading = false;
        }
    }
    let index = 0;
</script>

{#if window.innerWidth < 720}
    <div
        style="display:flex; flex-direction:column; flex-start; align-items:flex-start;
        margin-left:10px;
        margin-top:10px;
        "
    >
        {#if menuOpen}
            <div class="menu-dropdown">
                <button
                    class="menuItem"
                    on:click={() => {
                        goToIdea("homepage");
                    }}
                >
                    Home
                </button>
                <button
                    class="menuItem"
                    on:click={() => {
                        goToIdea("create");
                    }}
                >
                    Create
                </button>
                {#if $loginedIn}
                    <button
                        class="menuItem"
                        on:click={() => {
                            goToIdea("notifications?id=" + $info.key);
                        }}
                    >
                        Notifications
                    </button>
                    <button
                        class="menuItem"
                        on:click={() => {
                            goToIdea("profile?id=" + $info.key);
                        }}
                    >
                        Profile
                    </button>

                    <button
                        class="menuItem"
                        on:click={() => {
                            signOutPopUp();
                        }}
                    >
                        Sign out
                    </button>
                {:else}
                    <button
                        class="menuItem"
                        on:click={() => {
                            signInPopUp();
                        }}
                    >
                        Sign in
                    </button>
                {/if}
                <div style="height: 0.2cm;" />
                <button
                    on:click={() => {
                        menuOpen = !menuOpen;
                    }}
                    class=" menuItem"
                    style="font-size: large; padding-top:0px; 
                    padding-bottom:0px; padding-left:10px;padding-right:10px;
                    border-color:alicewhite;
                    border-width:0.5px;
                    color:antiquewhite;
                    width:fit-content;
                    margin-left:auto;
                    margin-right:auto;"
                >
                    close
                </button>
            </div>
        {:else}
            <div class="menuLogo">
                <div
                    class="profilePicture"
                    style="width: 1cm;
            height: 1cm;
            border: 0px solid black;
           
            "
                    on:click={() => {
                        menuOpen = !menuOpen;
                    }}
                >
                    <img src="/assets/menuLogo.png" alt="" />
                </div>
            </div>
        {/if}
    </div>
    <div style="height: 0.5cm;" />
{:else}
    <header>
        <div class="tabClosed">
            <button
                on:click={() => {
                    goToIdea("homepage");
                }}
            >
                Home
            </button>
        </div>

        <div class="tabClosed">
            <button
                on:click={() => {
                    goToIdea("create");
                }}
            >
                Create
            </button>
        </div>
        {#if $loginedIn}
            <div class="notificationBlock">
                {#if newNotis == 0}
                    <button
                        class="tabNoti"
                        style="background-color: {backgroundcolor}; color:{color};"
                        on:click={async () => {
                            toggleDropdown();
                            await loadNotifications();
                        }}>Notifications</button
                    >
                {:else}
                    <div
                        style="display: flex; justify-content:center;align-items:center;"
                    >
                        <button
                            class="tabNoti"
                            style="background-color: {backgroundcolor}; color:{color};"
                            on:click={async () => {
                                toggleDropdown();
                                await loadNotifications();
                            }}>Notifications</button
                        >
                        {#if newNotis > 99}
                            <div class="newNotis">+{99}</div>
                        {:else}
                            <div class="newNotis">{newNotis}</div>
                        {/if}
                    </div>
                {/if}
                {#if isDropdownOpen}
                    <div class="notification-dropdown">
                        {#if notisLoading}
                            <div style="margin-bottom: 30px;">
                                <MagicalDots />
                            </div>
                        {:else}
                            {#if userNotifications.length == 0}
                                <p
                                    style="display: flex; justify-content:center; align-items:center; font-size:large;"
                                >
                                    - No notifications yet -
                                </p>
                            {:else}
                                {#each userNotifications as notification, index}
                                    <button
                                        class="notification"
                                        on:click={() => {
                                            window.location.href =
                                                notification.link;
                                        }}
                                        style="background-color: {index <
                                        newNotis
                                            ? 'antiquewhite'
                                            : ''}"
                                    >
                                        <div>
                                            <div class="notiColumns">
                                                <div class="profilePicture">
                                                    <img
                                                        src={notification.picture}
                                                        alt=""
                                                    />
                                                </div>

                                                <div style="width: 9.3cm;">
                                                    <p style="font-weight:700;">
                                                        {notification.elementName}
                                                    </p>
                                                    <p>
                                                        {notification.subject}
                                                    </p>
                                                    {#if notification.body != ""}
                                                        <p
                                                            style="font-style: italic;"
                                                        >
                                                            "{notification.body.substring(
                                                                0,
                                                                80,
                                                            )}...""
                                                        </p>
                                                    {/if}
                                                </div>
                                            </div>
                                            <p style="color: orangered;">
                                                {howLongAgo(
                                                    notification.date,
                                                ).amount.toString() +
                                                    " " +
                                                    howLongAgo(
                                                        notification.date,
                                                    ).timeframe}
                                                ago
                                            </p>
                                        </div>
                                    </button>
                                {/each}
                            {/if}
                            <div style="height: 0.3cm;" />
                            <div
                                style="display: flex; align-items:center; justify-content:center;"
                            >
                                <button
                                    on:click={() => {
                                        toggleDropdown();
                                    }}
                                    class="tabClosed"
                                    style="font-size: large; padding-top:0px;
                    padding-bottom:0px; padding-left:10px;padding-right:10px;
                    border-color:darkslategrey;
                    border-width:0.5px;
                    
                    "
                                >
                                    close
                                </button>
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
            <div class="tabClosed">
                <button
                    on:click={() => {
                        goToIdea("profile?id=" + $info.key);
                    }}
                >
                    Profile
                </button>
            </div>

            <!-- svelte-ignore a11y-missing-attribute -->
            <button class="tabClosed" on:click={() => signOutPopUp()}>
                <img class="profile" src={profilePicture} /></button
            >
        {:else}
            <!-- svelte-ignore a11y-missing-attribute -->
            <button class="tabClosed" on:click={() => signInPopUp()}>
                Sign in</button
            >
        {/if}
    </header>

    <div style="display: flex; justify-content:center; align-items:center">
        <div class="horizontalLine" />
    </div>
{/if}
<slot />

<style>
    .profile {
        height: auto;
        margin: 5px;
        width: 1.2cm;
        margin-right: 0px;
    }
    .profilePicture {
        width: 2cm;
        height: 2cm;
        overflow: hidden;
        border: 1px solid black;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .profilePicture img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .newNotis {
        width: 0.8cm;
        height: 0.8cm;
        background-color: orangered;
        color: white;
        border-color: black;
        border-width: 1px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: medium;

        border-radius: 50%;
    }
    .notiColumns {
        gap: 10px;
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        line-height: 1.1;
        max-width: 11.2cm;
    }
    .horizontalLine {
        width: 80%;
        border-color: rgb(255, 255, 255);
        border-width: 0.2px;
    }

    .notificationBlock {
        position: relative; /* Make sure it's a positioned container */
    }

    .notification-dropdown {
        position: absolute; /* Position the dropdown absolutely */
        top: 100%; /* Position below the "Notifications" button */
        left: 0; /* Align with the left edge of the button */
        background-color: white;
        width: 12.1cm;
        overflow-y: auto;
        overflow-x: hidden;
        margin-top: 10px;
        color: darkslategrey;
        border-color: black;
        border-width: 2px;
        z-index: 2; /* Place it above other content (e.g., z-index: 1) */
        padding-bottom: 5px;
        box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.5);
        max-height: 80vh;
        padding: 10px;
        border-radius: 3px;
    }

    .notification {
        width: 11.2cm;
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        text-align: left;
        font-size: medium;
        padding: 10px;
        padding-right: 10px;
        padding-top: 5px;
        padding-bottom: 5px;
    }
    .notification:hover {
        background-color: antiquewhite;
    }

    header {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: x-large;
        gap: 30px;
        height: 70px;
        background-color: #ff6000;
        background-image: linear-gradient(to right, #ff6000, #672800);
    }
    header > :last-child {
        order: 1;
    }
    .tabClosed {
        width: fit-content;
        padding: 7px;
        padding-left: 15px;
        padding-right: 15px;
        /* background: linear-gradient(to right, rgb(255, 0, 0), orangered); */

        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        font-size: x-large;
        font-weight: 330;
        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
    }
    .tabClosed:hover {
        transform: scale(
            1.08
        ); /* scales the button to 105% of its original size on hover */
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.2);
        border-width: 0.5px;
        /* background-color: rgba(255, 245, 191, 0.5); */
    }
    .tabClosed:active {
        transform: scale(
            0.98
        ); /* scales the button to 105% of its original size on hover */
        box-shadow: none;
        border-width: 0.5px;
        /* background-color: rgba(255, 245, 191, 0.5); */
    }
    .tabNoti {
        width: fit-content;
        padding: 7px;

        padding-left: 15px;
        padding-right: 15px;
        /* background: linear-gradient(to right, rgb(255, 0, 0), orangered); */

        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        font-size: x-large;
        font-weight: 330;
        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
    }
    .tabNoti:hover {
        transform: scale(
            1.08
        ); /* scales the button to 105% of its original size on hover */
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.2);
        border-width: 0.5px;
        /* background-color: rgba(255, 245, 191, 0.5); */
    }
    .tabNoti:active {
        transform: scale(
            0.98
        ); /* scales the button to 105% of its original size on hover */
        box-shadow: none;
        border-width: 0.5px;
        /* background-color: rgba(255, 245, 191, 0.5); */
    }
    .menuLogo {
        background-color: black;
        position: absolute;
        width: 1.5cm;
        height: 1.5cm;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.5);
        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        z-index: 2;
    }
    .menuLogo:hover {
        transform: scale(
            1.08
        ); /* scales the button to 105% of its original size on hover */
    }
    .menuLogo:active {
        transform: scale(
            0.98
        ); /* scales the button to 105% of its original size on hover */
        box-shadow: none;
        /* background-color: rgba(255, 245, 191, 0.5); */
    }
    .menu-dropdown {
        background-color: darkslategrey;
        position: absolute;
        flex-direction: column;
        display: flex;
        font-size: 150%;
        gap: 10px;
        color: orangered;
        align-items: flex-start;
        justify-content: flex-start;
        width: 80%;
        height: fit-content;
        overflow-y: auto;
        overflow-x: hidden;
        margin-top: 10px;
        color: darkslategrey;
        z-index: 2; /* Place it above other content (e.g., z-index: 1) */
        padding-bottom: 5px;
        box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.5);
        max-height: 80vh;
        padding: 10px;
        border-radius: 3px;
    }
    .menuItem {
        color: antiquewhite;
        width: 100%;
        z-index: 2;
    }
    .menuItem:active {
        color: antiquewhite;
        background-color: rgba(255, 255, 255, 0.2);
    }
</style>
