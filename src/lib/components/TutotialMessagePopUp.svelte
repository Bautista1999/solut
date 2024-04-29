<script>
    import BasicButtonSkyBlueSmall from "./BasicButton_SkyBlue_Small.svelte";
    export let title = "Title";
    export let message = "Message";
    export let closeMessage = "Close";
    export let closeTooltip = () => {};
    export let note = "";
    export let topPercentage = 50;
    export let rightPercentage = 50;
</script>

<div class="tooltip" style=" top:{topPercentage}%;right:{rightPercentage}%">
    <div
        style="display: flex;align-items:center; gap: 10px;margin-top: 0px;  height:fit-content;"
    >
        <h4 style="margin-top: 0px;margin-bottom: 0px;">
            {title}
        </h4>
        <span
            class="material-symbols-outlined"
            style="margin-top: 0px; align-self:flex-start;"
        >
            help
        </span>
    </div>
    <p>{message}</p>
    {#if note != ""}
        <p>
            <span style="font-style: italic; font-weight:600;">NOTE: </span>
            {note}
        </p>
    {/if}

    <BasicButtonSkyBlueSmall msg={closeMessage} someFunction={closeTooltip} />
</div>

<style>
    .tooltip {
        position: absolute;

        padding: 20px;
        color: var(--seventh-color);
        background-color: var(--tertiary-color);
        border: 1px solid var(--sky-blue);
        border-radius: 8px;
        box-shadow: 6px 6px 0px 0px var(--sky-blue);
        display: flex;
        align-items: left;
        justify-content: left;
        flex-direction: column;
        gap: 10px;
        z-index: 100;
        max-width: 20%;
    }
</style>
