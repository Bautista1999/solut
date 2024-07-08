<script>
    import { goto } from "$app/navigation";
    import {
        getAmountPledgersAndImages,
        getTotalFollowers,
        getUserImages,
        validateImageUrl,
    } from "$lib/data_functions/get_functions";
    import { getTotalPledges } from "$lib/financial_functions/financial_functions";
    import { onMount } from "svelte";
    import MagicalDotsAbsoluteSmall from "./MagicalDotsSmall.svelte";
    import FundingBar from "./fundingBar.svelte";

    import ProfilePicture from "./profilePicture.svelte";
    import UsersOverview from "./usersOverview.svelte";

    /**
     * @type {import("@junobuild/core-peer").Doc<any>}
     */
    export let feature;
    export let padding = 7;

    let key = feature.key.substring(6, feature.key.length + 1);
    $: displaySrc = feature.data.images[0];
    onMount(async () => {
        if (displaySrc != "" && displaySrc != undefined) {
            console.log(displaySrc);
            displaySrc = await validateImageUrl(
                displaySrc,
                "https://resource.rentcafe.com/image/upload/q_auto,f_auto,c_limit,w_576,h_500/s3/2/50552/image%20not%20available(12).jpg",
            );
        } else {
            displaySrc =
                "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";
        }
    });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="container" on:click={() => goto("/idea/" + key)}>
    <div class="Image">
        <img src={displaySrc} alt="" />
    </div>
    <div class="ProfilePicture">
        {#await getUserImages([feature.owner ? feature.owner : ""])}
            <MagicalDotsAbsoluteSmall />
        {:then data}
            <ProfilePicture
                src={data[0].image}
                userKey={feature.owner ? feature.owner : ""}
            />
        {/await}
    </div>

    <div
        class="Title"
        style="font-size: medium; padding:{padding}px; text-align:start; min-height:fit-content; "
    >
        {feature.data.title}
    </div>
    <div
        class="FollowersSection"
        style="display: flex; justify-content:center; align-items:left; flex-direction:column; text-align:center;"
    >
        {#await getTotalFollowers(key)}
            <MagicalDotsAbsoluteSmall />
        {:then data}
            <span class="material-symbols-outlined">favorite</span>
            {data}
        {/await}
    </div>
    <div
        class="Subtitle"
        style="font-size:small; padding:{padding}px; text-align:left; min-height:75px; "
    >
        {feature.data.subtitle.substring(
            0,
            200,
        )}{#if feature.data.subtitle.length > 200}...{/if}
    </div>
    <div class="FundingBar" style="padding:{padding}px; ">
        {#await getTotalPledges(key, "FEA")}
            <MagicalDotsAbsoluteSmall />
        {:then data}
            <FundingBar
                card={true}
                expected={data.expected}
                total={data.pledges}
            />
        {/await}
    </div>
    {#await getAmountPledgersAndImages(key)}
        <MagicalDotsAbsoluteSmall />
    {:then data}
        <div
            class="PledgersAmount"
            style="padding-left:{padding}px;padding-bottom:{20}px; font-size:small; margin-top:{padding}px; "
        >
            Pledgers: {data.amount}
        </div>
        <div
            class="PledgersPictures"
            style="padding-top:{padding}px; padding-left:0px;  margin-top:{padding}px; "
        >
            <UsersOverview card={true} users={data.users} />
        </div>
    {/await}
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
        border: 2px solid var(--secondary-color);
        box-shadow: 6px 6px 0px 0px var(--secondary-color);
        height: 390px;
        cursor: pointer;
        transition:
            border 0.3s ease,
            box-shadow 0.3s ease,
            background-color 0.3s ease,
            color 0.3s ease,
            transform 0.3s ease;
    }
    .container:hover {
        color: var(--secondary-color);
        background-color: var(--fifth-color);
        border: 2px solid var(--secondary-color);
        box-shadow: 6px 6px 0px 0px var(--secondary-color);
        transform: scale(1);
    }
    .container:active {
        color: var(--secondary-color);
        border: 2px solid var(--secondary-color);
        box-shadow: 0px 0px 0px 0px var(--secondary-color);
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
        margin-top: 65px;
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
    @media (max-width: 480px) {
        .PledgersPictures {
            margin-left: 10px;
        }
    }
</style>
