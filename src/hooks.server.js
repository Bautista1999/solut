export async function handle({ event, resolve }) {
    const url = new URL(event.request.url);
    // If the URL path is not the root and ends with a slash, redirect to the same URL without the trailing slash
    if (url.pathname != '/' && url.pathname.endsWith('/')) {
        return new Response(null, {
            status: 301,
            headers: {
                location: url.pathname.slice(0, -1) + url.search // Redirect without the trailing slash
            }
        });
    }

    return resolve(event); // Continue as normal if no trailing slash is present
}
