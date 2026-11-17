# Supabase Phase 2: usage tracking

The site records lightweight, pseudonymous usage summaries under each browser's anonymous Supabase user (Phase 1).
The data supports a later "My Progress" page and an admin analytics view. Answers, code, notes, annotations,
drawings and full exam histories stay in the browser's localStorage. They are never uploaded, and old local history
is not backfilled.

Everything here is **practice telemetry written by the student's own browser**. It is useful for aggregate insight,
but it is not trustworthy as a grade: a determined user can send made-up values for their own rows. Practice scores
on this site are never predictions of official exam results.

Students are told what is collected in three places:
- a one-line notice and link on the welcome page;
- the Home page privacy note;
- the full policy, `app/privacy.html`.

## What is stored (`supabase/migrations/20261115000000_phase2_usage_tracking.sql`)

| Table | One row per | What it holds |
|---|---|---|
| `practice_sessions` | practice set or exam attempt | mode, exam kind (full / topic) and exam id, language, status (`in_progress` / `completed` / `discarded`), part and question-group counts, start, finish and last-activity times, engaged seconds, wall-clock seconds, and `finalized_at` (server time) |
| `question_attempts` | session × question part | part id, question group, exam/worksheet, topics, whether it is auto-gradable, final `result`, the first Check's result, number of Checks, whether the solution was opened |
| `feature_events` | session × problem (or exam) × feature | `run_code` with `count` (the number of runs), and `python_tutor`, `walkthrough_open`, `review_open`, `diagram_edit` (count 1) |
| `activity_days` | user × Pacific-time day with meaningful activity | the day |

**Identifiers:**
- **Session id:** a UUID made in the browser and kept on the local set or exam as `aid`.
- **Part id:** for example `fa25-6e`; this is `QUESTIONS[].id`.
- **Question group:** for example `fa25-6b`; this is `problem`.
- **Exam or worksheet id:** for example `fa25` or `gl-ep11`.
- **Topics:** a part's `topics`, copied at the time. Gleam ids and topics start with `gl-`.

**`result` values:**
- **Automatic grades:** `correct` and `incorrect`. Only these two count toward accuracy.
- **Practice only:**
  - `unmatched`: a short answer that isn't an exact match, which is not the same as wrong;
  - `self_correct` and `self_incorrect`: the student's own grade;
  - `not_graded`: answered but not graded, for example code writing.
- **Exams only:** `staff`, meaning "Graded by Course Staff".
- **Both:** `unanswered`.

**Relation to Phase 1:** `public.profiles` is not referenced or changed. The new tables reference `auth.users` directly,
with cascade delete, so they work even if a profile row is missing.

## How the browser records it (`app/analytics.js`)

- **When it sends:** after every save, the module works out from the app's state which rows changed and queues only
  those. The queue is sent once the anonymous session is ready.
- **The queue:** kept in localStorage under `cs61a-analytics:v1`. It survives refreshes and offline periods.
  - Size: at most 300 items, each kept for at most 30 days.
  - Retries: back-off at 5 s, 15 s, 1 min, then 5 min. It also retries when the browser comes back online.
  - Refused items: an item the database refuses (a 4xx error) is retried on its own once, then dropped and logged. One
    bad row can't block the rest.
- **No duplicates:** every write is keyed by ids made in the browser, so a retry, a refresh or a second tab can't
  create duplicates.
- **Practice in progress:**
  - a part gets a row once it is answered, checked or its solution is opened;
  - the session row is updated as the student works.
- **Exams in progress:** only the session row is sent. Nothing about answers is sent until submission.
- **Finishing:** see the finalization protocol below.
- **Discarding:** discarding a set or exam, starting a new set over an unfinished one, or retaking over an unfinished
  exam marks the old session `discarded`, which is also final. Nothing is deleted.
- **Run Code:** the browser keeps a running total per session and problem, and sends the total, not "+1". The
  database keeps the larger of the stored and incoming totals, so a retry can't inflate the count and a stale write
  can't lower it.
