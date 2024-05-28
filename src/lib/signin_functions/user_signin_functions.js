import { authSubscribe, initJuno } from "@junobuild/core-peer";

/** 
* @return {Promise<boolean>}
*/
export async function CheckIfSignedIn(){
    // await initJuno({
    //     satelliteId: "svftd-daaaa-aaaal-adr3a-cai",
    // });
    return new Promise((resolve) => {
        authSubscribe((user) => {
            if (user == undefined) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}