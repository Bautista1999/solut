<script>
    import ImageScrollerEdit from "$lib/components/ImageScroller_Edit.svelte";
    /**
     * @type {ImageScrollerEdit}
     */
    let imageScroller;

    import ProfilePicture from "$lib/components/profilePicture.svelte";
    import Breadcrumbs from "$lib/components/breadcrumbs.svelte";
    import { UserKey } from "$lib/stores/other_stores";
    import {
        getUserImages,
        getUserKey,
    } from "$lib/data_functions/get_functions";
    import EditSubtitle from "$lib/components/EditSubtitle.svelte";
    import EditTitle from "$lib/components/EditTitle.svelte";
    import BasicButtonDarkSmall from "$lib/components/BasicButton_Dark_Small.svelte";
    import DescriptionEdit from "$lib/components/DescriptionEdit.svelte";
    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";
    import { goto } from "$app/navigation";
    import AddFeaturesSection from "$lib/components/AddFeaturesSection.svelte";
    import Error from "../+error.svelte";
    import ErrorMessage from "$lib/components/ErrorMessage.svelte";
    import LoadingNew from "$lib/components/LoadingNew.svelte";
    import SuccessNew from "$lib/components/Success_New.svelte";
    import { setIdea } from "$lib/data_functions/create_functions";
    import { onMount } from "svelte";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import { path } from "$lib/stores/redirect_store";

    export let msg = "Label";
    /** @type {import('./$types').PageData} */
    // @ts-ignore
    export let data;
    let key = "";
    /**
     * @type {string[]}
     */
    let images = [];
    $: title = "";
    let subtitle = "";
    let desc = "";
    let user = "";
    let userPicture = "";
    let tabs = ["Pledge Timeline", "Comments", "About the project"];
    let activeTab = tabs[2]; // default active tab
    // Function to change active tab
    // /**
    //  * @param {string} tab
    //  */
    // function setActiveTab(tab) {
    //     activeTab = tab;
    // }
    let active = false;
    let subtitleActive = false;
    let clickToEdit = "(click to edit)";
    let newImage = "";
    function addImage() {
        imageScroller.addNewImage(newImage);
        if (newImage == "") {
            return;
        }
        images = [...images, newImage]; // Use spread syntax to trigger reactivity
        newImage = "";
    }
    let newTag = "";
    /**
     * @type {string[]}
     */
    let tags = [];
    let tagsTooLong = false;
    function addTag() {
        if (newTag == "") {
            return;
        }
        if (newTag == "") {
            newTag = "";
            return;
        }
        if (newTag == ",") {
            newTag = "";
            return;
        }
        if (newTag == ".") {
            newTag = "";
            return;
        }
        if (newTag.includes(",") || newTag.includes(".")) {
            newTag = "";
            return;
        }
        if (tags.includes(newTag)) {
            newTag = "";
            return;
        }
        if (tags.length >= 5) {
            tagsTooLong = true;
            setTimeout(() => {
                tagsTooLong = false;
            }, 4000);
            return;
        }
        tags = [...tags, newTag]; // Use spread syntax to trigger reactivity
        newTag = "";
    }
    /**
     * @param {string} tag
     */
    function deleteTag(tag) {
        let currentIndex = tags.indexOf(tag);
        tags.splice(currentIndex, 1);
        tags = [...tags];
    }
    let success = false;
    /**
     * @type {never[]}
     */
    let videos = [];
    let ideaKey = "";
    async function onPost() {
        document.body.scrollIntoView({ behavior: "smooth" });
        isLoading = true;

        let ideaPost = {
            title: title,
            subtitle: subtitle,
            description: desc,
            images: images,
            videos: videos,
            categories: tags,
        };
        /**
         * @type {import("$lib/data_objects/data_types").feature[]}
         */
        let featuresPost = [];
        for (let i = 0; i < ideas.length; i++) {
            let idea = ideas[i];
            let featurePost = {
                title: idea.title,
                subtitle: idea.subtitle,
                description: idea.description,
                images: idea.images,
                videos: idea.videos,
                categories: idea.categories,
            };
            featuresPost.push(featurePost);
            featuresPost = featuresPost;
        }
        isLoading = true;
        try {
            let creation = await setIdea(ideaPost, featuresPost);
            if (typeof creation === "string") {
                error = true;
                errorMsg = creation;
            } else if (Array.isArray(creation) && creation.length > 0) {
                ideaKey = creation[0].key;
            } else {
                ideaKey = "";
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
    /**
     * @type {import("$lib/data_objects/data_types").feature[]}
     */
    let ideas = [];
    let error = false;
    let isLoading = false;
    let errorMsg = "";

    onMount(async () => {
        if (!(await CheckIfSignedIn())) {
            path.set("/create");
            goto("/signin/");
        }
        user = await getUserKey();
    });
</script>

<div class="body">
    {#if !isLoading && !success && !error}
        <div class="content">
            <div class="container">
                <div class="Subtitle">
                    <EditSubtitle
                        bind:title={subtitle}
                        active={subtitleActive}
                    />
                    <div style="height: 10px;"></div>
                </div>
                <div class="Profile">
                    {#await getUserImages([$UserKey])}
                        <ProfilePicture src={""} />
                    {:then data}
                        <ProfilePicture src={data[0].image} userKey={user} />
                    {/await}
                </div>
                <div class="Title">
                    <br />
                    <br />
                    <EditTitle {active} bind:title />
                    <div style="height: 80px;"></div>
                </div>

                <div class="Breadcrumbs">
                    <Breadcrumbs
                        breadcrumbs={[
                            { title: "Home", link: "" },
                            { title: title, link: "" },
                        ]}
                    />
                    <div style="height: 10px;"></div>
                </div>
                <div class="Pictures">
                    <div style="background-color: var(--secondary-color);">
                        <ImageScrollerEdit bind:this={imageScroller} />
                    </div>

                    <br />
                    <div
                        style="display: flex; justify-content:left;align-items:center;
                    gap:20px;
                    
                    "
                    >
                        <input
                            type="text"
                            placeholder="Type the url of the image here..."
                            class="InputText"
                            bind:value={newImage}
                        />
                        <BasicButtonDarkSmall
                            msg={"Add image"}
                            someFunction={addImage}
                        />
                    </div>
                </div>

                <div class="ActivitySection">
                    <div class="ActivityTabs">
                        <h3>About the project</h3>
                    </div>

                    <div class="ActivityContent">
                        {#if activeTab === tabs[0]}
                            <!-- <TransactionDisplay {transactions} /> -->
                        {:else if activeTab === tabs[1]}
                            <!-- <CommentSection project_id={key} /> -->
                        {:else if activeTab === tabs[2]}
                            <DescriptionEdit bind:description={desc} />
                        {/if}
                    </div>
                </div>
            </div>
            <h3>Tags</h3>
            <div class="tagInput">
                <input
                    type="text"
                    maxlength="20"
                    bind:value={newTag}
                    class="InputText"
                    on:keypress={(event) => {
                        if (event.key == "Enter") {
                            addTag();
                        }
                        if (event.key == ",") {
                            addTag();
                        }
                        if (event.key == ".") {
                            addTag();
                        }
                    }}
                />
                <BasicButtonDarkSmall msg={"Add tag"} someFunction={addTag} />
            </div>
            {#if tagsTooLong}
                <p class="InputErrorMessage">
                    You can't have more than 5 tags.
                </p>
            {/if}
            <div class="tags">
                {#each tags as tag}
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
            <h3>You have some ideas for this challenge? Include them here!</h3>
            <AddFeaturesSection bind:ideas />
            <br />
            <div
                style="display: flex; justify-content:center;align-items:center;"
            >
                <BasicButtonDark
                    msg={"Post idea"}
                    icon={"emoji_objects"}
                    someFunction={() => {
                        onPost();
                    }}
                />
            </div>
        </div>
    {:else if success}
        <SuccessNew
            message={"Idea created successfully"}
            someFunction={() => {
                goto("/idea/" + ideaKey);
            }}
        />
    {:else if error}
        <ErrorMessage
            message={"The creation of the idea failed."}
            error={errorMsg}
            someFunction={() => {
                error = false;
            }}
        />
    {:else}
        <!-- <Loading msg={"Uploading data"} width={30} /> -->
        <LoadingNew message={"Uploading data..."} />
    {/if}
</div>
<svelte:head>
    <meta name="twitter:card" content="summary" />
    <meta charset="utf-8" />
    <title>Create Idea</title>
</svelte:head>

<style>
    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 300,
            "GRAD" 0,
            "opsz" 24;
    }
    .material-symbols-outlined:hover {
        font-variation-settings:
            "FILL" 1,
            "wght" 300,
            "GRAD" 0,
            "opsz" 24;
    }
    .tags {
        display: flex;
        justify-content: start;
        align-items: center;
        gap: 5px;
        padding-block: 10px;
        flex-wrap: wrap; /* Wrap tags to the next line when full */
    }
    .tagInput {
        display: flex;
        justify-content: start;
        align-items: center;
        gap: 20px;
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
    .body {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        width: 100%;
        min-height: 100vh;
        z-index: 0;
    }

    .content {
        width: 80%;
        max-width: 800px;
        text-align: left;
        margin: 30px auto 40px auto;
        background-color: var(--tertiary-color);
        padding-inline: 40px;
        padding-block: 20px;
        border: 1px solid var(--secondary-color);
    }

    .container {
        display: grid;
        grid-template-columns: 0.3fr 1.8fr 0.9fr;
        grid-template-rows: auto;
        gap: 4px 0px;
        grid-auto-flow: row;
        grid-template-areas:
            "Breadcrumbs Breadcrumbs Breadcrumbs"
            "Profile Title Title"
            "Subtitle Subtitle Subtitle"
            "Pictures Pictures Pictures"
            "Pictures-scroller Pictures-scroller Pictures-scroller"
            "FundingSection FundingSection FundingSection"
            "PledgingSection PledgingSection PledgingSection"
            "Solution-section Solution-section Solution-section"
            "FeaturesSection FeaturesSection FeaturesSection"
            "ActivitySection ActivitySection ActivitySection";
    }

    .Profile {
        grid-area: Profile;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .Title {
        grid-area: Title;
        display: flex;
        align-items: center; /* Aligns the content vertically */
        padding-left: 10px; /* Optional: Adds some padding to the left */
    }

    .Subtitle {
        grid-area: Subtitle;
    }

    .Pictures {
        grid-area: Pictures;
    }

    .Breadcrumbs {
        grid-area: Breadcrumbs;
        display: flex;
        justify-content: left;
        text-align: left;
        align-items: center;
        gap: 30px;
    }

    .ActivitySection {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 0fr 0fr;
        gap: 0px 0px;
        grid-auto-flow: row;
        grid-template-areas:
            "ActivityTabs"
            "ActivityContent";
        grid-area: ActivitySection;
    }

    .ActivityTabs {
        display: grid;
        grid-template-columns: 1fr 0fr;
        grid-template-rows: 0fr;
        gap: 0px 0px;
        grid-auto-flow: row;
        grid-template-areas: "CommentsTab PledgersTab";
        grid-area: ActivityTabs;
    }

    .PledgersTab {
        grid-area: PledgersTab;
    }

    .ActivityContent {
        grid-area: ActivityContent;
        width: 100%;
        height: fit-content;
    }
</style>
