<script>
    // You would populate this with data, possibly from a backend API call
    export let transactions = [
        {
            image: "https://media.ambito.com/p/9c57bcc58b3be5c19ea3a38d32f54fca/adjuntos/239/imagenes/038/684/0038684219/1200x675/smart/ethereum-banco-centraljpg.jpg", // Replace with your image path
            transactionType: "Pledge",
            description: "user_name",
            date: "17 July 2024",
            currency: "ICP",
            amount: "5.26",
        },
        {
            image: "https://media.ambito.com/p/9c57bcc58b3be5c19ea3a38d32f54fca/adjuntos/239/imagenes/038/684/0038684219/1200x675/smart/ethereum-banco-centraljpg.jpg", // Replace with your image path
            transactionType: "Pledge",
            description: "user_name",
            date: "17 July 2024",
            currency: "ICP",
            amount: "5.26",
        },
        {
            image: "https://media.ambito.com/p/9c57bcc58b3be5c19ea3a38d32f54fca/adjuntos/239/imagenes/038/684/0038684219/1200x675/smart/ethereum-banco-centraljpg.jpg", // Replace with your image path
            transactionType: "Pledge",
            description: "user_name",
            date: "17 July 2024",
            currency: "ICP",
            amount: "5.26",
        },
    ];
</script>

<table class="transaction-table">
    <tr style="background-color: transparent; ">
        <th></th>
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
    </tr>

    {#each transactions as transaction}
        <tr class="rows">
            <td><img src={transaction.image} alt="Transaction" /></td>
            <td>{transaction.description}</td>
            <td>{"Erik"}</td>
            <td>{transaction.transactionType}</td>

            <td>{transaction.date}</td>
            <td>17h 42m 34s</td>
            <td>{transaction.currency}</td>
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
    }

    .transaction-table th {
        font-weight: 400;
    }

    .transaction-table img {
        width: 40px; /* Adjust as needed */
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
    }
</style>
