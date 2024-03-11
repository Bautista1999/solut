import { basicInfo, initDB, signedIn } from "$lib/stores/auth.state";
import { amountNotis, isLoading, loginedIn, pledgeModal, signInSuccessful } from "$lib/stores/other_stores";
import { info } from "../stores/auth.state";
import { CurrentDate, createAdvancedDate, createDeadline, createFinalUpdate, createNotification, createPledgedElement, createSolution, createTransfer, createTransferResult, createUpdate } from "$lib/data_objects/data_objects";
import { orderByDate } from "$lib/other_functions/other.functions";
//Svelte library
import { get } from "svelte/store";
//Juno library
import { authSubscribe, getDoc, listDocs, setDoc, signIn, unsafeIdentity } from "@junobuild/core";
//Dfinity libraries
import { Principal } from "@dfinity/principal";
import { createAgent } from "@dfinity/utils";
import { AccountIdentifier, LedgerCanister } from "@dfinity/ledger-icp";

// TODO: DIVIDE FUNCTIONS INTO DIFFERENT FILES (juno, local, dfinity), this one is too large. 
// TODO: ADD A FIELD IN THE COMMENTS THAT SHOWS WHICH OUTSIDE FEATURES/ METHODS ARE USING THAT FUNCTION.

/**
* BRIEF DESCRIPTION: This function retrieves a document from a collection in our database

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno and have proper permissions.
For example, a user cant get a Doc that isnt public. Recieves Juno's collection name and the key of the doc.

* POST-CONDITIONS: Returns the document provided by Juno.

* OUTSIDE FUNCTIONS: Juno --> getDoc() 
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
* BRIEF DESCRIPTION: This function retrieves a list of documents from a collection in Juno's database

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno and have proper permissions.
For example, a user cant get a collection that isnt public. Recieves Juno's collection name.

* POST-CONDITIONS: Returns the list of documents of that collection provided by Juno.

* OUTSIDE FUNCTIONS: Juno --> listDocs() 
 * @param {string} collectionName
 */
export async function getListDocs(collectionName) {
    const myDocs = await listDocs({
        collection: collectionName,
    });

    return myDocs;
}
/**
* BRIEF DESCRIPTION: This function updates a given document Data from a collection in Juno's database

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno and have proper permissions.
For example, a user cant write a Doc that isnt public. Recieves Juno's collection name, doc's info, and the key of the doc.
The docInfo provided is not the document data, but the kind of data provided by Juno when you do getDoc(). 

* POST-CONDITIONS: Returns the document provided by Juno.

* OUTSIDE FUNCTIONS: Juno --> setDoc() 
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
* BRIEF DESCRIPTION: This function provides the keys of ideas implemented by a specific solution. First,
the function gets the solution document and it checks the ideas list inside that document. Second, its fetches
the list of documents of all the ideas and check which ideas key matches with the list of the solution. Those
ideas data are returned. 

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno and have proper permissions.
This means to be the owner of the solution in discussion. Recieves the key of the solution in Juno.
The docInfo provided is not the document data, but the kind of data provided by Juno when you do getDoc(). 

* POST-CONDITIONS: Returns solution's ideas implemented data provided by Juno.

* OUTSIDE FUNCTIONS: Juno --> getDoc(), listDocs()
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
            }
        }
    }
    return returnData;
}
let update = createUpdate();
/**
* BRIEF DESCRIPTION: This function creates an update from the owner of the solution and updates
the data in Juno's database. Additionally, it sends a notification to every user that follows the 
solution's topic and the topic itself.

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno and have proper permissions.
This means, to be the owner of the solution. Receives an update, and the Juno's key of the solution.

* POST-CONDITIONS: --None--

* OUTSIDE FUNCTIONS: Juno --> getDoc(), setDoc() 
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
let finalUpdate = createFinalUpdate();
/**
* BRIEF DESCRIPTION: This function creates a final update from the owner of the solution and updates
the data in Juno's database. This happens when the owner wishes to finish the project.
Additionally, it sends a notification to every user that follows the solution's topic and the topic itself.

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno and have proper permissions.
This means, to be the owner of the solution. Receives an update, and the Juno's key of the solution.

* POST-CONDITIONS: --None--

* OUTSIDE FUNCTIONS: Juno --> getDoc(), setDoc() 
 * @param {finalUpdate } update
 * @param {string} solutionKey
 */
