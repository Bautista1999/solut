<script>
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import TableForApprovals from "$lib/components/TableForApprovals.svelte";
    import { getSolutionApprovals } from "../../../../declarations/satellite/satellite.api";

    export let data;
    let solution_id = data.params.solution_id;
    let loading = true;
    let error = "";

    /**
     * @type {import("../../../../declarations/satellite/satellite.did").EnrichedApprovalData[]}
     */
    let approvals = [];

    onMount(async () => {
        try {
            const approvalsResult = await getSolutionApprovals(solution_id);
            if ("Err" in approvalsResult) {
                error = approvalsResult.Err;
                loading = false;
                return;
            }
            console.log("Approvals result:", approvalsResult);
            approvals = approvalsResult.Ok;
            loading = false;
        } catch (err) {
            error = String(err);
            loading = false;
        }
    });
</script>

<div class="approvals-container" transition:fade>
    <div class="header-container">
        <h1>Solution Approvals</h1>
        <a href={`/solution/${solution_id}`} class="back-link">
            Back to Solution
        </a>
    </div>

    {#if error}
        <div class="error-state">
            <p>{error}</p>
        </div>
    {:else}
        <TableForApprovals {approvals} {loading} />
    {/if}
</div>

<style>
    .approvals-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        background: linear-gradient(
            135deg,
            rgba(255, 140, 0, 0.1),
            rgba(255, 69, 0, 0.1)
        );
        color: #ff8c00;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.2s ease;
        border: 1px solid rgba(255, 140, 0, 0.2);
    }

    .back-link:hover {
        background: linear-gradient(
            135deg,
            rgba(255, 140, 0, 0.2),
            rgba(255, 69, 0, 0.2)
        );
        color: #ff4500;
        border-color: rgba(255, 69, 0, 0.3);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(255, 69, 0, 0.1);
    }

    .back-link:active {
        transform: translateY(0);
        box-shadow: none;
    }

    .error-state {
        text-align: center;
        padding: 2rem;
        background: rgba(255, 0, 0, 0.1);
        border-radius: 8px;
        color: #ff4444;
    }

    @media (max-width: 768px) {
        .approvals-container {
            padding: 1rem;
        }

        .header-container {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }
    }
</style>
