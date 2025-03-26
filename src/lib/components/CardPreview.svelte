<script>
    import { goto } from "$app/navigation";
    import {
        getAmountPledgersAndImages,
        getImageUrl,
        getTotalFollowers,
        getUserImages,
        validateImageUrl,
    } from "$lib/data_functions/get_functions";

    import PledgersOverview from "./PledgersOverview.svelte";

    import { CheckIfFollow } from "$lib/data_functions/create_functions";
    import { formatNumber } from "$lib/data_functions/user.functions";

    /**
     * @type {import("../../declarations/satellite/satellite.did").IndexResponse}[]}

     */
    export let idea;
    export let padding = 7;
    $: displaySrc = idea.profile_image;

    let isLoading = true;

    // Load the image when the component mounts

    $: if (displaySrc) {
        isLoading = true;
        (async () => {
            try {
                displaySrc = await validateImageUrl(
                    displaySrc,
                    "https://resource.rentcafe.com/image/upload/q_auto,f_auto,c_limit,w_576,h_500/s3/2/50552/image%20not%20available(12).jpg",
                );
            } catch {
                displaySrc =
                    "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";
            } finally {
                isLoading = false;
            }
        })();
    } else {
        displaySrc =
            "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";
        isLoading = false;
    }

    async function followingInformation() {
        let amount = await getTotalFollowers(idea.element_id);
        let follow = await CheckIfFollow(idea.element_id);
        return {
            amount: formatNumber(amount),
            follow: follow,
        };
    }
</script>

<a
    href={"/" + idea.element_type + "/" + idea.element_id}
    class="idea-card"
    rel="noopener noreferrer"
>
    <div class="idea-card-image-container">
        {#if isLoading}
            <div class="idea-card-image loadingHolder">
                <div class="spinner"></div>
            </div>
        {:else}
            <img src={displaySrc} alt="Idea Image" class="idea-card-image" />
        {/if}
        <div
            class="featureFlag"
            style="position: absolute; margin:10px;top:0; right:0;"
        >
            {idea.element_type}
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
                <h3 class="idea-card-title">{idea.title}</h3>
                <div class="idea-card-followers">
                    {#await followingInformation()}
                        <span
                            class="material-symbols-outlined"
                            style="color:var(--primary-color);font-variation-settings: 'FILL'0"
                            >favorite</span
                        >
                    {:then data}
                        <span
                            class="material-symbols-outlined"
                            style="color:var(--primary-color);font-variation-settings: 'FILL'{data.follow
                                ? '1'
                                : '0'};">favorite</span
                        >
                    {/await}
                    <span style="color:var(--primary-color);"
                        >{idea.total_followers}</span
                    >
                </div>
            </div>
            <p class="idea-card-subtitle">{idea.subtitle}</p>
        </div>
        <div class="idea-card-pledgers-followers">
            <div class="idea-card-pledgers" style="width:60%;">
                {#await getAmountPledgersAndImages(idea.element_id)}
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
                {:then data}
                    <span
                        class="material-symbols-outlined"
                        style="color:var(--primary-color);font-variation-settings: 'FILL'{data.follow
                            ? '1'
                            : '0'};">favorite</span
                    >
                {/await}
                <span style="color:var(--primary-color);"
                    >{idea.total_followers}</span
                >
            </div>
        </div>

        <div class="idea-card-funding-bar">
            Pledged: <span class="funding-amount"
                >{(Number(idea.total_pledged) / 100000000).toFixed(1)} ICP</span
            >
        </div>
        <!-- <div class="idea-card-created-at">
            ~ <span>{idea_example.createdAt}</span>
        </div> -->
    </div>
</a>

<style>
    .idea-card-funding-bar {
        display: flex;
        flex-direction: row;
        color: var(
            --seventh-color
        ); /* Ensure text is readable against the gradient */
        font-size: 1rem; /* Adjust font size for emphasis */
        font-weight: 300;
        text-align: center;
        padding-block: 5px;
        padding-right: 5px;
        border-radius: 8px; /* Smooth edges for better aesthetics */
        text-align: center;
        justify-content: left;
        gap: 10px;
    }

    .funding-amount {
        display: block; /* Ensure it centers properly */
        background-color: var(--primary-color);
        color: var(--tertiary-color);
        font-size: 1rem; /* Adjust font size for emphasis */
        font-weight: 400;
        text-align: center;
        border-radius: 8px;
        padding: 5px 9px;
    }
    .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
    .loadingHolder {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%; /* Full height to match the image container */
    }
</style>
