import { authSubscribe, getDoc, getManyDocs, initJuno, listDocs, unsafeIdentity } from "@junobuild/core-peer";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

import {idlFactory as ledgerIdlFactory} from "$lib/declarations/icrc.declarations.did"
import { idlFactory as Admin } from "$lib/declarations/admin.declarations.did";
import { nanoid } from "nanoid";

import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { AccountIdentifier, LedgerCanister } from "@dfinity/ledger-icp";
import { admin_canister_id, escrow_canister_id } from "../data_functions/canisters";
import  {idlFactory as Escrow} from "$lib/declarations/escrow.declarations.did";
import { getIdeaIdBySolution, getImplementedFeaturesOfSolution, getUserKey } from "$lib/data_functions/get_functions";
import { createNotification } from "$lib/data_functions/create_functions";

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
    let userBalance = await accountBalance({
        accountIdentifier: AccountIdentifier.fromPrincipal({
            // @ts-ignore
            principal: Principal.fromText(userKey),
        })
    });
    console.log("Raw balance: ",userBalance)
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
 * @return {Promise<Array<import("$lib/declarations/escrow_declarations").Transaction>>} 
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
    // @ts-ignore
    return result;

}
/**
 * @param {string} project_id
 * @return {Promise<Array<import("$lib/declarations/escrow_declarations").Transaction>>} 
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
 * @param {string} solution_id
 * @return {Promise<import("$lib/data_objects/data_types").TotalPledge>}
 */
