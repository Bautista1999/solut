import { basicInfo, signedIn } from "$lib/stores/auth.state";
import { isLoading, loginedIn, signInSuccessful } from "$lib/stores/other_stores";
import { getDoc, listDocs, setDoc, signIn } from "@junobuild/core-peer";
import { info } from "../stores/auth.state";
import { createNotification, createUser } from "$lib/data_objects/data_objects";
import { nanoid } from "nanoid";
import { post_follow_notification } from "./docu.functions";
let user = createUser();

/**
* BRIEF DESCRIPTION: This function logins a user into his/her internet identity through Juno and registers it
into Solutio if the user wasnt registered.

* PRE-CONDITIONS: --None--

* POST-CONDITIONS: User signed in

* OUTSIDE FUNCTIONS: Juno --> signIn()
 */
export async function login() {
    //isLoading store is for components that need to change its state if the user sign in is in process.
    isLoading.set(true);
    await signIn();
    // @ts-ignore
    //Here we initialize the basic info of the user, once signed in.
    basicInfo();
    info.subscribe(async (value) => {
        await registerUser(value.key);
    });

    isLoading.set(false);
    signInSuccessful.set(true);

    setTimeout((() => {
        signInSuccessful.set(false);
        loginedIn.set(true);
    }), 2000)
}


/**
BRIEF DESCRIPTION: This function its activated when the user is signed in into its internet identity, 
therefore you need to be signed in to use it. Basically, it looks if the user is registered in Solutio's 
database. If it's not, it creates a new two new docs in Juno's database: one for basic user information 
and other one for notifications. The only data stored is in the users doc and it is the userKey provided.

PRE: Receives the string key derived from authSubscribe (Juno)

POST: Registers the user in Juno's database

OUTSIDE FUNCTIONS: Juno --> setDoc()
 * @param {String} UserKey
 */
export async function registerUser(UserKey) {
    console.log("Looking if the user is registered...")
    const inDB = await isRegistered(UserKey);
    console.log(inDB);
    if (inDB === true) {
        console.log("Already registered!")
        return;
    };
    console.log("Not registered: registering now...");
    user.address = UserKey;
    user.notificationsKey = "NOT_" + UserKey;

    await setDoc({
        collection: "users",
        doc: {
            key: UserKey,
            data: user,
        },
    });
    await setDoc({
        collection: "notifications",
        doc: {
            key: user.notificationsKey,
            data: [],
        },
    });
}

/**
BRIEF DESCRIPTION: This function its activated when the user is signed in into its internet identity, 
therefore you need to be signed in to use it. Basically, it looks the users key in Juno's collection
"Users". If a match is found, true is returned, false otherwise.

PRE: Receives the string key derived from authSubscribe

POST: Returns TRUE if the user is in Juno's database already, FALSE otherwise.
 * @param {string} key
* 
 */
export async function isRegistered(key) {

    const userEx = await getDoc({
        collection: "user",
        key: key,
    });
    if (userEx==undefined) {
        return false;
    }else{
        return true;
    };
}

/**
     * @param {String[]} list
     * @param {string} item
     */
function substractItem(list, item) {
    const index = list.indexOf(item);
    if (index > -1) {
        list.splice(index, 1);
    }
    list = list;
    console.log(list);
    return list;
}

/**
BRIEF DESCRIPTION: This function checks if the user follows certain element such as a topic, idea, solution
or another user. Basically it checks the userKey doc in the collection "Users" and looks if the element key
its under "followedIdeas" (the field followed ideas its meant for all the elements the user follows,
this will change in the future).

PRE: Receives the signed in user key, and the element Key (it can be a key from topic, idea, solution, 
or user). You can activate this function without being signed in, it returns "Not signed in".

POST: Returns TRUE if the user follows the element, FALSE otherwise. "Not signed in" if its not signed in. 
 * @param {string} userKey
 * @param {string} ideaKey
 */
export async function checkFollowIdea(userKey, ideaKey) {
    //We need to check if the idea's key is indeed in the followedIdeas[] field of the user.
    if (!(await signedIn())) {
        console.log("Not signed in! x2");
        return "Not signed in";
    }
    await registerUser(userKey);
    const myDoc2 = await getDoc({
        collection: "users",
        // @ts-ignore
        key: userKey,
    });
    let userData = myDoc2?.data;
    const index = userData.followedIdeas.indexOf(ideaKey);
    if (index > -1) {
        return true;
    }
    return false;
}
/**
BRIEF DESCRIPTION: Very similar to the function checkFollowIdea(), but this one is more concrete. The
difference is that this one only returns true or false. So this one if for front-end use, basically the state
of each screen changes if the user its signed in and follows or not. So wheter the user is signed in and follows
or not, we only have two states. For example, the "follow" button its orange if the user is signed in and follows
the element or white if the user is not signed in or doesnt follow the element. So for 3 different scenarios, 
we have just 2 states. Thats why the function checkFollow() returns only true or false.

PRE: Receives the signed in user key, and the element Key (it can be a key from topic, idea, solution, 
or user). You can activate this function without being signed in, it returns false.

POST: Returns TRUE if the user follows the element, FALSE otherwise.
 * @param {string} userKey
 * @param {string} ideaKey
 */
