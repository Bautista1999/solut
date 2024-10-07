<script>
    import { goto } from "$app/navigation";
    import BasicButtonDarkLarger from "$lib/components/BasicButtonDarkLarger.svelte";
    import BasicButtonLarger from "$lib/components/BasicButtonLarger.svelte";
    import BasicButtonDarkSmall from "$lib/components/BasicButton_Dark_Small.svelte";
    import { authSubscribe } from "@junobuild/core-peer";
    import { onMount } from "svelte";
    import ErrorMessage from "$lib/components/ErrorMessage.svelte";
    import { setUser } from "$lib/data_functions/create_functions";
    import LoadingNew from "$lib/components/LoadingNew.svelte";
    import SuccessNew from "$lib/components/Success_New.svelte";
    import { getNames } from "country-list";
    import { usernameExists } from "$lib/data_functions/get_functions";

    const countries = getNames();

    /** @type {import('./$types').PageData} */
    export let data;

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

    let description = "";
    let x_account = "";
    let insta_account = "";
    let Github_account = "";
    let linkedIn_account = "";
    /**
     * @param {string} tag
     */
    function deleteTag(tag) {
        let currentIndex = interests.indexOf(tag);
        interests.splice(currentIndex, 1);
        interests = [...interests];
    }
    let success = false;
    let tagsTooLong = false;
    let error = false;
    let isLoading = false;
    let isTaken = false;
    let errorMsg = "Failed to create the user.";
    let userKey = data.params.user_id;

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

    async function createUser() {
        document.body.scrollIntoView({ behavior: "smooth" });
        if (isTaken) {
            return;
        }
        isLoading = true;
        /**
         * @type {import("$lib/data_objects/data_types").user}
         */
        let userPost = {
            username: username,
            profilePicture: profileUrl,
            images: [],
            videos: [],
            country: country,
            sex: gender,
            categories: interests,
            description: description,
            xAccount: x_account,
            GitHubAccount: Github_account,
            instaAccount: insta_account,
            linkedInAccount: linkedIn_account,
            linkPage: "",
            otherlinks: [],
        };
        try {
            let creation = await setUser(userPost, userKey);
            if (typeof creation === "string") {
                error = true;
                errorMsg = creation;
            } else if (Array.isArray(creation) && creation.length > 0) {
                //ideaKey = creation[0].key;
            } else {
                //ideaKey = "";
            }
            console.log("Your creation: ", creation);
        } catch (e) {
            isLoading = false;
            error = true;
            console.log(e);
            errorMsg = String(e); // Convert the error object to a string
        }
        isLoading = false;
        if (!error) {
            success = true;
        }
    }

    async function handleInput() {
        try {
            isTaken = await usernameExists(username, userKey);
        } catch (e) {
            error = true;
            errorMsg = String(e); // Convert the error object to a string
        }
    }

    onMount(async () => {
        authSubscribe((/** @type {{ key: string; } | null} */ user) => {
            if (user == null) {
                goto("/signin/");
            } else {
                userKey = user.key;
                if (user.key != data.params.user_id) {
                    error = true;
                    errorMsg = "User key doesnt match params!";
                } else {
                }
            }
        });
    });
</script>

{#if !error && !isLoading && !success}
    <div class="container-form setuser-form-margin">
        <div class="content" style="margin-top: 0px;">
            <h1>Account</h1>

            <div class="profile-pic-container">
                <!-- svelte-ignore a11y-img-redundant-alt -->
                <img
                    class="profile-pic"
                    src={profileUrl || defaultUrl}
                    alt="Profile Picture"
                />
            </div>
            <div class="form-section">
                <label for="ideasSelected">Picture URL</label>
                <input
                    type="list"
                    bind:value={profileUrl}
                    placeholder="Profile picture URL"
                    class="InputText"
                />
            </div>
            <!-- <p>Your principal: {data.params.user_id}</p> -->
            <div class="form-section">
                <label for="ideasSelected">Username</label>

                <input
                    type="text"
                    bind:value={username}
                    placeholder="Username"
                    on:blur={handleInput}
                    class="InputText"
                />
                {#if isTaken}
                    <p
                        class="InputErrorMessage"
                        style="width: 100%;margin-bottom:10px;"
                    >
                        That name is already taken!
                    </p>
                {:else if !isTaken && username != "" && username != " "}
                    <p
                        class="InputSuccessMessage"
                        style="width: 100%; margin-bottom:10px;"
                    >
                        Name available!
                    </p>
                {/if}
            </div>
            <div class="form-section">
                <label for="ideasSelected">Country</label>
                <select
                    bind:value={country}
                    class="InputText"
                    style="font-family: Barlow; padding-inline:15px; width:100%; margin-block:10px;"
                >
                    <option value="" disabled selected
                        >Select your country</option
                    >
                    {#each countries as countryName}
                        <option value={countryName}>{countryName}</option>
                    {/each}
                </select>
            </div>
            <div class="form-section">
                <label for="ideasSelected">Sex</label>
                <select
                    bind:value={gender}
                    class="InputText"
                    style="width:100%;"
                >
                    <option value="" disabled selected>Select your sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>

            <div class="form-section">
                <label for="ideasSelected">Interests</label>
                <div class="interests-container">
                    <input
                        class="InputText"
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
            </div>
            {#if tagsTooLong}
                <p class="InputErrorMessage" style="width: 100%;">
                    You can't have more than 10 interests.
                </p>
            {/if}
            <BasicButtonLarger
                msg={"Set Account"}
                someFunction={async () => {
                    await createUser();
                }}
            />
            <br />
            <BasicButtonDarkLarger
                msg={"Skip this"}
                someFunction={() => {
                    goto("/");
                }}
                icon={"fast_forward"}
            />
        </div>
    </div>
{:else if error}
    <ErrorMessage
        message={"Some error ocurred!"}
        error={errorMsg}
        someFunction={() => {
            error = false;
        }}
    />
{:else if success}
    <SuccessNew
        message={"Account updated successfully"}
        someFunction={() => {
            goto("/account/" + userKey);
        }}
    />
{:else}
    <!-- <Loading msg={"Uploading data"} width={30} /> -->
    <LoadingNew message={"Uploading data..."} />
{/if}
<svelte:head>
    <meta name="twitter:card" content="summary" />
    <meta charset="utf-8" />
    <title>Create Account</title>
</svelte:head>

<style>
    @import "../../createtopic/createtopic.styles.css";
    .setuser-form-margin {
        margin-block: 20px;
    }
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: fit-content;
        width: 100%;
        max-width: 450px;
        padding: 20px;
        padding-inline: 20px;
        background-color: var(--tertiary-color);
        border: 1px solid var(--seventh-color);
    }

    .interests-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%; /* Adjust based on parent container */
        gap: 20px;
    }
    .interest-input {
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
    @media (max-width: 480px) {
        .content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: fit-content;
            width: fit-content;
            max-width: 400px;
            margin: 0px auto;
            padding: 20px;
            padding-inline: 15px;
            background-color: var(--tertiary-color);
            border: 1px solid var(--seventh-color);
        }
        .setuser-form-margin {
            margin-block: 0px;
        }
    }
</style>
