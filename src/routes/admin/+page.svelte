<script>
    import "chartjs-adapter-date-fns";

    import UserRegistrationsGraph from "$lib/components/UserRegistrationsGraph.svelte";
    import AdminMetrics from "$lib/components/AdminMetrics.svelte"; // Import the new component
</script>

<div class="container">
    <div class="admin-dashboard">
        <h1>Admin Dashboard</h1>

        <AdminMetrics />
        <!-- Use the new component -->

        <UserRegistrationsGraph />
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .admin-dashboard {
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-self: center;
        background-color: var(--tertiary-color); /* White background */
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        margin: 20px;
        width: 800px;
        gap: 30px; /* Add gap between sections */
    }

    /* Remove styles that were moved to AdminMetrics.svelte */
</style>
