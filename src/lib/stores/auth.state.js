import {get, writable} from "svelte/store";
import { initJuno } from "@junobuild/core";
import { authSubscribe, unsafeIdentity } from "@junobuild/core";
import { Principal } from "@dfinity/principal";
import { createAgent } from "@dfinity/utils";
import { AccountIdentifier, LedgerCanister } from "@dfinity/nns";



let userPrincipal = null;
let walletAddress = null;
let identity = null;
let agent = null;
let ledgerID = "";
let userBalance = null;
let loading = true;


export const info = writable({
    userPrincipal: null,
    walletAddress: null,
    identity: null,
    agent: null,
    ledgerID: "",
    userBalance: null,
    loading: true
});
export async function basicInfo() {
    console.log('Initilizing juno...');
    await initJuno({
        satelliteId: "xh6qb-uyaaa-aaaal-acuaq-cai",
    });
    console.log('Done!');

    console.log('Getting user info...');

    await new Promise((resolve, reject) => {
        authSubscribe(async (user) => {
            try {
                console.log("User:", user);
                if (user) {
                    let userPrincipal = Principal.fromText(user.key);
                    const accountIdent = AccountIdentifier.fromPrincipal({ principal: userPrincipal })
                    let walletAddress = accountIdent.toHex();
                    let identity = await unsafeIdentity();
                    let agent = await createAgent({
                        // @ts-ignore
                        identity,
                        host: "https://icp-api.io",
                    });
                    let ledgerID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
                    const { accountBalance } = await LedgerCanister.create({
                        agent: agent,
                        canisterId: Principal.fromText(ledgerID),
                    });
                    let userBalance = await accountBalance({
                        accountIdentifier: AccountIdentifier.fromPrincipal({
                            principal: userPrincipal
                        })
                    });

                    // Set the data into the store
                    info.set({
                        // @ts-ignore
                        userPrincipal,
                        // @ts-ignore
                        walletAddress,
                        // @ts-ignore
                        identity,
                        // @ts-ignore
                        agent,
                        ledgerID,
                        // @ts-ignore
                        userBalance,
                        loading: false
                    });

                    resolve();
                }
            } catch (error) {
                reject(error);
            }
        });
    });
    console.log('Done!');


}
/**
 * @param {string} destination
 * @param {bigint} amount
 */
export async function transferFrom(destination, amount) {
    const {agent} = get(info);
    const canister = await LedgerCanister.create({
        agent,
        canisterId: Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"),
    });
    let userPrincipal = Principal.fromHex(destination);
    console.log(destination);
    let account = AccountIdentifier.fromHex(destination);
    const response = await canister.transfer({
        to: account,
        amount: amount,
    });

    return response;


}







