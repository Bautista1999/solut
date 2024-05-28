import { get, writable } from "svelte/store";
import { initJuno, listDocs } from "@junobuild/core-peer";
import { authSubscribe, unsafeIdentity } from "@junobuild/core-peer";
import { Principal } from "@dfinity/principal";
import { idlFactory } from "$lib/declarations/icrc.declarations.did";
import { loginedIn } from "./other_stores";
import { Actor, HttpAgent } from "@dfinity/agent";
import  {AccountIdentifier, LedgerCanister}  from "@dfinity/ledger-icp";




let userPrincipal = null;
let walletAddress = null;
/**
 * @type {null}
 */
let identity = null;
let agent = null;
let ledgerID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';
let userBalance = null;
let loading = true;
let canisterId = ledgerID;
/**
BRIEF DESCRIPTION: This store is supposed to hold basic info about the signed in user, provided by his/her
internet identity through Juno. Throughout the whole platform many components, from to backend to the fronend,
are interested to have this kind of information. For instance, the function approveSolutio() in docu_functions.js
needs to know the user's principal to make a transaction, or user's key is important to have it when following
a topic. 
 */
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
/**
BRIEF DESCRIPTION: Function to initilize Juno's Solutio satellite (our database);
 */
export async function initDB() {
    await initJuno({
        satelliteId: "vehbc-zaaaa-aaaal-acyba-cai",
    });
}
/**
BRIEF DESCRIPTION: Here we set the information for the store info;
 */
export async function basicInfo() {
    await new Promise((resolve, reject) => {
        authSubscribe(async (user) => {
            try {
                if (user != null) {
                    loginedIn.set(true);
                    if(user.key == "" || user.key == null){
                        await setTimeout(()=>{
                        },3000);
                    };
                    let userPrincipal = Principal.fromText(user.key);
                    info.set({
                        key: user.key,
                        // @ts-ignore
                        userPrincipal: userPrincipal,
                        walletAddress: null,
                        identity: null,
                        agent: null,
                        ledgerID: "",
                        userBalance: null,
                        loading: true
                    });
                    //toUint8Array()
                    const accountIdente = AccountIdentifier.fromPrincipal({principal:Principal.fromText(user.key)})
                    let walletAddress = accountIdente.toHex();
                    let identity = await unsafeIdentity();
                    let agent = new HttpAgent({ identity: identity, host: "https://ic0.app" })
                    const {accountBalance} = await LedgerCanister.create({
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

export async function accountBalance(){
    let identity = await unsafeIdentity();
                    let agent = new HttpAgent({ identity: identity, host: "https://ic0.app" })
                    let ledgerID = "";
                    const icrc = Actor.createActor(idlFactory, {
                        agent,
                        canisterId,
                    });
};

/**
BRIEF DESCRIPTION: Function to set the store loginedIn to true or to false, whether the user is signed in 
or not. 

PRE-CONDITIONS: --None--

POST-CONDITIONS: Sets the loginedIn store to whether the uses is signed in or not. 

OUTSIDE FUNCTIONS: --None--
 */
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










