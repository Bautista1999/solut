<script>
    import { fly } from "svelte/transition";
    import { cubicOut } from "svelte/easing";

    import { tweened } from "svelte/motion";
    import { onMount } from "svelte";
    import { UserKey } from "$lib/stores/other_stores";

    export let msg = "Label";
    export let icon = "close";

    export let title = "Modal Title";
    export let description = "This is a sample description for the modal.";
    export let videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ";
    export let learnMoreLink = "";
    export let NotSignedInCondition = false;
    export let minimumWidth = 200;

    $: isModal = false;

    // Tweened dimensions for smooth transformation
    let width = tweened(minimumWidth, { duration: 500, easing: cubicOut });
    let height = tweened(50, { duration: 500, easing: cubicOut });
    let minheight = tweened("fit-content", { duration: 500, easing: cubicOut });
    let minwidth = tweened("fit-content", { duration: 500, easing: cubicOut });
    let borderRadius = tweened(50, { duration: 500, easing: cubicOut });

    $: display = true;
    // Fixed the issue: Ensure the `tweened` values are unsubscribed when used directly
    $: currentWidth = $width;
    $: currentHeight = $height;
    $: currentBorderRadius = $borderRadius;
    $: currentMinHeight = $minheight;
    $: currentMinWidth = $minwidth;

    onMount(() => {
        if (NotSignedInCondition == true) {
            if ($UserKey != "") {
                display = false;
            }
        }
    });

    function toggleModal() {
        if (isModal) {
            // Shrink back to initial dimensions
            width.set(minimumWidth); // Reset width to be dynamic
            height.set(50);
            borderRadius.set(50);

            // Remove event listeners
            // @ts-ignore
            document.removeEventListener("click", handleOutsideClick);
            document.removeEventListener("keydown", handleEscapeKey);
        } else {
            // Expand into modal dimensions
            if (window.innerWidth > 700) {
                width.set(600);
            } else {
                width.set(400);
            }
            height.set(450);
            borderRadius.set(12);

            // Add event listeners
            setTimeout(() => {
                // Delay adding listeners to ensure modal is fully open
                // @ts-ignore
                document.addEventListener("click", handleOutsideClick);
                document.addEventListener("keydown", handleEscapeKey);
            }, 10); // Small delay to prevent immediate closing
        }
        isModal = !isModal;
    }

    /**
     * @param {{ target: Node | null; stopPropagation: () => void; }} event
     */
    function handleOutsideClick(event) {
        const modal = document.querySelector(".transform-box");
        if (modal && modal.contains(event.target)) {
            event.stopPropagation(); // Prevent the click from propagating to the document
            return;
        }
        toggleModal(); // Close the modal if the click happens outside
    }

    /**
     * @param {{ key: string; }} event
     */
    function handleEscapeKey(event) {
        if (event.key === "Escape" || event.key === "Esc") {
            toggleModal();
        }
    }
</script>

<!-- {#if display} -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class="transform-box"
    style="display:{display
        ? ''
        : 'none'};width: {currentWidth}px;min-height:{currentMinHeight} ;height: {currentHeight}px; border-radius: {currentBorderRadius}px;"
    on:click={toggleModal}
    in:fly={{ y: -200, duration: 1000, easing: cubicOut, delay: 1000 }}
