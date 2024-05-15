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
    import { isLoading, pledgeModal, success } from "$lib/stores/other_stores";
    import { onMount } from "svelte";
    import ModalPledgeFunds from "$lib/components/ModalPledgeFunds.svelte";
    import Loading from "$lib/components/loading.svelte";
    import Success from "$lib/components/success.svelte";
    import { goto } from "$app/navigation";

    export let msg = "Label";
    /** @type {import('./$types').PageData} */
    // @ts-ignore
    export let data;
    let key = "";
    let images = [
        "https://cloudfront-us-east-2.images.arcpublishing.com/reuters/4CG5FU4IIJMHZCDXESLO7GEYDM.jpg",
        "https://media.ambito.com/p/9c57bcc58b3be5c19ea3a38d32f54fca/adjuntos/239/imagenes/038/684/0038684219/1200x675/smart/ethereum-banco-centraljpg.jpg",
        "https://s2-valor.glbimg.com/oXwS6x_i8WgCUl-XfqaLBdWpyRk=/0x0:3973x2649/888x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_63b422c2caee4269b8b34177e8876b93/internal_photos/bs/2023/V/1/0BYTKITrifXhSGhdSv5w/btc-e-eth-unsplash.jpg",
    ];
    let title = "Feature for that amazing idea";
    export let ideaTitle = title;
    let subtitle =
        "Empowering Innovation: Solutio's Decentralized Platform for Crowdsourcing and Collaborative Development. Located in Llyion, France. This app should try to go bananas on the features, should make ev";
    let description =
        "This idea is a decentralized platform designed to transform how ideas are shared, developed, and funded. Users can submit ideas, crowdsource feature requests to address these ideas, and crowdfund resources to bring the best features to life. This platform leverages blockchain technology to ensure transparency and fairness, allowing contributors to earn bounties and users to pay only upon delivery. Solutio's innovative use of a reputation system enhances safety and trust without requiring KYC, supporting anonymous accounts for those prioritizing privacy.";
    let user = "Johannes Jung";
    let userPicture =
        "https://i.pinimg.com/474x/05/c3/59/05c359cd010df3e7f1ea3cb6f6f54fad.jpg";
    let expected = 100000;
    let total = 120000;
    let totalFollowers = 14560;
    let amountPledgers = 100;
    let createdAt = "17 August, 2023";
    let pledgersImages = [
        "https://cdn.weasyl.com/static/media/88/89/98/8889989c353bd7d79a5a56daf9b118ed72a9b3f7f5c852f7c9daef6bbf105225.png",
        "https://avatarfiles.alphacoders.com/103/103875.png",
        "https://i.pinimg.com/236x/63/dd/c2/63ddc24b5f730d8fe4134708fbcc93df.jpg",
        "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg",
        "https://i.pinimg.com/474x/05/c3/59/05c359cd010df3e7f1ea3cb6f6f54fad.jpg",
    ];
    let featureExample = {
        title: title,
        subtitle: subtitle,
        description: description,
        expected: expected,
        total: total,
        image: images[0],
        key: nanoid(),
        user: user,
        userPicture: userPicture,
        createdAt: createdAt,
        pledgersImages: pledgersImages,
    };
    let featureExample2 = {
        title: title,
        subtitle: subtitle,
        description: description,
        expected: 500,
        total: 800,
        image: images[1],
        key: nanoid(),
        user: user,
        userPicture: pledgersImages[3],
        createdAt: createdAt,
        pledgersImages: pledgersImages.slice(0, 4),
    };
    let featureExample3 = {
        title: title,
        subtitle: subtitle,
        description: description,
        expected: 1700,
        total: 1750,
        image: images[2],
        key: nanoid(),
        user: user,
        userPicture: pledgersImages[2],
        createdAt: createdAt,
        pledgersImages: pledgersImages.slice(1, 4),
    };
    let featuresExamples = [
        featureExample,
        featureExample2,
        featureExample3,
        featureExample,
        // featureExample,
        // featureExample2,
        // featureExample,
        // featureExample,
        // featureExample3,
    ];
    let transaction = {
        image: images[0], // Replace with your image path
        transactionType: "Pledge",
        description: "erik_thebest",
        date: "17 July 2024",
        currency: "ICP",
        amount: "5.11",
    };
    let transaction2 = {
        image: images[1], // Replace with your image path
        transactionType: "Pledge",
        description: "eljuan_sito",
        date: "17 July 2024",
        currency: "ICP",
        amount: "4.03",
    };
    let transaction3 = {
        image: images[2], // Replace with your image path
        transactionType: "Pledge",
        description: "snassy.icp",
        date: "17 July 2024",
        currency: "ICP",
        amount: "3.45",
    };
    let transaction4 = {
        image: images[0], // Replace with your image path
        transactionType: "Pledge",
        description: "sakimoto--icp",
        date: "17 July 2024",
        currency: "ICP",
        amount: "11.45",
    };
    export let transactions = [
        transaction,
        transaction2,
        transaction3,
        transaction4,
    ];
    let tabs = ["Pledge Timeline", "Comments", "About the feature"];
    let activeTab = tabs[0]; // default active tab
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

    onMount(() => {
        isLoading.set(true);
        setTimeout(() => {
            isLoading.set(false);
        }, 2500);
    });
