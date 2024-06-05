import { IsSignedIn } from "$lib/stores/other_stores";
import { authSubscribe, initJuno } from "@junobuild/core-peer";

/** 
* @return {Promise<boolean>}
*/
export async function CheckIfSignedIn(){
    return new Promise(async (resolve) => {
        authSubscribe((user) => {
            if (user == undefined) {
                IsSignedIn.set(false);
                resolve(false);
            } else {
                IsSignedIn.set(true);
                resolve(true);
            }
        });
    });
}

export async function CheckIfSignedInHeader(){
    return new Promise(async (resolve) => {
        setTimeout(()=>{
            authSubscribe((user) => {
                if (user == undefined) {
                    console.log(false);
                    resolve(false);
                } else {
                    console.log(true);
                    resolve(true);
                }
            });
        },1000)
    });
}