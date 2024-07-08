import { UserKey } from "$lib/stores/other_stores";
import { authSubscribe, getDoc,getManyDocs ,initJuno, listDocs } from "@junobuild/core-peer";
import { setLastNotificationRead } from "./notifications";

/**
 * @param {string} element_id
 * @return {Promise<number>}
 */
export async function getTotalFollowers(element_id) {
   
    let doc = await getDoc({
        collection: "followers",
        key: "FOLL_"+element_id,
    });
    let docs = await listDocs({
        collection:"follow",
        filter:{
            matcher:{
                key:"_"+element_id
            }
        }
    })
    if(doc==undefined){
        return 0;
    }else{
        return Number(docs.items_length);
    }
}

/**
 * @param {string} idea_id
 * @return {Promise<{amount:number,users:Array<import("$lib/data_objects/data_types").UserProfilePic>}>}
 */
export async function getAmountPledgersAndImages(idea_id){
    let pledgers = await getArrayPledgers(idea_id);
    let profilePledgers = await getUserImages(pledgers);
    
    return {
        amount : pledgers.length,
        users: profilePledgers,
    }
   
}

/**
 * @param {string} project_id
 * @return {Promise<string[]>}
 */
export async function getArrayPledgers (project_id){
    let docs = await listDocs({
        collection: "pledges_active",
        filter:{
            matcher:{
                description:project_id,
            }
        }
    });
    
    /**
     * @type {string[]}
     */
    let users = [];
    if(docs.items.length==0){
        return [];
    }else{
        for(let i=0;i<docs.items.length;i++){
            let pledgeCreator = docs.items[i].data.user;
            if(users.indexOf(pledgeCreator)==-1){
                users.push(pledgeCreator);
                users=users;
            }
        }
    }    
    return users;
}

/**
 * @param {string[]} users_ids
 * @return {Promise<Array<import("$lib/data_objects/data_types").UserProfilePic>>}
 */
export async function getUserImages(users_ids){

    if(users_ids.length==0){
        return [];
    }
    /**
     * @type {any[]}
     */
    let docs = [];
    for(let i = 0; i<users_ids.length;i++){
        let doc = {
            collection:"user_index",
            key:"INDEX_"+users_ids[i]
        };
        docs.push(doc);
        docs=docs;
    }
    let somePledgers = await getManyDocs({
        docs:docs,
    });

    /**
     * @type {{ key: string; image: string; }[] | PromiseLike<{ key: string; image: string; }[]>}
     */
    let users = [];
    for(let i =0; i<somePledgers.length;i++){
        if(somePledgers[i]!=undefined){
            let user = {
                key:somePledgers[i]?.owner,
                image: somePledgers[i]?.data.images[0],
            };
            // @ts-ignore
            users.push(user);
            users=users;
        }
    }
    return users;

    
}

/**
 * @param {string} idea_id
 * @return {Promise<Array<import("@junobuild/core-peer").Doc<any>>>}
 */
export async function getFeaturesOfIdea(idea_id){
    let docs = await listDocs({
        collection:"index_search",
        filter:{
            matcher:{
                description: idea_id,
            }
        }
    })
    let results = docs.items.filter((doc) => {
        if (doc.description == undefined) {
        } else {
            return !doc.key.includes(idea_id)&&!doc.description.includes("type:"+"solution");
        }
    });
    results = results;
    return results;
};


/**
 * @param {string} solution_id
 * @param {string} idea_id
 * @return {Promise<Array<import("@junobuild/core-peer").Doc<any>>>}
 */
export async function getFeaturesOfSolution(idea_id,solution_id){
    let featuresList = await getImplementedFeaturesOfSolution(solution_id);
    let docs = await listDocs({
        collection:"index_search",
        filter:{
            matcher:{
                description: idea_id,
            }
        }
    })
    let results = docs.items.filter((doc) => {
        if (doc.description == undefined) {
        } else {
            return !doc.key.includes(idea_id)&&!doc.description.includes("type:"+"solution")&&featuresList.includes(doc.key.substring(6,doc.key.length));
        }
    });
    results = results;
    return results;
};

/**
 * @param {string} userKey
 * @return {Promise<string>}
 */
export async function getUsername(userKey){
    let doc = await getDoc({
        collection:"user_index",
        key:"INDEX_"+userKey
    });
    if(doc==undefined){
        return userKey;
    }else{
        if(doc.description!=undefined){
            return doc.description.substring(9,doc.description?.length);
        }
    }
    return userKey;

}


