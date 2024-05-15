<!-- src/NotFound.svelte -->
<script>
    import { goto } from "$app/navigation";

    // JavaScript for redirecting or other logic (optional)

    import BasicButton from "./basicButton.svelte";
</script>

<div class="not-found-container">
    <h1>404 Not Found</h1>
    <p>The page you are looking for doesn't exist or has been moved.</p>
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
    .not-found-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        height: 80vh;
    }

    h1 {
        color: var(--primary-color);
        font-size: 3rem;
    }

    p {
        color: var(--secondary-color);
        font-size: 1.5rem;
    }
</style>
