import { error } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Load} */
export function load({ params }) {
    const { invite } = params;

    return {
        props: {
            invite
        }
    };
}
