<script>
    import { onMount } from "svelte";

    // Sample pledge data
    let pledges = [
        {
            id: 1,
            user: "John Doe",
            amount: 500,
            solution: "Eco Solution",
            date: "2023-06-15",
            status: "active",
        },
        {
            id: 2,
            user: "Jane Smith",
            amount: 1200,
            solution: "Smart City",
            date: "2023-06-10",
            status: "active",
        },
        {
            id: 3,
            user: "Robert Johnson",
            amount: 750,
            solution: "Clean Water Initiative",
            date: "2023-06-05",
            status: "pending",
        },
        {
            id: 4,
            user: "Emily Davis",
            amount: 300,
            solution: "Renewable Energy",
            date: "2023-06-01",
            status: "completed",
        },
        {
            id: 5,
            user: "Michael Wilson",
            amount: 850,
            solution: "Urban Farming",
            date: "2023-05-28",
            status: "active",
        },
    ];

    let searchTerm = "";
    let statusFilter = "all";
    let selectedPledge = null;

    // Filter pledges based on search term and status filter
    $: filteredPledges = pledges.filter((pledge) => {
        const matchesSearch =
            pledge.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pledge.solution.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || pledge.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    function selectPledge(pledge) {
        selectedPledge = pledge;
    }

    function deletePledge(id) {
        if (confirm("Are you sure you want to delete this pledge?")) {
            pledges = pledges.filter((pledge) => pledge.id !== id);
            if (selectedPledge && selectedPledge.id === id) {
                selectedPledge = null;
            }
        }
    }

    function updatePledgeStatus(id, newStatus) {
        pledges = pledges.map((pledge) => {
            if (pledge.id === id) {
                return { ...pledge, status: newStatus };
            }
            return pledge;
        });

        if (selectedPledge && selectedPledge.id === id) {
            selectedPledge = { ...selectedPledge, status: newStatus };
        }
    }
</script>

<div class="pledge-manager">
    <h1>Pledge Manager</h1>

    <div class="controls">
        <div class="search-box">
            <input
                type="text"
                placeholder="Search by user or solution..."
                bind:value={searchTerm}
            />
        </div>

        <div class="filter-controls">
            <label for="status-filter">Status:</label>
            <select id="status-filter" bind:value={statusFilter}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
            </select>
        </div>
    </div>

    <div class="pledge-container">
        <div class="pledge-list">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Amount</th>
                        <th>Solution</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each filteredPledges as pledge}
                        <tr
                            class={selectedPledge &&
                            selectedPledge.id === pledge.id
                                ? "selected"
                                : ""}
                            on:click={() => selectPledge(pledge)}
                        >
                            <td>{pledge.id}</td>
                            <td>{pledge.user}</td>
                            <td>${pledge.amount}</td>
                            <td>{pledge.solution}</td>
                            <td>{pledge.date}</td>
                            <td>
                                <span class="status-badge {pledge.status}">
                                    {pledge.status}
                                </span>
                            </td>
                            <td class="actions">
                                <button
                                    class="action-btn edit"
                                    on:click|stopPropagation={() =>
                                        selectPledge(pledge)}
                                >
                                    ✏️
                                </button>
                                <button
                                    class="action-btn delete"
                                    on:click|stopPropagation={() =>
                                        deletePledge(pledge.id)}
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        {#if selectedPledge}
            <div class="pledge-details">
                <h2>Pledge Details</h2>
                <div class="detail-card">
                    <div class="detail-header">
                        <h3>{selectedPledge.solution}</h3>
                        <span class="status-badge {selectedPledge.status}">
                            {selectedPledge.status}
                        </span>
                    </div>

                    <div class="detail-content">
                        <div class="detail-row">
                            <span class="detail-label">Pledge ID:</span>
                            <span class="detail-value">{selectedPledge.id}</span
                            >
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">User:</span>
                            <span class="detail-value"
                                >{selectedPledge.user}</span
                            >
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Amount:</span>
                            <span class="detail-value"
                                >${selectedPledge.amount}</span
                            >
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Date:</span>
                            <span class="detail-value"
                                >{selectedPledge.date}</span
                            >
                        </div>
                    </div>

                    <div class="detail-actions">
                        <h4>Update Status</h4>
                        <div class="status-buttons">
                            <button
                                class="status-btn active"
                                class:selected={selectedPledge.status ===
                                    "active"}
                                on:click={() =>
                                    updatePledgeStatus(
                                        selectedPledge.id,
                                        "active",
                                    )}
                            >
                                Active
                            </button>
                            <button
                                class="status-btn pending"
                                class:selected={selectedPledge.status ===
                                    "pending"}
                                on:click={() =>
                                    updatePledgeStatus(
                                        selectedPledge.id,
                                        "pending",
                                    )}
                            >
                                Pending
                            </button>
                            <button
                                class="status-btn completed"
                                class:selected={selectedPledge.status ===
                                    "completed"}
                                on:click={() =>
                                    updatePledgeStatus(
                                        selectedPledge.id,
                                        "completed",
                                    )}
                            >
                                Completed
                            </button>
                        </div>

                        <div class="action-buttons">
                            <button
                                class="btn delete-btn"
                                on:click={() => deletePledge(selectedPledge.id)}
                            >
                                Delete Pledge
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {:else}
            <div class="pledge-details empty">
                <p>Select a pledge to view details</p>
            </div>
        {/if}
    </div>
</div>

<style>
    .pledge-manager {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
    }

    h1 {
        margin-bottom: 20px;
        color: var(--primary-color, #333);
    }

    .controls {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
    }

    .search-box input {
        padding: 8px 12px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 4px;
        width: 300px;
    }

    .filter-controls {
        display: flex;
        align-items: center;
    }

    .filter-controls label {
        margin-right: 10px;
    }

    .filter-controls select {
        padding: 8px 12px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 4px;
    }

    .pledge-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    .pledge-list {
        background-color: var(--card-bg, white);
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th,
    td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid var(--border-color, #eee);
    }

    th {
        font-weight: bold;
        color: var(--text-muted, #666);
    }

    tr:hover {
        background-color: var(--hover-bg, #f9f9f9);
        cursor: pointer;
    }

    tr.selected {
        background-color: var(--selected-bg, #e6f7ff);
    }

    .status-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        text-transform: capitalize;
    }

    .status-badge.active {
        background-color: rgba(80, 200, 120, 0.1);
        color: var(--success-color, #50c878);
    }

    .status-badge.pending {
        background-color: rgba(255, 193, 7, 0.1);
        color: var(--warning-color, #ffc107);
    }

    .status-badge.completed {
        background-color: rgba(74, 144, 226, 0.1);
        color: var(--primary-color, #4a90e2);
    }

    .actions {
        white-space: nowrap;
    }

    .action-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        padding: 4px;
        margin: 0 2px;
        border-radius: 4px;
    }

    .action-btn:hover {
        background-color: var(--hover-bg, #f0f0f0);
    }

    .pledge-details {
        background-color: var(--card-bg, white);
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .pledge-details.empty {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted, #666);
        font-style: italic;
    }

    .detail-card {
        margin-top: 15px;
    }

    .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .detail-header h3 {
        margin: 0;
        font-size: 1.2rem;
    }

    .detail-content {
        margin-bottom: 20px;
    }

    .detail-row {
        display: flex;
        margin-bottom: 10px;
    }

    .detail-label {
        width: 100px;
        font-weight: bold;
        color: var(--text-muted, #666);
    }

    .detail-value {
        flex: 1;
    }

    .detail-actions {
        border-top: 1px solid var(--border-color, #eee);
        padding-top: 20px;
    }

    .detail-actions h4 {
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 1rem;
    }

    .status-buttons {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
    }

    .status-btn {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        opacity: 0.7;
    }

    .status-btn:hover {
        opacity: 0.9;
    }

    .status-btn.selected {
        opacity: 1;
    }

    .status-btn.active {
        background-color: rgba(80, 200, 120, 0.2);
        color: var(--success-color, #50c878);
    }

    .status-btn.pending {
        background-color: rgba(255, 193, 7, 0.2);
        color: var(--warning-color, #ffc107);
    }

    .status-btn.completed {
        background-color: rgba(74, 144, 226, 0.2);
        color: var(--primary-color, #4a90e2);
    }

    .action-buttons {
        margin-top: 20px;
    }

    .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .delete-btn {
        background-color: rgba(220, 53, 69, 0.1);
        color: var(--danger-color, #dc3545);
    }

    .delete-btn:hover {
        background-color: rgba(220, 53, 69, 0.2);
    }

    @media (max-width: 768px) {
        .pledge-container {
            grid-template-columns: 1fr;
        }

        .controls {
            flex-direction: column;
            gap: 10px;
        }

        .search-box input {
            width: 100%;
        }
    }
</style>
