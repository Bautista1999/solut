<script>
    import { onDestroy, onMount } from "svelte";

    // Variables to keep track of dot animation
    let activeDot = 0;
    let dotStates = [false, false, false];
    let count = 0;
    export let msg = "Data loading";
    export let modal = false;
    export let marginTop = 4;
    export let width = 30;
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

{#if modal}
    <div
        class="loadingBlock"
        style="margin-top: 0px; height:fit-content;min-height: 40vh; display:flex; justify-content:center; align-items:center;  "
    >
        <div class="loadingContent" style="height: 5cm; width:70%;">
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
                        style="width: 20px; height: 20px;"
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
        margin-top: 4cm;
    }

    .loadingContent {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: white;
        border-color: black;
        border-width: 2px;
        width: 30%;
        height: 7cm;
        box-shadow: 10px 10px 0px rgba(0, 0, 0, 1);
        color: rgb(0, 91, 91);
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
            margin-top: 5cm;
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
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: azure;
        box-shadow: 0px 5px 5px rgba(0, 0, 0, 0.5);
        border: 1px solid black;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        transform: translateY(0);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    /* Define the final state (dots moved upward) */
    .dot.move-up {
        transform: translateY(-40px);
    }
</style>
