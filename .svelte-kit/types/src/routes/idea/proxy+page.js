// @ts-nocheck
import { error } from '@sveltejs/kit';

/** @param {Parameters<import('./$types').PageLoad>[0]} event */
export function load({ url: { searchParams } }) {
    const id = searchParams?.get("id");

    console.log(id);

    return {
        id
    }
}