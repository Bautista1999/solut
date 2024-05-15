<script>
    import {
        FallingConfetti,
        ConfettiBurst,
        ConfettiCannon,
        random,
    } from "svelte-canvas-confetti";
    import { tick } from "svelte";

    export const makeFallingConfetti = async () => {
        fallingConfetti = false;
        await tick();
        fallingConfetti = true;
    };

    export const makeConfettiBurst = async () => {
        confettiBurst = false;
        await tick();
        confettiBurst = true;
    };

    export const makeConfettiCannon = async () => {
        confettiCannon = false;
        await tick();
        confettiCannon = true;
    };

    let fallingConfetti = false;
    let confettiBurst = false;
    let confettiCannon = false;
</script>

<main>
    <button on:click={makeFallingConfetti}> Falling Confetti! </button>
    <button on:click={makeConfettiBurst}> Confetti Burst! </button>
    <button on:click={makeConfettiCannon}> Confetti Cannon! </button>
</main>

{#if fallingConfetti}
    <FallingConfetti />
{/if}
{#if confettiBurst}
    <ConfettiBurst
        origin={[
            random((window.innerWidth / 4) * 3, window.innerWidth / 4),
            random((window.innerHeight / 4) * 3, window.innerHeight / 4),
        ]}
    />
{/if}
{#if confettiCannon}
    <ConfettiCannon
        origin={[window.innerWidth / 2, window.innerHeight]}
        angle={-90}
        spread={35}
        force={35}
    />
{/if}

<style>
    main {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    button {
        cursor: pointer;
        border: none;
        border-radius: 4px;
        padding: 0.75rem 2rem;
        margin: 1rem;
        font-weight: bold;
        font-size: 1rem;
        font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS",
            sans-serif;
        color: white;
        background: linear-gradient(
            -45deg,
            hsl(260, 95%, 75%),
            hsl(300, 95%, 75%)
        );
        box-shadow: 5px 5px 0 0 rgba(0, 0, 0, 0.8);
        text-shadow: -1px -1px rgba(0, 0, 0, 0.6);
        transition:
            transform 0.1s ease-in-out,
            box-shadow 0.1s ease-in-out;
    }

    button:hover {
        background: linear-gradient(
            -45deg,
            hsl(260, 95%, 65%),
            hsl(300, 95%, 65%)
        );
    }

    button:active {
        transform: translate(2px, 2px);
        box-shadow: 3px 3px 0 0 rgba(0, 0, 0, 0.8);
    }
</style>
