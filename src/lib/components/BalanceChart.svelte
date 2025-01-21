<script>
    import {
        getTotalPledgedBalance,
        getUserBalance,
        roundToFiveDecimals,
    } from "$lib/financial_functions/financial_functions";
    import { UserKey } from "$lib/stores/other_stores";

    // You would populate this with data, possibly from a backend API call
    /**
     * @type {string | any[]}
     */
    export let currencies = [];
    let total = 0;
    for (let i = 0; i < currencies.length; i++) {
        total += roundToThreeDecimals(currencies[i].balance);
    }

    /**
     * @param {number} number
     */
    function roundToThreeDecimals(number) {
        return Math.round(number * 1000000) / 1000000;
    }

    let realBalance = 0;
    $: pledgedBalance = 0;
    $: availableBalance = 0;
    $: if (realBalance < pledgedBalance) {
        availableBalance = 0;
    } else {
        availableBalance = realBalance - pledgedBalance;
    }
    async function getBalanceICP() {
        realBalance = roundToThreeDecimals(await getUserBalance($UserKey));
    }

    async function getTotalPledgedICP() {
        pledgedBalance = await getTotalPledgedBalance();
        pledgedBalance = roundToThreeDecimals(pledgedBalance);
    }
</script>

<div class="BalanceSection">
    <div class="Balance">
        <h3 class="BalanceTitle">Balance</h3>
        {#await getBalanceICP()}
            <p class="BalanceNumber">-- Loading... --</p>
        {:then data}
            <p class="BalanceNumber">
                {roundToThreeDecimals(realBalance) + " ICP"}
            </p>
        {/await}
    </div>
    <div class="Balance PledgeHover">
        <h3 class="BalanceTitle">Pledged Balance</h3>
        <p class="BalanceNumber">
            {#await getTotalPledgedICP()}
                -- Loading... --
            {:then data}
                {pledgedBalance + " ICP"}
            {/await}
        </p>
    </div>
    <div class="Balance">
        <h3 class="BalanceTitle">Available Balance</h3>

        <p class="BalanceNumber">
            {availableBalance + " ICP"}
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
                <td>{roundToFiveDecimals(realBalance)}</td>
            </tr>
        {/each}
    </table>
</div>

<style>
    .BalanceTitle {
        margin: 0px;
        font-size: large;
        margin-bottom: 6px;
    }

    .BalanceNumber {
        font-size: large;
        /* background-color: var(--primary-color);
        color: var(--tertiary-color); */
        border-radius: 8px;
        padding: 0px;
    }
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
        width: 100%;

        padding: 5px;
        transition:
            background-color ease 0.3s,
            color ease 0.3s;
    }

    .BalanceSection {
        width: 90%;
        background-color: var(--tertiary-color);
        border: 2px solid var(--primary-color);
        padding: 10px;
        margin-block: 15px;
        border-radius: 8px;
    }
</style>
