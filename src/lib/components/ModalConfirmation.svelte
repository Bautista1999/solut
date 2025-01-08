<script>
    import { confirmationModal } from "$lib/stores/other_stores";
    import BasicButtonDarkSmall from "./BasicButton_Dark_Small.svelte";
    import LoadingModalNew from "./LoadingModalNew.svelte";
    import Modal from "./modal.svelte";
    import SuccessModalNew from "./SuccessModalNew.svelte";

    export let message = "";
    export let someFunction = async () => {};
    export let loading = false;
    export let success = false;
    export let error = false;
    export let errorMsg = "";
    export let successMsg = "";
    export let loadingMsg = "";
</script>

<Modal
    bind:isOpen={$confirmationModal}
    close={() => {
        error = false;
        loading = false;
        success = false;
        confirmationModal.set(false);
    }}
>
    <div class="confirmation-content">
        {#if loading}
            <LoadingModalNew message={loadingMsg} />
        {:else if success}
            <SuccessModalNew message={successMsg} />
        {:else if error}
            <div class="error-container">
                <span class="material-symbols-outlined error-icon">error</span>
                <h3>Error</h3>
                <p>{errorMsg}</p>
            </div>
        {:else}
            <div class="content">
                <p>{message}</p>
                <div class="button-container">
                    <BasicButtonDarkSmall
                        msg="Confirm"
                        someFunction={async () => {
                            await someFunction();
                        }}
                    />
                    <BasicButtonDarkSmall
                        msg="Cancel"
                        someFunction={() => {
                            confirmationModal.set(false);
                        }}
                    />
                </div>
            </div>
        {/if}
    </div>
</Modal>

<style>
    .confirmation-content {
        padding: 20px;
        text-align: center;
    }

    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }

    .button-container {
        display: flex;
        gap: 10px;
        justify-content: center;
    }

    .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        color: var(--red-wine);
    }

    p {
        margin: 0;
        font-size: 1.1em;
    }

    h3 {
        margin: 0;
    }
</style>
