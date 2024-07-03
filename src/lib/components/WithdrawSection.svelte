<script>
    import {
        ICPtoDecimal,
        WithDrawTokens,
        getUserBalance,
    } from "$lib/financial_functions/financial_functions";
    import { UserKey } from "$lib/stores/other_stores";
    import { unsafeIdentity } from "@junobuild/core-peer";
    import ErrorMessage from "./ErrorMessage.svelte";
    import ErrorModalNew from "./ErrorModalNew.svelte";

    import FlatButtonDarkSmall from "./FlatButtonDarkSmall.svelte";
    import FlatButtonSmall from "./FlatButtonSmall.svelte";
    import MagicalDotsAbsoluteSmall from "./MagicalDotsAbsolut.svelte";
    import { Actor, HttpAgent } from "@dfinity/agent";
    import { Principal } from "@dfinity/principal";
    import { AccountIdentifier, LedgerCanister } from "@dfinity/ledger-icp";

    let amount = 0;
    let destination = "";
    let error = false;
    let errorMsg = "";
    let isLoading = false;
    let success = false;
    let userBal = getUserBalance($UserKey);

    async function getTransferInformation() {
        let identity = await unsafeIdentity();
        const agent = new HttpAgent({
            identity: identity,
            host: "https://ic0.app",
        }); // Use the correct network host
        const canister = await LedgerCanister.create({
            // @ts-ignore
            agent: agent,
            canisterId: Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"),
        });
        let fee = await canister.transactionFee();
        let balance = await getUserBalance($UserKey);
        return {
            fee: fee,
            balance: balance,
        };
    }
</script>

<div class="SmallSeparator WalletSection">
    {#if !error && !isLoading && !success}
        <p>Wish to withdraw your funds?</p>
        {#await getTransferInformation()}
            <MagicalDotsAbsoluteSmall />
            <p style="text-align: center;">Loading wallet...</p>
        {:then data}
            <p style="text-align: left;">Insert your wallet address</p>
            <input
                type="text"
                name=""
                id=""
                class="InputTextSmall"
                style="width:90%"
                bind:value={destination}
            />
            <div
                class="VerticallyAligned HorizontallyAligned"
                style="justify-content: left;"
            >
                <input
                    type="number"
                    class="InputTextSmall"
                    style="width:90%;"
                    bind:value={amount}
                />
                ICP <FlatButtonDarkSmall
                    msg={"MAX"}
                    someFunction={async () => {
                        amount = data.balance - ICPtoDecimal(data.fee);
                    }}
                />
            </div>
            <FlatButtonDarkSmall
                msg={"Withdraw"}
                someFunction={async () => {
                    isLoading = true;
                    try {
                        if (amount <= 0) {
                            isLoading = false;
                            error = true;
                            errorMsg = "Cant transfer something less than 0";
                            return;
                        }
                        if (amount <= ICPtoDecimal(data.fee)) {
                            isLoading = false;
                            error = true;
                            errorMsg =
                                "Cant transfer something less than transaction fee";
                            return;
                        }
                        if (destination.length == 0) {
                            isLoading = false;
                            error = true;
                            errorMsg = "No address specified!";
                            return;
                        }
                        await WithDrawTokens(amount, destination);
                    } catch (e) {
                        isLoading = false;
                        error = true;
                        errorMsg = String(e);
                        return;
                    }
                    isLoading = false;
                    success = true;
                }}
            />
        {/await}
    {:else if isLoading}
        <MagicalDotsAbsoluteSmall />
        <p style="text-align: center;">Withdrawing money...</p>
    {:else if error}
        <div class="errorPart SmallSeparator">
            <p>Oops.. something went wrong!</p>
            <p class="InputErrorMessage errorMessageDetails">
                {errorMsg}
            </p>
            <FlatButtonSmall
                msg={"Go back"}
                someFunction={() => {
                    error = false;
                }}
            />
        </div>
    {:else if success}
        <div class=" HorizontallyAligned" style="flex-direction:column">
            <p>Success!</p>
            <p class="InputSuccessMessage errorMessageDetails">
                {"You have successfully withdraw funds!"}
            </p>
            <FlatButtonSmall
                msg={"Go back"}
                someFunction={() => {
                    success = false;
                }}
            />
        </div>
    {/if}
</div>

<style>
    .WalletSection {
        width: 90%;
        background-color: var(--tertiary-color);
        border: 2px solid var(--primary-color);
        padding: 10px;
        margin-block: 15px;
    }
    .errorPart {
        max-width: 250px;
        min-width: 250px;
        display: flex;
        overflow: scroll;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    .errorMessageDetails {
        overflow: scroll;
    }
</style>
