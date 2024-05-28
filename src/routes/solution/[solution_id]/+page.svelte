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
        getProjectTitleFromKey,
        getUserImages,
    } from "$lib/data_functions/get_functions";
    import LoadingNew from "$lib/components/LoadingNew.svelte";
    import {junoInitialized} from "$lib/stores/app.state";

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
    let idea_id = "";

    let createdAt = "";

    let status = "";
    let isLoading = false;
    let success = false;
    let error = false;
    let solutionNonExistent = false;
    let errorMsg = "Something went wrong!";

    /**
     * @type {never[]}
     */
    export let transactions = [];
    let tabs = ["Pledge Timeline", "Comments", "About the project"];
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
    const load = async () => {
        if (!$junoInitialized) {
            return;
        }

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
            user = doc.owner ? doc.owner : "";
            createdAt = (doc.created_at ? doc.created_at : "").toString();
            if (doc.description != undefined) {
                idea_id = extractIdeaIdFromString(doc.description);
            }
        }
        isLoading = false;
    };

    $: $junoInitialized, (async () => await load())()
</script>

<div class="body">
    <div class="content">
        {#if $junoInitialized && !isLoading && !success && !solutionNonExistent && !error}
            <div class="container">
                <div class="Subtitle">{subtitle}</div>
                <div class="Title" style="color: var(--secondary-color);">
                    <h1>{title}</h1>
                </div>
                <div class="Profile">
                    {#await getUserImages([user])}
                        <ProfilePicture src={""} userKey={user} />
                    {:then data}
                        <ProfilePicture src={data[0].image} userKey={user} />
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
                                users={[]}
                            />
                        </div>
                    </div>
                </div>

                <div class="ActivitySection">
                    <div class="ActivityTabs">
                        {#if status == "DELIVERED"}
                            <div class="approval-stats">
                                <div class="stat">
                                    <span class="stat-value"
                                        >{approved} ICP</span
                                    >
                                    <span class="stat-label"
                                        >Total ICP Approved</span
                                    >
                                </div>

                                <div class="stat">
                                    <span class="stat-value"
                                        >{amountApprovals}</span
                                    >
                                    <span class="stat-label"
                                        >Users Approved</span
                                    >
                                </div>
                            </div>
                        {/if}
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
                    <br />
                    <h3>Roadmap and deadlines</h3>
                    <Timeline />
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
                        {#if userKey == ownerKey}
                            {#if status != "DELIVERED" && status != "COMPLETED"}
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
                            {:else if status == "DELIVERED"}
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
                        {:else if status == "DELIVERED"}
                            <h1 style="color: var(--tertiary-color);">
                                Project delivered!
                            </h1>
                            <div
                                class="SmallSeparator HorizontallyAligned"
                                style="text-align: center;"
                            >
                                <p style="color: var(--tertiary-color);">
                                    This project has already been delivered. You
                                    can either approve or dissapprove it.
                                </p>
                                <p style="color: var(--tertiary-color);">
                                    You can see the product <a
                                        href={productLink}>here</a
                                    >.
                                </p>
                                <div class="HorizontallyAligned">
                                    <BasicButtonDark
                                        msg={"Approve"}
                                        icon={"verified_user"}
                                        someFunction={() => {
                                            ApprovalModal.set(true);
                                        }}
                                    />
                                    <BasicButtonDark
                                        msg={"Reject"}
                                        icon={"cancel"}
                                        someFunction={() => {
                                            RejectModal.set(true);
                                        }}
                                    />
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
                <ModalPledgeFunds {idea_id} {userKey} feature_id={""} />
                <PaymentsModal />
                <DeliverModal />
                <ModalApproval />
                <ModalReject />
            </div>
        {:else if success}
            <SuccessNew message={"Pledge successfully created"} />
        {:else if error}
            <ErrorMessage error={errorMsg} />
        {:else if solutionNonExistent}
            <NotFound />
        {:else}
            <LoadingNew />
        {/if}
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

    .approval-stats {
        display: flex;
        justify-content: space-evenly;
        padding: 10px;
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
        min-height: 300px;
        border-bottom: 1px solid var(--secondary-color);
        width: 100%;
        height: fit-content;
    }
    .Add_Solution_Idea_Section {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;
        margin-bottom: 2%;
    }
</style>
