// Import SvelteKit's error handling
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ url }) {
    if (typeof window === 'undefined') {
        return {
            topicData: null
        };
    }

    const id = url.searchParams.get('id');

    if (!id) {
        throw error(400, 'Missing id parameter');
    }

    // Simulated data fetching logic
    const topicData = await fetchTopicDataById(id);

    if (!topicData) {
        throw error(404, 'Topic not found');
    }

    return {
        topicData
    };
}

/**
 * Mock function to simulate fetching topic data
 * @param {string} id
 * @returns {Promise<{title: string, description: string, imageUrl: string}>}
 */
async function fetchTopicDataById(id) {
    return {
        title: 'Example Topic',
        description: 'This is a description for the example topic.',
        imageUrl: 'https://juno.build/img/juno_logo.svg',
    };
}