export async function getTotalPledgesOfSolution(solution_id) {
    let featureList = await getImplementedFeaturesOfSolution(solution_id);
    if(featureList.length==0){
        return {
            pledges:0,
            expected:0,
        };
    };
    
    /**
     * @type {{ collection: string; key: string; }[]}
     */
    let Docs = [];
    for(let i=0;i<featureList.length;i++){
        let newDoc = {
            collection:"idea_feature_pledge",
            key:"PLG_"+"FEA"+"_"+featureList[i],
        };
        Docs.push(newDoc);
        Docs=Docs;
    };
    let pledgingInfoDocs = await getManyDocs({ docs:Docs });
    if(pledgingInfoDocs==undefined){
        return {
            pledges: 0 ,
            expected: 0 
        };
    }else{
        let totalPledges = 0;
        let totalExpected = 0;
        for(let i=0;i<pledgingInfoDocs.length;i++){
            if(pledgingInfoDocs==null){
                // do nothing;
            }else{
                totalPledges+=ICPtoDecimal(pledgingInfoDocs[i]?.data.pledges);
                totalExpected+=ICPtoDecimal(pledgingInfoDocs[i]?.data.expected);
            }
        };
        return {
            pledges:roundToThreeDecimals((totalPledges)),
            expected: roundToThreeDecimals((totalExpected))
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
export async function getTransactionsAndPledges(project_id){
    //debugger;
    /** @type {Array<import("$lib/declarations/escrow_declarations").Transaction>} */
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
            /** @type {import("$lib/declarations/escrow_declarations").Transaction} */
            let newTransaction = {
                status: "Success",
                sender: pledges.items[i].data.user,
                target:
                    pledges.items[i].data.feature_id ||
                    pledges.items[i].data.idea_id,
                trans_type: "Pledge",
                to:[],
                from:[],
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


/**
 * @param {string} solution_id
 * @return {Promise<Array<import("$lib/declarations/admin.declarations").Pledge>>}
 */
export async function getPledgesOfSignedInUserInProject(solution_id){
    return new Promise((resolve,reject) => {
        authSubscribe(async (user) => {
            if (user == undefined) {
                resolve([]);
            } else {
                    /**
                    * @type {Array<string>} 
                    */
                    let featuresList = await getImplementedFeaturesOfSolution(solution_id);
                    if(featuresList.length==0){
                        resolve([]);
                    }
                    let pledges = await listDocs({
                        collection:"pledges_active",
                        filter:{
                            matcher:{
                                description:user.key
                            }
                        }
                    });
                    if(pledges==undefined){
                        return [];
                    }else{
                        let pledgesDocs = pledges.items.filter((item) => item.data.feature_id !== "" && item.data.feature_id !== undefined && featuresList.includes(item.data.feature_id));
                        if(pledgesDocs.length==0){
                            resolve([])
                        }else{
                            /**
                             * @type {any[]}
                             */
                            let returnedPledges = [];
                            for (let i=0;i<pledgesDocs.length;i++){
                                /**
                                 * @type {import("$lib/declarations/admin.declarations").Pledge}
                                 */
                                let newPledge = pledgesDocs[i].data;
                                returnedPledges.push(newPledge);
                                returnedPledges=returnedPledges;
                            }
                            resolve(returnedPledges);
                        }
                    }                
                
            }
        });
    }); 
    
}


/**
 * @param {number} amount
 * @param {string} project_id
 * @param {Array<import("$lib/declarations/escrow_declarations").Approval>} approvals
 */
export async function approveProject(amount,project_id, approvals){
    console.log("Approving solution "+{project_id}+"...");
    if(amount==0){
        throw new Error("The approved amount cant be 0!")
    }
    if(project_id==""){
        throw new Error("The solution id can be empty!")
    }
    if(approvals.length==0){
        throw new Error("User must approve some feature.") 
    }

    //******************** get idea id ********************
    let idea_id = await getIdeaIdBySolution(project_id);


    //******************** icrc_2.approve(escrow_canister_id, ) ********************
    let nat64Value = BigInt(amount * 1e8);
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); 
    let ledgerID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
    const { approve } = IcrcLedgerCanister.create({
        agent,
        canisterId: Principal.fromText(ledgerID),
    });
    const currentTime = Date.now(); // Get current time in milliseconds
    
    try{
        let approvalResult = await approve({spender:{owner: Principal.fromText(escrow_canister_id),subaccount:[]},amount:nat64Value});
        console.log("Approval: ", approvalResult);

        //********************pledgeApprovedVerify********************
        const admin = Actor.createActor(Admin, {
            agent,
            canisterId:admin_canister_id,
        });
        let result = await admin.pledgeApprovedVerify(project_id,idea_id,nat64Value, approvalResult);
        console.log("Verification of approval: ", result);


        //******************** store approvals ********************
        // before storing the approvals, we need to update the transaction number of each approval
        /**
        * @type {Array<import("../declarations/escrow_declarations").Approval>}
        */
        let newListApprovals = [];
        for(let i=0; i< approvals.length;i++){
            /**
            * @type {import("../declarations/escrow_declarations").Approval}
             */
            let newApproval = {
                approval_transaction_number: approvalResult,
                sender: approvals[i].sender,
                target: approvals[i].target,
                amount: approvals[i].amount,
            };
            newListApprovals.push(newApproval);
            newListApprovals = newListApprovals;
        }
        const escrow = Actor.createActor(Escrow, {
            agent,
            canisterId:escrow_canister_id,
        });
        let result2 = await escrow.storeApprovals(project_id,newListApprovals);
        console.log("Storing approvals: ", result);
    }catch(e){
        throw new Error(String(e));
    }
    
};


/**
 * @param {string} project_id
 */
export async function rejectProject(project_id){
    console.log("Rejecting solution "+{project_id}+"...");
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const admin = Actor.createActor(Admin, {
        agent,
        canisterId:admin_canister_id,
    });
    let idea_id = await getIdeaIdBySolution(project_id);
    
    let result = await admin.solutionReject(project_id,idea_id);
    console.log ("Rejection result: ", result);
}
/**
 * @param {string} project_id
 * @return {Promise<Array<import("$lib/data_objects/data_types").Approval>>}
 */
export async function getApprovalsByProject(project_id){
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId:escrow_canister_id,
    });
    /**
    * @type {Array<import("../declarations/escrow_declarations").Approval>}
    */
    // @ts-ignore
    let result = await escrow.getApprovals(project_id);
    console.log("Approvals: ", result);
    return result;
};
/**
 * @param {string} project_id
 * @return {Promise<number>}
 */
export async function getAmountOfUsersThatApproved(project_id){
    let approvals = await getApprovalsByProject(project_id);
    if (approvals.length==0){
        return 0;
    }else{
        let amount = 0;
        /**
         * @type {Array<string>}
         */
        let usersThatApproved = [];
        
        for(let approval of approvals){
            let senderText = approval.sender;
            if(!usersThatApproved.includes((approval.sender).toString())){
            amount++;
            usersThatApproved.push((approval.sender).toString());
            usersThatApproved=usersThatApproved;
            }
        }
        return amount;
    };
}

/**
 * @param {string} project_id
 * @return {Promise<Array<import("$lib/data_objects/data_types").Approval>>}
 */
export async function getApprovalsByProjectBySignedInUser(project_id){
    let userKey = await getUserKey();
    if(userKey==""){
        return [];
    };
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId:escrow_canister_id,
    });
    /**
    * @type {Array<import("../declarations/escrow_declarations").Approval>}
    */
    // @ts-ignore
    let result = await escrow.getProjectsApprovals_byTarget(project_id,Principal.fromText(userKey));
    console.log("Approvals: ", result);
    return result;
}
/**
 * @param {string} project_id
 * @return {Promise<number>}
 */
export async function getTotalAmountApprovedForSignedInUser(project_id){
    let approvals = await getApprovalsByProjectBySignedInUser(project_id);
    if(approvals.length==0){
        return 0;
    }
    let userKey = await getUserKey();
    let total = 0;
    for (let i = 0 ;i<approvals.length;i++){
        let thisApproval = approvals[i];
        total += Number(thisApproval.amount);
    }
    return total;
};

/**
 * @param {string} project_id
 * @return {Promise<number>}
 */
