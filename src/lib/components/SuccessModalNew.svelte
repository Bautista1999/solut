<script>
    import { FallingConfetti } from "svelte-canvas-confetti";
    export let message = "";
</script>

<div
    style=" text-align:center; color: var(--tertiary-color);  background:linear-gradient(to right, var(--primary-color), var(--red-wine)); padding:15px;"
>
    <p style="font-size: larger; ">Success!</p>
    <br />
    <p>{message}</p>
    <FallingConfetti />
    <FallingConfetti />
    <FallingConfetti />
    <FallingConfetti /><FallingConfetti /><FallingConfetti /><FallingConfetti
    /><FallingConfetti />
</div>
