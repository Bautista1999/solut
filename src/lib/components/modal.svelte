<script>
    import CircledButtonDarkSmall from "./CircledButtonDarkSmall.svelte";

    export let isOpen = false;
    export let isOpen2 = false;
    export let isOpen3 = false;
    export let isOpen4 = false;
    export let isOpen5 = false;
    export let isOpen6 = false;
    export let isOpen7 = false;
    export let isOpen8 = false;
    export let isOpen9 = false;
    export let isOpen10 = false;

    export let close = () => {};
    export let close2 = () => {
        isOpen2 = false;
    };
    export let close3 = () => {
        isOpen3 = false;
    };
    export let close4 = () => {
        isOpen4 = false;
    };
    export let close5 = () => {
        isOpen5 = false;
    };
    export let close6 = () => {
        isOpen6 = false;
    };
    export let close7 = () => {
        isOpen7 = false;
    };
    export let close8 = () => {
        isOpen8 = false;
    };
    export let close9 = () => {
        isOpen9 = false;
    };
    export let close10 = () => {
        isOpen10 = false;
    };
</script>

{#if isOpen}
    <div class="modal-background" on:click={close}>
        <div class="modal-content" on:click|stopPropagation>
            <div class="delete-button-container">
                <button
                    class="delete-button"
                    on:click={() => {
                        isOpen = false;
                    }}
                    style="position:fixed;"
                >
                    <span class="material-symbols-outlined deleteIconHover">
                        close
                    </span>
                </button>
            </div>
            <slot />
        </div>
    </div>
{:else if isOpen2}
    <div class="modal-background" on:click={close}>
        <div class="modal-content" on:click|stopPropagation>
            <div class="ButtonClose" on:click={() => close2()}>
                <button>X</button>
            </div>
            <slot />
        </div>
    </div>
{:else if isOpen3}
    <div class="modal-background" on:click={close}>
        <div class="modal-content" on:click|stopPropagation>
            <div class="ButtonClose" on:click={() => close3()}>
                <button>X</button>
            </div>
            <slot />
        </div>
    </div>
{:else if isOpen4}
    <div class="modal-background" on:click={close}>
        <div class="modal-content" on:click|stopPropagation>
            <div class="ButtonClose" on:click={() => close4()}>
                <button>X</button>
            </div>
            <slot />
        </div>
    </div>
{:else if isOpen5}
    <div class="modal-background" on:click={close} style="z-index: 2000;">
        <div class="modal-content" on:click|stopPropagation>
            <div class="ButtonClose" on:click={() => close5()}>
                <button>X</button>
            </div>
            <slot />
        </div>
    </div>
{:else if isOpen6}
    <div class="modal-background" on:click={close}>
        <div
            class="modal-content"
            style="width: 600px;"
            on:click|stopPropagation
        >
            <div class="ButtonClose" on:click={() => close6()}>
                <button>X</button>
            </div>
            <slot />
        </div>
    </div>
{:else if isOpen7}
    <div class="modal-background" on:click={close}>
        <div
            class="modal-content"
            style="width: 600px;"
            on:click|stopPropagation
        >
            <div class="ButtonClose" on:click={() => close7()}>
                <CircledButtonDarkSmall
                    icon="close"
                    someFunction={() => {
                        close7;
                    }}
                />
            </div>
            <slot />
        </div>
    </div>
{:else if isOpen8}
    <div class="modal-background" on:click={close}>
        <div class="modal-content" style="width: 80%;" on:click|stopPropagation>
            <div class="ButtonClose" on:click={() => close8()}>
                <button>X</button>
            </div>
            <slot />
        </div>
    </div>
{:else if isOpen9}
    <div class="modal-background" on:click={close}>
        <div
            class="modal-content"
            style="width:95% ; height: fit-content; max-height: 90vh;"
            on:click|stopPropagation
        >
            <div class="ButtonClose" on:click={() => close9()}>
                <button>X</button>
            </div>
            <slot />
        </div>
    </div>
{:else if isOpen10}
    <div class="modal-background" on:click={close}>
        <div
            class="modal-content"
            style="width: 600px; height: fit-content; max-height: 95vh;"
            on:click|stopPropagation
        >
            <div class="ButtonClose" on:click={() => close10()}>
                <button>X</button>
            </div>
            <slot />
        </div>
    </div>
{/if}

<style>
    .modal-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000; /* ensures it stays on top */
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal-content {
        position: relative; /* Added this */
        background: var(--tertiary-color);
        padding-inline: 20px;
        padding-bottom: 20px;
        width: 400px;
        border-radius: 0px;
        border-width: 2px;
        border-color: black;
        color: var(--secondary-color);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        max-height: 80vh; /* Set the maximum height to 80% of the viewport height */
        overflow-y: auto; /* Set vertical scrolling */
    }
    .ButtonClose {
        position: absolute;
        top: 10px; /* Adjust as needed */
        right: 10px; /* Adjust as needed */
        z-index: 1000;
        padding: 5px 10px;
    }

    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 48;
        color: var(--tertiary-color);
    }
    .material-symbols-outlined:hover {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 48;
        color: var(--primary-color);
    }
    .deleteIconHover {
        color: var(--tertiary-color);
    }
    .deleteIconHover:hover {
        color: var(--red-wine);
    }
    .delete-button-container {
        position: absolute; /* Position relative to image-scroller */
        top: 10px; /* Adjust as needed */
        right: 40px; /* Adjust as needed */
        z-index: 2; /* Ensure it's above the image */
    }

    .delete-button {
        background-color: var(
            --red-wine
        ); /* Use a color that indicates a delete action */
        color: var(--tertiary-color);
        box-shadow: 4px 4px 0px 0px var(--tertiary-color);
        border: 1px solid var(--tertiary-color);
        padding: 2px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        /* Additional styles as needed */
    }

    .delete-button:hover {
        background-color: var(
            --tertiary-color
        ); /* Use a color that indicates a delete action */
        color: var(--red-wine);
        box-shadow: 4px 4px 0px 0px var(--red-wine);
        border: 1px solid var(--red-wine);
    }
</style>
