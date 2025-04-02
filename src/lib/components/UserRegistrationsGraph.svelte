<script>
    import { Line } from "svelte-chartjs";
    import {
        Chart as ChartJS,
        Title,
        Tooltip,
        Legend,
        LineElement,
        LinearScale,
        PointElement,
        CategoryScale,
        TimeScale,
    } from "chart.js";
    import zoomPlugin from "chartjs-plugin-zoom";
    import "chartjs-adapter-date-fns";
    import RangeSlider from "svelte-range-slider-pips";
    import { onMount, onDestroy } from "svelte"; // Import lifecycle functions if needed
    import { getDailyUserRegistrations } from "../../declarations/satellite/satellite.api";

    ChartJS.register(
        Title,
        Tooltip,
        Legend,
        LineElement,
        LinearScale,
        PointElement,
        CategoryScale,
        TimeScale,
        zoomPlugin,
    );

    // State for loading, error, and chart data
    let loading = true;
    /**
     * @type {string | null}
     */
    let error = null;
    /** @type {Date[]} */
    let chartLabels = [];
    /** @type {number[]} */
    let chartUserData = [];
    let minDate = new Date().getTime();
    let maxDate = new Date().getTime();
    let sliderValues = [minDate, maxDate];

    /** @type {import('chart.js').Chart | null} */
    let chartInstance = null; // Ensure JSDoc type hint is present

    // Fetch data on mount
    onMount(async () => {
        try {
            const result = await getDailyUserRegistrations();

            if ("Ok" in result) {
                const dailyData = result.Ok;

                if (dailyData.length === 0) {
                    chartLabels = [];
                    chartUserData = [];
                    minDate = new Date().getTime();
                    maxDate = new Date().getTime();
                    error = "No user registration data found.";
                } else {
                    // --- Fill in missing days --- //
                    const dataMap = new Map(
                        dailyData.map((item) => [
                            Number(item[0]),
                            Number(item[1]),
                        ]),
                    );
                    const timestamps = dailyData.map((item) => Number(item[0]));
                    const actualMinTimestamp = Math.min(...timestamps);
                    const actualMaxTimestamp = Math.max(...timestamps);

                    minDate = actualMinTimestamp;
                    maxDate = actualMaxTimestamp;

                    const tempLabels = [];
                    const tempUserData = [];
                    const oneDayMillis = 24 * 60 * 60 * 1000;

                    for (
                        let currentTimestamp = actualMinTimestamp;
                        currentTimestamp <= actualMaxTimestamp;
                        currentTimestamp += oneDayMillis
                    ) {
                        tempLabels.push(new Date(currentTimestamp));
                        tempUserData.push(dataMap.get(currentTimestamp) || 0); // Use 0 if day not in map
                    }

                    chartLabels = tempLabels;
                    chartUserData = tempUserData;
                    // --- End fill in missing days --- //
                }
                sliderValues = [minDate, maxDate];
                error = null;
            } else if ("Err" in result) {
                console.error("Error fetching user registrations:", result.Err);
                error = `Failed to load data: ${result.Err}`;
            } else {
                console.error("Unexpected result format:", result);
                error = "Received unexpected data format from backend.";
            }
        } catch (err) {
            console.error("Exception during fetch:", err);
            error = `An error occurred: ${err}`;
        } finally {
            loading = false;
        }
    });
    // State for the computed color
    let computedPrimaryColor = "#ff812c"; // Default fallback

    // Fetch computed style on mount
    onMount(() => {
        if (typeof window !== "undefined") {
            // Ensure running in browser
            const color = getComputedStyle(document.documentElement)
                .getPropertyValue("--primary-color")
                .trim();
            if (color) {
                computedPrimaryColor = color;
                console.log("Computed --primary-color:", computedPrimaryColor);
            }
        }
    });

    // Make data object reactive to fetched data & color
    $: data = {
        labels: chartLabels,
        datasets: [
            {
                label: "Users",
                backgroundColor: computedPrimaryColor,
                borderColor: computedPrimaryColor,
                data: chartUserData,
                tension: 0.1,
                pointRadius: 1,
                pointHoverRadius: 5,
            },
        ],
    };

    // Make options reactive (as it depends on sliderValues indirectly via data)
    /** @type {import('chart.js').ChartOptions<'line'>} */
    let options;

    // Reactive statement to rebuild options when sliderValues changes
    $: {
        // console.log(`Rebuilding options for slider values: ${sliderValues?.map(ts => new Date(ts).toLocaleDateString())}`);
        options = {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: {
                    position: "top",
                    labels: { color: "var(--secondary-color)" },
                },
                title: {
                    display: true,
                    text: "Daily User Count (Zoomable)",
                    color: "var(--secondary-color)",
                },
                tooltip: { mode: "index", intersect: false },
                zoom: {
                    pan: {
                        enabled: !loading && !error,
                        mode: "x",
                        threshold: 5,
                        onPanComplete: ({ chart }) =>
                            updateSliderFromChart(chart),
                    },
                    zoom: {
                        wheel: { enabled: !loading && !error },
                        pinch: { enabled: !loading && !error },
                        mode: "x",
                        onZoomComplete: ({ chart }) =>
                            updateSliderFromChart(chart),
                    },
                    limits: { x: { min: minDate, max: maxDate } }, // Use fetched min/max for initial limits
                },
            },
            scales: {
                x: {
                    type: "time",
                    min: sliderValues[0],
                    max: sliderValues[1],
                    time: { unit: "month", tooltipFormat: "MMM dd, yyyy" },
                    ticks: {
                        color: "var(--primary-color)",
                        source: "auto",
                        maxRotation: 0,
                        autoSkip: true,
                    },
                    grid: { color: "var(--ninth-color)" },
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "var(--primary-color)" },
                    grid: { color: "var(--primary-color)" },
                },
            },
            interaction: { mode: "nearest", axis: "x", intersect: false },
        };
    }

    /**
     * Updates slider position based on chart zoom/pan.
     * @param {import('chart.js').Chart} chart
     */
    function updateSliderFromChart(chart) {
        const scales = chart.options?.scales;
        if (!scales?.x) return;
        const currentChartMin = scales.x.min;
        const currentChartMax = scales.x.max;

        if (
            typeof currentChartMin === "number" &&
            typeof currentChartMax === "number" &&
            (Math.abs(sliderValues[0] - currentChartMin) > 1000 ||
                Math.abs(sliderValues[1] - currentChartMax) > 1000)
        ) {
            // console.log("[Chart Update]: Chart changed -> Updating slider values.");
            sliderValues = [currentChartMin, currentChartMax];
        }
    }

    /**
     * Captures the chart instance when ready.
     * @param {CustomEvent<{ chart: import('chart.js').Chart }>} event
     */
    function handleChartReady(event) {
        if (event.detail?.chart) {
            chartInstance = event.detail.chart;
        }
    }

    // Optional reactive log to monitor sliderValues directly
    // $: console.log("[Reactive Log] sliderValues changed:", sliderValues?.map(ts => new Date(ts).toLocaleDateString()));