export async function postFinalUpdate(update, solutionKey) {
    let myDoc = await getDocu("solutions", solutionKey);
    let topicKey = myDoc?.data.topic;
    // @ts-ignore
    myDoc.data.finalUpdate = update;
    await updateData(myDoc, "solutions", solutionKey);
    await post_final_update_notification(update, solutionKey, topicKey);
};
/**
* BRIEF DESCRIPTION: This function deletes a specific update from the owner of the solution and updates
the data in Juno's database.

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno and have proper permissions.
This means, to be the owner of the solution. Receives an update, and the Juno's key of the solution.

* POST-CONDITIONS: --None--

* OUTSIDE FUNCTIONS: Juno --> getDoc(), setDoc() 
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
* BRIEF DESCRIPTION: This function adds a deadline from the owner of the solution and updates
the data in Juno's database.

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno and have proper permissions.
This means, to be the owner of the solution. Receives a deadline, and the Juno's key of the solution.

* POST-CONDITIONS: --None--

* OUTSIDE FUNCTIONS: Juno --> getDoc(), setDoc() 
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
* BRIEF DESCRIPTION: This function deletes a deadline from solution and updates
the data in Juno's database.

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno and have proper permissions.
This means, to be the owner of the solution. Receives a deadline, and the Juno's key of the solution.

* POST-CONDITIONS: --None--

* OUTSIDE FUNCTIONS: Juno --> getDoc(), setDoc() 
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
* BRIEF DESCRIPTION: This function edits a solution's data in the database.

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno and have proper permissions.
This means, to be the owner of the solution. Receives a deadline, and the Juno's key of the solution.

* POST-CONDITIONS: --None--

* OUTSIDE FUNCTIONS: Juno --> getDoc(), setDoc() 
 * @param {solution} solutionData;
 * @param {string} solutionKey
 */
export async function editSolution(solutionData, solutionKey) {
    let myDoc = await getDocu("solutions", solutionKey);
    // @ts-ignore
    myDoc.data = solutionData;
    await updateData(myDoc, "solutions", solutionKey);
};
/**
* BRIEF DESCRIPTION: This function fetches the notifications for the signed in user. Dont need to pass
user key, its automatically fetched by the function.

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno.
. Receives a deadline, and the Juno's key of the solution.

* POST-CONDITIONS: Returns the list of all the notifications of the user.

* OUTSIDE FUNCTIONS: Juno --> getDoc(), setDoc() 
 */
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
* BRIEF DESCRIPTION: This function post a notification to every follower of an element provided.
This element can be a subidea, a user, a topic or a solution. 

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno. 
Receives a notification, an element key and the Juno's collection name of the element. 

* POST-CONDITIONS: --None--

* OUTSIDE FUNCTIONS: Juno --> getDoc(), listDocs(), setDoc() 
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
* BRIEF DESCRIPTION: This function post a single notification to a specified user. The 
notification data is posted on the collection of notifications.

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno. 
Receives a notification and a notification key. 

* POST-CONDITIONS: --None--

* OUTSIDE FUNCTIONS: Juno --> getDoc(), setDoc() 
 * @param {string} notiKey 
 * @param {notification} notificationData
 */
export async function post_single_notification(notificationData, notiKey) {
    let myDoc = await getDocu("notifications", notiKey);
    myDoc?.data.unshift(notificationData);
    await updateData(myDoc, "notifications", notiKey);
};

/**
* BRIEF DESCRIPTION: This function post a follow notification to a specified user, which 
is owner of the followed element. 

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno. 
Receives a userKey, which is the "name"of the user that followed, the key of the followed
element, and the collection name of that element. 

* POST-CONDITIONS: --None--

* OUTSIDE FUNCTIONS: Juno --> getDoc(), setDoc() 
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

/**
* BRIEF DESCRIPTION: This function checks the amount of new notifications a user has. 

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno. . 

* POST-CONDITIONS: It updates a writable store in "../stores/info.store.js" called newNotis 
with the new amounts of notifications. 

* OUTSIDE FUNCTIONS: Juno --> getDoc()
 */
