import { authSubscribe, deleteDoc, getDoc, setDoc, setManyDocs, unsafeIdentity } from "@junobuild/core-peer";
import { nanoid } from "nanoid";
import {idlFactory as canisterIdl}  from "$lib/declarations/admin.declarations.did.js";
import { Actor, HttpAgent } from "@dfinity/agent";
import { admin_canister_id } from "./canisters";
import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
import { getUserKey } from "./get_functions";
import { createAndUploadHTMLStaticFile } from "$lib/SEO and metadata/metadata_functions";


/**
 * @param {import("$lib/data_objects/data_types").idea} idea
 * @param {Array<import("$lib/data_objects/data_types").feature>} features
 */
export async function setIdea(idea,features){
    let versionGen = [0n];
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
            description:joinTags(idea.categories) +" "+"title:"+idea.title+"subtitle:"+idea.subtitle+"type:topic",
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
    createAndUploadHTMLStaticFile(idea.title,idea_id,idea.subtitle,idea.images[0],"topic");


    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); 
    const canister = Actor.createActor(canisterIdl, { agent, canisterId: admin_canister_id });

    const result = await canister.setManyDocs(arrayDocsAdmin);

    let featuresDocs = await setFeatures(features,idea_id);
    followElement(idea_id,"idea");
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
        followElement(idea_id,"feature");
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
                description:joinTags(idea.categories) +" "+"title:"+idea.title+"subtitle:"+idea.subtitle+"type:idea"+" "+"idea_id:"+parentIdea_id,
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
        createAndUploadHTMLStaticFile(idea.title,idea_id,idea.subtitle,idea.images[0],"idea");
       
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
    if(solution.description.length==0 || solution.title.length==0 || solution.subtitle.length==0 || solution.features.length==0){
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
            case solution.features.length === 0:
                errorDetail= "At least one feature needs to be implemented";
                break;
        }
        return "ERROR: Is required for all fields to be completed. The field " + errorDetail;
    };

    let ideaDoc = await getDoc({
        collection:"idea",
        key:parentIdea_id
    });
    if(ideaDoc==undefined){
        return "The idea doesnt exist!";
    }

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
        "solution_status","SOL_STAT_"+sol_id,
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
    let solutionCounter = updateCounter("solutions_counter",1);
    createAndUploadHTMLStaticFile(solution.title,sol_id,solution.subtitle,solution.images[0],"solution");
    /**
    * @type {import("$lib/data_objects/data_types").Notification}
    */
    let newNotification={
        title: "Solution proposed!",
        subtitle: "A solution was already delivered for the idea "+ ideaDoc.data.title +". You can check it out!",
        imageURL: solution.images[0],
        linkURL: "/solution/"+sol_id,
        sender: await getUserKey(),
        description: "",
        typeOf: "solution proposal"
    };
    let description = parentIdea_id;
    createNotification(newNotification,description);
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
            description:[(50).toString()],version:versionGen,
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


/**
 * @param {string} element_id
 * @return {Promise<string>}
 * @param {string} type
 */
export async function followElement(element_id,type){
    if(!(await CheckIfSignedIn())){
        return "Following fail";
    }
    authSubscribe(async(user)=>{
            let doc =  setDoc({
                collection:"follow",
                doc:{
                    key:user?.key+"_"+element_id,
                    description:type,
                    /**@type {import("$lib/data_objects/data_types").follow} */
                    data:{
                        follower:user?.key?user.key:"",
                        following:element_id,
                        type:type,
                    }
                }
                
            })
            
            let identity = await unsafeIdentity();
            const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); 
            const canister = Actor.createActor(canisterIdl, { agent, canisterId: admin_canister_id });
            let adminFollowerCounterUpdate = canister.followerCounter(element_id,true,type);
            console.log("doc",adminFollowerCounterUpdate)
    })
    return "Success";
    
}
/**
 * @param {string} element_id
 * @return {Promise<string>}
 * @param {string} type
 */
export async function unFollowElement(element_id,type){
    if(!(await CheckIfSignedIn())){
        return "Unfollowing fail";
    }
    authSubscribe(async(user)=>{
        let DocToDelete = await getDoc({
            collection:"follow",
            key:user?.key+"_"+element_id,
        });
        if(DocToDelete==undefined){
            return "Unfollowing fail";
        }else{
            let doc = deleteDoc({
                collection:"follow",
                doc:{
                    key:user?.key+"_"+element_id,
                    description:type,
                    version:DocToDelete.version,
                    updated_at:DocToDelete.updated_at,
                    data:[]
                }
            })
            let identity = await unsafeIdentity();
            const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); 
            const canister = Actor.createActor(canisterIdl, { agent, canisterId: admin_canister_id });
            let adminFollowerCounterUpdate = canister.followerCounter(element_id,false,type);
        }           
    })
    return "Success";
}

