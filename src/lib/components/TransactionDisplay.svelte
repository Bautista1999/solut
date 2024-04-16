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
        <th>Feature</th>
        <th>transaction type</th>
        <th>description</th>
        <th>Date</th>
        <th>currency</th>
        <th>amount</th>
    </tr>

    {#each transactions as transaction}
        <tr style="border: 3px solid var(--tertiary-color);">
            <td><img src={transaction.image} alt="Transaction" /></td>
            <td>{transaction.transactionType}</td>
            <td>{transaction.description}</td>
            <td>{transaction.date}</td>
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
        background-color: var(--secondary-color);
        color: var(--tertiary-color);
    }

    .transaction-table th,
    .transaction-table td {
        padding-inline: 0px;
        padding-block: 10px;
        text-align: center;
    }

    .transaction-table th {
        color: var(--secondary-color);
        font-weight: 100;
    }

    .transaction-table img {
        width: 60px; /* Adjust as needed */
        height: 40px;
        object-fit: cover;
    }
</style>
