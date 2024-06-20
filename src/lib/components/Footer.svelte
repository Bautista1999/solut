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

    <div class="footer-bottom"></div>
</footer>

<style>
    .site-footer {
        background-color: var(
            --secondary-color
        ); /* Adapt to match your color theme */
        color: #fff;
        padding: 2rem;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 10px;
    }

    .footer-content {
        display: flex;
        width: 100%;
        justify-content: space-between;
        gap: 10%;
        padding-inline: 10%;
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

    .subscribe-form {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }

    .subscribe-form input[type="email"] {
        flex: 1;
        padding: 0.5rem;
    }

    .subscribe-form button {
        background-color: var(--primary-color); /* Button color */
        color: var(--tertiary-color);
        border: none;
        padding: 0.5rem 1rem;
        cursor: pointer;
    }

    .social a {
        color: var(--tertiary-color);
        text-decoration: none;
        margin-right: 1rem; /* Space out social links */
    }

    .footer-bottom {
        margin-top: 2rem;
        text-align: center;
    }
</style>
