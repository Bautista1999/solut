<script>
    import AnimatedBackground from "$lib/components/AnimatedBackground.svelte";
    import IdeaCard from "$lib/components/IdeaCard.svelte";
    import IdeaCardContainerWide from "$lib/components/IdeaCard_Container_Wide.svelte";
    import IdeaCardWide from "$lib/components/IdeaCard_Wide.svelte";
    import SearchBar from "$lib/components/SearchBar.svelte";
    import TagContainer from "$lib/components/TagContainer.svelte";
    import { featuresExamples } from "$lib/data_objects/testing_objects";
    import StatsItem from "$lib/components/StatsItem.svelte";
    import BasicButton from "$lib/components/basicButton.svelte";
    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";
    import { goto } from "$app/navigation";
    let stats = [
        { label: "Ideas Created", count: 320, icon: "lightbulb" },
        { label: "Projects Completed", count: 85, icon: "check_circle" },
        { label: "Total Revenue", count: "150K", icon: "monetization_on" },
    ];

    let featuredIdeas = [
        {
            id: 1,
            title: "Smart City Solutions",
            description: "Integrating IoT with urban management.",
            image: "https://media.licdn.com/dms/image/D4D12AQHXTdow25R9Rg/article-cover_image-shrink_720_1280/0/1706025049577?e=2147483647&v=beta&t=YrJGWbavKDAMn7x9jhokLQmqQuF_RvBWm4lBu9KHnR4",
        },
        {
            id: 2,
            title: "Eco-Friendly Packaging",
            description: "Biodegradable solutions to reduce waste.",
            image: "https://skipper.org/cdn/shop/articles/eco_friendly_120cd6de-0473-47d2-bbf4-45f526c82391.png?v=1659684410",
        },
        {
            id: 3,
            title: "Automated Gardening System",
            description: "Gardening made easy with automation.",
            image: "https://www.mdfx.co.uk/wp-content/uploads/2020/06/Farmer-hold-a-smartphone-on-a-background-of-a-pepper-plantation.-Agricultural-startup.-Automation-and-crop-scaled.jpeg",
        },
    ];
</script>

<main>
    <section class="slogan-section">
        <AnimatedBackground />
        <h1 class="slogan">
            Get rich shaping the <span style="color: var(--primary-color);"
                >future.</span
            ><br />Welcome to Solutio.
        </h1>
        <div style="display: flex; justify-content:center; align-items:center;">
            <SearchBar />
        </div>
        <div class="tagContainer"><TagContainer /></div>
    </section>

    <section class="featured-ideas">
        <h2>Featured Ideas</h2>
        <div class="cards">
            <IdeaCardContainerWide features={featuresExamples} />
        </div>
    </section>
    <div
        style="display: flex; align-items:center; justify-content:center; color: var(--tertiary-color);background-color: var(--primary-color); margin-top:15px;"
    >
        <h2>Our progress</h2>
    </div>

    <section class="stats-section">
        {#each stats as stat}
            <StatsItem label={stat.label} count={stat.count} icon={stat.icon} />
        {/each}
    </section>

    <section class="slogan-section" style="padding-top: 10px;">
        <AnimatedBackground />
        <h2 style="margin-bottom: 0em; font-size: 2em;">
            Just had an <span style="color: var(--primary-color);"> idea?</span>
        </h2>
        <div class="tagContainer">
            <p>Tell us more.</p>
        </div>
        <div style="display: flex; justify-content:center; align-items:center;">
            <BasicButtonDark
                msg={"Create an idea"}
                icon={"emoji_objects"}
                someFunction={() => {
                    goto("/create");
                }}
            />
        </div>
    </section>
</main>

<style>
    .stats-section {
        display: flex;
        justify-content: space-around;
        padding: 20px;
        background-color: var(--primary-color);
        font-size: 1.2em;
    }
    .tagContainer {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .slogan-section {
        text-align: center;
        padding: 40px 20px;
        position: relative;
        overflow: hidden;
        color: var(--tertiary-color); /* ensures text color is white */
        display: flex;
        flex-direction: column;
        gap: 30px;
    }

    .slogan-section::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;

        opacity: 1; /* Set the desired opacity here */
        z-index: -1;

        background-blend-mode: hue;
    }
    .slogan-section::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(
            circle,
            var(--seventh-color),
            var(--seventh-color)
        );
        opacity: 1; /* Set the desired opacity here */
        z-index: -1;
        background-size: cover;
    }
    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .slogan {
        animation: fadeInDown 2s ease-out forwards;
        font-size: 2.5em;
        margin-bottom: 0.5em;
        color: var(
            --tertiary-color
        ); /* ensure it's readable on any background */
    }

    .genius-slogan {
        font-size: 1.8em; /* Slightly larger for emphasis */
        margin-bottom: 1em; /* Added space before search bar */
    }

    .featured-ideas {
        padding: 20px;
        background: var(--forth-color);
        text-align: center;
    }
    .cards {
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
    }
    .card {
        width: 30%;
        margin: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        overflow: hidden;
        transition: transform 0.3s;
    }
    .card:hover {
        transform: scale(1.05);
    }
    .card img {
        width: 100%;
        height: 200px;
        object-fit: cover;
    }
    .card-content {
        padding: 15px;
        background: var(--tertiary-color);
        color: var(--secondary-color);
    }
    .card-content h3 {
        margin: 0;
    }
    .card-content p {
        font-size: 16px;
    }
    @media (max-width: 768px) {
        .cards {
            flex-direction: column;
        }
        .card {
            width: 90%;
        }
    }
    @media (max-width: 768px) {
        .stats-section {
            flex-direction: column;
        }
    }
</style>
