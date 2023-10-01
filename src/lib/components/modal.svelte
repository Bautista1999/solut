<script>
    export let isOpen = false;
    export let isOpen2 = false;
    export let isOpen3 = false;
    export let isOpen4 = false;
    export let isOpen5 = false;
    export let isOpen6 = false;
    export let isOpen7 = false;
    export let isOpen8 = false;
    export let isOpen9 = false;
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
</script>

{#if isOpen}
    <div class="modal-background" on:click={close}>
        <div class="modal-content" on:click|stopPropagation>
            <div
                class="ButtonClose"
                on:click={() => {
                    isOpen = false;
                }}
            >
                <button>X</button>
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
    <div class="modal-background" on:click={close}>
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
                <button>X</button>
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
        background: #fff;
        padding: 20px;
        width: 400px;
        border-radius: 0px;
        border-width: 2px;
        border-color: black;
        color: rgb(37, 88, 101);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        max-height: 80vh; /* Set the maximum height to 80% of the viewport height */
        overflow-y: auto; /* Set vertical scrolling */
    }
    .ButtonClose {
        position: absolute;
        top: 10px; /* Adjust as needed */
        right: 10px; /* Adjust as needed */
        z-index: 1000;
        color: white;
        background-color: red; /* Just to ensure visibility */
        border: 1px solid black; /* Just to ensure visibility */
        padding: 5px 10px;
        box-shadow: 5px 5px 2px rgba(0, 0, 0, 0.2);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .ButtonClose:hover {
        transform: scale(
            1.08
        ); /* scales the button to 105% of its original size on hover */
    }
    .ButtonClose:active {
        transform: scale(
            0.95
        ); /* scales the button to 95% of its original size on click */
        box-shadow: none; /* removes the shadow */
    }
</style>
