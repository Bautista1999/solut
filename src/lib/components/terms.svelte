<script>
    import { termsModal } from "$lib/stores/other_storestores";
    import Modal from "./modal.svelte";
</script>

<Modal
    bind:isOpen6={$termsModal}
    close={() => {
        termsModal.set(false);
    }}
>
    <h4>Terms and conditions</h4>
    <div class="delete">
        <p>
            Here are the terms and conditions the user needs to accept to
            pledge.
        </p>
    </div>
    <br />
    <div class="delete">
        <button
            class="fundButton"
            style="width: 1.3cm; height:0.8cm; color:white; background-color:grey"
            on:click={() => {
                termsModal.set(false);
            }}>Ok</button
        >
        <div class="spacer" />
    </div>
</Modal>

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
    .delete {
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        gap: 20px;
    }
    .spacer {
        height: 0.3cm;
    }
</style>
