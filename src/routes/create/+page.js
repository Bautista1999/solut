import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export function load({ url: { searchParams } }) {
    const under = searchParams?.get("under");

    console.log(under);

    return {
        under
    }
}