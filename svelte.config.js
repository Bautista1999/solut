import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      fallback: 'index.html', // Specify the fallback page
    }),
    prerender: {
      entries: [
        '*', // Prerender all found static routes
        '/account/[user_key]',
        '/createaccount/[user_id]',
        '/createidea/[idea_id]',
        '/createsolution/[idea_id]',
        '/idea/[feature_id]',
        '/topic/[idea_id]',
        '/notifications/[user_id]',
        '/profile/[user_id]',
        '/signin/[inviter_key]',
        '/solution/[solution_id]',
      ],
    },
  }
};

export default config;