<script>
    import { fade, slide } from "svelte/transition";
    import AboutProject from "./AboutProject.svelte";
    import Badges from "./Badges.svelte";
    import { goto } from "$app/navigation";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import { IsSignedIn, UserKey } from "$lib/stores/other_stores";
    import { getMostFollowedIdeas } from "$lib/data_functions/get_functions";
    import { path } from "$lib/stores/redirect_store";
    import { GetAmountNewNotifications } from "$lib/data_functions/notifications";
    import { notificationCount } from "$lib/stores/notifications";
    import AppMenuBar from "./AppMenuBar.svelte";
    let isOpen = false;

    function toggleSidebar() {
        isOpen = !isOpen;
    }
    let seconds = 0.5;
    let idea1 = {
        title: "Solutio, the decentralized idea incubator",
        image: "/assets/LogoSol3.png",
    };
    let idea2 = {
        title: "ICRC-7: A new standard for the ICP ecosystem",
        image: "https://opengraph.githubassets.com/7c70681dfb31fc0b7a7e9e27a9936dab6e43c9e318ecca3b65e7ee49392e23bb/dfinity/ICRC/issues/7",
    };
    let idea3 = {
        title: "New DEX:  A new decentralized exchange in the ecosystem ICP",
        image: "https://cryptoadventure.com/wp-content/uploads/2022/01/Decentralized-Exchanges-2022-Which-is-the-Best-Crypto-DEX-to-Trade-on.jpg",
    };
    let ideas = [idea1, idea2, idea3];

    let maxChars = 17;
