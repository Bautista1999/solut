<script>
    import UnderConstruction from "$lib/components/UnderConstruction.svelte";
    import { UserKey } from "$lib/stores/other_stores";
    import { onMount } from "svelte";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import { path } from "$lib/stores/redirect_store";
    import { getUserApprovalsEnriched } from "../../declarations/satellite/satellite.api";
    import TableForApprovals from "$lib/components/TableForApprovals.svelte";

    /**
     * @type {import("../../declarations/satellite/satellite.did").EnrichedApprovalData[]}
     */
    let approvals = [];
    let loading = true;

    onMount(async () => {
        if (!(await CheckIfSignedIn())) {
            alert("You are not signed in");
            path.set("/myapprovals");
            window.location.href = "/signin";
            return;
        }
        try {
            const approvalsResult = await getUserApprovalsEnriched($UserKey);
            console.log("Approvals result:", approvalsResult);
            if ("Ok" in approvalsResult) {
                approvals = approvalsResult.Ok;
            } else {
                console.error("Error fetching approvals:", approvalsResult.Err);
            }
        } catch (error) {
            console.error("Failed to fetch approvals:", error);
        } finally {
            loading = false;
        }
    });
</script>

<!-- <UnderConstruction /> -->

<div class="ideas-container">
    <h1>My Approvals</h1>
    {#if loading}
        <div class="loading-state">
            <div class="loader" />
            <p>Loading your approvals...</p>
        </div>
    {:else if approvals.length === 0}
        <div class="empty-state">
            <p>You don't have any approvals yet.</p>
            <p>Start exploring solutions and make your first approval!</p>
        </div>
    {:else}
        <TableForApprovals {approvals} {loading} darkMode={false} />
    {/if}
</div>

<svelte:head>
    <meta name="twitter:card" content="summary" />
    <meta charset="utf-8" />
    <title>My Approvals</title>
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

    .loading-state {
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);
        background: var(--background-secondary);
        border-radius: 16px;
        margin-top: 2rem;
    }

    .loader {
        border: 4px solid var(--background-color);
        border-top: 4px solid var(--accent-color);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    /* Mobile styles */
    @media (max-width: 768px) {
        .ideas-container {
            padding: 0.7rem;
            margin: 0;
        }
        .empty-state,
        .loading-state {
            text-align: left;
            padding: 2rem;
        }

        .empty-state p:first-child {
            font-size: 1.2rem;
        }

        .empty-state p:last-child {
            font-size: 1rem;
        }
    }
</style>
