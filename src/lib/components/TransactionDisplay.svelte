<script>
    import { goto } from "$app/navigation";
    import { getUsername } from "$lib/data_functions/get_functions";
    import {
        ICPtoDecimal,
        roundToFiveDecimals,
        roundUpToThreeDecimalPlaces,
    } from "$lib/financial_functions/financial_functions";
    import { Principal } from "@dfinity/principal";

    // You would populate this with data, possibly from a backend API call
    /**
     * @type {Array<import('$lib/declarations/escrow_declarations').Transaction>}
     */
    export let transactions = [];
    export let maxCharacters = 10;
    /**
     *
     * @param {number} number
     */
    function checkTransaction(number) {
        window.open(
            "https://dashboard.internetcomputer.org/transaction/" +
                number.toString(),
        );
    }
</script>

<table class="transaction-table">
    <thead>
        <tr style="background-color: transparent;">
            {#if transactions.length > 0}
                <th class="destination-field">destination</th>
                <th class="from-field">from</th>
                <th class="type-field">type</th>
                <th class="date-field">date</th>
                <th class="time-field">time</th>
                <th class="currency-field">currency</th>
                <th class="amount-field">amount</th>
                <th class="status-field">status</th>
            {:else}
                <br />
                <br />
                <p style="text-align: center;">-- No Transactions made --</p>
            {/if}
        </tr>
    </thead>
    <tbody>
        {#each transactions as transaction}
            <tr
                class="rows hover-container"
                on:click={() => {
                    if (transaction.trans_type != "Pledge") {
                        checkTransaction(transaction.transaction_number[0]);
                    }
                }}
            >
                <td class="destination-field">
                    {transaction.target.toString().substring(0, maxCharacters)}
                    {#if transaction.target.toString().length > maxCharacters}...{/if}
                </td>
                {#await getUsername(transaction.sender.toString())}
                    <td class="from-field">
                        {transaction.sender
                            .toString()
                            .substring(0, maxCharacters)}
                        {#if transaction.sender.toString().length > maxCharacters}...{/if}
                    </td>
                {:then data}
                    <td class="from-field">
                        {data.toString().substring(0, maxCharacters)}
                        {#if data.toString().length > maxCharacters}...{/if}
                    </td>
                {/await}
                <td class="type-field">{transaction.trans_type}</td>
                <td class="date-field">
                    {new Date(Number(transaction.created_at / 1000000n))
                        .toISOString()
                        .split("T")[0]}
                </td>
                <td class="time-field">
                    {new Date(
                        Number(transaction.created_at / 1000000n),
                    ).getHours()}:
                    {new Date(
                        Number(transaction.created_at / 1000000n),
                    ).getMinutes()}:
                    {new Date(
                        Number(transaction.created_at / 1000000n),
                    ).getSeconds()}
                </td>
                <td class="currency-field">ICP</td>
                <td class="amount-field">
                    {roundToFiveDecimals(ICPtoDecimal(transaction.amount))}
                </td>
                <td class="status-field">
                    {#if transaction.status == "Success"}
                        <div
                            class="successStatusFlag"
                            style="margin-inline:5px;"
                        >
                            {transaction.status}
                        </div>
                    {:else}
                        <div
                            class="failureStatusFlag"
                            style="margin-inline:5px;"
                        >
                            {transaction.status}
                        </div>
                    {/if}
                </td>
                <div class="hover-message">message: {transaction.message}</div>
            </tr>
        {/each}
    </tbody>
</table>

<style>
    .transaction-table {
        width: 100%;
        border-collapse: collapse;
        position: relative;
    }
    .transaction-table tr {
        width: 100%;
        border-collapse: collapse;
        color: var(--secondary-color);
    }

    .transaction-table th,
    .transaction-table td {
        padding-inline: 0px;
        padding-block: 5px;
        text-align: center;
        margin-block: 5px;
        font-weight: 300;
    }

    .transaction-table td {
        padding-top: 5px;
    }
    .rows {
        border: 1px solid var(--secondary-color);
        margin-top: 15px;
        background-color: var(--tertiary-color);
        cursor: pointer;
    }

    .transaction-table th {
        font-weight: 400;
    }

    .rows:hover {
        background-color: var(--forth-color);
    }

    .transaction-table img {
        width: 40px; /* Adjust as needed */
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
    }
    .transaction-label {
        font-weight: bold;
        display: none;
    }
    @media (max-width: 768px) {
        .transaction-table {
            width: 100%;
            overflow-x: auto;
        }

        .date-field,
        .time-field,
        .currency-field,
        .status-field {
            display: none;
        }

        .destination-field,
        .from-field,
        .amount-field,
        .type-field {
            display: table-cell;
        }

        .transaction-table tbody,
        .transaction-table th,
        .transaction-table td,
        .transaction-table tr {
        }

        .transaction-table tr {
            margin-bottom: 5px;
            padding: 5px;
            background-color: var(--tertiary-color);
        }

        .transaction-table td {
            border-bottom: 1px solid var(--secondary-color);
            padding: 5px;
            text-align: center;
        }

        .transaction-table td:last-child {
            border-bottom: none;
        }

        .transaction-label {
            font-weight: bold;
            display: none; /* Hide labels in the mobile view */
        }

        .transaction-value {
            display: inline-block;
        }

        .rows {
            border: 1px solid var(--secondary-color);
            background-color: var(--tertiary-color);
            cursor: pointer;
            padding: 5px;
        }

        .rows:hover {
            background-color: var(--forth-color);
        }

        .hover-message {
            display: none;
        }
    }
</style>
