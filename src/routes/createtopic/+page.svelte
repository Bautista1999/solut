<script>
    import AddFeaturesSection from "$lib/components/AddFeaturesSection.svelte";
    import BasicRoundedButton from "$lib/components/BasicRoundedButton.svelte";
    import { setIdea } from "$lib/data_functions/create_functions";
    import { onMount } from "svelte";
    import WizardForm from "./WizardForm.svelte";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import { path } from "$lib/stores/redirect_store";
    import { getUserKey } from "$lib/data_functions/get_functions";
    import { goto } from "$app/navigation";
    import SuccessNew from "$lib/components/Success_New.svelte";
    import ErrorMessage from "$lib/components/ErrorMessage.svelte";
    import LoadingNew from "$lib/components/LoadingNew.svelte";
    let category = "";
    /**
     * @type {WizardForm}
     */
    let wizardFormComponent;
    /**
     * @param {any} event
     */
    function updateCategory(event) {
        category = event.target.value;
        wizardFormComponent.updateFieldStatus("category", category !== "");
    }
    /**
     * @type {import("$lib/data_objects/data_types").feature[]}
     */
    let ideas = [];

    let success = false;
    /**
     * @type {never[]}
     */
    $: videos = [];
    let ideaKey = "";
    $: title = "";
    $: subtitle = "";
    $: description = "";
    /**
     * @type {string[]}
     */
    $: images = [];
    /**
     * @type {string[]}
     */
    $: tags = [];
    $: noDescription = false;
    $: noTitle = false;
    $: noSubtitle = false;
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

    let error = false;
    let isLoading = false;
    let errorMsg = "";

    onMount(async () => {
        if (!(await CheckIfSignedIn())) {
            path.set("/createtopic");
            goto("/signin/");
        }
        const user = await getUserKey();
    });
</script>

<div class="container">
    {#if !isLoading && !success && !error}
        <WizardForm
            bind:this={wizardFormComponent}
            bind:title
            bind:subtitle
            bind:description
            bind:images
            bind:tags
            PostElement={onPost}
        >
            <div slot="additional-fields" class="form-section">
                <label for="ideas"
                    >You have some ideas for this topic? Include them here! <span
                        class="optionalText">(Optional field)</span
                    ></label
                >
                <AddFeaturesSection bind:ideas />
            </div>
        </WizardForm>
    {:else if success}
        <SuccessNew
            message={"Topic created successfully"}
            someFunction={() => {
                goto("/topic/" + ideaKey);
            }}
        />
    {:else if error}
        <ErrorMessage
            message={"The creation of the topic failed."}
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

<style>
    @import "../createtopic/createtopic.styles.css";
</style>
