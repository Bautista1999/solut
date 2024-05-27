<script>
    import { goto } from "$app/navigation";
    import BasicButton from "./basicButton.svelte";
    import MagicalDots from "./magicalDots.svelte";
    export let message = "";

    // Add any script logic needed for the under construction page
</script>

<div class="under-construction">
    <MagicalDots />
    <br />
    <p style="font-style: italic;">{message}</p>
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
        width: fit-content;
    }
</style>
