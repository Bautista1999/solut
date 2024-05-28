import { getDoc, getManyDocs, initJuno, listDocs, unsafeIdentity } from "@junobuild/core-peer";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

import { idlFactory as Admin } from "$lib/declarations/admin.declarations.did";
import { nanoid } from "nanoid";


import { idlFactory as ICRC } from "$lib/declarations/icrc.declarations.did";
import { AccountIdentifier, LedgerCanister } from "@dfinity/ledger-icp";
import { admin_canister_id, escrow_canister_id } from "../data_functions/canisters";
import  {idlFactory as Escrow} from "$lib/declarations/escrow.declarations.did";

// import("../declarations/juno.declarations.did.js")._SERVICE.set_doc;
/**
 * @param {string} userKey
 */
export async function getUserBalance(userKey){
   
    let ledgerID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const { accountBalance } =  LedgerCanister.create({
        // @ts-ignore
        agent: agent,
        canisterId: Principal.fromText(ledgerID),
    });
    console.log("userKey:", userKey )
    let userBalance = await accountBalance({
        accountIdentifier: AccountIdentifier.fromPrincipal({
            // @ts-ignore
            principal: Principal.fromText(userKey),
        })
    });
    return ICPtoDecimal(userBalance);
};

/**
 * @param {bigint} icpValue - The decimal number to convert.
 * @return {any} - The BigInt representation.
 */
export function ICPtoDecimal(icpValue) {
    if (icpValue < 0n) {
        throw new Error('ICP value must be a non-negative BigInt.');
    }

    // Convert ICP to decimal by dividing by 1e8.
    const decimalValue = Number(icpValue) / 1e8;
    return decimalValue;
}


/**
 * @param {string} userKey
 * @return {Promise<Array<import('$lib/data_objects/data_types').Transaction>>} 
 */
export async function getUserTransactions_bySender(userKey){

    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
   
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId:escrow_canister_id,
    });
    /**
    * @type {Promise<Array<import('$lib/declarations/escrow_declarations').Transaction>>} 
    */
    // @ts-ignore
    let result = await escrow.getTransactionsBySender(Principal.fromText(userKey));
     console.log("Transactions: ", result);
    // @ts-ignore
    return result;

}
/**
 * @param {string} project_id
 * @return {Promise<Array<import('$lib/data_objects/data_types').Transaction>>} 
 */
export async function getUserTransactions_byProject(project_id){

    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
   
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId:escrow_canister_id,
    });
    /**
    * @type {Promise<Array<import('$lib/declarations/escrow_declarations').Transaction>>} 
    */
    // @ts-ignore
    let result = await escrow.getTransactionsByProject((project_id));
    // @ts-ignore
    return result;

}


/**
 * @param {string} idea_id
 * @param {string} type
 * @return {Promise<import("$lib/data_objects/data_types").TotalPledge>}
 */
export async function getTotalPledges(idea_id,type) {

    let doc = await getDoc({
        collection: "idea_feature_pledge",
        key: "PLG_"+type+"_"+idea_id,
    });
    if(doc==undefined){
        return {
            pledges: 0 ,
            expected: 0 
        };
    }else{
        return {
            pledges:roundToThreeDecimals(ICPtoDecimal(doc.data.pledges)),
            expected: roundToThreeDecimals(ICPtoDecimal(doc.data.expected))

        };
    }
}


/**
 * @param {string} [idea_id]
 * @param {string} [feature_id]
 * @param {number} [amount]
 * @param {string } [userPrincipalText]
 */
export async function CreatePledge(idea_id, feature_id, amount, userPrincipalText) {
    //debugger;
    if (!idea_id) {
        throw  Error("idea_id is required");
    }
    if (amount === undefined) {
        throw  Error("amount is required");
    }
    if (!userPrincipalText) {
        throw  Error("userPrincipalText is required");
    }
    if(amount==0){
        throw Error("The pledge amount cant be 0");
    }

    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const accountIdentifierInBlob = (AccountIdentifier.fromPrincipal({ principal: Principal.fromText(userPrincipalText) })).toUint8Array();
    let AmountInNat64 = BigInt(parseInt((amount* 1e8).toString()));
    const admin = Actor.createActor(Admin, {
        agent,
        canisterId: admin_canister_id,
    });

    let docKey = nanoid();

    /**
    * @type {Promise<string>} 
    */
    // @ts-ignore
    let result = await admin.pledgeCreate(docKey, idea_id, feature_id, AmountInNat64, accountIdentifierInBlob);
    
    console.log("Result: ", result);
}


/**
 * @param {string} project_id
 */
export async function getTransactions(project_id){
    //debugger;
    /** @type {Array<import('$lib/data_objects/data_types').Transaction>} */
    let transactions = await getUserTransactions_byProject(project_id);

    let pledges = await listDocs({
        collection: "pledges_active",
        filter: {
            matcher: {
                description: project_id,
            },
        },
    });
    if (Number(pledges.items_length) == 0) {
        return transactions;
    } else {
        for (let i = 0; i < pledges.items_length; i++) {
            /**
             * @type {[bigint]}
             */
            let _number = [0n];
            if ( pledges.items[i].created_at != undefined) {
                 // @ts-ignore
                 _number = [pledges.items[i].created_at];
            }
            /** @type {import('$lib/data_objects/data_types').Transaction} */
            let newTransaction = {
                status: "Success",
                sender: pledges.items[i].data.user,
                target:
                    pledges.items[i].data.feature_id ||
                    pledges.items[i].data.idea_id,
                trans_type: "Pledge",
                message: "",
                project_id: pledges.items[i].data.idea_id,
                transaction_number: _number,
                created_at: _number[0],
                amount: pledges.items[i].data.amount,
            };
            transactions.push(newTransaction);
            transactions = transactions;
        }
    }
    transactions = transactions.sort(
        (a, b) => Number(a.created_at) - Number(b.created_at),
    );
    return transactions;
}


/**
 * @param {number} num
 */
function roundToThreeDecimals(num) {
    return parseFloat(num.toFixed(3));
}