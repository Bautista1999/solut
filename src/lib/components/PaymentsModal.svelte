<script>
    import Modal from "./modal.svelte";
    import {
        NotSignedInModal,
        PaymentModal,
        TransactionsInProgress,
        TransactionsSuccess,
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
    import TransactionsProgress from "./TransactionsProgress.svelte";
    import { goto } from "$app/navigation";
    import { onDestroy } from "svelte";
    let amountUSD = 10;
    export let documentID = "";
    export let collectionName = "";
    let showModal6 = false;
    onDestroy(() => {
        TransactionsSuccess.set(false);
        TransactionsInProgress.set(false);
        PaymentModal.set(false);
    });
</script>

<Modal
    bind:isOpen={$PaymentModal}
    close={() => {
        PaymentModal.set(false);
        TransactionsInProgress.set(false);
        TransactionsSuccess.set(false);
        PaymentModal.set(false);
    }}
>
    <h2>Complete solution</h2>
    <p>
        As soon as you hit the button, all approvals will begin to transfer to
        your Solutio wallter. You can see your balance in your <a
            href="/profile"
            style="color:blue; text-decoration:underline;">profile</a
        >.
    </p>
    <br />
    <p>You have 1851.3 ICP tokens approved to transfer to your wallet.</p>
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
    <div
        style="display: flex; justify-content:center; align-items:center; width:100%;align-self:center; flex-direction:column; gap:20px;"
    >
        <TransactionsProgress />
        {#if $TransactionsInProgress == false && $TransactionsSuccess == false}
            <BasicButtonDarkSmall
                msg={"Start transfers"}
                someFunction={() => {
                    TransactionsInProgress.set(true);
                }}
            />
        {:else if $TransactionsSuccess}
            <BasicButtonDarkSmall
                msg={"Audit transactions"}
                someFunction={() => {
                    goto("/profile");
                }}
            />
        {:else}
            <p style="font-style: italic;">Executing transactions...</p>
        {/if}
    </div>

    <br />
    <p>
        Each transaction made is available for audit. You can see them <a
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
