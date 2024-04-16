import { setDoc, initJuno, getDoc,deleteDoc, setManyDocs as setManyDocs_juno } from "@junobuild/core";
import { nanoid } from "nanoid";
import { Actor, HttpAgent } from "@dfinity/agent";
import { authSubscribe, unsafeIdentity } from "@junobuild/core";
import { Principal } from "@dfinity/principal";
import { createAgent } from "@dfinity/utils";
import {  IDL } from "@dfinity/candid";
import { idlFactory } from "$lib/declarations/admin.declarations.did";
import { IcrcLedgerCanister, IcrcIndexCanister } from "@dfinity/ledger-icrc";
import { IndexCanister } from "@dfinity/ledger-icp";
import { get } from "svelte/store";
import { info } from "$lib/stores/auth.state";
import { idlFactory as ICRC } from "$lib/declarations/icrc.declarations.did";
import { idlFactory as Escrow } from "$lib/declarations/escrow.declarations.did";
import { AccountIdentifier, LedgerCanister } from "@dfinity/ledger-icp";
import { Nat } from "@dfinity/candid/lib/cjs/idl";
// import("../declarations/juno.declarations.did.js")._SERVICE.set_doc;
let canisterId = "3f6pv-baaaa-aaaab-qacoq-cai";
export let solution_id = "T_BVS86cjl7AqpVn0LyDt";
export let idea_id = "X_ThbidrSb7nOf9oyvkMC";

/**
 * @param {string | undefined} [id]
 */
export async function testDatabase(id){
    await initJuno({
        satelliteId: "svftd-daaaa-aaaal-adr3a-cai",
    });
    await setDoc({
        collection: "idea",
        doc: {
            key:"TEST_"+ id,
            // @ts-ignore
            updated_at: 2802838383, 
            data: {example: "hello"},
        },
    });
}
/**
 * @param {string | undefined} [id]
 */
export async function getDocDatabase(id){
    return await getDoc({
        collection:"idea",
        key: "TEST_"+ id,
    })
}
/**
 * @param {string | undefined} [id]
 */
export async function getDocJunoBridge(id){
    let identity = await unsafeIdentity();
        // @ts-ignore
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host

    // Optionally, for development, you might want to disable certificate validation
    // NEVER do this in production
    //agent.fetchRootKey().catch(console.error);
    // Create an actor to interact with the admin canister
    const junoCanisterTry = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    let result = await junoCanisterTry.getDoc("idea",
         "TESTING_ADMIN_"+ id,
    )
    // @ts-ignore
    console.log(result.ok.owner);
}
export async function getManyDocs(){
    console.log("Getting docs...")
    let identity = await unsafeIdentity();
        // @ts-ignore
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host

    // Optionally, for development, you might want to disable certificate validation
    // NEVER do this in production
    //agent.fetchRootKey().catch(console.error);
    // Create an actor to interact with the admin canister
    const junoCanisterTry = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    const docPair1 = [ "idea" , "TESTING_ADMINpExl2TaflBk8GdbSyMZEw"];
      
    const docPair2 = [ "testing_collection", "TESTING_21ENkHkbLeEH1w6YldPOs"];
      
    let result = await junoCanisterTry.getManyDocs([docPair1,docPair2])
    // @ts-ignore
    console.log(result);
    console.log("Done!")
};

export async function setManyDocs(){
    console.log("Setting docs...")
    let identity = await unsafeIdentity();
    // @ts-ignore
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); 

    // Create an actor to interact with the admin canister
    const junoCanisterTry = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    let jsonData = {
        title:"Admin doc example",
        subtitle:"Example of subtitle from this motherfucker",
        description:"Example of description from this motherfucker",
    }
    let jsonArray = await toArray(jsonData);
    let jsonData2 = {
        title:"Admin doc example 2",
        subtitle:"2: Example of subtitle from this motherfucker ",
        description:"2: Example of description from this motherfucker",
    }
    let jsonArray2 = await toArray(jsonData2);
    let date = Date.now();
    let id1 = nanoid();
    let id2 = nanoid();
    let id3 = nanoid();
    const docPair1 = [ "idea" , "TESTED_JUNO"+id1, { updated_at: [date], data: jsonArray, description: ["descriptionValue"] }];
      
    const docPair2 = [ "idea", "TESTED_JUNO"+id2, { updated_at: [date], data: jsonArray2, description: ["descriptionValue"] }];
    
    const docPair3 = [ "idea", "TEST_JUNO"+id3, { updated_at: [date], data: jsonArray2, description: ["descriptionValue"] }];
   
    let result = await junoCanisterTry.setManyDocs([docPair1,docPair2,docPair3])
    // @ts-ignore
    console.log(result);
    console.log("Done!")
};

/**
 * @param {string} id
 */
export async function setDocJunoBridge(id){
    let identity = await unsafeIdentity();
    // @ts-ignore
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host

    // Optionally, for development, you might want to disable certificate validation
    // NEVER do this in production
    //agent.fetchRootKey().catch(console.error);
    // Create an actor to interact with the admin canister
    const junoCanisterTry = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    let jsonData = {
        title:"Admin doc example",
        subtitle:"Example of subtitle from this motherfucker",
        description:"Example of description from this motherfucker",
    }
    let date = Date.now();
    let jsonArray = await toArray(jsonData);

    const result = await junoCanisterTry.setDoc(
        "idea", 
        "TESTING_ADMIN_"+id, 
        { updated_at: [date], data: jsonArray, description: ["descriptionValue"] }
    );
    console.log("Result: ", result);    
};

