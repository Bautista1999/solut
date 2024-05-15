<script>
    import Modal from "./modal.svelte";
    import {
        NotSignedInModal,
        isLoading,
        loginedIn,
        pledgeModal,
        success,
        termsModal,
    } from "$lib/stores/other_stores";
    import {
        fromUSDtoICP,
        pledgeFunds,
    } from "$lib/data_functions/docu.functions";
    import Terms from "./terms.svelte";
    import BasicButton from "./basicButton.svelte";
    import BasicButtonSmall from "./BasicButton_Small.svelte";
    import BasicButtonDarkSmall from "./BasicButton_Dark_Small.svelte";
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
    <h2>Pledge funds</h2>
    <p>
        Right now, you have 12.159 ICP tokens in your wallet. If you wish to add
        more, go to your <a
            href="/profile"
            style="color:blue; text-decoration:underline;">profile</a
        >.
    </p>
    <br />
    <p>
        <input type="number" class="inputNumber" bind:value={amountUSD} />
        ICP
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
    <!-- <button
        on:click={async () => {
            if (!$loginedIn) {
                NotSignedInModal.set(true);
                return;
            }
            await pledgeFunds(
                documentID,
                fromUSDtoICP(amountUSD),
                "e4204e024181e960a018a5cbdc51b8af834f33932bfe4d711909b492b16767eb",
                "solutions",
            );
            pledgeModal.set(false);
        }}
        class="fundButton"
        style="background-color: #ff6000; color:aliceblue; display: block; margin-left: auto; margin-right: auto;"
        >Pledge</button
    > -->
    <!-- <BasicButton_Small msg={"Pledge"} /> -->
    <div
        style="display: flex; justify-content:center; align-items:center; width:100%;align-self:center;"
    >
        <BasicButtonDarkSmall
            msg={"Pledge"}
            someFunction={() => {
                pledgeModal.set(false);
                isLoading.set(true);

                setTimeout(() => {
                    isLoading.set(false);
                    success.set(true);
                    setTimeout(() => {
                        success.set(false);
                    }, 2500);
                }, 2500);
            }}
        />
    </div>

    <br />
    <p>
        Your pledge will be displayed along with the expected payout. Find out
        more <a href="" style="color:blue; text-decoration:underline;">here</a>.
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

    .inputNumber {
        width: 25%;
        border-color: black;
        border-width: 1px;
        padding: 5px;
    }
</style>
