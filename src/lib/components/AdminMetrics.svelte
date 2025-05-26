<script>
    import { onMount } from "svelte";

    let loading = true;

    // Placeholder data - replace with actual fetching later
    const metrics = {
        totalPledges: "5,678",
        activePledges: "4,321",
        totalUsers: "987",
        monthlyGrowth: "+15.2%",
        totalTransactions: "12,345",
        solutionsCompleted: "45",
        ideasContributed: "678",
        topicsCreated: "123",
    };

    // Simulate fetching data
    onMount(() => {
        const timer = setTimeout(() => {
            loading = false;
        }, 1500); // Simulate 1.5 second load time

        // Cleanup timer on component destroy
        return () => clearTimeout(timer);
    });
</script>

{#if loading}
    <!-- Skeleton Loader -->
    <div class="metrics-grid skeleton">
        {#each { length: 8 } as _}
            <div class="skeleton-metric-card"></div>
        {/each}
    </div>
{:else}
    <!-- Actual Metrics Section -->
    <div class="metrics-grid">
        <div class="metric-card">
            <h2>Total Pledges</h2>
            <p>{metrics.totalPledges}</p>
        </div>
        <div class="metric-card">
            <h2>Active Pledges</h2>
            <p>{metrics.activePledges}</p>
        </div>
        <div class="metric-card">
            <h2>Registered Users</h2>
            <p>{metrics.totalUsers}</p>
        </div>
        <div class="metric-card">
            <h2>Monthly Growth</h2>
            <p class="growth">{metrics.monthlyGrowth}</p>
        </div>
        <div class="metric-card">
            <h2>Total Transactions</h2>
            <p>{metrics.totalTransactions}</p>
        </div>
        <div class="metric-card">
            <h2>Solutions Completed</h2>
            <p>{metrics.solutionsCompleted}</p>
        </div>
        <div class="metric-card">
            <h2>Ideas Contributed</h2>
            <p>{metrics.ideasContributed}</p>
        </div>
        <div class="metric-card">
            <h2>Topics Created</h2>
            <p>{metrics.topicsCreated}</p>
        </div>
    </div>
{/if}

<style>
    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        /* Responsive grid */
        gap: 20px;
        /* Gap between metric cards */
        padding: 20px;
        background-color: var(--forth-color-v2);
        border-radius: 8px;
        border: 1px solid var(--ninth-color);
    }

    .metric-card {
        background-color: var(--tertiary-color);
        padding: 15px;
        border-radius: 6px;
        border: 1px solid var(--ninth-color);
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 80px;
    }

    .metric-card h2 {
        font-size: 1rem;
        /* Smaller heading for cards */
        margin-bottom: 10px;
        color: var(--eigth-color);
        font-weight: 500;
    }

    .metric-card p {
        font-size: 1.5rem;
        /* Larger font for the number */
        font-weight: 600;
        color: var(--secondary-color);
        margin: 0;
    }

    /* Specific style for growth percentage */
    .metric-card p.growth {
        color: var(--green);
        /* Use green for positive growth */
        /* Add logic later to handle negative growth (e.g., var(--red-wine)) */
    }

    /* Skeleton Styles */
    .metrics-grid.skeleton {
        background-color: transparent; /* No background for the grid itself */
        border: none;
    }

    .skeleton-metric-card {
        background-color: var(--ninth-color); /* Use a grey color */
        opacity: 0.5;
        border-radius: 6px;
        min-height: 80px; /* Match height of real card */
        animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 0.5;
        }
        50% {
            opacity: 0.2;
        }
    }
</style>