export async function check_new_notifications() {
    const store = get(info);
    let userKey = store.key;
    if (userKey == "" || userKey == null) {
        amountNotis.set(0);
        return;
    }
    let myUserDoc = await getDocu("users", userKey);

    let myNotisDoc = await getDocu("notifications", "NOT_" + userKey);
    let newNotis = myNotisDoc?.data.length - myUserDoc?.data.amountNotifictions;
    amountNotis.set(newNotis);
}

/**
* BRIEF DESCRIPTION: This function post a pledge notification to a specified user, which 
is owner of the followed element. This happens when a user pledges in an element (topic, idea
or solution)

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno. 
Receives a userKey, which is the "name"of the user that pledged, the key of the pledged
element, amount pledged, and the collection name of that element. 

* POST-CONDITIONS: --None--

* OUTSIDE FUNCTIONS: Juno --> getDoc(), setDoc() 
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
* BRIEF DESCRIPTION: This function post an update notification to every follower of the elementKey.

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno. 
Receives a userKey, which is the "name"of the user that followed, the key of the followed
element, and the body of the notification. 

* POST-CONDITIONS: --None--

* OUTSIDE FUNCTIONS: Juno --> getDoc(), setDoc() 
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
/**
* BRIEF DESCRIPTION: This function post a final update notification to every follower of the topic and solution.

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno. 
Receives a final update, the keys of the followed topic and solution. 

* POST-CONDITIONS: --None--

* OUTSIDE FUNCTIONS: Juno --> getDoc(), setDoc() 
 * @param {finalUpdate} finalUpdate
 * @param {string} elementKey
 * @param {string} topicKey
 */
export async function post_final_update_notification(finalUpdate, elementKey, topicKey) {
    let collectionName = "solutions";
    let myDoc = await getDocu(collectionName, elementKey);
    let notification = createNotification();
    notification.body = finalUpdate.body;
    notification.elementName = myDoc?.data.title;
    notification.subject = "The project " + myDoc?.data.title + " has been delivered! Check it out.";
    notification.link = "/solution?id=" + elementKey;
    notification.createBy = finalUpdate.creator;
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
    await post_all_notifications(topicKey, notification, "ideas");
}
/**
* BRIEF DESCRIPTION: This function checks if a requested username for a user is already taken.

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno. 
Receives a username. 

* POST-CONDITIONS: True if taken, false otherwise

* OUTSIDE FUNCTIONS: Juno --> listDocs()
 * @param {string} username
 */
export async function usernameExists(username) {
    let myListDocs = await getListDocs("users");
    let items = myListDocs.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].key != get(info).key) {
            if (items[i].data.nickname == username) {
                return true;
            }
        }
    }
    return false;
}

/**
* BRIEF DESCRIPTION: This function checks the ideas or solutions published given a certain category 
established.

* PRE-CONDITIONS: Receives a category, an order, a collection name (in this case, solutions or topics),
amount of elements requested, and if the signed in user follows (for this option the user needs to be signed in). 

* POST-CONDITIONS: Return list of elements. 

* OUTSIDE FUNCTIONS: Juno --> listDocs() 
 * @param {string} category //"🦾 Technology", "💰 Business", "👨‍⚕️ Health care","💵 E-commerce","🪙 Crypto","🏦 Finance","🎸 Music","👥 Social","⚡ ICP","🏋️‍♂️ Sports and Fitness","Other",none

 * @param {string} order //popularity, funding, recent, oldest, , none
 * @param {string} collectionName //solutions or idea, doesnt apply for subideas and users
 //solutions or idea, doesnt apply for subideas and users
 * @param {number | string} amount //a number or the word "all"
 //a number or the word "all"
 * @param {boolean} [followed]
 */
