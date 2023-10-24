<script>
    import { info } from "$lib/stores/auth.state";
    import {
        displayedUpdImages,
        updateImages,
        updateModal,
    } from "$lib/stores/loading";
    import { afterUpdate, onMount } from "svelte";
    import Modal from "./modal.svelte";
    import { subList } from "$lib/data_functions/user.functions";
    import { AdvancedSubList } from "$lib/other_functions/other.functions";
    import { list } from "postcss";
    import { createDate, createUpdate } from "$lib/data_objects/data_objects";
    import { deleteUpdate } from "$lib/data_functions/docu.functions";
    import Loading from "./loading.svelte";
    import Success from "./success.svelte";
    let showModal3 = false;
    export let description = "This is the description";
    export let creator =
        "2dgol-6t7gr-wbceo-axkyn-3qinp-vxv32-zrqbv-oj6tr-ztuvk-el3ln-3ae";
    export let status = "Solution launch";
    export let subject = "New buttons feature";
    export let date = createDate();
    export let nxtStatus = "Design start";
    export let nxtDate = createDate();
    export let update = createUpdate();
    export let solutionKey = "";
    export let profile =
        "https://beebom.com/wp-content/uploads/2022/02/Featured.jpg?w=750&quality=75";
    /**
     * @type {string[]}
     */
    let img = $updateImages;
    /**
     * @type {string[]}
     */
    let displayedImages = $updateImages;
    let isLoading = false;
    let success = false;
    onMount(() => {
        if (window.innerWidth < 500) {
            $updateImages = subList($updateImages, 2);
        } else {
            $updateImages = subList($updateImages, 3);
        }
        console.log("Images: ", $updateImages);
    });
    let position = 0;

    /**
     * @param {string} direction
     */
    function slideImages(direction) {
        let amount = 3;
        console.log("Before: ", position);
        console.log("Direction: ", direction);
        if (window.innerWidth < 500) {
            amount = 2;
        }
        $displayedUpdImages = AdvancedSubList(
            $updateImages,
            amount,
            direction,
            position
        );
        if (direction == "left") {
            if (position > 0) {
                position--;
            }
        } else {
            if (position < $updateImages.length - amount) {
                position++;
            }
        }
        console.log("After: ", position);
    }
    let msg = "Loading";
    async function deleteUp() {
        isLoading = true;
        showModal3 = false;
        msg = "Deleting update";

        let del = await deleteUpdate(update, solutionKey);
        console.log(update);
        isLoading = false;
        success = true;
        msg = "Update deleted successfully!";
        setTimeout(() => {
            success = false;
            updateModal.set(false);
            window.location.reload();
        }, 3000);
    }
</script>

<Modal
    bind:isOpen10={$updateModal}
    close={() => {
        updateModal.set(true);
    }}
