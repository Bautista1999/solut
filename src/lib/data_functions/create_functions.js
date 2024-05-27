import { getDoc, initJuno, setDoc, setManyDocs, unsafeIdentity } from "@junobuild/core-peer";
import { nanoid } from "nanoid";
import {idlFactory as canisterIdl}  from "$lib/declarations/admin.declarations.did.js";
import { Actor, HttpAgent } from "@dfinity/agent";
import { admin_canister_id } from "./canisters";


/**
 * @param {import("$lib/data_objects/data_types").idea} idea
 * @param {Array<import("$lib/data_objects/data_types").feature>} features
 */
export async function setIdea(idea,features){
    let versionGen = [3n];
    if(idea.description.length>1000 || idea.title.length>70 || idea.subtitle.length>200){
        return "ERROR: Fields in idea does not fulfill length requirements";
    };
    if(idea.description.length==0 || idea.title.length==0 || idea.subtitle.length==0){
        let errorDetail = "";
        switch (true) {
            case idea.description.length === 0:
                
                errorDetail= "Description is required.";
                break;
            case idea.title.length === 0:
                errorDetail= "Title is required.";
                break;
            case idea.subtitle.length === 0:
                errorDetail= "Subtitle is required.";
                break;
        }
        return "ERROR: Is required for all fields to be completed. The field " + errorDetail;
    };
    for(let i=0;i<features.length;i++){
        let feature = features[i];
        if(feature.description.length>1000 || feature.title.length>70 || feature.subtitle.length>200){
            return "ERROR: Fields in feature -"+ feature.title +"- does not fulfill length requirements";
        };
        if(feature.title.length==0 || feature.subtitle.length==0){
            let errorDetail = "";
            switch (true) {
                case feature.description.length === 0:
                    errorDetail= "Description is required.";
                    break;
                case feature.title.length === 0:
                    errorDetail= "Title is required.";
                    break;
                case feature.subtitle.length === 0:
                    errorDetail= "Subtitle is required.";
                    break;
            }
            return "ERROR: Is required for all fields to be completed in feature: " + feature.title + ". The field " + errorDetail;
        };
        
    };
    let idea_id = nanoid();
    // Collection we need to update:
    // idea: idea, pledges_solution (admin), idea_feature_pledge(admin), index_search, idea_revenue_counter(admin), solutio_numbers (update idea_counter)(admin), followers(admin)
    // feature: feature, idea_feature_pledge, index_search, idea_revenue_counter, solutio_numbers (update idea_counter), followers
    let ideaDoc = {
        collection:"idea",
        
        doc:{
            key:idea_id,
            description:joinTags(idea.categories),
            data:idea,
        }
    };
    let solutionPledgeDoc = [
        "pledges_solution", "SOL_PL_" + idea_id, { description:["SOL_ID:"] , version:versionGen, data: await toArray([])}
    ];
    let totalPledgeDoc = [
        "idea_feature_pledge","PLG_IDEA_"+idea_id, { description: [idea.title], version:versionGen, data: await toArray({
                pledges:0,
                expected:0, }) }
    ];
    let indexSearchDoc = {
        collection:"index_search",
        doc:{
            key:"INDEX_"+idea_id,
            description:joinTags(idea.categories) +" "+"title:"+idea.title+"subtitle:"+idea.subtitle+"type:idea",
            data:{
                title:idea.title,
                subtitle:idea.subtitle,
                images:idea.images,
                videos:idea.videos,
            },
        }
    };
    let ideaRevenueCounterDoc = [ "idea_revenue_counter","REV_IDEA_"+idea_id,{description:[(0).toString()],version:versionGen, data:await toArray({ total_revenue:0,}),}];
    
    let followersCounterDoc = [
       "followers","FOLL_"+idea_id,
        {
            
            description:[(0).toString()],version:versionGen,
            data: await toArray({
                followers:0,
            }),
        }
    ];
    let arrayDocs = [ideaDoc,indexSearchDoc];
    let arrayDocsAdmin =[solutionPledgeDoc,totalPledgeDoc, ideaRevenueCounterDoc,followersCounterDoc];
    await updateCounter("ideas_counter",1);
    let newDocs = await setManyDocs({docs:arrayDocs});


    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); 
    const canister = Actor.createActor(canisterIdl, { agent, canisterId: admin_canister_id });

    const result = await canister.setManyDocs(arrayDocsAdmin);

    let featuresDocs = await setFeatures(features,idea_id);
    if (typeof featuresDocs === "string") {
        return featuresDocs;
    }else {
        return [...newDocs,...featuresDocs];
    }
    
};

/**
 * @param {Array<import("$lib/data_objects/data_types").feature>} features
 * @param {string} [parentIdea_id]
 */