export async function listIdeas(category, order, collectionName, amount, followed) {
    let myList = await getListDocs(collectionName);
    let items = myList.items;
    let returnList = [];
    //We first order by category selected
    if (category != "none") {
        for (let i = 0; i < items.length; i++) {
            if (items[i].data.categories.includes(category)) {
                returnList.push(items[i]);
            }
        }
    } else {
        returnList = myList.items;
    }
    switch (order) {
        case "popularity": {
            for (let i = 0; i < returnList.length; i++) {
                // @ts-ignore
                let amountFoll = returnList[i].data.followers.length;
                let thisItem = returnList[i];
                let minHasChanged = false;
                let minFoll = amountFoll;
                let minFollPos = i;

                for (let j = i; j < returnList.length; j++) {
                    if (j != i) {
                        // @ts-ignore
                        let amountFoll2 = returnList[i].data.followers.length;
                        if (minFoll > amountFoll2 && i < j) { //si el ano es mayor que el ano siguiente Y esta en una posicion
                            //en la lista que es inferior al del ano siguiente, hay que cambiarlos. 
                            //aca los cambiamos de posicion
                            minFoll = amountFoll2;
                            minFollPos = j;
                            minHasChanged = true;
                        }
                    }
                }
                if (minHasChanged) {
                    returnList[i] = returnList[minFollPos];
                    returnList[minFollPos] = thisItem;
                }
                minHasChanged = false;
            };
        }

        case "funding": {
            for (let i = 0; i < returnList.length; i++) {
                // @ts-ignore
                let amount = returnList[i].data.moneyPledged;
                let thisItem = returnList[i];
                let minHasChanged = false;
                let min = amount;
                let minPos = i;

                for (let j = i; j < returnList.length; j++) {
                    if (j != i) {
                        // @ts-ignore
                        let amount2 = returnList[i].data.moneyPledged;
                        if (min > amount && i < j) { //si el ano es mayor que el ano siguiente Y esta en una posicion
                            //en la lista que es inferior al del ano siguiente, hay que cambiarlos. 
                            //aca los cambiamos de posicion
                            min = amount2;
                            minPos = j;
                            minHasChanged = true;
                        }
                    }
                }
                if (minHasChanged) {
                    returnList[i] = returnList[minPos];
                    returnList[minPos] = thisItem;
                }
                minHasChanged = false;
            };
        }
        case "recent": {
            break
        }
        case "oldest": {
            let auxList = [];
            for (let i = returnList.length - 1; i >= 0; i--) {
                auxList.push(returnList[i]);
            }
            returnList = auxList;
        }
        case "none": {
            break;
        }


    }
    if (followed) {
        let auxList = [];
        for (let i = 0; i < returnList.length; i++) {
            if (returnList[i].data.followers.includes(get(info).key)) {
                auxList.push(returnList[i]);
            }
        }
    }
    return returnList;
}
/**
* BRIEF DESCRIPTION: This function gets the username of a user given the user's key. 

* PRE-CONDITIONS: Receives a user key.

* POST-CONDITIONS: Returns the username. 

* OUTSIDE FUNCTIONS: Juno --> getDoc() 
 * @param {string} userKey
 */
export async function getUsername(userKey) {
    let myDoc = await getDocu("users", userKey);
    return myDoc?.data.nickname || { userKey };
}
/**
/**
* BRIEF DESCRIPTION: This function gets the profile picture of a user given the user's key. 

* PRE-CONDITIONS: Receives a user key.

* POST-CONDITIONS: Returns the picture's URL. If it has none it returns a default image for users
that have no profile picture. 

* OUTSIDE FUNCTIONS: Juno --> getDoc() 
 * @param {string} userKey
 */
export async function getProfilePicture(userKey) {
    let myDoc = await getDocu("users", userKey);
    return myDoc?.data.picture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
}


/**
* BRIEF DESCRIPTION: This function is activated by the platform when a signed in user, that pledged the 
topic or solution approves the project. This only can happen if the project is finished. The approval process
has several steps, as follows. First checks that the user has enough balance to make the transfer, then it updates
the transfer history of the user, then updates the amount of money pledged, decreasing it and updates the 
total money funded, incresing it. After that, updates the topic's data increasing the amount funded, as for the 
solution. Then, its sends 10% of the amount to the creator of ideas implemented and the topic creator and 90%
to the solution provider. FInally, it sends a notification to the solution owner about the approval as well to 
the other creators of ideas and topic. 

* PRE-CONDITIONS: This is only available if the user has pledged in the topic or solution. Otherwise, the 
option is not available. Receives the topic key, the solution key and the amount to transfer.

* POST-CONDITIONS: Returns the result of the approval process, in the following form:
    Error: string;
    creatorTransfer: string;
    developerTransfer: string;

* OUTSIDE FUNCTIONS: Juno --> getDoc() 
 * @param {string} topicKey
 * @param {string} solutionKey
 * @param {number} amount
 */
