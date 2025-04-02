<script>
    import { Line } from "svelte-chartjs";

    import zoomPlugin from "chartjs-plugin-zoom";
    import "chartjs-adapter-date-fns";
    import RangeSlider from "svelte-range-slider-pips";
    import { onMount, onDestroy } from "svelte"; // Import lifecycle functions if needed
    import { getDailyUserRegistrations } from "../../declarations/satellite/satellite.api";
    import UserRegistrationsGraph from "$lib/components/UserRegistrationsGraph.svelte";
</script>

<div class="container">
    <div class="admin-dashboard">
        <h1>Admin Dashboard</h1>

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
    }
</style>
