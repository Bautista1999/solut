<script>
    import { DeleteModal } from "$lib/stores/other_stores";
    import { fade, fly } from "svelte/transition";
    import { onMount, onDestroy } from "svelte";
    import MagicalDotsSmall from "./MagicalDotsSmall.svelte";

    export let message = "";
    export let someFunction = async () => {};
    export let loading = false;
    export let success = false;
    export let error = false;
    export let errorMsg = "";
    export let successMsg = "";
    export let loadingMsg = "";

    // Monitor modal state changes
    const unsubscribe = DeleteModal.subscribe((value) => {});

    const handleClose = () => {
        console.log("Close button clicked"); // Debug log
        DeleteModal.set(false);
        // Only reset error and success states, preserve loading
        if (!loading) {
            error = false;
            success = false;
        }
    };

    onDestroy(() => {
        unsubscribe();
        if ($DeleteModal) {
            DeleteModal.set(false);
        }
    });
</script>

{#if $DeleteModal}
    <div class="modal-overlay" transition:fade>
        <div class="modal-container" transition:fly={{ y: 20, duration: 300 }}>
            <div class="modal-content">
                <button
                    class="close-button"
                    on:click|stopPropagation={handleClose}
                    on:mousedown|preventDefault
                >
                    <span
                        class="material-symbols-outlined"
                        style="pointer-events: none; user-select: none;"
                        >close</span
                    >
                </button>

                {#if loading}
                    <div class="modal-state loading">
                        <div class="loading-container">
                            <MagicalDotsSmall msg={loadingMsg} modal={true} />
                            <p class="loading-message">{loadingMsg}</p>
                        </div>
                    </div>
                {:else if success}
                    <div class="modal-header">
                        <span class="material-symbols-outlined success-icon"
                            >check_circle</span
                        >
                        <h2>Success</h2>
                    </div>
                    <div class="modal-body">
                        <p>{successMsg}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="confirm-button" on:click={handleClose}
                            >Close</button
                        >
                    </div>
                {:else if error}
                    <div class="modal-header">
                        <span class="material-symbols-outlined warning-icon"
                            >error</span
                        >
                        <h2>Error</h2>
                    </div>
                    <div class="modal-body">
                        <p>{errorMsg}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="confirm-button" on:click={handleClose}
                            >Close</button
                        >
                    </div>
                {:else}
                    <div class="modal-header">
                        <span class="material-symbols-outlined warning-icon"
                            >warning</span
                        >
                        <h2>Confirm Action</h2>
                    </div>
                    <div class="modal-body">
                        <p>{message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="cancel-button" on:click={handleClose}
                            >Cancel</button
                        >
                        <button class="confirm-button" on:click={someFunction}
                            >Confirm</button
                        >
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        /* backdrop-filter: blur(4px); */
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.5);
    }

    .modal-container {
        background: var(--tertiary-color);
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .modal-content {
        padding: 24px;
        position: relative;
    }

    .modal-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        position: relative;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--text-color);
    }

    .warning-icon {
        font-size: 28px;
        color: var(--primary-color);
    }

    .close-button {
        position: absolute;
        right: 24px;
        top: 24px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        color: var(--text-secondary);
        transition: color 0.2s;
        z-index: 1001;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .close-button:hover {
        color: var(--text-color);
    }

    .modal-body {
        margin-bottom: 24px;
    }

    .modal-body p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 1.1rem;
        line-height: 1.5;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
    }

    .cancel-button,
    .confirm-button {
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        font-family: "Barlow", sans-serif;
    }

    .cancel-button {
        background: transparent;
        border: none;
        color: var(--seventh-color);
    }

    .cancel-button:hover {
        color: var(--tertiary-color);
        background: var(--primary-color);
    }

    .confirm-button {
        background: var(--primary-color);
        border: none;
        color: var(--tertiary-color);
    }

    .confirm-button:hover {
        background: var(--tertiary-color);
        color: var(--primary-color);
        transform: translateY(-1px);
    }

    /* State styles */
    .modal-state {
        padding: 32px;
        text-align: center;
    }

    .success-icon,
    .error-icon {
        font-size: 48px;
        margin-bottom: 16px;
    }

    .success-icon {
        color: var(--green);
    }

    .error-icon {
        color: var(--red-wine);
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    /* Responsive adjustments */
    @media (max-width: 480px) {
        .modal-container {
            width: 95%;
        }

        .modal-content {
            padding: 16px;
        }

        .modal-header h2 {
            font-size: 1.25rem;
        }

        .modal-body p {
            font-size: 1rem;
        }

        .cancel-button,
        .confirm-button {
            padding: 8px 16px;
        }
    }

    .modal-state.error {
        position: relative;
    }

    .error-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        color: var(--text-secondary);
        transition: color 0.2s;
    }

    .error-close:hover {
        color: var(--text-color);
    }

    .modal-state.loading {
        padding: 32px;
        text-align: center;
    }

    .loading-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: center;
    }

    .loading-message {
        margin: 0;
        color: var(--text-secondary);
    }
</style>
