<script>
    export let msg = "Label";
    export let icon = "";
    export let someFunction = () => {}; // A function passed from the parent
</script>

<link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
/>
<button on:click={someFunction}>
    {msg} <span class="material-symbols-outlined"> {icon} </span></button
>

<style>
    button {
        width: fit-content;
        height: fit-content;
        padding-inline: 15px;
        padding-block: 5px;
        font-size: medium;
        background-color: var(--primary-color);
        box-shadow: 4px 4px 0px 0px var(--tertiary-color);
        color: var(--tertiary-color);
        transition:
            background-color 0.3s ease,
            transform 0.1s ease,
            /* Smooth transitions for background color and transforming */
                box-shadow 0.1s ease; /* Adding transition for box-shadow */
        cursor: pointer;
        border: 1px solid var(--tertiary-color);
        border-radius: 0px;
        font-family: Barlow;
        display: flex; /* Set the display to flex to enable flexbox properties */
        flex-direction: row; /* Align children in a row (horizontal alignment) */
        justify-content: center; /* Horizontally center the items in the container */
        align-items: center; /* Vertically align the items in the middle */
        gap: 5px;
    }
    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 48;
    }
    button:hover {
        background-color: var(
            --tertiary-color
        ); /* Darker blue background on hover */
        color: var(--primary-color); /* Change text color on hover */
        border-color: var(--primary-color);
        box-shadow: 4px 4px 0px 0px var(--primary-color);
    }
    button:active {
        transform: scale(0.98); /* Slightly scale down the button */
        box-shadow: 0px 0px 0px 0px var(--primary-color);
    }
</style>
