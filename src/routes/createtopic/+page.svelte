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
    import { nanoid } from "nanoid";
    import FloatingHelpText from "$lib/components/FloatingHelpText.svelte";

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
    let id = nanoid();
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
            const creation = await setIdea(ideaPost, featuresPost, id);
            if (typeof creation === "string" && creation.startsWith("ERROR:")) {
                error = true;
                errorMsg = creation; // Directly assign the error message
            } else {
                ideaKey = creation; // Set the key on success
            }
        } catch (e) {
            error = true;
            errorMsg = String(e); // Handle any unexpected errors
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
            const returnPath = encodeURIComponent("/createtopic");
            window.location.href = `/signin?returnTo=${returnPath}`;
        }
        const user = await getUserKey();
    });
</script>

<br />
<FloatingHelpText
    msg={"How to create a topic?"}
    videoUrl={"https://youtube.com/embed/l3j0_dh60-0"}
    title={"How to create a topic?"}
    description={"Fundamentally, a topic is a challenge you are having and that could be easily be solved with the right software, or bug fix. So, in essence, here the objective is to describe the core issue you are facing."}
    learnMoreLink={"https://home.solutio.one/"}
    NotSignedInCondition={false}
    minimumWidth={250}
/>
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
            collection_db={"idea"}
            key={id}
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
<svelte:head>
    <meta name="twitter:card" content="summary" />
    <meta charset="utf-8" />
    <title>Create a topic</title>
    <meta name="description" content={"Create a topic using Solutio"} />
    <meta property="og:title" content={"Create a topic"} />
    <meta property="og:description" content={"Create a topic using Solutio"} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={window.location.toString()} />
    <meta
        property="og:image"
        content={"http://solutio.one/assets/LogoSol3.png"}
    />
    <meta name="twitter:title" content={"Create a topic"} />
    <meta name="twitter:description" content={"Create a topic using Solutio"} />
    <meta
        name="twitter:image"
        content={"http://solutio.one/assets/LogoSol3.png"}
    />
</svelte:head>

<style>
    @import "../createtopic/createtopic.styles.css";
</style>
