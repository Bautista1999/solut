<script>
    /**
     * @type {string | any[]}
     */
    export let images = []; // Array of image URLs passed in as a prop
    let currentImageIndex = 0;

    export let backFunction = () => {};
    export let forwardFunction = () => {};
</script>

<div class="ButtonSection">
    <div class="buttons">
        <button on:click={backFunction}>
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
            />
            <span class="material-symbols-outlined"> arrow_back </span>
        </button>
        <img src="/assets/LogoSol3.png" alt="Solutio Logo" />
        <button on:click={forwardFunction}>
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
        color: var(--tertiary-color);
    }
    .material-symbols-outlined:hover {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 48;
        color: var(--primary-color);
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
        margin-top: 10px; /* Space between image and buttons */
        background-color: rgb(
            32,
            32,
            32
        ); /* Background color of the buttons container */
        width: fit-content; /* Container width to fit its content */
        padding: 5px; /* Padding around the content inside the container */
        border-radius: 0px; /* Rounded corners for the container */
        border: 0px solid var(--primary-color);
        opacity: 100%;
        border: 1px solid var(--primary-color);
        transition: background-color 0.3s ease;
    }

    .buttons img {
        /* Add width and height for the image */
        width: 30px; /* Set a fixed width */
        height: 30px; /* Set a fixed height */
        object-fit: contain; /* Image will maintain its aspect ratio */
    }
    .buttons button {
        margin: 0 5px; /* Space between buttons */
        background-color: transparent;
        cursor: pointer;
        border: 0px solid var(--primary-color);
    }
</style>
