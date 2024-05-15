<script>
    import ImageScrollerEdit from "$lib/components/ImageScroller_Edit.svelte";
    /**
     * @type {ImageScrollerEdit}
     */
    let imageScroller;

    import ProfilePicture from "$lib/components/profilePicture.svelte";
    import { nanoid } from "nanoid";
    import Breadcrumbs from "$lib/components/breadcrumbs.svelte";
    import PageTabs from "$lib/components/PageTabs.svelte";
    import AboutProject from "$lib/components/AboutProject.svelte";
    import CommentSection from "$lib/components/CommentSection.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import EditSubtitle from "$lib/components/EditSubtitle.svelte";
    import EditTitle from "$lib/components/EditTitle.svelte";
    import BasicButtonSmall from "$lib/components/BasicButton_Small.svelte";
    import BasicButtonDarkSmall from "$lib/components/BasicButton_Dark_Small.svelte";
    import DescriptionEdit from "$lib/components/DescriptionEdit.svelte";
    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";
    //import { success, isLoading } from "$lib/stores/other_stores";
    import Loading from "$lib/components/loading.svelte";
    import Success from "$lib/components/success.svelte";
    import { goto } from "$app/navigation";
    import AddFeaturesSection from "$lib/components/AddFeaturesSection.svelte";

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
    let description =
        "This idea is a decentralized platform designed to transform how ideas are shared, developed, and funded. Users can submit ideas, crowdsource feature requests to address these ideas, and crowdfund resources to bring the best features to life. This platform leverages blockchain technology to ensure transparency and fairness, allowing contributors to earn bounties and users to pay only upon delivery. Solutio's innovative use of a reputation system enhances safety and trust without requiring KYC, supporting anonymous accounts for those prioritizing privacy.";
    let user = "Johannes Jung";
    let userPicture =
        "https://i.pinimg.com/474x/05/c3/59/05c359cd010df3e7f1ea3cb6f6f54fad.jpg";
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
        if (tags.length > 9) {
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
        document.body.scrollIntoView({ behavior: "smooth" });
        isLoading = true;

        setTimeout(() => {
            isLoading = false;
            success = true;
        }, 2500);
    }
    /**
     * @type {never[]}
     */
    let ideas = [];
</script>

<div class="body">
    {#if !isLoading && !success}
        <div class="content">
            <div class="container">
                <div class="Subtitle">
                    <EditSubtitle title={subtitle} active={subtitleActive} />
                    <div style="height: 10px;"></div>
                </div>

                <div class="Title">
                    <EditTitle {active} {title} />
                    <div style="height: 10px;"></div>
                </div>
                <div class="Profile">
                    <ProfilePicture src={userPicture} />
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
                            <DescriptionEdit />
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
                    }}
                />
                <BasicButtonDarkSmall msg={"Add tag"} someFunction={addTag} />
            </div>
            {#if tagsTooLong}
                <p class="InputErrorMessage">
                    You can't have more than 10 tags.
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
            <AddFeaturesSection {ideas} />
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
        <div
            style="display: flex; justify-content:center; align-items:center; flex-direction:column"
        >
            <Success msg={"Idea created successfully"} />
            <BasicButtonDark
                msg={"See the new idea created"}
                someFunction={() => {
                    goto("/feature");
                }}
            />
        </div>
    {:else}
        <Loading msg={"Uploading data"} width={30} />
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
        grid-template-rows: 0fr 0fr 0fr 0fr 0fr 0fr 0fr 0fr 0fr 0fr;
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

    .Subtitle {
        grid-area: Subtitle;
    }

    .Title {
        grid-area: Title;
    }

    .Profile {
        grid-area: Profile;
        border-radius: 0%;
        display: flex;
        justify-content: center;
        align-items: center;
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
