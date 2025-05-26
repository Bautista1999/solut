<script>
    import { onMount } from "svelte";
    import { fade, fly, scale, slide } from "svelte/transition";
    import { flip } from "svelte/animate";
    import { quintOut, elasticOut } from "svelte/easing";

    // Sample data for KPIs
    let totalPledges = 0;
    let activeUsers = 0;
    let totalRevenue = 0;
    let pendingApprovals = 0;

    // Loading state
    let isLoading = true;

    // Animation delays for staggered effects
    /**
     * @param {number} i
     */
    const staggerDelay = (i) => 150 * i;

    // Sample data for charts
    let monthlyData = [
        { month: "Jan", pledges: 120, users: 45 },
        { month: "Feb", pledges: 150, users: 53 },
        { month: "Mar", pledges: 180, users: 61 },
        { month: "Apr", pledges: 210, users: 75 },
        { month: "May", pledges: 240, users: 82 },
        { month: "Jun", pledges: 270, users: 91 },
    ];

    // Sample recent activities
    let recentActivities = [
        { type: "pledge", user: "John Doe", amount: 500, time: "2 hours ago" },
        {
            type: "approval",
            user: "Jane Smith",
            solution: "Eco Solution",
            time: "5 hours ago",
        },
        { type: "new_user", user: "Robert Johnson", time: "1 day ago" },
        { type: "completion", solution: "Smart City", time: "2 days ago" },
    ];

    // Simulating data loading
    onMount(() => {
        setTimeout(() => {
            totalPledges = 1234;
            activeUsers = 567;
            totalRevenue = 12345;
            pendingApprovals = 23;
            isLoading = false;
        }, 800);
    });

    // Function to format numbers with commas
    /**
     * @param {number} num
     */
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
</script>

<svelte:head>
    <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
    />
</svelte:head>

