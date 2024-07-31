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
    import { CheckIfFollow } from "$lib/data_functions/create_functions";
    import { formatNumber } from "$lib/data_functions/user.functions";

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

    async function followingInformation() {
        let amount = await getTotalFollowers(idea.key);
        let follow = await CheckIfFollow(idea.key);
        return {
            amount: formatNumber(amount),
            follow: follow,
        };
    }
</script>

<a
    href={"/" + idea.data.type + "/" + idea.key}
    class="idea-card"
    rel="noopener noreferrer"
>
    <div class="idea-card-image-container">
        <img src={displaySrc} alt="Idea Image" class="idea-card-image" />
        <div
            class="featureFlag"
            style="position: absolute; margin:10px;top:0; right:0;"
        >
            {idea.data.type}
        </div>

        <!-- {#await getUserImages([idea.data.owner])}
            <ProfileImageCards src={""} />
        {:then data}
            <ProfileImageCards src={data[0].image} userKey={idea.data.owner} />
        {/await} -->
    </div>
    <div class="idea-card-content">
        <div class="idea-title-subtitle">
            <div class="idea-card-header">
                <h3 class="idea-card-title">{idea.data.title}</h3>
                <div class="idea-card-followers">
                    {#await followingInformation()}
                        <span
                            class="material-symbols-outlined"
                            style="color:var(--primary-color);font-variation-settings: 'FILL'0"
                            >favorite</span
                        >
                        <span style="color:var(--primary-color);">{"0"}</span>
                    {:then data}
                        <span
                            class="material-symbols-outlined"
                            style="color:var(--primary-color);font-variation-settings: 'FILL'{data.follow
                                ? '1'
                                : '0'};">favorite</span
                        >
                        <span style="color:var(--primary-color);"
                            >{data.amount}</span
                        >
                    {/await}
                </div>
            </div>
            <p class="idea-card-subtitle">{idea.data.subtitle}</p>
        </div>
        <div class="idea-card-pledgers-followers">
            <div class="idea-card-pledgers" style="width:60%;">
                {#await getAmountPledgersAndImages(idea.key)}
                    <!-- <MagicalDotsAbsoluteSmall /> -->
                    Pledgers: {0}
                    <PledgersOverview
                        card={true}
                        users={[]}
                        message={"Loading..."}
                    />
                {:then data}
                    <div class="PledgersPictures" style="">
                        Pledgers: {data.amount}
                        <PledgersOverview card={true} users={data.users} />
                    </div>
                {/await}
            </div>
            <div class="idea-card-followers">
                {#await followingInformation()}
                    <span
                        class="material-symbols-outlined"
                        style="color:var(--primary-color);font-variation-settings: 'FILL'0"
                        >favorite</span
                    >
                    <span style="color:var(--primary-color);">{"0"}</span>
                {:then data}
                    <span
                        class="material-symbols-outlined"
                        style="color:var(--primary-color);font-variation-settings: 'FILL'{data.follow
                            ? '1'
                            : '0'};">favorite</span
                    >
                    <span style="color:var(--primary-color);"
                        >{data.amount}</span
                    >
                {/await}
            </div>
        </div>

        <div class="idea-card-funding-bar">
            {#if idea.data.type == "feature"}
                {#await getTotalPledges(idea.key, "FEA")}
                    <MagicalDotsAbsoluteSmall />
                {:then data}
                    <FundingBarNew
                        card={false}
                        expected={data.expected}
                        total={data.pledges}
                    />
                {/await}
            {:else}
                {#await getTotalPledges(idea.key, idea.data.type.toUpperCase())}
                    <MagicalDotsAbsoluteSmall />
                {:then data}
                    <FundingBarNew
                        card={false}
                        expected={data.expected}
                        total={data.pledges}
                    />
                {/await}
            {/if}
        </div>
        <!-- <div class="idea-card-created-at">
            ~ <span>{idea_example.createdAt}</span>
        </div> -->
    </div>
</a>
