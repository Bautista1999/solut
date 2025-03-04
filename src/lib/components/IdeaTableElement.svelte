<script>
    import { title } from "$lib/data_objects/testing_objects";
    import { itemExists_General } from "$lib/other_functions/other.functions";
    import { getDoc } from "@junobuild/core-peer";
    import ElementHoveredTable from "./ElementHoveredTable.svelte";

    /**
     * @type {import("../../declarations/satellite/satellite.did").IndexResponseBasicInfo | import("../../declarations/satellite/satellite.did").IndexResponseBasicInfo[] | string}
     */
    export let value;

    /**
     * @type {any}
     */
    export let row;

    // Determine if we're displaying an idea or feature based on the accessor
    $: isIdea = row && value === row.idea_title;
    $: isFeature = row && value === row.feature_title;

    // Get the actual object to display
    $: displayValue = isIdea ? row.idea : isFeature ? row.feature : value;

    // For hover functionality
    let showHover = false;
    let hoverElement;
    /**
     * @type {"idea" | "feature" | ""}
     */
    let hoverType = "";
    let hoverId = "";
    let hoverX = 0;
    let hoverY = 0;

    // Handle mouse events
    /**
     * @param {MouseEvent} event
     */
    function handleMouseEnter(event) {
        // Capture mouse position for hover positioning
        hoverX = event.clientX;
        hoverY = event.clientY;

        if (isIdea && row.idea?.element_id) {
            hoverType = "idea";
            hoverId = row.idea.element_id;
            showHover = true;
            console.log("Showing idea hover:", hoverId);
        } else if (isFeature && row.feature?.[0]?.element_id) {
            hoverType = "feature";
            hoverId = row.feature[0].element_id;
            showHover = true;
            console.log("Showing feature hover:", hoverId);
        } else {
            console.log("No valid id found for hover", {
                isIdea,
                isFeature,
                row,
                featureData: row.feature?.[0],
                ideaData: row.idea,
            });
        }
    }

    function handleMouseLeave() {
        showHover = false;
    }

    $: typeLink =
        hoverType === "idea"
            ? "topic"
            : hoverType === "feature"
              ? "idea"
              : "unknown";
</script>

<a
    class="hover-wrapper"
    role="button"
    tabindex="0"
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    href={`/${typeLink}/${hoverId}`}
>
    {#if Array.isArray(displayValue)}
        {#each displayValue as item}
            {#if item.title && item.title.length > 50}
                {item.title.slice(0, 40)}...
            {:else if item.title}
                {item.title}
            {/if}
        {/each}
    {:else if typeof displayValue === "string"}
        {#if displayValue.length > 70}
            {displayValue.slice(0, 70)}...
        {:else}
            {displayValue}
        {/if}
    {:else if displayValue && displayValue.title}
        {#if displayValue.title.length > 70}
            {displayValue.title.slice(0, 70)}...
        {:else}
            {displayValue.title}
        {/if}
    {:else}
        N/A
    {/if}

    {#if showHover && (hoverType === "idea" || hoverType === "feature") && hoverId}
        <div
            class="hover-container"
            bind:this={hoverElement}
            style="left: {hoverX}px; top: {hoverY + 20}px;"
        >
            <ElementHoveredTable type={hoverType} id={hoverId} />
        </div>
    {/if}
</a>

<style>
    .hover-wrapper {
        position: relative;
        cursor: pointer;
    }

    .hover-container {
        position: fixed;
        z-index: 9999;
        /* No top/left as we'll set it dynamically */
        animation: fadeIn 0.2s ease forwards;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