export async function setFeatures(features, parentIdea_id){
    let versionGen = [3n];
    if(features.length>0){
    /**
     * @type {any[]}
     */
    let arrayDocs=[];
    /**
     * @type {any[]}
     */
    let arrayDocsAdmin=[]
    for(let i=0; i<features.length; i++){
        let idea=features[i];
        let idea_id = nanoid();
        if(idea.title.length==0 || idea.subtitle.length==0){
            let errorDetail = "";
            switch (true) {
               
                case idea.title.length === 0:
                    errorDetail= "Title is required.";
                    break;
                case idea.subtitle.length === 0:
                    errorDetail= "Subtitle is required.";
                    break;
            }
            return "ERROR: Is required for all fields to be completed in feature: " + idea.title + ". The field " + errorDetail;
        };
    // Collection we need to update:
    // feature: feature, idea_feature_pledge, index_search, idea_revenue_counter, solutio_numbers (update idea_counter), followers
        let ideaDoc = {
            collection:"feature",
            
            doc:{
                key:idea_id,
                description:joinTags(idea.categories)+" "+"idea_id:"+parentIdea_id,
                data:idea,
            }
        };
        let totalPledgeDoc = [
            "idea_feature_pledge","PLG_FEA_"+idea_id, { description: [idea.title],version:versionGen, data: await toArray({
                    pledges:0,
                    expected:0, }) }
        ];
        let indexSearchDoc = {
            collection:"index_search",
            doc:{
                key:"INDEX_"+idea_id,
                description:joinTags(idea.categories) +" "+"title:"+idea.title+"subtitle:"+idea.subtitle+"type:feature"+" "+"idea_id:"+parentIdea_id,
                data:{
                    title:idea.title,
                subtitle:idea.subtitle,
                    images:idea.images,
                    videos:idea.videos,
                },
            }
        };
        
        let ideaRevenueCounterDoc = [ "idea_revenue_counter","REV_FEA_"+idea_id,{description:[(0).toString()],version:versionGen, data:await toArray({ total_revenue:0,}),}];
        let followersCounterDoc = [
            "followers","FOLL_"+idea_id,
             {
                 
                 description:[(0).toString()],version:versionGen,
                 data: await toArray({
                     followers:0,
                 }),
             }
        ];
        let otherArray = [ideaDoc,indexSearchDoc, ];
        arrayDocs.push(...otherArray);
        arrayDocs=arrayDocs;
        let otherArrayAdmin = [totalPledgeDoc,ideaRevenueCounterDoc,followersCounterDoc];
        arrayDocsAdmin.push(...otherArrayAdmin);
        arrayDocsAdmin=arrayDocsAdmin;
       
    };
    
    let newDocs = await setManyDocs({docs:arrayDocs});
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); 
    const canister = Actor.createActor(canisterIdl, { agent, canisterId: admin_canister_id });
    const result = await canister.setManyDocs(arrayDocsAdmin);
    await updateCounter("ideas_counter",features.length);
    return newDocs;}
    return [];
};

/**
 * @param {import("$lib/data_objects/data_types").solution} solution
 * @param {string} parentIdea_id
 */
export async function setSolution(solution,parentIdea_id){
    let versionGen = [3n];
   // Collections we need to create:
    // solution: solution, solution_approved, index_search, solution_status,followers
    // Collections we need to update:
    // solution: pledges_solution of idea (description field)

    if(solution.description.length>1000 || solution.title.length>70 || solution.subtitle.length>200){
        return "ERROR: Fields in solution does not fulfill length requirements";
    };
    if(solution.description.length==0 || solution.title.length==0 || solution.subtitle.length==0){
        let errorDetail = "";
        switch (true) {
            case solution.description.length === 0:
                
                errorDetail= "Description is required.";
                break;
            case solution.title.length === 0:
                errorDetail= "Title is required.";
                break;
            case solution.subtitle.length === 0:
                errorDetail= "Subtitle is required.";
                break;
        }
        return "ERROR: Is required for all fields to be completed. The field " + errorDetail;
    };

    let sol_id = nanoid();
    let solutionDoc = {
        collection:"solution",
        doc:{
            key:sol_id,
            description:joinTags(solution.categories)+" "+"idea_id:"+parentIdea_id,
            data:solution,
        }
    };
    let SolPledkey = ("SOL_PL_" + parentIdea_id);
    let descriptionSolPled = "SOL_ID:"+sol_id;
    let solutionPledgeDoc = await updateDocDescription(SolPledkey,descriptionSolPled,"pledges_solution");
    

    let indexSearchDoc = {
        collection:"index_search",
        doc:{
            key:"INDEX_"+sol_id,
            description:joinTags(solution.categories) +" "+"title:"+solution.title+"subtitle:"+solution.subtitle+"type:solution"+" "+"idea_id:"+parentIdea_id,
            data:{
                title:solution.title,
                subtitle:solution.subtitle,
                images:solution.images,
                videos:solution.videos,
            },
        }
    };

    let followersCounterDoc =[ 
        "followers","FOLL_"+sol_id,
        {
            description:[(0).toString()],version:versionGen,
            data:await toArray({
                followers:0,
            }),
        }
    ];
    let solutionApprovedDoc = [
        "solution_approved","SOL_APPR_"+sol_id,
        {
            
            description:[(0).toString()],version:versionGen,
            data:await toArray("")
        }];
    let solutionStatusDoc = [
        "solution_status","SOL_APPR_"+sol_id,
        {
            description:["status:"+"PROPOSAL"],version:versionGen,
            data:await toArray("")
        }
    ];
    let arrayDocs = [solutionDoc,indexSearchDoc];
    let arrayDocsAdmin = [followersCounterDoc,solutionApprovedDoc,solutionStatusDoc];
    let newDocs = await setManyDocs({docs:arrayDocs});
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); 
    const canister = Actor.createActor(canisterIdl, { agent, canisterId: admin_canister_id });
    const result = await canister.setManyDocs(arrayDocsAdmin);
    let solutionCounter = await updateCounter("solutions_counter",1);
    return newDocs;
};
/**
 * @param {import("$lib/data_objects/data_types").user} user
 * @param {string} userKey
 */
