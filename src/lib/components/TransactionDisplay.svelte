<script>
    import { goto } from "$app/navigation";
    import { getUsername } from "$lib/data_functions/get_functions";
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
    <tr style="background-color: transparent; ">
        {#if transactions.length > 0}
            <th>destination</th>
            <th
                ><form action="" method="get"></form>
                from</th
            >
            <th>type</th>

            <th>date</th>
            <th>time</th>
            <th>currency</th>
            <th>amount</th>
        {:else}
            <br />
            <br />
            <p style="text-align: center;">-- No Transactions made --</p>
        {/if}
    </tr>

    {#each transactions as transaction}
        <tr
            class="rows"
            on:click={() => {
                if (transaction.trans_type != "Pledge") {
                    checkTransaction(transaction.transaction_number[0]);
                }
            }}
        >
            <!-- <td><img src={transaction.image} alt="Transaction" /></td> -->
            <td
                >{transaction.target
                    .toString()
                    .substring(
                        0,
                        maxCharacters,
                    )}{#if transaction.sender.toString().length > maxCharacters}...{/if}</td
            >
            {#await getUsername(transaction.sender.toString())}
                <td
                    >{transaction.sender
                        .toString()
                        .substring(
                            0,
                            maxCharacters,
                        )}{#if transaction.sender.toString().length > maxCharacters}...{/if}</td
                >
            {:then data}
                <td
                    >{data
                        .toString()
                        .substring(
                            0,
                            maxCharacters,
                        )}{#if data.toString().length > maxCharacters}...{/if}</td
                >
            {/await}

            <td>{transaction.trans_type}</td>

            <td
                >{new Date(Number(transaction.created_at / 1000000n))
                    .toISOString()
                    .split("T")[0]}</td
            >
            <td
                >{new Date(
                    Number(transaction.created_at / 1000000n),
                ).getHours() +
                    ":" +
                    new Date(
                        Number(transaction.created_at / 1000000n),
                    ).getMinutes() +
                    ":" +
                    new Date(
                        Number(transaction.created_at / 1000000n),
                    ).getSeconds()}</td
            >
            <td>ICP</td>
            <td>{transaction.amount}</td>
        </tr>
    {/each}
</table>

<style>
    .transaction-table {
        width: 100%;
        border-collapse: collapse;
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
</style>
