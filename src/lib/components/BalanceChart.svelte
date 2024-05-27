<script>
    // You would populate this with data, possibly from a backend API call
    /**
     * @type {string | any[]}
     */
    export let currencies = [
        // {
        //     image: "https://media.istockphoto.com/id/1139020309/vector/bitcoin-internet-money-icon-vector.jpg?s=612x612&w=0&k=20&c=vcRUEDzhndMOctdM7PN1qmipo5rY_aOByWFW0IkW8bs=",
        //     name: "BTC",
        //     value: 62307.9,
        //     balance: 0,
        // },
        // {
        //     image: "https://cryptologos.cc/logos/internet-computer-icp-logo.png", // Replace with your image path
        //     name: "ICP",
        //     value: 12.98,
        //     balance: 17.1,
        // },
        // {
        //     image: "https://download.logo.wine/logo/Ethereum/Ethereum-Logo.wine.png", // Replace with your image path
        //     name: "ETH",
        //     value: 3459.42,
        //     balance: 0,
        // },
    ];
    let total = 0;
    for (let i = 0; i < currencies.length; i++) {
        total += roundToThreeDecimals(currencies[i].balance);
    }

    /**
     * @param {number} number
     */
    function roundToThreeDecimals(number) {
        return Math.round(number * 100) / 100;
    }
</script>

<div class="BalanceSection">
    <div class="Balance">
        <p>
            {total + " ICP"}
        </p>
        <p style="font-size: small; font-weight: 100;">
            From all accounts in total.
        </p>
    </div>

    <table class="transaction-table">
        <tr style="background-color: transparent; ">
            <th>Currency</th>
            <!-- <th>Value</th> -->
            <th>Balance</th>
        </tr>

        {#each currencies as curr}
            <tr style="border: 3px solid var(--tertiary-color);">
                <td
                    style="display: flex; justify-content:center; align-items:center; gap:7px;"
                    ><img src={curr.image} alt="Transaction" />
                    {curr.name}</td
                >
                <!-- <td>{curr.value}</td> -->
                <td>{roundToThreeDecimals(curr.balance)}</td>
            </tr>
        {/each}
    </table>
</div>

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
        font-size: small;
    }

    .transaction-table th {
        color: var(--secondary-color);
        font-weight: 100;
        font-size: medium;
    }

    .transaction-table img {
        width: 30px; /* Adjust as needed */
        height: 30px;
        border-radius: 50%;
        object-fit: cover;
    }
    .Balance {
        text-align: left;
        font-size: larger;
        width: 95%;
        padding-block: 5px;
    }
    .BalanceSection {
        width: 90%;
        background-color: var(--tertiary-color);
        border: 2px solid var(--primary-color);
        padding: 10px;
        margin-block: 15px;
    }
</style>
