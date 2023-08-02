// @ts-nocheck
import { error } from '@sveltejs/kit';

/** @param {Parameters<import('./$types').PageLoad>[0]} event */
export function load({ params }) {
    console.log(params.id);
    return {
        id: params.id
    }
}