</script>

{#if loading}
    <!-- Simple Loading Skeleton -->
    <div class="skeleton-container">
        <div class="skeleton-chart"></div>
        <div class="skeleton-slider"></div>
    </div>
{:else if error}
    <!-- Error Message -->
    <div class="error-message">
        <p>{error}</p>
    </div>
{:else}
    <!-- Chart and Slider (Loaded State) -->
    <h2>Daily User Registrations</h2>
    <div class="chart-container">
        <Line {data} {options} on:chartReady={handleChartReady}></Line>
    </div>
    <div class="slider-container">
        <RangeSlider
            min={minDate}
            max={maxDate}
            bind:values={sliderValues}
            step={86400000}
            pips={false}
            range
            disabled={!!(loading || error)}
        />
        <div class="slider-labels">
            <span>{new Date(sliderValues[0]).toLocaleDateString()}</span>
            <span>{new Date(sliderValues[1]).toLocaleDateString()}</span>
        </div>
    </div>
{/if}

<style>
    .chart-container {
        position: relative;
        height: 400px; /* Adjust height as needed */

        background-color: var(
            --tertiary-color
        ); /* Light background for the chart area */
        padding: 15px;
        border-radius: 8px;
        border: 1px solid var(--secondary-color);
        cursor: grab;
    }

    .chart-container:active {
        cursor: grabbing;
    }

    /* Ensure Chart.js canvas respects the container size */
    :global(canvas) {
        max-width: 100%;
        max-height: 100%;
    }

    .slider-container {
        margin-top: 25px;
        padding: 10px;
        background-color: var(--forth-color);
        border-radius: 8px;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    /* Style the slider */
    :global(.rangeSlider) {
        --range-handle-size: 20px;
        --range-handle-color: var(--tertiary-color);
        --range-handle-border: 2px solid var(--secondary-color);
        --range-handle-active-bg: var(--primary-color);
        --range-track-height: 6px;
        --range-track-bg: var(--ninth-color);
        --range-range-bg: var(--primary-color);
        height: var(--range-track-height);
        margin-bottom: 5px; /* Adjusted margin */
    }
    :global(.rangeHandle) {
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
    :global(.rangeHandle:focus) {
        box-shadow: 0 0 0 3px rgba(255, 129, 44, 0.5); /* Orange focus like inputs */
    }

    .slider-labels {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: var(--eigth-color);
    }

    .error-message {
        text-align: center;
        padding: 40px;
        color: var(--red-wine);
        background-color: var(--fifth-color);
        border: 1px solid var(--red-wine);
        border-radius: 8px;
    }

    .skeleton-container {
        padding: 15px;
        background-color: var(--forth-color);
        border-radius: 8px;
    }

    .skeleton-chart {
        height: 400px;
        width: 100%;
        background-color: var(--ninth-color);
        opacity: 0.5;
        border-radius: 4px;
        margin-bottom: 25px;
        animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    .skeleton-slider {
        height: 26px; /* Approx height of slider + labels */
        width: 100%;
        background-color: var(--ninth-color);
        opacity: 0.5;
        border-radius: 4px;
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
