import { decimalToBigInt, info, signedIn } from "$lib/stores/auth.state";
import { NotSignedIn, pledgeModal } from "$lib/stores/loading";
import { DateInTheFutureValidator } from "$lib/validators/create.validator";
import { getDoc, setDoc } from "@junobuild/core";
import { get, writable } from "svelte/store";

export const copied = writable(false);

export async function copyLink() {
    // Get the current webpage URL
    const url = window.location.href;

    // Create a temporary input element to hold the URL
    const tempInput = document.createElement("input");
    tempInput.value = url;
    document.body.appendChild(tempInput);

    // Select the URL text and copy it to the clipboard
    tempInput.select();
    document.execCommand("copy");

    // Clean up by removing the temporary input element
    document.body.removeChild(tempInput);
    copied.set(true);
    await setTimeout(() => {
        copied.set(false);
    }, 2000);
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
 * @param {number} amountICP
 * @param {string} address
 * @param {string} documentID
 * @param {string} collectionName
 */
export async function pledgeFunds(documentID, amountICP, address, collectionName) {
    if (!(await signedIn())) {
        pledgeModal.set(false);
        NotSignedIn.set(true);
        return "Not signed in";
    }
    //1) We need to increase the amount of moneyPledged field of the idea
    //2) Create a transactionHistory in the idea
    console.log("Getting idea document...");
    const myDoc = await getDoc({
        collection: "ideas",
        // @ts-ignore
        key: documentID,
    });
    let topicData = myDoc?.data;
    console.log("Done!");
    console.log("Creating transaction...");
    let now = Date.now();
    let newTransactionIdea = {
        user: get(info).key,
        amountICP: amountICP,
        sentTo: address,
        date: now,
    };
    console.log("Increasing amount of money pledged in the idea...");
    // @ts-ignore
    topicData.moneyPledged += amountICP;
    // @ts-ignore
    topicData.transactionHistory.push(newTransactionIdea);
    // @ts-ignore
    topicData.transactionHistory = topicData.transactionHistory;
    console.log("Updating idea`s info in DB...");
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
    console.log("Done!");

    //3) We need to increase the amount of pledged field of the user
    //4) Create a transactionHistory in the user
    console.log("Getting user`s doc...");
    const myDoc2 = await getDoc({
        collection: "users",
        // @ts-ignore
        key: get(info).key,
    });
    console.log("Done!");
    console.log("Creating transaction in the user...");
    let newTransactionUser = {
        idea: documentID,
        amountICP: amountICP,
        sentTo: address,
        date: now,
    };
    let userData = myDoc2?.data;
    userData.transactionHistory.push(newTransactionUser);
    userData.transactionHistory = userData.transactionHistory;
    console.log("Increasing amount of money pledged in the idea...");
    userData.pledged += amountICP;
    console.log("Updating user`s info in DB...");
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
    console.log("Done!");
    // TODO
    //5) We need to actually transfer the amountICP tokens to the given address
    const bigIntRepresentation = decimalToBigInt(amountICP, 10 ** 8);
    console.log(bigIntRepresentation); // Expected: 200000
    // @ts-ignore
    let result = transferFrom(address, bigIntRepresentation);
}
let date = {
    newDate: { day: 22, month: 8, year: 23 },
    title: "",
};
/**
 * @param {date[]} dates
 */
export function getClosestDate(dates) {
    //1) First we need to check if the date is in the past. If it is,
    // we can leave that date out. 
    //2) Then, we need to return the title of the next date that is NOT in the past. 
    //So essentialy, we iterate until we find a match that isnt in the past. 
    //For this function, the list need to be ordered by date.

    for (let i = 0; i < dates.length; i++) {
        let inTheFuture = DateInTheFutureValidator(dates[i].newDate.day, dates[i].newDate.month, dates[i].newDate.year);
        if (inTheFuture) {
            return dates[i].title;
        };
    }
    return "Everything in the past";
}
/**
* @param {any[]} list1
* @param {number} amount
*/
//receives one list and a number, and basically it copies the first {number} items
// of the list into a new list and returns it. If {number} is greater than the list1 length,
// it copies the whole list1.
export function subList(list1, amount) {
    let returnList = [];
    let limit = list1.length - 1;
    if (amount <= list1.length - 1) {
        limit = amount - 1;
    }
    for (let i = 0; i <= limit; i++) {
        returnList.push(list1[i]);
        returnList = returnList;
    }
    return returnList;
}
//receives a list, a position, an amount, a orientation (left or right) and returns a copy of the list 
// with {amount} elements inside it with {amount-1} elements before (if the orientation is left) or after 
//(if it is right) from the position. 
//PRE: It is expected to receive the first position of the displayed images in the ARRAY . 
/**
 * @param {string[]} list
 * @param {number} amount
 * @param {string} orientation
 * @param {number} position
 */
export function AdvancedSubList(list, amount, orientation, position) {
    /**
     * @type {string[]}
     */
    let returnList = list;
    if (orientation == "left") {
        position = position - 1;
        if (position < 0) {
            returnList = subList(returnList, amount)
            return returnList;
        }
        returnList = list.slice(position);
        returnList = subList(returnList, amount);
    } else {

        if (position + amount >= list.length) {
            returnList = list.slice(position);
            returnList = subList(returnList, amount);
            return returnList;
        }
        position = position + 1;
        returnList = list.slice(position);
        returnList = subList(returnList, amount);
    }
    return returnList;
}
/**
 * @param {any[]} list
 * @param {string} item
 */
export function substractItem(list, item) {
    const index = list.indexOf(item);

    if (index !== -1) {
        list.splice(index, 1);
    }
    console.log(list);
    return list;
}