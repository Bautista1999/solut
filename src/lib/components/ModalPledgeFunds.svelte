<script>
    import Modal from "./modal.svelte";
    import { pledgeModal, termsModal } from "$lib/stores/loading";
    import {
        fromICPtoUSD,
        fromUSDtoICP,
        pledgeFunds,
    } from "$lib/other_functions/other.functions";
    import Terms from "./terms.svelte";
    let amountUSD = 10;
    export let documentID = "";
    export let collectionName = "";
    let showModal6 = false;
</script>

<Modal
    bind:isOpen={$pledgeModal}
    close={() => {
        pledgeModal.set(false);
    }}
>
    <h2 style="font-size: 25px;">Funding process</h2>
    <div class="spacer" />
    <p>
        Right now, you have 0.159 ICP tokens in your solutio wallet. If you wish
        to add more, go to your <a
            href="/billetera"
            style="color:blue; text-decoration:underline;"
            >Solutio wallet page</a
        >.
    </p>
    <br />
    <h3>Pick amount in US dollars.</h3>
    <div class="spacer" />
    <p>
        <input type="number" class="inputNumber" bind:value={amountUSD} />
        USD = {fromUSDtoICP(amountUSD)} ICP tokens
    </p>
    <br />
    <p>
        <input type="checkbox" /> I accept the
        <a
            on:click={() => {
                termsModal.set(true);
            }}
            style="color:blue; text-decoration:underline;"
            >Terms and conditions.</a
        >
    </p>
    <br />
    <button
        on:click={async () => {
            await pledgeFunds(
                documentID,
                fromUSDtoICP(amountUSD),
                "e4204e024181e960a018a5cbdc51b8af834f33932bfe4d711909b492b16767eb",
                collectionName
            );
            pledgeModal.set(false);
        }}
        class="fundButton"
        style="background-color: #ff6000; color:aliceblue; display: block; margin-left: auto; margin-right: auto;"
        >Pledge</button
    >
    <br />
    <p>
        Your tokens won't go to the creator of the issue, nor the developer, it
        will go to a smart contract that represents this idea. Find out more <a
            href=""
            style="color:blue; text-decoration:underline;">here</a
        >.
    </p>
</Modal>
<Terms />

<style>
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
    .spacer {
        height: 0.3cm;
    }
    .inputNumber {
        width: 50%;
        border-color: black;
        border-width: 1px;
        padding: 5px;
    }
</style>
