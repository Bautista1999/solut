<script>
    import { goto } from "$app/navigation";
    import {
        getAmountPledgersAndImages,
        getImageUrl,
        getTotalFollowers,
        getUserImages,
        validateImageUrl,
    } from "$lib/data_functions/get_functions";
    import { getTotalPledges } from "$lib/financial_functions/financial_functions";
    import { onMount } from "svelte";
    import MagicalDotsAbsoluteSmall from "./MagicalDotsSmall.svelte";
    import FundingBar from "./fundingBar.svelte";
    import PledgersSection from "./pledgersSection.svelte";
    import ProfilePicture from "./profilePicture.svelte";
    import UsersOverview from "./usersOverview.svelte";
    import PledgersOverview from "./PledgersOverview.svelte";
    import FundingBarNew from "./FundingBarNew.svelte";
    import ProfileImageCards from "./ProfileImageCards.svelte";

    /**
     * @type {{
    key: string;
    data: import("$lib/data_objects/data_types").IndexDataReturn;
}}
     */
    export let idea;
    export let padding = 7;
    $: displaySrc = idea.data.images[0];
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
    export let idea_example = {
        image: "https://images.shiksha.com/mediadata/images/articles/1707905364phpqiseG5.jpeg",
        profilePicture:
            "https://preview.redd.it/trying-to-come-up-with-a-new-avatar-for-my-various-social-v0-wby69l6e1lsb1.jpg?width=519&format=pjpg&auto=webp&s=61341c3ce447f8356da3146c1903395fc43d28dc",
        title: "Explore Innovative Ideas: Share, Pledge, and Bring Solutions to Life",
        followers: 1230,
        subtitle:
            "Discover a world of creativity with our platform. Join like-minded individuals, support groundbreaking projects, and watch ideas transform into reality. Together, we can foster innovation and drive meaningful change.",
        pledgers: 50,
        funding: 75, // percentage
        createdAt: "12 July 2023",
    };
</script>

<a
    href={"/" + idea.data.type + "/" + idea.key}
    class="idea-card_ultra_small"
    style="height:110px"
    target="_blank"
    rel="noopener noreferrer"
>
    <div class="idea-card-image-container" style="padding: 0px;">
        <img src={displaySrc} alt="Idea Image" class="idea-card-image" />
        <div class="idea-card-overlay">
            <h2 class="idea-card-title">{idea.data.title}</h2>
            <div class="idea-card-pledgers">
                {#await getAmountPledgersAndImages(idea.key)}
                    <!-- <MagicalDotsAbsoluteSmall /> -->
                    <!-- Pledgers: {0} -->
                    <PledgersOverview card={true} users={[]} />
                {:then data}
                    <div class="PledgersPictures" style="">
                        <!-- Pledgers: {data.amount} -->
                        <PledgersOverview card={true} users={data.users} />
                    </div>
                {/await}
            </div>
        </div>
    </div>
</a>

<style>
    .idea-card-image {
        height: 100%;
        width: 100%;

        object-fit: cover;
    }

    .idea-card-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7); /* Black overlay with 50% opacity */
        display: flex;
        flex-direction: column;
        align-items: start;
        justify-content: start;
        gap: 5px;
        padding: 10px;
    }

    .idea-card-title {
        color: var(--tertiary-color);
        text-align: Left;
        font-size: small;
        margin: 0;
    }
    .pledging {
        color: var(--tertiary-color);
        text-align: Left;
        font-size: small;
        margin: 0;
    }
</style>