export async function setUser(user, userKey){
    let versionGen = [3n];
    let userDoc = {
        collection:"user",
        doc:{
            key:userKey,
            description:"username:"+user.username,
            data:user,
        }
    };
    
    

    let indexSearchDoc = {
        collection:"user_index",
        doc:{
            key:"INDEX_"+userKey,
            description:"username:"+user.username,
            data:{
                images:[user.profilePicture,...user.images],
                videos:user.videos,
            },
        }
    };

    let followersCounterDoc = [
        "followers", "FOLL_"+userKey,
        {
            
            description:[(0).toString()],
            version:versionGen,
            data:await toArray({
                followers:0,
            }),
        }
    ];

    let reputationDoc = [
        "reputation", "REP_"+userKey,
        {
            description:[(0).toString()],version:versionGen,
            data: await toArray({ 
                amount_paid: 0 ,
                amount_promised: 0 
                 })
        }
    ];
    let userRevenueCounterDoc = [
       "users_revenue_counter","REV_"+userKey,
       {
       
            description:[(0).toString()],version:versionGen,
            data: await toArray({
                total_revenue:0,
            }),
        }
    ];
    let arrayDocs = [userDoc,indexSearchDoc];
    let arrayDocsAdmin=[followersCounterDoc,reputationDoc,userRevenueCounterDoc];
    let newDocs = await setManyDocs({docs:arrayDocs});
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); 
    const canister = Actor.createActor(canisterIdl, { agent, canisterId: admin_canister_id });
    const result = await canister.setManyDocs(arrayDocsAdmin);
    let usersCounter = await updateCounter("users_counter",1);
    return newDocs;
};



/**
 * @param {string} description
 * @param {string} k
 * @param {string} collection
 */
export async function updateDocDescription( k,description, collection){
    let versionGen = [3n];
    let newDoc = await getDoc(
        {collection:collection,
            key:k,
        },
    );

    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); 
    const canister = Actor.createActor(canisterIdl, { agent, canisterId: admin_canister_id });

    let version = newDoc?.version ? BigInt(newDoc.version) : 3n;
    if (newDoc === undefined){
        let input = [ collection,k,{description:[description], data:await toArray(""), version:versionGen}];
        await canister.setManyDocs([input]);
    }else{
        const updateDoc = await canister.setManyDocs([[collection,k,{description:[description],data:await toArray(newDoc?.data),version:[version]}]]);
        return updateDoc;
    }

    
};

/**
 * @param {number} amount
 * @param {string} key
 */
async function updateCounter(key,amount){
    let versionGen = [3n];
    let counterDoc = await getDoc({
        collection:"solutio_numbers",
        key: key,
    });
    
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); 
    const canister = Actor.createActor(canisterIdl, { agent, canisterId: admin_canister_id });


    if (counterDoc === undefined) {
   
        let input = [ "solutio_numbers",key,{description:[amount.toString()], data:await toArray(""), version:versionGen}];
        await canister.setManyDocs([input]);
    } else {
        
        if (counterDoc === undefined) {
            let input = [
                "solutio_numbers",
                key,
                { description: [amount.toString()], data: await toArray(""), version: [] }  // Optional field syntax
            ];
            await canister.setManyDocs([input]);
        } else {
            let version = counterDoc?.version ? BigInt(counterDoc.version) : 3n; // Ensure version is BigInt
            let input = [
                "solutio_numbers",
                key,
                {
                    version: [version],  // Optional field syntax with BigInt
                    description: [(Number(counterDoc?.description) + amount).toString()],
                    data: await toArray("")
                }
            ];
            await canister.setManyDocs([input]);
        }
        
    }
};

/**
 * @param {string[]} tags
 */
function joinTags(tags){
    return tags.map(item => `#${item}`).join('');
};

export const toArray = async (/** @type {any} */ data) => {
    const blob = new Blob([JSON.stringify(data)], {
      type: 'application/json; charset=utf-8'
    });
    return new Uint8Array(await blob.arrayBuffer());
  };
