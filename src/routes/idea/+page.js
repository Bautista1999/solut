import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export function load({ url: { searchParams } }) {
    const id = searchParams?.get("id");

    console.log(id);

    return {
        id
    }
}