/**
 * @param {string} idea_id
 */
export async function SolutionLink(idea_id){
    let docs = await listDocs({
        collection: "solution",
        filter:{
            matcher:{
                description:idea_id,
            }
        }
    });
    if(docs.items.length==0){
        return "";
    }else{
        return docs.items[0].key;
    }
};


/**
 * @param {string} input
 * @return {string}
 */
export function extractIdeaIdFromString(input) {
    const match = input.match(/idea_id:([\w-]+)/);
    return match ? match[1] : "";
}


/**
 * @param {string} project_id
 * @return {Promise<string>}
 */
export async function getProjectTitleFromKey(project_id){
    let projectDoc = await getDoc({
        collection: "index_search",
        key: "INDEX_"+project_id
    })
    if (projectDoc==undefined){
        return "";
    }else{
        if(projectDoc.data.title==undefined){
            return "";
        }else{
            return projectDoc.data.title;
        }
    }
}

/**
 * @param {string} project_id
 * @return {Promise<string>}
 */
export async function getSolutionStatus(project_id){
    let solStatusDoc = await getDoc({
        collection: "solution_status",
        key: "SOL_STAT_"+project_id
    })
    if(solStatusDoc==undefined){
        return "Not defined";
    }else{
        if(solStatusDoc.description==undefined){
            return "Not defined";
        }else{
            return ExtractStatus(solStatusDoc.description);
        }
    }
}



/**
 * Extracts the status from a given string.
 * @param {string} str - The input string in the format "status:STATUS,owner:OWNER_KEY" or "status:STATUS".
 * @return {string} - The extracted status.
 */
function ExtractStatus(str) {
    const statusMatch = str.match(/status:\s*([^,]+)/);
    if (statusMatch && statusMatch[1]) {
        return statusMatch[1].trim().toLowerCase();
    } else {
        throw new Error("Status not found in the input string");
    }
}

/**
 * @param {string} project_id
 * @return {Promise<string>}
 */
export async function getDeliveryLink(project_id){
    let solDeliveryDoc = await getDoc({
        collection: "solution_delivery",
        key: "DEL_"+project_id
    })
    if(solDeliveryDoc==undefined){
        throw new Error ("Solution delivery doc not found!");
    }else{
        return  solDeliveryDoc.data.link;
    }
}

/**
 * @param {string} solution_id
 * @return {Promise<Array<string>>}
 */

export async function getImplementedFeaturesOfSolution(solution_id){
    let solutionDoc = await getDoc({
        collection: "solution",
        key:solution_id,
    });
    if(solutionDoc==undefined){
        return [];
    }else{
        /**
        * @type {Array<string>} 
        */
        return solutionDoc.data.features;
    }
}

 /**
* @return {Promise<string>} 
 */
export function getUserKey(){
    return new Promise((resolve) => 
    {authSubscribe((user)=>{
        if(user==undefined){
            resolve("");
        }else{
            UserKey.set(user.key)
            resolve(user.key);
        }
    })})
}

/**
 * @param {string} solution_id
 * @return {Promise<string>}
 */
export async function getIdeaIdBySolution(solution_id){
    let solutionDoc = await getDoc({
        collection:"solution",
        key:solution_id,
    });
    if(solutionDoc==undefined){
        throw new Error("Solution document not found");
    }else{
        if(solutionDoc.description==undefined){
            throw new Error("Description missing");
        }else{
            if(ExtractIdeaFromDescription(solutionDoc.description)==""){
                throw new Error("Idea_id couldnt be exctracted from solution"); 
            }else{
                return ExtractIdeaFromDescription(solutionDoc.description);
            }
            
        }
    }
}

/**
 * @param {string} description
 */
function ExtractIdeaFromDescription(description){
    const match = description.match(/idea_id:(\S+)/);
    return match ? match[1] : "";
}

/**
 * @param {string} feature_id
 * @return {Promise<string>}
 */
export async function getIdeaIdByFeature(feature_id){
    let featureDoc = await getDoc({
        collection:"feature",
        key:feature_id,
    });
    if(featureDoc==undefined){
        throw new Error("Solution document not found");
    }else{
        if(featureDoc.description==undefined){
            throw new Error("Description missing");
        }else{
            if(ExtractIdeaFromDescription(featureDoc.description)==""){
                throw new Error("Idea_id couldnt be exctracted from solution"); 
            }else{
                return ExtractIdeaFromDescription(featureDoc.description);
            }
            
        }
    }
}
/**
 * @param {string} solution_id
 * @param {string} feature_id
 * @return {Promise<boolean>}
 */
