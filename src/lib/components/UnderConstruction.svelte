<script>
    import { goto } from "$app/navigation";
    import BasicButton from "./basicButton.svelte";

    // Add any script logic needed for the under construction page
</script>

<div class="under-construction">
    <span class="material-symbols-outlined"> construction </span>
    <h1>Page Under Construction</h1>
    <p>
        We're working hard to improve our website and we'll ready to launch
        soon. Thank you for your patience!
    </p>
    <br />
    <br />
    <BasicButton
        msg={"Return home"}
        icon={"home"}
        someFunction={() => {
            goto("/");
        }}
    />
</div>

<style>
    .under-construction {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 80vh;
        text-align: center;
    }

    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 300,
            "GRAD" 0,
            "opsz" 24;
        color: var(--primary-color); /* Construction orange */
        font-size: 80px;
    }
    h1 {
        color: var(--primary-color);
        font-size: 3rem;
    }

    p {
        color: var(--secondary-color);
        font-size: 1.5rem;
        width: 50%;
    }
    @media (max-width: 480px) {
        p {
            width: 80%;
        }
    }
</style>
