// Public site configuration. Everything here is visible to anyone who opens the site, by design.
//
// Supabase (anonymous sign-in, see auth.js): put ONLY the Project URL and the Publishable key here, from the Supabase
// dashboard → Project Settings → API Keys. The publishable key (sb_publishable_…) is meant to be public; the
// database is protected by Row Level Security, not by hiding this key. NEVER put a secret key (sb_secret_…), the
// service_role key or a database password in this file or anywhere in this repository: auth.js refuses to run
// with a key that looks secret.
//
// While url or publishableKey is empty, sign-in is off and the site works exactly as before.
// Sign-in only runs on the hosts listed (the published site and a local server); opening index.html as a file, the
// automated tests and other copies of the site never contact Supabase.
window.CS61A_CONFIG = {
  supabase: {
    url: "https://fckbutkslyslzhfjutyf.supabase.co",
    publishableKey: 'sb_publishable_xVYlTCg5atItNHdOIjBq9g_OqCUZ4Vn', // sb_publishable_…
    // Both published hostnames while the site moves to the BearsRepo organization (same Supabase project, so the
    // same anonymous users on either), plus a local server.
    hosts: ['jacobkao-cal.github.io', 'bearsrepo.github.io', 'localhost', '127.0.0.1'],
  },
  // Usage tracking (analytics.js, Supabase Phase 2). Runs only where sign-in runs. Set enabled: false to stop sending
  // anything (the safe rollback); the tables and their data stay as they are.
  analytics: {
    enabled: true,
  },
};
