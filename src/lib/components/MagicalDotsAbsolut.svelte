<script>
    import { onDestroy, onMount } from "svelte";

    // Variables to keep track of dot animation
    let activeDot = 0;
    let dotStates = [false, false, false];
    let count = 0;
    export let msg = "Data loading";
    export let modal = false;
    // Function to animate the dots
    async function animateDots() {
        if (activeDot == 0 && count == 3) {
            count = 0;
            dotStates[2] = false;
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve("");
                }, 1500); // Wait for 1 second before resolving
            });
        }
        // Reset all dots to their original state
        dotStates = [false, false, false];
        // Set the active dot to move up
        dotStates[activeDot] = true;

        // Move to the next dot in sequence
        activeDot = (activeDot + 1) % 3;
        count++;

        setTimeout(() => {
            // After the delay, call animateDots again
            animateDots();
        }, 180); // Adjust the delay as needed
    }

    // After each cycle of animations (all three dots moved), add a delay before starting again
    async function startNextCycle() {
        await setTimeout(() => {
            activeDot = 0; // Reset the active dot to the first dot
            animateDots(); // Start the next cycle
        }, 0); // Adjust the delay before starting the next cycle as needed (1 second in this case)
    }

    // Call startNextCycle initially to start the first cycle
    onMount(() => {
        startNextCycle();
    });
    onDestroy(() => {
        modal = false;
    });
</script>

<div class="dots">
    {#each dotStates as dotState, index}
        <div class="dot" class:move-up={dotState} style="" />
    {/each}
</div>

<style>
    .dots {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        right: 0px;
        z-index: 3000;
    }
    .dot {
        width: 17px;
        height: 17px;
        border-radius: 50%;
        background-color: var(--tertiary-color);
        box-shadow: 0px 4px 0px 0px var(--primary-color);
        border: 1px solid var(--primary-color);
        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        transform: translateY(0);
    }

    /* Define the final state (dots moved upward) */
    .dot.move-up {
        transform: translateY(-40px);
        box-shadow: 0px 16px 0px 0px orangered;
    }

    @media (max-width: 480px) {
        .dot {
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background-color: var(--tertiary-color);
            box-shadow: 0px 4px 0px 0px var(--primary-color);
            border: 1px solid var(--primary-color);
            transition:
                transform 0.3s ease,
                box-shadow 0.3s ease;
            transform: translateY(0);
        }
    }
</style>
