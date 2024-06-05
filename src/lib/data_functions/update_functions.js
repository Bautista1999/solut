import { authSubscribe, deleteDoc, getDoc, getManyDocs, setDoc, setManyDocs, unsafeIdentity } from "@junobuild/core-peer";
import { nanoid } from "nanoid";
import {idlFactory as canisterIdl}  from "$lib/declarations/admin.declarations.did.js";
import { Actor, HttpAgent } from "@dfinity/agent";
import { admin_canister_id } from "./canisters";
import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";

/**
 * @param {import("$lib/data_objects/data_types").user} user
 * @param {string} userKey
 */
export async function updateUser(user, userKey){

    let docsToUpdate = await getManyDocs({docs:[{collection:"user",key:userKey},{collection:"user_index",key:"INDEX_"+userKey}]})
    if(docsToUpdate[0]==undefined || docsToUpdate[1]==undefined ){
        throw new Error("User docs not found!");
    };
    let userDoc = {
        collection:"user",
        doc:{
            key:userKey,
            description:"username:"+user.username,
            data:user,
            version:docsToUpdate[0]?.version,
            updated_at:docsToUpdate[0]?.updated_at,
        }
    };
    
    

    let indexSearchDoc = {
        collection:"user_index",
        doc:{
            key:"INDEX_"+userKey,
            description:"username:"+user.username,
            data:{
                images:[user.profilePicture,...user.images],
                videos:user.videos,
            },
            version:docsToUpdate[1]?.version,
            updated_at:docsToUpdate[1]?.updated_at,
        }
    };



    let arrayDocs = [userDoc,indexSearchDoc];
    let newDocs = await setManyDocs({docs:arrayDocs});
    return newDocs;
};


export const toArray = async (/** @type {any} */ data) => {
    const blob = new Blob([JSON.stringify(data)], {
      type: 'application/json; charset=utf-8'
    });
    return new Uint8Array(await blob.arrayBuffer());
  };