<div class="dashboard" in:fade={{ duration: 400 }}>
    <h1 in:slide={{ delay: 200, duration: 400 }}>Dashboard</h1>

    <div class="kpi-section">
        {#each [{ id: 1, icon: "payments", title: "Total Pledges", value: totalPledges, trend: "+5.2% from last month", trendType: "positive" }, { id: 2, icon: "group", title: "Active Users", value: activeUsers, trend: "+3.7% from last month", trendType: "positive" }, { id: 3, icon: "account_balance", title: "Total Revenue", value: "$" + totalRevenue, trend: "+8.1% from last month", trendType: "positive" }, { id: 4, icon: "pending", title: "Pending Approvals", value: pendingApprovals, trend: "+2 from yesterday", trendType: "negative" }] as kpi, i (kpi.id)}
            <div
                class="kpi-card"
                in:fly={{
                    y: 20,
                    delay: staggerDelay(i),
                    duration: 400,
                    easing: quintOut,
                }}
            >
                {#if isLoading}
                    <div class="kpi-loading-skeleton">
                        <div class="skeleton-icon"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-title"></div>
                            <div class="skeleton-value"></div>
                            <div class="skeleton-trend"></div>
                        </div>
                    </div>
                {:else}
                    <div class="kpi-icon" transition:scale={{ duration: 300 }}>
                        <span class="material-symbols-outlined">{kpi.icon}</span
                        >
                    </div>
                    <div class="kpi-content">
                        <h3>{kpi.title}</h3>
                        <p
                            class="kpi-value"
                            in:fade={{
                                delay: staggerDelay(i) + 300,
                                duration: 400,
                            }}
                        >
                            {kpi.value}
                        </p>
                        <p class="kpi-trend {kpi.trendType}">{kpi.trend}</p>
                    </div>
                {/if}
            </div>
        {/each}
    </div>

    <div class="dashboard-grid">
        <div
            class="chart-container"
            in:fly={{ y: 30, delay: 600, duration: 500 }}
        >
            <h2>Monthly Growth</h2>
            <div class="chart">
                <div class="chart-placeholder">
                    <!-- This would be replaced with an actual chart component -->
                    <div class="bar-chart">
                        {#each monthlyData as data, i}
                            <div
                                class="bar-group"
                                in:fly={{
                                    y: 50,
                                    delay: 800 + i * 100,
                                    duration: 400,
                                    easing: quintOut,
                                }}
                            >
                                <div
                                    class="bar pledges"
                                    style="height: {data.pledges / 3}px"
                                ></div>
                                <div
                                    class="bar users"
                                    style="height: {data.users}px"
                                ></div>
                                <div class="month-label">{data.month}</div>
                            </div>
                        {/each}
                    </div>
                    <div class="chart-legend">
                        <div class="legend-item">
                            <div class="legend-color pledges"></div>
                            <span>Pledges</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color users"></div>
                            <span>New Users</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="activity-container">
            <h2>Recent Activity</h2>
            <div class="activity-list">
                {#each recentActivities as activity}
                    <div class="activity-item">
                        {#if activity.type === "pledge"}
                            <div class="activity-icon pledge">
                                <span class="material-symbols-outlined"
                                    >payments</span
                                >
                            </div>
                            <div class="activity-content">
                                <p>
                                    <strong>{activity.user}</strong> pledged ${activity.amount}
                                </p>
                                <span class="activity-time"
                                    >{activity.time}</span
                                >
                            </div>
                        {:else if activity.type === "approval"}
                            <div class="activity-icon approval">
                                <span class="material-symbols-outlined"
                                    >check_circle</span
                                >
                            </div>
                            <div class="activity-content">
                                <p>
                                    <strong>{activity.user}</strong> approved
                                    <strong>{activity.solution}</strong>
                                </p>
                                <span class="activity-time"
                                    >{activity.time}</span
                                >
                            </div>
                        {:else if activity.type === "new_user"}
                            <div class="activity-icon new-user">
                                <span class="material-symbols-outlined"
                                    >person_add</span
                                >
                            </div>
                            <div class="activity-content">
                                <p>
                                    <strong>{activity.user}</strong> joined Solutio
                                </p>
                                <span class="activity-time"
                                    >{activity.time}</span
                                >
                            </div>
                        {:else if activity.type === "completion"}
                            <div class="activity-icon completion">
                                <span class="material-symbols-outlined"
                                    >celebration</span
                                >
                            </div>
                            <div class="activity-content">
                                <p>
                                    <strong>{activity.solution}</strong> was completed
                                </p>
                                <span class="activity-time"
                                    >{activity.time}</span
                                >
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    .dashboard {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
    }

    h1 {
        margin-bottom: 20px;
        color: var(--primary-color, #333);
    }

    .kpi-section {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .kpi-card {
        background-color: var(--card-bg, white);
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
    }

    .kpi-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .kpi-icon {
        font-size: 2rem;
        margin-right: 15px;
        background-color: var(--icon-bg, #f0f0f0);
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .kpi-content h3 {
        margin: 0;
        font-size: 1rem;
        color: var(--text-muted, #666);
    }

    .kpi-value {
        font-size: 1.8rem;
        font-weight: bold;
        margin: 5px 0;
    }

    .kpi-trend {
        font-size: 0.8rem;
        margin: 0;
    }

    .positive {
        color: var(--success-color, #28a745);
    }

    .negative {
        color: var(--danger-color, #dc3545);
    }

    /* Skeleton loading styles */
    .kpi-loading-skeleton {
        width: 100%;
        display: flex;
        align-items: center;
    }

    .skeleton-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(
            90deg,
            var(--skeleton-start, #f0f0f0) 0%,
            var(--skeleton-end, #e0e0e0) 50%,
            var(--skeleton-start, #f0f0f0) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        margin-right: 15px;
    }

    .skeleton-content {
        flex: 1;
    }

    .skeleton-title {
        height: 14px;
        width: 70%;
        background: linear-gradient(
            90deg,
            var(--skeleton-start, #f0f0f0) 0%,
            var(--skeleton-end, #e0e0e0) 50%,
            var(--skeleton-start, #f0f0f0) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
        margin-bottom: 8px;
    }

    .skeleton-value {
        height: 24px;
        width: 90%;
        background: linear-gradient(
            90deg,
            var(--skeleton-start, #f0f0f0) 0%,
            var(--skeleton-end, #e0e0e0) 50%,
            var(--skeleton-start, #f0f0f0) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
        margin-bottom: 8px;
    }

    .skeleton-trend {
        height: 10px;
        width: 60%;
        background: linear-gradient(
            90deg,
            var(--skeleton-start, #f0f0f0) 0%,
            var(--skeleton-end, #e0e0e0) 50%,
            var(--skeleton-start, #f0f0f0) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
    }

    @keyframes shimmer {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }

    .dashboard-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 20px;
    }

    .chart-container,
    .activity-container {
        background-color: var(--card-bg, white);
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    h2 {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 1.2rem;
        color: var(--primary-color, #333);
    }

    .chart-placeholder {
        height: 300px;
        display: flex;
        flex-direction: column;
    }

    .bar-chart {
        flex-grow: 1;
        display: flex;
        align-items: flex-end;
        justify-content: space-around;
        padding-bottom: 20px;
    }

    .bar-group {
        display: flex;
        align-items: flex-end;
        position: relative;
    }

    .bar {
        width: 20px;
        margin: 0 5px;
        border-radius: 4px 4px 0 0;
    }

    .bar.pledges {
        background-color: var(--primary-color, #4a90e2);
    }

    .bar.users {
        background-color: var(--secondary-accent, #50c878);
    }

    .month-label {
        position: absolute;
        bottom: -20px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.8rem;
        color: var(--text-muted, #666);
    }

    .chart-legend {
        display: flex;
        justify-content: center;
        margin-top: 10px;
    }

    .legend-item {
        display: flex;
        align-items: center;
        margin: 0 10px;
    }

    .legend-color {
        width: 15px;
        height: 15px;
        border-radius: 3px;
        margin-right: 5px;
    }

    .legend-color.pledges {
        background-color: var(--primary-color, #4a90e2);
    }

    .legend-color.users {
        background-color: var(--secondary-accent, #50c878);
    }

    .activity-list {
        max-height: 300px;
        overflow-y: auto;
    }

    .activity-item {
        display: flex;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid var(--border-color, #eee);
    }

    .activity-item:last-child {
        border-bottom: none;
    }

    .activity-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        font-size: 1.2rem;
    }

    .activity-icon.pledge {
        background-color: rgba(74, 144, 226, 0.1);
        color: var(--primary-color, #4a90e2);
    }

    .activity-icon.approval {
        background-color: rgba(80, 200, 120, 0.1);
        color: var(--success-color, #50c878);
    }

    .activity-icon.new-user {
        background-color: rgba(255, 193, 7, 0.1);
        color: var(--warning-color, #ffc107);
    }

    .activity-icon.completion {
        background-color: rgba(220, 53, 69, 0.1);
        color: var(--danger-color, #dc3545);
    }

    .activity-content p {
        margin: 0;
        font-size: 0.9rem;
    }

    .activity-time {
        font-size: 0.8rem;
        color: var(--text-muted, #666);
    }

    @media (max-width: 768px) {
        .dashboard-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
