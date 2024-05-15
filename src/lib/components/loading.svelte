<script>
    import { onDestroy, onMount } from "svelte";

    // Variables to keep track of dot animation
    let activeDot = 0;
    let dotStates = [false, false, false];
    let count = 0;
    export let msg = "Data loading";
    export let modal = false;
    export let marginTop = 4;
    export let width = 50;
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
        if (window.innerWidth < 700) {
            width = 90;
        }
    });
    onDestroy(() => {
        modal = false;
    });
</script>

{#if modal}
    <div
        class="loadingBlock"
        style="margin-top: 0px; height:fit-content;min-height: 40vh; display:flex; justify-content:center; align-items:center;  "
    >
        <div class="loadingContent" style="height: 5cm; width:60%;">
            <div class="dots">
                {#each dotStates as dotState, index}
                    <button
                        class="dot"
                        class:move-up={dotState}
                        style="width: 20px; height: 20px;"
                    />
                {/each}
            </div>

            <br />
            <p style="font-style: italic;">{msg}</p>
        </div>
    </div>
{:else}
    <div class="loadingBlock" style="margin-top: {marginTop}cm;">
        <div class="loadingContent" style="width: {width}%;">
            <div class="dots">
                {#each dotStates as dotState, index}
                    <button
                        class="dot"
                        class:move-up={dotState}
                        style="width: 15px; height: 15px;"
                    />
                {/each}
            </div>

            <br />
            <p style="font-style: italic;">{msg}</p>
        </div>
    </div>
{/if}

<style>
    .loadingBlock {
        display: flex;
        justify-content: center;
        width: 100%;
        min-height: 100vh;
        z-index: 0;
        margin-top: 0.52cm;
    }

    .loadingContent {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: white;
        border: 2px solid var(--seventh-color);
        width: 30%;
        height: 7cm;
        box-shadow: 10px 10px 0px rgba(0, 0, 0, 1);
        color: var(--seventh-color);
    }
    @media (max-width: 768px) {
        .loadingContent {
            width: 90%; /* Adjust the width for smaller screens */
            height: 7cm; /* Adjust the height for smaller screens */
            box-shadow: 5px 5px 0px rgba(0, 0, 0, 1); /* Adjust the box-shadow for smaller screens */
        }
        .loadingBlock {
            display: flex;
            justify-content: center;
            width: 100%;
            margin-top: 2cm;
            min-height: 100vh;
            z-index: 0;
        }
    }
    .dots {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        margin-top: 1cm;
    }
    .dot {
        border-radius: 50%;
        background-color: azure;
        box-shadow: 2px 2px 0px 0px var(--seventh-color);
        border: 1.5px solid black;
        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        transform: translateY(0);
        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
    }

    /* Define the final state (dots moved upward) */
    .dot.move-up {
        transform: translateY(-40px);
    }
</style>
