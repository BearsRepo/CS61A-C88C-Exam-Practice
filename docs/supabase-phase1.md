# Supabase Phase 1: anonymous sign-in

Students never see a login form. The first time a student goes past the welcome page, `app/auth.js` restores the
anonymous Supabase session saved in that browser, or creates one with `signInAnonymously()`, and makes sure the
student has a row in `public.profiles`. Practice, exams, history and review are unchanged and keep using
localStorage (`cs61a-practice:v1`). Nothing waits for Supabase: if it is unconfigured, unreachable or failing, the
site works as before and the problem is only logged in the browser console.

## When it runs

- **Entry points:** the first screen past the welcome page, by any route. That covers Start Practicing, Resume your
  unfinished set, Resume your exam, and an exam reopening by itself after a refresh. `render()` in `app/app.js` calls
  `CS61A_AUTH.ensureSession()` without waiting for it.
- **Welcome page:** nothing runs there, so visitors and search crawlers that never go further create no users.
- **One attempt at a time:** across tabs, a browser lock means two tabs opened together create one user, not two.
  Once signed in, nothing more happens for that page.
- **Reusing sessions:** a saved session is reused. If the saved session can't be refreshed because of the network, it
  is kept and retried, never replaced with a new user.
- **Profile creation:** the profile is read first. If it's missing, `{ id: <user uuid> }` is inserted. An insert that
  hits the primary key (code 23505, for example from another tab) counts as already existing.
- **On failure:** `console.warn('[CS61A auth] …')`. The next attempt comes after 30 seconds (on the next screen
  change), when the browser comes back online, or straight away with `CS61A_AUTH.retry()` in the console. Use
  `CS61A_AUTH.status()` to see the current state.
- **Library loading:** `app/vendor/supabase/supabase.min.js` (supabase-js 2.119.0, see its `LICENSE.md`) is loaded
  only when sign-in actually runs.

## Configuration: `app/config.js`

```js
window.CS61A_CONFIG = {
  supabase: {
    url: 'https://<project-ref>.supabase.co',
    publishableKey: 'sb_publishable_…',
    hosts: ['jacobkao-cal.github.io', 'localhost', '127.0.0.1'],
  },
};
```

- **What goes here:** only the Project URL and the Publishable key, from the dashboard under Project Settings → API
  Keys. Both are public by design: anyone can read them in the browser, and Row Level Security is what protects the
  data.
- **What never goes here:** a secret key (`sb_secret_…`), the `service_role` key or a database password, here or
  anywhere in the repository. `auth.js` refuses to run with a key that looks secret.
- **While empty:** with `url` or `publishableKey` empty, sign-in is off.
- **Where it runs:** only over http(s) on the listed hosts. That is the published site and a local server; opening
  `index.html` as a file never signs in.
- **Automated browsers:** sign-in is off in automated browsers (`navigator.webdriver`), so the test suite can never
  create real users, even against a local server.
- **One project for now:** local development and the published site use the same Supabase project. Users created
  while testing locally are real anonymous users in that project.

## Testing locally

```sh
cd app && python3 -m http.server 8000   # then open http://localhost:8000
```

1. Click the welcome image. Home appears immediately.
2. In DevTools → Console, `CS61A_AUTH.status()` should show `status: 'ready'`, `session: 'created'` and
   `profile: 'created'`.
3. Reload and click again. It should now show `session: 'restored'` and `profile: 'existing'`, with the same `userId`.
4. Check that the user appears under Authentication → Users (marked anonymous) and its row is in Table Editor →
   profiles.

`node tests/e2e/supabase_auth.test.js` covers all of this with a fake Supabase client, and with the real library
against mocked responses. No request leaves the machine.

## Database checks (read-only; run in the SQL Editor)

These only read settings. They change nothing.

```sql
-- 1. Table privileges: both should be true.
select
  has_table_privilege('authenticated', 'public.profiles', 'SELECT') as authenticated_can_select,
  has_table_privilege('authenticated', 'public.profiles', 'INSERT') as authenticated_can_insert;

-- 2. The same, listed per role (anon should normally have nothing that matters here: anonymous *users* use the
--    authenticated role once signed in).
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'profiles'
order by grantee, privilege_type;

-- 3. RLS is on.
select relrowsecurity as rls_enabled, relforcerowsecurity as rls_forced
from pg_class where oid = 'public.profiles'::regclass;

-- 4. The policies: expect a SELECT policy with qual (auth.uid() = id) and an INSERT policy with
--    with_check (auth.uid() = id), both for the authenticated role (or public).
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'profiles';
```

If check 1 shows `false`, the grant that would fix it is below. **Do not run it automatically**; review it first.

```sql
grant select, insert on table public.profiles to authenticated;
```

## Dashboard settings to confirm

- **Authentication → Sign In / Providers:** "Allow anonymous sign-ins" is on.
- **Authentication → Rate Limits:** the limit on anonymous sign-ins is per IP address. Students on campus Wi-Fi can
  share one public IP, so raise it before heavy use.
- **Optional, later:** CAPTCHA (Cloudflare Turnstile) for anonymous sign-ins, to slow abuse. If you turn it on,
  `auth.js` must pass a captcha token, so it needs a code change first.
- **Not needed for anonymous sign-in:** Site URL, redirect URLs and CORS settings.
