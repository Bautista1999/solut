// src/routes/metadata/[idea_id]/+server.ts
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
    const { idea_id } = params;

    // Mock metadata based on the idea_id. Replace with actual data fetching logic.
    const metadata = {
        title: `Title for ${idea_id}`,
        description: `Description for ${idea_id}`,
        image: `https://example.com/images/${idea_id}.jpg`
    };

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>${metadata.title}</title>
        <meta name="description" content="${metadata.description}" />
        <meta property="og:title" content="${metadata.title}" />
        <meta property="og:description" content="${metadata.description}" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://solutio.one/metadata/${idea_id}" />
        <meta property="og:image" content="${metadata.image}" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="${metadata.title}" />
        <meta name="twitter:description" content="${metadata.description}" />
        <meta name="twitter:image" content="${metadata.image}" />
    </head>
    <body>
        <h1>${metadata.title}</h1>
        <p>${metadata.description}</p>
        <img src="${metadata.image}" alt="${metadata.title}" />
    </body>
    </html>
    `;

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html'
        }
    });
};
