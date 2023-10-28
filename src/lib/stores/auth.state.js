import { get, writable } from "svelte/store";
import { initJuno, listDocs } from "@junobuild/core";
import { authSubscribe, unsafeIdentity } from "@junobuild/core";
import { Principal } from "@dfinity/principal";
import { createAgent } from "@dfinity/utils";
import { AccountIdentifier, LedgerCanister } from "@dfinity/nns";
import { loginedIn } from "./loading";




let userPrincipal = null;
let walletAddress = null;
/**
 * @type {null}
 */
let identity = null;
let agent = null;
let ledgerID = "";
let userBalance = null;
let loading = true;


export const info = writable({
    key: "",
    userPrincipal: null,
    walletAddress: null,
    identity: null,
    agent: null,
    ledgerID: "",
    userBalance: null,
    loading: true
});
export async function initDB() {
    await initJuno({
        satelliteId: "vehbc-zaaaa-aaaal-acyba-cai",
    });
}
export async function basicInfo() {

    await new Promise((resolve, reject) => {
        authSubscribe(async (user) => {
            try {
                if (user != null) {
                    loginedIn.set(true);
                    let userPrincipal = Principal.fromText(user.key);
                    info.set({
                        key: user.key,
                        userPrincipal: null,
                        walletAddress: null,
                        identity: null,
                        agent: null,
                        ledgerID: "",
                        userBalance: null,
                        loading: true
                    });
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
                        key: user.key,
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

                    resolve(info);

                } else {
                    info.set({
                        key: "",
                        userPrincipal: null,
                        walletAddress: null,
                        identity: null,
                        agent: null,
                        ledgerID: "",
                        userBalance: null,
                        loading: true
                    });
                    resolve(info);
                }
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });
    });


}
let changeDollarICP = 0.31;
/**
     * @param {number} amount
     */
export function fromICPtoUSD(amount) {
    let usdAmount = amount / changeDollarICP;
    usdAmount = Math.round(usdAmount * 100) / 100;
    return usdAmount;
}

/**
 * @param {string} destination
 * @param {bigint} amount
 */
export async function transferFrom(destination, amount) {
    const store = get(info);
    const canister = await LedgerCanister.create({
        // @ts-ignore
        agent: store.agent,
        canisterId: Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"),
    });
    let account = AccountIdentifier.fromHex(destination);
    const response = await canister.transfer({
        to: account,
        amount: amount,
    });
    console.log(response);

    return response;


}

/**
 * Convert a decimal number to BigInt representation.
 *
 * @param {number} decimalValue - The decimal number to convert.
 * @param {number} multiplier - The factor to multiply by, e.g., 10**8 if you have 8 decimal places of precision.
 * @return {bigint} - The BigInt representation.
 */
export function decimalToBigInt(decimalValue, multiplier) {
    // Convert the decimal value to its precise integer representation
    const integerRepresentation = decimalValue * multiplier;

    // Convert this integer to BigInt
    return BigInt(Math.round(integerRepresentation));
}

export async function signedIn() {
    await basicInfo();
    console.log("Get info.key: ", get(info).key);
    if (get(info).key == "" || get(info).key == null) {
        loginedIn.set(false);
        console.log("entro");
        loginedIn.subscribe((value) => {
            console.log("Is logined", value);
        })
        return false;
    }
    loginedIn.set(true);
    return true;
}

/**
 * @param {string} searchWord
 * @param {string} collectionName
 */
export async function searchBar(searchWord, collectionName) {
    /**
     * @type {any[]}
     */
    let result = [];
    console.log("This is the word to search: ", searchWord)
    const MyList = await listDocs({
        collection: collectionName,
    });
    let AllSubIdeas = MyList?.items;
    for (let i = 0; i < AllSubIdeas.length; i++) {
        // @ts-ignore
        if (AllSubIdeas[i]?.data.title.toLowerCase().includes(searchWord.toLowerCase())) {
            // @ts-ignore
            result.push(AllSubIdeas[i]);
            result = result;
        }
    }
    return result;
}








