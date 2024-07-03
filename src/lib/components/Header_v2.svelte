<script>
    import { onMount } from "svelte";
    import ProfilePictureSmall from "./ProfilePicture_Small.svelte";
    import BasicButtonSmall from "./BasicButton_Small.svelte";
    import { goto } from "$app/navigation";
    import {
        CheckIfSignedIn,
        CheckIfSignedInHeader,
    } from "$lib/signin_functions/user_signin_functions";
    import { signOut } from "@junobuild/core-peer";
    import { IsSignedIn, UserKey } from "$lib/stores/other_stores";
    import {
        getUserImages,
        getUserKey,
    } from "$lib/data_functions/get_functions";
    import ProfilePicture from "./profilePicture.svelte";
    import MagicalDotsAbsoluteSmall from "./MagicalDotsAbsolut.svelte";
    import ProfilePictureHeader from "./ProfilePicture_Header.svelte";

    let lastScrollY = window.scrollY;
    let isExpanded = true; // Header is expanded by default
    let ticking = false; // Throttling flag for scroll event

    function handleScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const directionUp = currentScrollY < lastScrollY;

                // Introduce a tolerance to avoid immediate changes on minor scroll up
                const tolerance = 5;
                const scrolledUpEnough =
                    lastScrollY - currentScrollY > tolerance;

                if (directionUp && scrolledUpEnough) {
                    isExpanded = true;
                } else if (!directionUp) {
                    isExpanded = false;
                }

                lastScrollY = currentScrollY;
                ticking = false;
            });

            ticking = true;
        }
    }

    onMount(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    });
</script>

<div class="header-container">
    <header class={isExpanded ? "expanded" : "shrink"}>
        <div class="container">
            {#await CheckIfSignedIn() then SignedIn}
                <div class="leftHeader">
                    <!-- Left-aligned content here -->
                </div>
                <div class="mainHeaderContent">
                    <nav class="navigation">
                        <a href="/">Home</a>
                        <a href="https://home.solutio.one/">About</a>
                        <!-- <a href="/contact">Contact</a> -->
                        {#if !$IsSignedIn}
                            <a href={`/signin`} class="tab-button">Sign In</a>
                        {:else}
                            <a
                                class="tab-button"
                                href={`/signin`}
                                style="cursor: pointer;"
                                on:click={async () => {
                                    await signOut();
                                    location.reload();
                                }}
                            >
                                Sign out
                            </a>
                        {/if}
                    </nav>
                </div>
                <div class="rightHeader">
                    <!-- Right-aligned content here -->
                    <BasicButtonSmall
                        msg={"Create New"}
                        icon={"add_circle"}
                        someFunction={() => {
                            goto("/create");
                        }}
                    />

                    {#await getUserKey()}
                        <MagicalDotsAbsoluteSmall />
                    {:then key}
                        {#await getUserImages([$UserKey])}
                            <!-- <ProfilePictureSmall src={""} userKey={""} /> -->
                        {:then data}
                            <ProfilePictureHeader
                                src={data[0].image}
                                userKey={data[0].key}
                            />
                        {/await}
                    {/await}
                </div>
            {/await}
        </div>
    </header>
</div>

<style>
    .tab-button {
        white-space: nowrap; /* Prevent text from wrapping to a new line */
        overflow: hidden; /* Prevent content from overflowing */
        text-overflow: ellipsis; /* Add an ellipsis if the text overflows (optional) */
        /* Add additional styles as needed, such as padding, border, font size, etc. */
    }
    .shrink {
        height: 0px;
        padding: 0px;
        min-height: 0px;
        overflow: hidden;
    }
    .navigation {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 40px;
        gap: 100px;
        width: fit-content;
    }
    .navigation a {
        padding: 0 15px;
        transition: transform 0.3s ease;
        text-decoration: none;
        color: var(--tertiary-color); /* Example text color */
        width: fit-content;
    }
    .navigation a:hover {
        color: var(--primary-color); /* Example text color */
    }
    .container {
        display: grid;
        grid-template-columns: 0fr 2fr 0fr;
        grid-template-rows: 1fr;
        gap: 0px 0px;
        grid-auto-flow: row;
        grid-template-areas: "LeftContent MainContent RightContent";
        display: flex;
        align-items: center;
        justify-content: center;
        padding-right: 50%;
        width: 100%;
    }

    .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    header {
        padding: 10px; /* Add padding as needed */
        transition: all 0.5s ease;

        background: var(--secondary-color);
        padding: 10px;
        position: fixed;

        width: 100%;
        height: fit-content;
        min-height: 10px;
        top: 0;
        transition: all 0.5s ease;
        z-index: 1000;
    }

    .leftHeader,
    .mainHeaderContent,
    .rightHeader {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 100%;
        gap: 30px;
    }

    .leftHeader {
        justify-content: flex-start;
    }

    .mainHeaderContent {
        justify-content: center;
        gap: 5px;
    }

    .rightHeader {
        justify-content: flex-end;
        margin-right: 30px;
    }
</style>
