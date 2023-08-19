import { getDoc, setDoc } from "@junobuild/core";
let user = {
    nickname: "",
    address: "",
    walletAddress: "",
    followedIdeas: [],
    followers: [],
    picture: null,
    backgroundPicture: null,
    areasOfInterest: [],
    comments: [],
    balance: 0,
    pledged: 0,
    funded: 0,
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