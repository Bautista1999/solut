<script>
    import { goto } from "$app/navigation";
    import BasicButtonDarkLarger from "$lib/components/BasicButtonDarkLarger.svelte";
    import BasicButtonLarger from "$lib/components/BasicButtonLarger.svelte";
    import BasicButtonDarkSmall from "$lib/components/BasicButton_Dark_Small.svelte";

    let username = "";
    let country = "";
    let gender = "";
    /**
     * @type {any[]}
     */
    let interests = [];
    let interestInput = "";
    let profileUrl = "";
    let defaultUrl =
        "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/no-profile-picture-icon.png";

    /**
     * @param {string} tag
     */
    function deleteTag(tag) {
        let currentIndex = interests.indexOf(tag);
        interests.splice(currentIndex, 1);
        interests = [...interests];
    }

    let tagsTooLong = false;
    function addTag() {
        if (interestInput == "") {
            return;
        }
        if (interests.length > 9) {
            tagsTooLong = true;
            setTimeout(() => {
                tagsTooLong = false;
            }, 4000);
            return;
        }
        interests = [...interests, interestInput]; // Use spread syntax to trigger reactivity
        interestInput = "";
    }
</script>

<div class="container">
    <h1>Create Account</h1>
    <div class="profile-pic-container">
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <img
            class="profile-pic"
            src={profileUrl || defaultUrl}
            alt="Profile Picture"
        />
    </div>
    <p style="width: 100%;">Picture URL</p>
    <input
        type="text"
        bind:value={profileUrl}
        placeholder="Profile picture URL"
        class="field"
    />
    <p style="width: 100%;">Username</p>
    <input
        type="text"
        bind:value={username}
        placeholder="Username"
        class="field"
    />
    <p style="width: 100%;">Country</p>
    <input
        type="text"
        bind:value={country}
        placeholder="Country of Residence"
        class="field"
    />
    <p style="width: 100%;">Sex</p>
    <input type="text" bind:value={gender} placeholder="Sex" class="field" />
    <p style="width: 100%;">Interests</p>
    <div class="interests-container">
        <input
            class="interest-input"
            bind:value={interestInput}
            placeholder="Add Interest"
        />
        <BasicButtonDarkSmall
            msg={"Add tag"}
            someFunction={() => {
                addTag();
            }}
        />
    </div>
    <div class="tags">
        {#each interests as tag}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="tag">
                <p>{tag}</p>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <span
                    class="material-symbols-outlined"
                    style="cursor: pointer;"
                    on:click={() => {
                        deleteTag(tag);
                    }}
                >
                    delete
                </span>
            </div>
        {/each}
    </div>
    {#if tagsTooLong}
        <p class="InputErrorMessage" style="width: 100%;">
            You can't have more than 10 interests.
        </p>
    {/if}
    <BasicButtonLarger msg={"Create Account"} />
    <br />
    <BasicButtonDarkLarger
        msg={"Skip this"}
        someFunction={() => {
            goto("/");
        }}
        icon={"fast_forward"}
    />
</div>

<style>
    .field {
        width: 100%;
        height: 64px;
        flex-shrink: 0;
        border: 1px solid var(--seventh-color);
        background: var(black, #fff);
    }
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: fit-content;
        width: 100%;
        max-width: 400px;
        margin: 20px auto;
        padding: 20px;
        padding-inline: 40px;
        background-color: var(--tertiary-color);
        border: 1px solid var(--seventh-color);
    }

    input,
    button {
        width: 100%;
        padding: 12px 20px;
        margin: 8px 0;
        display: inline-block;
        border: 1px solid #ccc;
        box-sizing: border-box;
    }

    button {
        background-color: var(--primary-color);
        color: white;
        border: none;
        cursor: pointer;
    }

    button:hover {
        opacity: 0.8;
    }

    .footer-button {
        background: none;
        color: var(--primary-color);
        border: none;
    }
    .interests-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%; /* Adjust based on parent container */
        gap: 20px;
    }
    .interest-input,
    .interests-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        width: 90%; /* Ensure it matches input width */
    }
    .interest-input {
        height: 64px;
        border: 1px solid var(--seventh-color);
        background: var(black, #fff);
    }
    .interest {
        background-color: #eee;
        border-radius: 8px;
        padding: 5px 10px;
    }

    .profile-pic-container {
        width: 150px; /* width and height should be the same */
        height: 150px; /* width and height should be the same */
        right: 0;
        margin-bottom: 10px;
        position: relative;
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
    .profile-pic-container:active {
        position: relative;
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

    .tags {
        display: flex;
        justify-content: left;
        align-items: center;
        gap: 5px;
        padding-block: 10px;
        width: 100%;
        flex-wrap: wrap; /* Wrap tags to the next line when full */
    }
    .tag {
        width: fit-content;
        padding-inline: 5px;
        padding-block: 2px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--primary-color);
        border: 1px solid var(--secondary-color);
        color: var(--tertiary-color);
    }
</style>
