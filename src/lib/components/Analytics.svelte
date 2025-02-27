<script>
    import { onMount } from "svelte";

    // Sample analytics data

    // Sample data for charts
    let monthlyData = [
        { month: "Jan", pledges: 120, users: 45, revenue: 6000 },
        { month: "Feb", pledges: 150, users: 53, revenue: 7500 },
        { month: "Mar", pledges: 180, users: 61, revenue: 9000 },
        { month: "Apr", pledges: 210, users: 75, revenue: 10500 },
        { month: "May", pledges: 240, users: 82, revenue: 12000 },
        { month: "Jun", pledges: 270, users: 91, revenue: 13500 },
    ];

    let topSolutions = [
        { name: "Eco Solution", pledges: 45, amount: 22500 },
        { name: "Smart City", pledges: 38, amount: 19000 },
        { name: "Clean Water Initiative", pledges: 32, amount: 16000 },
        { name: "Renewable Energy", pledges: 28, amount: 14000 },
        { name: "Urban Farming", pledges: 25, amount: 12500 },
    ];

    let userActivity = [
        { date: "2023-06-14", activeUsers: 120, newUsers: 8 },
        { date: "2023-06-15", activeUsers: 135, newUsers: 12 },
        { date: "2023-06-16", activeUsers: 128, newUsers: 5 },
        { date: "2023-06-17", activeUsers: 142, newUsers: 10 },
        { date: "2023-06-18", activeUsers: 150, newUsers: 15 },
        { date: "2023-06-19", activeUsers: 145, newUsers: 7 },
        { date: "2023-06-20", activeUsers: 160, newUsers: 18 },
    ];

    let geographicData = [
        { region: "North America", users: 250, pledges: 120 },
        { region: "Europe", users: 180, pledges: 85 },
        { region: "Asia", users: 150, pledges: 65 },
        { region: "South America", users: 90, pledges: 40 },
        { region: "Africa", users: 70, pledges: 30 },
        { region: "Oceania", users: 50, pledges: 25 },
    ];

    // Time period filter
    let timePeriod = "month";

    /**
     * Change the time period for data display
     * @param {string} period - The time period to display (week, month, quarter, year)
     */
    function changeTimePeriod(period) {
        timePeriod = period;
        // In a real app, this would trigger data refresh based on the selected period
    }

    // Calculate totals
    $: totalPledges = monthlyData.reduce((sum, data) => sum + data.pledges, 0);
    $: totalUsers = monthlyData.reduce((sum, data) => sum + data.users, 0);
    $: totalRevenue = monthlyData.reduce((sum, data) => sum + data.revenue, 0);

    // Find max values for scaling charts
    $: maxPledges = Math.max(...monthlyData.map((data) => data.pledges));
    $: maxUsers = Math.max(...monthlyData.map((data) => data.users));
    $: maxRevenue = Math.max(...monthlyData.map((data) => data.revenue));
</script>

<svelte:head>
    <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        rel="stylesheet"
    />
</svelte:head>

