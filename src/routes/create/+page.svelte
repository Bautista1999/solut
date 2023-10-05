<script>
    import Header from "$lib/components/header.svelte";
    import { initJuno, getDoc } from "@junobuild/core";
    import { afterUpdate, onMount } from "svelte";

    import { nanoid } from "nanoid";
    import { goto } from "$app/navigation";
    import Solution from "./page.solution.svelte";
    import Topic from "./page.topic.svelte";
    let myId = nanoid();
    console.log(myId);

    import { isLoading, loginedIn } from "$lib/stores/loading";
    import Loading from "$lib/components/loading.svelte";
    import { basicInfo, signedIn } from "$lib/stores/auth.state";
    import Signin from "$lib/components/signin.svelte";

    // Now you can use isLoading as a writable store in your component
    isLoading.set(false); // To set its initial value

    let created = false;
    /** @type {import('./$types').PageData} */
    export let data;
    let under = data?.under || "-none-";
    let underIdeas = [];
    let msg = "Uploading data";
    function goSee() {
        goto("idea/" + "?id=" + myId);
    }
    async function getSuggestion() {}
    let title = "-none-";
    onMount(async () => {
        isLoading.set(true); // To set its initial value
        msg = "Checking sign in";
        await initJuno({
            satelliteId: "vehbc-zaaaa-aaaal-acyba-cai",
        });
        await basicInfo();
        console.log("Mounted");
        if (under != "-none-") {
            const myDoc = await getDoc({
                collection: "ideas",
                // @ts-ignore
                key: data.under,
            });
            title = myDoc?.data.title;
        }
        msg = "Uploading data";
        isLoading.set(false); // To set its initial value
        signedIn();
    });
    let tabs = 0;
    /**
     * @param {number} num
     */
    function changeTab(num) {
        tabs = num;
    }
    afterUpdate(() => {});
</script>

<Header />
{#if !$loginedIn}
    <Signin />
{:else if !$isLoading && !created}
    {#if tabs == 0}
        <div class="fundButtonBack">
            <button class="tabs">Topic</button>
            <button class="tabClosed" on:click={() => changeTab(1)}
                >Solution</button
            >
        </div>
        <div class="horizontalLine" />
        <Topic />
    {:else}
        <div class="fundButtonBack">
            <button class="tabClosed" on:click={() => changeTab(0)}
                >Topic</button
            >
            <button class="tabs">Solution</button>
        </div>
        <div class="horizontalLine" />
        <Solution data={{ under: data?.under }} />
    {/if}
{:else if created}
    <div class="card p-4 centered-flexbox">
        <img
            src="/assets/correct.png"
            alt=""
            style="width:20%;"
            class="centered-image"
        />
        <br />
        <h1>Idea created successfully!</h1>
        <br />
        <button
            type="button"
            class="btn variant-filled"
            style="border-radius: 1000px; background-color:orangered"
            on:click={goSee}
            on:keydown={goSee}
        >
            <span>➡️</span>
            <span>Go see the idea 🚀</span>
        </button>
    </div>
{:else}
    <Loading {msg} />
{/if}

<style>
    .horizontalLine {
        width: 87%;
        height: 1px;
        background-color: black;
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        margin: 20px auto 0 auto; /* top margin creates space from the top */
    }
    .fundButtonBack {
        width: 90%;
        height: 40px;
        margin: 20px auto 0 auto; /* top margin creates space from the top */
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        gap: 30px;
    }
    .tabClosed {
        width: 150px;
        height: 50px;
        /* background: linear-gradient(to right, rgb(255, 0, 0), orangered); */
        border-style: groove;
        border-color: currentColor;
        border-width: 0.2px;
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        font-size: large;
        font-weight: 330;
        /* box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.2); horizontal, vertical, blur, color */
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .tabClosed:hover {
        transform: scale(
            1.08
        ); /* scales the button to 105% of its original size on hover */
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.2);
        border-width: 0.5px;
        /* background-color: rgba(255, 245, 191, 0.5); */
    }
    .tabs {
        width: 150px;
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
    .btn {
        background-color: orangered;
        color: white;
    }

    .card {
        position: absolute;
        left: 47%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 25px;
        width: 30%;
        height: 30%;

        /* Add these to make content centered */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .centered-image {
        margin-left: auto;
        margin-right: auto;
        width: 100%;
    }
</style>
