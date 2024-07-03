<script>
    import BasicButton from "$lib/components/basicButton.svelte";
    import FollowersSection from "$lib/components/followersSection.svelte";
    import FundingBar from "$lib/components/fundingBar.svelte";
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
    import Timeline from "$lib/components/Timeline.svelte";
    import {
        ApprovalModal,
        DeliveryModal,
        PaymentModal,
        RejectModal,
        pledgeModal,
    } from "$lib/stores/other_stores";
    import ModalPledgeFunds from "$lib/components/ModalPledgeFunds.svelte";
    import { onMount } from "svelte";

    import PaymentsModal from "$lib/components/PaymentsModal.svelte";
    import DeliverModal from "$lib/components/DeliverModal.svelte";
    import ModalApproval from "$lib/components/ModalApproval.svelte";
    import ModalReject from "$lib/components/ModalReject.svelte";
    import SuccessNew from "$lib/components/Success_New.svelte";
    import ErrorMessage from "$lib/components/ErrorMessage.svelte";
    import { getDoc, initSatellite } from "@junobuild/core-peer";
    import NotFound from "$lib/components/NotFound.svelte";
    import {
        extractIdeaIdFromString,
        getAmountPledgersAndImages,
        getDeliveryLink,
        getProjectTitleFromKey,
        getSolutionStatus,
        getTotalFollowers,
        getUserImages,
        getUserKey,
    } from "$lib/data_functions/get_functions";
    import LoadingNew from "$lib/components/LoadingNew.svelte";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import { goto } from "$app/navigation";
    import {
        ICPtoDecimal,
        getAmountOfUsersThatApproved,
        getApprovalsByProject,
        getPledgesOfSignedInUserInProject,
        getTotalAmountApprovedByProject,
        getTotalPledges,
        getTotalPledgesOfSolution,
        getTransactions,
        getTransactionsAndPledges,
        roundUpToThreeDecimalPlaces,
    } from "$lib/financial_functions/financial_functions";
    import MagicalDotsAbsoluteSmall from "$lib/components/MagicalDotsAbsolut.svelte";
    import { path } from "$lib/stores/redirect_store";
    import MagicalDots from "$lib/components/magicalDots.svelte";
    import LoadingModalNew from "$lib/components/LoadingModalNew.svelte";
    import IdeaCardContainer from "$lib/components/IdeaCard_container.svelte";

    let userKey = "";
    let ownerKey = "";
    let productLink = "";
    /** @type {import('./$types').PageData} */
    // @ts-ignore
    export let data;
    let key = data.params.solution_id;
    /**
     * @type {string[]}
     */
    let images = [];
    let title = "";
    let subtitle = "";
    let description = "";
    let user = "";
    let userPicture = "";
    let expected = 0;
    let total = 0;
    let totalFollowers = 0;
    let amountPledgers = 0;
    let approved = 0;
    let amountApprovals = 0;
    $: idea_id = "";

    let createdAt = "";

    let status = "";
    let isLoading = false;
    let success = false;
    let error = false;
    let solutionNonExistent = false;
    let errorMsg = "Something went wrong!";

    let tabs = ["Pledge Timeline", "Comments", "About the project"];
    let activeTab = tabs[2]; // default active tab
    /**
     * @type {never[]}
     */
    let milestones = [];
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
            collection: "solution",
            key: key,
        });
        if (doc == undefined) {
            isLoading = false;
            solutionNonExistent = true;
        } else {
            images = doc.data.images;
            images = images;
            title = doc.data.title;
            subtitle = doc.data.subtitle;
            description = doc.data.description;
            ownerKey = doc.owner ? doc.owner : "";
            // ownerKey = "kkk";
            createdAt = (doc.created_at ? doc.created_at : "").toString();
            if (doc.description != undefined) {
                idea_id = extractIdeaIdFromString(doc.description);
            }
            milestones = doc.data.milestones;
            userKey = await getUserKey();
        }
        isLoading = false;
    });

    async function getApprovalsNumbers() {
        let total = await getTotalAmountApprovedByProject(key);
        let approvals = await getAmountOfUsersThatApproved(key);
        return {
            approved: roundUpToThreeDecimalPlaces(ICPtoDecimal(BigInt(total))),
            amountApprovals: approvals,
        };
    }
