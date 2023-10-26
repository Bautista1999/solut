import { basicInfo, signedIn } from "$lib/stores/auth.state";
import { amountNotis, isLoading, loginedIn, signInSuccessful } from "$lib/stores/loading";
import { getDoc, listDocs, setDoc, signIn } from "@junobuild/core";
import { info } from "../stores/auth.state";
import { createAdvancedDate, createDeadline, createNotification, createSolution, createUpdate } from "$lib/data_objects/data_objects";
import { orderByDate } from "$lib/other_functions/other.functions";
import { get } from "svelte/store";

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
export async function listDocu(collectionName) {
    const myDocs = await listDocs({
        collection: collectionName,
    });

    return myDocs;
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
    debugger;
    let myDoc = await getDocu("solutions", solutionKey);
    myDoc?.data.updates.unshift(update);
    await updateData(myDoc, "solutions", solutionKey);
    await post_update_notification(update.creator, solutionKey, update.body);
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

export async function get_user_notifications() {
    await basicInfo();

    const store = get(info);
    let myDoc = await getDocu("users", store.key);
    let myNotiDoc = await getDocu("notifications", myDoc?.data.notificationsKey);



    let newNotis = myNotiDoc?.data.length - myDoc?.data.amountNotifictions;

    if (newNotis != 0) {
        // @ts-ignore
        myDoc.data.amountNotifictions = myNotiDoc?.data.length;
        await updateData(myDoc, "users", store.key);
    }
    return myNotiDoc?.data;
}

let notification = createNotification();
//The elementKey indicates the followers on which we should post the notification
//EXAMPLE: If you receive a collecitonName of "solutions" and a elementKey of "aaa-bb-cc-dd",
//the function is going to get the data of "aaa-bb-cc-dd" in the collection "solutions",
//and then get its followers. Finally, the function will post the notificationData in every
//follower in that list. 

//Each notification key of every user is the sum of "NOT_" + user.key
//
/**
 * @param {string} elementKey //The element key could be from users, ideas, subideas, and topics
 * @param {notification} notificationData
 * @param {string} collectionName
 */
export async function post_all_notifications(elementKey, notificationData, collectionName) {
    //1) Get {elementKey} from collection {collectionName}
    let myElement = await getDocu(collectionName, elementKey);
    let followers = myElement?.data.followers;
    let notiKeys = [];
    for (let i = 0; i < followers.length; i++) {
        notiKeys.push("NOT_" + followers[i]);
    };
    //2) Now we post {notificationData} in every notification document of the list {notiKeys[]}
    let myDoc = await getListDocs("notifications")
    let notisData = myDoc.items;
    for (let i = 0; i < notisData.length; i++) {
        if (notiKeys.includes(notisData[i].key)) {
            await post_single_notification(notificationData, notisData[i].key);
        }
    };


};
/**
 * @param {string} notiKey 
 * @param {notification} notificationData
 */
export async function post_single_notification(notificationData, notiKey) {
    let myDoc = await getDocu("notifications", notiKey);
    myDoc?.data.unshift(notificationData);
    await updateData(myDoc, "notifications", notiKey);
};

/**
 * @param {string} userKey
 * @param {string} collectionName
 * @param {string} elementKey
 */
export async function post_follow_notification(userKey, collectionName, elementKey) {
    let myDoc = await getDocu(collectionName, elementKey);
    let owner = myDoc?.owner;
    let notification = createNotification();
    notification.body = "";
    notification.elementName = myDoc?.data.title;
    notification.subject = "New follower! " + userKey.substring(0, 10) + "..." + " is now following " + myDoc?.data.title;
    //window.location.href = "/idea?id=" + key;
    let linkPlace = "";
    if (collectionName == "solutions") {
        linkPlace = "solution";
    } else if (collectionName == "users") {
        linkPlace = "user";
    } else {
        linkPlace = "idea";
    }
    notification.link = linkPlace + "?id=" + elementKey;
    notification.createBy = userKey;
    notification.picture = "https://b3314858.smushcdn.com/3314858/wp-content/uploads/2020/04/Gary-Avatar.png?lossy=2&strip=1&webp=1";
    notification.seen = false;
    notification.date = createAdvancedDate();
    let now = new Date();
    notification.date.day = now.getDate();
    notification.date.month = now.getMonth() + 1;
    notification.date.year = now.getFullYear();
    notification.date.minutes = now.getMinutes();
    notification.date.hour = now.getHours();
    notification.date.seconds = now.getSeconds();
    await post_single_notification(notification, "NOT_" + owner);
}


export async function check_new_notifications() {
    const store = get(info);
    let userKey = store.key;
    if (userKey == "" || userKey == null) {
        amountNotis.set(0);
    }
    let myUserDoc = await getDocu("users", userKey);

    let myNotisDoc = await getDocu("notifications", "NOT_" + userKey);
    let newNotis = myNotisDoc?.data.length - myUserDoc?.data.amountNotifictions;
    console.log("myNotisDoc?.data.length: ", myNotisDoc?.data.length);
    console.log("myUserDoc?.data.amountNotifictions: ", myUserDoc?.data.amountNotifictions);
    console.log("New notis: ", newNotis);

    amountNotis.set(newNotis);
}

/**
 * @param {string} userKey
 * @param {string} collectionName  // can be subidea, idea, or solution
 * @param {string} elementKey
 * @param {number} amount
 */
export async function post_pledge_notification(userKey, collectionName, elementKey, amount) {

    let myDoc = await getDocu(collectionName, elementKey);
    let owner = myDoc?.owner;
    let notification = createNotification();
    notification.body = "";
    notification.elementName = myDoc?.data.title;
    notification.subject = "New pledge! " + " User " + userKey.substring(0, 10) + "... " + "has pledged " + amount + " ICP"
    //window.location.href = "/idea?id=" + key;
    let linkPlace = "";
    if (collectionName == "solutions") {
        linkPlace = "solution";
    } else if (collectionName == "ideas") {
        linkPlace = "idea";
    }
    notification.link = linkPlace + "?id=" + elementKey;
    notification.createBy = userKey;
    notification.picture = "https://global-uploads.webflow.com/5fad86e2327507cecea2d5e8/6398e3613ac63933073a07d3_btc_36439f8f5d85c86cebb52434e2b0417a_2000.jpeg";
    notification.seen = false;
    notification.date = createAdvancedDate();
    let now = new Date();
    notification.date.day = now.getDate();
    notification.date.month = now.getMonth() + 1;
    notification.date.year = now.getFullYear();
    notification.date.minutes = now.getMinutes();
    notification.date.hour = now.getHours();
    notification.date.seconds = now.getSeconds();
    await post_single_notification(notification, "NOT_" + owner);
}

/**
 * @param {string} userKey
 * @param {string} elementKey
 * @param {string} body
 */
export async function post_update_notification(userKey, elementKey, body) {
    let collectionName = "solutions";
    let myDoc = await getDocu(collectionName, elementKey);
    let notification = createNotification();
    notification.body = body;
    notification.elementName = myDoc?.data.title;
    notification.subject = "New update in " + myDoc?.data.title;
    //window.location.href = "/idea?id=" + key;
    let linkPlace = "";

    notification.link = linkPlace + "?id=" + elementKey;
    notification.createBy = userKey;
    notification.picture = myDoc?.data.images[0];
    notification.seen = false;
    notification.date = createAdvancedDate();
    let now = new Date();
    notification.date.day = now.getDate();
    notification.date.month = now.getMonth() + 1;
    notification.date.year = now.getFullYear();
    notification.date.minutes = now.getMinutes();
    notification.date.hour = now.getHours();
    notification.date.seconds = now.getSeconds();
    await post_all_notifications(elementKey, notification, "solutions");
}
//export async function post_follow_notification(userKey, collectionName, elementKey) {