export async function CheckIfFeatureIsImplemented(solution_id,feature_id){
    let solutionDoc = await getDoc({
        collection: "solution",
        key:solution_id,
    });
    if(solutionDoc==undefined){
        throw new Error("Solution doc not found")
    }else{
        /**
        * @type {Array<string>} 
        */
        return solutionDoc.data.features.includes(feature_id);
    }
}

/**
 * @param {number} amount
 * @return {Promise<Array<{key:string,data:import("$lib/data_objects/data_types").IndexDataReturn}>>}
 */
export async function getMostFollowedIdeas(amount){
    let userKey = await getUserKey();
    let followedIdeas = await listDocs({
        collection:"follow",
        filter:{
            paginate:{
                limit:amount
            },
            matcher:{
                description:"idea",
            },
            owner: userKey,
            order:{
                desc:true,
                field: 'created_at',
            }
        }
    })

    if(followedIdeas.items.length==0){
        return [];
    }else{
        /**
     * @type {any[]}
     */
    let docs = [];
    for(let i = 0; i<followedIdeas.items.length;i++){
        let doc = {
            collection:"index_search",
            key:"INDEX_"+extractSubstring(followedIdeas.items[i].key),
        };
        docs.push(doc);
        docs=docs;
    }
    let ideasDocs = await getManyDocs({
        docs:docs,
    });
    /**
    * @type {Array<{key:string,data:import("$lib/data_objects/data_types").IndexDataReturn}>}
    */
    let ideasInformation = [];
    for(let i=0; i<ideasDocs.length;i++){
        if(ideasDocs[i]!=undefined){
            let newIdeaIndexInfo = {
                key:ideasDocs[i]?.key.substring(6),
                data:ideasDocs[i]?.data,
            }
            // @ts-ignore
            ideasInformation.push(newIdeaIndexInfo)
            ideasInformation=ideasInformation;
        }
    };
    return ideasInformation;


    }
}

/**
 * Extracts the substring after the first "_" character, including any subsequent underscores.
 * @param {string} input - The input string.
 * @return {string} - The extracted substring.
 */
function extractSubstring(input) {
    const parts = input.split('_');
    if (parts.length > 1) {
        return parts.slice(1).join('_');
    }
    return ''; // Return an empty string if "_" is not found
}

/**
 * @param {Array<string>} keywords
 * @param {{start:string,limit:number}} pages
 * @return {Promise<Array<{key:string,data:import("$lib/data_objects/data_types").IndexDataReturn}>>}
 */
export async function getIdeasByKeyWords(keywords,pages){
    let variationOfKeyWords = createVariationsOfKeywords(keywords);
    let regexInput = createOrRegexInput(variationOfKeyWords);
    let searchedIdeas = (await listDocs({
        collection:"index_search",
        filter:{
            matcher:{
                description:regexInput.length == 0 ? undefined : regexInput,
            },
            paginate:{
                startAfter: pages.start==""?undefined:pages.start,
                limit: pages.limit,
            },
            order:{
                desc:true,
                field: 'created_at',
            }
        }
    })).items;
    if(searchedIdeas.length==0){
        return [];
    }else{
        /**
         * @type {Array<{key:string,data:import("$lib/data_objects/data_types").IndexDataReturn}>}
         */
        let returnedIdeas = [];
        for(let i=0; i<searchedIdeas.length;i++){
                                // @ts-ignore

            let documentType =  extractType(searchedIdeas[i].description);
            // @ts-ignore
            let createdTimestamp = Number(searchedIdeas[i].created_at/1000000n);
            let july8thDate = new Date("2024-07-08").getTime();
            if (
                createdTimestamp < july8thDate
            ){
                if(documentType == "idea"){
                    documentType = "topic";
                }else if(documentType == "feature"){
                    documentType = "idea";
                }
            }
            /**
             * @type {{key:string,data:import("$lib/data_objects/data_types").IndexDataReturn}}
             */
            let thisIdea = {
                key: searchedIdeas[i].key.substring(6),
                data: {
                    title:searchedIdeas[i].data.title,
                    subtitle:searchedIdeas[i].data.subtitle,
                    images:searchedIdeas[i].data.images,
                    videos:searchedIdeas[i].data.videos,
                    // @ts-ignore
                    type:documentType,
                    // @ts-ignore
                    owner: searchedIdeas[i].owner, 
                }
            };
            returnedIdeas.push(thisIdea);
            returnedIdeas=returnedIdeas;
        };
        return returnedIdeas;
    };
   

}


