import { basicInfo, signedIn } from "$lib/stores/auth.state";
import { isLoading, loginedIn, signInSuccessful } from "$lib/stores/loading";
import { getDoc, listDocs, setDoc, signIn } from "@junobuild/core";
import { info } from "../stores/auth.state";
import { createDeadline, createSolution, createUpdate } from "$lib/data_objects/data_objects";
import { orderByDate } from "$lib/other_functions/other.functions";

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
 * @param {string} key
 * @param {any} docInfo
 */
export async function updateData(docInfo, collectionName, key) {
    await setDoc({
        collection: collectionName,
        doc: {
            // @ts-ignore
            key: key,
            // @ts-ignore
            updated_at: docInfo?.updated_at,
            data: docInfo.data,
        },
    });
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
let update = createUpdate();
/**
 * @param {update} update
 * @param {string} solutionKey
 */
export async function postUpdate(update, solutionKey) {
    let myDoc = await getDocu("solutions", solutionKey);
    myDoc?.data.updates.unshift(update);
    await updateData(myDoc, "solutions", solutionKey);
};
/**
 * @param {update} update
 * @param {string} solutionKey
 */
export async function deleteUpdate(update, solutionKey) {
    //1) We need to get the whole docu of the solution
    let myDoc = await getDocu("solutions", solutionKey);
    //2) We need to get the updates of the docu
    let updt = createUpdate();
    /**
     * @param {updt []} myDocUpdates
     */
    let myDocUpdates = myDoc?.data.updates;
    //3) We need to locate the item in the list
    let index = -1;
    for (let i = 0; i < myDocUpdates.length; i++) {
        console.log(myDocUpdates[i]);
        console.log(update);
        if (myDocUpdates[i].key == update.key) {
            index = i;
        }
    }
    //4) We need to substract the item from the list. 
    if (index > -1) {
        myDocUpdates.splice(index, 1);
    }
    //5) We need to update the data in the database
    // @ts-ignore
    myDoc.data.updates = myDocUpdates;
    // @ts-ignore
    myDoc.data.updates = myDoc?.data.updates;
    await updateData(myDoc, "solutions", solutionKey);
}

let deadline = createDeadline();
/**
 * @param {deadline} deadline
 * @param {string} solutionKey
 */
export async function addDeadline(deadline, solutionKey) {
    let myDoc = await getDocu("solutions", solutionKey);
    myDoc?.data.deadlines.push(deadline);

    // @ts-ignore
    myDoc.data.deadlines = orderByDate(myDoc.data.deadlines);
    await updateData(myDoc, "solutions", solutionKey);
};

/**
 * @param {deadline} deadline
 * @param {string} solutionKey
 */
export async function deleteDeadline(deadline, solutionKey) {
    //1) We need to get the whole docu of the solution
    let myDoc = await getDocu("solutions", solutionKey);
    //2) We need to get the deadlines of the docu
    let dline = createDeadline();
    /**
     * @param {dline []} myDocDeadlines
     */
    let myDocDeadlines = myDoc?.data.deadlines;
    //3) We need to locate the item in the list
    let index = -1;
    for (let i = 0; i < myDocDeadlines.length; i++) {
        console.log(myDocDeadlines[i]);
        console.log(deadline);
        if (myDocDeadlines[i].title == deadline.title && myDocDeadlines[i].newDate.day == deadline.newDate.day
            && myDocDeadlines[i].newDate.month == deadline.newDate.month && myDocDeadlines[i].newDate.year == deadline.newDate.year) {
            index = i;
        }
    }
    //4) We need to substract the item from the list. 
    if (index > -1) {
        myDocDeadlines.splice(index, 1);
    }
    //5) We need to update the data in the database
    // @ts-ignore
    myDoc.data.deadlines = myDocDeadlines;
    // @ts-ignore
    myDoc.data.deadlines = myDoc?.data.deadlines;
    await updateData(myDoc, "solutions", solutionKey);
}

let solution = createSolution();
/**
 * @param {solution} solutionData;
 * @param {string} solutionKey
 */
export async function editSolution(solutionData, solutionKey) {
    let myDoc = await getDocu("solutions", solutionKey);
    // @ts-ignore
    myDoc.data = solutionData;
    await updateData(myDoc, "solutions", solutionKey);
};


