<script>
    // @ts-nocheck

    import Header from "$lib/components/header.svelte";
    import { onMount } from "svelte";
    import {
        basicInfo,
        info,
        transferFrom,
    } from "/Users/juanbautistamartinezrezzio/Documents/Dev/ic_project/solutio/src/lib/stores/auth.state.js";
    import { clipboard } from "@skeletonlabs/skeleton";
    let amountTokens = 0;
    let address = "";
    let destination = "";
    let amount = 0n;
    onMount(async () => {
        await basicInfo();
        console.log("Agent: ", $info.agent);
        console.log("Identity: ", $info.identity);
        console.log("Wallet address: ", $info.walletAddress);
        console.log("Balance: ", $info.userBalance);
        // @ts-ignore
        amountTokens = Number($info.userBalance);
        console.log("amount of tokens:", amountTokens);
        // @ts-ignore
        address = $info.walletAddress;
    });
    async function transfer(destination, amount) {
        console.log(transferFrom(destination, amount));
    }
</script>

<Header />
<div class="body">
    <div class="content">
        <h2 class="h2 text-body">Wallet</h2>
        <div
            class="card bg-gradient-to-br variant-gradient-primary-tertiary"
            style="padding: 5%;"
        >
            <div class="">
                <div class="h1" style="color: aliceblue;">
                    You got {amountTokens} ICP tokens
                </div>
                <div class="h3" style="color: aliceblue;">
                    If you want to add some tokens, send some to your solutio
                    address:
                </div>
                <div data-clipboard="exampleElement" style="color: white;">
                    {address}
                </div>
                <button
                    use:clipboard={{ element: "exampleElement" }}
                    class="btn variant-filled"
                    style="border-radius: 20px;">Copy</button
                >
                <label for="input" style="color: white; ">Enter address</label>
                <input
                    type="text"
                    id="input"
                    style="width:100%;background-color:cadetblue;color:aliceblue;padding:10px;"
                    bind:value={destination}
                />
                <br />
                <br />
                <div class="card-content">
                    <div
                        class="btn variant-filled"
                        style="border-radius:20px;"
                        on:click={transfer(destination, 1n)}
                    >
                        Send
                    </div>
                </div>
            </div>
        </div>
        <br />
    </div>
</div>

<style>
    .text-body {
        margin-bottom: 2%;
        width: 100%;
    }
    .card {
        width: 17cm;
        height: 10.8cm;
        border-radius: 20px;
    }
    .body {
        display: flex;
        justify-content: center;
        align-items: flex-start; /* aligns items at the top */
        width: 100%;

        min-height: 100vh;
    }
    .card-content {
        display: flex;
        flex-direction: column;
        align-items: center; /* horizontally centers content */
        justify-content: space-between; /* spaces out content vertically */
        height: 100%; /* takes the full height of the card */
    }

    .content {
        width: 80%;
        max-width: 800px;
        text-align: left; /* aligns the text to the left */
        height: 12cm;
        margin: 20px auto 0 auto; /* top margin creates space from the top */
    }
    p {
        text-align: center;
    }

    @media (max-width: 768px) {
        .content {
            width: 95%;
        }
        .card {
            width: 95%;
        }
    }
</style>