export async function checkFollow(userKey, ideaKey) {
    let result = await checkFollowIdea(userKey, ideaKey);
    // @ts-ignore
    if (result == "Not signed in") {
        console.log("Not signed in!");
        return false;
    }
    return result;
}

/**
 * @param {string | any[]} list1
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
BRIEF DESCRIPTION: This functions is activated when the user follows an element. Basically, this 
method increases the amount of followers of the element and adds the user key to the followers list of the
item. Then it adds the element key to the followed ideas list of the users doc. Additionally, it sends a
notification to the creator of said element saying that {userKey.username} has followed element {ideaKey.title}

PRE: Receives the signed in user key, and the element Key (it can be a key from topic, idea, solution, 
or user), and the collection name. You can activate this function without being signed in, 
it returns "Not signed in".

POST: Returns "Success" if the operaiton was successfull. "Not signed in" if the user is not signed in. 
* @param {String} userKey
* @param {String} ideaKey
* @param {any} collectionName
*/
export async function followIdea(userKey, ideaKey, collectionName) {
    if (!(await signedIn())) {

        return "Not signed in";
    }
    const myDoc = await getDoc({
        collection: collectionName,
        // @ts-ignore
        key: ideaKey,
    });
    let topicData = myDoc?.data;
    // @ts-ignore
    topicData.amountFollowers += 1;

    //2) We need to add the user that followed to the followers[] section
    // @ts-ignore
    topicData.followers.push(userKey);
    // @ts-ignore
    topicData.followers = topicData.followers;
    await setDoc({
        collection: collectionName,
        doc: {
            // @ts-ignore
            key: ideaKey,
            // @ts-ignore
            version: myDoc?.version,
            data: topicData,
        },
    });
    //3) We need to add the idea to the followed[] ideas of the user
    const myDoc2 = await getDoc({
        collection: "users",
        // @ts-ignore
        key: userKey,
    });
    let userData = myDoc2?.data;
    userData.followedIdeas.push(ideaKey);
    userData.followedIdeas = userData.followedIdeas;

    await setDoc({
        collection: "users",
        doc: {
            // @ts-ignore
            key: userKey,
            // @ts-ignore
            version: myDoc2?.version,
            data: userData,
        },
    });
    await post_follow_notification(userKey, collectionName, ideaKey);
    return "Success";

}

/**
BRIEF DESCRIPTION: This functions is activated when the user unfollows an element. Basically, this 
method decreases the amount of followers of the element and removes the user key from the followers list of the
item. Then it removes the element key from the followed ideas list of the users doc. 

PRE: Receives the signed in user key, and the element Key (it can be a key from topic, idea, solution, 
or user), and the collection name. You can activate this function without being signed in, 
it returns "Not signed in". This last case is not probable as you cant digitaly use this function if the
user is not signed in. Is just to avoid errors.

POST: Returns "Success" if the operaiton was successfull. "Not signed in" if the user is not signed in. 
 * @param {string} userKey
 * @param {string} ideaKey
 * @param {string} collectionName
 */
export async function unfollowIdea(userKey, ideaKey, collectionName) {
    if (!(await signedIn())) {

        return "Not signed in";
    }
    //1) We need to decrease the amount of followers in topicsData
    const myDoc = await getDoc({
        collection: collectionName,
        // @ts-ignore
        key: ideaKey,
    });
    let topicData = myDoc?.data;
    // @ts-ignore
    topicData.amountFollowers -= 1;

    //2) We need to substract the user that followed from the followers[] section

    // @ts-ignore
    topicData.followers = substractItem(topicData.followers, userKey);
    // @ts-ignore
    topicData.followers = topicData.followers;
    await setDoc({
        collection: collectionName,
        doc: {
            // @ts-ignore
            key: ideaKey,
            // @ts-ignore
            version: myDoc?.version,
            data: topicData,
        },
    });
    //3) We need to substract the idea from the followed[] ideas of the user
    const myDoc2 = await getDoc({
        collection: "users",
        // @ts-ignore
        key: userKey,
    });
    let userData = myDoc2?.data;
    // @ts-ignore
    userData.followedIdeas = substractItem(userData.followedIdeas, ideaKey);
    await setDoc({
        collection: "users",
        doc: {
            // @ts-ignore
            key: userKey,
            // @ts-ignore
            version: myDoc2?.version,
            data: userData,
        },
    });
    return "Success";
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
                description: username /*+ "|" + parentIdeaKey*/,
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
}

/**
 * @param {number} num
 */
export function formatNumber(num){
    if (num < 1000) {
        return num.toString();
    } else if (num < 1000000) {
        return (num / 1000).toFixed(num % 1000 !== 0 ? 1 : 0) + "K";
    } else {
        return (num / 1000000).toFixed(num % 1000000 !== 0 ? 1 : 0) + "M";
    }
}