export async function approveSolution(topicKey, solutionKey, amount) {
    let approvalResult = createTransferResult();
    const store = get(info);

    let wltAddres = await getWalletAddress(store.key);
    console.log("Wallet address", wltAddres);
    let amountBigInt = decimalToICP(amount);
    let creatorCut = calculatePercentage(amountBigInt, 10);
    let developerCut = calculatePercentage(amountBigInt, 90);


    //0) We need to check that the user has the amount specified on its balance
    let ledgerID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
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
    console.log("User balance:", userBalance);
    if (userBalance < amountBigInt) {
        approvalResult.Error = "Not enought balance: " + userBalance + " < " + amountBigInt;
        approvalResult.creatorTransfer = "Failed";
        approvalResult.developerTransfer = "Failed";
        return approvalResult;
    }
    //1) We need to update the user's transfer history
    let myUserDoc = await getDocu("users", store.key);
    let transfer = createTransfer();
    transfer.amountICP = amount;
    transfer.date = CurrentDate();
    transfer.idea = solutionKey;
    myUserDoc?.data.transactionHistory.push(transfer);
    //2) We need to change the user's total pledged amount and funded amount
    // @ts-ignore
    myUserDoc.data.pledged -= amount;
    // @ts-ignore
    myUserDoc.data.funded += amount;
    await updateData(myUserDoc, "users", store.key);
    //3) Update the funding of the solution data
    let mySolutionDoc = await getDocu("solutions", solutionKey);
    // @ts-ignore
    mySolutionDoc.data.moneyFunded += amount;
    await updateData(mySolutionDoc, "solutions", solutionKey);
    //4) Update the funding of the topic data
    let myTopicDoc = await getDocu("ideas", topicKey);
    // @ts-ignore
    myTopicDoc.data.moneyFunded += amount;
    await updateData(myTopicDoc, "ideas", topicKey);
    //5) Transfer tokens to the creator (10%)
    let amountCreator = amountBigInt * decimalToICP(0.1);
    //5.1) We need to get the creator's wallet address
    let topicOwner = myTopicDoc?.owner;
    let ownerWltAddres = await getWalletAddress(topicOwner || "");
    // ownerWltAddres = "c1f7c018e75c5b985754402c63f44340fb8d4ce12a0e337e5cbb3601f00279e1";
    //5.2) Send tokens
    let ownerTransferResult = await transferTo(ownerWltAddres, creatorCut);



    //6) Transfer tokens to the developer (90%)
    let amountDeveloper = amountBigInt;
    //6.1) We need to get the solution's developer wallet address
    let solutionOwner = mySolutionDoc?.owner;
    let developerWltAddres = await getWalletAddress(solutionOwner || "");
    //developerWltAddres = "e4204e024181e960a018a5cbdc51b8af834f33932bfe4d711909b492b16767eb";

    //6.2) Send tokens
    let developerTransferResult = await transferTo(developerWltAddres, developerCut);

    //7) TODO Send notification to the developer
    //8) TODO Send notification to the creator
}

/**
* BRIEF DESCRIPTION: This function gets the wallet address of a user given the user's key. 

* PRE-CONDITIONS: Receives a user key.

* POST-CONDITIONS: Returns the solutio's wallet address. 

* OUTSIDE FUNCTIONS: dfinity/nns --> AccountIdentifier, dfinity/principal --> Principal
 * @param {string} userKey
 */
export async function getWalletAddress(userKey) {
    let userPrincipal = Principal.fromText(userKey);
    const accountIdent = AccountIdentifier.fromPrincipal({ principal: userPrincipal })
    let walletAddress = accountIdent.toHex();
    return walletAddress;
}
/**
* BRIEF DESCRIPTION: This function converts a decimal number to BigInt representation.

* PRE-CONDITIONS: Receives a decimal value.

* POST-CONDITIONS: Returns the decimal value converted in bigint.

* OUTSIDE FUNCTIONS: --None--
 *
 * @param {any} decimalValue - The decimal number to convert.
 * @return {bigint} - The BigInt representation.
 */
