<script>
    import { onMount } from "svelte";

    export let expected = 100000;
    export let card = false;
    let exp = formatNumber(expected);
    export let total = 1200000;
    let tot = formatNumber(total);
    onMount(() => {});
    /**
     * @param {number} num
     */
    function formatNumber(num) {
        if (num < 1000) {
            return num.toString();
        } else if (num < 1000000) {
            return (num / 1000).toFixed(num % 1000 !== 0 ? 1 : 0) + "K";
        } else {
            return (num / 1000000).toFixed(num % 1000000 !== 0 ? 1 : 0) + "M";
        }
    }
    let percentage = 75;
    let defaultMin = card === true ? 40 : 40;
    let defaultMax = 80;
    function getBarPercentage() {
        if (total == 0) {
            return 50;
        }
        let perc = (expected / total) * 100;
        if (perc < 20) {
            return defaultMin;
        } else if (perc == 100) {
            return 100;
        } else if (perc > 80) {
            return defaultMax;
        } else {
            return perc;
        }
    }
</script>

{#if card}
    <div class="bar" style="width: 95%;">
        <div
            class="progress"
            style="width: {getBarPercentage()}%; height:20px; font-size:small; color:var(--tertiary-color); font-weight:400;"
        >
            {exp} ICP
        </div>
        {#if window.innerWidth < 500}
            <div class="progress2"></div>
        {:else}
            <div class="progress2" style="font-size:small;">
                {tot}
            </div>
        {/if}
    </div>
{:else}
    <div class="bar">
        <div
            class="progress"
            style="width: {getBarPercentage()}%; color:var(--tertiary-color); text-align:center; font-size:small "
        >
            Expected: {exp} ICP
        </div>
        {#if window.innerWidth < 500}
            <div class="progress2" style="text-align:center; font-size:small ">
                Total: {tot} ICP
            </div>
        {:else if getBarPercentage() == 100}
            <div class="progress2"></div>
        {:else}
            <div class="progress2">
                {tot} ICP
            </div>
        {/if}
    </div>
{/if}

<style>
    .bar {
        width: 100%;
        height: fit-content;
        padding: 0px;
        display: flex; /* Convertimos la barra en un contenedor flex */
        align-items: center; /* Alineación vertical en el centro */
        justify-content: center;
        background-color: var(--tertiary-color);
        border-radius: 4px;
        overflow: visible;
        border: 1px solid var(--seventh-color);
        font-size: small;
        height: 35px;
    }
    .progress {
        height: 35px;
        background: linear-gradient(to right, orange, orangered);
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        font-size: larger;
        font-weight: 450;
        border-radius: 2px;
    }
    .progress2 {
        flex: 1; /* Ocupará todo el espacio restante después del div progreso */
        display: flex;
        align-items: center; /* Alineación vertical en el centro */
        justify-content: center; /* Alineación horizontal al centro */
        text-align: center; /* Centra el texto dentro de cada elemento hijo si es necesario */
        color: var(--seventh-color);
        border-color: #e0e0e0;
        border-width: 10px;
        font-size: larger;
    }
</style>
