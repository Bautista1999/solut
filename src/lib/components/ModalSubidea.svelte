<script>
    import {
        NotSignedInModal,
        loginedIn,
        subideaModal,
    } from "$lib/stores/other_stores";
    import { ProgressRadial } from "@skeletonlabs/skeleton";
    import Modal from "./modal.svelte";
    import {
        followIdea,
        unfollowIdea,
    } from "$lib/data_functions/user.functions";
    import { info } from "$lib/stores/auth.state";
    import MagicalDots from "./magicalDots.svelte";
    import { createSubidea } from "$lib/data_objects/data_objects";
    export let followSub = false;
    export let subIdeaOpen = createSubidea();
    let followLoading = false;
</script>

{#if window.innerWidth < 500}
    <Modal
        bind:isOpen9={$subideaModal}
        close={() => {
            subideaModal.set(false);
            followSub = false;
        }}
    >
        <img src={subIdeaOpen?.data.imageURL} alt={"title"} />
        <br />
        <div class="barra">
            <div class="progreso" style="width: {65}%">
                ICP tok: {subIdeaOpen?.data.pledged}
            </div>
            {#if window.innerWidth < 500}
                <div class="progreso2"></div>
            {:else}
                <div class="progreso2"></div>
            {/if}
        </div>
        <br />
        {#if followLoading}
            <button
                class="fundButton"
                style="background-color: skyblue; color:white; display: block; margin-left: auto; margin-right: auto; display: flex; 
                                    align-items: center; 
                                    justify-content: center;
                                    padding:10px;
                                    "
            >
                <div style="transform: scale(0.7); margin-bottom:20px;">
                    <MagicalDots />
                </div></button
            >
        {:else if followSub}
            <button
                class="fundButton"
                style="background-color: #ff6000; color:white; display: block; margin-left: auto; margin-right: auto;"
                on:click={async () => {
                    followLoading = true;
                    let result = await unfollowIdea(
                        $info.key,
                        subIdeaOpen.key || "",
                        "subideas",
                    );
                    if (result == "Not signed in") {
                        NotSignedInModal.set(true);
                        followLoading = false;
                        return;
                    }
                    followLoading = false;
                    followSub = false;

                    followSub = false;
                    subIdeaOpen.data.amountFollowers =
                        subIdeaOpen?.data.amountFollowers - 1;
                }}>Unfollow</button
            >
        {:else}
            <button
                class="fundButton"
                style="background-color: white; color:black; display: block; margin-left: auto; margin-right: auto;"
                on:click={async () => {
                    followLoading = true;
                    let result = await followIdea(
                        $info.key,
                        subIdeaOpen.key || "",
                        "subideas",
                    );
                    if (result == "Not signed in") {
                        NotSignedInModal.set(true);
                        followLoading = false;
                        return;
                    }
                    followLoading = false;
                    followSub = true;
                    subIdeaOpen.data.amountFollowers =
                        subIdeaOpen?.data.amountFollowers + 1;
                }}>Follow 👍</button
            >
        {/if}
        <div class="title-followers-row">
            <h1 style="font-size:20px; margin-right:5px;">
                {subIdeaOpen?.data.title}
            </h1>

            <div class="followers" style="margin-right:10px;margin-top:15px; ">
                <h2 style="text-align: center; font-size:xx-large; ">
                    {subIdeaOpen?.data.amountFollowers}
                </h2>
                <p style="text-align: center;">followers</p>
            </div>
        </div>
        <div class="spacer" />
        <!-- Second Row -->
        <h4>{subIdeaOpen?.data.subtitle}</h4>
        <div class="spacer" />
        <!-- Third Row -->
        <p>{subIdeaOpen?.data.description}</p>
        <div class="spacer" />
    </Modal>
{:else}
    <Modal
        bind:isOpen8={$subideaModal}
        close={() => {
            subideaModal.set(false);
            followSub = false;
        }}
    >
        <div class="topic-block">
            <!-- First Column -->
            <div class="image-column">
                <img src={subIdeaOpen?.data.imageURL} alt={"title"} />
                <br />
                <div class="barra">
                    <div class="progreso" style="width: {65}%">
                        ICP tok: {subIdeaOpen?.data.pledged}
                    </div>
                    {#if window.innerWidth < 500}
                        <div class="progreso2"></div>
                    {:else}
                        <div class="progreso2"></div>
                    {/if}
                </div>
                <br />
                {#if followLoading}
                    <button
                        class="fundButton"
                        style="background-color: skyblue; padding: 10px;color:white; display: block; margin-left: auto; margin-right: auto; display: flex; 
                                    align-items: center; 
                                    justify-content: center; "
                    >
                        <div style="transform: scale(0.7); margin-bottom:20px;">
                            <MagicalDots />
                        </div></button
                    >
                {:else if followSub}
                    <button
                        class="fundButton"
                        style="background-color: #ff6000; color:white; display: block; margin-left: auto; margin-right: auto;"
                        on:click={async () => {
                            followLoading = true;
                            let result = await unfollowIdea(
                                $info.key,
                                subIdeaOpen.key || "",
                                "subideas",
                            );
                            if (result == "Not signed in") {
                                NotSignedInModal.set(true);
                                followLoading = false;
                                return;
                            }
                            followLoading = false;
                            followSub = false;

                            followSub = false;
                            subIdeaOpen.data.amountFollowers =
                                subIdeaOpen?.data.amountFollowers - 1;
                        }}>Unfollow</button
                    >
                {:else}
                    <button
                        class="fundButton"
                        style="background-color: white; color:black; display: block; margin-left: auto; margin-right: auto;"
                        on:click={async () => {
                            followLoading = true;
                            let result = await followIdea(
                                $info.key,
                                subIdeaOpen.key || "",
                                "subideas",
                            );
                            if (result == "Not signed in") {
                                NotSignedInModal.set(true);
                                followLoading = false;
                                return;
                            }
                            followLoading = false;
                            followSub = true;
                            subIdeaOpen.data.amountFollowers =
                                subIdeaOpen?.data.amountFollowers + 1;
                        }}>Follow 👍</button
                    >
                {/if}
            </div>

            <!-- Second Column -->
            <div class="info-column">
                <!-- First Row -->
                <div class="title-followers-row">
                    <h1 style="font-size:20px; margin-right:5px;">
                        {subIdeaOpen?.data.title}
                    </h1>

                    <div
                        class="followers"
                        style="margin-right:10px;margin-top:15px; "
                    >
                        <h2 style="text-align: center; font-size:xx-large; ">
                            {subIdeaOpen?.data.amountFollowers}
                        </h2>
                        <p style="text-align: center;">followers</p>
                    </div>
                </div>
                <div class="spacer" />
                <!-- Second Row -->
                <h4>{subIdeaOpen?.data.subtitle}</h4>
                <div class="spacer" />
                <!-- Third Row -->
                <p>{subIdeaOpen?.data.description}</p>
                <div class="spacer" />
            </div>
        </div>
    </Modal>
{/if}

<style>
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
        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
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

    .barra {
        width: 100%;
        height: 40px;
        display: flex; /* Convertimos la barra en un contenedor flex */
        align-items: center; /* Alineación vertical en el centro */
        background-color: #e0e0e0;
        border-radius: 2px;
        overflow: visible;
        border-style: groove;
        border-width: 1px;
        border-color: black;
    }
    .progreso {
        height: 100%;
        background: linear-gradient(
            to right,
            orange,
            orangered
        ); /* Naranja claro a naranja fuerte */
        transition: width 0.3s;
        padding: 1%;
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        color: #e0e0e0;
        font-size: larger;
        font-weight: 450;
        border-radius: 2px;
    }
    .progreso2 {
        margin: 3%;
        flex: 1; /* Ocupará todo el espacio restante después del div progreso */
        display: flex;
        align-items: center; /* Alineación vertical en el centro */
        justify-content: flex-start; /* Alineación horizontal al inicio */
        color: orangered;
        font-size: larger;
    }

    .followers {
        margin-left: 10px; /* adjust this as needed */
        align-self: flex-start; /* This will align it to the top with the title */
        padding-top: 10px;
        padding-bottom: 10px;
        border-color: black;
        border-width: 1px;
        background: linear-gradient(to right, #ff6000, orangered);
        color: #e0e0e0;
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.2);
        width: 2.3cm;
        height: 1.7cm;
    }

    .topic-block {
        display: flex;
    }

    .image-column {
        flex: 2;
        margin-right: 20px;
    }

    .image-column img {
        width: 100%;
        height: fit-content;
    }

    .info-column {
        flex: 2;
        display: flex;
        flex-direction: column;
        padding: 10px;
    }

    .title-followers-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-right: 1cm;
        margin-right: 20px;
    }
</style>