export function decimalToICP(decimalValue) {
    const icpBigInt = BigInt(decimalValue * 1e8);
    return icpBigInt;
}
/**
* BRIEF DESCRIPTION: This function converts a BigInt representation to decimal number.

* PRE-CONDITIONS: Receives a bigint value.

* POST-CONDITIONS: Returns a bigint.

* OUTSIDE FUNCTIONS: --None--
 *
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
* BRIEF DESCRIPTION: This function calculates certain percentage of a given value.

* PRE-CONDITIONS: Receives the value and a percentage (0=>percentage<=100).

* POST-CONDITIONS: Returns a the percentage of that value.

* OUTSIDE FUNCTIONS: --None--
 * @param {bigint} value
 * @param {number } percentage
 */
function calculatePercentage(value, percentage) {
    if (percentage >= 0 && percentage <= 100) {
        // Calculate the percentage of the value.
        const result = (value * BigInt(percentage)) / BigInt(100);
        return result;
    } else {
        throw new Error('Percentage must be between 0 and 100.');
    }
}


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
export async function transferTo(destination, amount) {
    const store = get(info);
    const canister = await LedgerCanister.create({
        // @ts-ignore
        agent: store.agent,
        canisterId: Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"),
    });
    let account = AccountIdentifier.fromHex(destination);
    const response = await canister.transfer({
        to: account,
        amount: amount,
    });
    console.log(response);

    return response;
}

/**
* BRIEF DESCRIPTION: This function dissaproves a solution. It decreases the pledged money of the user 
and increases the available money for the user to pledge. It also decrease the amount of pledging of a topic.

* PRE-CONDITIONS: Receives an amount and the key of the topic.

* POST-CONDITIONS: --None--.

* OUTSIDE FUNCTIONS: Juno --> (setDoc(),getDoc())
 * @param {number} amount
 * @param {string} topicKey
 */
export async function disapproveSolution(amount, topicKey) {
    const store = get(info);
    //1) We need to decrease the amount of money of the users pledge field 
    let myUserDoc = await getDocu("users", store.key);
    // @ts-ignore
    myUserDoc.data.pledged -= amount;
    if (myUserDoc?.data.pledged < 0) {
        // @ts-ignore
        myUserDoc.data.pledged = 0;
    }

    //2) Increase the balance in the user's balance field
    // @ts-ignore
    myUserDoc.data.balance += amount;
    await updateData(myUserDoc, "users", store.key);
    //3) Decrease the pledging in Topic's Key 
    let myTopicDoc = await getDocu("ideas", topicKey);
    // @ts-ignore
    myTopicDoc.data.moneyPledged -= amount;
    if (myTopicDoc?.data.moneyPledged < 0) {
        // @ts-ignore
        myTopicDoc.data.moneyPledged = 0;
    }
    await updateData(myTopicDoc, "ideas", topicKey);

};


/**
* BRIEF DESCRIPTION: This function returns how much a user has pledged into a certain element. This element 
can a topic, subidea or solution.  

* PRE-CONDITIONS: Receives an element key.

* POST-CONDITIONS: Returns a decimal value.

* OUTSIDE FUNCTIONS: Juno --> getDoc()
 * @param {string} elementKey
 */
export async function amountUserPledged(elementKey) {
    const store = get(info);
    let myUserDoc = await getDocu("users", store.key);
    let pledged = myUserDoc?.data.pledgedElements;
    for (let i = 0; i < pledged.length; i++) {
        if (pledged[i].key == elementKey) {
            return pledged[i].amount;
        }
    }
    return 0;


}

/**
BRIEF DESCRIPTION: Function to search topics, solutions, or ideas in Juno's database.

PRE-CONDITIONS: Receives a word and a collection to search (solutions, ideas, subideas)

POST-CONDITIONS: Returns the list of topics, ideas or solutions that include that word in their title.

OUTSIDE FUNCTIONS: Juno --> listDocs();
 * @param {string} searchWord
 * @param {string} collectionName
 */
export async function searchBar(searchWord, collectionName) {
    /**
     * @type {any[]}
     */
    let result = [];
    console.log("This is the word to search: ", searchWord)
    const MyList = await listDocs({
        collection: collectionName,
    });
    let AllSubIdeas = MyList?.items;
    for (let i = 0; i < AllSubIdeas.length; i++) {
        // @ts-ignore
        if (AllSubIdeas[i]?.data.title.toLowerCase().includes(searchWord.toLowerCase())) {
            // @ts-ignore
            result.push(AllSubIdeas[i]);
            result = result;
        }
    }
    return result;
}


