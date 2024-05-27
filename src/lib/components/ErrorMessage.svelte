<script>
    import { goto } from "$app/navigation";
    import BasicButton from "./basicButton.svelte";
    export let someFunction = () => {};
    export let message = "";
    export let error = "";

    // Add any script logic needed for the under construction page
</script>

<div class="under-construction">
    <span class="material-symbols-outlined"> error </span>
    <h1>Error!</h1>
    <p>Oops... Something went wrong!</p>
    <p>{message}</p>
    <p class="InputErrorMessage">{error}</p>
    <br />
    <br />
    <BasicButton
        msg={"Go back"}
        icon={"undo"}
        someFunction={() => {
            someFunction();
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
        font-size: 1.5rem;
        width: 70%;
    }
</style>
