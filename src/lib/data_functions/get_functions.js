import { getDoc,getManyDocs ,initJuno, listDocs } from "@junobuild/core-peer";

/**
 * @param {string} element_id
 * @return {Promise<number>}
 */
export async function getTotalFollowers(element_id) {
   
    let doc = await getDoc({
        collection: "followers",
        key: "FOLL_"+element_id,
    });
    if(doc==undefined){
        return 0;
    }else{
        return doc.data.followers;
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
    const match = input.match(/idea_id:(\w+)/);
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




