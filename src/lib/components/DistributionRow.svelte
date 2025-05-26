<script>
    import { ICPtoDecimal } from "$lib/financial_functions/financial_functions";
    import { fade, slide } from "svelte/transition";

    export let type = "";
    export let percentage = 0;
    export let totalAmount = 0;

    /**
     * @type {{
     *   profile_image: string;
     *   username: string;
     *   wallet_id: string;
     *   amount: number;
     * }[]}
     */
    export let users = [];
    export let expanded = false;

    // Calculate the amount based on percentage and total
    $: amount = ((totalAmount * (percentage / 100)) / 100000000).toFixed(3);

    function toggleExpand() {
        expanded = !expanded;
    }

    // @ts-ignore
    function handleKeydown(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleExpand();
        }
    }
</script>

<div
    class="amount-row expandable"
    class:expanded
    on:click={toggleExpand}
    on:keydown={handleKeydown}
    role="button"
    tabindex="0"
>
    <div class="row-header">
        <span class="label">
            <span class="material-symbols-outlined">
                {expanded ? "arrow_drop_down" : "arrow_right"}
            </span>
            {type} ({percentage}%)
        </span>
        <span class="amount">{amount} ICP</span>
    </div>
    {#if expanded}
        <div
            class="expanded-content"
            transition:slide|local={{ duration: 300 }}
        >
            {#each users as user}
                <div
                    class="user-info"
                    in:fade|local={{ duration: 200, delay: 150 }}
                >
                    <a class="user-left" href={`/profile/${user.username}`}>
                        <img
                            src={user.profile_image}
                            alt={user.username}
                            class="user-avatar"
                        />
                        <span>{user.username}</span>
                    </a>
                    <span>{user.amount.toFixed(3)} ICP</span>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .amount-row {
        display: flex;
        flex-direction: column;
        transition: background-color 0.2s ease;
        justify-content: space-between;
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--border-color);
    }

    .expandable {
        cursor: pointer;
    }

    .expandable:hover {
        background-color: transparent;
        border: 1px solid var(--primary-color);
        border-radius: 30px;
    }

    .row-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 8px;
        padding-inline: 0.5rem;
        transition: all 0.2s ease;
    }
    .label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .expandable:hover .row-header {
        background: linear-gradient(
            to right,
            var(--background-hover),
            transparent
        );
    }

    .expandable:hover .amount {
        color: var(--primary-color);
        text-shadow: 0 0 8px var(--primary-color-transparent);
    }

    .expanded-content {
        margin-top: 1rem;
        border-top: 1px solid var(--border-color);
        overflow: hidden;
    }

    .user-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
    }

    .user-left {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .user-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
    }

    .user-avatar:hover {
        transform: translateY(-2px) translateX(-2px);
        box-shadow: 2px 2px 0px 0px var(--seventh-color);
    }

    .user-avatar:active {
        transform: translateY(0) translateX(0);
        box-shadow: 0px 0px 0px 0px var(--seventh-color);
    }

    /* Remove unnecessary styles */
    .user-details,
    .username,
    .wallet,
    .user-amount {
        display: none;
    }

    .amount {
    }
</style>
