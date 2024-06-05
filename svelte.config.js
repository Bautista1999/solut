import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      fallback: '+page.svelte', // Specify the fallback page
    }),
    prerender: {
      entries: [
        '*', // Prerender all found static routes
        '/account/[user_key]',
        '/createaccount/[user_id]',
        '/createfeature/[idea_id]',
        '/createsolution/[idea_id]',
        '/feature/[feature_id]',
        '/idea/[idea_id]',
        '/notifications/[user_id]',
        '/profile/[user_id]',
        '/signin/[inviter_key]',
        '/solution/[solution_id]',
      ],
    },
  }
};

export default config;