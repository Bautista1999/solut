import { goto } from "$app/navigation";
import { get, writable } from "svelte/store";

export let path = writable('/');
/**
 * @param {string} newPath
 */
export function SetPath(newPath){
    path.set(newPath);
    return;
}

export function GoToPath(){
    debugger;
    const currentPath = get(path); // Extract the value from the store
    window.location.href = currentPath; // Use the extracted value
    path.set('/');
}