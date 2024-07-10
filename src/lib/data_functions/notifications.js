import { getDoc, listDocs, setDoc } from "@junobuild/core-peer";
import { createOrRegexInput, getFollowedElements, getUserKey } from "./get_functions";

/**
 * @param {string} notificationKey
 */
export async function setLastNotificationRead(notificationKey){
    let userKey = await getUserKey();
    let notificationReadDoc = await getDoc({
        collection: "last_notification_read",
        key: "LAST_READ_" + userKey
    });
    let newNotifications = await GetNewNotifications();
    let LastNotificationReadKey = (newNotifications)[newNotifications.length-1].key;
    if(notificationReadDoc==undefined){

        await setDoc({
            collection: "last_notification_read",
            doc: {
                key: "LAST_READ_" + userKey,
                data:LastNotificationReadKey,
            }
        });
        return;
    }else{
        await setDoc({
            collection: "last_notification_read",
            doc: {
                key: "LAST_READ_" + userKey,
                data:LastNotificationReadKey,
                updated_at:notificationReadDoc.updated_at,
                version:notificationReadDoc.version,
            }
        });
        return;
    };
};
/**
 * 
 * @returns {Promise<import("@junobuild/core-peer").Doc<any> | undefined>}
 */
export async function GetLastNotificationReadDocument(){
    let userKey = await getUserKey();
    let notificationReadDoc = await getDoc({
        collection: "last_notification_read",
        key: "LAST_READ_" + userKey
    });
    return notificationReadDoc;
}
/**
 * 
 * @returns {Promise<string>}
 */
export async function GetLastNotificationReadKey(){
    let notificationReadDoc = await GetLastNotificationReadDocument();
    if(notificationReadDoc==undefined){
        return "";
    }else{
        return notificationReadDoc?.data;
    }
    
}

export async function GetNewNotifications(){
    let lastNotificationKey = await GetLastNotificationReadKey();
    let userKey = await getUserKey();
    if(userKey==""){
        return [];
    }
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
                desc:false,
                field:'created_at'
            },
            paginate:{
                startAfter:lastNotificationKey==""?undefined:lastNotificationKey ,
            }
            
        },
        
    });
    return notifications.items;


}
/**
 * 
 * @returns {Promise<number>}
 */
export async function GetAmountNewNotifications(){
    return ((await GetNewNotifications()).length);
}