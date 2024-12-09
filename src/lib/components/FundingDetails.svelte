<script>
    import { createEventDispatcher } from "svelte";
    import UsersOverview from "./usersOverview.svelte";

    // Props
    export let element_id = "";
    export let amount_pledged = 0;
    export let amount_peldgers = 0;
    export let amount_expected = 0;
    export let element_type = "topic"; // Default: "topic" or "idea"
    /**
     * @type {import("$lib/data_objects/data_types").UserProfilePic[]}
     */
    export let users = []; // Array of { key, image }

    let expanded = false;
    const dispatch = createEventDispatcher();

    function toggleExpand() {
        expanded = !expanded;
        dispatch("toggle", { expanded });
    }
</script>

<div class="funding-section">
    <!-- Placeholder for pledgers' images -->
    <div class="pledgers">
        <UsersOverview {users} />
    </div>

    <div class="funding-info">
        <div class="amount">{amount_pledged} ICP</div>
        <div class="label">Total Contributions So Far</div>
    </div>
</div>
<button class="expand-button" on:click={toggleExpand}>
    {#if !expanded}
        <span class="material-symbols-outlined"> keyboard_arrow_down </span> Expand
        to see funding details
    {:else}
        <span class="material-symbols-outlined"> keyboard_arrow_up </span> Close
        to see less funding details
    {/if}
</button>

<div class="details {expanded ? 'visible' : ''}">
    <div class="detail-row">
        Total pledged: {amount_pledged} ICP
    </div>
    <div class="detail-row">
        Expected payout:
        {amount_expected} ICP
    </div>
    <div class="detail-row">
        Pledgers: {users.length}
    </div>
</div>

<style>
    /* Component Wrapper */
    .funding-section {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        padding: 10px;
        /* border: 1px solid var(--primary-color); */
        border-radius: 8px;

        /* background-color: var(--tertiary-color); */
        background: linear-gradient(to right, orange, orangered);

        transition: box-shadow 0.3s ease;
    }

    .funding-section:hover {
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }

    /* Pledgers Overview */
    .pledgers {
        width: 20%;
        max-width: 30%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Funding Information Section */
    .funding-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .amount {
        font-size: 1.8rem;
        font-weight: bold;
        color: var(--tertiary-color);
    }

    .label {
        font-size: 1rem;
        color: var(--tertiary-color);
    }

    /* Expand Button */
    .expand-button {
        display: flex;
        align-items: center;
        font-size: 0.9rem;
        font-family: "Barlow";
        color: var(--primary-color);
        background: none;
        border: none;
        cursor: pointer;
        outline: none;
        transition:
            color 0.3s ease,
            font-weight 0.3s ease;
    }
    .expand-button:hover {
        color: orangered;
        font-weight: 450;
    }

    /* Details Section */
    .details {
        overflow: hidden;
        max-height: 0;
        opacity: 0;

        border-radius: 8px;
        transition:
            max-height 0.3s ease,
            padding 0.3s ease,
            opacity 0.3s ease;
    }
    .details.visible {
        max-height: 100px; /* Adjust based on content */
        padding: 10px;
        background-color: var(--tertiary-color);
        opacity: 1;
    }

    .detail-row {
        font-size: 0.9rem;
        display: flex;
        line-height: 1.5;
    }
</style>
