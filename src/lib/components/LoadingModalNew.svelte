<script>
    import MagicalDotsAbsoluteSmall from "./MagicalDotsAbsoluteSmall.svelte";
    export let message = "";
    export let color = "var(--seventh-color)";
</script>

<div style=" text-align:center; padding:15px;">
    <MagicalDotsAbsoluteSmall />
    <br />
    <p style="font-size: larger; font-style:italic; color:{color};">
        {message}
    </p>
</div>
