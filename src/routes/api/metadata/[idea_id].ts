// src/routes/api/metadata/[idea_id].ts
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
    const { idea_id } = params;

    // Mock metadata based on the idea_id, in a real scenario, fetch this from a database
    const metadata = {
        title: `Title for ${idea_id}`,
        description: `Description for ${idea_id}`,
        image: `https://example.com/images/${idea_id}.jpg`
    };

    return new Response(JSON.stringify(metadata), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
