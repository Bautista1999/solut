<script>
    // Footer logic here (if any)

    import BasicButtonSmall from "./BasicButton_Small.svelte";
</script>

<footer class="site-footer">
    <div class="footer-content">
        <div class="footer-section about">
            <h2 style="color: var(--primary-color);">SOLUTIO</h2>
            <ul>
                <li>About</li>
                <li>Forum</li>
                <li>Discord</li>
                <li>Twitter</li>
                <li>Github</li>
            </ul>
        </div>

        <div class="footer-section subscribe">
            <h3>SUBSCRIBE</h3>
            <p class="TextContrast">
                Sign up to receive Solutio news and to try our alpha version!
            </p>
            <form class="subscribe-form">
                <input type="email" placeholder="Email" />
                <BasicButtonSmall msg={"Subscribe"} />
            </form>
            <br />
            <p class="TextContrast">
                &copy; 2024 Solutio. All Rights Reserved.
            </p>
        </div>
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
        font-family: "Open Sans", sans-serif; /* Use your desired font */
    }

    .footer-content {
        display: flex;
        width: 100%;
        justify-content: space-between;
        gap: 10%;
        padding-inline: 10%;
    }

    .footer-section {
        display: flex;
        flex-direction: column;
        color: var(--tertiary-color);
    }

    .about ul {
        list-style-type: none;
        padding: 0;
    }

    .about li {
        margin-bottom: 0.5rem;
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