export async function getTotalAmountApprovedByProject(project_id){
    let approvals = await getApprovalsByProject(project_id);
    if(approvals.length==0){
        return 0;
    }
    let total = 0;
    for (let i = 0 ;i<approvals.length;i++){
        let thisApproval = approvals[i];
        total += Number(thisApproval.amount);
    }
    return total;
};
/**
 * @param {string} project_id
 * @param {string} idea_id
 */
export async function completeSolution(project_id,idea_id){
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId:escrow_canister_id,
    });
    /**
    * @type {Array<import("../declarations/escrow_declarations").Approval>}
    */
    // @ts-ignore
    let result = await escrow.solutionCompletion(project_id,idea_id);

    let solDoc = await getDoc({
        collection:"solution",
        key:project_id,
    });
    if(solDoc!= undefined){
        /**
        * @type {import("$lib/data_objects/data_types").Notification}
        */
        let newNotification={
            title: "Solution complete!",
            subtitle: solDoc.data.title +" has been completed. The developer has claimed its fundings.",
            imageURL: solDoc.data.images[0],
            linkURL: "/solution/"+project_id,
            sender: solDoc.data.owner,
            description: "",
            typeOf: "project completion"
        };
        let description = idea_id;
        createNotification(newNotification,description);
    };
    console.log("Approvals: ", result);
}
/**
 * @param {string} project_id
 */
export async function getTransactions(project_id){
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
 * @param {number} amount
 * @param {string} destination
 */
export async function WithDrawTokens(amount, destination){
    debugger;
    let roundedAmount = BigInt(Math.round(amount * 1e8));
    let userKey = await getUserKey();
    try{
        let transactionNumber = await transferTo(roundedAmount,destination);
        console.log("Result:" , transactionNumber)
        let storeTransaction = await storeTransactionInCanister((transactionNumber),"withdraw",userKey);
    }catch(e){
        console.log("Error, ", String(e));
        throw new Error(String(e));
    }
};


/**
 * @param {bigint} transaction_number
 * @param {string} type
 * @param {string} destination
 */
export async function storeTransactionInCanister(transaction_number,type, destination){
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" });
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId:escrow_canister_id,
    });
    let destiny = destination;
    let origin = (await getUserKey());
    try{
        //ActorMethod<[bigint, string], string>,
        let result = await escrow.verifyAndStoreTransaction(transaction_number,type,origin,destiny);
    }catch(e){
        console.log("Error, ", String(e));
        throw new Error(String(e));
    }
};


/**
* BRIEF DESCRIPTION: This function transfer tokens from the signed in user's wallet to the destination
passed as a parameter.

* PRE-CONDITIONS: User needs to be signed in to do this, and have enough balance. 
Receives a destination and an amount.

* POST-CONDITIONS: Returns dfinity's transfer response. 

* OUTSIDE FUNCTIONS: dfinity/nns --> (LedgerCanister, AccountIdentifier), dfinity/principal --> Principal

 * @param {string} destination
 * @param {bigint} amount
 */
export async function transferTo(amount, destination) {
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const canister = await LedgerCanister.create({
        // @ts-ignore
        agent: agent,
        canisterId: Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"),
    });
    let account = AccountIdentifier.fromHex(destination);
    
    try{
        let account = AccountIdentifier.fromHex(destination);
        const response = await canister.transfer({
            to: account,
            amount: amount,
        });
        console.log(response);
        return response;
    } catch(e) {
        throw new Error(String(e))
    }
}


/**
 * @param {{ match: (arg0: RegExp) => any[]; }} hexString
 */
function hexToPrincipal(hexString) {
    const bytes = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    return Principal.fromUint8Array(bytes);
}

/**
 * @param {bigint} index
 */
export async function getTransactionHash(index){
    debugger;
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const canister = await LedgerCanister.create({
        // @ts-ignore
        agent: agent,
        canisterId: Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"),
    });    
    try{
        const ledger = Actor.createActor(ledgerIdlFactory, { agent, canisterId: Principal.fromText('ryjl3-tyaaa-aaaaa-aaaba-cai') });
        const result = await ledger.query_blocks({ start: BigInt(11823545), length: BigInt(1) });
        console.log(result);
        return result;
    } catch(e) {
        throw new Error(String(e))
    }
}

/**
 * 
 * @returns {Promise<bigint>}
 */
export async function getLedgerFee() {
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
    return fee;
}


/**
 * Rounds up a number to three decimal places.
 * @param {number} num - The number to round up.
 * @return {number} - The rounded number.
 */
export function roundUpToThreeDecimalPlaces(num) {
    return Math.ceil(num * 1000) / 1000;
}

/**
 * @param {string} element_id
 * @param {number} amount
 */
export async function updateRevenueCounter(element_id,amount){
    debugger;
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId:escrow_canister_id,
    });
    try{
        let result = await escrow.ideaRevenueCounter(element_id,BigInt(amount));
        console.log(result);
    }catch(e){
        throw new Error(String(e))
    }
}