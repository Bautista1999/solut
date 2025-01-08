<script>
    import { onDestroy, onMount } from "svelte";
    import Chart from "chart.js/auto";

    // Props
    export let title = "";
    export let xAxisLabel = "";
    export let yAxisLabel = "";
    /**
     * @type {never[]}
     */
    export let xData = [];
    /**
     * @type {never[]}
     */
    export let yData = [];

    /**
     * @type {HTMLCanvasElement}
     */
    let canvas;
    /**
     * @type {Chart<"line", any[], any>}
     */
    let chart;

    onMount(() => {
        const ctx = canvas.getContext("2d");

        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: xData,
                datasets: [
                    {
                        label: title,
                        data: yData,
                        borderColor: "rgb(75, 192, 192)",
                        tension: 0.1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: xAxisLabel,
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: yAxisLabel,
                        },
                    },
                },
            },
        });
    });

    // Cleanup on component destruction
    onDestroy(() => {
        if (chart) {
            chart.destroy();
        }
    });
</script>

<div class="graph-container">
    <canvas bind:this={canvas}></canvas>
</div>

<style>
    .graph-container {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
    }
</style>
