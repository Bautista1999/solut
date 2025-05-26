<script>
    import { onMount } from "svelte";
    import { fade, fly, slide, scale } from "svelte/transition";
    import { flip } from "svelte/animate";

    // Sample user data
    let users = [
        {
            id: 1,
            name: "John Doe",
            email: "john.doe@example.com",
            role: "admin",
            status: "active",
            joinDate: "2023-01-15",
            lastActive: "2023-06-20",
            lastLogin: "2023-05-15T10:30:00",
            accountCreated: "2022-09-10T08:45:00",
        },
        {
            id: 2,
            name: "Jane Smith",
            email: "jane.smith@example.com",
            role: "user",
            status: "active",
            joinDate: "2023-02-10",
            lastActive: "2023-06-18",
            lastLogin: "2023-05-16T14:22:00",
            accountCreated: "2022-10-05T11:30:00",
        },
        {
            id: 3,
            name: "Robert Johnson",
            email: "robert.johnson@example.com",
            role: "moderator",
            status: "active",
            joinDate: "2023-03-05",
            lastActive: "2023-06-15",
            lastLogin: "2023-04-28T09:15:00",
            accountCreated: "2022-11-12T10:15:00",
        },
        {
            id: 4,
            name: "Emily Davis",
            email: "emily.davis@example.com",
            role: "user",
            status: "inactive",
            joinDate: "2023-04-20",
            lastActive: "2023-05-30",
            lastLogin: "2023-05-17T16:40:00",
            accountCreated: "2023-01-20T13:45:00",
        },
        {
            id: 5,
            name: "Michael Wilson",
            email: "michael.wilson@example.com",
            role: "user",
            status: "pending",
            joinDate: "2023-06-01",
            lastActive: "2023-06-01",
            lastLogin: "2023-03-10T11:05:00",
            accountCreated: "2022-08-30T09:20:00",
        },
    ];

    let searchTerm = "";
    let roleFilter = "all";
    let statusFilter = "all";
    let selectedUser = null;
    let showSuccessMessage = false;
    let successMessage = "";
    let validationErrors = {};

    // Filter users based on search term, role and status filters
    $: filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus =
            statusFilter === "all" || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    function selectUser(user) {
        selectedUser = { ...user };
        validationErrors = {};
    }

    function updateUserRole(id, newRole) {
        const index = users.findIndex((user) => user.id === id);
        if (index !== -1) {
            users[index].role = newRole;
            users = [...users]; // Trigger reactivity

            // Update selected user if it's the one being modified
            if (selectedUser && selectedUser.id === id) {
                selectedUser.role = newRole;
            }

            showSuccessMessage = true;
            successMessage = `User role updated to ${newRole}`;
            setTimeout(() => (showSuccessMessage = false), 3000);
        }
    }

    function updateUserStatus(id, newStatus) {
        const index = users.findIndex((user) => user.id === id);
        if (index !== -1) {
            users[index].status = newStatus;
            users = [...users]; // Trigger reactivity

            // Update selected user if it's the one being modified
            if (selectedUser && selectedUser.id === id) {
                selectedUser.status = newStatus;
            }

            showSuccessMessage = true;
            successMessage = `User status updated to ${newStatus}`;
            setTimeout(() => (showSuccessMessage = false), 3000);
        }
    }

    function deleteUser(id) {
        if (confirm("Are you sure you want to delete this user?")) {
            users = users.filter((user) => user.id !== id);
            if (selectedUser && selectedUser.id === id) {
                selectedUser = null;
            }

            showSuccessMessage = true;
            successMessage = "User deleted successfully";
            setTimeout(() => (showSuccessMessage = false), 3000);
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    }

    function saveUser() {
        // Validate form
        validationErrors = {};

        if (!selectedUser.name.trim()) {
            validationErrors.name = "Name is required";
        }

        if (!selectedUser.email.trim()) {
            validationErrors.email = "Email is required";
        } else if (!isValidEmail(selectedUser.email)) {
            validationErrors.email = "Please enter a valid email";
        }

        // If there are validation errors, don't proceed
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        const index = users.findIndex((user) => user.id === selectedUser.id);
        if (index !== -1) {
            users[index] = { ...selectedUser };
            users = [...users]; // Trigger reactivity

            showSuccessMessage = true;
            successMessage = "User updated successfully";
            setTimeout(() => (showSuccessMessage = false), 3000);

            // Close the detail view
            selectedUser = null;
        }
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function cancelEdit() {
        selectedUser = null;
        validationErrors = {};
    }
</script>

<div class="user-manager">
    <div class="header" in:fade={{ duration: 300 }}>
        <h1>User Management</h1>
        <p>Manage user accounts and permissions</p>
    </div>

    <div class="filters" in:fly={{ y: 20, duration: 300, delay: 150 }}>
        <div class="search-box">
            <span class="material-symbols-outlined">search</span>
            <input
                type="text"
                placeholder="Search users..."
                bind:value={searchTerm}
            />
        </div>

        <div class="filter-options">
            <div class="filter">
                <label>Role:</label>
                <select bind:value={roleFilter}>
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="user">User</option>
                </select>
            </div>

            <div class="filter">
                <label>Status:</label>
                <select bind:value={statusFilter}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                </select>
            </div>
        </div>
    </div>

    {#if showSuccessMessage}
        <div
            class="success-message"
            in:fly={{ y: -20, duration: 300 }}
            out:fade
        >
            <span class="material-symbols-outlined">check_circle</span>
            {successMessage}
        </div>
    {/if}

    <div class="content">
        <div
            class="users-table"
            class:collapsed={selectedUser}
            in:fade={{ duration: 300, delay: 200 }}
        >
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each filteredUsers as user, i (user.id)}
                        <tr
                            animate:flip={{ duration: 300 }}
                            in:fade={{ duration: 300, delay: i * 50 }}
                            class:active={selectedUser &&
                                selectedUser.id === user.id}
                        >
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                <span class="badge role-{user.role}"
                                    >{user.role}</span
                                >
                            </td>
                            <td>
                                <span class="badge status-{user.status}"
                                    >{user.status}</span
                                >
                            </td>
                            <td>{formatDate(user.lastLogin)}</td>
                            <td class="actions">
                                <button
                                    on:click={() => selectUser(user)}
                                    class="action-button"
                                >
                                    <span class="material-symbols-outlined"
                                        >edit</span
                                    >
                                </button>
                                <button
                                    on:click={() => deleteUser(user.id)}
                                    class="action-button delete"
                                >
                                    <span class="material-symbols-outlined"
                                        >delete</span
                                    >
                                </button>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="6" class="no-results"
                                >No users found matching the current filters</td
                            >
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        {#if selectedUser}
            <div class="user-detail" in:slide={{ duration: 300 }}>
                <div class="detail-header">
                    <h2>Edit User</h2>
                    <button class="close-button" on:click={cancelEdit}>
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div class="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        bind:value={selectedUser.name}
                        class:error={validationErrors.name}
                    />
                    {#if validationErrors.name}
                        <span class="error-message" in:scale={{ duration: 200 }}
                            >{validationErrors.name}</span
                        >
                    {/if}
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        bind:value={selectedUser.email}
                        class:error={validationErrors.email}
                    />
                    {#if validationErrors.email}
                        <span class="error-message" in:scale={{ duration: 200 }}
                            >{validationErrors.email}</span
                        >
                    {/if}
                </div>

                <div class="form-group">
                    <label>Role</label>
                    <select bind:value={selectedUser.role}>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="user">User</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Status</label>
                    <select bind:value={selectedUser.status}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>

                <div class="form-info">
                    <div class="info-item">
                        <span class="label">Account Created:</span>
                        <span class="value"
                            >{formatDate(selectedUser.accountCreated)}</span
                        >
                    </div>
                    <div class="info-item">
                        <span class="label">Last Login:</span>
                        <span class="value"
                            >{formatDate(selectedUser.lastLogin)}</span
                        >
                    </div>
                </div>

                <div class="action-buttons">
                    <button class="cancel-button" on:click={cancelEdit}
                        >Cancel</button
                    >
                    <button class="save-button" on:click={saveUser}
                        >Save Changes</button
                    >
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .user-manager {
        background-color: var(--card-bg);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 20px;
        color: var(--text-color);
        position: relative;
    }

    .header {
        margin-bottom: 20px;
    }

    .header h1 {
        margin: 0 0 5px 0;
        font-weight: 600;
    }

    .header p {
        margin: 0;
        color: var(--text-muted);
    }

    .filters {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
        gap: 20px;
        flex-wrap: wrap;
    }

    .search-box {
        display: flex;
        align-items: center;
        background-color: var(--hover-bg);
        border-radius: 4px;
        padding: 0 12px;
        flex: 1;
        min-width: 200px;
        transition: all 0.2s ease;
    }

    .search-box:focus-within {
        box-shadow: 0 0 0 2px var(--primary-color);
        transform: translateY(-1px);
    }

    .search-box input {
        border: none;
        background: none;
        padding: 10px;
        width: 100%;
        font-size: var(--body-font-size);
        color: var(--text-color);
        outline: none;
    }

    .filter-options {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }

    .filter {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .filter label {
        font-weight: 500;
        color: var(--text-muted);
    }

    .filter select {
        background-color: var(--hover-bg);
        border: none;
        border-radius: 4px;
        padding: 10px;
        color: var(--text-color);
        cursor: pointer;
        outline: none;
        transition: all 0.2s ease;
    }

    .filter select:hover,
    .filter select:focus {
        background-color: var(--selected-bg);
    }

    .content {
        display: flex;
        gap: 20px;
    }

    .users-table {
        flex: 1;
        transition: flex 0.3s ease;
    }

    .users-table.collapsed {
        flex: 0.6;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    thead th {
        text-align: left;
        padding: 12px 10px;
        font-weight: 600;
        border-bottom: 2px solid var(--border-color);
    }

    tbody td {
        padding: 12px 10px;
        border-bottom: 1px solid var(--border-color);
        transition: all 0.2s ease;
    }

    tr {
        transition:
            background-color 0.2s ease,
            transform 0.2s ease;
    }

    tr:hover {
        background-color: var(--hover-bg);
    }

    tr.active {
        background-color: var(--selected-bg);
    }

    tr:hover td {
        transform: translateY(-1px);
    }

    .badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.85em;
        font-weight: 500;
        text-transform: capitalize;
    }

    .role-admin {
        background-color: var(--primary-color);
        color: white;
    }

    .role-moderator {
        background-color: var(--secondary-accent);
        color: white;
    }

    .role-user {
        background-color: var(--secondary-color);
        color: white;
    }

    .status-active {
        background-color: var(--success-color);
        color: white;
    }

    .status-inactive {
        background-color: var(--secondary-color);
        color: white;
    }

    .status-suspended {
        background-color: var(--warning-color);
        color: white;
    }

    .actions {
        white-space: nowrap;
    }

    .action-button {
        background: none;
        border: none;
        color: var(--text-color);
        cursor: pointer;
        padding: 5px;
        border-radius: 4px;
        transition: all 0.2s ease;
    }

    .action-button:hover {
        background-color: var(--hover-bg);
        transform: translateY(-2px);
    }

    .action-button.delete:hover {
        color: var(--danger-color);
    }

    .no-results {
        text-align: center;
        color: var(--text-muted);
        padding: 20px;
    }

    .user-detail {
        flex: 0.4;
        background-color: var(--card-bg);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 20px;
    }

    .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .detail-header h2 {
        margin: 0;
        font-weight: 600;
    }

    .close-button {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 5px;
        transition: all 0.2s ease;
        border-radius: 50%;
    }

    .close-button:hover {
        background-color: var(--hover-bg);
        color: var(--text-color);
        transform: rotate(90deg);
    }

    .form-group {
        margin-bottom: 15px;
        position: relative;
    }

    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
    }

    .form-group input,
    .form-group select {
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid var(--border-color);
        background-color: var(--body-bg);
        color: var(--text-color);
        font-size: var(--body-font-size);
        transition: all 0.2s ease;
    }

    .form-group input:focus,
    .form-group select:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        outline: none;
    }

    .form-group input.error {
        border-color: var(--danger-color);
        box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
    }

    .error-message {
        color: var(--danger-color);
        font-size: 0.85em;
        margin-top: 5px;
        display: block;
        font-weight: 500;
    }

    .form-info {
        background-color: var(--hover-bg);
        border-radius: 4px;
        padding: 15px;
        margin-bottom: 20px;
    }

    .info-item {
        margin-bottom: 8px;
    }

    .info-item:last-child {
        margin-bottom: 0;
    }

    .info-item .label {
        font-weight: 500;
        margin-right: 5px;
    }

    .action-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }

    .cancel-button,
    .save-button {
        padding: 10px 15px;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
    }

    .cancel-button {
        background-color: var(--button-bg);
        color: var(--text-color);
    }

    .save-button {
        background-color: var(--primary-color);
        color: white;
    }

    .cancel-button:hover,
    .save-button:hover {
        transform: translateY(-2px);
        filter: brightness(1.05);
    }

    .cancel-button:active,
    .save-button:active {
        transform: translateY(0);
    }

    .success-message {
        display: flex;
        align-items: center;
        gap: 8px;
        background-color: var(--success-color);
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        margin-bottom: 20px;
        font-weight: 500;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 992px) {
        .content {
            flex-direction: column;
        }

        .users-table.collapsed {
            flex: 1;
        }

        .user-detail {
            flex: 1;
        }
    }

    @media (max-width: 768px) {
        .filters {
            flex-direction: column;
            gap: 10px;
        }

        .filter-options {
            flex-direction: column;
        }
    }
</style>