>
    {#if isModal}
        <div class="modal-content">
            <h2 style="margin: 0; color:var(--primary-color)">{title}</h2>
            <p style="">{description}</p>
            <iframe
                src={videoUrl}
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
            ></iframe>
            <!-- <FlatButtonSmall msg="Learn more" icon="chevron_right" /> -->
            <a
                class="learnMoreButton"
                href={learnMoreLink}
                on:click={(event) => {
                    event.stopPropagation();
                }}
            >
                Learn more
                <span class="material-symbols-outlined">{"chevron_right"}</span>
            </a>
            <button class="closeModalButton">
                <span class="material-symbols-outlined"
                    >{"keyboard_arrow_up"}</span
                >
            </button>
        </div>
    {:else}
        <div class="button">
            {msg}
            <span
                class="material-symbols-outlined closeButton"
                on:click={() => {
                    display = false;
                }}>{icon}</span
            >
        </div>
    {/if}
</div>

<!-- {/if} -->

<style>
    .learnMoreButton {
        width: fit-content;
        height: fit-content;
        padding-inline: 15px;
        padding-block: 5px;
        border: none;
        font-size: medium;
        background-color: transparent;
        color: var(--primary-color);
        border: 1px solid var(--primary-color);
        transition:
            background-color 0.3s ease,
            transform 0.1s ease,
            /* Smooth transitions for background color and transforming */
                box-shadow 0.1s ease; /* Adding transition for box-shadow */
        cursor: pointer;
        font-family: Barlow;
        display: flex; /* Set the display to flex to enable flexbox properties */
        flex-direction: row; /* Align children in a row (horizontal alignment) */
        justify-content: center; /* Horizontally center the items in the container */
        align-items: center; /* Vertically align the items in the middle */
        gap: 5px;
        border-radius: 8px;
        text-decoration: none;
    }
    .learnMoreButton:hover {
        border: 1px solid var(--primary-color);
        background-color: rgba(255, 255, 255, 0.1);
        color: var(--primary-color);
    }

    .transform-box {
        left: 50%;
        position: fixed;
        z-index: 1000;
        transform: translate(-50%, 0);
        background-color: var(--seventh-color);
        box-shadow: 4px 4px 0px 0px var(--primary-color);
        color: var(--tertiary-color);
        border: 2px solid var(--primary-color);
        overflow: hidden;
    }

    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 48;
        /* border: 1px solid var(--tertiary-color);
        color: var(--tertiary-color); */
    }
    .closeButton:hover {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 48;
        border: 1px solid var(--tertiary-color);
        background-color: var(--tertiary-color);
        color: var(--primary-color);
        border-radius: 50%;
        right: 0;
    }

    @keyframes shine {
        from {
            background-position: 0% 0%;
        }
        to {
            background-position: -200% 0%;
        }
    }

    .button {
        padding-inline: 15px;
        padding-block: 13px;

        background: linear-gradient(
            110deg,
            rgba(255, 255, 255, 0) 45%,
            /* Fully transparent */ rgba(255, 255, 255, 0.4) 60%,
            /* Very subtle shine */ rgba(255, 255, 255, 0) 55%
                /* Fades back to transparent */
        );
        background-size: 200% 100%; /* Allows animation to slide */
        animation: shine 2s linear infinite; /* Shine animation */
        transition:
            background-color 0.3s ease,
            transform 0.1s ease,
            box-shadow 0.1s ease;
        cursor: pointer;
        font-size: large;
        font-family: Barlow;
        display: flex;
        justify-content: space-evenly;
        flex-direction: row;
        align-items: center;
        border-radius: 50px;
        gap: 5px;
        color: var(--primary-color);
    }
    /* .button:hover {
        background-color: var(--seventh-color);
        color: var(--primary-color);
        border-radius: 50px;
        border-color: 2px solid var(--primary-color) !important;
        box-shadow: 4px 4px 0px 0px var(--primary-color);
    } */
    /* .transform-box:hover {
        background-color: var(
            --seventh-color
        ); 
        color: var(--primary-color); 
        border-color: var(--primary-color);
        box-shadow: 4px 4px 0px 0px var(--primary-color);
    }
    .transform-box:active {
        box-shadow: 0px 0px 0px 0px var(--primary-color);
    } */

    .closeModalButton {
        border: 1px solid var(--primary-color);
        background-color: transparent;
        border-radius: 8px;
        color: var(--primary-color);
        font-size: larger;
    }

    .closeModalButton:hover {
        border: 1px solid var(--primary-color);
        background-color: rgba(255, 255, 255, 0.1);
        color: var(--primary-color);
        cursor: pointer;
    }
    .modal-content {
        display: flex;
        flex-direction: column;
        padding: 20px;
        gap: 10px;
    }

    .modal-content iframe {
        width: 100%;
        max-width: 560px;
        height: 315px;
        border-radius: 8px;
        border: none;
    }

    @media (max-width: 768px) {
        .modal-content {
            padding: 15px;
        }

        .modal-content h2 {
            font-size: 20px;
        }

        .modal-content p {
            font-size: 14px;
        }

        .modal-content iframe {
            max-width: 100%;
            height: 200px;
        }
    }

    @media (max-width: 480px) {
    }
</style>
