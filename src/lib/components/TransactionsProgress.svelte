<script>
    import {
        TransactionsInProgress,
        TransactionsSuccess,
    } from "$lib/stores/other_stores";
    // @ts-ignore
    import { onMount, tick } from "svelte";
    import { FallingConfetti } from "svelte-canvas-confetti";
    import { onDestroy } from "svelte";

    onDestroy(() => {
        if (intervalId) clearInterval(intervalId);
        TransactionsSuccess.set(false);
    });

    let done = false;
    export let percentage = 0;
    let count = 0;
    /**
     * @type {string | number | NodeJS.Timeout | undefined}
     */
    let intervalId;

    function updateProgress() {
        count = percentage;
        if (count > 100) {
            done = true;
            clearInterval(intervalId);
            TransactionsSuccess.set(true);
            TransactionsInProgress.set(false);
        } else {
            const circle = document.querySelector(".circle");
            const radius = 31.831;
            const circumference = 2 * Math.PI * radius;
            // @ts-ignore
            circle.style.strokeDasharray = `${(count / 100) * circumference} ${circumference}`;
            const percentageText = document.querySelector(".percentage");
            // @ts-ignore
            percentageText.textContent = `${count}%`;
        }
    }

    TransactionsInProgress.subscribe((active) => {
        if (active) {
            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(updateProgress, 200);
        } else {
            clearInterval(intervalId);
            count = 0;
        }
    });
</script>

<div class="progress-circle">
    <svg viewBox="0 0 72 72" class="circular-chart">
        <!-- Define a linear gradient -->
        <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                    offset="0%"
                    style="stop-color:var(--primary-color); stop-opacity:1"
                />
                <stop
                    offset="100%"
                    style="stop-color:var(--sixth-color);; stop-opacity:1"
                />
            </linearGradient>
        </defs>
        <path
            class="circle-bg"
            d="M36 4.169
            a 31.831 31.831 0 0 1 0 63.662
            a 31.831 31.831 0 0 1 0 -63.662"
            fill="none"
            stroke="#ececec"
            stroke-width="1.4"
        />
        <path
            class="circle"
            stroke-dasharray="0, 150"
            d="M36 4.169
                a 31.831 31.831 0 0 1 0 63.662
                a 31.831 31.831 0 0 1 0 -63.662"
            fill="none"
            stroke="url(#gradient1)"
            stroke-width="1.9"
        />
        {#if !$TransactionsSuccess}
            <text x="36" y="40.85" class="percentage" style="font-size: medium;"
                >0%</text
            >
        {:else}
            <text
                x="36"
                y="40.85"
                class="percentage"
                style="font-size: x-smaller; line-height:1.5em;">Success!</text
            >

            <!-- <text
                x="36"
                y="36"
                class="material-symbols-outlined"
                style=" fill: green "
            >
                check_circle
            </text> -->
        {/if}
    </svg>
</div>
{#if $TransactionsSuccess}
    <FallingConfetti />
    <FallingConfetti />
    <FallingConfetti />
    <FallingConfetti /><FallingConfetti /><FallingConfetti /><FallingConfetti
    /><FallingConfetti />
{/if}

<style>
    .progress-circle {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 150px;
        height: 150px;
    }

    .circular-chart {
        transform: rotate();
        width: 100%;
        height: 100%;
    }

    .circle {
        transition: stroke-dasharray 0.6s ease;
    }

    .percentage {
        background: linear-gradient(
            to right,
            var(--primary-color),
            var(--red-wine)
        );

        font-size: 0.6em;
        text-anchor: middle;
    }
    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 1,
            "wght" 600,
            "GRAD" 0,
            "opsz" 24;
        color: var(--primary-color);
    }
</style>
