<script>
    import { goto } from "$app/navigation";
    import BasicButtonBlackWhite from "./BasicButtonBlackWhite.svelte";
    import FlatButtonDarkSmall from "./FlatButtonDarkSmall.svelte";
    import Modal from "./modal.svelte";

    // You can pass the image source as a prop if it needs to be dynamic
    let open = false;
    export let src =
        "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/no-profile-picture-icon.png";
    /**
     * @param {{ stopPropagation: () => void; }} event
     */
    function handleProfileClick(event) {
        event.stopPropagation();
        open = true;
    }

    $: editUrl = src;

    function onSave() {
        src = editUrl;
        open = false;
    }

    function cancel() {
        open = false;
        editUrl = src;
    }
</script>

<div class="profile-pic-container">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <!-- svelte-ignore a11y-img-redundant-alt -->
    <img
        class="profile-pic"
        {src}
        alt="Profile Picture"
        on:click={handleProfileClick}
    />
    <div class="hover-message VerticallyAligned HorizontallyAligned">
        Click to change
    </div>
</div>
<Modal
    isOpen7={open}
    close7={() => {
        open = false;
    }}
>
    <div class="VerticallyAligned HorizontallyAligned">
        <div class="profile-pic-container-modal">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <!-- svelte-ignore a11y-img-redundant-alt -->
            <img
                class="profile-pic"
                src={editUrl}
                alt="Profile Picture"
                on:click={handleProfileClick}
            />
        </div>
        <input type="text" class="InputText" bind:value={editUrl} />
        <FlatButtonDarkSmall
            msg={"Save"}
            someFunction={() => {
                onSave();
            }}
        />
        <FlatButtonDarkSmall
            msg={"Cancel"}
            someFunction={() => {
                cancel();
            }}
        />
    </div>
</Modal>

<style>
    .profile-pic-container {
        width: 60px; /* width and height should be the same */
        height: 60px; /* width and height should be the same */
        position: absolute;
        border-radius: 50%; /* Makes the container circular */
        overflow: hidden; /* Ensures the content doesn't spill outside the border */
        display: flex; /* Utilizes Flexbox for centering content */
        justify-content: center; /* Centers horizontally in the flex container */
        align-items: center; /* Centers vertically in the flex container */
        cursor: pointer;
        border: 2px solid var(--primary-color);
        transition:
            border 0.3s ease,
            width 0.3s ease,
            height 0.3s ease,
            transform 0.3s ease;
    }

    .profile-pic {
        width: 100%; /* Ensures the image is at least as wide as the container */
        height: 100%; /* Ensures the image is at least as tall as the container */
        object-fit: cover; /* Covers the area, cropping as needed */
    }

    .hover-message {
        width: 60px; /* width and height should be the same */
        height: 60px; /* width and height should be the same */
        position: absolute;
        border-radius: 50%; /* Makes the container circular */
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #fff; /* Adjust color as needed */
        background-color: var(--primary-color);
        visibility: hidden;
        opacity: 0;
        transition:
            opacity 0.3s,
            visibility 0.3s;
        text-align: center;
        width: 100%;
        pointer-events: none; /* Prevents the text from being clickable */
    }

    .profile-pic-container:hover .hover-message {
        visibility: visible;
        opacity: 1;
    }

    .profile-pic-container-modal {
        width: 120px; /* width and height should be the same */
        height: 120px; /* width and height should be the same */
        border-radius: 50%; /* Makes the container circular */
        overflow: hidden; /* Ensures the content doesn't spill outside the border */
        display: flex; /* Utilizes Flexbox for centering content */
        justify-content: center; /* Centers horizontally in the flex container */
        align-items: center; /* Centers vertically in the flex container */
        border: 2px solid var(--primary-color);
        margin-top: 20px;
    }
</style>
