<script>
    import ImageScrollerEdit from "$lib/components/ImageScroller_Edit.svelte";
    import SuccessNew from "$lib/components/Success_New.svelte";

    import { goto } from "$app/navigation";
    import {
        setFeature,
        setFeatures,
    } from "$lib/data_functions/create_functions";
    import ErrorMessage from "$lib/components/ErrorMessage.svelte";
    import LoadingNew from "$lib/components/LoadingNew.svelte";
    import { onMount } from "svelte";
    import { getDoc } from "@junobuild/core-peer";
    import { nanoid } from "nanoid";
    import { path } from "$lib/stores/redirect_store";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import { getUserKey } from "$lib/data_functions/get_functions";
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

    let isLoading = false;
    let success = false;
    let error = false;
    let errorMsg = "";
    let ideaKey = "";
    let loadingMsg = "Uploading data...";
    $: noDescription = false;
    $: noTitle = false;
    $: noSubtitle = false;
    let id = nanoid();
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
            let creation = await setFeature(ideaPost, parentIdeaKey, id); // Call to create a single feature

            if (typeof creation === "string" && creation.startsWith("ERROR:")) {
                error = true;
                errorMsg = creation; // Directly assign the error message
            } else {
                ideaKey = creation; // Set the key on success
            }
        } catch (e) {
            isLoading = false;
            error = true;
            console.error(e);
            errorMsg = `ERROR: ${String(e)}`; // Convert the error to a string and set as errorMsg
        }
        isLoading = false;
        if (!error) {
            success = true; // If no error, indicate success
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
            collection_db={"feature"}
            key={id}
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
                window.location.href = "/";
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