/**
 * @param {string} element_id
 * @return {Promise<boolean>}
 */
export async function CheckIfFollow(element_id){
    if(!(await CheckIfSignedIn())){
        return false;
    }
    return new Promise((resolve) => {
        authSubscribe(async (user) => {
            let followerDoc = await getDoc({
                collection: "follow",
                key: user?.key + "_" + element_id,
            });
            if (followerDoc == undefined) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

/**
 * @param {string} solution_id
 * @return {Promise<string>}
 * @param {string} link
 */
export async function deliverSolution(solution_id, link){
    if(link==""|| link==" " ){
        throw new Error("You must provide a working link");
    }
    if(!isValidURL(link)){
        throw new Error("You must provide a working link");
    }
    return new Promise((resolve,reject)=>{
        authSubscribe(async (user) => {
            let solDoc = await getDoc({
                collection: "solution",
                key: solution_id,
            });
            if (solDoc == undefined) {
                return reject(new Error("Solution doesnt exist"));
            } else {
                if(solDoc.owner!=user?.key){
                    return reject(new Error("Signed in user not the owner of the solution!"));
                };
                let identity = await unsafeIdentity();
                const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); 
                const canister = Actor.createActor(canisterIdl, { agent, canisterId: admin_canister_id });
                try{
                    let statusUpdate = canister.updateSolutionStatus(solution_id,"DELIVERED");
                    console.log("Solution Status update result: ", statusUpdate)

                    /**
                    * @type {import("$lib/data_objects/data_types").SolutionDelivery} 
                    */
                    let dataDoc = {
                        link:link,
                        type:"link",
                        image:solDoc.data.images[0]?solDoc.data.images[0]:"",
                        video:solDoc.data.videos[0]?solDoc.data.videos[0]:"",
                    };
                    let setDeliveryDoc = await setDoc({
                        collection:"solution_delivery",
                        doc:{
                            key:"DEL_"+solution_id,
                            data: dataDoc,
                            version:0n,
                        }
                    });
                    /**
                     * @type {import("$lib/data_objects/data_types").Notification}
                     */
                    let newNotification={
                        title: "Solution delivered!",
                        subtitle: solDoc.data.title +" was already delivered. You can check it out!",
                        imageURL: solDoc.data.images[0],
                        linkURL: "/solution/"+solution_id,
                        sender: solDoc.data.owner,
                        description: "",
                        typeOf: "delivery"
                    };
                    let description = solution_id;
                    createNotification(newNotification,description);
                    resolve("Success");
                }
            catch(e){
                return reject( new Error (String(e)));
            }
            
            
            }
        });
    });
};

/**
 * @param {string | URL} string
 */
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * @param {string} inviterKey
 */
export async function setInvitationDocument(inviterKey){
    let userKey =  await getUserKey();
    let key = userKey + "_" + inviterKey;
    let data = {
        inviter : inviterKey,
        user: userKey,
    }
    let createDoc = await setDoc({
        collection: "invites",
        doc: {
            key:key,
            data:data,
            version:0n,
        }
    });
}

/**
 * @param {import("$lib/data_objects/data_types").Notification} notification
 * @param {string} description
 */
export async function createNotification(notification,description){
    let key = nanoid();
    let input = [
        "notification",
        key,
        {
            version: [0n],  // Optional field syntax with BigInt
            description: [description],
            data: await toArray(notification)
        }
    ];
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); 
    const canister = Actor.createActor(canisterIdl, { agent, canisterId: admin_canister_id });
    await canister.setManyDocs([input]);
}

export async function createMultipleNotifications(){
    
}


/**
 * @param {string} sol_id
 * @param {string} status
 */
export async function updateSolutionStatus (sol_id,status){
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); 
    const canister = Actor.createActor(canisterIdl, { agent, canisterId: admin_canister_id });
    try{
        let statusUpdate = canister.updateSolutionStatus(sol_id,status);
        console.log("Solution Status update result: ", statusUpdate)

        return ("Success");
    }
catch(e){
    throw new Error (String(e));
}
}