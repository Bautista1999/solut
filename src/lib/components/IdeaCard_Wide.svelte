<script>
    import { goto } from "$app/navigation";
    import {
        getAmountPledgersAndImages,
        getImageUrl,
        getTotalFollowers,
        getUserImages,
    } from "$lib/data_functions/get_functions";
    import { getTotalPledges } from "$lib/financial_functions/financial_functions";
    import MagicalDotsAbsoluteSmall from "./MagicalDotsAbsoluteSmall.svelte";
    import FundingBar from "./fundingBar.svelte";
    import PledgersSection from "./pledgersSection.svelte";
    import ProfilePicture from "./profilePicture.svelte";
    import UsersOverview from "./usersOverview.svelte";

    /**
     * @type {{
    key: string;
    data: import("$lib/data_objects/data_types").IndexDataReturn;
}}
     */
    export let idea;
    export let padding = 7;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class="container"
    on:click={() => goto("/" + idea.data.type + "/" + idea.key)}
>
    <div class="Image">
        <img
            src={idea.data.images[0]
                ? idea.data.images[0]
                : "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg"}
            alt=""
        />
    </div>
    <div class="ProfilePicture">
        <div class="Profile">
            {#await getUserImages([idea.data.owner])}
                <ProfilePicture src={""} />
            {:then data}
                <ProfilePicture src={data[0].image} userKey={idea.data.owner} />
            {/await}
        </div>
    </div>

    <div
        class="Title"
        style="font-size: medium; padding:{padding}px; text-align:start; height:50px;"
    >
        {idea.data.title}
    </div>
    <div
        class="FollowersSection"
        style="display: flex; justify-content:center; align-items:left; flex-direction:column; text-align:center;"
    >
        {#await getTotalFollowers(idea.key)}
            <MagicalDotsAbsoluteSmall />
        {:then data}
            <span class="material-symbols-outlined">favorite</span>
            {data}
        {/await}
    </div>
    <!-- <div
        class="Subtitle"
        style="font-size:small; padding:{padding}px; text-align:left"
    >
        {featureExample.subtitle}
    </div> -->
    <div class="FundingBar" style="padding:{padding}px; ">
        {#await getTotalPledges(idea.key, idea.data.type.toUpperCase())}
            <MagicalDotsAbsoluteSmall />
        {:then data}
            <FundingBar
                card={true}
                expected={data.expected}
                total={data.pledges}
            />
        {/await}
    </div>
    {#await getAmountPledgersAndImages(idea.key)}
        <MagicalDotsAbsoluteSmall />
    {:then data}
        <div
            class="PledgersAmount"
            style="padding-left:{padding}px;padding-bottom:{20}px; font-size:small; margin-top:{padding}px; "
        >
            Pledgers: {data.amount}
        </div>

        <div class="featureFlag" style="position: absolute; margin:10px;">
            {idea.data.type}
        </div>
        <div
            class="PledgersPictures"
            style="padding-top:{padding}px; padding-left:0px; margin-left:0px; margin-top:{padding}px;"
        >
            <UsersOverview card={true} users={data.users} />
        </div>
    {/await}
    <div
        class="PledgersPictures"
        style="padding-top:{padding}px; padding-left:0px; margin-left:0px; "
    >
        <UsersOverview card={true} />
    </div>
</div>

<style>
    .container {
        display: grid;
        grid-template-columns: 1fr 1fr 0.6fr;
        grid-template-rows: auto auto auto auto auto auto;
        gap: 0px 0px;
        height: fit-content;
        grid-auto-flow: row;
        color: var(--secondary-color);
        grid-template-areas:
            "Image Image Image"
            ". . ."
            "Title Title FollowersSection"
            "Subtitle Subtitle Subtitle"
            "FundingBar FundingBar FundingBar"
            "PledgersAmount PledgersPictures PledgersPictures";
        background-color: var(--tertiary-color);
        border: 1px solid var(--seventh-color);
        box-shadow: 6px 6px 0px 0px var(--seventh-color);
        cursor: pointer;
        transition:
            border 0.3s ease,
            box-shadow 0.3s ease,
            background-color 0.3s ease,
            color 0.3s ease,
            transform 0.3s ease;
    }
    .container:hover {
        color: var(--seventh-color);
        background-color: var(--fifth-color);
        box-shadow: 6px 6px 0px 0px var(--seventh-color);
        transform: scale(1);
    }
    .container:active {
        color: var(--seventh-color);
        box-shadow: 0px 0px 0px 0px var(--seventh-color);
        transform: scale(1);
    }

    .Image {
        grid-area: Image;
    }
    .Image img {
        grid-area: Image;
        width: 100%;
        aspect-ratio: 1200/628;
        object-fit: cover;
    }

    .ProfilePicture {
        grid-area: ProfilePicture;
        position: absolute; /* Absolute position relative to #image-scroller */
        z-index: 1;
        align-self: normal;
        margin-top: 70px;
        margin-left: 10px;
        cursor: pointer;
    }

    .Title {
        grid-area: Title;
    }

    .FollowersSection {
        grid-area: FollowersSection;
        padding-right: 5px;
        padding-left: 0px;
    }

    .Subtitle {
        grid-area: Subtitle;
    }

    .FundingBar {
        grid-area: FundingBar;
    }

    .PledgersAmount {
        grid-area: PledgersAmount;
    }

    .PledgersPictures {
        grid-area: PledgersPictures;
    }
</style>