export async function listJunoDocs(){
    console.log("Getting list of docs...");
    let identity = await unsafeIdentity();
    // @ts-ignore
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    // Create an actor to interact with the admin canister
    const junoCanisterTry = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    let date = Date.now();
    //  IDL.Func([IDL.Text, ListDocsFilter], [ListDocsResult], []),
    //  const ListDocsFilter = IDL.Record({
    //     'order' : Order,
    //     'owner' : IDL.Opt(IDL.Principal),
    //     'matcher' : Matcher,
    //     'paginate' : Paginate,
    //   });
    //  const OrderField = IDL.Variant({
    //     'UpdatedAt' : IDL.Null,
    //     'Keys' : IDL.Null,
    //     'CreatedAt' : IDL.Null,
    //   });
    //  const Order = IDL.Opt(
    //     IDL.Record({ 'field' : OrderField, 'desc' : IDL.Bool })
    //   );
    //  const Matcher = IDL.Opt(
    //     IDL.Record({ 'key' : IDL.Opt(IDL.Text), 'description' : IDL.Opt(IDL.Text) })
    //   );
    //   const Paginate = IDL.Opt(
    //     IDL.Record({
    //       'start_after' : IDL.Opt(IDL.Text),
    //       'limit' : IDL.Opt(IDL.Nat64),
    //     })
    let matcher = [
        {
          description: [], // pass an empty array for null, or ["description text"] for a specific description
          key: ["TESTED|_JUNO"] // pass an empty array for null, or ["key text"] for a specific key
        }
      ]
    let filter = {order: [],owner:[],matcher:matcher, paginate:[]};
    const result = await junoCanisterTry.listDocs(
        "idea", 
        filter
    );
    console.log("Result: ", result);    
};

export async function updateJunoDocument(){
    console.log("Updating a document...");
    let identity = await unsafeIdentity();
    // @ts-ignore
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    // Create an actor to interact with the admin canister
    const junoCanisterTry = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    let jsonData = {
        title:"Im editing the title",
        subtitle:"Now the subtitle",
        description:"New description",
    }
    let jsonArray = await toArray(jsonData);
    let date = Date.now();
    const result = await junoCanisterTry.updateDocument(
        "idea", 
        "TESTED_ADMIN_nZL5EZBhb83NSHb-ctJGV",
        { updated_at: [date], data: jsonArray, description: ["descriptionValue"] }

    );
    console.log("Result: ", result); 
}
export async function deleteJunoDoc(){
    console.log("Deleting a document...");
    let identity = await unsafeIdentity();
    // @ts-ignore
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    // Create an actor to interact with the admin canister
    const junoCanisterTry = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    const result = await junoCanisterTry.deleteDoc(
        "idea", 
        "TESTED_ADMIN_nZL5EZBhb83NSHb-ctJGV",
    );
    console.log("Result: ", result); 
};
export async function deleteManyJunoDocs(){
    console.log("Starting...")
    let arraysKeysTest = ["TESTING_0-RnjbhyheAbVIylhkJEp","TESTED_JUNOIf7i-FmGfuud9KadD4dXG"];
    let identity = await unsafeIdentity();
    // @ts-ignore
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); 

    // Create an actor to interact with the admin canister
    const junoCanisterTry = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    const docPair11 = [ "idea" , arraysKeysTest[0]];
    const docPair22 = [ "idea", arraysKeysTest[1]];
    console.log("Getting docs...")
    //TODO: getManyDocs is better done directly on Juno, to avoid wasted time and money. 
    let result1 = await junoCanisterTry.getManyDocs([docPair11,docPair22]);
    console.log("Result get: ", result1);
    // @ts-ignore
    if(result1.ok[0][1].length==0 && result1.ok[1][1].length==0 ){
        console.log("Those documents dont exist. Try deleting other ones.");
        return;
    // @ts-ignore
    }else if (result1.ok[0][1].length==0 || result1.ok[1][1].length==0){
        console.log("One of those documents dont exist. Try deleting other ones.");
        return;
    };
    // @ts-ignore
    let updated_at1 = result1.ok[0][1][0].updated_at;
    // @ts-ignore
    let updated_at2 = result1.ok[1][1][0].updated_at;
    console.log("updated_at1: " , updated_at1);
    console.log("updated_at2: " , updated_at2);
    console.log("Deleting docs...")
    let date = Date.now();
    const docPair1 = [ "idea" , arraysKeysTest[0], { updated_at: [updated_at1]}];
      
    const docPair2 = [ "idea", arraysKeysTest[1], { updated_at: [updated_at2]}];

    let result2 = await junoCanisterTry.deleteManyDocs([docPair1,docPair2])
    // @ts-ignore
    console.log("Result delete: ", result2);
    console.log("Done!")
};

/**
 * @param {Blob} jsonBlob
 */
