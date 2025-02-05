<script>
    import IdeaCard from "$lib/components/IdeaCard.svelte";
    import BasicButton from "$lib/components/basicButton.svelte";
    import FollowersSection from "$lib/components/followersSection.svelte";
    import FundingBar from "$lib/components/fundingBar.svelte";
    import ImageScroller from "$lib/components/imageScroller.svelte";
    import PledgersSection from "$lib/components/pledgersSection.svelte";
    import ProfilePicture from "$lib/components/profilePicture.svelte";
    import ShareButton from "$lib/components/shareButton.svelte";
    import IdeaCardContainer from "$lib/components/IdeaCard_container.svelte";
    import TransactionDisplay from "$lib/components/TransactionDisplay.svelte";
    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";
    import Breadcrumbs from "$lib/components/breadcrumbs.svelte";
    import PageTabs from "$lib/components/PageTabs.svelte";
    import AboutProject from "$lib/components/AboutProject.svelte";
    import CommentSection from "$lib/components/CommentSection.svelte";
    import {
        confirmationModal,
        editImages,
        pledgeModal,
        success,
        UserKey,
    } from "$lib/stores/other_stores";
    import ModalPledgeFunds from "$lib/components/ModalPledgeFunds.svelte";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { getDoc } from "@junobuild/core-peer";
    import NotFound from "$lib/components/NotFound.svelte";
    import {
        getTotalPledges,
        getTotalPledgesOfSolution,
        getTransactionsAndPledges,
        getFundingInformation,
    } from "$lib/financial_functions/financial_functions";
    import FuindingDetails from "$lib/components/FundingDetails.svelte";
    import MagicalDotsAbsoluteSmall from "$lib/components/MagicalDotsAbsolut.svelte";
    import LoadingNew from "$lib/components/LoadingNew.svelte";
    import {
        SolutionLink,
        getAmountPledgersAndImages,
        getFeaturesOfIdea,
        getTotalFollowers,
        getUserImages,
    } from "$lib/data_functions/get_functions";
    import SuccessNew from "$lib/components/Success_New.svelte";
    import FollowersModalDisplay from "$lib/components/FollowersModalDisplay.svelte";
    import FundingBarNew from "$lib/components/FundingBarNew.svelte";
    import ModalConfirmation from "$lib/components/ModalConfirmation.svelte";
    import {
        deleteTopic,
        updateTopic,
    } from "$lib/data_functions/create_functions";
    import IconButton from "$lib/components/IconButton.svelte";
    import MagicalDotsSmall from "$lib/components/MagicalDotsSmall.svelte";
    import TitleSection from "$lib/components/TitleSection.svelte";
    import EditSubtitle from "$lib/components/EditSubtitle.svelte";
    import SubtitleSection from "$lib/components/SubtitleSection.svelte";
    import EditImagesSection from "$lib/components/EditImagesSection.svelte";
    import MagicalDots from "$lib/components/magicalDots.svelte";
    import { browser } from "$app/environment";
    import FloatingHelpText from "$lib/components/FloatingHelpText.svelte";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";

    /** @type {import('./$types').PageData} */
    export let data;
    let key = data.params.idea_id;
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
    $: browserTitle = title;
    let subtitle = "";
    let description = "";
    let user = "";
    let userPicture = "";
    let expected = 100000;
    let total = 120000;
    let totalFollowers = 14560;
    let amountPledgers = 100;
    let createdAt = "";
    /**
     * @type {string[]}
     */
    let videos = [];
    /**
     * @type {string[]}
     */
    let categories = [];
    let isLoading = false;
    let ideaNonExistent = false;
    let tabs = ["Pledge Timeline", "Comments", "About the project"];
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
        // await initSatellite({ satelliteId: "svftd-daaaa-aaaal-adr3a-cai" });
        let doc = await getDoc({
            collection: "idea",
            key: key,
        });
        if (doc == undefined) {
            isLoading = false;
            ideaNonExistent = true;
        } else {
            let data = doc.data;
            images = doc.data.images;
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
            expected = 100000;
            total = 120000;
            totalFollowers = 14560;
            amountPledgers = 100;
            createdAt = (doc.created_at ? doc.created_at : "").toString();
        }
        isLoading = false;
    });
    let modalErrorMsg = "Something went wrong when deleting the idea";
    $: modalError = false;
    $: modalLoading = false;
    $: modalSuccess = false;

    $: newTitle = title;
    async function saveTitle() {
        let topicInfo = {
            title: newTitle,
            subtitle: subtitle,
            description: description,
            images: images,
            videos: videos,
            categories: categories,
        };
        let result = await updateTopic(key, topicInfo);
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
        let topicInfo = {
            title: title,
            subtitle: newSubtitle,
            description: description,
            images: images,
            videos: videos,
            categories: categories,
        };
        let result = await updateTopic(key, topicInfo);
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
        let topicInfo = {
            title: title,
            subtitle: subtitle,
            description: newDescription,
            images: images,
            videos: videos,
            categories: categories,
        };
        let result = await updateTopic(key, topicInfo);
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
        if (newImages.map((img) => img.uploadedUrl).length > 5) {
            alert("You cant upload more than 5 images!");
            editImagesLoading = false;
            return;
        }
        let topicInfo = {
            title: title,
            subtitle: subtitle,
            description: description,
            images: newImages.map((img) => img.uploadedUrl),
            videos: videos,
            categories: categories,
        };

        let result = await updateTopic(key, topicInfo);
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
        {#if !isLoading && !$success && !ideaNonExistent}
            <FloatingHelpText
                msg={"What is Solutio?"}
                videoUrl={"https://youtube.com/embed/l3j0_dh60-0"}
                title={"What is Solutio?"}
                description={"Solutio is a platform to find like-minded people that share a common issue and crowdfund a solution together."}
                learnMoreLink={"https://home.solutio.one/"}
                NotSignedInCondition={true}
            />
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
                        <div style=" margin-top: 0px; ">
                            <EditImagesSection
                                {key}
                                collection_db={"idea"}
                                bind:images={newImages}
                            />
                        </div>
                    {/if}
                </div>

                <div class="Breadcrumbs">
                    <Breadcrumbs
                        breadcrumbs={[
                            { title: "Home", link: "/" },
                            { title: title, link: "/topic/" + key },
                        ]}
                    />
                </div>

                <div class="FundingSection">
                    {#await getFundingInformation("idea", key)}
                        <div class="Funding-bar">
                            <MagicalDotsAbsoluteSmall />
                        </div>
                    {:then data}
                        <div class="Funding-bar">
                            <!-- <FundingBarNew
                                expected={data.expected}
                                total={data.pledges}
                            /> -->
                            <FuindingDetails
                                element_id={key}
                                users={data.users}
                                element_type={"idea"}
                                amount_expected={data.total_expected}
                                amount_pledged={data.total_pledged}
                                amount_peldgers={data.total_pledgers}
                            />
                        </div>

                        <div class="Funding-info">
                            <p
                                style="font-size:small; display:flex; justify-content:center;align-items:center;"
                            >
                                Prediction on past perfomance. No guarantee of
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
                        <!-- <BasicButton
                            msg={"Pledge"}
                            someFunction={async () => {
                                if (await CheckIfSignedIn()) {
                                    pledgeModalOpen();
                                } else {
                                    goto("/signin/");
                                }
                            }}
                        /> -->
                    </div>
                    <div class="PledgeInfo">
                        <!-- <p style="margin:0px; font-size:small;">
                            Fully refundable until second confirmation. <span
                                style="text-decoration: underline;cursor:pointer;"
                                >Read more</span
                            >
                        </p> -->
                    </div>
                    {#await getTotalFollowers(key)}
                        <MagicalDotsAbsoluteSmall />
                    {:then data}
                        <FollowersSection
                            amount={data}
                            element_key={key}
                            type={"topic"}
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
                </div>

                <div class="FeaturesSection">
                    <div class="FeaturesTitle" style="margin-bottom: 20px;">
                        {#if user == $UserKey}
                            <BasicButtonDark
                                msg={"Delete topic"}
                                someFunction={() => {
                                    confirmationModal.set(true);
                                }}
                            />
                            <ModalConfirmation
                                message={"This action is irreversible. Are you sure you want to delete the topic?"}
                                someFunction={async () => {
                                    modalLoading = true;
                                    modalError = false;
                                    modalSuccess = false;
                                    const result = await deleteTopic(key);
                                    modalLoading = false;
                                    if ("Ok" in result) {
                                        modalSuccess = true;
                                        setTimeout(() => {
                                            window.location.href = "/";
                                        }, 4000);
                                    } else {
                                        modalError = true;
                                        modalErrorMsg = result.Err;
                                    }
                                }}
                                errorMsg={modalErrorMsg}
                                successMsg={"Your topic was deleted successfully"}
                                loadingMsg={"Deleting topic..."}
                                error={modalError}
                                loading={modalLoading}
                                success={modalSuccess}
                            />
                        {/if}
                    </div>
                    <div>
                        <IdeaCardContainer idea_id={key} />
                    </div>

                    <div class="FeaturesScrollerSection">
                        <!-- <div class="FeaturesScroller"><CardScroller /></div> -->
                    </div>
                </div>

                <div class="ActivitySection">
                    <div class="ActivityTabs">
                        <div class="CommentsTab">
                            <div class="Add_Solution_Idea_Section">
                                <BasicButtonDark
                                    msg={"Contribute idea"}
                                    icon={"emoji_objects"}
                                    someFunction={() => {
                                        goto("/createidea/" + key);
                                    }}
                                />
                                <br />
                                {#await SolutionLink(key)}
                                    <MagicalDotsAbsoluteSmall />
                                {:then data}
                                    {#if data != ""}
                                        <BasicButton
                                            msg={"Check out the solution!"}
                                            icon={"cognition"}
                                            someFunction={() => {
                                                goto("/solution/" + data);
                                            }}
                                        />
                                    {:else}
                                        <BasicButtonDark
                                            msg={"Build a solution"}
                                            icon={"cognition"}
                                            someFunction={() => {
                                                goto("/createsolution/" + key);
                                            }}
                                        />
                                    {/if}
                                {/await}
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
                <ModalPledgeFunds idea_id={key} feature_id={""} />
            </div>
        {:else if $success}
            <SuccessNew message={"Pledge successfully created"} />
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
        height: fit-content;
        margin-top: -13px;
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
        gap: 0px 0px;
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

    .FeaturesSection {
        display: grid;
        grid-template-columns: 3fr 0fr 0fr;
        grid-template-rows: 0fr 0fr 0fr;
        gap: 0px 0px;
        grid-auto-flow: row;
        grid-template-areas:
            "FeaturesTitle FeaturesTitle FeaturesTitle"
            "Features Features Features"
            "FeaturesScrollerSection FeaturesScrollerSection FeaturesScrollerSection";
        grid-area: FeaturesSection;
    }

    .FeaturesTitle {
        grid-area: FeaturesTitle;
    }

    .FeaturesScrollerSection {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 0fr 0.1fr 0fr;
        gap: 0px 0px;
        grid-auto-flow: row;
        grid-template-areas:
            ". FeaturesScroller ."
            ". FeaturesScroller ."
            ". FeaturesScroller .";
        grid-area: FeaturesScrollerSection;
    }

    .ActivitySection {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 0fr 1fr;
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
        gap: 10%;
        margin: 2%;
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
            gap: 0px 0px;
            grid-auto-flow: row;

            grid-template-areas:
                "FollowersSection ShareButton PledgersSection"
                " PledgeInfo PledgersSection";
            grid-area: PledgingSection;
            justify-content: center;
            align-items: center;
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
            height: fit-content;
            padding-inline: 0px;
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
        .Title {
            grid-area: Title;
            margin-left: 25px;
        }
        .Profile {
            margin-left: 15px;
        }
    }
</style>
