import { basicInfo, signedIn } from "$lib/stores/auth.state";
import { isLoading, loginedIn, signInSuccessful } from "$lib/stores/loading";
import { getDoc, listDocs, setDoc, signIn } from "@junobuild/core";
import { info } from "../stores/auth.state";
import { createUpdate } from "$lib/data_objects/data_objects";

/**
 * @param {string} collectionName
 * @param {string} key
 */
export async function getDocu(collectionName, key) {
    const myDoc = await getDoc({
        collection: collectionName,
        key: key,
    });

    return myDoc;
}
/**
 * @param {string} collectionName
 */
export async function getListDocs(collectionName) {
    const myDoc = await listDocs({
        collection: collectionName,
    });

    return myDoc;
}

/**
 * @param {string} solutionKey
 */
export async function getSolutionSubIdeas(solutionKey) {
    let solution = await getDocu("solutions", solutionKey);
    let subideasSol = solution?.data.ideasRelated;
    let allSubideas = await getListDocs("subideas");
    let subideasItems = allSubideas.items;
    /**
     * @type {any[]}
     */
    let returnData = [];
    for (let i = 0; i < subideasSol.length; i++) {
        let thisKey = subideasSol[i].key;
        for (let j = 0; j < subideasItems.length; j++) {
            if (thisKey == subideasItems[j].key) {
                returnData.push(subideasItems[j]);
                returnData = returnData;
                console.log("pushed item", subideasItems[j]);
                console.log("image item", subideasItems[j].data.imageURL);
            }
        }
    }
    return returnData;
}
let update=createUpdate();
/**
 * @param {update} update
 * @param {string} solutionKey
 */
export async function postUpdate(update, solutionKey){
    let myDoc = await getDocu("solutions", solutionKey);
    let data = myDoc?.data;
    
    
};