>
    {#if isLoading}
        <Loading {msg} modal={true} />
    {:else if success}
        <Success {msg} />
    {:else}
        <div class="creatorClass">
            {#if window.innerWidth < 500}
                <div
                    class="profilePicture"
                    style="margin-right:1em; width: 2.3cm;"
                >
                    <img src={profile} alt="Profile Picture" />
                </div>
            {:else}
                <div
                    class="profilePicture"
                    style="margin-right:1em; width: 2.8cm;"
                >
                    <img src={profile} alt="Profile Picture" />
                </div>
            {/if}
            <div
                style="display: flex; flex-direction:column; justify-content:center;align-items:flex-start; text-align:left;"
            >
                {#if window.innerWidth < 500}
                    <p
                        class="text-body"
                        style="width: fit-content; max-width:6cm;"
                    >
                        <span style="font-weight: 800;">Creator</span>:
                        {creator}
                    </p>
                    <span
                        style="font-style:italic; font-weight: 400; color:gray"
                        >{date.day}/{date.month}/{date.year}</span
                    >
                {:else}
                    <p class="text-body">
                        <span style="font-weight: 800;">Creator</span>: {creator}
                    </p>
                    <span
                        style="font-style:italic; font-weight: 400; color:gray"
                        >{date.day}/{date.month}/{date.year}</span
                    >
                {/if}
            </div>
        </div>
        <br />
        <h4 style="font-size: large; line-height: 1.1;" class="NormalColor">
            <span style="font-weight: 700;">STATUS</span>:
            <span style="font-weight: 400;">{status}</span>
        </h4>

        <h4
            style="font-size: large; line-height: 1.1; margin-top: 10px;"
            class="NormalColor"
        >
            <span style="font-weight: 700;">SUBJECT</span>:
            <span style="font-style:italic; font-weight: 400;">{subject}</span>
        </h4>
        <br />
        <div class="description">
            <h4 style="font-size: large; line-height: 1.1;" class="NormalColor">
                <span style="font-weight: 700;">UPDATE</span>:
            </h4>
            {#if description.length > 1000}
                <p class="text-body NormalColor" style="text-align: justify;">
                    {description.substring(0, 1000)}...
                    <button
                        style="font-style: italic; text-decoration:underline;"
                        >(see more)</button
                    >
                </p>
            {:else}
                <p class="text-body NormalColor" style="text-align: justify;">
                    {description}
                </p>
            {/if}
        </div>
        <br />
        {#if $displayedUpdImages.length != 0}
            <div class="imagesBlock">
                <button class="copy" on:click={() => slideImages("left")}>
                    {"⬅️"}
                </button>

                <div class="imagesSection">
                    {#each $displayedUpdImages as imageUrl}
                        <div class="imageContainer">
                            <img src={imageUrl} alt="" />
                        </div>
                    {/each}
                </div>
                <button class="copy" on:click={() => slideImages("right")}>
                    {"➡️"}
                </button>
            </div>
        {/if}
        <div class="creatorButtons">
            {#if creator == $info.key}
                <button
                    class="fundButton"
                    style="width:3cm; background-color:red;color:white;"
                    on:click={() => {
                        showModal3 = true;
                    }}>Delete</button
                >
            {/if}
        </div>
        <br />
        <h4
            style="font-size: large; line-height: 1.1; margin-top: 10px;"
            class="NormalColor"
        >
            <span style="font-weight: 700;">NEXT DEADLINE</span>:
            <span style="font-style:italic; font-weight: 400;">
                {"  "}
                {nxtStatus}
                {"-"}
                {nxtDate.day}/{nxtDate.month}/{nxtDate.year}
            </span>
        </h4>
    {/if}
</Modal>

<Modal
    bind:isOpen3={showModal3}
    close={() => {
        showModal3 = false;
    }}
>
    <div class="delete">
        <p>Are you sure you want to delete this update?</p>
        <br />
        <br />
    </div>
    <div class="delete">
        <button
            class="fundButton"
            style="width: 1.5cm; height:0.8cm; color:white; background-color:red"
            on:click={() => {
                deleteUp();
            }}>Yes</button
        >

        <button
            class="fundButton"
            style="width: 1.5cm; height:0.8cm; color:white; background-color:red"
            on:click={() => {
                showModal3 = false;
            }}>No</button
        >
        <div class="spacer" />
    </div>
</Modal>

<style>
    .profilePicture {
        width: 2.3cm;
        height: 2.3cm;
        border-radius: 50%;
        overflow: hidden; /* Hide any overflowing image */
        border: 2px solid orangered;
        box-shadow: 0px 0px 15px rgb(243, 97, 0);
        display: flex;
        justify-content: center; /* Center horizontally */
        align-items: center; /* Center vertically */
    }

    .profilePicture img {
        width: auto;
        height: 100%;
        display: block;
        margin: 0 auto;
        object-fit: cover;
    }
    .creatorClass {
        width: 100%;
        height: auto;
        display: flex; /* Convertimos la barra en un contenedor flex */
        align-items: center; /* Alineación vertical en el centro */

        border-radius: 10px;
        overflow: visible;
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: left; /* Horizontal alignment */
    }
    .description {
        background-color: white;
        padding: 2%;
        border: 1px solid black;
    }
    .NormalColor {
        color: rgb(37, 88, 101);
    }
    .delete {
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        gap: 20px;
    }
    .text-body {
        margin-bottom: 2%;
        width: 100%;
        z-index: 0;
    }
    .fundButton {
        width: 25%;
        height: 50px;
        /* background: linear-gradient(to right, rgb(255, 0, 0), orangered); */
        background-color: rgb(221, 243, 255);
        border-style: groove;
        border-color: black;
        border-width: 1px;
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        font-size: large;
        font-weight: 330;
        box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.2); /* horizontal, vertical, blur, color */
        color: black;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .fundButton:hover {
        transform: scale(
            1.08
        ); /* scales the button to 105% of its original size on hover */
    }
    .fundButton:active {
        transform: scale(
            0.95
        ); /* scales the button to 95% of its original size on click */
        box-shadow: none; /* removes the shadow */
    }
    .imagesBlock {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
    }
    .imagesSection {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        width: 7.5cm;
        align-items: center;
    }
    .imageContainer {
        height: 5cm;
        display: flex; /* Center content vertically */
        justify-content: center; /* Center content horizontally */
        align-items: center; /* Center content vertically */
        max-width: 50%; /* Ensure the container respects the max-width */
    }

    img {
        max-width: 100%; /* Ensure the image respects the max-width */
        max-height: 100%; /* Ensure the image respects the max-height */
        object-fit: contain; /* Maintain image proportions and fit inside container */
        border-color: black;
        border-width: 1px;
    }
    @media (min-width: 768px) {
        .imagesSection {
            display: flex;
            justify-content: center;
            gap: 10px;
            width: 13cm;
            padding: 10px;
            align-items: center;
        }
    }

    .copy {
        font-size: larger;
        font-weight: 330;
        width: 1cm; /* Set width of the circle */
        height: 1cm; /* Set height of the circle */
        border-radius: 50%; /* Makes the button circular */
        display: flex; /* Use flexbox to center the emoji */
        align-items: center; /* Center the emoji vertically */
        justify-content: center; /* Center the emoji horizontally */
        border: 1px solid black; /* Add a black border */
        background-color: rgb(
            216,
            250,
            255
        ); /* Optional: Set a background color */
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.2); /* horizontal, vertical, blur, color */
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .copy:hover {
        transform: scale(1.08);
    }
    .copy:active {
        transform: scale(
            0.95
        ); /* scales the button to 95% of its original size on click */
        box-shadow: none; /* removes the shadow */
    }
    .creatorButtons {
        display: flex;
        align-items: flex-start;
        gap: 20px;
    }
</style>