function BlobTojson(jsonBlob){
    jsonBlob.text().then((/** @type {string} */ text) => {
        const jsonData = JSON.parse(text);
        // Now, jsonData is your original JSON object
        console.log("Blob data json:",jsonData);
    });
};
export const toArray = async (/** @type {any} */ data) => {
    const blob = new Blob([JSON.stringify(data)], {
      type: 'application/json; charset=utf-8'
    });
    return new Uint8Array(await blob.arrayBuffer());
  };
  
export async function setPledgesSolutionDoc(){
    let dat1 = {user: "user1",
        amount_pledged: 20,
        amount_paid: 18
    }
    let dat2 = {user: "user2",
        amount_pledged: 30,
        amount_paid: 15
    }
    let dat3 = {user: "user3",
        amount_pledged: 35,
        amount_paid: 17
    }
        

    let data = [dat1,dat2,dat3];
    await initJuno({
        satelliteId: "svftd-daaaa-aaaal-adr3a-cai",
    });
    await setDoc({
        collection: "idea",
        doc: {
            key:"TEST_solutionPledges",
            // @ts-ignore
            updated_at: 2802838383, 
            data: data,
        },
    });
};
export async function CreateUser(){
    if (get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");

        return;
    }
    let date = Date.now();
    console.log("Creating user...");
    let user_id = get(info).key;
    let repu_id = "REP_" + user_id;
    let index_id = "INDEX_" + user_id;
    let rev_id = "REV_" + user_id;

    //create user document
    let userDoc = {
        key: user_id,
        data: {
            username: "",
            profile_picture: "",
            background_picture: "",
            last_vist: Date.now(),
        },
        description:"USERNAME:"
    };
    let userDocInput = {collection: "user", doc: userDoc};
    //create user reputation document
    let userRepDoc = {
        updated_at: [date],
        data: await toArray({
            amount_promised: 0 ,
            amount_paid : 0 ,
        }),
        description:["80"],
    };
    let userRepInput = [ "reputation",repu_id, userRepDoc];
    //create user index document
    let userIndexDoc = {
        key: index_id,
        data: {
            profile_picture:"",
        },
        description:"USERNAME:",
    };
    let userIndexInput = {collection: "user_index", doc: userIndexDoc};
    //create user revenue document
    let userRevDoc = {
        updated_at: [date],
        data: await toArray({
            total_revenue:0,
        }),
        description:["USERNAME:"],
    };
    let userRevInput = ["users_revenue_counter", rev_id , userRevDoc];

    await initJuno({
        satelliteId: "svftd-daaaa-aaaal-adr3a-cai",
    });
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const junoCanisterTry = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    // let jsonArray2 = await toArray(jsonData2);
    // let date = Date.now();
    // let id1 = nanoid();
    // let id2 = nanoid();
    // let id3 = nanoid();
    // const docPair1 = [ "idea" , "TESTED_JUNO"+id1, { updated_at: [date], data: jsonArray, description: ["descriptionValue"] }];
    let result3 = await junoCanisterTry.setManyDocs([userRepInput,userRevInput])
    // let result = await junoCanisterTry.setManyDocs([docPair1,docPair2,docPair3])
    let result = await setManyDocs_juno({docs:[userDocInput,userIndexInput]});

    console.log("Done");
    console.log ("User creation result: ", result);
    console.log ("User creation result admin: ", result3);


};
export async function CreateIdea(){
    if (get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");

        return;
    }
    let userPrincipal = get(info).key
    console.log("Creating idea...");
    // We need to create documents in collections: idea, pledge_solution, index_search
    //  idea revenue counter. 
    //THROUGH ADMIN: idea_revenue_counter, pledges_solution, idea_feature_pledging
    //THROUGH JUNO: idea, index_search

    let idea_id = nanoid();
    let id_pledges_sol = "SOL_PL_" + idea_id;
    let id_pledges_idea = "PLG_IDEA_" + idea_id;
    let id_rev_idea = "REV_IDEA_" + idea_id;
    let id_index_idea = "INDEX_" + idea_id;

    //****** Juno section ******/
    //1) Idea
    // idea's title, subtitle, image URL, description, and category.
    let idea = {
        key: idea_id,
        data: {
            title: "New idea",
            subtitle: "Subtitle of new idea",
            image_url : "https://media.rnztools.nz/rnz/image/upload/s--ddpMQ0P9--/ar_16:10,c_fill,f_auto,g_auto,q_auto,w_1050/v1624925138/4Q3W9G0_knowledge_3_4795",
            description: "This is the description of this new idea.",
            category: "Technology"
        },
        description:"#TECHNOLOGY , status:PRODUCT_DESIGN",
    };
    let ideaInput = {collection: "idea", doc: idea};
    //2) Index search
    let index = {
        key: id_index_idea,
        data: {
            image_url : "https://media.rnztools.nz/rnz/image/upload/s--ddpMQ0P9--/ar_16:10,c_fill,f_auto,g_auto,q_auto,w_1050/v1624925138/4Q3W9G0_knowledge_3_4795",
        },
        description:"category:#TECHNOLOGY,type:IDEA,title:New idea,subtitle:Subtitle of new idea,status:PRODUCT_DESIGN",
    };
    let indexInput = {collection: "index_search", doc: index};

    //****** Admin section ******//
    // 1) idea_revenue_counter
    // description: revenue
    let date = Date.now();
    let ideaRevDoc = {
        updated_at: [date],
        data: await toArray({
            total_revenue:1,
        }),
        description:["0"],
    };
    let ideaRevInput = ["idea_revenue_counter", id_rev_idea , ideaRevDoc];
    
    // 2) pledges_solution
    // description: user key of the user that pledged
    let pledgeSolDoc = {
        updated_at: [date],
        data: await toArray([]),
        description:["SOL_ID"],
    };
    let pledgeSolInput = ["pledges_solution", id_pledges_sol , pledgeSolDoc];

    // 3) idea_revenue_counter
    // description: user key of the user that pledged
    let IdeaFeatDoc = {
        updated_at: [date],
        data: await toArray({
            pledges: 0,
            expected: 0
        }),
        description:["New idea"],
    };
    let IdeaFeatInput = ["idea_feature_pledge", id_pledges_idea , IdeaFeatDoc];

    //***** First: admin ******/
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const admin = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    let result3 = await admin.setManyDocs([ideaRevInput,pledgeSolInput,IdeaFeatInput])
    

    //***** Second: juno ******/
    await initJuno({
        satelliteId: "svftd-daaaa-aaaal-adr3a-cai",
    });
    let result = await setManyDocs_juno({docs:[indexInput, ideaInput]});
    
    console.log("Increasing idea counter...")
    let result4 = await admin.ideaCounter(idea_id);
    console.log("Done!")
    //***** Print results ******/
    console.log("Done");
    console.log ("Idea creation result: ", result);
    console.log ("Idea creation result admin: ", result3);
    console.log ("Ideas increase result admin: ", result4);

};
export async function CreateFeature(){
    if (get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");

        return;
    }
    let userPrincipal = get(info).key
    console.log("Creating feature...");
    // We need to create documents in collections: feature, index_search
    //  idea_revenue_counter. 
    //THROUGH ADMIN: idea_revenue_counter,idea_feature_pledging
    //THROUGH JUNO: feature, index_search

    let fea_id = nanoid();
    let id_pledges_fea = "PLG_FEA_" + fea_id;
    let id_rev_fea = "REV_FEA_" + fea_id;
    let id_index_fea = "INDEX_" + fea_id;

    //****** Juno section ******/
    //1) Idea
    // idea's title, subtitle, image URL, description, and category.
    let feature = {
        key: fea_id,
        data: {
            title: "New feature",
            subtitle: "Subtitle of new feature",
            image_url : "https://media.rnztools.nz/rnz/image/upload/s--ddpMQ0P9--/ar_16:10,c_fill,f_auto,g_auto,q_auto,w_1050/v1624925138/4Q3W9G0_knowledge_3_4795",
            description: "This is the description of this new feature.",
            category: "Technology"
        },
        description:"#TECHNOLOGY , status:PRODUCT_DESIGN, idea_id:X_ThbidrSb7nOf9oyvkMC"  + "",
    };
    let featureInput = {collection: "feature", doc: feature};
    //2) Index search
    let index = {
        key: id_index_fea,
        data: {
            image_url : "https://media.rnztools.nz/rnz/image/upload/s--ddpMQ0P9--/ar_16:10,c_fill,f_auto,g_auto,q_auto,w_1050/v1624925138/4Q3W9G0_knowledge_3_4795",
        },
        description:"category:#TECHNOLOGY,type:FEATURE,title:New feature,subtitle:Subtitle of new feature,status:PRODUCT_DESIGN",
    };
    let indexInput = {collection: "index_search", doc: index};

    //****** Admin section ******//
    // 1) idea_revenue_counter
    // description: revenue
    let date = Date.now();
    let feaRevDoc = {
        updated_at: [date],
        data: await toArray({
            total_revenue:0,
        }),
        description:["0"],
    };
    let ideaRevInput = ["idea_revenue_counter", id_rev_fea , feaRevDoc];
    

    // 3) idea_feature_pledge
    // description: user key of the user that pledged
    let IdeaFeatDoc = {
        updated_at: [date],
        data: await toArray({
            pledges: 0,
            expected: 0
        }),
        description:["New feature"],
    };
    let IdeaFeatInput = ["idea_feature_pledge", id_pledges_fea , IdeaFeatDoc];

    //***** First: admin ******/
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const admin = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    let result3 = await admin.setManyDocs([ideaRevInput,IdeaFeatInput])

    //***** Second: juno ******/
    await initJuno({
        satelliteId: "svftd-daaaa-aaaal-adr3a-cai",
    });
    let result = await setManyDocs_juno({docs:[indexInput, featureInput]});
    

    //***** Print results ******/
    console.log("Done");
    console.log ("Feature creation result: ", result);
    console.log ("Feature creation result admin: ", result3);

};
export async function pledgeCreate(){
    if (get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");

        return;
    }
    console.log("Creating pledge...");
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const admin = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    //pledgeCreate(doc_key : Text, idea_id : Text, feature_id : Text, amount : Nat64, accounta : Blob
    //toUint8Array()
    const accountIdente = AccountIdentifier.fromPrincipal({principal:Principal.fromText(get(info).key)})
    // Your integer value
    let intValue = 1.2;

    // Convert the integer to BigInt, effectively treating it as Nat64
    let nat64Value = BigInt(intValue * 1e8);
    let result3 = await admin.pledgeCreate(nanoid(),"ihvE-_Z3lDeHVVcP9wKrN","",nat64Value,accountIdente.toUint8Array())
    console.log("Result pledge creation: ", result3);
}; 
export async function pledgeEdit(){
    if (get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");

        return;
    }
    console.log("Editing pledge...");
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const admin = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    //pledgeCreate(doc_key : Text, idea_id : Text, feature_id : Text, amount : Nat64, accounta : Blob
    //toUint8Array()
    const accountIdente = AccountIdentifier.fromPrincipal({principal:Principal.fromText(get(info).key)})
    // Your integer value
let intValue = 0.7;
// pr = 50, amount = 20, accumulated = 645 --> 645+20-50
// Convert the integer to BigInt, effectively treating it as Nat64
let nat64Value = BigInt(intValue * 1e8);
    let result3 = await admin.pledgeEdit("7LU7Zjteq5V2pAKanYXi0","X_ThbidrSb7nOf9oyvkMC","MOLl0kV_4fO1IxMgjnoE1",nat64Value,accountIdente.toUint8Array())
    console.log("Result pledge edition: ", result3);
}; 
export async function WhoAmI(){
    console.log("Who am i...")
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const admin = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    let result3 = await admin.userPrincipal();
    console.log("I am: ", result3)
};

