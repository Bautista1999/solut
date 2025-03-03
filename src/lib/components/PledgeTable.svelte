<script>
    import { onMount } from "svelte";
    import { getEnrichedElementPledges } from "../../declarations/satellite/satellite.api";
    import Table from "./Table/Table.svelte";
    import IdeaTableElement from "./IdeaTableElement.svelte";

    export let id;

    let columns = [
        {
            id: "created_at",
            header: "Date",
            accessor: "created_at_formatted",
            sortable: true,
        },
        {
            id: "idea_id",
            header: "Topic",
            accessor: "idea_title",
            width: "150px",
            sortable: true,
            cellComponent: IdeaTableElement,
        },
        {
            id: "feature_id",
            header: "Idea",
            accessor: "feature_title",
            width: "150px",
            sortable: true,
            cellComponent: IdeaTableElement,
        },
        {
            id: "user",
            header: "User",
            accessor: "user.username",
        },

        {
            id: "status",
            header: "Status",
            accessor: "status",
        },
        {
            id: "payment_type",
            header: "Payment Type",
            accessor: "payment_type",
        },
        {
            id: "amount_paid",
            header: "Amount Paid",
            accessor: "amount_paid",
        },
        {
            id: "amount",
            header: "Amount",
            accessor: "amount_formatted",
        },
        {
            id: "expected_amount",
            header: "Expected Amount",
            accessor: "expected_amount",
        },
    ];
    let initialVisibleColumns = ["feature_id", "user", "created_at", "amount"];
    /**
     * @type {import("../../declarations/satellite/satellite.did").EnrichedPledgeData[]}
     */
    let pledges = [];
    onMount(async () => {
        let pledgesResult = await getEnrichedElementPledges(id);
        if ("Ok" in pledgesResult) {
            pledges = pledgesResult.Ok.map((pledge, index) => {
                const ideaTitle = pledge.idea?.title || "";
                const featureTitle = pledge.feature?.[0]?.title || "";

                return {
                    uniqueKey: `${pledge.pledge_id}-${index}`,
                    ...pledge,
                    idea_title: ideaTitle,
                    feature_title: featureTitle,
                    idea: pledge.idea,
                    feature: pledge.feature,
                    amount_formatted: (
                        Number(pledge.amount) / 100000000
                    ).toFixed(2),
                    created_at_formatted: new Date(
                        Number(pledge.created_at / 1000000n),
                    )
                        .toISOString()
                        .split("T")[0],
                };
            });
            console.log(pledges);
        } else {
            console.error(pledgesResult.Err);
        }
    });
    let maxWidth = "800px";
    $: if (window.innerWidth < 800) {
        maxWidth = "";
    }
</script>

<div>
    <!-- <h1>Pledges From The Community</h1> -->
    <Table
        {columns}
        rows={pledges}
        showCheckboxes={false}
        showRowActions={false}
        {maxWidth}
        {initialVisibleColumns}
    />
</div>