<div class="analytics">
    <h1>Analytics Dashboard</h1>

    <div class="time-filter">
        <span>Time Period:</span>
        <div class="time-buttons">
            <button
                class:active={timePeriod === "week"}
                on:click={() => changeTimePeriod("week")}
            >
                Week
            </button>
            <button
                class:active={timePeriod === "month"}
                on:click={() => changeTimePeriod("month")}
            >
                Month
            </button>
            <button
                class:active={timePeriod === "quarter"}
                on:click={() => changeTimePeriod("quarter")}
            >
                Quarter
            </button>
            <button
                class:active={timePeriod === "year"}
                on:click={() => changeTimePeriod("year")}
            >
                Year
            </button>
        </div>
    </div>

    <div class="summary-cards">
        <div class="summary-card">
            <div class="card-icon">
                <span class="material-symbols-outlined">payments</span>
            </div>
            <div class="card-content">
                <h3>Total Pledges</h3>
                <p class="card-value">{totalPledges}</p>
                <p class="card-trend positive">
                    +12.5% from previous {timePeriod}
                </p>
            </div>
        </div>

        <div class="summary-card">
            <div class="card-icon">
                <span class="material-symbols-outlined">group</span>
            </div>
            <div class="card-content">
                <h3>Total Users</h3>
                <p class="card-value">{totalUsers}</p>
                <p class="card-trend positive">
                    +8.3% from previous {timePeriod}
                </p>
            </div>
        </div>

        <div class="summary-card">
            <div class="card-icon">
                <span class="material-symbols-outlined">monetization_on</span>
            </div>
            <div class="card-content">
                <h3>Total Revenue</h3>
                <p class="card-value">${totalRevenue}</p>
                <p class="card-trend positive">
                    +15.2% from previous {timePeriod}
                </p>
            </div>
        </div>
    </div>

    <div class="chart-grid">
        <div class="chart-card">
            <h2>Monthly Growth</h2>
            <div class="chart">
                <div class="bar-chart">
                    {#each monthlyData as data}
                        <div class="bar-group">
                            <div class="bar-label">{data.month}</div>
                            <div class="bars">
                                <div
                                    class="bar pledges"
                                    style="height: {(data.pledges /
                                        maxPledges) *
                                        200}px"
                                    title="Pledges: {data.pledges}"
                                ></div>
                                <div
                                    class="bar users"
                                    style="height: {(data.users / maxUsers) *
                                        200}px"
                                    title="Users: {data.users}"
                                ></div>
                                <div
                                    class="bar revenue"
                                    style="height: {(data.revenue /
                                        maxRevenue) *
                                        200}px"
                                    title="Revenue: ${data.revenue}"
                                ></div>
                            </div>
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
                        <span>Users</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color revenue"></div>
                        <span>Revenue</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="chart-card">
            <h2>Top Solutions</h2>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Solution</th>
                            <th>Pledges</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each topSolutions as solution}
                            <tr>
                                <td>{solution.name}</td>
                                <td>{solution.pledges}</td>
                                <td>${solution.amount}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="chart-card">
            <h2>User Activity (Last 7 Days)</h2>
            <div class="line-chart">
                <div class="chart-container">
                    <div class="y-axis">
                        <div class="y-label">160</div>
                        <div class="y-label">120</div>
                        <div class="y-label">80</div>
                        <div class="y-label">40</div>
                        <div class="y-label">0</div>
                    </div>
                    <div class="chart-area">
                        <div class="grid-lines">
                            <div class="grid-line"></div>
                            <div class="grid-line"></div>
                            <div class="grid-line"></div>
                            <div class="grid-line"></div>
                            <div class="grid-line"></div>
                        </div>

                        <svg
                            width="100%"
                            height="200"
                            viewBox="0 0 600 200"
                            preserveAspectRatio="none"
                        >
                            <!-- Active Users Line -->
                            <polyline
                                class="line active-users"
                                points="
                  0,{200 - (userActivity[0].activeUsers / 160) * 200}
                  100,{200 - (userActivity[1].activeUsers / 160) * 200}
                  200,{200 - (userActivity[2].activeUsers / 160) * 200}
                  300,{200 - (userActivity[3].activeUsers / 160) * 200}
                  400,{200 - (userActivity[4].activeUsers / 160) * 200}
                  500,{200 - (userActivity[5].activeUsers / 160) * 200}
                  600,{200 - (userActivity[6].activeUsers / 160) * 200}
                "
                            />

                            <!-- New Users Line -->
                            <polyline
                                class="line new-users"
                                points="
                  0,{200 - (userActivity[0].newUsers / 20) * 200}
                  100,{200 - (userActivity[1].newUsers / 20) * 200}
                  200,{200 - (userActivity[2].newUsers / 20) * 200}
                  300,{200 - (userActivity[3].newUsers / 20) * 200}
                  400,{200 - (userActivity[4].newUsers / 20) * 200}
                  500,{200 - (userActivity[5].newUsers / 20) * 200}
                  600,{200 - (userActivity[6].newUsers / 20) * 200}
                "
                            />
                        </svg>

                        <div class="x-axis">
                            {#each userActivity as activity, i}
                                <div class="x-label" style="left: {i * 16.6}%">
                                    {activity.date.slice(5)}
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>

                <div class="chart-legend">
                    <div class="legend-item">
                        <div class="legend-color active-users"></div>
                        <span>Active Users</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color new-users"></div>
                        <span>New Users</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="chart-card">
            <h2>Geographic Distribution</h2>
            <div class="geo-chart">
                <div class="geo-bars">
                    {#each geographicData as geo}
                        <div class="geo-bar-group">
                            <div class="geo-region">{geo.region}</div>
                            <div class="geo-bar-container">
                                <div
                                    class="geo-bar"
                                    style="width: {(geo.users / 250) * 100}%"
                                >
                                    <span class="geo-value"
                                        >{geo.users} users</span
                                    >
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .analytics {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
    }

    h1 {
        margin-bottom: 20px;
        color: var(--primary-color, #333);
    }

    .time-filter {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
    }

    .time-filter span {
        margin-right: 15px;
        font-weight: bold;
    }

    .time-buttons {
        display: flex;
    }

    .time-buttons button {
        padding: 8px 16px;
        background-color: var(--button-bg, #f0f0f0);
        border: none;
        border-radius: 4px;
        margin-right: 10px;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .time-buttons button.active {
        background-color: var(--primary-color, #4a90e2);
        color: white;
    }

    .summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .summary-card {
        background-color: var(--card-bg, white);
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
    }

    .card-icon {
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

    .card-content h3 {
        margin: 0;
        font-size: 1rem;
        color: var(--text-muted, #666);
    }

    .card-value {
        font-size: 1.8rem;
        font-weight: bold;
        margin: 5px 0;
    }

    .card-trend {
        font-size: 0.8rem;
        margin: 0;
    }

    .positive {
        color: var(--success-color, #28a745);
    }

    .negative {
        color: var(--danger-color, #dc3545);
    }

    .chart-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }

    .chart-card {
        background-color: var(--card-bg, white);
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        margin-bottom: 20px;
    }

    h2 {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 1.2rem;
        color: var(--primary-color, #333);
    }

    .chart {
        height: 300px;
        display: flex;
        flex-direction: column;
    }

    .bar-chart {
        flex-grow: 1;
        display: flex;
        justify-content: space-around;
        align-items: flex-end;
        padding-bottom: 30px;
    }

    .bar-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 60px;
    }

    .bar-label {
        margin-top: 10px;
        font-size: 0.8rem;
        color: var(--text-muted, #666);
    }

    .bars {
        display: flex;
        align-items: flex-end;
        height: 200px;
    }

    .bar {
        width: 15px;
        margin: 0 2px;
        border-radius: 4px 4px 0 0;
    }

    .bar.pledges {
        background-color: var(--primary-color, #4a90e2);
    }

    .bar.users {
        background-color: var(--secondary-accent, #50c878);
    }

    .bar.revenue {
        background-color: var(--tertiary-accent, #ffc107);
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

    .legend-color.revenue {
        background-color: var(--tertiary-accent, #ffc107);
    }

    .legend-color.active-users {
        background-color: var(--primary-color, #4a90e2);
    }

    .legend-color.new-users {
        background-color: var(--secondary-accent, #50c878);
    }

    .table-container {
        max-height: 250px;
        overflow-y: auto;
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

    .line-chart {
        height: 300px;
    }

    .chart-container {
        display: flex;
        height: 250px;
    }

    .y-axis {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding-right: 10px;
        width: 40px;
    }

    .y-label {
        font-size: 0.8rem;
        color: var(--text-muted, #666);
        height: 20px;
        display: flex;
        align-items: center;
    }

    .chart-area {
        flex-grow: 1;
        position: relative;
        border-left: 1px solid var(--border-color, #eee);
        border-bottom: 1px solid var(--border-color, #eee);
    }

    .grid-lines {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .grid-line {
        height: 1px;
        background-color: var(--border-color, #eee);
        width: 100%;
    }

    svg {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

    .line {
        fill: none;
        stroke-width: 2;
    }

    .line.active-users {
        stroke: var(--primary-color, #4a90e2);
    }

    .line.new-users {
        stroke: var(--secondary-accent, #50c878);
    }

    .x-axis {
        position: absolute;
        bottom: -25px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
    }

    .x-label {
        font-size: 0.8rem;
        color: var(--text-muted, #666);
        position: absolute;
        transform: translateX(-50%);
    }

    .geo-chart {
        padding: 10px 0;
    }

    .geo-bars {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .geo-bar-group {
        display: flex;
        align-items: center;
    }

    .geo-region {
        width: 120px;
        font-size: 0.9rem;
    }

    .geo-bar-container {
        flex-grow: 1;
        height: 25px;
        background-color: var(--bar-bg, #f0f0f0);
        border-radius: 4px;
        overflow: hidden;
    }

    .geo-bar {
        height: 100%;
        background-color: var(--primary-color, #4a90e2);
        border-radius: 4px;
        position: relative;
    }

    .geo-value {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.8rem;
        color: white;
    }

    @media (max-width: 768px) {
        .chart-grid {
            grid-template-columns: 1fr;
        }

        .time-filter {
            flex-direction: column;
            align-items: flex-start;
        }

        .time-filter span {
            margin-bottom: 10px;
        }

        .time-buttons {
            width: 100%;
            justify-content: space-between;
        }

        .time-buttons button {
            flex: 1;
            margin-right: 5px;
        }
    }
</style>
