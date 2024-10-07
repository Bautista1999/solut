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
    import WizardForm from "../../createtopic/WizardForm.svelte";

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
    let description = "";
    let solutionKey = "";
    let userPicture = "";
    let tabs = ["Pledge Timeline", "Comments", "About the project"];
    let activeTab = tabs[2]; // default active tab
    let loadingMsg = "Uploading data...";
    let active = false;
    let subtitleActive = false;
    let newImage = "";
    /**
     * @type {WizardForm}
     */
    let wizardFormComponent;
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
    let isLoading = false;
    let success = false;
    loadingMsg = "Uploading data...";
    $: noDescription = false;
    $: noTitle = false;
    $: noSubtitle = false;
    $: noIdeas = false;
    async function onPost() {
        document.body.scrollIntoView({ behavior: "smooth" });
        isLoading = true;
        // Check if the fields are empty and set the flags accordingly
        if (title == "") {
            noTitle = true;
        } else {
            noTitle = false;
        }
        if (subtitle == "") {
            noSubtitle = true;
        } else {
            noSubtitle = false;
        }
        if (description == "") {
            noDescription = true;
        } else {
            noDescription = false;
        }
        if (ideas.length == 0) {
            noIdeas = true;
        } else {
            noIdeas = false;
        }

        // If any field is empty, return early
        if (noTitle || noSubtitle || noDescription || ideas.length == 0) {
            isLoading = false;
            return;
        }

        let solutionPost = {
            title: title,
            subtitle: subtitle,
            description: description,
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
        loadingMsg = "Checking parent's topic existance...";

        let parentDoc = await getDoc({
            collection: "index_search",
            key: "INDEX_" + data.params.idea_id,
        });
        user = await getUserKey();
        isLoading = false;
        if (typeof parentDoc == "undefined") {
            error = true;
            errorMsg = "Parent topic non-existent";
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

<div class="container-form">
    {#if !isLoading && !success && !error}
        <WizardForm
            bind:this={wizardFormComponent}
            bind:title
            bind:subtitle
            bind:description
            bind:images
            bind:tags
            PostElement={onPost}
            type={"Solution"}
        >
            <div slot="additional-fields">
                <div class="form-section">
                    <label for="ideasSelected"
                        >Which ideas are you going to be solving?</label
                    >
                    <SearchBarLarger
                        bind:ideas
                        {parentIdeaKey}
                        bind:ideasNames={ideasTitle}
                        bind:noIdeas
                    />
                    <div class="field-info">
                        {#if ideas.length === 0}
                            <span class="required-field">*Required field</span>
                        {:else}
                            <span></span>
                        {/if}
                    </div>
                    <TagsDisplay
                        bind:tags={ideasTitle}
                        deleteFunction={deleteIdea}
                    />
                </div>
                <div class="form-section">
                    <label for="ideasSelected"
                        >Roadmap: set important milestones</label
                    >
                    <TimelineEdit bind:milestones />
                    <div class="field-info">
                        {#if milestones.length === 0}
                            <span class="required-field">*Required field</span>
                        {:else}
                            <span></span>
                        {/if}
                    </div>
                </div>
            </div>
        </WizardForm>
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
<svelte:head>
    <meta name="twitter:card" content="summary" />
    <meta charset="utf-8" />
    <title>Build Solution</title>
</svelte:head>

<style>
    @import "../../createtopic/createtopic.styles.css";
</style>
