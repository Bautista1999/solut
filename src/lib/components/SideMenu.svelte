<script>
    // @ts-ignore
    import { fade, slide } from "svelte/transition";
    // @ts-ignore
    import AboutProject from "./AboutProject.svelte";
    // @ts-ignore
    import Badges from "./Badges.svelte";
    import { goto } from "$app/navigation";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import { IsSignedIn, UserKey } from "$lib/stores/other_stores";
    import {
        getMostFollowedIdeas,
        getUserImages,
        getUserNewNotifications,
        getUserNotifications,
        getUserNotificationsWithoutUpdatingLastSeen,
        validateImageUrl,
    } from "$lib/data_functions/get_functions";

    // @ts-ignore
    import { notificationCount } from "$lib/stores/notifications";
    import AppMenuBar from "./AppMenuBar.svelte";
    // @ts-ignore
    import PledgerProfilePicture from "./PledgerProfilePicture.svelte";
    import { signOut } from "@junobuild/core";
    import NotificationPopUp from "./NotificationPopUp.svelte";
    import { onMount } from "svelte";

    let isOpen = false;

    let seconds = 0.5;

    let maxChars = 17;
    let smth = false;
    function openClose() {
        smth = !smth;
        // Update the sidebar state class
        const sidebarClass = smth ? "sidebar-open" : "sidebar-closed";
        document.body.classList.toggle("sidebar-open", smth);
        document.body.classList.toggle("sidebar-closed", !smth);
    }

    // Function to open/close sidebar and toggle event listener
    function toggleSidebar() {
        isOpen = !isOpen;
        const sidebarClass = isOpen ? "sidebar-open" : "sidebar-closed";
        document.body.classList.toggle("sidebar-open", isOpen);
        document.body.classList.toggle("sidebar-closed", !isOpen);
        // Add or remove the click-outside listener based on sidebar state
        if (isOpen) {
            document.addEventListener("click", handleClickOutside);
        } else {
            document.removeEventListener("click", handleClickOutside);
        }
    }

    // Handler for clicks outside sidebar
    /**
     * @param {any} event
     */
    function handleClickOutside(event) {
        const sidebar = document.querySelector(".SideBar");
        const toggleButton = document.querySelector(".SideBarToggle");

        // Close sidebar if the click is outside both the sidebar and toggle button
        // @ts-ignore
        if (!sidebar.contains(event.target) && event.target !== toggleButton) {
            isOpen = false;
            const sidebarClass = isOpen ? "sidebar-open" : "sidebar-closed";
            document.body.classList.toggle("sidebar-open", isOpen);
            document.body.classList.toggle("sidebar-closed", !isOpen);
            document.removeEventListener("click", handleClickOutside); // Clean up
        }
    }
    /**
     * @type {any[]}
     */
    let notifications = [];
    let notificationsPreview = false;
    let notificationsLoading = false;

    onMount(async () => {
        // Removing the initial fetch of notifications
    });

    async function fetchNotifications() {
        notificationsLoading = true;
        try {
            notifications = await getUserNewNotifications();
        } finally {
            notificationsLoading = false;
        }
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="SideBar {isOpen ? 'open' : ''}">
    {#await CheckIfSignedIn() then data}
        <div class="SideBarHead">
            <div class="SideBarElement" style="padding-left: 19px;">
                <img
                    src="/assets/LogoSol3.png"
                    alt="Solutio Logo"
                    on:click={() => goto("/")}
                />
                {#if isOpen}
                    <span
                        class="label"
                        style="overflow-x: hidden; position:absolute; "
                        in:fade={{ duration: seconds * 1000 }}
                        out:fade={{ duration: seconds * 1000 }}
                        on:click={() => goto("/")}
                    >
                        <h2>
                            SOLUTIO<span style="color: var(--primary-color);"
                                >N</span
                            >.
                        </h2>
                    </span>
                {/if}
            </div>
        </div>
        <div class="SideBarBody">
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="SideBarContent">
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div class="SideBarElement">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <a class="material-symbols-outlined" href={"/"}> home </a>
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    {#if isOpen}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <a
                            class="label"
                            in:fade={{ duration: seconds * 1000 }}
                            out:fade={{ duration: seconds * 1000 }}
                            style="overflow-x: hidden; position:absolute;"
                            href={"/"}>Home</a
                        >
                    {/if}
                </div>
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div class="SideBarElement">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <a
                        class="material-symbols-outlined"
                        href={"https://home.solutio.one/"}
                    >
                        info
                    </a>
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    {#if isOpen}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <a
                            class="label"
                            in:fade={{ duration: seconds * 1000 }}
                            out:fade={{ duration: seconds * 1000 }}
                            style="overflow-x: hidden; position:absolute;"
                            href={"https://home.solutio.one/"}
                            >About
                        </a>
                    {/if}
                </div>
                {#if $IsSignedIn}
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div class="SideBarElement">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <a
                            class="material-symbols-outlined"
                            style="cursor: pointer;"
                            href={"/notifications/" + $UserKey}
                            on:mouseenter={async () => {
                                notificationsPreview = true;
                                await fetchNotifications(); // Fetch notifications on hover
                            }}
                            on:mouseleave={() => {
                                notificationsPreview = false;
                            }}
                        >
                            notifications
                        </a>
                        <!-- {#await GetAmountNewNotifications() then data} -->
                        {#if !isOpen && $notificationCount > 0}
                            <span class="notification-bell-number"
                                >{$notificationCount}</span
                            >
                        {/if}
                        <NotificationPopUp
                            bind:show={notificationsPreview}
                            {notifications}
                            isLoading={notificationsLoading}
                        />
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        {#if isOpen}<a
                                class="label"
                                in:fade={{ duration: seconds * 1000 }}
                                out:fade={{ duration: seconds * 1000 }}
                                href={"/notifications/" + $UserKey}
                                style="

                        display: flex;
                        align-items:center;
                        width: 280px;
                        gap:15px;
                        height: 38px;
                        white-space: nowrap;  text-overflow: ellipsis; 
                        position:absolute;
                        overflow: hidden;
                        max-width: 100%;"
                                >Notifications
                                {#if $notificationCount > 0}
                                    <a
                                        style="display:flex; align-items:center; justify-content:center; align-self:center;
                             background-color:var(--primary-color); color: var(--tertiary-color); width: fit-content;
                             padding-inline:10px;
                             height: 18px;
                             flex-shrink: 0;"
                                        href={"/notifications/" + $UserKey}
                                    >
                                        {$notificationCount}
                                    </a>
                                {/if}
                            </a>
                        {/if}
                        <!-- {/await} -->
                    </div>
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div class="SideBarElement">
                        <a class="material-symbols-outlined" href={"/myideas"}>
                            emoji_objects
                        </a>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        {#if isOpen}<a
                                class="label"
                                in:fade={{ duration: seconds * 1000 }}
                                out:fade={{ duration: seconds * 1000 }}
                                style="white-space: nowrap;  text-overflow: ellipsis; 
                        display: block; 
                        max-width: 100%; position:absolute;
                        overflow: hidden; "
                                href={"/myideas"}>My ideas</a
                            >{/if}
                    </div>

                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div class="SideBarElement">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <a class="material-symbols-outlined" href={"/feed"}>
                            batch_prediction
                        </a>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        {#if isOpen}<a
                                class="label"
                                in:fade={{ duration: seconds * 1000 }}
                                out:fade={{ duration: seconds * 1000 }}
                                style="white-space: nowrap;  text-overflow: ellipsis; 
                        display: block; 
                        max-width: 100%; position:absolute;
                        overflow: hidden; "
                                href={"/feed"}>Community Feed</a
                            >{/if}
                    </div>

                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div class="SideBarElement">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <a
                            class="material-symbols-outlined"
                            href={`/signin`}
                            on:click={async () => {
                                await signOut();
                                location.reload();
                            }}
                        >
                            logout
                        </a>
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        {#if isOpen}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <a
                                class="label"
                                in:fade={{ duration: seconds * 1000 }}
                                out:fade={{ duration: seconds * 1000 }}
                                href={`/signin`}
                                on:click={async () => {
                                    await signOut();
                                    location.reload();
                                }}
                                style="white-space: nowrap;  text-overflow: ellipsis; 
                                display: block; 
                                max-width: 100%; position:absolute;
                                overflow: hidden; 
                                font-style: normal;
                                line-height: 16px;
                                "
                                >Sign out
                            </a>
                        {/if}
                    </div>
                {:else}
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div class="SideBarElement">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <a class="material-symbols-outlined" href={"/signin"}>
                            login
                        </a>
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        {#if isOpen}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <a
                                class="label"
                                in:fade={{ duration: seconds * 1000 }}
                                out:fade={{ duration: seconds * 1000 }}
                                href={"/signin"}
                                style="white-space: nowrap;  text-overflow: ellipsis; 
                                display: block; 
                                max-width: 100%; position:absolute;
                                overflow: hidden; 
                                font-style: normal;
                                line-height: 16px;
                                "
                                >Sign in
                            </a>
                        {/if}
                    </div>
                {/if}
                <!-- <div class="SideBarElement">
                <span class="material-symbols-outlined"> account_circle </span>
                {#if isOpen}<span
                        class="label"
                        in:fade={{ duration: seconds * 1000 }}
                        out:fade={{ duration: seconds * 1000 }}
                        style="overflow-x: hidden; position:absolute;"
                        >Account</span
                    >{/if}
            </div> -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div class="SideBarElement">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <a
                        class="material-symbols-outlined"
                        href={"https://forum.solutio.one/categories"}
                    >
                        contact_support
                    </a>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    {#if isOpen}<a
                            class="label"
                            in:fade={{ duration: seconds * 1000 }}
                            out:fade={{ duration: seconds * 1000 }}
                            style="overflow-x: hidden; position:absolute;"
                            href={"https://forum.solutio.one/categories"}
                            on:click={() =>
                                goto("https://forum.solutio.one/categories")}
                            >Forum</a
                        >{/if}
                </div>
                {#if $IsSignedIn}
                    <div class="SideBarElement" style="margin-top:25px;">
                        <span class="material-symbols-outlined"> </span>
                        {#if isOpen}
                            <span
                                class="label"
                                in:fade={{ duration: seconds * 1000 }}
                                out:fade={{ duration: seconds * 1000 }}
                                style="white-space: nowrap;  text-overflow: ellipsis; 
                                display: block; 
                                max-width: 100%; position:absolute;
                                overflow: hidden; 
                                font-size: 15px;
                                font-style: normal;
                                font-weight: 500;
                                line-height: 16px;
                                color: var(--ffffff-transparent, rgba(255, 255, 255, 0.75));
                                ">Recent topics</span
                            >
                        {/if}
                    </div>
                    {#await getMostFollowedIdeas(3) then ideas}
                        {#each ideas as idea}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <a
                                class="SideBarElement"
                                style="padding-left: 22px;"
                                href={"/" +
                                    idea.data.element_type +
                                    "/" +
                                    idea.key}
                            >
                                {#await validateImageUrl(idea.data.images[0], "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg")}
                                    <img
                                        src={"https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg"}
                                        alt="Solutio Logo"
                                        style="width: 25px; height:25px; object-fit:cover; 
                        "
                                    />
                                {:then data}
                                    <img
                                        src={data}
                                        alt="Solutio Logo"
                                        style="width: 25px; height:25px; object-fit:cover; 
                        "
                                    />
                                {/await}
                                {#if isOpen}
                                    <a
                                        class="label"
                                        in:fade={{ duration: seconds * 1000 }}
                                        out:fade={{ duration: seconds * 1000 }}
                                        style="white-space: nowrap;  text-overflow: ellipsis; 
                                            display: block; 
                                            max-width: 100%; position:absolute;
                                            overflow: hidden; "
                                        href={"/" +
                                            idea.data.element_type +
                                            "/" +
                                            idea.key}
                                        >{#if idea.data.title.length > maxChars}{idea.data.title.substring(
                                                0,
                                                maxChars,
                                            )}...{:else}{idea.data
                                                .title}{/if}</a
                                    >
                                {/if}
                            </a>
                        {/each}
                    {/await}
                {/if}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
            </div>
        </div>
        <div class="SideBarFooter">
            <div class="SideBarElement">
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <a class="material-symbols-outlined" href={"/createtopic"}>
                    add_circle
                </a>
                {#if isOpen}
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <a
                        class="label"
                        in:fade={{ duration: seconds * 1000 }}
                        out:fade={{ duration: seconds * 1000 }}
                        href={"/createtopic"}
                        style="white-space: nowrap;  text-overflow: ellipsis; 
                        display: block; 
                        max-width: 100%; position:absolute;
                        overflow: hidden; 
                        font-style: normal;
                        line-height: 16px;
                        ">Create Topic</a
                    >{/if}
            </div>
            <div class="SideBarElement" style="margin-bottom: 30px;">
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- <a
                    class="material-symbols-outlined"
                    href={$UserKey == "" ? "/signin" : "/account/" + $UserKey}
                >
                    account_circle
                </a> -->
                {#await getUserImages([$UserKey])}
                    <!-- <ProfilePictureSmall src={""} userKey={""} /> -->
                    <a
                        class="material-symbols-outlined"
                        href={$UserKey == ""
                            ? "/signin"
                            : "/profile/" + $UserKey}
                    >
                        account_circle
                    </a>
                {:then data}
                    {#if data.length > 0}
                        <a
                            class="image-container"
                            style="width: fit-content;position:absolute;"
                            href={$UserKey == ""
                                ? "/signin"
                                : "/profile/" + $UserKey}
                        >
                            <PledgerProfilePicture
                                image={data[0].image}
                                index="1"
                            />
                            <!-- <ProfilePictureHeader
                                src={data[0].image}
                                userKey={data[0].key}
                            /> -->
                        </a>
                    {:else}
                        <a
                            class="material-symbols-outlined"
                            href={$UserKey == ""
                                ? "/signin"
                                : "/profile/" + $UserKey}
                        >
                            account_circle
                        </a>
                    {/if}
                {/await}
                {#if isOpen}
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <a
                        class="label"
                        in:fade={{ duration: seconds * 1000 }}
                        out:fade={{ duration: seconds * 1000 }}
                        style="overflow-x: hidden; position:absolute;"
                        href={$UserKey == ""
                            ? "/signin"
                            : "/profile/" + $UserKey}>Account</a
                    >{/if}
            </div>
        </div>
    {/await}
</div>

<span
    class="material-symbols-outlined SideBarToggle"
    style=""
    on:click={() => {
        toggleSidebar();
    }}
>
    {#if isOpen}chevron_left{:else}chevron_right{/if}
</span>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<div class="AppMenuBar">
    <AppMenuBar />
</div>

<style>
    .image-container {
        border-radius: 50%; /* Make images round */

        overflow: hidden; /* Hide overflow to maintain the circular shape */
        width: 25px; /* Width of the images */
        max-width: 25px; /* Width of the images */
        height: 25px; /* Height of the images */
        left: 24px;
        border: 2px solid var(--primary-color);
        cursor: pointer;
        transition:
            border-color 0.3s ease,
            width 0.1s ease,
            height 0.1s ease;
    }
    .SideBarToggle {
        position: absolute;
        z-index: 5000; /* Ensure it's above the sidebar */
        top: 70%;
        max-width: 35px;
        transition:
            left 0.5s ease,
            color 0.3s ease,
            background-color 0.3s ease;
        cursor: pointer;
        background-color: var(--seventh-color);
        border-radius: 50%;
        padding: 2px;
        font-size: 35px !important;
        color: var(--primary-color);
        border: 2px solid var(--primary-color);
        overflow: hidden;
        position: fixed; /* Fixed position */
        left: 53px;
    }
    .SideBarToggle:hover {
        background-color: var(--secondary-color);
        color: var(--primary-color) !important;
    }

    /* Sidebar open state */
    :global(.sidebar-open) .SideBarToggle {
        left: 195px; /* Adjust for sidebar width */
    }

    /* Sidebar closed state */
    :global(.sidebar-closed) .SideBarToggle {
        left: 53px; /* Adjust for sidebar width */
    }

    .recentIdeas {
        background-color: transparent;
        display: flex;
        width: 300px;
        height: 188px;
        padding: 0px 10px 1px 10px;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
    }
    .notification-bell-number {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        background-color: var(--primary-color);
        color: var(--tertiary-color);
        /* border: 1px solid var(--tertiary-color); */
        border-radius: 400px;
        visibility: visible;
        transform: translateX(8px) translateY(-10px);
        z-index: 200;
        height: 20px;
        min-width: 20px;
        padding: 2px;
    }
    .SideBar {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 0fr 0fr 0fr;
        gap: 0px 0px;
        grid-template-areas:
            "SideBarHead"
            "SideBarBody"
            "SideBarFooter";
        grid-area: Sidebar;
        /* border-right: 2px solid var(--primary-color); */
        background-color: black;
        position: fixed; /* Fixed position */
        top: 0; /* Align to the top */
        left: 0; /* Align to the left */
        width: 78px; /* Set the width of the sidebar */

        height: 100%; /* Full height */
        overflow-y: hidden; /* Enable scroll if content is taller than the screen */
        display: flex;
        flex-direction: column; /* Stack children vertically */
        justify-content: space-between; /* Distribute space between the elements */
        color: var(--tertiary-color);
        transition: width 0.5s ease;
        gap: 10px;
        z-index: 3000;
        overflow-x: visible;
    }

    .SideBar.open {
        width: 220px; /* width of the opened sidebar */
        background-color: black;
        position: fixed; /* Fixed position */
        top: 0; /* Align to the top */
        left: 0; /* Align to the left */
        height: 100%; /* Full height */
        /* overflow-y: auto; Enable scroll if content is taller than the screen */
        overflow: hidden;
        color: var(--tertiary-color);
    }
    .SideBarContent {
        height: fit-content;
        /* overflow-y: auto; */
        display: flex;
        justify-content: start;
        align-items: left;
        overflow-x: hidden;
        flex-direction: column;

        padding: 11px 0px;
        gap: 20px;
    }
    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 48;
        cursor: pointer;
        font-size: 21px;
        font-style: normal;
    }
    .material-symbols-outlined:hover {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 48;
        cursor: pointer;
        color: var(--primary-color);
    }
    .SideBarElement {
        display: flex;
        justify-content: start;
        align-items: center;
        flex-direction: row;
        font-size: 16px;
        font-style: normal;
        font-weight: 700;
        line-height: 24px;
        overflow-x: hidden;
        padding: 7.5px 170px 6.5px 27px;
    }

    .label {
        opacity: 0;
        transition: opacity 2s ease; /* Delay visibility transition so it doesn't cut off early */
        margin-left: 40px;
        overflow: hidden;
        position: fixed;
        cursor: pointer;
    }
    .label:hover {
        color: var(--primary-color);
    }
    .SideBar.open .label {
        opacity: 1;
        overflow: hidden;
        transition: opacity 2s ease;
    }

    .SideBarHead {
        grid-area: SideBarHead;
        height: fit-content;
        display: flex;
        justify-content: left;
        align-items: center;
        gap: 20px;
        padding-top: 20px;
        overflow: hidden;
    }
    .SideBarHead img {
        width: 35px; /* Set a fixed width */
        height: 35px; /* Set a fixed height */
        object-fit: contain; /* Image will maintain its aspect ratio */
    }
    .SideBarBody {
        grid-area: SideBarBody;
        overflow: hidden;
    }
    .SideBarFooter {
        grid-area: SideBarFooter;
        overflow: hidden;
        padding: 11px 0px;
        gap: 20px;
        height: fit-content;
        display: flex;
        flex-direction: column;

        margin-top: auto;
    }
    .AppMenuBar {
        display: none;
        height: 0px;
        width: 0px;
        margin: 0px;
    }
    a {
        text-decoration: none;
        color: var(--tertiary-color);
    }
    a:hover {
        color: var(--primary-color);
    }

    @media (max-width: 480px) {
        .SideBarElement,
        .SideBar {
            display: none;
        }
        .notification-bell-number {
            display: none;
        }
        .AppMenuBar {
            display: block;
        }
        .SideBarToggle {
            display: none;
        }
    }
</style>
