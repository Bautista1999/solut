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
</script>

{#if card}
    <div class="barra" style="width: 95%;">
        <div
            class="progreso"
            style="width: {75}%; height:20px; font-size:small; color:var(--secondary-color); font-weight:400;"
        >
            Expected: {exp} USD
        </div>
        {#if window.innerWidth < 500}
            <div class="progreso2"></div>
        {:else}
            <div class="progreso2" style="font-size:small;">
                {tot}
            </div>
        {/if}
    </div>
{:else}
    <div class="barra">
        <div class="progreso" style="width: {75}%;">
            Expected: {exp} USD
        </div>
        {#if window.innerWidth < 500}
            <div class="progreso2"></div>
        {:else}
            <div class="progreso2">
                Total: {tot} USD
            </div>
        {/if}
    </div>
{/if}

<style>
    .barra {
        width: 100%;
        height: fit-content;
        padding: 4px;
        display: flex; /* Convertimos la barra en un contenedor flex */
        align-items: center; /* Alineación vertical en el centro */
        background-color: var(--secondary-color);
        border-radius: 2px;
        overflow: visible;
        border-bottom-left-radius: 40px;
        border-top-right-radius: 40px;
        font-size: small;
    }
    .progreso {
        height: 25px;
        background: linear-gradient(to right, orange, orangered);
        margin-left: 5px;
        display: flex;
        align-items: center; /* Vertical alignment */
        justify-content: center; /* Horizontal alignment */
        font-size: larger;
        font-weight: 450;
        border-radius: 2px;
        border-bottom-left-radius: 40px;
        border-top-right-radius: 40px;
    }
    .progreso2 {
        flex: 1; /* Ocupará todo el espacio restante después del div progreso */
        display: flex;
        align-items: center; /* Alineación vertical en el centro */
        justify-content: center; /* Alineación horizontal al centro */
        text-align: center; /* Centra el texto dentro de cada elemento hijo si es necesario */
        color: rgb(255, 140, 17);
        border-color: #e0e0e0;
        border-width: 10px;
        font-size: larger;
    }
</style>
