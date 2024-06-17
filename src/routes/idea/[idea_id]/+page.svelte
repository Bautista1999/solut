<script>
    import IdeaCard from "$lib/components/IdeaCard.svelte";
    import BasicButton from "$lib/components/basicButton.svelte";
    import FollowersSection from "$lib/components/followersSection.svelte";
    import FundingBar from "$lib/components/fundingBar.svelte";
    import ImageScroller from "$lib/components/imageScroller.svelte";
    import PledgersSection from "$lib/components/pledgersSection.svelte";
    import ProfilePicture from "$lib/components/profilePicture.svelte";
    import { nanoid } from "nanoid";
    import ShareButton from "$lib/components/shareButton.svelte";
    import IdeaCardContainer from "$lib/components/IdeaCard_container.svelte";
    import CardScroller from "$lib/components/CardScroller.svelte";
    import TransactionDisplay from "$lib/components/TransactionDisplay.svelte";
    import FinishProject from "$lib/components/finishProject.svelte";
    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";
    import { space } from "postcss/lib/list";
    import Breadcrumbs from "$lib/components/breadcrumbs.svelte";
    import PageTabs from "$lib/components/PageTabs.svelte";
    import AboutProject from "$lib/components/AboutProject.svelte";
    import CommentSection from "$lib/components/CommentSection.svelte";
    import { pledgeModal, success } from "$lib/stores/other_stores";
    import ModalPledgeFunds from "$lib/components/ModalPledgeFunds.svelte";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { getDoc, initSatellite } from "@junobuild/core-peer";
    import NotFound from "$lib/components/NotFound.svelte";
    import {
        getTotalPledges,
        getTransactions,
        getTransactionsAndPledges,
    } from "$lib/financial_functions/financial_functions";
    import MagicalDotsAbsoluteSmall from "$lib/components/MagicalDotsAbsoluteSmall.svelte";
    import LoadingNew from "$lib/components/LoadingNew.svelte";
    import {
        SolutionLink,
        getAmountPledgersAndImages,
        getFeaturesOfIdea,
        getTotalFollowers,
        getUserImages,
    } from "$lib/data_functions/get_functions";
    import SuccessNew from "$lib/components/Success_New.svelte";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import { getTransactions_byProject } from "$lib/testingInterface_logic/testing.interface.logic";
    import MagicalDots from "$lib/components/magicalDots.svelte";

    /** @type {import('./$types').PageData} */
    export let data;
    let key = data.params.idea_id;
    /**
     * @type {any[]}
     */
    let images = [];
    let title = "";
    let subtitle = "";
    let description = "";
    let user = "";
    let userPicture = "";
    let expected = 100000;
    let total = 120000;
    let totalFollowers = 14560;
    let amountPledgers = 100;
    let createdAt = "";
    let isLoading = false;
    let ideaNonExistent = false;
    /**
     * @type {never[]}
     */
    export let transactions = [];
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
            images = images;
            title = doc.data.title;
            subtitle = doc.data.subtitle;
            description = doc.data.description;
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
</script>

<div class="body">
    <div class="content">
        {#if !isLoading && !$success && !ideaNonExistent}
            <div class="container">
                <div class="Subtitle">{subtitle}</div>
                <div class="Title" style="color: var(--secondary-color);">
                    <h1>{title}</h1>
                </div>
                <div class="Profile">
                    {#await getUserImages([user])}
                        <ProfilePicture src={""} />
                    {:then data}
                        <ProfilePicture src={data[0].image} userKey={user} />
                    {/await}
                </div>
                <div class="Pictures">
                    <ImageScroller {images} />
                </div>

                <div class="Breadcrumbs">
                    <Breadcrumbs
                        breadcrumbs={[
                            { title: "Home", link: "/" },
                            { title: title, link: "/idea/" + key },
                        ]}
                    />
                </div>

                <div class="FundingSection">
                    {#await getTotalPledges(key, "IDEA")}
                        <div class="Funding-bar">
                            <MagicalDotsAbsoluteSmall />
                        </div>
                    {:then data}
                        <div class="Funding-bar">
                            <FundingBar
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
                            type={"idea"}
                        />
                    {/await}

                    <div
                        style="display: flex;
                justify-content: center; 
                align-items: center; 
                flex-direction: row; 
                gap:10px;
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
                    <div class="FeaturesTitle"><h3>Feature Requests</h3></div>
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

                                <br />
                                <BasicButtonDark
                                    msg={"Add feature-request"}
                                    icon={"emoji_objects"}
                                    someFunction={() => {
                                        goto("/createfeature/" + key);
                                    }}
                                />
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
                            <AboutProject {description} />
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
        margin: 20px auto 0 auto; /* top margin creates space from the top */
    }

    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 300,
            "GRAD" 0,
            "opsz" NaN;
        color: white;
    }
    .Pictures img {
        width: 100%; /* make the image stretch to cover the container */
        height: auto; /* automatic height to maintain aspect ratio */
        display: block; /* prevent extra space below the image */
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
        background-color: var(--secondary-color);
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

    .FollowersSection {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr;
        gap: 0px 0px;
        grid-auto-flow: row;
        grid-area: FollowersSection;
    }

    .Heart {
        grid-area: 1 / 1 / 2 / 2;
    }

    .Followers {
        grid-area: 1 / 2 / 2 / 3;
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

    .PledgersAmount {
        grid-area: PledgersAmount;
    }

    .PledgersPictures {
        grid-area: PledgersPictures;
    }

    .Solution-section {
        display: grid;
        grid-template-columns: 0fr 1fr 0fr;
        grid-template-rows: 1fr;
        gap: 0px 0px;
        grid-auto-flow: row;
        grid-template-areas: ". SolutionButton .";
        grid-area: Solution-section;
    }

    .SolutionButton {
        grid-area: SolutionButton;
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

    .Features {
        display: grid;
        grid-template-columns: 0fr;
        grid-template-rows: 0fr;
        gap: 10px 0px;
        grid-auto-flow: row;
        grid-template-areas:
            ". . ."
            ". . ."
            ". . .";
        grid-area: Features;
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

    .FeaturesScroller {
        grid-area: FeaturesScroller;
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
        min-height: 300px;
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
</style>
