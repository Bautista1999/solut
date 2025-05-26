<script>
    import { goto } from "$app/navigation";

    // Footer logic here (if any)

    import BasicButtonSmall from "./BasicButton_Small.svelte";
</script>

<footer class="site-footer">
    <div class="footer-content">
        <div class="footer-section about">
            <h2 style="color: var(--primary-color);">SOLUTIO</h2>
            <ul class="VerticallyAligned HorizontallyAligned">
                <li on:click={() => goto("https://home.solutio.one/")}>
                    About
                </li>
                <li
                    on:click={() =>
                        goto("https://forum.solutio.one/categories")}
                >
                    Forum
                </li>
                <li on:click={() => goto("https://discord.gg/tXqVjgPh")}>
                    Discord
                </li>
                <li on:click={() => goto("https://twitter.com/SolutioApp")}>
                    Twitter
                </li>
                <li
                    on:click={() =>
                        goto(
                            "https://github.com/Bautista1999/solut/blob/main/README.md",
                        )}
                >
                    Github
                </li>
            </ul>
        </div>

        <!-- Add the image here -->
        <div class="footer-section logo">
            <a
                href="https://internetcomputer.org"
                target="_blank"
                rel="noopener noreferrer"
            >
                <img
                    src="/poweredbyinternetcomputer.png"
                    alt="Powered by Internet Computer"
                    class="powered-by-logo"
                />
            </a>
        </div>

        <!-- <div class="footer-section subscribe">
            <h3>SUBSCRIBE</h3>
            <p class="TextContrast">
                Sign up to receive Solutio news and to try our alpha version!
            </p>
            <div class="subscribe-form">
                <input type="email" placeholder="Email" />
                <BasicButtonSmall msg={"Subscribe"} />
            </div>
            <br />
            <p class="TextContrast">
                &copy; 2024 Solutio. All Rights Reserved.
            </p> 
        </div> -->
    </div>
</footer>

<style>
    .site-footer {
        background-color: var(
            --secondary-color
        ); /* Adapt to match your color theme */
        color: #fff;
        padding: 10px;
        padding-block: 20px;
        padding-inline: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .footer-content {
        display: flex;
        width: 100%;
        justify-content: space-between; /* Ensures space between about section and logo */
        align-items: center; /* Vertically align items */
    }

    .footer-section {
        display: flex;
        flex-direction: row;
        align-items: center; /* Align items vertically within sections */
        color: var(--tertiary-color);
    }

    .footer-section.about {
        gap: 15%; /* Keep gap for the about section */
    }

    .footer-section.logo {
        justify-content: flex-end; /* Align logo content to the right */
        flex-grow: 1; /* Allow logo section to take remaining space */
    }

    .about ul {
        list-style-type: none;
        padding: 0;
    }

    .about li {
        margin-bottom: 0rem;
        cursor: pointer;
    }
    .about li:hover {
        color: var(--primary-color);
    }

    .powered-by-logo {
        height: 60px; /* Adjust size as needed */
        width: auto;
        margin-left: 1rem; /* Add some space to the left */
    }

    @media (max-width: 768px) {
        /* Adjust breakpoint if needed */
        .footer-content {
            flex-direction: column; /* Stack sections vertically */
            align-items: center; /* Center items */
            gap: 1rem; /* Add gap between stacked sections */
        }
        .footer-section.about {
            gap: 1rem; /* Adjust gap for smaller screens */
            justify-content: center;
        }
        .footer-section.logo {
            justify-content: center; /* Center logo */
            width: 100%;
        }
        .powered-by-logo {
            margin-left: 0; /* Remove left margin when stacked */
        }
    }

    @media (max-width: 480px) {
        .footer-section.about {
            flex-direction: column; /* Stack title and list vertically */
            align-items: center;
            gap: 0.5rem;
        }
        .site-footer {
            padding: 1rem;
        }
    }
</style>
