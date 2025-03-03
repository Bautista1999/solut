<script>
    import Table from "./Table.svelte";
    import StatusCell from "./StatusCell.svelte";
    import PriorityCell from "./PriorityCell.svelte";

    // Sample task data that matches the screenshots
    const tasks = [
        {
            id: "TASK-8782",
            title: "You can't compress the program without quantifying the open-source SS...",
            type: "Documentation",
            status: "In Progress",
            priority: "Medium",
        },
        {
            id: "TASK-7878",
            title: "Try to calculate the EXE feed, maybe it will index the multi-byte pixel!",
            type: "Documentation",
            status: "Backlog",
            priority: "Medium",
        },
        {
            id: "TASK-7839",
            title: "We need to bypass the neural TCP card!",
            type: "Bug",
            status: "Todo",
            priority: "High",
        },
    ];

    // Column definitions for the table
    const columns = [
        {
            id: "id",
            header: "Task",
            accessor: "id",
            sortable: true,
        },
        {
            id: "type",
            header: "Type",
            accessor: "type",
            sortable: false,
        },
        {
            id: "title",
            header: "Title",
            accessor: "title",
            sortable: true,
        },
        {
            id: "status",
            header: "Status",
            accessor: "status",
            sortable: true,
            cellComponent: StatusCell,
        },
        {
            id: "priority",
            header: "Priority",
            accessor: "priority",
            sortable: true,
            cellComponent: PriorityCell,
        },
    ];
</script>

<div class="demo-container">
    <h2>Task Management</h2>
    <div class="demo-table">
        <Table rows={tasks} {columns} />
    </div>
</div>

<style>
    .demo-container {
        padding: 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #2d3748;
    }

    .demo-table {
        border-radius: 0.5rem;
        overflow: hidden;
    }
</style>
