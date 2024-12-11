<!-- <UnderConstruction /> -->
<script>
    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";
    import BasicButtonDarkSmall from "$lib/components/BasicButton_Dark_Small.svelte";
    import UnderConstruction from "$lib/components/UnderConstruction.svelte";
    // Sample data for the username section
    const isOwner = false; // Change to false to simulate non-owner view
    const username = "@Fairtale";
    const userPrincipal =
        "2dgol-6t7gr-wbceo-axkyn-3qinp-vxv32-zrqbv-oj6tr-ztuvk-el3ln-3ae";
    const profileImage =
        "https://solutio.one/images/p9P1BmEVKw-Jd-1QXMuGj.jpeg"; // Placeholder image URL
    const backgroundImage =
        "https://solutio.one/images/Ctmzwnel91Z_W8ozWRCzl.jpeg"; // Placeholder background image URL
</script>

<div class="profile-page">
    <!-- Username Section with Background -->
    <div class="username-section">
        <div class="background-overlay">
            <img src={backgroundImage} alt="Background Image" />
        </div>
        <div class="profile-content">
            <div class="profile-image">
                <img src={profileImage} alt="Profile Image" />
            </div>
            <div class="user-info">
                <h1>{username}</h1>
                <p class="user-principal">{userPrincipal}</p>
            </div>
            <div class="actions">
                {#if isOwner}
                    <BasicButtonDark msg={"Edit"} icon={"edit"} />
                {:else}
                    <BasicButtonDark msg={"Follow"} />
                {/if}
            </div>
        </div>
    </div>

    <!-- Placeholder for other sections -->
    <div class="basic-info-section">
        <!-- Basic Info Section Placeholder -->
    </div>
    <div class="activity-section">
        <!-- Activity Section Placeholder -->
    </div>
</div>

<style>
    /* Basic Styles for Profile Page */
    .profile-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: Arial, sans-serif;
        width: 100%;
        max-width: 1200px;
        margin: auto;
    }

    /* Username Section */
    .username-section {
        position: relative;
        width: 80%;
        border-radius: 8px;
        height: 200px; /* Adjust height as needed */
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }

    .background-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0; /* Ensures it stays behind the content */
    }

    .background-overlay img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: brightness(0.4);
    }

    .profile-content {
        position: relative;
        z-index: 1; /* Brings content above the background */
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 90%;
        max-width: 1000px;
        gap: 15px;
    }

    .profile-image img {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        border: 3px solid white;
        object-fit: cover;
    }

    .user-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .user-info h1 {
        font-size: 1.8rem;
        margin: 0;
        color: white; /* White text for contrast */
    }

    .user-principal {
        font-size: 1rem;
        color: #d3d3d3; /* Light gray for contrast */
    }

    /* Action Buttons */
    .actions {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .edit-info-btn,
    .follow-btn {
        padding: 10px 20px;
        font-size: 0.9rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .edit-info-btn {
        background-color: orange;
        color: white;
    }

    .follow-btn {
        background-color: orangered;
        color: white;
    }

    /* Responsive Design for Mobile (max-width: 768px) */
    @media (max-width: 768px) {
        /* Username Section Adjustments */
        .username-section {
            width: 105%;
            /* Make the section slightly narrower */

            height: 170px;
            /* Let the height adjust based on content */
            border-radius: 0;
            /* Remove rounded corners for a cleaner look */
        }

        .profile-content {
            flex-direction: row; /* Stack items vertically */
            align-items: center; /* Center align for better layout */
            gap: 15px; /* Increase spacing between elements */
            text-align: center; /* Center text alignment */
        }

        .profile-image img {
            width: 80px; /* Smaller profile image */
            height: 80px;
        }

        .user-info h1 {
            font-size: 1.5rem; /* Adjust font size for mobile */
            text-align: left;
        }

        .user-principal {
            font-size: 0.8rem; /* Smaller font size for secondary info */
            text-align: left;
        }

        .actions {
            width: 100%; /* Buttons take up full width */
            justify-content: center;
            gap: 10px;
        }

        /* Background Overlay Adjustments */
        .background-overlay img {
            transform: scale(1.2); /* Slightly zoom background for better fit */
        }
    }
</style>
