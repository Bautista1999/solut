<script>
    import {
        createDeadline,
        createFinalUpdate,
        createUpdate,
    } from "/Users/juanbautistamartinezrezzio/Documents/Dev/ic_project/solutio/src/lib/data_objects/data_objects.js";
    import { finishProject } from "../stores/other_stores";
    import Modal from "./modal.svelte";
    import {
        getClosestDate,
        substractItem,
    } from "/Users/juanbautistamartinezrezzio/Documents/Dev/ic_project/solutio/src/lib/other_functions/other.functions.js";
    import { info } from "$lib/stores/auth.state";
    import {
        postFinalUpdate,
        postUpdate,
    } from "$lib/data_functions/docu.functions";
    import Loading from "./loading.svelte";
    import { nanoid } from "nanoid";
    import Success from "./success.svelte";

    let update = createFinalUpdate();
    let image = "";
    let isLoading = false;
    let success = false;
    export let solutionKey = "";

    async function UpdatePost() {
        isLoading = true;
        let presentDate = new Date();
        console.log(presentDate);
        let currentDay = presentDate.getDate();
        let currentMonth = presentDate.getMonth() + 1;
        let currentYear = presentDate.getFullYear();
        update.date = {
            month: currentMonth,
            day: currentDay,
            year: currentYear,
        };
        update.status = "PROJECT CONCLUSION";
        update.creator = $info.key;
        update.key = nanoid();
        await postFinalUpdate(update, solutionKey);
        isLoading = false;
        success = true;
        setTimeout(() => {
            success = false;
            finishProject.set(false);
            window.location.reload();
        }, 2000);
    }
</script>

<Modal
    bind:isOpen7={$finishProject}
    close={() => {
        finishProject.set(false);
    }}
>
    {#if isLoading}
        <Loading msg="Uploading update" modal={true} />
    {:else if success}
        <Success msg="Update created successfully!" />
    {:else}
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <h2
            class="title"
            style=" background-color: skyblue; color:black; display: block; margin-left: auto; margin-right: auto;"
        >
            Finish Project
        </h2>
        <h3>Subject</h3>
        <textarea
            class="textarea"
            style="border-width:1px;border-color:black;width:100%; padding:5px; background-color:white;"
            bind:value={update.subject}
        />
        <h3>Status</h3>
        <input
            class="text"
            style="border-width:1px;border-color:skyblue;width:100%; padding:5px; background-color:white;"
            placeholder="PROJECT CONCLUSION"
            disabled={true}
        />
        <h3>Body</h3>
        <textarea
            class="textarea"
            style="border-width:1px;border-color:black;width:100%; padding:5px; background-color:white;"
            bind:value={update.body}
        />
        <h3>Link to your project</h3>
        <input
            class="text"
            style="border-width:1px;border-color:black;width:100%; padding:5px; background-color:white;"
            bind:value={update.link}
        />
        <h3>Images</h3>
        <input
            type="text"
            style="border-width:1px;border-color:black;width:100%; padding:5px;"
            bind:value={image}
        />
        <div style="height: 0.2cm;" />
        <p>
            Please, check the url of the image is working correctly before
            editing the idea.
        </p>
        <div class="spacer" />
        <div class="creatorButton">
            <button
                class="tabs"
                style="background-color:chartreuse; width: 5cm; height: 1cm;"
                on:click={() => {
                    update.images.push(image);
                    update.images = update.images;
                    console.log(update.images);
                    image = "";
                }}>Add image +</button
            >
        </div>
        <div class="spacer" />
        <ul>
            {#each update.images as opt}
                {#if window.innerWidth < 500}
                    <li>
                        <button
                            style="background-color: 
                    grey; color: white; 
                    width: 0.5cm; height: 0.5cm; border-radius:50%;
                    text-align: center; line-height: 0.5cm; 
                     "
                            on:click={() => {
                                update.images = substractItem(
                                    update.images,
                                    opt
                                );
                            }}
                        >
                            -
                        </button>
                        {opt.substring(0, 33)}...
                    </li>
                {:else}
                    <li>
                        <button
                            style="background-color: 
                        grey; color: white; 
                        width: 0.5cm; height: 0.5cm; border-radius:50%;
                        text-align: center; line-height: 0.5cm; 
                         "
                            on:click={() => {
                                update.images = substractItem(
                                    update.images,
                                    opt
                                );
                            }}
                        >
                            -
                        </button>
                        {opt}
                    </li>
                {/if}
            {/each}
        </ul>

        <div style="height: 0.3cm;" />
        <button
            class="fundButton"
            style="background-color: #ff6000; color:white; display: block; margin-left: auto; margin-right: auto;"
            on:click={async () => {
                await UpdatePost();
            }}>Post!</button
        >
    {/if}
</Modal>

<style>
    .creatorButton {
        display: flex;
        align-items: flex-start;
        gap: 20px;
    }
    .spacer {
        height: 0.3cm;
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
    .title {
        width: 4cm;
        height: fit-content;
        /* background: linear-gradient(to right, rgb(255, 0, 0), orangered); */
        background-color: rgb(221, 243, 255);
        padding: 11px;
        border-style: groove;
        border-color: black;
        border-width: 1px;
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        font-size: large;
        font-weight: 330;
        box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.2); /* horizontal, vertical, blur, color */
        color: black;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        text-align: center;
    }
    .tabs {
        width: 25%;
        height: 50px;
        /* background: linear-gradient(to right, rgb(255, 0, 0), orangered); */
        background-color: rgb(255, 245, 191);
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
    .tabs:hover {
        transform: scale(
            1.08
        ); /* scales the button to 105% of its original size on hover */
    }
    .tabs:active {
        transform: scale(
            0.95
        ); /* scales the button to 95% of its original size on click */
        box-shadow: none; /* removes the shadow */
    }
</style>
