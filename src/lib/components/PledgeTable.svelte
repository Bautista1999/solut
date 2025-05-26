<script>
    import { onMount } from "svelte";
    import { getEnrichedElementPledges } from "../../declarations/satellite/satellite.api";
    import Table from "./Table/Table.svelte";
    import IdeaTableElement from "./IdeaTableElement.svelte";
    import UserComponentForTable from "./UserComponentForTable.svelte";
    import AmountCellComponent from "./AmountCellComponent.svelte";
    import StatusCellComponent from "./StatusCellComponent.svelte";
    import PaymentTypeCellComponent from "./PaymentTypeCellComponent.svelte";
    import DateCellComponent from "./DateCellComponent.svelte";

    export let id;
    let columns = [
        {
            id: "created_at",
            header: "Date",
            accessor: "created_at_formatted",
            width: "80px",
            cellComponent: DateCellComponent,
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
            accessor: "user_username",
            cellComponent: UserComponentForTable,
            sortable: true,
        },

        {
            id: "status",
            header: "Status",
            accessor: "status",
            cellComponent: StatusCellComponent,
            sortable: true,
        },
        {
            id: "payment_type",
            header: "Payment Type",
            accessor: "payment_type",
            cellComponent: PaymentTypeCellComponent,
        },
        {
            id: "amount",
            header: "Amount",
            accessor: "amount_numeric",
            cellComponent: AmountCellComponent,
            sortable: true,
        },
        {
            id: "expected_amount",
            header: "Expected Amount",
            accessor: "expected_amount_numeric",
            cellComponent: AmountCellComponent,
            sortable: true,
        },
    ];
    let initialVisibleColumns = ["feature_id", "user", "created_at", "amount"];
    if (window.innerWidth > 800) {
        initialVisibleColumns = ["feature_id", "user", "created_at", "amount"];
    } else {
        initialVisibleColumns = ["user", "created_at", "amount"];
    }
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
                const username = pledge.user?.username || "";
                const amountNumeric = Number(pledge.amount) / 100000000;
                // Convert expected_amount to proper numeric value and formatted string
                const expectedAmountNumeric =
                    Number(pledge.expected_amount) / 100000000;

                return {
                    uniqueKey: `${pledge.pledge_id}-${index}`,
                    ...pledge,
                    idea_title: ideaTitle,
                    feature_title: featureTitle,
                    user_username: username,
                    idea: pledge.idea,
                    feature: pledge.feature,
                    amount_numeric: amountNumeric,
                    amount_formatted: amountNumeric.toFixed(2),
                    expected_amount_numeric: expectedAmountNumeric,
                    expected_amount_formatted: expectedAmountNumeric.toFixed(2),
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
        defaultSort={{
            columnId: "created_at",
            direction: "asc",
        }}
    />
</div>
