<script>
    import BasicButton from "$lib/components/basicButton.svelte";
    import FollowersSection from "$lib/components/followersSection.svelte";
    import ImageScroller from "$lib/components/imageScroller.svelte";
    import PledgersSection from "$lib/components/pledgersSection.svelte";
    import ProfilePicture from "$lib/components/profilePicture.svelte";
    import ShareButton from "$lib/components/shareButton.svelte";

    import TransactionDisplay from "$lib/components/TransactionDisplay.svelte";
    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";
    import Breadcrumbs from "$lib/components/breadcrumbs.svelte";
    import PageTabs from "$lib/components/PageTabs.svelte";
    import AboutProject from "$lib/components/AboutProject.svelte";
    import CommentSection from "$lib/components/CommentSection.svelte";
    import {
        confirmationModal,
        pledgeModal,
        editImages,
        UserKey,
    } from "$lib/stores/other_stores";
    import { onMount } from "svelte";
    import ModalPledgeFunds from "$lib/components/ModalPledgeFunds.svelte";

    import { goto } from "$app/navigation";
    import MagicalDotsAbsoluteSmall from "$lib/components/MagicalDotsAbsolut.svelte";
    import EditImagesSection from "$lib/components/EditImagesSection.svelte";
    import MagicalDots from "$lib/components/magicalDots.svelte";

    import {
        CheckIfFeatureIsImplemented,
        SolutionLink,
        getAmountPledgersAndImages,
        getIdeaIdByFeature,
        getProjectTitleFromKey,
        getTotalFollowers,
        getUserImages,
    } from "$lib/data_functions/get_functions";
    import {
        getTotalPledges,
        getTransactionsAndPledges,
    } from "$lib/financial_functions/financial_functions";
    import { getDoc } from "@junobuild/core-peer";
    import NotFound from "$lib/components/NotFound.svelte";
    import LoadingNew from "$lib/components/LoadingNew.svelte";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import { path } from "$lib/stores/redirect_store";
    import FundingBarNew from "$lib/components/FundingBarNew.svelte";
    import BasicButtonBlackWhite from "$lib/components/BasicButtonBlackWhite.svelte";
    import ModalConfirmation from "$lib/components/ModalConfirmation.svelte";
    import {
        deleteIdea,
        updateIdea,
    } from "$lib/data_functions/create_functions";
    import SubtitleSection from "$lib/components/SubtitleSection.svelte";
    import TitleSection from "$lib/components/TitleSection.svelte";
    import MagicalDotsSmall from "$lib/components/MagicalDotsSmall.svelte";

    /** @type {import('./$types').PageData} */
    // @ts-ignore
    export let data;
    let key = data.params.feature_id;
    let idea_id = "";
    /**
     * @type {string[]}
     */
    let images = [];
    /**
     * @type {string[]}
     */
    let oldImages = []; // Original images from the database (strings)

    /**
     * @type {{ localUrl: string, uploadedUrl: string }[]}
     */
    let newImages = []; // Used for image editing (objects)

    let title = "";
    let subtitle = "";
    let description = "";
    /**
     * @type {string[]}
     */
    let videos = [];
    /**
     * @type {string[]}
     */
    let categories = [];
    let user = "";
    let userPicture = "";
    let expected = 100000;
    let total = 120000;
    let totalFollowers = 14560;
    let amountPledgers = 100;
    let createdAt = "17 August, 2023";
    let isLoading = false;
    let ideaNonExistent = false;

    /**
     * @type {never[]}
     */
    export let transactions = [];
    let tabs = ["Pledge Timeline", "Comments", "About the idea"];
    let activeTab = tabs[2]; // default active tab
    // Function to change active tab
    /**
     * @param {string} tab
     */
    function setActiveTab(tab) {
        activeTab = tab;
    }
    function pledgeModalOpen() {
        pledgeModal.set(true);
    }

    onMount(async () => {
        isLoading = true;
        let doc = await getDoc({
            collection: "feature",
            key: key,
        });
        if (doc == undefined) {
            ideaNonExistent = true;
            isLoading = false;
        } else {
            images = doc.data.images;
            images = images;
            oldImages = doc.data.images;
            newImages = oldImages.map((image) => ({
                localUrl: image,
                uploadedUrl: image,
            }));
            title = doc.data.title;
            subtitle = doc.data.subtitle;
            description = doc.data.description;
            videos = doc.data.videos;
            categories = doc.data.categories;
            user = doc.owner ? doc.owner : "";
            userPicture = "";
            expected = 0;
            total = 0;
            totalFollowers = 0;
            amountPledgers = 0;
            createdAt = (doc.created_at ? doc.created_at : "").toString();
            idea_id = await getIdeaIdByFeature(key);
        }
        isLoading = false;
    });
    let modalErrorMsg = "Something went wrong when deleting the idea";
    $: modalError = false;
    $: modalLoading = false;
    $: modalSuccess = false;

    $: newTitle = title;
    async function saveTitle() {
        let ideaInfo = {
            title: newTitle,
            subtitle: subtitle,
            description: description,
            images: images,
            videos: videos,
            categories: categories,
        };
        let result = await updateIdea(key, ideaInfo, idea_id);
        console.log(result);
        if ("Ok" in result) {
            title = newTitle;
        } else {
            alert("Something went wrong when updating title: " + result.Err);
            newTitle = title;
        }
    }
    $: newSubtitle = subtitle;
    async function saveSubtitle() {
        let ideaInfo = {
            title: title,
            subtitle: newSubtitle,
            description: description,
            images: images,
            videos: videos,
            categories: categories,
        };
        let result = await updateIdea(key, ideaInfo, idea_id);
        console.log(result);
        if ("Ok" in result) {
            subtitle = newSubtitle;
        } else {
            alert("Something went wrong when updating subtitle: " + result.Err);
            newSubtitle = subtitle;
        }
    }

    $: newDescription = description;
    async function saveDescription() {
        let ideaInfo = {
            title: title,
            subtitle: subtitle,
            description: newDescription,
            images: images,
            videos: videos,
            categories: categories,
        };
        let result = await updateIdea(key, ideaInfo, idea_id);
        console.log(result);
        if ("Ok" in result) {
            description = newDescription;
        } else {
            alert(
                "Something went wrong when updating description: " + result.Err,
            );
            newDescription = description;
        }
    }

    $: editImagesLoading = false;
    async function saveImageChanges() {
        editImagesLoading = true;
        console.log(newImages.map((img) => img.uploadedUrl));
        let ideaInfo = {
            title: title,
            subtitle: subtitle,
            description: description,
            images: newImages.map((img) => img.uploadedUrl),
            videos: videos,
            categories: categories,
        };

        let result = await updateIdea(key, ideaInfo, idea_id);
        console.log(result);
        if ("Ok" in result) {
            images = newImages.map((img) => img.uploadedUrl);
            oldImages = newImages.map((img) => img.uploadedUrl);
        } else {
            alert(
                "Something went wrong when updating the images: " + result.Err,
            );
        }
        editImages.set(false);
        editImagesLoading = false;
    }

    async function cancelImageChanges() {
        newImages = oldImages.map((image) => ({
            localUrl: image,
            uploadedUrl: image,
        })); // Reset to the original state

        editImages.set(false);
    }
