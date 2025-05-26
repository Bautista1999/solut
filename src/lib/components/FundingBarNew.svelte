<script>
    // No need for onMount unless doing specific mount actions
    // import { onMount } from "svelte";

    // Input props
    export let approved = 100000;
    export let card = false; // Keep the card prop
    export let total = 1200000;
    approved = 0.5;
    // $: automatically recalculates when approved or total changes
    // Clamp percentage between 0 and 100
    $: percentage =
        total > 0 ? Math.min(100, Math.max(0, (approved / total) * 100)) : 0;
    $: exp = formatNumber(approved);
    $: tot = formatNumber(total);

    /**
     * @param {number} num
     * Formats numbers into K/M format.
     */
    function formatNumber(num) {
        if (num < 1000) {
            return num.toString();
        } else if (num < 1000000) {
            const thousands = num / 1000;
            // Format with 0 or 1 decimal place
            return (
                thousands.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: thousands % 1 === 0 ? 0 : 1,
                }) + "K"
            );
        } else {
            const millions = num / 1000000;
            // Format with 0 or 1 decimal place
            return (
                millions.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: millions % 1 === 0 ? 0 : 1,
                }) + "M"
            );
        }
    }
</script>

{#if card}
    <!-- Card Variant: Simpler, smaller bar -->
    <div
        class="funding-bar card-bar"
        title={`Approved: ${exp} ICP / Total: ${tot} ICP`}
    >
        <div class="progress" style="width: {percentage}%;">
            <!-- No text in card variant for cleaner look -->
        </div>
    </div>
{:else}
    <!-- Default Variant: More detailed -->
    <div class="funding-bar default-bar">
        <div class="progress" style="width: {percentage}%;">
            {#if percentage > 5}
                <span class="progress-text-inside">Approved: {exp} ICP</span>
            {/if}
        </div>
        {#if percentage < 100}
            <span class="total-text-outside">Total: {tot} ICP</span>
        {/if}
    </div>
{/if}

<style>
    @keyframes shimmer {
        0% {
            background-position: -400px 0;
        }
        100% {
            background-position: 400px 0;
        }
    }

    .funding-bar {
        display: flex;
        align-items: center;
        position: relative;
        width: 100%;
        background-color: var(--tertiary-color);
        border-radius: 8px; /* Pill shape */
        border: 1px solid var(--ninth-color, #b9b9b9);
        overflow: hidden;
        box-sizing: border-box;
    }

    .default-bar {
        height: 50px;
    }

    .card-bar {
        height: 10px; /* Make card bar much thinner */
        border-radius: 8px;
    }

    .progress {
        height: 100%;
        /* Gradient Fill */
        background: var(--primary-color);
        /* Shimmer Animation */
        background-size: 800px 100%; /* Make size larger than element for movement */

        border: 2px solid var(--tenth-color);
        border-radius: 8px; /* Match parent for pill shape */
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding-left: 5px; /* More padding */
        box-sizing: border-box;
        transition: width 0.5s ease-out;
        min-width: 1px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Ensure progress radius is flat on right when full */
    .progress[style*="width: 100%"] {
        border-radius: 8px;
    }
    /* Ensure progress radius is flat on left when empty (optional, depends on look) */
    .progress[style*="width: 0%"] {
        /* border-radius: 0 15px 15px 0; */ /* might look odd */
    }

    .card-bar .progress {
        animation: none; /* Disable animation on simple card bar */
        background: var(
            --primary-color,
            #ff812c
        ); /* Solid color for card bar */
        border-radius: 8px; /* Match card bar radius */
    }

    .progress-text-inside {
        color: var(--tertiary-color, white);
        background-color: var(--tenth-color);
        padding: 4px 8px;
        border-radius: 8px;
        position: absolute;
        font-size: 16px;
        font-weight: 500; /* Slightly bolder */
    }

    .total-text-outside {
        position: absolute;
        right: 12px; /* More padding */
        margin-right: 5px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--tertiary-color, #2d2d2d);
        background-color: var(--tenth-color);
        padding: 4px 8px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        white-space: nowrap;
    }

    /* Responsive Adjustments */
    @media (max-width: 480px) {
        .default-bar {
            height: 50px;
            border-radius: 8px;
        }
        .progress {
            border-radius: 8px;
        }
        .progress-text-inside,
        .total-text-outside {
            font-size: 16px;
        }
        .total-text-outside {
            right: 0px;
        }
        .card-bar {
            height: 8px;
            border-radius: 8px;
        }
        .card-bar .progress {
            border-radius: 8px;
        }
    }
</style>
