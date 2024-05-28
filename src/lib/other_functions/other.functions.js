import { post_pledge_notification } from "$lib/data_functions/docu.functions";
import { createAdvancedDate, createPledgedElement, createSolution } from "$lib/data_objects/data_objects";
import { info, signedIn } from "$lib/stores/auth.state";
import { pledgeModal } from "$lib/stores/other_stores";
import { DateInTheFutureValidator } from "$lib/validators/create.validator";
import { getDoc, setDoc } from "@junobuild/core-peer";
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
            return dates[i];
        };
    }
    let returnData = {
        newDate: {
            day: 0,
            month: 0,
            year: 2023,
        },
        title: "",

    };
    return returnData;
}
/**
BRIEF DESCRIPTION: receives one list and a number, and basically it copies the first {number} items
of the list into a new list and returns it. If {number} is greater than the list1 length,
it copies the whole list1.
* @param {any[]} list1
* @param {number} amount
*/
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

/**
BRIEF DESCRIPTION: Receives a list, a position, an amount, a orientation (left or right) and returns a copy of the list 
with {amount} elements inside it with {amount-1} elements before (if the orientation is left) or after 
(if it is right) from the position. 

PRE: It is expected to receive the first position of the displayed images in the ARRAY . 
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
Pre: This works for a list of strings.
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
let deadlines = createSolution().deadlines;
//let newDeadline = { newDate: { day: "", month: "", year: "" }, title: "" };
/**
 * @param {deadlines[]} list
 */
export function orderByDate(list) {
    let returnList = list;

    //Order by year
    //In every iteration, it will find the position of the deadline with
    //the minimum year and put it at the top of the list. 
    for (let i = 0; i < list.length; i++) {
        // @ts-ignore
        let year = returnList[i].newDate.year;
        let deadline = returnList[i];
        let minYear = year;
        let minYearPos = i;
        let minHasChanged = false;

        for (let j = i; j < list.length; j++) {
            if (j != i) {
                // @ts-ignore
                let year2 = returnList[j].newDate.year;
                if (minYear > year2 && i < j) { //si el ano es mayor que el ano siguiente Y esta en una posicion
                    //en la lista que es inferior al del ano siguiente, hay que cambiarlos. 
                    //aca los cambiamos de posicion
                    minYear = year2
                    minYearPos = j;
                    minHasChanged = true;
                }
            }
        }
        if (minHasChanged) {
            returnList[i] = returnList[minYearPos];
            returnList[minYearPos] = deadline;
        }
        minHasChanged = false;

    }

    //Order by month
    for (let i = 0; i < list.length; i++) {
        // @ts-ignore
        let year = returnList[i].newDate.year;
        // @ts-ignore
        let month = returnList[i].newDate.month;
        let deadline = returnList[i];
        let minMonth = month;
        let minMonthPos = i;
        let minHasChanged = false;

        for (let j = i; j < list.length; j++) {
            if (j != i) {
                // @ts-ignore
                let year2 = returnList[j].newDate.year;
                if (year2 == year) {
                    // @ts-ignore
                    let month2 = returnList[j].newDate.month;
                    if (minMonth > month2 && i < j) { //si el ano es mayor que el ano siguiente Y esta en una posicion
                        //en la lista que es inferior al del ano siguiente, hay que cambiarlos. 
                        //aca los cambiamos de posicion
                        minMonth = month2
                        minMonthPos = j;
                        minHasChanged = true;
                    }
                }
            }
        }
        if (minHasChanged) {
            returnList[i] = returnList[minMonthPos];
            returnList[minMonthPos] = deadline;
        }
        minHasChanged = false;

    }
    console.log(returnList);
    //Order by day
    for (let i = 0; i < list.length; i++) {
        // @ts-ignore
        let year = returnList[i].newDate.year;
        // @ts-ignore
        let month = returnList[i].newDate.month;
        // @ts-ignore
        let day = returnList[i].newDate.day;
        let deadline = returnList[i];
        let minDay = day;
        let minDayPos = i;
        let minHasChanged = false;

        for (let j = i; j < list.length; j++) {
            if (j != i) {
                // @ts-ignore
                let year2 = returnList[j].newDate.year;
                // @ts-ignore
                let month2 = returnList[j].newDate.month;
                if (year2 == year && month == month2) {
                    // @ts-ignore
                    let day2 = returnList[j].newDate.day;
                    if (minDay > day2 && i < j) { //si el ano es mayor que el ano siguiente Y esta en una posicion
                        //en la lista que es inferior al del ano siguiente, hay que cambiarlos. 
                        //aca los cambiamos de posicion
                        minDay = day2;
                        minDayPos = j;
                        minHasChanged = true;
                    }
                }
            }
        }
        if (minHasChanged) {
            returnList[i] = returnList[minDayPos];
            returnList[minDayPos] = deadline;
        }
        minHasChanged = false;

    }
    return returnList;
}
/**
 * @param {any} opt
 * @param {any[]} list
 */
export function substractItem_General(opt, list) {
    // @ts-ignore
    const index = list.indexOf(opt);

    if (index !== -1) {
        list.splice(index, 1);
    }
    list = list;
    return list;
}
/**
 * @param {any} opt
 * @param {any[]} list
 */
export function itemExists_General(opt, list) {
    // @ts-ignore
    const index = list.indexOf(opt);

    if (index !== -1) {
        return true;
    }
    return false;

}
let dateAdv = createAdvancedDate();
/**
 * @param {dateAdv} date
 */
export function howLongAgo(date) {
    let now = new Date();
    let day = now.getDate();
    let month = now.getMonth() + 1;
    let year = now.getFullYear();
    let minutes = now.getMinutes();
    let hours = now.getHours();
    let seconds = now.getSeconds();
    let time = {
        timeframe: "",
        amount: 0,
    };
    if (year == date.year) {
        if (month == date.month) {
            if (day == date.day) {
                if (hours == date.hour) {
                    if (minutes == date.minutes) {
                        if (seconds == date.seconds) {

                        } else {
                            let diff = seconds - date.seconds;
                            if (diff > 1) {
                                return time = {
                                    timeframe: "seconds",
                                    amount: diff,
                                };
                            } else {
                                return time = {
                                    timeframe: "second",
                                    amount: diff,
                                }
                            }
                        }
                    } else {
                        let diff = minutes - date.minutes;
                        if (diff > 1) {
                            return time = {
                                timeframe: "minutes",
                                amount: diff,
                            };
                        } else {
                            return time = {
                                timeframe: "minute",
                                amount: diff,
                            }
                        }
                    }
                } else {
                    let diff = hours - date.hour;
                    if (diff > 1) {
                        return time = {
                            timeframe: "hours",
                            amount: diff,
                        };
                    } else {
                        return time = {
                            timeframe: "hour",
                            amount: diff,
                        }
                    }
                }
            } else {
                let diff = day - date.day;
                if (diff > 1) {
                    return time = {
                        timeframe: "days",
                        amount: diff,
                    };
                } else {
                    return time = {
                        timeframe: "day",
                        amount: diff,
                    }
                }
            }
        } else {
            let diff = month - date.month;
            if (diff > 1) {
                return time = {
                    timeframe: "months",
                    amount: diff,
                };
            } else {
                return time = {
                    timeframe: "month",
                    amount: diff,
                }
            }
        }
    } else {
        let diff = year - date.year;
        if (diff > 1) {
            return time = {
                timeframe: "years",
                amount: diff,
            };
        } else {
            return time = {
                timeframe: "year",
                amount: diff,
            }
        }

    }
    return time;
}