</script>

<div class="body">
    <div class="content">
        {#if !isLoading && !success && !solutionNonExistent && !error}
            <div class="container">
                <div class="Subtitle">{subtitle}</div>
                <div class="Title" style="color: var(--secondary-color);">
                    <h1>{title}</h1>
                </div>
                <div class="Profile">
                    {#await getUserImages([ownerKey])}
                        <ProfilePicture src={""} userKey={ownerKey} />
                    {:then data}
                        <ProfilePicture
                            src={data[0].image}
                            userKey={ownerKey}
                        />
                    {/await}
                </div>
                <div class="Pictures">
                    <ImageScroller {images} />
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
                                        link: "/solution/" + key,
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
                                        link: "/idea/" + idea_id,
                                    },
                                    {
                                        title: title,
                                        link: "/solution/" + key,
                                    },
                                ]}
                            />
                        {/if}
                    {/await}
                </div>

                <div class="FundingSection">
                    {#await getTotalPledgesOfSolution(key)}
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
                                    path.set("/solution/" + key);
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
                            type={"solution"}
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
                            {#await getAmountPledgersAndImages(idea_id)}
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
                    <div class="FeaturesTitle">
                        <h3>Implemented ideas by this solution</h3>
                    </div>
                    <div>
                        <IdeaCardContainer
                            {idea_id}
                            solution_id={key}
                            type={"solution"}
                        />
                    </div>

                    <div class="FeaturesScrollerSection">
                        <!-- <div class="FeaturesScroller"><CardScroller /></div> -->
                    </div>
                </div>

                <div class="ActivitySection">
                    <div class="ActivityTabs">
                        {#await getSolutionStatus(key) then status}
                            {#if status == "delivered"}
                                <div class="approval-stats">
                                    {#await getApprovalsNumbers()}
                                        <div class="stat">
                                            <MagicalDotsAbsoluteSmall />
                                            <br />
                                            <span class="stat-label"
                                                >Total ICP Approved</span
                                            >
                                        </div>

                                        <div class="stat">
                                            <MagicalDotsAbsoluteSmall />
                                            <br />
                                            <span class="stat-label"
                                                >Users Approved</span
                                            >
                                        </div>
                                    {:then data}
                                        <div class="stat">
                                            <span class="stat-value"
                                                >{data.approved} ICP</span
                                            >
                                            <span class="stat-label"
                                                >Total ICP Approved</span
                                            >
                                        </div>

                                        <div class="stat">
                                            <span class="stat-value"
                                                >{data.amountApprovals}</span
                                            >
                                            <span class="stat-label"
                                                >Users Approved</span
                                            >
                                        </div>
                                    {/await}
                                </div>
                            {/if}
                        {/await}
                        <div class="PledgersTab"></div>
                        <PageTabs {tabs} {activeTab} setActive={setActiveTab} />
                    </div>

                    <div class="ActivityContent">
                        {#if activeTab === tabs[0]}
                            {#await getTransactionsAndPledges(idea_id)}
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
                    <br />
                    <h3>Roadmap and deadlines</h3>

                    <Timeline {milestones} />
                    <br />
                    <div
                        style="display: flex;
            justify-content: center; 
            align-items: center; 
            flex-direction: column; 
            background:linear-gradient(to right, var(--primary-color), var(--red-wine));
            padding-bottom:20px;
            gap:10px;
            "
                    >
                        {#await getSolutionStatus(key)}
                            <LoadingModalNew
                                message={"Getting status..."}
                                color={"var(--tertiary-color)"}
                            />
                        {:then status}
                            {#if userKey == ownerKey}
                                {#if status != "delivered" && status != "completed"}
                                    <h1 style="color: var(--tertiary-color);">
                                        Ready to deliver your solution?
                                    </h1>
                                    <BasicButtonDark
                                        msg={"Deliver product"}
                                        icon={"real_estate_agent"}
                                        someFunction={() => {
                                            DeliveryModal.set(true);
                                        }}
                                    />
                                {:else if status == "delivered"}
                                    <h1 style="color: var(--tertiary-color);">
                                        Solution completed?
                                    </h1>
                                    <BasicButtonDark
                                        msg={"Complete solution and accept payment"}
                                        icon={"payments"}
                                        someFunction={() => {
                                            PaymentModal.set(true);
                                        }}
                                    />
                                {/if}
                            {:else if status == "delivered"}
                                {#await getDeliveryLink(key)}
                                    <LoadingModalNew
                                        message={"Getting delivery link..."}
                                        color={"var(--tertiary-color)"}
                                    />
                                {:then link}
                                    <h1 style="color: var(--tertiary-color);">
                                        Project delivered!
                                    </h1>
                                    <div
                                        class="SmallSeparator HorizontallyAligned"
                                        style="text-align: center;"
                                    >
                                        <p
                                            style="color: var(--tertiary-color);"
                                        >
                                            This project has already been
                                            delivered.
                                        </p>
                                        <p
                                            style="color: var(--tertiary-color);"
                                        >
                                            You can see the product <a
                                                href={link}
                                                style="color:var(--sky-blue)"
                                                >here</a
                                            >.
                                        </p>
                                        <div class="HorizontallyAligned">
                                            {#await getPledgesOfSignedInUserInProject(key)}
                                                <MagicalDots />
                                            {:then data}
                                                {#if data.length == 0}
                                                    <p
                                                        style="color: var(--tertiary-color); font-style:italic;"
                                                    >
                                                        NOTE: You havent pledged
                                                        any money to approve or
                                                        disapprove this project.
                                                    </p>
                                                {:else}
                                                    <BasicButtonDark
                                                        msg={"Approve"}
                                                        icon={"verified_user"}
                                                        someFunction={async () => {
                                                            if (
                                                                await CheckIfSignedIn()
                                                            ) {
                                                                ApprovalModal.set(
                                                                    true,
                                                                );
                                                            } else {
                                                                path.set(
                                                                    "/solution/" +
                                                                        key,
                                                                );
                                                                goto(
                                                                    "/signin/",
                                                                );
                                                                return;
                                                            }
                                                        }}
                                                    />
                                                    <BasicButtonDark
                                                        msg={"Reject"}
                                                        icon={"cancel"}
                                                        someFunction={async () => {
                                                            if (
                                                                await CheckIfSignedIn()
                                                            ) {
                                                                RejectModal.set(
                                                                    true,
                                                                );
                                                            } else {
                                                                path.set(
                                                                    "/solution/" +
                                                                        key,
                                                                );
                                                                goto(
                                                                    "/signin/",
                                                                );
                                                                return;
                                                            }
                                                        }}
                                                    />
                                                {/if}
                                            {/await}
                                        </div>
                                    </div>
                                {/await}
                            {/if}
                        {/await}
                    </div>
                </div>
                <ModalPledgeFunds {idea_id} {userKey} feature_id={""} />
                <PaymentsModal solution_id={key} {idea_id} />
                <DeliverModal solution_id={key} />
                <ModalApproval solution_id={key} {idea_id} />
                <ModalReject solution_id={key} />
            </div>
        {:else if success}
            <SuccessNew message={"Pledge successfully created"} />
        {:else if error}
            <ErrorMessage error={errorMsg} />
        {:else if solutionNonExistent}
            <NotFound />
        {:else}
            <LoadingNew message={"Loading data..."} />
        {/if}
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

    .approval-stats {
        display: flex;
        justify-content: space-evenly;
        padding: 10px;
        margin-block: 10px;
        background-color: #f4f4f4; /* Light grey background */
        border: 1px solid var(--primary-color);
    }

    .stat {
        display: flex;
        flex-direction: column;
        align-items: center;

        padding: 5px;
    }

    .stat-value {
        font-size: 1.5em;
        color: #333;
        font-weight: bold;
    }

    .stat-label {
        font-size: 1em;
        color: #666;
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