</script>

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
            <div class="SideBarContent">
                <div class="SideBarElement">
                    <span
                        class="material-symbols-outlined"
                        on:click={() => goto("/")}
                    >
                        home
                    </span>
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    {#if isOpen}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <span
                            class="label"
                            in:fade={{ duration: seconds * 1000 }}
                            out:fade={{ duration: seconds * 1000 }}
                            style="overflow-x: hidden; position:absolute;"
                            on:click={() => goto("/")}>Home</span
                        >
                    {/if}
                </div>
                {#if $IsSignedIn}
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div class="SideBarElement">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <span
                            class="material-symbols-outlined"
                            on:click={() => goto("/notifications/" + $UserKey)}
                        >
                            notifications
                        </span>
                        <!-- {#await GetAmountNewNotifications() then data} -->
                        {#if !isOpen && $notificationCount > 0}
                            <span class="notification-bell-number"
                                >{$notificationCount}</span
                            >
                        {/if}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        {#if isOpen}<span
                                class="label"
                                in:fade={{ duration: seconds * 1000 }}
                                out:fade={{ duration: seconds * 1000 }}
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
                                on:click={() =>
                                    goto("/notifications/" + $UserKey)}
                                >Notifications
                                {#if $notificationCount > 0}
                                    <span
                                        style="display:flex; align-items:center; justify-content:center; align-self:center;
                             background-color:var(--primary-color); color: var(--tertiary-color); width: fit-content;
                             padding-inline:10px;
                             height: 18px;
                             flex-shrink: 0;"
                                        on:click={() => goto("/notifications")}
                                    >
                                        {$notificationCount}
                                    </span>
                                {/if}
                            </span>
                        {/if}
                        <!-- {/await} -->
                    </div>
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div class="SideBarElement">
                        <span
                            class="material-symbols-outlined"
                            on:click={() => goto("/myideas")}
                        >
                            emoji_objects
                        </span>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        {#if isOpen}<span
                                class="label"
                                in:fade={{ duration: seconds * 1000 }}
                                out:fade={{ duration: seconds * 1000 }}
                                style="white-space: nowrap;  text-overflow: ellipsis; 
                        display: block; 
                        max-width: 100%; position:absolute;
                        overflow: hidden; "
                                on:click={() => goto("/myideas")}>My ideas</span
                            >{/if}
                    </div>

                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div class="SideBarElement">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <span
                            class="material-symbols-outlined"
                            on:click={() => goto("/feed")}
                        >
                            batch_prediction
                        </span>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        {#if isOpen}<span
                                class="label"
                                in:fade={{ duration: seconds * 1000 }}
                                out:fade={{ duration: seconds * 1000 }}
                                style="white-space: nowrap;  text-overflow: ellipsis; 
                        display: block; 
                        max-width: 100%; position:absolute;
                        overflow: hidden; "
                                on:click={() => goto("/feed")}
                                >Followed ideas</span
                            >{/if}
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
                    <span
                        class="material-symbols-outlined"
                        on:click={() =>
                            goto("https://forum.solutio.one/categories")}
                    >
                        contact_support
                    </span>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    {#if isOpen}<span
                            class="label"
                            in:fade={{ duration: seconds * 1000 }}
                            out:fade={{ duration: seconds * 1000 }}
                            style="overflow-x: hidden; position:absolute;"
                            on:click={() =>
                                goto("https://forum.solutio.one/categories")}
                            >Forum</span
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
                                font-size: 12px;
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
                            <div
                                class="SideBarElement"
                                style="padding-left: 22px;"
                                on:click={async () => {
                                    let pathOrigin = window.location.origin;
                                    goto(pathOrigin + "/topic/" + idea.key);
                                }}
                            >
                                <img
                                    src={idea.data.images[0]
                                        ? idea.data.images[0]
                                        : ""}
                                    alt="Solutio Logo"
                                    style="width: 25px; height:25px; object-fit:cover; 
                        "
                                />
                                {#if isOpen}
                                    <span
                                        class="label"
                                        in:fade={{ duration: seconds * 1000 }}
                                        out:fade={{ duration: seconds * 1000 }}
                                        style="white-space: nowrap;  text-overflow: ellipsis; 
                                            display: block; 
                                            max-width: 100%; position:absolute;
                                            overflow: hidden; "
                                        >{#if idea.data.title.length > maxChars}{idea.data.title.substring(
                                                0,
                                                maxChars,
                                            )}...{:else}{idea.data
                                                .title}{/if}</span
                                    >
                                {/if}
                            </div>
                        {/each}
                    {/await}
                {/if}
                <span
                    class="material-symbols-outlined"
                    style="bottom:0px; padding: 7.5px 170px 6.5px 27px;"
                    on:click={() => {
                        toggleSidebar();
                    }}
                >
                    {#if isOpen}arrow_circle_left{:else}arrow_circle_right{/if}
                </span>
            </div>
        </div>
        <div class="SideBarFooter">
            <div class="SideBarElement">
                <span
                    class="material-symbols-outlined"
                    on:click={async () => {
                        if (!(await CheckIfSignedIn())) {
                            path.set(window.location.href);
                            goto("/signin");

                            return;
                        }
                        goto("/account/" + $UserKey);
                    }}
                >
                    account_circle
                </span>
                {#if isOpen}<span
                        class="label"
                        in:fade={{ duration: seconds * 1000 }}
                        out:fade={{ duration: seconds * 1000 }}
                        style="overflow-x: hidden; position:absolute;"
                        on:click={async () => {
                            if (!(await CheckIfSignedIn())) {
                                path.set(window.location.href);
                                goto("/signin");
                                return;
                            }
                            goto("/account/" + $UserKey);
                        }}>Account</span
                    >{/if}
            </div>
        </div>
    {/await}
</div>
<div class="AppMenuBar">
    <AppMenuBar />
</div>

<style>
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
        gap: 30px;
        z-index: 3000;
        overflow-x: hidden;
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

        gap: 30px;
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
        font-size: 16px;
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
        font-size: 14px;
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
    .SidebarWrapper {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 0fr 0fr 0.3fr;
        gap: 0px 0px;
        grid-template-areas:
            "SideBarHead"
            "SideBarBody"
            "SideBarFooter";
        grid-area: Sidebar;
    }
    .SideBarHead {
        grid-area: SideBarHead;
        height: fit-content;
        display: flex;
        justify-content: left;
        align-items: center;
        gap: 20px;
        padding-top: 20px;
    }
    .SideBarHead img {
        width: 35px; /* Set a fixed width */
        height: 35px; /* Set a fixed height */
        object-fit: contain; /* Image will maintain its aspect ratio */
    }
    .SideBarBody {
        grid-area: SideBarBody;
    }
    .SideBarFooter {
        grid-area: SideBarFooter;

        padding: 11px 0px;
        height: fit-content;
        display: flex;
        justify-content: start;
        align-items: center;
        margin-top: auto;
    }
    .AppMenuBar {
        display: none;
        height: 0px;
        width: 0px;
        margin: 0px;
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
    }
</style>
