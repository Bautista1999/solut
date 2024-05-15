<!-- StatsItem.svelte -->
<script>
    export let label;
    export let count;
    export let icon;
</script>

<div class="stat">
    <span class="material-symbols-outlined icon">{icon}</span>
    <h3 class="count">{count}</h3>
    <p class="label">{label.split(" ")[0]}<br />{label.split(" ")[1]}</p>
</div>

<style>
    .stat {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--tertiary-color);
        border: 2px solid var(--seventh-color);
        box-shadow: 4px 4px 0px 0px var(--seventh-color); /* Light orange shadow */
        color: var(--seventh-color);
        text-align: center;
        padding: 20px;
        transition: transform 0.3s ease;
        gap: 10px; /* Space between elements */
    }

    .icon {
        font-size: 2.4em;
        color: var(--seventh-color);
    }

    .count {
        font-size: 2.4em;
        font-weight: normal;
        color: var(--seventh-color);
        margin: 0;
    }

    .label {
        margin: 0;
        white-space: nowrap;
        text-align: left;
    }

    @media (max-width: 768px) {
        .stat {
            flex-direction: column;
        }
    }
</style>