- **Active days:** the browser sends the Pacific-time date on which it saw the activity. The server accepts it if it is
  within the last 30 days (the queue's lifetime) or tomorrow (clock skew), and otherwise uses its own Pacific date. So
  activity recorded offline and sent days later keeps its real date.
- **Out-of-date tabs:** once another tab has saved, this tab can no longer save, and it tracks nothing: no writes, no
  engaged time, and no false "discarded".
- **Older sets and exams:** an unfinished set or exam saved before tracking existed gets its id as soon as the page
  loads.
- **When it's off:** it does nothing, and stores nothing, if `analytics.enabled` is `false` in `app/config.js` or if
  sign-in can't run on the page. Sign-in can't run when it isn't configured, on another host, when opened as a file,
  or in automated tests.
- **Status:** run `CS61A_ANALYTICS.status()` in the browser console. It shows whether tracking is enabled, plus queued,
  sent, failed and dropped counts and the last error.

### Finalization protocol (completed sessions never change)

1. **Capture.** When a practice set is finished or an exam submitted, the browser immediately captures the final
   snapshot: the session as `completed` plus one row for every part. Each part row carries its final result, the
   first Check's result, the Check count and whether the solution was opened.
2. **Queue as one item.** The snapshot goes into the queue as a single `finalize` item. The session's earlier
   in-progress items are removed from the queue, because the snapshot contains everything. The session is marked
   closed in the browser, so nothing done afterwards (Review edits, Checks, refreshes) is ever tracked for it.
3. **Send as one call.** The item is sent as `POST /rest/v1/rpc/finalize_session` (`p_session`, `p_attempts`), which
   is one database transaction:
   1. It creates the session as in progress if it never reached the database (for example, finished offline).
   2. It **locks** the session row. A second call for the same session (another tab, a retried request) waits here.
   3. If the session is already completed or discarded, it changes nothing and returns `already_final`.
   4. It checks that the snapshot has **exactly one row per part**, writes the rows, and checks again that the session
      now has exactly that many part rows.
   5. It marks the session `completed`, and the server sets `finalized_at`.

   If anything fails, the whole call is undone, so a session is never left half-finalized. Under concurrency exactly
   one snapshot wins; every other call gets `already_final`. This was tested with simultaneous calls on a real
   PostgreSQL server.
4. **Only this way.** The database refuses any attempt by the Data API's roles to mark a session `completed`
   directly, whether by insert, update or upsert. `finalize_session()` runs as the table owner (`security definer`),
   which is the only role the check lets through. Inside it, every statement is limited to the caller's own user id,
   and the ownership foreign key still refuses other students' sessions. `discarded` can still be written directly,
   because it needs no snapshot.
5. **Frozen.** After that, the database ignores every write for that session and its parts: a retry of the finalize
   call (`already_final`), a stale in-progress update (even one that was waiting behind the finalization), or a late
   part row. They succeed without changing anything. A `discarded` session is frozen the same way.
6. **No deadline.** Nothing before step 3 expires on the database side, so a session finished offline is finalized
   whenever the browser reconnects. The only limit is the browser queue's 30 days.

## Metric definitions

- **Meaningful activity:**
  - starting a session or resuming one;
  - an answer or self-grade changing;
  - a practice Check;
  - finishing a set or submitting an exam.

  Page views and sign-ins alone don't count.
- **Active users:**
  - **Daily active users:** distinct users in `activity_days` for a day.
  - **Weekly active users:** distinct users over a Monday–Sunday week, in Pacific time.
  - **Returning user:** at least 2 distinct days in `activity_days`.
- **Total users:** rows in `profiles`, meaning everyone who signed in. "Users who practiced" means users with any
  `activity_days` row.
- **Sessions:**
  - **Started:** rows in `practice_sessions`.
  - **Completed:** status `completed` (`auto_submitted` marks exams whose time ran out).
  - **Discarded:** status `discarded`.
  - **Abandoned:** status `in_progress` with `last_activity_at` more than **90 days** ago.

  Abandoned is decided when you query, never stored. Resuming moves `last_activity_at` forward, so the session stops
  counting as abandoned. Nothing is deleted for inactivity.
- **Completed-session results:** use only sessions with `status = 'completed'`. Their part rows are the final snapshot.
- **Attempts:**
  - **Parts attempted:** `question_attempts` rows whose `result` isn't `unanswered`.
  - **Question groups attempted:** distinct `problem_id`.
- **Accuracy:** correct divided by (correct + incorrect), over rows where `auto_gradable` is true and `result` is in
  (`correct`, `incorrect`). Self-grades, `unmatched`, `not_graded`, `staff` and `unanswered` are always left out.
  Always show the counts with the rate.
- **First-try accuracy (practice):** the same rule, using `first_check`.
- **Topic error rate:** incorrect divided by (correct + incorrect) per topic, using the same filter. A part with two
  topics counts toward both.
- **Run Code use:** `sum(count)` for `event = 'run_code'`, per problem or per session.
- **Time:**
  - **Engaged:** `active_seconds` counts time while the question screen is visible and there was a click, key, scroll
    or touch in the last 60 seconds.
  - **`wall_seconds`:** start to finish, for completed sessions only.
- **Questions needing manual grading:** `result = 'staff'` (exams), or practice code parts (`not_graded` or a
  self-grade).

## Applying it in the Supabase SQL Editor

### Four separate things decide whether the site can use a table

| Layer | What it controls | Where it is set | For Phase 2 |
|---|---|---|---|
| **Database privileges** (GRANT) | which roles may SELECT / INSERT / UPDATE a table or EXECUTE a function at all | the migration | `authenticated`: SELECT, INSERT, UPDATE on `practice_sessions`, `question_attempts`, `feature_events`; SELECT, INSERT on `activity_days`; EXECUTE on `finalize_session`. `anon`: nothing. Nobody: DELETE. |
| **Row Level Security** (policies) | which rows a role sees or writes | the migration | own rows only (`user_id = auth.uid()`), on all four tables |
| **Data API exposure** | whether the REST API (PostgREST) serves the schema, table or function at all | Supabase Dashboard → Data API settings | the `public` schema must be exposed (it already is, since Phase 1 uses `profiles`). Because **"Automatically expose new tables" is off** in this project, the four new tables and `finalize_session` may also need to be added to the project's exposed tables/functions list. |
| **Schema cache** | the REST API's own copy of what exists | refreshed by `notify pgrst, 'reload schema';` (the migration ends with it), or by restarting the API | must be refreshed after the migration |

A request works only if all four allow it. **A GRANT alone does not prove that the API serves the table, and exposing a
table in the Dashboard does not give any role privileges you didn't grant.** The checks below test each layer
separately.

**Watch the Dashboard's switches.** In some setups, exposing a table in the Dashboard also *grants* privileges, and
possibly to `anon`. After changing anything there, run check 3 in step 3 again. If `anon` gained privileges, or
`authenticated` gained DELETE, put them back with:
```sql
revoke all on public.practice_sessions, public.question_attempts, public.feature_events, public.activity_days from anon;
revoke delete, truncate, references, trigger on public.practice_sessions, public.question_attempts, public.feature_events, public.activity_days from authenticated;
revoke update on public.activity_days from authenticated;
revoke execute on function public.finalize_session(jsonb, jsonb) from anon;
notify pgrst, 'reload schema';
```
Even with extra grants, RLS still allows only your own rows, and no policy exists for `anon`. But keep the privileges
exact.

The GraphQL endpoint (`/graphql/v1`, if enabled in your project) uses the same database privileges and RLS. It can't do
anything the REST API can't.

### Steps

1. **Run the migration once.** SQL Editor → New query → paste all of
   `supabase/migrations/20261115000000_phase2_usage_tracking.sql` → Run. It runs in one transaction (all or nothing),
   then asks the API to reload its schema cache.
2. **Expose the new tables and the function to the Data API.** In the Dashboard, open the Data API settings, where the
   exposed schemas and (with automatic exposure off) the exposed tables and functions are listed. Then:
   - confirm the `public` schema is exposed;
   - make sure `practice_sessions`, `question_attempts`, `feature_events`, `activity_days` and the function
     `finalize_session` are exposed;
   - don't expose anything else new.

   Exact labels vary between Dashboard versions. What matters is the API test in step 4.
3. **Run the read-only checks:** `supabase/verify/phase2_checks.sql`.
   - **1:** RLS is on for all four tables.
   - **2:** the policies are listed, with none for DELETE.
   - **3:** `anon` has no privileges; `authenticated` has exactly the privileges in the table above; nobody has
     DELETE.
   - **4:** only `finalize_session` is executable, and only by `authenticated`.
   - **5:** `profiles` is unchanged.
   - **6:** the ownership foreign keys are present.
   - **7:** the triggers are present.

   In the Table Editor, each of the four tables should show RLS as enabled.
4. **Test the Data API itself.** Use the publishable key, and the access token of a real anonymous session. To get
   one:
   1. Run the site locally (see the real-database test) and click past the welcome page.
   2. In the browser console:
      ```js
      (await CS61A_AUTH.getClient().auth.getSession()).data.session.access_token
      ```
   3. Then, in a terminal (`URL` = Project URL, `KEY` = publishable key, `TOKEN` = that token):
      ```sh
      # as the signed-in student: each table answers with [] or only your own rows → exposed + granted + RLS
      for t in practice_sessions question_attempts feature_events activity_days; do
        curl -s "$URL/rest/v1/$t?select=*&limit=1" -H "apikey: $KEY" -H "Authorization: Bearer $TOKEN"; echo "  ← $t"
      done
      # the function is reachable: expect an error saying p_session must be a completed session (that error comes from
      # inside finalize_session, so the call got through)
      curl -s -X POST "$URL/rest/v1/rpc/finalize_session" -H "apikey: $KEY" -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" -d '{"p_session": {}, "p_attempts": []}'; echo
      # a direct "completed" write is refused (expect 403 / "completed only through finalize_session()")
      curl -s -X POST "$URL/rest/v1/practice_sessions" -H "apikey: $KEY" -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" -d '{"id":"00000000-0000-4000-8000-00000000c0de","mode":"practice","status":"completed","completed_at":"2026-01-01T00:00:00Z","question_groups":1,"parts":1,"started_at":"2026-01-01T00:00:00Z","last_activity_at":"2026-01-01T00:00:00Z"}'; echo
      # as anon (no Authorization header): never rows
      curl -s "$URL/rest/v1/practice_sessions?select=id&limit=1" -H "apikey: $KEY"; echo
      curl -s -X POST "$URL/rest/v1/rpc/finalize_session" -H "apikey: $KEY" -H "Content-Type: application/json" -d '{"p_session": {}, "p_attempts": []}'; echo
      ```
   - **How to read the answers:**
     - `PGRST205` ("Could not find the table … in the schema cache") or `PGRST202` (the same for the function) means
       not exposed, or a stale cache. Re-check step 2, then run `notify pgrst, 'reload schema';` and try again.
     - `permission denied` (`42501`) for the signed-in student means the grant is missing. Re-run step 3.
     - `permission denied` for anon is expected.
5. **Check that one student can't read another's data** with `supabase/verify/phase2_rls_simulation.sql`, after the
   real-database test (two anonymous users). Also do the browser check in the test's step 7.
6. **Deploy the site only after steps 1 to 4 pass.** If the site is deployed first, its writes fail, stay queued, and
   are retried for up to 30 days. Practice works either way.

### Real-database test (small)

1. Serve the site locally: `cd app && python3 -m http.server 8000`. Open <http://localhost:8000> in a normal browser
   window. The test browser must not be automated.
2. Practice:
   - start a set;
   - answer a multiple-choice part wrong, Check, then fix it and Check again;
   - type a short answer and Check it;
   - open a solution;
   - press Run Code twice on one question;
   - Finish the set.
   - Then use Review answers to change an answer.
3. Exam: start a topic-based exam, answer two parts, use Save & Leave, reload, Resume, then Submit.
4. In the console, `CS61A_ANALYTICS.status()` should show `queued: 0` and `failed: 0`.
5. In the SQL Editor, run section 9 of the verify script. Expected:
   - **Sessions:** two, both `completed` with `finalized_at` set.
   - **Practice part rows:** `first_check: 'incorrect'` and `checks: 2` on the multiple-choice part,
     `solution_viewed: true` on the part whose solution you opened, and **the answer you changed in Review still
     showing its result from before Review**.
   - **Run Code:** one `run_code` row with `count: 2`.
   - **Active days:** one `activity_days` row with today's date.
6. Offline check (optional): with DevTools → Network → Offline, finish another set. Go back online, then wait a few
   seconds. That set appears completed, with all its parts.
7. Open the same site in a private window, click past the welcome page, then do step 5 of "Applying it" above.

### Rollback

- **Safe:** set `analytics: { enabled: false }` in `app/config.js` and deploy. Nothing more is sent, and the data
  stays.
- **Removing it from the database:** `supabase/rollback/phase2_rollback.sql`. It is **destructive** (all Phase 2
  data), touches nothing from Phase 1, and is never run automatically.

## Security

- **RLS on every table:** each user can select, insert and (where needed) update only rows with `user_id = auth.uid()`.
  Nobody can delete through the API, and `anon` has no privileges.
- **Completion only through `finalize_session()`:**
  - Only `authenticated` can execute it.
  - It is `security definer`: it runs as the table owner, which is what lets it complete sessions. RLS doesn't apply
    inside it, so every statement in it is written for the caller's own user id. A snapshot that names another
    session's id in its part rows is still filed under the caller's session.
  - It has an empty `search_path`, and every name is schema-qualified.
  - The API roles can't complete sessions directly, whatever settings they send.
- **Ownership is enforced by the database:** `question_attempts` and `feature_events` reference
  `practice_sessions (id, user_id)`. Nobody can attach rows to another student's session.
- **Guard triggers:**
  - identity columns can't change;
  - finished or discarded sessions and their part rows are frozen;
  - counters, engaged time and Run Code counts only grow;
  - `finalized_at`, `created_at` and `updated_at` come from the server;
  - the active day is kept only within the 30-day window.

  The trigger functions can't be called directly.
- **Constraints:** check constraints limit every enum, id pattern, array size and number range.
- **Admin queries:** run them in the SQL Editor, which uses the project owner's role. There are no admin-wide views in
  the API, and there are no admin credentials in the frontend.
- **Tested:**
  - on PGlite: policies, guards, the finalize protocol, privileges, and the verify, simulation and rollback scripts;
  - on a real PostgreSQL 17 server, with the migration run as a non-superuser owner like Supabase's: many simultaneous
    connections (25 × 10 concurrent finalizations, lock waiting, rollback, stale writes racing a finalization,
    concurrent Run Code totals and active days), plus cross-user and bypass attempts.

## Example admin queries (SQL Editor)

```sql
-- Daily active users, last 30 days
select day, count(*) as active_users from public.activity_days
where day >= (now() at time zone 'America/Los_Angeles')::date - 30 group by day order by day;

-- Weekly active users (weeks start Monday)
select date_trunc('week', day)::date as week, count(distinct user_id) as active_users
from public.activity_days group by 1 order by 1;

-- Returning users (active on 2+ days)
select count(*) from (select user_id from public.activity_days group by user_id having count(*) >= 2) r;

-- Sessions: started, completed, discarded, abandoned (90 days), by mode and exam kind
select mode, coalesce(exam_kind, '-') as kind, count(*) as started,
  count(*) filter (where status = 'completed') as completed,
  count(*) filter (where status = 'discarded') as discarded,
  count(*) filter (where status = 'in_progress' and last_activity_at < now() - interval '90 days') as abandoned
from public.practice_sessions group by 1, 2 order by 1, 2;

-- Topic accuracy (automatic grades only, completed sessions), with counts
select t.topic, count(*) filter (where a.result = 'correct') as correct, count(*) filter (where a.result = 'incorrect') as incorrect,
  round(100.0 * count(*) filter (where a.result = 'incorrect') / nullif(count(*), 0), 1) as error_rate_pct
from public.question_attempts a join public.practice_sessions s on s.id = a.session_id and s.status = 'completed'
cross join lateral unnest(a.topics) as t (topic)
where a.auto_gradable and a.result in ('correct', 'incorrect')
group by t.topic order by error_rate_pct desc nulls last;

-- Most practiced question groups (distinct students)
select source_id, problem_id, count(distinct user_id) as students, count(*) as part_rows
from public.question_attempts where result <> 'unanswered' group by 1, 2 order by students desc limit 20;

-- Engaged practice time per mode (hours)
select mode, round(sum(active_seconds) / 3600.0, 1) as hours from public.practice_sessions group by mode;

-- Feature use: rows, total runs, distinct students
select event, count(*) as rows, sum(count) as total, count(distinct user_id) as students
from public.feature_events group by event order by total desc;
```

## Free plan

- **Size:** about 300 bytes per part row, including indexes. For example, 500 students × 300 parts per semester is
  about 150,000 rows, or roughly 45 MB. Sessions, features and days add under 10 MB.
- **Requests:** about one small request per Check, one call per finish or submit, and Run Code totals combined in the
  queue. Engaged time reaches the database about once a minute while a student is working.
- **Pausing:** a project with no traffic for about a week is paused. Sign-in and tracking then fail quietly, practice
  keeps working, and the queue keeps items for up to 30 days. Un-pause the project in the dashboard.

## Limitations and open questions

- **Engaged time** is an estimate, sampled every 5 seconds. The app's own exam timer (`activeMs`) is unchanged and is
  not used.
- **Lost or blocked browser storage:**
  - If the browser's tracking storage is cleared, Run Code counts and Check counts for an unfinished session restart
    locally. The database keeps the larger values, so the counts don't drop, but new runs or Checks aren't counted
    until they exceed what's stored.
  - Items still queued when storage is cleared, or older than 30 days, are lost.
  - If the browser can't store anything (private mode with storage blocked), nothing is tracked.
- **Active-day dates** depend on the student's device clock and are trusted only within the 30-day window. A wrong
  device clock can move a day within that window.
- **Devices:** each browser is its own anonymous user, so a student on two devices counts as two.
- **Existing local history:** practice sets and exam attempts from before Phase 2 are not uploaded.
- **Open privacy and legal questions,** not settled by the notice and policy alone:
  - whether university or course policies apply to an independent tool used by enrolled students;
  - whether any of the students are minors;
  - which privacy laws apply to the site's users (for example GDPR, or California's privacy laws);
  - whether a data processing agreement with Supabase is needed;
  - which region the Supabase project stores data in;
  - the lack of an opt-out or an in-site deletion option;
  - how deletion requests are handled, given that anonymous IDs are hard for students to find.
