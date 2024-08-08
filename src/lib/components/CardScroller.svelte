<script>
    export let backFunction = () => {};
    export let forwardFunction = () => {};
    export let disableLeftButton = true;
    export let disableRightButton = true;
</script>

<div class="ButtonSection">
    <div class="buttons">
        <button on:click={backFunction} disabled={disableLeftButton}>
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
            />
            <span class="material-symbols-outlined"> arrow_back </span>
        </button>
        <img src="/assets/LogoSol3.png" alt="Solutio Logo" />
        <button on:click={forwardFunction} disabled={disableRightButton}>
            <span class="material-symbols-outlined">
                arrow_forward
            </span></button
        >
    </div>
</div>

<style>
    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 48;
    }

    .ButtonSection {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .buttons {
        display: flex; /* Set the display to flex to enable flexbox properties */
        flex-direction: row; /* Align children in a row (horizontal alignment) */
        justify-content: center; /* Horizontally center the items in the container */
        align-items: center; /* Vertically align the items in the middle */
        gap: 0px;
        background-color: rgb(
            32,
            32,
            32
        ); /* Background color of the buttons container */
        border-radius: 8px; /* Rounded corners for the container */
        opacity: 100%;
        border: 1px solid var(--primary-color);
        box-shadow: 4px 4px 0px 0px var(--primary-color);
        transition: background-color 0.3s ease;
        background-color: transparent;
        border: none;
        box-shadow: none;
        width: fit-content;
    }

    .buttons img {
        /* Add width and height for the image */
        width: 29px; /* Set a fixed width */
        height: 28px; /* Set a fixed height */
        object-fit: contain; /* Image will maintain its aspect ratio */
        margin: 0 5px; /* Space between buttons */
        background-color: rgb(
            32,
            32,
            32
        ); /* Background color of the buttons container */
        padding: 5px; /* Padding around the content inside the container */
        border-radius: 8px; /* Rounded corners for the container */
        opacity: 100%;
        border: 1px solid var(--primary-color);
        box-shadow: 4px 4px 0px 0px var(--primary-color);
        transition: background-color 0.3s ease;
    }
    .buttons button {
        margin: 0 5px; /* Space between buttons */
        background-color: transparent;
        cursor: pointer;
        border: 0px solid var(--primary-color);
        background-color: rgb(
            32,
            32,
            32
        ); /* Background color of the buttons container */
        width: fit-content; /* Container width to fit its content */
        padding: 5px; /* Padding around the content inside the container */
        border-radius: 8px; /* Rounded corners for the container */
        opacity: 100%;
        border: 1px solid var(--primary-color);
        color: var(--primary-color);
        box-shadow: 4px 4px 0px 0px var(--primary-color);
        transition: background-color 0.3s ease;
    }
    .buttons button:hover {
        margin: 0 5px; /* Space between buttons */
        background-color: transparent;
        cursor: pointer;
        border: 0px solid var(--primary-color);
        background-color: var(
            --primary-color
        ); /* Background color of the buttons container */
        width: fit-content; /* Container width to fit its content */
        padding: 5px; /* Padding around the content inside the container */
        border-radius: 8px; /* Rounded corners for the container */
        opacity: 100%;
        border: 1px solid var(--seventh-color);
        box-shadow: 4px 4px 0px 0px var(--seventh-color);
        color: var(--seventh-color);
        transition: background-color 0.3s ease;
    }
    .buttons button:active {
        margin: 0 5px; /* Space between buttons */
        background-color: transparent;
        cursor: pointer;
        border: 0px solid var(--primary-color);
        background-color: var(
            --primary-color
        ); /* Background color of the buttons container */
        width: fit-content; /* Container width to fit its content */
        padding: 5px; /* Padding around the content inside the container */
        border-radius: 8px; /* Rounded corners for the container */
        opacity: 100%;
        border: 1px solid var(--seventh-color);
        box-shadow: 0px 0px 0px 0px var(--seventh-color);
        transition:
            background-color 0.3s ease,
            box-shadow 0.3s ease;
    }
    .buttons button:disabled {
        cursor: not-allowed;
        margin: 0 5px; /* Space between buttons */
        background-color: transparent;
        border: 0px solid var(--primary-color);
        background-color: rgb(
            32,
            32,
            32
        ); /* Background color of the buttons container */
        width: fit-content; /* Container width to fit its content */
        padding: 5px; /* Padding around the content inside the container */
        border-radius: 8px; /* Rounded corners for the container */
        opacity: 100%;
        border: 1px solid var(--primary-color);
        color: var(--primary-color);
        box-shadow: 4px 4px 0px 0px var(--primary-color);
        transition: background-color 0.3s ease;
        opacity: 0.5;
    }
</style>
