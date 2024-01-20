<script>
    import { goto } from "$app/navigation";
    import {
        getProfilePicture,
        getUsername,
    } from "$lib/data_functions/docu.functions";
    import { createTopic } from "$lib/data_objects/data_objects";
    import { onMount } from "svelte";

    export let topic = createTopic();
    export let creator = "";
    export let key = "";
    let picture = "";
    let percentage = 90;
    onMount(async () => {
        if (creator != "") {
            picture = await getProfilePicture(creator);
            creator = await getUsername(creator);

            console.log(creator);
        }
    });
    let length = 25;
    let subtitleLength = 199;
</script>

<button
    class="project"
    on:click={() => {
        goto("idea/" + "?id=" + key);
    }}
>
    <div class="infoSection">
        <div class="profilePicture">
            <img src={topic.image} />
        </div>
        <div class="projectBody">
            {#if topic.title.length > length}
                <h1>{topic.title.substring(0, length)}...</h1>
            {:else}
                <h1>{topic.title}</h1>
            {/if}
            {#if topic.subtitle.length > subtitleLength}
                <p>{topic.subtitle.substring(0, subtitleLength)}...</p>
            {:else}
                <p>{topic.subtitle}</p>
            {/if}
            <!-- <div style=" white-space: normal;">
                <p style="line-height: 1.1;">
                    {topic.description.substring(0, 130)}...
                </p>
            </div> -->

            <div style="height: 0.2cm;" />
        </div>

        <div class="barra">
            <div class="progreso" style="width: {91}%">
                {topic.moneyPledged - topic.moneyPledged * 0.2} ICP
            </div>
            {#if percentage < 90}
                {#if window.innerWidth < 500}
                    <div class="progreso2"></div>
                {:else}
                    <div class="progreso2"></div>
                {/if}
            {/if}
        </div>
        <div style="height: 0.3cm;" />
        <div class="followersInfo">
            <div class="centeredImage">
                <p>{topic.followers.length}</p>
                <p>followers</p>
            </div>
            <div class="verticalLine" />
            <div class="centeredImage">
                <p>{topic.ideas.length}</p>
                <p>ideas</p>
            </div>
            <div class="verticalLine" />
            <div class="centeredImage">
                <p>{topic.solutions.length}</p>
                <p>solutions</p>
            </div>
        </div>
    </div>

    <div class="horizontalLine" />
    <div class="footerSection">
        <div class="creatorPicture">
            <img src={picture} alt="" />
        </div>
        {#if creator.length > 30}
            <p>
                Creator: <span style="text-decoration: underline;"
                    >{creator.substring(0, 30)}...</span
                >
            </p>
        {:else}
            <p>
                Creator: <span style="text-decoration: underline;"
                    >{creator}</span
                >
            </p>
        {/if}
    </div>
</button>

<style>
    .verticalLine {
        height: 1cm;
        border-color: #ff6000;
        border-width: 0.5px;
    }
    .horizontalLine {
        width: 100%;
        border-color: black;
        border-width: 0.5px;
    }
    .followersInfo {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 40px;
    }
    .centeredImage {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    .creatorPicture {
        width: 0.8cm;
        height: 0.8cm;
        overflow: hidden;
        border: 1px solid black;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .creatorPicture img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .barra {
        width: 90%;
        height: 30px;
        margin-top: 0px;
        margin-bottom: 0px;
        margin-left: auto;
        margin-right: auto;
        display: flex;
        align-items: center;
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
    .projectBody {
        padding-top: 15px;
        padding-left: 15px;
        padding-right: 15px;
        padding-bottom: 5px;
        line-height: 1.5;
    }
    .profilePicture {
        width: 100%;
        height: 40%;
        overflow: hidden;
        border: 1px solid black;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .profilePicture img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .infoSection {
        width: 100%;
        height: 12.7cm;
    }
    .footerSection {
        width: 100%;
        height: 1.3cm;
        padding-left: 5px;
        padding-top: 6px;
        display: flex;
        flex-direction: row;
        gap: 10px;
        color: antiquewhite;
        background: linear-gradient(
            to right,
            #ff6000,
            rgb(255, 132, 9),
            #ff6000
        );
    }
    .project {
        width: 10cm;
        height: 14cm;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        text-align: left;
        background-color: antiquewhite;
        color: darkslategray;
        border-color: black;
        border-width: 2px;
        box-shadow: 10px 10px 0px rgb(0, 0, 0, 0.5);
        transition:
            transform 0.2s ease-in-out,
            box-shadow 0.2s ease;
    }
    .project:hover {
        transform: scale(1.05);
    }
    .project:active {
        transform: scale(0.98);
        box-shadow: none;
    }

    p {
        text-align: justify;
    }
    @media (max-width: 768px) {
        .followersInfo {
            gap: 20px;
        }
        .project {
            width: 8cm;
            height: 16cm;
        }
        .infoSection {
            height: 14.7cm;
        }
    }
</style>
