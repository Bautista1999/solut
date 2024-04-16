<script>
    // You can pass the image source as a prop if it needs to be dynamic
    export let src =
        "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/no-profile-picture-icon.png";
    /**
     * @param {{ stopPropagation: () => void; }} event
     */
    function handleProfileClick(event) {
        // Stop the click event from bubbling up to parent elements
        event.stopPropagation();

        // Your logic for when the profile picture is clicked
        console.log("Profile picture clicked!");
    }
</script>

<div class="profile-pic-container">
    <img
        class="profile-pic"
        {src}
        alt="Profile Picture"
        on:click={handleProfileClick}
    />
</div>

<style>
    .profile-pic-container {
        width: 60px; /* width and height should be the same */
        height: 60px; /* width and height should be the same */
        border-radius: 50%; /* Makes the container circular */
        overflow: hidden; /* Ensures the content doesn't spill outside the border */
        display: flex; /* Utilizes Flexbox for centering content */
        justify-content: center; /* Centers horizontally in the flex container */
        align-items: center; /* Centers vertically in the flex container */
        cursor: pointer;
        border: 2px solid var(--secondary-color);
        transition:
            border 0.3s ease,
            width 0.3s ease,
            height 0.3s ease,
            transform 0.3s ease;
    }
    .profile-pic-container:hover {
        position: absolute;
        transform: scale(1.2);
        border-radius: 50%; /* Makes the container circular */
        overflow: hidden; /* Ensures the content doesn't spill outside the border */
        display: flex; /* Utilizes Flexbox for centering content */
        justify-content: center; /* Centers horizontally in the flex container */
        align-items: center; /* Centers vertically in the flex container */
        border: 2px solid var(--primary-color);
    }
    .profile-pic-container:active {
        position: absolute;
        transform: scale(1);
        border-radius: 50%; /* Makes the container circular */
        overflow: hidden; /* Ensures the content doesn't spill outside the border */
        display: flex; /* Utilizes Flexbox for centering content */
        justify-content: center; /* Centers horizontally in the flex container */
        align-items: center; /* Centers vertically in the flex container */
        border: 2px solid var(--primary-color);
    }

    .profile-pic {
        width: auto; /* Maintains aspect ratio */
        height: 100%; /* Fills the height of the container */
        object-fit: cover; /* Ensures the image covers the area without stretching, cropping as needed */
    }
</style>
