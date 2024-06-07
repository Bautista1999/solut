<script>
    import ImageScrollerEdit from "$lib/components/ImageScroller_Edit.svelte";
    /**
     * @type {ImageScrollerEdit}
     */
    let imageScroller;

    import ProfilePicture from "$lib/components/profilePicture.svelte";
    import Breadcrumbs from "$lib/components/breadcrumbs.svelte";
    import EditSubtitle from "$lib/components/EditSubtitle.svelte";
    import EditTitle from "$lib/components/EditTitle.svelte";
    import BasicButtonDarkSmall from "$lib/components/BasicButton_Dark_Small.svelte";
    import DescriptionEdit from "$lib/components/DescriptionEdit.svelte";
    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";
    import ErrorMessage from "$lib/components/ErrorMessage.svelte";
    import LoadingNew from "$lib/components/LoadingNew.svelte";
    import SuccessNew from "$lib/components/Success_New.svelte";
    import { UserKey } from "$lib/stores/other_stores";

    import { goto } from "$app/navigation";
    import SearchBarLarger from "$lib/components/SearchBarLarger.svelte";
    import TagsDisplay from "$lib/components/TagsDisplay.svelte";
    import TimelineEdit from "$lib/components/TimelineEdit.svelte";
    import { onMount } from "svelte";
    import { getDoc, initJuno } from "@junobuild/core-peer";
    import { setSolution } from "$lib/data_functions/create_functions";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import { path } from "$lib/stores/redirect_store";
    import {
        getUserImages,
        getUserKey,
    } from "$lib/data_functions/get_functions";

    /** @type {import('./$types').PageData} */
    export let data;

    const theme = {
        calendar: {
            width: "100px",
            shadow: "0px 0px 5px rgba(0, 0, 0, 0.25)",
            height: "100px",
        },
    };
    let milestones = [
        {
            id: 1,
            title: "Project Kick-off",
            date: new Date("2024-05-25").getTime(),
            description: "Project kickoff day",
        },
        {
            id: 6,
            title: "Delivery Date",
            date: new Date("2024-05-25").getTime(),
            description: "Delivery Date day",
        },

        // Add more milestones if needed
    ];
    /**
     * @type {any[]}
     */
    let ideas = [];

    let error = false;
    let errorMsg = "";
    let parentIdeaKey = data.params.idea_id;
    let parentIdeaTitle = "";
    /**
     * @type {string[]}
     */
    let images = [];
    $: title = "";
    let subtitle = "";
    let desc = "";
    let solutionKey = "";
    let userPicture = "";
    let tabs = ["Pledge Timeline", "Comments", "About the project"];
    let activeTab = tabs[2]; // default active tab
    let loadingMsg = "Uploading data...";
    let active = false;
    let subtitleActive = false;
    let newImage = "";
    /**
     * @type {never[]}
     */
    let videos = [];
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
        if (tags.length > 5) {
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
    let isLoading = false;
    let success = false;

    async function onPost() {
        loadingMsg = "Uploading data...";
        document.body.scrollIntoView({ behavior: "smooth" });
        isLoading = true;

        let solutionPost = {
            title: title,
            subtitle: subtitle,
            description: desc,
            images: images,
            videos: videos,
            categories: tags,
            features: ideas,
            milestones: milestones,
        };
        isLoading = true;
        try {
            let creation = await setSolution(solutionPost, parentIdeaKey);
            if (typeof creation === "string") {
                error = true;
                errorMsg = creation;
            } else if (Array.isArray(creation) && creation.length > 0) {
                solutionKey = creation[0].key;
            } else {
                solutionKey = "";
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
     * @param {string} tag
     */
    function deleteIdea(tag) {
        let currentIndex = ideasTitle.indexOf(tag);
        ideas.splice(currentIndex, 1);
        ideasTitle.splice(currentIndex, 1);
        ideasTitle = [...ideasTitle];
        ideas = [...ideas];
    }
    let user = "";
    onMount(async () => {
        if (!(await CheckIfSignedIn())) {
            path.set("/createsolution/" + data.params.idea_id);
            goto("/signin/");
        }
        isLoading = true;
        loadingMsg = "Checking parent's idea existance...";

        let parentDoc = await getDoc({
            collection: "index_search",
            key: "INDEX_" + data.params.idea_id,
        });
        user = await getUserKey();
        isLoading = false;
        if (typeof parentDoc == "undefined") {
            error = true;
            errorMsg = "Parent idea non-existent";
        } else {
            parentIdeaKey = data.params.idea_id;
            parentIdeaTitle = parentDoc.data.title;
        }
    });

    /**
     * @type {string[]}
     */
    let ideasTitle = [];
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
                <!-- <InlineCalendar {theme} /> -->

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
                            {
                                title: parentIdeaTitle,
                                link: "/idea/" + parentIdeaKey,
                            },
                            { title: title, link: "/" },
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
                    class="InputText"
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
            <h3>Which ideas/ features are you going to be solving ?</h3>
            <SearchBarLarger
                bind:ideas
                {parentIdeaKey}
                bind:ideasNames={ideasTitle}
            />
            <TagsDisplay bind:tags={ideasTitle} deleteFunction={deleteIdea} />
            <h3>Roadmap: set important milestones</h3>
            <TimelineEdit bind:milestones />
            <br />
            <div
                style="display: flex; justify-content:center;align-items:center;"
            >
                <BasicButtonDark
                    msg={"Propose solution"}
                    icon={"cognition"}
                    someFunction={() => {
                        onPost();
                    }}
                />
            </div>
        </div>
    {:else if success}
        <SuccessNew
            message={"Solution created successfully"}
            someFunction={() => {
                goto("/solution/" + solutionKey);
            }}
        />
    {:else if error}
        <ErrorMessage
            message={"The creation of the feature failed."}
            error={errorMsg}
            someFunction={() => {
                error = false;
            }}
        />
    {:else}
        <LoadingNew message={loadingMsg} />
    {/if}
</div>

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
        align-items: flex-start; /* aligns items at the top */
        width: 100%;

        min-height: 100vh;
        z-index: 0;
    }
    .content {
        width: 80%;
        max-width: 800px;
        text-align: left; /* aligns the text to the left */

        margin: 30px auto 40px auto; /* top margin creates space from the top */
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
