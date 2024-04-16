<script>
    import FundingBar from "./fundingBar.svelte";
    import PledgersSection from "./pledgersSection.svelte";
    import ProfilePicture from "./profilePicture.svelte";
    import UsersOverview from "./usersOverview.svelte";

    /**
     * @type {string}
     */
    export let image =
        "https://media.ambito.com/p/9c57bcc58b3be5c19ea3a38d32f54fca/adjuntos/239/imagenes/038/684/0038684219/1200x675/smart/ethereum-banco-centraljpg.jpg";
    export let featureExample = {
        title: "title",
        subtitle: "subtitle",
        description: "description",
        expected: 100,
        total: 100,
        image: image,
        user: "user",
        userPicture: image,
        key: "",
        createdAt: "17 August, 2023",
        /**
         * @type {string[]}
         */
        pledgersImages: [],
    };
    export let padding = 7;
</script>

<div class="container">
    <div class="Image">
        <img src={featureExample.image} alt="" />
    </div>
    <div class="ProfilePicture">
        <ProfilePicture src={featureExample.userPicture} />
    </div>

    <div
        class="Title"
        style="font-size: medium; padding:{padding}px; text-align:start"
    >
        {featureExample.title}
    </div>
    <div
        class="FollowersSection"
        style="display: flex; justify-content:center; align-items:left; flex-direction:column; text-align:center;"
    >
        <span class="material-symbols-outlined">favorite</span>
        17.5 K
    </div>
    <div
        class="Subtitle"
        style="font-size:small; padding:{padding}px; text-align:left"
    >
        {featureExample.subtitle}
    </div>
    <div class="FundingBar" style="padding:{padding}px; ">
        <FundingBar
            card={true}
            expected={featureExample.expected}
            total={featureExample.total}
        />
    </div>
    <div
        class="PledgersAmount"
        style="padding-left:{padding}px;padding-bottom:{20}px; font-size:small; margin-top:{padding}px; "
    >
        Pledgers: {featureExample.pledgersImages.length}
    </div>
    <div
        class="PledgersPictures"
        style="padding-top:{padding}px; padding-left:0px; margin-left:0px; margin-top:{padding}px;"
    >
        <UsersOverview card={true} images={featureExample.pledgersImages} />
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
        border: 2px solid var(--secondary-color);
        box-shadow: 6px 6px 0px 0px var(--secondary-color);
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
        background-color: var(--primary-color);

        border: 2px solid var(--secondary-color);
        box-shadow: 6px 6px 0px 0px var(--secondary-color);
        transform: scale(1);
    }
    .container:active {
        color: var(--secondary-color);
        background-color: var(--primary-color);

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
</style>
