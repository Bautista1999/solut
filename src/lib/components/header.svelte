<script>
    import { TabGroup, Tab, TabAnchor } from "@skeletonlabs/skeleton";
    import { page } from "$app/stores";
    import { LightSwitch } from "@skeletonlabs/skeleton";
    import { signedIn } from "$lib/stores/auth.state";
    import { afterUpdate, onMount } from "svelte";
    import { signIn, signOut } from "@junobuild/core";
    import { loginedIn } from "$lib/stores/loading";
    import { createNotification } from "$lib/data_objects/data_objects";
    let signed = false;
    export let profilePicture =
        "https://www.shareicon.net/data/2015/12/09/685026_arrow_512x512.png";
    onMount(async () => {
        signed = await signedIn();
        if (signed) {
            loginedIn.set(true);
        }
    });

    async function signOutPopUp() {
        await signOut();
        loginedIn.set(false);
        window.location.reload();
    }
    async function signInPopUp() {
        await signIn();
        loginedIn.set(true);
        window.location.reload();
    }

    let isDropdownOpen = false;
    let notification1 = createNotification();
    let today = new Date();
    let currentDay = today.getDate();
    let currentMonth = today.getMonth() + 1;

    let currentYear = today.getFullYear();
    notification1 = {
        link: "xh6qb-uyaaa-aaaal-acuaq-cai.icp0.io/homepage",
        seen: false,
        picture:
            "https://beebom.com/wp-content/uploads/2022/02/Featured.jpg?w=750&quality=75",
        createBy: "aaaaaa-bbbbb-ccccc-ddddd-eeeee",
        subject:
            notification1.createBy +
            " has posted a new update on the project FitnessGo.",
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
    let notifications = [
        notification1,
        notification1,
        // Add more notifications here
    ];
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
</script>

<header>
    <!-- <TabGroup class="text-2xl px-10 py-5" style="font-family:Barlow;">
        <TabAnchor
            href="/homepage"
            selected={$page.url.pathname === "/homepage"}>Home</TabAnchor
        >
        <TabAnchor href="/about" selected={$page.url.pathname === "/about"}
            >About</TabAnchor
        >
        <TabAnchor href="/about" selected={$page.url.pathname === "/about"}
            >Profile</TabAnchor
        >
        <TabAnchor href="/about" selected={$page.url.pathname === "/about"}
            >Feed</TabAnchor
        >
        <TabAnchor
            href="/billetera"
            selected={$page.url.pathname === "/billetera"}>Wallet</TabAnchor
        >
        <TabAnchor href="/about" selected={$page.url.pathname === "/about"}
            >Contact</TabAnchor
        >

        <TabAnchor href="/create" selected={$page.url.pathname === "/create"}>
            <div><button> Create</button></div>
        </TabAnchor>
        <TabAnchor>
            <LightSwitch />
        </TabAnchor>
        {#if $loginedIn}
            <!-- svelte-ignore a11y-missing-attribute -->
    <!-- <button on:click={() => signOutPopUp()}>
                <img class="profile" src={profilePicture} /></button
            >
        {:else}
            <!-- svelte-ignore a11y-missing-attribute -->
    <!-- <button on:click={() => signInPopUp()}> Sign in</button>
        {/if} -->
    <!-- </TabGroup> -->
</header>
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
                goToIdea("billetera");
            }}
        >
            Wallet
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

    <div class="notificationBlock">
        <button
            class="tabNoti"
            style="background-color: {backgroundcolor}; color:{color};"
            on:click={() => {
                toggleDropdown();
            }}>Notifications</button
        >
        {#if isDropdownOpen}
            <div class="notification-dropdown">
                {#each notifications as notification}
                    <button class="notification">{notification.subject}</button>
                {/each}
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
            </div>
        {/if}
    </div>
    <div class="tabClosed">
        <button
            on:click={() => {
                goToIdea("profile");
            }}
        >
            Profile
        </button>
    </div>
    {#if $loginedIn}
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

<style>
    .profile {
        height: auto;
        margin: 5px;
        width: 1.2cm;
        margin-right: 0px;
    }
    .horizontalLine {
        width: 80%;
        border-color: rgba(240, 248, 255, 0.149);
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
        margin-top: 10px;
        color: darkslategrey;
        border-color: black;
        border-width: 2px;
        z-index: 2; /* Place it above other content (e.g., z-index: 1) */
        padding-bottom: 5px;
        box-shadow: 8px 8px 0px rgba(0, 0, 0, 1);
        max-height: 40vh;
        padding: 10px;
        border-radius: 3px;
    }

    .notification {
        width: 5cm;
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        padding-left: 10px;
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
        transition: transform 0.3s ease, box-shadow 0.3s ease;
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
</style>
