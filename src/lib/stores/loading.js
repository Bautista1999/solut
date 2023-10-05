import { writable } from 'svelte/store';

export const isLoading = writable(false);
export const signInSuccessful = writable(false);
export const loginedIn = writable(false);