/**
 * @param {Array<string>} keywords
 * @return {string}
 */
export function createOrRegexInput(keywords){
    let regexInput = "";
    for(let i  = 0; i<keywords.length;i++){
        if(i!=keywords.length-1){
            regexInput+= keywords[i] + '|';
        }else{
            regexInput+= keywords[i];
        };
    };
    return regexInput;
    
}
/**
 * @param {Array<string>} keywords
 * @return {Array<string>} keywordsReturned
 */
export function createVariationsOfKeywords(keywords){
    /**
     * @type {Array<string>} keywords
     **/
    let newKeyWords = [];
    for(let i  = 0; i<keywords.length;i++){
        
        let word = keywords[i];
        console.log(word);
        newKeyWords.push(keywords[i])
        newKeyWords = newKeyWords;
        let wordVariation1 = keywords[i].toUpperCase();
        let wordVariation2 = keywords[i].toLowerCase();
        let wordVariation3 = word.charAt(0).toUpperCase() + word.slice(1);
        newKeyWords.push(wordVariation1)
        newKeyWords = newKeyWords;
        newKeyWords.push(wordVariation2)
        newKeyWords = newKeyWords;
        newKeyWords.push(wordVariation3)
        newKeyWords = newKeyWords;
    };
    return newKeyWords;
}
/**
 * @param {string} url
 */
export async function getImageUrl(url) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            return url; // Image is available
        } else {
            return "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg"; // Image is not available, return default image
        }
    } catch (error) {
        console.error('Error fetching the image:', error);
        return "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg"; // Error occurred, return default image
    }
}


/**
 * @param {string} input
 */
function extractType(input) {
    const typeMatch = input.match(/type:([^\s]*)/);
    return typeMatch ? typeMatch[1].trim() : null;
}

/**
* BRIEF DESCRIPTION: This function checks if a requested username for a user is already taken.

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno. 
Receives a username. 

* POST-CONDITIONS: True if taken, false otherwise

* OUTSIDE FUNCTIONS: Juno --> listDocs()
 * @param {string} username
 * @param {string} userKey
 */
export async function usernameExists(username,userKey) {
    let docs = await listDocs({
        collection: "user",
        filter: {
            matcher: {
                description: username,
            },
        },
    });
    let amount = docs.items_length;
    let results = docs.items.filter((doc) => {
    
        
            return (doc.key!=(userKey)&&doc.data.username==username);
            
        
    });
    if(results.length==0){
        return false;
    }else{

        return true;
    }
};


/**
 * @param {string} userKey
 * @return {Promise<boolean>}
 */
export async function CheckUserExistance(userKey){
    let userDoc = await getDoc({
        collection:"user",
        key:userKey,
    });
    if(userDoc==undefined){
        return false;
    }else{
        return true;
    };
}

/**
 * @param {string} inviterkey
 * @return {Promise<boolean>}
 */
export async function CheckInviteExistance(inviterkey){
    let userKey = await getUserKey();
    let inviteDoc = await getDoc({
        collection:"invites",
        key:userKey+"_"+inviterkey,
    });
    if(inviteDoc==undefined){
        return false;
    }else{
        return true;
    }
}

/**
 * @return {Promise <Array<import("@junobuild/core-peer").Doc<any>>>}
 */
export async function getUserNotifications(){
    let userKey = await getUserKey();
    /**
     * @type {Array<string>}
     */
    let followedElements = await getFollowedElements(userKey);
    let regexInput = createOrRegexInput([userKey,...followedElements])
    let notifications = await listDocs({
        collection:"notification",
        filter:{
            matcher:{
               description: regexInput, 
            },
            order:{
                desc:true,
                field:'created_at'
            },
            
        },
        
    });
    if(notifications.items.length>0){
        let lastNotificationKey = notifications.items[0].key;
        setLastNotificationRead(lastNotificationKey);
    }
    return notifications.items;

}
/**
 * @param {string} url
 * @param {string} documentTolookFor
 */
