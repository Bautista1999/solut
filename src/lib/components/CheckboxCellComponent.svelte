<script>
    import { SvelteComponentTyped } from "svelte";

    // Define the expected row type
    /** @type {boolean} */
    export let value = false;

    /** @type {Record<string, any>} */
    export let row;

    $: isLoading = row.status === "loading";

    function toggleCheckbox() {
        if (isLoading) return; // Prevent interaction when loading

        // Toggle the checked state locally
        const newCheckedState = !row.checked;

        // Use the row's own handler function if available
        if (row.handleCheckboxToggle) {
            row.handleCheckboxToggle(newCheckedState);
        } else {
            // Fallback if no handler is provided
            row.checked = newCheckedState;
        }

        console.log(
            "Checkbox toggled:",
            newCheckedState,
            "for row ID:",
            row.id,
        );
    }
</script>

<div class="checkbox-cell" class:loading={isLoading}>
    <input
        type="checkbox"
        checked={row.checked}
        on:change={toggleCheckbox}
        disabled={isLoading}
    />
</div>

<style>
    .checkbox-cell {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .loading {
        opacity: 0.5;
        pointer-events: none;
    }

    input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
    }

    input[type="checkbox"]:disabled {
        cursor: not-allowed;
    }
</style>