export async function getUserBalance(){
    if (get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");
        return BigInt(0) ;
    }
    const store = get(info);
    let ledgerID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
    console.log(store.agent);
    const { accountBalance } = await LedgerCanister.create({
        // @ts-ignore
        agent: store.agent,
        canisterId: Principal.fromText(ledgerID),
    });
    let userBalance = await accountBalance({
        accountIdentifier: AccountIdentifier.fromPrincipal({
            // @ts-ignore
            principal: store.userPrincipal
        })
    });
    return userBalance;
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

export async function createSolution () {
    if ( get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");
        return;
    }
    let userPrincipal = get(info).key
    console.log("Creating solution...");

    //THROUGH ADMIN: 
    //THROUGH JUNO: solution, index_search, solution_status

    let sol_id =nanoid();
    let sol_stat_id = "SOL_STAT_" + sol_id;
    let id_index_solution = "INDEX_" + sol_id;

    //****** Juno section ******/
    //1) Solution
    // Solution's title, subtitle, image URL, description, and category.
    let solution = {
        key: sol_id,
        data: {
            title: "New solution",
            subtitle: "Subtitle of new solution",
            image_url : "https://media.rnztools.nz/rnz/image/upload/s--ddpMQ0P9--/ar_16:10,c_fill,f_auto,g_auto,q_auto,w_1050/v1624925138/4Q3W9G0_knowledge_3_4795",
            description: "This is the description of this new solution.",
            category: ["Technology","E-commerce"]
        },
        description:"#TECHNOLOGY #E-COMMERCE , idea_id:1TqZBDdoFQnZPEP1vqFXC",
    };
    let solutionInput = {collection: "solution", doc: solution};
    //2) Index search
    let index = {
        key: id_index_solution,
        data: {
            image_url : "https://media.rnztools.nz/rnz/image/upload/s--ddpMQ0P9--/ar_16:10,c_fill,f_auto,g_auto,q_auto,w_1050/v1624925138/4Q3W9G0_knowledge_3_4795",
        },
        description:"category:#TECHNOLOGY #E-COMMERCE,type:SOLUTION,title:New solution,subtitle:Subtitle of new solution",
    };
    let indexInput = {collection: "index_search", doc: index};
    //2) solution_status
    let status = {
        key: sol_stat_id,
        data: {
            title:"New solution",
            image_url : "https://media.rnztools.nz/rnz/image/upload/s--ddpMQ0P9--/ar_16:10,c_fill,f_auto,g_auto,q_auto,w_1050/v1624925138/4Q3W9G0_knowledge_3_4795",
        },
        description:"status:PROPOSAL, owner:" + get(info).key,
    };
    let statusInput = {collection: "solution_status", doc: status};

    

    //***** Second: juno ******/
    await initJuno({
        satelliteId: "svftd-daaaa-aaaal-adr3a-cai",
    });
    let result = await setManyDocs_juno({docs:[indexInput, solutionInput, statusInput]});
    

    //***** Print results ******/
    console.log("Done");
    console.log ("User creation result: ", result);
};

export async function submitSolution(){
    // func solutionSubmit(sol_id : Text, idea_id : Text)
    console.log("Submiting solution q6xiqhV0e9Lg1Keh3Qa2B...");
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const admin = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    let result = await admin.solutionSubmit("q6xiqhV0e9Lg1Keh3Qa2B","X_ThbidrSb7nOf9oyvkMC");
    console.log ("Solution submit result: ", result);
}

export async function changeStatus(){
    // func solutionSubmit(sol_id : Text, idea_id : Text)
    console.log("Changing solution status...");
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const admin = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    let result = await admin.updateSolutionStatus("n4zG5U6PLUTfKcQvZgEFR","completed");
    console.log ("Solution status update result: ", result);
};

export async function aprovedPledgeVerify(){
    console.log("Approving pledge...");
    let intValue = 0.3;
    // Convert the integer to BigInt, effectively treating it as Nat64
    let nat64Value = BigInt(intValue * 1e8);
    
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    // ICRC approve section
    let ledgerID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
      
    const { approve } = IcrcLedgerCanister.create({
        agent,
        canisterId: Principal.fromText(ledgerID),
    });
    const currentTime = Date.now(); // Get current time in milliseconds
    console.log("Current time: ", currentTime);
    let result2 = await approve({spender:{owner: Principal.fromText(canisterId),subaccount:[]},amount:nat64Value});
    console.log("Approval result: ", result2 );
    const admin2 = Actor.createActor(ICRC, {
        agent,
        canisterId:ledgerID,
    });
    let result4 = await admin2.query_blocks({start:result2,length:1});
    console.log("Query blocks result: ", result4 );
    //console.log("These are the transactions: ", result3 );
    // Admin section
    const admin = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    // pledgeApprovedVerify(sol_id : Text, idea_id : Text, amount : Nat64, trans_number : Nat)
    console.log("Pledging...");
    console.log("Amount sending: ", Number(nat64Value));
    let result = await admin.pledgeApprovedVerify("T_BVS86cjl7AqpVn0LyDt","X_ThbidrSb7nOf9oyvkMC",nat64Value, result2 );
    console.log ("Approval result: ", result);
};

export async function  createNewJunoDocument(){
    console.log("Creating new document in juno...")

    let index2 = {
        key: "solutions_completed_counter",
        data: "" ,
        description:"0",
    };
    let indexInput2 = {collection: "solutio_numbers", doc: index2};
    let index3 = {
        key: "transfers_builders_counter",
        data: "" ,
        description:"0",
    };
    let indexInput3 = {collection: "solutio_numbers", doc: index3};
    let index4 = {
        key: "pledges_counter",
        data: "" ,
        description:"0",
    };
    let indexInput4 = {collection: "solutio_numbers", doc: index4};
    let index5 = {
        key: "user_revenue_counter",
        data: "" ,
        description:"0",
    };
    let indexInput5 = {collection: "solutio_numbers", doc: index5};
    let index6 = {
        key: "idea_revenue_counter",
        data: "" ,
        description:"0",
    };
    let indexInput6 = {collection: "solutio_numbers", doc: index6};

    //***** Juno ******/
    await initJuno({
        satelliteId: "svftd-daaaa-aaaal-adr3a-cai",
    });
    let result = await setManyDocs_juno({docs:[indexInput2,indexInput3,indexInput4,indexInput5,indexInput6]});
    

    //***** Print results ******/
    console.log("Done");
    console.log ("Document creation result: ", result);
};

export async function follow(){
    console.log("Following fairtale...");
    let index = {
        key: "2dgol-6t7gr-wbceo-axkyn-3qinp-vxv32-zrqbv-oj6tr-ztuvk-el3ln-3ae_2dgol-6t7gr-wbceo-axkyn-3qinp-vxv32-zrqbv-oj6tr-ztuvk-el3ln-3ae",
        data: "" ,
        description:"",
    };
    let input = {collection: "follow", doc: index};

    //***** Juno ******/
    await initJuno({
        satelliteId: "svftd-daaaa-aaaal-adr3a-cai",
    });

    // await setDoc<Example>({
    //     collection: "my_collection_key",
    //     doc: {
    //       key: "my_document_key",
    //       data: myExample
    //     }
    //   });
    let result1 = await setDoc({collection: input.collection, doc: index});
    console.log("Followed! " + result1);
    console.log("Increasing fairtale's total followers");
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const admin = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    // pledgeApprovedVerify(sol_id : Text, idea_id : Text, amount : Nat64, trans_number : Nat)
    //followerCounter(el_id : Text, instruction : Bool)
    let result = await admin.followerCounter("2dgol-6t7gr-wbceo-axkyn-3qinp-vxv32-zrqbv-oj6tr-ztuvk-el3ln-3ae",true,"user" );
    console.log ("Increasing result: ", result);
};
export async function unfollow(){
    console.log("Unfollowing fairtale...");
    //***** Juno ******/
    await initJuno({
        satelliteId: "svftd-daaaa-aaaal-adr3a-cai",
    });
    
    let result2 = await getDoc({collection:"follow", key:"2dgol-6t7gr-wbceo-axkyn-3qinp-vxv32-zrqbv-oj6tr-ztuvk-el3ln-3ae_2dgol-6t7gr-wbceo-axkyn-3qinp-vxv32-zrqbv-oj6tr-ztuvk-el3ln-3ae"});
    let index = {
        key: "2dgol-6t7gr-wbceo-axkyn-3qinp-vxv32-zrqbv-oj6tr-ztuvk-el3ln-3ae_2dgol-6t7gr-wbceo-axkyn-3qinp-vxv32-zrqbv-oj6tr-ztuvk-el3ln-3ae",
        data: "" ,
        description:"",
        updated_at:result2?.updated_at,
    };
    let result1 = await deleteDoc({collection:"follow", doc:index});


    console.log("Unfollowed!: ", result1);

    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const admin = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    // pledgeApprovedVerify(sol_id : Text, idea_id : Text, amount : Nat64, trans_number : Nat)
    
    console.log("Decreasing fairtale's total followers");
    //followerCounter(el_id : Text, instruction : Bool)
    let result = await admin.followerCounter("2dgol-6t7gr-wbceo-axkyn-3qinp-vxv32-zrqbv-oj6tr-ztuvk-el3ln-3ae",false,"user" );
    console.log ("Decreasing result: ", result);
};

export async function increaseUserRevenue(){
    console.log("Increasing revenue of the user...");
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const admin = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    let intValue = 1.2;

    // Convert the integer to BigInt, effectively treating it as Nat64
    let nat64Value = BigInt(intValue * 1e8);
    let result = await admin.userRevenueCounter(get(info).key,nat64Value);
    console.log ("Revenue increasing result: ", result);
};

export async function createNotification(){
    if ( get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");
        return;
    }
    console.log("Creating notification...");
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const admin = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    
    let result = await admin.createNotification();
    console.log ("Creation result: ", result);
};

export async function deleteElement(){
    if ( get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");
        return;
    }
    console.log("Deleting idea 6moxXV7YDJenlXWeZ7i62...");
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const admin = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    
    let result = await admin.deleteElement("6moxXV7YDJenlXWeZ7i62","idea");
    console.log ("Deletion result: ", result);
};

export async function rejectSolution(){
    if ( get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");
        return;
    }
    console.log("Rejecting solution T_BVS86cjl7AqpVn0LyDt...");
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const admin = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
    
    let result = await admin.solutionReject("T_BVS86cjl7AqpVn0LyDt","X_ThbidrSb7nOf9oyvkMC");
    console.log ("Rejection result: ", result);
};

export async function approveTransaction(){
    if ( get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");
        return;
    };
    console.log("Approving transaction...");
    let intValue = 0.5;
    // Convert the integer to BigInt, effectively treating it as Nat64
    let nat64Value = BigInt(intValue * 1e8);
    let nat64Value_developer = BigInt(intValue * 1e8 * 0.8);
    let nat64Value_ideator = BigInt(intValue * 1e8 * 0.1);
    let nat64Value_solutio = BigInt(nat64Value-nat64Value_developer-nat64Value_ideator); //left overs for solutio
    
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    // ICRC approve section
    let ledgerID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
      
    const { approve } = IcrcLedgerCanister.create({
        agent,
        canisterId: Principal.fromText(ledgerID),
    });
    const currentTime = Date.now(); // Get current time in milliseconds
    console.log("Current time: ", currentTime);
    let result2 = await approve({spender:{owner: Principal.fromText(canisterId),subaccount:[]},amount:nat64Value});
    console.log("Approval result: ", result2 );
    const admin2 = Actor.createActor(ICRC, {
        agent,
        canisterId:ledgerID,
    });
    let result4 = await admin2.query_blocks({start:result2,length:1});
    console.log("Query blocks result: ", result4 );
    //console.log("These are the transactions: ", result3 );
    // Admin section
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId,
    });
    // pledgeApprovedVerify(sol_id : Text, idea_id : Text, amount : Nat64, trans_number : Nat)
    console.log("Amount sending: ", Number(nat64Value));
    // public type Approval = {
    //     sender : Principal;
    //     target : Principal;
    //     amount : Nat;
    //     approval_transaction_number : Nat;
    // };
    let approval1 = {
        sender : Principal.fromText(get(info).key),
        target : Principal.fromText("4mn74-2q4jr-tuf3f-giso4-nqrtg-b2wvc-m33xx-ivv5t-hy2ir-af7hz-zae"),
        amount : nat64Value_developer,
        approval_transaction_number : result2,
    }
    let approval2 = { //Paying Solutio
        sender : Principal.fromText(get(info).key),
        target : Principal.fromText("4mn74-2q4jr-tuf3f-giso4-nqrtg-b2wvc-m33xx-ivv5t-hy2ir-af7hz-zae"), 
        amount : nat64Value_solutio,
        approval_transaction_number : result2,
    }
    let approval3  = { //Sending back
        sender : Principal.fromText(get(info).key),
        target : Principal.fromText(get(info).key), 
        amount : nat64Value_ideator,
        approval_transaction_number : result2,
    }
    let approvals = [approval1,approval2,approval3];
    let result = await escrow.storeApprovals(solution_id,approvals );
    await updateTheReputation();
    console.log("Storing approvals result:", result)
};
export async function removeApproval(){
    if ( get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");
        return;
    };
    console.log("Withdrawing transaction...");
    let intValue = 0;
    // Convert the integer to BigInt, effectively treating it as Nat64
    let nat64Value = BigInt(intValue * 1e8);
    
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    // ICRC approve section
    let ledgerID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
      
    const { approve } = IcrcLedgerCanister.create({
        agent,
        canisterId: Principal.fromText(ledgerID),
    });
    const currentTime = Date.now(); // Get current time in milliseconds
    console.log("Current time: ", currentTime);
    let result2 = await approve({spender:{owner: Principal.fromText(canisterId),subaccount:[]},amount:nat64Value});
    console.log("Approval result: ", result2 );
    const admin2 = Actor.createActor(ICRC, {
        agent,
        canisterId:ledgerID,
    });
    let result4 = await admin2.query_blocks({start:result2,length:1});
    console.log("Query blocks result: ", result4 );
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId,
    });
    
    let result = await escrow.removeApprovals_bySender(solution_id, Principal.fromText(get(info).key));
    console.log("Removing approvals result:", result)
    await editTheReputation();
    // @ts-ignore
    return result;
};
let appr = {
    approval_transaction_number: IDL.Nat,
    sender: IDL.Principal,
    target: IDL.Principal,
    amount: IDL.Nat,
};