export function extractDocumentIdFromURL(url,documentTolookFor) {
    const startIndex = url.indexOf(`/${documentTolookFor}/`) + `/${documentTolookFor}/`.length;
    return url.substring(startIndex);
}

/**
 * @return {Promise<Array<string>>}
 * @param {string} userKey
 */
export async function getFollowedElements(userKey){
    let followDocuments = await listDocs({
        collection:"follow",
        filter:{
            matcher:{
                key:userKey+"_"
            },
            order:{
                desc:true,
                field:'created_at'
            }
        }
    })
    if(followDocuments.items.length==0){
        return [];
    }else{
        /**
         * @type {string[]}
         */
        let followedItems = [];
        for(let i = 0 ; i<followDocuments.items.length;i++){
            if(followDocuments.items[i].description!="user"){
                let elementKey = getFollowedKey(followDocuments.items[i].key);
                followedItems.push(elementKey);
                followedItems=followedItems;
            }
        }
        return followedItems;
    }
};

/**
 * Extracts the followed key from an ID formatted as followerKey_followedKey.
 * @param {string} id - The ID string containing both keys separated by an underscore.
 * @return {string} - The followed key.
 */
function getFollowedKey(id) {
    const underscoreIndex = id.indexOf('_');
    if (underscoreIndex !== -1) {
        return id.substring(underscoreIndex + 1);
    } else {
        throw new Error('Invalid ID format');
    }
}

/**
 * @param {string} solution_id
 * @return {Promise<string>}
 */
export async function getSolutionOwner(solution_id){
    let solDoc = await getDoc({
        collection:"solution",
        key: solution_id
    });
    if(solDoc==undefined){
        throw new Error("Solution doesnt exist.")
    }else{
        // @ts-ignore
        return solDoc.owner;
    }
}

/**
 * @param {string} idea_id
 * @return {Promise<string>}
 */
export async function getIdeaOwner(idea_id){
    let ideaDoc = await getDoc({
        collection:"idea",
        key: idea_id
    });
    if(ideaDoc==undefined){
        throw new Error("Idea doesnt exist.")
    }else{
        // @ts-ignore
        return ideaDoc.owner;
    }
};

/**
 * @param {string} idea_id
 * @return {Promise<string>}
 */
export async function getFeatureOwner(idea_id){
    let ideaDoc = await getDoc({
        collection:"feature",
        key: idea_id
    });
    if(ideaDoc==undefined){
        throw new Error("Feature doesnt exist.")
    }else{
        // @ts-ignore
        return ideaDoc.owner;
    }
};

/**
 * @param {Array<string>} features
 * @return {Promise<Array<{key:string,owner:string}>>}
 */
export async function getManyFeaturesOwner(features){
    /**
     * @type {any[]}
     */
    let docs = [];
    for(let i=0;i<features.length;i++){
        let newInputItem = {
            collection: "feature",
            key:features[i]
        }
        docs.push(newInputItem);
        docs = docs;
    }

    let featuresDocs = await getManyDocs({
        docs:docs
    });
    if(featuresDocs.length==0){
        throw new Error("No idea was found")
    }else{
        /**
         * @type {Array<{key:string,owner:string}>}
         */
        let listReturn = [];
        for(let item of featuresDocs){
            if(item!=undefined){
                listReturn.push({
                    key:item.key,
                    // @ts-ignore
                    owner:item.owner,
                });
                listReturn=listReturn;
            };
        }
        return listReturn;
    }
};


/**
 * @param {string} element_id
 * @return {Promise<string>}
 */
export async function getElementTitleGivenKey(element_id){
    let indexDoc = await getDoc({
        collection:"index_search",
        key:"INDEX_"+element_id
    });
    if(indexDoc==undefined){
        return element_id;
    }else{
        return indexDoc.data.title;
    }

}

/**
 * Checks if an image URL is valid.
 * @param {string} userUrl - The user-provided URL of the image.
 * @param {string} defaultUrl - The fallback URL of the image.
 * @returns {Promise<string>} - Returns a promise that resolves to the valid image URL.
 */
export async function validateImageUrl(userUrl, defaultUrl) {
    // if(userUrl =""){
    //     return defaultUrl;
    // }
    return new Promise((resolve) => {
      const img = new Image();
      img.src = userUrl;
      img.onload = () => resolve(userUrl);
      img.onerror = () => resolve(defaultUrl);
    });
  }


