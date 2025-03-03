<script>
    import FlatButtonDarkSmall from "../FlatButtonDarkSmall.svelte";
    /**
     * Main configurable Table component
     * Accepts rows of data, column definitions, and options for filtering, sorting, and selection
     */

    /**
     * @typedef {Object} Column
     * @property {string} id - Unique identifier for the column
     * @property {string} header - Display name for the column header
     * @property {string} accessor - Property name to access in row data
     * @property {boolean} [sortable=false] - Whether the column is sortable
     * @property {Object} [cellComponent] - Optional component to render for this column's cells
     * @property {string} [width] - Optional width for the column
     */

    /**
     * @typedef {Object.<string, any>} Row // Correct index signature syntax
     * @property {string|number} id - Unique identifier for the row
     * @property {string} key - Any other properties needed for row data
     */

    /**
     * @type {Row[]} - Array of row data objects
     */
    export let rows = [];

    /**
     * @type {Column[]} - Array of column configuration objects
     */
    export let columns = [];

    // Feature toggles
    export let showFilters = true;
    export let showCheckboxes = true;
    export let showColumnToggle = true;
    export let showRowActions = false;

    export let maxWidth = "";

    /**
     * @type {string[] | null} - Initial list of visible column IDs. If null, all columns are visible by default.
     */
    export let initialVisibleColumns = null;

    // State
    let selectedRows = new Set();
    let filterText = "";

    /**
     * @type {string[]} - Array of visible column IDs
     */
    let visibleColumns =
        initialVisibleColumns || columns.map((col) => col.id || "");

    /**
     * @type {string|null} - Currently sorted column ID
     */
    let sortColumn = null;

    /**
     * @type {'asc'|'desc'} - Current sort direction
     */
    let sortDirection = "asc";

    /**
     * Toggle selection state for a row
     * @param {string|number} rowId - ID of the row to toggle
     */
    function toggleSelectRow(rowId) {
        if (selectedRows.has(rowId)) {
            selectedRows.delete(rowId);
        } else {
            selectedRows.add(rowId);
        }
        selectedRows = selectedRows; // Trigger reactivity
    }

    /**
     * Set sorting for a column
     * @param {string} columnId - ID of the column to sort by
     */
    function sortBy(columnId) {
        const column = columns.find((col) => col.id === columnId);
        if (!column || !column.sortable) return; // Ensure column is sortable

        if (sortColumn === columnId) {
            sortDirection = sortDirection === "asc" ? "desc" : "asc";
        } else {
            sortColumn = columnId;
            sortDirection = "asc";
        }

        // Sort the rows based on the selected column
        rows = [...rows].sort((a, b) => {
            const aValue = a[column.accessor];
            const bValue = b[column.accessor];

            if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
            if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }

    // Filter rows based on input text
    $: filteredRows = filterText
        ? rows.filter((row) => {
              const searchText = filterText.toLowerCase();
              return columns.some((col) => {
                  const accessor = col.accessor || "";
                  const value = row[accessor];
                  return (
                      value && String(value).toLowerCase().includes(searchText)
                  );
              });
          })
        : rows;

    /**
     * Toggle visibility of a column
     * @param {string} columnId - ID of the column to toggle
     */
    function toggleColumn(columnId) {
        if (visibleColumns.includes(columnId)) {
            visibleColumns = visibleColumns.filter((id) => id !== columnId);
        } else {
            visibleColumns = [...visibleColumns, columnId];
        }
    }
    let view = false;
    function toggleView() {
        view = !view;
    }

    // @ts-ignore
    function handleClickOutside(event) {
        const dropdown = document.querySelector(".view-dropdown");
        if (dropdown && !dropdown.contains(event.target)) {
            view = false;
        }
    }

    document.addEventListener("click", handleClickOutside);
</script>

{#if showFilters}
    <div class="table-filters">
        <input
            type="text"
            placeholder="Search..."
            bind:value={filterText}
            class="filter-input"
            style="font-family: 'Barlow', sans-serif; "
        />

        {#if showColumnToggle}
            <div class="view-dropdown">
                <FlatButtonDarkSmall
                    msg="View"
                    someFunction={() => {
                        toggleView();
                    }}
                    icon="filter_list"
                />
                {#if view}
                    <div class="dropdown-content">
                        <div class="dropdown-header">Toggle columns</div>
                        {#each columns as column}
                            <label class="dropdown-item">
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.includes(column.id)}
                                    on:change={() => toggleColumn(column.id)}
                                />
                                {column.header}
                            </label>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
    </div>
{/if}

<div class="table-container" style="max-width: {maxWidth};">
    <table class="data-table">
        <thead>
            <tr class="table-header" style="border-bottom: none;">
                {#if showCheckboxes}
                    <th class="checkbox-column">
                        <input type="checkbox" />
                    </th>
                {/if}

                {#each columns as column}
                    {#if visibleColumns.includes(column.id)}
                        <th
                            class="column-header"
                            class:sortable={column.sortable}
                            on:click={() =>
                                column.sortable && sortBy(column.id)}
                        >
                            <div
                                class="header-content"
                                style="display: flex; align-items: center; "
                            >
                                {column.header}
                                {#if column.sortable}
                                    <span
                                        class="sort-indicator"
                                        style="display: flex; align-items: center; color: var(--primary-color);"
                                    >
                                        {#if sortColumn === column.id}
                                            {sortDirection === "asc"
                                                ? "↑"
                                                : "↓"}
                                        {:else}
                                            <span
                                                class="material-symbols-outlined"
                                            >
                                                unfold_more
                                            </span>
                                        {/if}
                                    </span>
                                {/if}
                            </div>
                        </th>
                    {/if}
                {/each}

                {#if showRowActions}
                    <th class="actions-column"></th>
                {/if}
            </tr>
        </thead>

        <tbody>
            {#each filteredRows as row (row.uniqueKey)}
                <tr class="data-row">
                    {#if showCheckboxes}
                        <td class="checkbox-column">
                            <input
                                type="checkbox"
                                checked={selectedRows.has(row.id)}
                                on:change={() => toggleSelectRow(row.id)}
                            />
                        </td>
                    {/if}

                    {#each columns as column}
                        {#if visibleColumns.includes(column.id)}
                            <td
                                class="data-cell"
                                style="min-width:{column.width
                                    ? column.width
                                    : ''}"
                            >
                                {#if column.cellComponent}
                                    <svelte:component
                                        this={column.cellComponent}
                                        value={row[column.accessor]}
                                        {row}
                                    />
                                {:else}
                                    {row[column.accessor]}
                                {/if}
                            </td>
                        {/if}
                    {/each}

                    {#if showRowActions}
                        <td class="actions-column">
                            <button class="actions-button">•••</button>
                            <div class="actions-dropdown">
                                <button class="action-item">Edit</button>
                                <button class="action-item">Make a copy</button>
                                <button class="action-item">Favorite</button>
                                <button class="action-item">Labels</button>
                                <button class="action-item">Delete</button>
                            </div>
                        </td>
                    {/if}
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .material-symbols-outlined {
        font-size: 1rem;
        color: var(--primary-color);
    }
    .table-container {
        box-sizing: border-box;

        overflow-x: auto;
        border-radius: 8px;
        background-color: var(--tertiary-color);

        font-family: "Barlow", sans-serif;
        z-index: 1;
    }
    .table-header {
        background-color: var(--tertiary-color);
        color: var(--secondary-color);
        padding-left: 10px;
    }
    .sortable {
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .sortable:hover {
        background-color: var(--forth-color-v2);
        cursor: pointer;
    }

    .table-filters {
        display: flex;
        align-items: center;
        padding-bottom: 10px;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;

        gap: 0.75rem;
    }

    .filter-input {
        flex: 1;
        padding-inline: 15px;
        padding-block: 5px;
        border-radius: 8px;
        border: 1px solid var(--seventh-color);
        font-size: medium;

        max-width: 20%;
        outline: none;
    }

    .filter-input:focus {
        border-color: var(--primary-color);
        border-width: 1px;
        box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.5);
    }

    .view-dropdown {
        position: relative;
    }

    .dropdown-content {
        display: block;
        position: absolute;
        right: 0;
        background-color: white;
        min-width: 12rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        border-radius: 0.25rem;
        border: 1px solid #e2e8f0;
        z-index: 10;
    }

    .view-dropdown:hover .dropdown-content {
        display: block;
        position: absolute;
        z-index: 1000;
    }

    .dropdown-header {
        padding: 0.5rem 0.75rem;
        font-size: medium;
        color: var(--secondary-color);
        border-bottom: 1px solid #e2e8f0;
    }

    .dropdown-item {
        display: flex;
        align-items: center;
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        gap: 0.5rem;
        cursor: pointer;
    }

    .dropdown-item input[type="checkbox"] {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        width: 1rem;
        height: 1rem;
        border: 1px solid transparent;
        border-radius: 0.25rem;
        background-color: transparent;
        cursor: pointer;
        position: relative;
    }

    .dropdown-item input[type="checkbox"]:checked::before {
        content: "✔";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--eigth-color); /* Adjust tick color as needed */
    }

    .dropdown-item input[type="checkbox"]:not(:checked) {
        border-color: transparent;
    }

    .dropdown-item:hover {
        background-color: #f7fafc;
    }

    .column-header {
        text-align: left;
        font-weight: 500;
        font-size: medium;
        white-space: nowrap;
        border-bottom: 0.25px solid var(--forth-color-v2);
        padding: 15px;
    }

    .header-content {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .checkbox-column {
        width: 40px;
        text-align: center;
        padding: 0.5rem;
    }

    .actions-column {
        width: 40px;
        text-align: center;
        position: relative;
    }

    .data-cell {
        padding: 0.75rem 20px;
        /* min-width: 150px; */
        font-size: 0.875rem;
    }
    .data-row {
        border: none;
        border-bottom: 0.25px solid var(--forth-color-v2);
    }

    .data-row:hover {
        background-color: #f7fafc;
    }

    .actions-button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        color: #4a5568;
        padding: 0.25rem;
    }

    .actions-dropdown {
        display: none;
        position: absolute;
        right: 0;
        background-color: white;
        min-width: 12rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        border-radius: 0.25rem;
        border: 1px solid #e2e8f0;
        z-index: 10;
        text-align: left;
    }

    .actions-column:hover .actions-dropdown {
        display: block;
    }

    .action-item {
        display: block;
        width: 100%;
        text-align: left;
        padding: 0.5rem 0.75rem;
        border: none;
        background: none;
        font-size: 0.875rem;
        cursor: pointer;
    }

    .action-item:hover {
        background-color: #f7fafc;
    }

    /* Responsive adjustments for mobile */
    @media (max-width: 768px) {
        .table-container {
            width: 100%; /* Set width to match the device's screen */
            max-width: 95vw;
            min-height: fit-content;
            overflow-x: scroll;
            /* Allow table to expand vertically as needed */
            position: relative;
            scrollbar-width: thin;
            scrollbar-color: var(--primary-color) var(--tertiary-color);
        }

        .filter-input {
            max-width: 45%;
            padding-inline: 10px;
            padding-block: 4px;
            font-size: medium;
        }

        .column-header,
        .data-cell {
            padding: 10px;
            /* min-width: 100px; */
            font-size: medium;
        }
    }

    .data-table {
        width: 100%;
        box-sizing: border-box;
        border-collapse: collapse;
    }
</style>
