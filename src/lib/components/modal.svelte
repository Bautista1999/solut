<script>
    // @ts-ignore
    /**
     * @type {() => void}
     */
    export let editInfo;

    // @ts-ignore
    export let showModal; // boolean

    // @ts-ignore
    /**
     * @type {HTMLDialogElement}
     */
    let dialog; // HTMLDialogElement

    // @ts-ignore
    // @ts-ignore
    $: if (dialog && showModal) dialog.showModal();

    // @ts-ignore
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
    bind:this={dialog}
    on:close={() => (showModal = false)}
    on:click|self={() => dialog.close()}
>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click|stopPropagation>
        <slot name="header" />
        <hr style="margin-top: 3%; margin-bottom: 2%;" />
        <slot />

        <hr style="margin-top: 3%; margin-bottom: 3%;" />
        <!-- svelte-ignore a11y-autofocus -->
        <button
            autofocus
            on:click={() => {
                editInfo();
                dialog.close();
            }}>Edit info</button
        >
    </div>
</dialog>

<style>
    dialog {
        max-width: 32em;
        border-radius: 20px;
        border: none;
        padding: 0;
    }
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.3);
    }
    dialog > div {
        padding: 1em;
    }
    dialog[open] {
        animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes zoom {
        from {
            transform: scale(0.95);
        }
        to {
            transform: scale(1);
        }
    }
    dialog[open]::backdrop {
        animation: fade 0.2s ease-out;
    }
    @keyframes fade {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    button {
        display: block;
        background-color: orangered;
        width: 2cm;
        height: 1cm;
        border-radius: 10px;
        color: white;
    }
</style>
