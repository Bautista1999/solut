<script>
    import UnderConstruction from "$lib/components/UnderConstruction.svelte";
    import TableForPledges from "$lib/components/TableForPledges.svelte";
    import { UserKey } from "$lib/stores/other_stores";
    import { onMount } from "svelte";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import { path } from "$lib/stores/redirect_store";
    import { getUserActivePledgesEnriched } from "../../declarations/satellite/satellite.api";
    /**
     * @type {import("../../declarations/satellite/satellite.did").EnrichedPledgeData[]}
     */
    let pledges = [];
    onMount(async () => {
        if (!(await CheckIfSignedIn())) {
            alert("You are not signed in");
            path.set("/mypledges");
            window.location.href = "/signin";
            return;
        }

        const activePledges = await getUserActivePledgesEnriched($UserKey);
        console.log(activePledges);
        if ("Ok" in activePledges) {
            pledges = activePledges.Ok;
        }
    });
</script>

<!-- <UnderConstruction /> -->

<div class="ideas-container">
    <h1>My Pledges</h1>
    {#if pledges.length === 0}
        <div class="empty-state">
            <p>You don't have any active pledges yet.</p>
            <p>Start exploring ideas and make your first pledge!</p>
        </div>
    {:else}
        <TableForPledges {pledges} loading={false} darkMode={false} />
    {/if}
</div>

<svelte:head>
    <meta name="twitter:card" content="summary" />
    <meta charset="utf-8" />
    <title>My pledges</title>
</svelte:head>

<style>
    .ideas-container {
        width: 90%;
        max-width: 1200px;
        padding: 1rem;
        margin: 2rem auto;
    }

    h1 {
        color: var(--primary-color);
    }

    .empty-state {
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);
        background: var(--background-secondary);
        border-radius: 16px;
        margin-top: 2rem;
        border: 1px solid var(--primary-color);
        transition: all 0.3s ease;
    }

    .empty-state p:first-child {
        font-size: 1.4rem;
        margin-bottom: 1rem;
        font-weight: 500;
        color: var(--text-color);
    }

    .empty-state p:last-child {
        font-size: 1.1rem;
        opacity: 0.9;
        line-height: 1.5;
    }

    /* Mobile styles */
    @media (max-width: 768px) {
        .ideas-container {
            padding: 0.7rem;
            margin: 0;
        }
        .empty-state {
            text-align: left;
            padding: 2rem; /* Slightly reduced padding for mobile */
        }

        .empty-state p:first-child {
            font-size: 1.2rem; /* Slightly smaller font for mobile */
        }

        .empty-state p:last-child {
            font-size: 1rem;
        }
    }
</style>