</script>

<div class="body">
    <div class="content">
        {#if !isLoading && !ideaNonExistent}
            <div class="container">
                <div class="Subtitle">
                    <SubtitleSection
                        {subtitle}
                        owner={user}
                        saveSubtitleFunction={saveSubtitle}
                        bind:newSubtitle
                    />
                </div>
                <div class="Title" style="color: var(--secondary-color);">
                    <TitleSection
                        {title}
                        owner={user}
                        saveTitleFunction={saveTitle}
                        bind:newTitle
                    />
                </div>
                <div class="Profile">
                    {#await getUserImages([user])}
                        <ProfilePicture src={""} />
                    {:then data}
                        <ProfilePicture src={data[0].image} userKey={user} />
                    {/await}
                </div>
                <div class="Pictures">
                    <ImageScroller
                        bind:newImages
                        saveChanges={saveImageChanges}
                        cancelChanges={cancelImageChanges}
                        owner={user}
                    />
                </div>
                <div class="EditImages" style="width: 100%; position:relative">
                    {#if editImagesLoading}
                        <MagicalDotsSmall />
                    {:else if $editImages}
                        <EditImagesSection
                            {key}
                            collection_db={"feature"}
                            bind:images={newImages}
                        />
                    {/if}
                </div>

                <div class="Breadcrumbs">
                    {#await getProjectTitleFromKey(idea_id)}
                        <Breadcrumbs
                            breadcrumbs={[
                                {
                                    title: "Home",
                                    link: "/",
                                },
                                {
                                    title: title,
                                    link: "/solution/" + key,
                                },
                            ]}
                        />
                    {:then data}
                        {#if data == ""}
                            <Breadcrumbs
                                breadcrumbs={[
                                    {
                                        title: "Home",
                                        link: "/",
                                    },
                                    {
                                        title: title,
                                        link: "/idea/" + key,
                                    },
                                ]}
                            />
                        {:else}
                            <Breadcrumbs
                                breadcrumbs={[
                                    {
                                        title: "Home",
                                        link: "/",
                                    },
                                    {
                                        title: data,
                                        link: "/topic/" + idea_id,
                                    },
                                    {
                                        title: title,
                                        link: "/idea/" + key,
                                    },
                                ]}
                            />
                        {/if}
                    {/await}
                </div>

                <div class="FundingSection">
                    {#await getTotalPledges(key, "IDEA")}
                        <div class="Funding-bar">
                            <MagicalDotsAbsoluteSmall />
                        </div>
                    {:then data}
                        <div class="Funding-bar">
                            <FundingBarNew
                                expected={data.expected}
                                total={data.pledges}
                            />
                        </div>
                        <div class="Funding-info">
                            <p
                                style="font-size:small; display:flex; justify-content:center;align-items:center;"
                            >
                                Prediction on past perfomance. No garantee of
                                payment. <a
                                    href="https://forum.solutio.one/-205/terms-and-conditions"
                                    style="color:blue; text-decoration:underline;"
                                    >Read more.</a
                                >
                            </p>
                        </div>
                    {/await}
                </div>
                <div class="PledgingSection">
                    <div class="PledgeButton">
                        <BasicButton
                            msg={"Pledge"}
                            someFunction={async () => {
                                if (await CheckIfSignedIn()) {
                                    pledgeModalOpen();
                                } else {
                                    path.set("/idea/" + key);
                                    goto("/signin/");
                                }
                            }}
                        />
                    </div>
                    <div class="PledgeInfo">
                        <p style="margin:0px; font-size:small;">
                            Fully refundable until second confirmation. <a
                                href="https://forum.solutio.one/-205/terms-and-conditions"
                                style="color:blue; text-decoration:underline;"
                                >Read more.</a
                            >
                        </p>
                    </div>
                    {#await getTotalFollowers(key)}
                        <MagicalDotsAbsoluteSmall />
                    {:then data}
                        <FollowersSection
                            amount={data}
                            element_key={key}
                            type={"idea"}
                        />
                    {/await}
                    <div
                        style="display: flex;
                justify-content: center; 
                align-items: center; 
                flex-direction: row; 
                gap:25px;
                justify-content:space-between;"
                    >
                        <div class="ShareButton"><ShareButton /></div>
                        <div class="PledgersSection">
                            {#await getAmountPledgersAndImages(key)}
                                <MagicalDotsAbsoluteSmall />
                            {:then data}
                                <PledgersSection
                                    pledgersAmount={data.amount}
                                    users={data.users}
                                />
                            {/await}
                        </div>
                    </div>
                    <div></div>
                </div>
                <div class="PledgeSectionMobile">
                    <div class="">
                        <BasicButton
                            msg={"Pledge"}
                            someFunction={async () => {
                                if (await CheckIfSignedIn()) {
                                    pledgeModalOpen();
                                } else {
                                    path.set("/idea/" + key);
                                    goto("/signin/");
                                }
                            }}
                        />
                    </div>
                    <div class="">
                        <p style="margin:0px; font-size:small;">
                            Fully refundable until second confirmation. <a
                                href="https://forum.solutio.one/-205/terms-and-conditions"
                                style="color:blue; text-decoration:underline;"
                                >Read more.</a
                            >
                        </p>
                    </div>
                </div>

                <div class="ActivitySection">
                    <div class="ActivityTabs" style="">
                        <div class="CommentsTab">
                            {#if user == $UserKey}
                                <BasicButtonDark
                                    msg={"Delete idea"}
                                    someFunction={() => {
                                        confirmationModal.set(true);
                                    }}
                                />
                                <ModalConfirmation
                                    message={"This action is irreversible. Are you sure you want to delete the idea?"}
                                    someFunction={async () => {
                                        modalLoading = true;
                                        modalError = false;
                                        modalSuccess = false;
                                        const result = await deleteIdea(key);
                                        modalLoading = false;
                                        if ("Ok" in result) {
                                            modalSuccess = true;
                                            setTimeout(() => {
                                                window.location.href =
                                                    "/topic/" + idea_id;
                                            }, 4000);
                                        } else {
                                            modalError = true;
                                            modalErrorMsg = result.Err;
                                        }
                                    }}
                                    errorMsg={modalErrorMsg}
                                    successMsg={"Your idea was deleted successfully"}
                                    loadingMsg={"Deleting idea..."}
                                    error={modalError}
                                    loading={modalLoading}
                                    success={modalSuccess}
                                />
                                <br />
                            {/if}

                            <div class="Add_Solution_Idea_Section">
                                {#await SolutionLink(idea_id)}
                                    <MagicalDotsAbsoluteSmall />
                                {:then data}
                                    {#if data != ""}
                                        {#await CheckIfFeatureIsImplemented(data, key)}
                                            <MagicalDotsAbsoluteSmall />
                                        {:then isImplemented}
                                            {#if isImplemented}
                                                <BasicButton
                                                    msg={"Check out the solution!"}
                                                    icon={"cognition"}
                                                    someFunction={() => {
                                                        goto(
                                                            "/solution/" + data,
                                                        );
                                                    }}
                                                />
                                            {:else}
                                                <p>
                                                    A solution was implemented,
                                                    but this feature was not
                                                    included. Check it out <a
                                                        href="/solution/{data}"
                                                        >here</a
                                                    >.
                                                </p>
                                            {/if}
                                        {/await}
                                    {:else}
                                        <BasicButtonDark
                                            msg={"Build a solution"}
                                            icon={"cognition"}
                                            someFunction={() => {
                                                goto(
                                                    "/createsolution/" +
                                                        idea_id,
                                                );
                                            }}
                                        />
                                    {/if}
                                {/await}
                                <br />
                            </div>
                        </div>
                        <div class="PledgersTab"></div>
                        <PageTabs {tabs} {activeTab} setActive={setActiveTab} />
                    </div>

                    <div class="ActivityContent">
                        {#if activeTab === tabs[0]}
                            {#await getTransactionsAndPledges(key)}
                                <MagicalDotsAbsoluteSmall />
                            {:then data}
                                <TransactionDisplay
                                    transactions={data ? data : []}
                                />
                            {/await}
                        {:else if activeTab === tabs[1]}
                            <CommentSection project_id={key} />
                        {:else if activeTab === tabs[2]}
                            <AboutProject
                                {description}
                                owner={user}
                                saveDescriptionFunction={saveDescription}
                                bind:newDescription
                            />
                        {/if}
                    </div>
                </div>
                <ModalPledgeFunds {idea_id} feature_id={key} />
            </div>
        {:else if ideaNonExistent}
            <NotFound />
        {:else}
            <LoadingNew message={"Loading data..."} />
        {/if}
        <br />
    </div>
</div>
<svelte:head>
    <meta name="twitter:card" content="summary" />
    <meta charset="utf-8" />
    <title>{title}</title>
    <meta name="description" content={subtitle} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={subtitle} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={window.location.toString()} />
    <meta property="og:image" content={images[0]} />

    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={subtitle} />
    <meta name="twitter:image" content={images[0]} />
</svelte:head>

<style>
    .body {
        display: flex;
        justify-content: center;
        align-items: flex-start; /* aligns items at the top */
        width: 100%;

        min-height: 100vh;
        z-index: 0;
    }

    .container {
        display: grid;
        grid-template-columns: 0.3fr 1.8fr 0.9fr;
        grid-template-rows: 0fr 0fr 0fr 0fr 0fr 0fr 0fr 0fr 0fr 0fr;
        gap: 13px 0px;
        grid-auto-flow: row;
        grid-template-areas:
            "Breadcrumbs Breadcrumbs Breadcrumbs"
            "Profile Title Title"
            "Subtitle Subtitle Subtitle"
            "Pictures Pictures Pictures"
            "EditImages EditImages EditImages"
            "FundingSection FundingSection FundingSection"
            "PledgingSection PledgingSection PledgingSection"
            "Solution-section Solution-section Solution-section"
            "PledgeSectionMobile PledgeSectionMobile PledgeSectionMobile"
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
        width: 100%;
        background-color: var(--secondary-color);
        position: relative;
    }
    .EditImages {
        grid-area: EditImages;
    }

    .Breadcrumbs {
        grid-area: Breadcrumbs;
        display: flex;
        justify-content: left;
        text-align: left;
        align-items: center;
        gap: 30px;
    }

    .Pictures-scroller {
        display: grid;
        grid-template-columns: 1fr 0.9fr 1.1fr;
        grid-template-rows: 3.6fr 2.7fr 3.6fr;
        gap: 10px 0px;
        grid-auto-flow: row;
        grid-template-areas:
            ". Scroller ."
            ". Scroller ."
            ". . .";
        grid-area: Pictures-scroller;
        border: 3px solid green;
    }

    .Scroller {
        grid-area: Scroller;
    }

    .FundingSection {
        display: grid;
        grid-template-columns: 0fr 1fr 0fr;
        grid-template-rows: 0fr 0fr;
        gap: 10px 0px;
        grid-auto-flow: row;
        grid-template-areas:
            "Funding-bar Funding-bar Funding-bar"
            ". Funding-info .";
        grid-area: FundingSection;
        height: 80px;
    }

    .Funding-bar {
        grid-area: Funding-bar;
    }

    .Funding-info {
        grid-area: Funding-info;
    }

    .PledgingSection {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 0fr;
        grid-template-rows: 0.5fr 0.5fr;
        gap: 15px 0px;
        grid-auto-flow: row;

        grid-template-areas:
            "FollowersSection PledgeButton ShareButton PledgersSection"
            ". PledgeInfo . PledgersSection";
        grid-area: PledgingSection;
    }

    .PledgeButton {
        grid-area: PledgeButton;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;
        margin: 0px;
    }

    .PledgeInfo {
        grid-area: PledgeInfo;
        text-align: center;
    }
    .PledgeSectionMobile {
        grid-area: PledgeSectionMobile;
        visibility: hidden;
        width: 0px;
        height: 0px;
    }

    .HeartFollow {
        grid-area: 1 / 1 / 2 / 2;
    }

    .ShareButton {
        grid-area: ShareButton;
    }

    .PledgersSection {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 0.5fr 0.5fr;
        gap: 0px 0px;
        grid-auto-flow: row;
        grid-template-areas:
            "PledgersAmount"
            "PledgersPictures";
        grid-area: PledgersSection;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        width: fit-content;
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
        grid-template-rows: 1fr;
        gap: 0px 0px;
        grid-auto-flow: row;
        grid-template-areas: "CommentsTab PledgersTab";
        grid-area: ActivityTabs;
    }

    .CommentsTab {
        grid-area: CommentsTab;
    }

    .PledgersTab {
        grid-area: PledgersTab;
    }

    .ActivityContent {
        grid-area: ActivityContent;
        height: fit-content;
        width: 100%;
    }
    .Add_Solution_Idea_Section {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;
        margin-bottom: 2%;
        width: 100%;
    }
    @media (max-width: 838px) {
        .Title {
            grid-area: Title;
            margin-left: 25px;
        }
        .Profile {
            margin-left: 15px;
        }
        .PledgingSection {
            display: grid;
            grid-template-columns: auto auto auto;
            grid-template-rows: auto auto;
            gap: 0px 15px;
            grid-auto-flow: row;

            grid-template-areas:
                "FollowersSection ShareButton PledgersSection"
                " PledgeInfo PledgersSection";
            grid-area: PledgingSection;
            justify-content: center;
            align-items: center;
        }
        .PledgeSectionMobile {
            visibility: visible;
            height: fit-content;
            width: fit-content;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            margin-top: 25px;
            margin-bottom: 15px;
        }
    }

    @media (max-width: 480px) {
        .FundingSection {
            display: grid;
            grid-template-columns: 0fr 1fr 0fr;
            grid-template-rows: 0fr 0fr;
            gap: 10px 0px;
            grid-auto-flow: row;
            grid-template-areas:
                ". Funding-bar ."
                ". Funding-info .";
            grid-area: FundingSection;
            height: 80px;
            padding-inline: 10px;
        }
        .PledgingSection {
            display: grid;
            grid-template-columns: auto auto auto;
            grid-template-rows: auto auto auto;
            gap: 0px 15px;
            grid-auto-flow: row;

            grid-template-areas:
                "FollowersSection ShareButton PledgersSection"
                "PledgeInfo PledgersSection"
                "PledgeInfo";
            grid-area: PledgingSection;
            justify-content: center;
            align-items: center;
        }
        .PledgeButton {
            visibility: hidden;
            height: 0px;
            width: 0px;
        }
        .PledgeInfo {
            visibility: hidden;
            height: 0px;
            width: 0px;
        }
        .Title {
            grid-area: Title;
            margin-left: 25px;
        }
        .Profile {
            margin-left: 15px;
        }
    }
</style>
