<script>
    import { onMount } from "svelte";
    import {
        check_new_notifications,
        get_user_notifications,
    } from "$lib/data_functions/docu.functions";
    import { createNotification } from "$lib/data_objects/data_objects";
    import { howLongAgo } from "$lib/other_functions/other.functions";
    import MagicalDots from "$lib/components/magicalDots.svelte";
    import { basicInfo } from "$lib/stores/auth.state";
    import Loading from "$lib/components/loading.svelte";

    /** @type {import('./$types').PageData} */
    // @ts-ignore
    export let data;
    let newNotis = 1;
    let notisLoading = false;
    let backgroundcolor = "transparent";
    let color = "azure";
    let advancedDate = {
        day: 0,
        month: 0,
        year: 2023,
        hour: 0,
        minutes: 0,
        seconds: 0,
    };
    let notification = {
        link: "https://svftd-daaaa-aaaal-adr3a-cai.icp0.io/",
        seen: false,
        picture:
            "https://i.pinimg.com/474x/05/c3/59/05c359cd010df3e7f1ea3cb6f6f54fad.jpg",
        createBy: "Erik_Jung",
        subject: "Erik_Jung has followed you",
        body: "You have earned a new follower!",
        /**
         * @type {advancedDate} date
         */
        date: advancedDate,
        elementName: "",
    };
    //let notification = createNotification();
    /**
     * @type {notification[]} userNotifications
     */
    $: userNotifications = [
        notification,
        notification,
        notification,
        notification,
        notification,
        notification,
    ];

    onMount(async () => {
        // @ts-ignore
        // await basicInfo();
        // check_new_notifications();
        // await loadNotifications();
    });
    async function loadNotifications() {
        if (userNotifications.length == 0) {
            notisLoading = true;
        }
        userNotifications = await get_user_notifications();
        notisLoading = false;
    }
</script>

<br />
<div class="notificationBlock">
    <div class="notification-dropdown">
        {#if notisLoading}
            <div style="margin-bottom: 30px;">
                <Loading />
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
                                "https://svftd-daaaa-aaaal-adr3a-cai.icp0.io/";
                        }}
                    >
                        <div>
                            <div class="notiColumns">
                                <div class="profilePicture">
                                    <img src={notification.picture} alt="" />
                                </div>

                                <div style="width: 100%;">
                                    <p style="font-weight:700;">
                                        {notification.elementName}
                                    </p>
                                    <p>
                                        {notification.subject}
                                    </p>
                                    {#if notification.body != ""}
                                        <p style="font-style: italic;">
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
                                    howLongAgo(notification.date).timeframe}
                                ago
                            </p>
                        </div>
                    </button>
                {/each}
            {/if}
            <div style="height: 0.3cm;" />
            <div
                style="display: flex; align-items:center; justify-content:center;"
            />
        {/if}
    </div>
</div>

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
        max-width: 100%;
    }
    .horizontalLine {
        width: 80%;
        border-color: rgba(240, 248, 255, 0.149);
        border-width: 0.2px;
    }

    .notificationBlock {
    }

    .notification-dropdown {
        width: 50%;
        margin-left: auto;
        margin-right: auto;
        overflow-y: auto;
        overflow-x: hidden;
        margin-top: 10px;

        z-index: 0; /* Place it above other content (e.g., z-index: 1) */
        padding-bottom: 5px;

        max-height: fit-content;
        padding: 10px;
        border-radius: 3px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .notification {
        width: 100%;
        display: flex;
        justify-content: start;
        align-items: start;
        text-align: left;
        font-size: medium;
        padding-left: 10px;
        padding-right: 10px;
        padding-top: 5px;
        padding-bottom: 5px;
        border: 1px solid var(--secondary-color);
        background-color: var(--tertiary-color);
        cursor: pointer;
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
        margin-top: 10px;
        margin-bottom: 25px;
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
    }
    .menuItem:active {
        color: antiquewhite;
        background-color: rgba(255, 255, 255, 0.2);
    }
</style>
