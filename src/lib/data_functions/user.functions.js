import { basicInfo, signedIn } from "$lib/stores/auth.state";
import { isLoading, loginedIn, signInSuccessful } from "$lib/stores/loading";
import { getDoc, setDoc, signIn } from "@junobuild/core";
import { info } from "../stores/auth.state";

let user = {
    nickname: "",
    address: "",
    walletAddress: "",
    followedIdeas: [],
    followers: [],
    picture: "",
    backgroundPicture: "",
    areasOfInterest: [],
    comments: [],
    balance: 0,
    pledged: 0,
    funded: 0,
    transactionHistory: [],
}


export async function login() {
    isLoading.set(true);
    await signIn();
    // @ts-ignore
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

//PRE:Receives the string key derived from authSubscribe
//POST:Registers the user in Juno's database
/**
 * @param {String} UserKey
 */
export async function registerUser(UserKey) {
    console.log("Starting registration...")
    const inDB = await isRegistered(UserKey);
    console.log(inDB);
    if (inDB === true) { return; };
    user.address = UserKey;
    console.log("Not registered");
    await setDoc({
        collection: "users",
        doc: {
            key: UserKey,
            data: user,
        },
    });
}
//PRE:Receives the string key derived from authSubscribe
//POST:Returns TRUE if the user is in Juno's database already, false otherwise.
/**
 * @param {string} key
 */
async function isRegistered(key) {
    let alreadyReg = false;
    const userEx = await getDoc({
        collection: "users",
        // @ts-ignore
        key: key,
    });
    if (!userEx) {
        console.log("Not registered")
        return false;
    }
    console.log(userEx)
    console.log("Registered!")
    alreadyReg = true;
    return alreadyReg;
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
            updated_at: myDoc?.updated_at,
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
            updated_at: myDoc2?.updated_at,
            data: userData,
        },
    });
    return "Success";

}

/**
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
            updated_at: myDoc?.updated_at,
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
            updated_at: myDoc2?.updated_at,
            data: userData,
        },
    });
    return "Success";
}