/**
 * @return {Promise<appr[] | []>} 
 */
export async function getApprovals(){
    if ( get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");
        return [];
    };
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId,
    });
    
    let result = await escrow.getApprovals(solution_id);
    console.log("Fetching approvals result:", result)
    // @ts-ignore
    return result;
};


export async function completeSolution(){

    if ( get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");
        return;
    };
    console.log("Initializing completion process...");

    
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
   
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId,
    });
    
    let result = await escrow.solutionCompletion(solution_id, idea_id);
    console.log("Solution completion result:", result)
    // @ts-ignore
    return result;

};

let trans = {
    status: IDL.Text,
    created_at: IDL.Nat64,
    sender: IDL.Principal,
    target: IDL.Principal,
    message: IDL.Text,
    project_id: IDL.Text,
    transaction_number: IDL.Opt(IDL.Nat),
    amount: IDL.Nat,
};
/**
 * @return {Promise<trans[] | []>}
 */
export async function getTransactions(){
    if ( get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");
        return [];
    };
    console.log("Getting transactions...");

    
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
   
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId,
    });
    
    let result = await escrow.getTransactionsByProject(solution_id);
    // @ts-ignore
    return result;
};
/**
 * @return {Promise<trans[] | []>}
 * @param {string} target
 */
