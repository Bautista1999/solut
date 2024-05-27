<script>
    import MagicalDotsAbsoluteSmall from "./MagicalDotsAbsoluteSmall.svelte";
    export let message = "";
</script>

<div style=" text-align:center; padding:15px;">
    <MagicalDotsAbsoluteSmall />
    <br />
    <p style="font-size: larger; font-style:italic;">{message}</p>
</div>
