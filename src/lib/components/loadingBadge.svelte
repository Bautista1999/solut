<script>
    import { onMount } from "svelte";
    import MagicalDots from "./magicalDots.svelte";

    export let msg = "Data loading";
    onMount(async () => {});
</script>

<div class="project">
    <MagicalDots />
    <br />
    <p>{msg}</p>
</div>

<style>
    .project {
        width: 10cm;
        height: 14cm;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: antiquewhite;
        color: darkslategray;
        border-color: black;
        border-width: 2px;
        box-shadow: 10px 10px 0px rgb(0, 0, 0, 0.5);
    }
    @media (max-width: 768px) {
        .project {
            width: 8cm;
            height: 14cm;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: antiquewhite;
            color: darkslategray;
            border-color: black;
            border-width: 2px;
            box-shadow: 10px 10px 0px rgb(0, 0, 0, 0.5);
        }
    }
</style>
