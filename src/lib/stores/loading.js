import { writable } from 'svelte/store';

export const isLoading = writable(false);
export const signInSuccessful = writable(false);
export const loginedIn = writable(false);
export const NotSignedIn = writable(false);
export const pledgeModal = writable(false);
export const updateModal = writable(false);
export const termsModal = writable(false);
export const subideaModal = writable(false);
export const subideaLoading = writable(false);
export const PostUpdateModal = writable(false);
/**
 * @type {string[]}
 */
let images = [];
export const updateImages = writable(images);

export const displayedUpdImages = writable(images);
export const amountNotis = writable(0);