</script>

<div class="body">
    <div class="content">
        {#if !$isLoading && !$success}
            <div class="container">
                <div class="Subtitle">{subtitle}</div>
                <div class="Title" style="color: var(--secondary-color);">
                    <h1>{title}</h1>
                </div>
                <div class="Profile">
                    <ProfilePicture src={userPicture} />
                </div>
                <div class="Pictures">
                    <ImageScroller {images} />
                </div>

                <div class="Breadcrumbs">
                    <Breadcrumbs
                        breadcrumbs={[
                            {
                                title: "Home",
                                link: "/",
                            },
                            {
                                title: "An example of an amazing idea! Heres an Example",
                                link: "/idea",
                            },
                            {
                                title: title,
                                link: "/feature",
                            },
                        ]}
                    />
                </div>

                <div class="FundingSection">
                    <div class="Funding-bar">
                        <FundingBar {expected} {total} />
                    </div>
                    <div class="Funding-info">
                        <p
                            style="font-size:small; display:flex; justify-content:center;align-items:center;"
                        >
                            Prediction on past perfomance. No garantee of
                            payment. <span
                                style="text-decoration: underline;cursor:pointer;"
                            >
                                Read more</span
                            >
                        </p>
                    </div>
                </div>
                <div class="PledgingSection">
                    <div class="PledgeButton">
                        <BasicButton
                            msg={"Pledge"}
                            someFunction={pledgeModalOpen}
                        />
                    </div>
                    <div class="PledgeInfo">
                        <p style="margin:0px; font-size:small;">
                            Fully refundable until second confirmation. <span
                                style="text-decoration: underline;cursor:pointer;"
                                >Read more</span
                            >
                        </p>
                    </div>
                    <FollowersSection amount={totalFollowers} />
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
                            <PledgersSection
                                pledgersAmount={amountPledgers}
                                images={pledgersImages}
                            />
                        </div>
                    </div>
                </div>

                <div class="ActivitySection">
                    <div class="ActivityTabs" style="">
                        <div class="CommentsTab">
                            <div class="Add_Solution_Idea_Section">
                                <BasicButtonDark
                                    msg={"Propose a solution"}
                                    icon={"cognition"}
                                    someFunction={() => {
                                        goto("/createsolution");
                                    }}
                                />
                                <br />
                            </div>
                        </div>
                        <div class="PledgersTab"></div>
                        <PageTabs {tabs} {activeTab} setActive={setActiveTab} />
                    </div>

                    <div class="ActivityContent">
                        {#if activeTab === tabs[0]}
                            <TransactionDisplay {transactions} />
                        {:else if activeTab === tabs[1]}
                            <CommentSection project_id={key} />
                        {:else if activeTab === tabs[2]}
                            <AboutProject {description} />
                        {/if}
                    </div>
                </div>
                <ModalPledgeFunds />
            </div>
        {:else if $success}
            <Success msg={"Pledge successfully created"} />
        {:else}
            <Loading />
        {/if}
        <br />
    </div>
</div>

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
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 0fr 2.2fr 0.2fr;
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
        min-height: 300px;
        width: 100%;
        height: fit-content;
    }
    .Add_Solution_Idea_Section {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;
        margin-bottom: 2%;
        width: 100%;
    }
</style>
