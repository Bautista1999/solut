<script>
    import ImageScrollerEdit from "$lib/components/ImageScroller_Edit.svelte";
    /**
     * @type {ImageScrollerEdit}
     */
    let imageScroller;

    import ProfilePicture from "$lib/components/profilePicture.svelte";
    import Breadcrumbs from "$lib/components/breadcrumbs.svelte";
    import SuccessNew from "$lib/components/Success_New.svelte";

    import EditSubtitle from "$lib/components/EditSubtitle.svelte";
    import EditTitle from "$lib/components/EditTitle.svelte";
    import BasicButtonDarkSmall from "$lib/components/BasicButton_Dark_Small.svelte";
    import DescriptionEdit from "$lib/components/DescriptionEdit.svelte";
    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";

    import { goto } from "$app/navigation";
    import { setFeatures } from "$lib/data_functions/create_functions";
    import ErrorMessage from "$lib/components/ErrorMessage.svelte";
    import LoadingNew from "$lib/components/LoadingNew.svelte";
    import { onMount } from "svelte";
    import { getDoc } from "@junobuild/core-peer";
    import { path } from "$lib/stores/redirect_store";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import {
        getUserImages,
        getUserKey,
    } from "$lib/data_functions/get_functions";
    import { UserKey } from "$lib/stores/other_stores";
    import WizardForm from "../../createtopic/WizardForm.svelte";

    let key = "";
    /**
     * @type {string[]}
     */
    let images = [];
    $: title = "";
    /** @type {import('./$types').PageData} */
    export let data;
    let parentIdeaTitle = "";
    let subtitle = "";
    let description = "";
    let user = "";
    let userPicture = "";
    /**
     * @type {WizardForm}
     */
    let wizardFormComponent;
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
     * @type {never[]}
     */
    let videos = [];
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
    let isLoading = false;
    let success = false;
    let error = false;
    let errorMsg = "";
    let ideaKey = "";
    let loadingMsg = "Uploading data...";
    $: noDescription = false;
    $: noTitle = false;
    $: noSubtitle = false;
    async function onPost() {
        document.body.scrollIntoView({ behavior: "smooth" });
        isLoading = true;

        // If any field is empty, return early
        if (noTitle || noSubtitle || noDescription) {
            isLoading = false;
            return;
        }
        let ideaPost = {
            title: title,
            subtitle: subtitle,
            description: description,
            images: images,
            videos: videos,
            categories: tags,
        };
        isLoading = true;
        try {
            let creation = await setFeatures([ideaPost], parentIdeaKey);
            if (typeof creation === "string") {
                error = true;
                errorMsg = creation;
            } else if (Array.isArray(creation) && creation.length > 0) {
                ideaKey = creation[0].key;
            } else {
                ideaKey = "";
            }
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
    let parentIdeaKey = "";
    onMount(async () => {
        if (!(await CheckIfSignedIn())) {
            path.set("/createidea/" + data.params.idea_id);
            goto("/signin/");
        }
        user = await getUserKey();
        isLoading = true;
        loadingMsg = "Checking parent's topic existance...";
        let parentDoc = await getDoc({
            collection: "index_search",
            key: "INDEX_" + data.params.idea_id,
        });
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
     * @type {never[]}
     */
    let ideas = [];
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
            type={"Idea"}
        ></WizardForm>
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
    <title>Create idea</title>
</svelte:head>

<style>
    @import "../../createtopic/createtopic.styles.css";
</style>
