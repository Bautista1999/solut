<script>
    import { confirmationModal } from "$lib/stores/other_stores";
    import BasicButtonDarkSmall from "./BasicButton_Dark_Small.svelte";
    import ErrorModalNew from "./ErrorModalNew.svelte";
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
        confirmationModal.set(false);
    }}
    style={"width:350px;"}
>
    <div class="deleteModal">
        {#if loading}
            <LoadingModalNew message={loadingMsg} />
        {:else if success}
            <SuccessModalNew message={successMsg} />
        {:else if error}
            <!-- <ErrorModalNew
                error={errorMsg}
                someFunction={() => {
                    error = false;
                    confirmationModal.set(false);
                }}
            /> -->
            <h3>Error!</h3>
        {:else}
            <div class="elements">
                <p style="font-size: larger; ">{message}</p>
                <div class="VerticallyAligned">
                    <BasicButtonDarkSmall
                        msg="Yes"
                        someFunction={async () => {
                            await someFunction();
                        }}
                    />
                    <BasicButtonDarkSmall
                        msg="No"
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
    .deleteModal {
        margin: 5px;
        margin-top: 50px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: large;
        gap: 30px;
        height: 100%;
    }
    .elements {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: large;
        gap: 30px;
        height: 100%;
    }
</style>