let changeDollarICP = 0.34; // 1 dollar = {changeDollarICP} ICP
/**
 * @param {number} amount
 */
export function fromICPtoUSD(amount) {

    let usdAmount = amount / changeDollarICP;
    usdAmount = Math.round(usdAmount * 100) / 100;
    return usdAmount;
}
/**
     * @param {number} amount
     */
export function fromUSDtoICP(amount) {
    let icpAmount = amount * changeDollarICP;
    icpAmount = Math.round(icpAmount * 100) / 100;
    return icpAmount;
}

/**
* BRIEF DESCRIPTION: This function is activated when a user wants to pledge funds into an element (topic, 
idea, or solution). First, the method increase the amount of money pledged in the user's doc and in the
element's doc. In the case of the user, its supposed to decrease the amount of money "available" for the user
to pledge into other elements. It also creates a transaction history of the pledging in the user doc and in 
the element doc. Note that this function doesnt touch real money, its just a pledging to show that the user
would put money to fund this project if its ever come to reality. Additionally, it sends a pledge notification
to the owner of the element.

* PRE-CONDITIONS: For using this function the user needs to be signed in into Juno. Receives the documentID, 
the amount pledged (in number), the funding destination address, and the collection name.

* POST-CONDITIONS: "Not signed in" if its not signed in.

* OUTSIDE FUNCTIONS: Juno --> getDoc(), setDoc() 
 * @param {number} amountICP
 * @param {string} address
 * @param {string} documentID
 * @param {string} collectionName
 */
export async function pledgeFunds(documentID, amountICP, address, collectionName) {
    if (!(await signedIn())) {
        pledgeModal.set(false);
        loginedIn.set(false);
        return "Not signed in";
    }
    //1) We need to increase the amount of moneyPledged field of the idea
    //2) Create a transactionHistory in the idea
    const myDoc = await getDoc({
        collection: collectionName,
        // @ts-ignore
        key: documentID,
    });
    let topicData = myDoc?.data;
    let now = Date.now();
    let newTransactionIdea = {
        user: get(info).key,
        amountICP: amountICP,
        sentTo: address,
        date: now,
    };
    // @ts-ignore
    topicData.moneyPledged += amountICP;
    // @ts-ignore
    // topicData.transactionHistory.push(newTransactionIdea);
    // @ts-ignore
    // topicData.transactionHistory = topicData.transactionHistory;
    await setDoc({
        collection: collectionName,
        doc: {
            // @ts-ignore
            key: documentID,
            // @ts-ignore
            updated_at: myDoc?.updated_at,
            data: topicData,
        },
    });
    //3) We need to increase the amount of pledged field of the user
    //4) Create a transactionHistory in the user
    const myDoc2 = await getDoc({
        collection: "users",
        // @ts-ignore
        key: get(info).key,
    });
    let newTransactionUser = {
        idea: documentID,
        amountICP: amountICP,
        sentTo: address,
        date: now,
    };
    let userData = myDoc2?.data;
    userData.transactionHistory.push(newTransactionUser);
    userData.transactionHistory = userData.transactionHistory;
    userData.balance -= amountICP;
    if (userData.balance < 0) {
        userData.balance = 0;
    }
    userData.pledged += amountICP;
    let pledgedTopic = createPledgedElement();
    pledgedTopic.amount += amountICP;
    pledgedTopic.key = documentID;
    userData.pledgedElements.unshift(pledgedTopic);
    userData.pledgedElements = userData.pledgedElements;
    await setDoc({
        collection: "users",
        doc: {
            // @ts-ignore
            key: get(info).key,
            // @ts-ignore
            updated_at: myDoc2?.updated_at,
            data: userData,
        },
    });
    // @ts-ignore
    await post_pledge_notification(get(info).key, collectionName, documentID, amountICP);
}
//export async function pledgeFunds(documentID, amountICP, address, collectionName)
export async function getBalance(){
    const store = get(info);
    let ledgerID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
    console.log(store.agent);
    if(store.userPrincipal==null){
        await basicInfo();
    }
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
}