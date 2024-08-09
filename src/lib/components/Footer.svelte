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
        padding: 2rem;
        padding-block: 0.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .footer-content {
        display: flex;
        width: 100%;
        justify-content: space-between;
    }

    /* .footer-section {
        display: flex;
        flex-direction: column;
        color: var(--tertiary-color);
    } */
    .footer-section {
        display: flex;
        flex-direction: row;
        color: var(--tertiary-color);
        gap: 15%;
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

    @media (max-width: 480px) {
        .footer-section {
            display: flex;
            flex-direction: row;
            color: var(--tertiary-color);
            gap: 0%;
        }
        .footer-content {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
        }
        .site-footer {
            background-color: var(
                --secondary-color
            ); /* Adapt to match your color theme */
            color: #fff;
            padding: 0rem;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
</style>
