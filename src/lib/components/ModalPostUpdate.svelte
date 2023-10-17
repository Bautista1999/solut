<script>
    import { createUpdate } from "/Users/juanbautistamartinezrezzio/Documents/Dev/ic_project/solutio/src/lib/data_objects/data_objects.js";
    import { PostUpdateModal } from "$lib/stores/loading";
    import Modal from "./modal.svelte";
    import { substractItem } from "$lib/other_functions/other.functions";

    let update = createUpdate();
    let image = "";
    async function postUpdate() {
        console.log("Update: ", update);
    }
</script>

<Modal
    bind:isOpen7={$PostUpdateModal}
    close={() => {
        PostUpdateModal.set(false);
    }}
>
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <h2
        class="title"
        style=" background-color: skyblue; color:black; display: block; margin-left: auto; margin-right: auto;"
    >
        Post update
    </h2>
    <h3>Subject</h3>
    <textarea
        class="textarea"
        style="border-width:1px;border-color:black;width:100%; padding:5px; background-color:white;"
        bind:value={update.subject}
    />
    <h3>Body</h3>
    <textarea
        class="textarea"
        style="border-width:1px;border-color:black;width:100%; padding:5px; background-color:white;"
        bind:value={update.body}
    />
    <h3>Image</h3>
    <input
        type="text"
        style="border-width:1px;border-color:black;width:100%; padding:5px;"
        bind:value={image}
    />
    <div style="height: 0.2cm;" />
    <p>
        Please, check the url of the image is working correctly before editing
        the idea.
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
            }}>Add an image +</button
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
                            update.images = substractItem(update.images, opt);
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
                            update.images = substractItem(update.images, opt);
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
            await postUpdate();
            PostUpdateModal.set(false);
        }}>Post!</button
    >
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
