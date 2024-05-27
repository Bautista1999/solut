<script>
    import BasicButtonDarkSmall from "./BasicButton_Dark_Small.svelte";

    export let error = "";
    export let someFunction = () => {};
</script>

<div
    class="under-construction"
    style=" text-align:center; color: var(--seventh-color); "
>
    <span class="material-symbols-outlined"> error </span>
    <h1>Error!</h1>
    <p>Oops... Something went wrong!</p>
    <p class="InputErrorMessage">{error}</p>
    <br />
    <div class="VerticallyAligned">
        <BasicButtonDarkSmall
            msg={"Go back"}
            icon={"undo"}
            someFunction={() => {
                someFunction();
            }}
        />
    </div>
</div>

<!-- <div class="under-construction">
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
</div> -->
<style>
    .under-construction {
        display: flex;
        flex-direction: column;
        align-items: center;
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
    h2 {
        color: var(--primary-color);
        font-size: 30px;
    }

    p {
        font-size: 20px;
        width: 100%;
    }
</style>
