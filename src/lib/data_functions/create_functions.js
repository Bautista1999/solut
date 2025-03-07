import { authSubscribe, deleteDoc, getDoc, setDoc, setManyDocs, unsafeIdentity } from "@junobuild/core-peer";
import { nanoid } from "nanoid";
import {idlFactory as canisterIdl}  from "$lib/declarations/admin.declarations.did.js";
import { Actor, HttpAgent } from "@dfinity/agent";
import { admin_canister_id } from "./canisters";
import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
import { getUserKey } from "./get_functions";
import { createAndUploadHTMLStaticFile } from "$lib/SEO and metadata/metadata_functions";
// import { trackEvent } from "@junobuild/analytics";
import { createIdeas, createOrUpdateIdea, createOrUpdateSolution, createOrUpdateTopic, deleteManyImages, eliminateIdea, eliminateSolution, eliminateTopic, uploadImage } from "../../declarations/satellite/satellite.api";


/**
 * @param {import("$lib/data_objects/data_types").idea} idea
 * @param {Array<import("$lib/data_objects/data_types").feature>} features
 * @param {string} key
 */
export async function setIdea(idea,features, key){
    
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
        if(feature.description.length>3000 || feature.title.length>70 || feature.subtitle.length>200){
            alert("ERROR: One of the fields of the ideas is exceeding its limits.")
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
    let idea_id = key;
    


   
    // trackEvent({
    //     name: "Topics created",
    //     metadata: {
    //       title: idea.title,
    //       key: idea_id
    //     }
    //   });
    let featuresDocs = await setFeatures(features,idea_id);
    followElement(idea_id,"idea");
    
    const creationResult = await createOrUpdateTopic(idea_id, idea);
    if ("Ok" in creationResult) {
        return idea_id; // Success: Return the key of the newly created topic
    } else if ("Err" in creationResult) {
        return "ERROR: " + creationResult.Err; // Backend error
    }
    
    return "ERROR: Unknown error occurred";
};
/**
 * @param {import("$lib/data_objects/data_types").idea} idea
 * @param {string} key
 */
export async function updateTopic(key, idea){
    return await createOrUpdateTopic(key,idea);
}


/**
 * Creates or updates a single feature in the database.
 * 
 * @param {import("$lib/data_objects/data_types").feature} feature - The feature data to create/update.
 * @param {string} parentIdeaId - The ID of the parent idea for this feature.
 * @param {string} key
 * @returns {Promise<string>} The feature ID if successful, or an error message if validation fails.
 */
export async function setFeature(feature, parentIdeaId, key) {


    // Check required fields
    if (feature.description.length === 0 || feature.title.length === 0 || feature.subtitle.length === 0) {
        let missingField = '';
        if (feature.description.length === 0) missingField = 'Description';
        else if (feature.title.length === 0) missingField = 'Title';
        else if (feature.subtitle.length === 0) missingField = 'Subtitle';

        return `ERROR: ${missingField} is required in feature.`;
    }

    // Generate a unique ID for the feature if it's a new creation
    const featureId = key;

    // Prepare the feature data structure for backend processing
    try {
        const result = await createOrUpdateIdea(featureId, feature, parentIdeaId);  // Calls Rust function on the backend

        if ("Ok" in result) {
            // Return the feature ID if the backend operation was successful
            return featureId;
        } else if ("Err" in result) {
            // If there's an error from the backend, return it directly
            return   "ERROR: " + result.Err; // Backend error result.Err;
        }
    } catch (e) {
        // Handle any other errors and return them for display
        return `ERROR: Failed to create feature. Details: ${String(e)}`;
    }
    return "ERROR: Unknown error occurred";
}

/**
 * @param {import("$lib/data_objects/data_types").idea} idea
 * @param {string} key
 * @param {string} parentIdea_id
 */
export async function updateIdea(key, idea, parentIdea_id){
    return await createOrUpdateIdea(key,idea, parentIdea_id);
}

/**
 * @param {Array<import("$lib/data_objects/data_types").feature>} features
 * @param {string} parentIdea_id - ID of the parent idea
 */
export async function setFeatures(features, parentIdea_id) {
    if (features.length === 0) return []; // If no features, return an empty array
    
    // Prepare each feature for the backend function, ensuring validation and key assignment
    const setIdeas = features.map(feature => {
        // Generate a unique ID for each feature
        const idea_id = nanoid();

        // Perform client-side validation for required fields
        if (feature.title.length === 0 || feature.subtitle.length === 0) {
            let errorDetail = feature.title.length === 0 ? "Title is required." : "Subtitle is required.";
            return `ERROR: ${errorDetail} in feature: ${feature.title}`;
        }

        // Create static HTML and track events on the frontend as before
        // trackEvent({
        //     name: "Ideas created",
        //     metadata: {
        //         title: feature.title,
        //         key: idea_id
        //     }
        // });

        // Return each feature structured for the backend function
        return { key: idea_id, idea: feature };
    });

    // Attempt to create all features on the backend and handle any errors
    try {
        const result = await createIdeas(setIdeas, parentIdea_id);

        if ("Ok" in result) {
            return setIdeas.map(idea => (idea)); // Return an array of keys if successful
        } else if ("Err" in result) {
            return   "ERROR: " + result.Err; // Return the error message if failed
        }
    } catch (e) {
        console.error("Failed to create ideas:", e);
        return `ERROR: ${String(e)}`;
    }
}


/**
 * @param {import("$lib/data_objects/data_types").solution} solution
 * @param {string} parentIdea_id
 * @param {string} key
 */
export async function setSolution(solution, parentIdea_id, key) {
   

    if (solution.description.length === 0 || solution.title.length === 0 || solution.subtitle.length === 0 || solution.features.length === 0) {
        let errorDetail = "";
        switch (true) {
            case solution.description.length === 0:
                errorDetail = "Description is required.";
                break;
            case solution.title.length === 0:
                errorDetail = "Title is required.";
                break;
            case solution.subtitle.length === 0:
                errorDetail = "Subtitle is required.";
                break;
            case solution.features.length === 0:
                errorDetail = "At least one feature needs to be implemented.";
                break;
        }
        return "ERROR: All fields must be completed. The field " + errorDetail;
    }

    // Check if parent idea exists (for validation)
    let ideaDoc = await getDoc({
        collection: "idea",
        key: parentIdea_id
    });
    if (!ideaDoc) {
        return "ERROR: The parent idea does not exist!";
    }

    // Generate a unique key for the solution
    let sol_id = key;

    // Prepare the solution object to send to the backend
    const solutionData = {
        title: solution.title,
        subtitle: solution.subtitle,
        description: solution.description,
        images: solution.images,
        videos: solution.videos,
        categories: solution.categories,
        features: solution.features,
        milestones: (solution.milestones)
    };

    // Call the backend function to create or update the solution
    try {
        const result = await createOrUpdateSolution(sol_id, solutionData, parentIdea_id);

        if ("Ok" in result) {
            // Track event and notify user if creation succeeded
            // trackEvent({
            //     name: "Solution created",
            //     metadata: {
            //         title: solution.title,
            //         key: sol_id
            //     }
            // });

            // Send notification about the solution creation
            const newNotification = {
                title: "New Solution Proposed!",
                subtitle: `A solution has been proposed for the idea ${ideaDoc.data.title}. Check it out!`,
                imageURL: solution.images[0] || "",
                linkURL: `/solution/${sol_id}`,
                sender: await getUserKey(),
                description: "",
                typeOf: "solution proposal"
            };

            createNotification(newNotification, parentIdea_id);

            return sol_id; // Return the solution key if successful
        } else if ("Err" in result) {
            return   "ERROR: " + result.Err; ; // Return error message from the backend if failed
        }
    } catch (e) {
        console.error(e);
        return String(e); // Return any unexpected errors
    }
    return "ERROR: Unknown error occurred";
}

/**
 * @param {import("$lib/data_objects/data_types").solution} solution
 * @param {string} key
 *  @param {string} parentIdea_id
 */
export async function updateSolution(key, solution,parentIdea_id){
    return await createOrUpdateSolution(key,solution,parentIdea_id);
}

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
    let arrayDocsAdmin=[reputationDoc,userRevenueCounterDoc];
    let newDocs = await setManyDocs({docs:arrayDocs});
    let identity = await unsafeIdentity();
    const agent = new HttpAgent({ identity: identity, host: "https://ic0.app" }); 
    const canister = Actor.createActor(canisterIdl, { agent, canisterId: admin_canister_id });
    const result = await canister.setManyDocs(arrayDocsAdmin);
    let usersCounter = await updateCounter("users_counter",1);
    // trackEvent({
    //     name: "Users registered",
    //     metadata: {
    //         name: user.username,
    //         id: userKey
    //     }
    //   });
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
    if(await CheckIfFollow(element_id)){
        return "Already following"
    }
    authSubscribe(async(user)=>{
            let doc =  await setDoc({
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
            let adminFollowerCounterUpdate = await canister.followerCounter(element_id,true,type);
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
                    // trackEvent({
                    //     name: "Solutions delivered",
                    //     metadata: {
                    //         title: solDoc.data.title,
                    //         key: solution_id,
                    //         link: link
                    //     }
                    //   });
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
    // trackEvent({
    //     name: "Users invited",
    //     metadata: {
    //         inviter_key: inviterKey,
    //         invited_user_key:userKey,
    //     }
    //   });
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

/**
 * @param {string} sol_id
 */
export async function deleteSolution(sol_id){
    return await eliminateSolution(sol_id);
}

/**
 * @param {String} idea_id
 */
export async function deleteIdea(idea_id){
    return await eliminateIdea(idea_id);
}

/**
 * @param {String} topic_id
 */
export async function deleteTopic(topic_id){
    return await eliminateTopic(topic_id);
}


/**
 * @param {string} collection
 * @param {any} images
 */
export async function deleteImages(collection , images){
    let result =  await deleteManyImages(collection,images);
    return result
}

/**
 * @param {string} collection
 * @param {any} images
 */
export function deleteImagesAsynchronously(collection , images){
    console.log("Calling it...");
    deleteManyImages(collection,images);
    console.log("Called!");
}

/**
 * @param {string} collection
 * @param {{type: any;arrayBuffer: () => any;}} file
 * @param {string} element_id
 * @param {string} element_type
 * @param {string} name
 */
export async function saveImageDatabase(collection, file, element_id, element_type, name){
    const imageName = name;
    const contentType = file.type;
    // Convert file to ArrayBuffer, then to Uint8Array, and finally to an array of bytes
    const arrayBuffer = await file.arrayBuffer();
    const imageData = Array.from(new Uint8Array(arrayBuffer)); // Ensures correct Vec<u8> format

    return await uploadImage(
        collection,
        imageName,
        imageData, element_id,
        element_type,
        
        contentType,
    );   
}