export async function getTransactions_byTarget(target){
    if ( get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");
        return [];
    };
    console.log("Getting transactions of target " + target +"...");

    
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
   
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId,
    });
    
    let result = await escrow.getTransactionsByTarget(Principal.fromText(target));
    // @ts-ignore
    return result;
};
/**
 * @return {Promise<trans[] | []>}
 * @param {string} target
 */
export async function getTransactions_bySender(target){
    if ( get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");
        return [];
    };
    console.log("Getting transactions of sender " + target +"...");

    
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
   
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId,
    });
    
    let result = await escrow.getTransactionsBySender(Principal.fromText(target));
    // @ts-ignore
    return result;
};
/**
 * @return {Promise<trans[] | []>}
 * @param {string} target
 */
export async function getTransactions_byProject(target){
    if ( get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");
        return [];
    };
    console.log("Getting transactions of project " + target +"...");

    
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
   
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId,
    });
    
    let result = await escrow.getTransactionsByProject((target));
    // @ts-ignore
    return result;
};
let Reputation = {
    amount_promised : IDL.Nat,
    amount_paid : IDL.Nat,
    number : IDL.Nat,
  };
/**
 * @return {Promise<Reputation>}
 * 
 */
export async function getReputation(){
    if ( get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");
        return {
            amount_promised : IDL.Nat,
            amount_paid : IDL.Nat,
            number : IDL.Nat,
        };
    };
    console.log("Getting reputation of principal " + get(info).key +"...");

    
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
   
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId,
    });
    
    let result = await escrow.getUserReputation(Principal.fromText(get(info).key));
    // @ts-ignore
    return result;
};
export async function updateTheReputation(){
    if ( get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");
        return "Not signed in";
    };
    console.log("Updating reputation of principal " + get(info).key +"...");

    
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
   
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId,
    });
    
    let result = await escrow.updateReputation(Principal.fromText(get(info).key), BigInt(0.5*1e8),BigInt(1.2*1e8));
    // @ts-ignore
    return result;
};
export async function editTheReputation(){
    if ( get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");
        return "Not signed in";
    };
    console.log("Updating reputation of principal " + get(info).key +"...");

    
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
   
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId,
    });
    
    let result = await escrow.editReputation(Principal.fromText(get(info).key),BigInt(0*1e8) , BigInt(0*1e8),BigInt(0.5*1e8),BigInt(0*1e8));
    // @ts-ignore
    return result;
};
let revenue = IDL.Nat;
/**
 * @return {Promise<revenue>}
 * @param {string} user
 */
export async function getUser_Revenue(user){
    if ( get(info).key == "" || get(info).key == null) {
        console.log("Not signed in");
        return IDL.Nat;
    };
    console.log("Getting revenue of user " + user +"...");

    
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); // Use the correct network host
   
    const escrow = Actor.createActor(Escrow, {
        agent,
        canisterId,
    });
    
    let result = await escrow.getUserRevenue(Principal.fromText(user));
    // @ts-ignore
    return result;
}