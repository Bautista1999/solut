import { basicInfo, initDB, signedIn } from "$lib/stores/auth.state";
import { amountNotis, isLoading, loginedIn, signInSuccessful } from "$lib/stores/loading";
import { getDoc, listDocs, setDoc, signIn } from "@junobuild/core";
import { info } from "../stores/auth.state";
import { CurrentDate, createAdvancedDate, createDeadline, createFinalUpdate, createNotification, createSolution, createTransfer, createTransferResult, createUpdate } from "$lib/data_objects/data_objects";
import { orderByDate } from "$lib/other_functions/other.functions";
import { get } from "svelte/store";
import { Principal } from "@dfinity/principal";
import { createAgent } from "@dfinity/utils";
import { AccountIdentifier, LedgerCanister, Topic } from "@dfinity/nns";

//await initDB();

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
 * @param {update } update
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
 * @param {finalUpdate } update
 * @param {string} solutionKey
 */
export async function postFinalUpdate(update, solutionKey) {
    debugger;
    let myDoc = await getDocu("solutions", solutionKey);
    let topicKey = myDoc?.data.topic;
    // @ts-ignore
    myDoc.data.finalUpdate = update;
    await updateData(myDoc, "solutions", solutionKey);
    await post_final_update_notification(update, solutionKey, topicKey);
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
        return;
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
/**
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
    //window.location.href = "/idea?id=" + key;

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
 * @param {string} username
 */
export async function usernameExists(username) {
    let myListDocs = await listDocu("users");
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
 * @param {string} userKey
 */
export async function getUsername(userKey) {
    let myDoc = await getDocu("users", userKey);
    return myDoc?.data.nickname || { userKey };
}
/**
 * @param {string} userKey
 */
export async function getProfilePicture(userKey) {
    let myDoc = await getDocu("users", userKey);
    return myDoc?.data.picture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
}


/**
 * @param {string} topicKey
 * @param {string} solutionKey
 * @param {number} amount
 */
export async function approveSolution(topicKey, solutionKey, amount) {
    debugger;
    let approvalResult = createTransferResult();
    const store = get(info);

    let wltAddres = await getWalletAddress(store.key);
    console.log("Wallet address", wltAddres);
    let amountBigInt = decimalToICP(amount);
    let creatorCut = calculatePercentage(amountBigInt, 10);
    let developerCut = calculatePercentage(amountBigInt, 90);
    console.log("Store before transfer", store);

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

    //7) Send notification to the developer
    //8) Send notification to the creator
}
/**
 * @param {string} userKey
 */
export async function getWalletAddress(userKey) {
    let userPrincipal = Principal.fromText(userKey);
    const accountIdent = AccountIdentifier.fromPrincipal({ principal: userPrincipal })
    let walletAddress = accountIdent.toHex();
    return walletAddress;
}
/**
 * Convert a decimal number to BigInt representation.
 *
 * @param {any} decimalValue - The decimal number to convert.
 * @return {bigint} - The BigInt representation.
 */
export function decimalToICP(decimalValue) {
    const icpBigInt = BigInt(decimalValue * 1e8);
    return icpBigInt;
}
/**
 * Convert a decimal number to BigInt representation.
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