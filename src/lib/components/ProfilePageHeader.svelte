<!-- <UnderConstruction /> -->
<script>
    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";
    import BasicButtonDarkSmall from "$lib/components/BasicButton_Dark_Small.svelte";
    import UnderConstruction from "$lib/components/UnderConstruction.svelte";
    import {
        CheckIfFollow,
        followElement,
        unFollowElement,
    } from "$lib/data_functions/create_functions";
    import { onDestroy, onMount } from "svelte";
    import IconButton from "./IconButton.svelte";
    import UserProfilePicture from "./UserProfilePicture.svelte";
    import { validateImageUrl } from "$lib/data_functions/get_functions";
    // Sample data for the username section
    export let isOwner = false; // Change to false to simulate non-owner view
    export let followers = 0;
    export let username = "";
    let follows = false;
    export let userPrincipal = "";
    export let profileImage = ""; // Placeholder image URL
    $: displaySrc = profileImage;
    export let backgroundImage = "";
    async function CheckIfUserFollows() {
        follows = await CheckIfFollow(userPrincipal);
    }
    async function followUser() {
        await followElement(userPrincipal, "user");
        followers++;
        follows = true;
    }
    async function unFollowUser() {
        await unFollowElement(userPrincipal, "user");
        followers--;
        follows = false;
    }

    let isShrunk = false; // State to track header shrinkage

    function handleScroll() {
        isShrunk = window.scrollY > 20; // Shrink header if scrolled more than 50px
    }

    // Add a scroll event listener when the component mounts
    onMount(() => {
        window.addEventListener("scroll", handleScroll);
        CheckIfUserFollows();
    });

    onDestroy(() => {
        window.removeEventListener("scroll", handleScroll);
    });

    let isLoading = true;
    // validation of profile picture
    $: if (displaySrc) {
        // debugger;
        isLoading = true;
        (async () => {
            try {
                displaySrc = await validateImageUrl(
                    displaySrc,
                    "https://cdn-icons-png.freepik.com/512/8792/8792047.png",
                );
            } catch {
                displaySrc =
                    "https://cdn-icons-png.freepik.com/512/8792/8792047.png";
            } finally {
                isLoading = false;
            }
        })();
    } else {
        displaySrc = "https://cdn-icons-png.freepik.com/512/8792/8792047.png";
        isLoading = false;
    }
</script>

<!-- Background Image -->
<div class="background-overlay">
    <img src={backgroundImage} alt="Background Image" />
</div>

<!-- Profile Header -->
<div class="profile-content {isShrunk ? 'shrink' : ''}">
    <!-- Profile Image -->
    <div class="profile-image">
        {#if isLoading}
            <div class=" loadingHolder">
                <div class="spinner"></div>
            </div>
        {:else}
            <img src={displaySrc} alt="Profile Picture" />
        {/if}
    </div>

    <!-- User Information -->
    <div class="user-info {isShrunk ? 'hidden-info' : ''}">
        {#if username.length > 15}
            <h1 class="username {isShrunk ? 'hidden-info' : ''}">
                {username}
            </h1>
        {:else}
            <h1 class="username {isShrunk ? 'hidden-info' : ''}">{username}</h1>
        {/if}
        <p class="user-principal {isShrunk ? 'hidden-info' : ''}">
            {userPrincipal}
        </p>
    </div>

    <!-- Action Buttons -->
    <div class="actions {isShrunk ? 'hidden-actions' : ''}">
        {#if isOwner}
            <IconButton
                icon={"edit"}
                someFunction={() => {
                    window.location.href = "/account/" + userPrincipal;
                }}
            />
        {:else if !follows}
            <BasicButtonDark
                msg={"Follow"}
                someFunction={async () => {
                    await followUser();
                    follows = true;

                    followers++;
                }}
            />
        {:else}
            <BasicButtonDark
                msg={"Unfollow"}
                someFunction={async () => {
                    await unFollowUser();
                    follows = false;

                    followers--;
                }}
            />
        {/if}
    </div>
</div>

<style>
    /* Background Image */
    .background-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
    .loadingHolder {
        width: 100px;
        height: 100px; /* Full height to match the image container */
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--tertiary-color);
    }

    .background-overlay img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: brightness(0.4);
    }

    /* Profile Content */
    .profile-content {
        position: relative;
        display: flex;
        align-items: center;

        width: 90%;
        max-width: 1000px;
        gap: 15px;
        transition: all 0.3s ease; /* Smooth transition for shrinking */
    }

    /* Shrink Effect */
    .profile-content.shrink {
        padding: 10px 0;
        gap: 30px;
    }

    /* Profile Image */
    .profile-image img {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
        box-shadow: 0px 2px 8px rgba(243, 81, 0, 0.5);
        transition: all 0.3s ease; /* Smooth transition */
    }

    .profile-content.shrink .profile-image img {
        width: 50px;
        height: 50px;
    }

    /* User Info */
    .user-info {
        display: flex;
        flex-direction: column;
        gap: 5px;
        transition:
            opacity 0.3s ease,
            transform 0.3s ease; /* Smooth hide effect */
    }
    .user-info.hidden-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .username {
        font-size: 1.5rem;
    }
    .username.hidden-info {
        font-size: 1.5rem;
        transition: all 0.3s ease;
    }

    .user-info h1 {
        margin: 0;
        color: white;
    }

    .user-principal {
        font-size: 1rem;
        color: #d3d3d3;
        transition: all 0.3s ease;
    }

    .user-principal.hidden-info {
        display: none;
        transform: translateY(-10px);
    }

    /* Action Buttons */
    .actions {
        display: flex;
        align-items: center;
        justify-content: end;
        width: 30%;
        gap: 10px;
        transition:
            opacity 0.3s ease,
            transform 0.3s ease;
    }

    .actions.hidden-actions {
        opacity: 0;
        transform: translateY(-10px);
    }

    /* Shrinking Responsive Adjustments */
    @media (max-width: 768px) {
        .profile-content {
            flex-direction: row;
            align-items: center;
            text-align: center;
        }

        .profile-image img {
            width: 80px;
            height: 80px;
        }

        .profile-content.shrink .profile-image img {
            width: 80px;
            height: 80px;
        }

        .user-info h1 {
            font-size: 1.5rem;
            text-align: left;
        }

        .user-principal {
            font-size: 0.7rem;
            text-align: left;
        }

        .actions {
            gap: 5px;
        }
        .loadingHolder {
            width: 80px;
            height: 80px;
        }
    }
</style>
