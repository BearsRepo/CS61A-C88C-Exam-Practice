-- Supabase Phase 2: usage tracking (see docs/supabase-phase2.md).
-- Run once in the Supabase SQL Editor. Additive only: it creates four tables, one function the site calls
-- (finalize_session), four trigger functions, policies, grants and indexes. It does not touch public.profiles
-- (Phase 1) or any existing data. Everything runs in one transaction: it either all applies or nothing does.
--
-- What is stored: which practice sets / exams a student starts and finishes, one summary row per question part in
-- them (its result, how often it was checked, whether the solution was opened), feature use (Run Code is counted),
-- engaged time and active days. Never stored: answers, code, notes, highlights, drawings, names, emails, IP addresses.
-- Everything here is written by the student's own browser, so it is practice telemetry, not trusted grades.
--
-- Finished sessions are final. A practice set or exam is completed through finalize_session(), which writes its
-- final part rows and marks it completed in ONE transaction. After that (or after it is discarded) the session and
-- its part rows never change: later writes for it (a retry, a stale in-progress update, an edit made in Review) are
-- ignored. Before that, nothing has a deadline, so a session finished offline is finalized whenever the browser
-- reconnects (the browser keeps unsent rows for up to 30 days).
--
-- Abandoned sessions are NOT a stored status: a session is "abandoned" when it is still in_progress and its
-- last_activity_at is more than 90 days old (see the queries in docs/supabase-phase2.md). Nothing is ever deleted
-- for inactivity, and an old in_progress session can still be updated when the student comes back.
--
-- Data API: this project does not expose new tables automatically. Exposure here is exactly the GRANTs below:
-- the authenticated role (signed-in anonymous students) only, never anon.

begin;

-- ── One row per practice set or exam attempt ──
create table public.practice_sessions (
  id               uuid primary key,                          -- made in the browser (crypto.randomUUID): writes are idempotent
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  mode             text not null check (mode in ('practice', 'exam')),
  exam_kind        text check (exam_kind in ('full', 'topic')), -- exams only: full past exam or topic-based
  exam_id          text check (exam_id ~ '^[a-z0-9-]{1,32}$'),  -- full exams only, e.g. 'fa25'
  language         text not null default 'python' check (language in ('python', 'gleam', 'all')),
  status           text not null default 'in_progress' check (status in ('in_progress', 'completed', 'discarded')),
  auto_submitted   boolean not null default false,             -- exam submitted because its time ran out
  timed            boolean not null default false,
  question_groups  smallint not null check (question_groups between 0 and 500),
  parts            smallint not null check (parts between 0 and 2000),
  started_at       timestamptz not null,                       -- browser clock
  completed_at     timestamptz,                                -- browser clock
  last_activity_at timestamptz not null,                       -- browser clock: last meaningful action in this session
  active_seconds   integer not null default 0 check (active_seconds between 0 and 86400), -- engaged time
  wall_seconds     integer check (wall_seconds between 0 and 31536000),                   -- start to finish, completed only
  finalized_at     timestamptz,                                -- server clock: when it became completed / discarded
  created_at       timestamptz not null default now(),         -- server clock
  updated_at       timestamptz not null default now(),         -- server clock (set by the trigger on every update)
  unique (id, user_id),                                        -- target of the ownership foreign keys below
  check ((mode = 'exam') = (exam_kind is not null)),
  check (exam_kind is distinct from 'full' or exam_id is not null),
  check (status <> 'completed' or completed_at is not null)
);
comment on table public.practice_sessions is 'Phase 2 usage tracking: one row per practice set or exam attempt. Client-reported telemetry, not grades.';

-- ── One row per (session, question part) ──
create table public.question_attempts (
  session_id       uuid not null,
  user_id          uuid not null default auth.uid(),
  question_id      text not null check (question_id ~ '^[A-Za-z0-9-]{1,64}$'),  -- part id, e.g. 'fa25-6e'
  problem_id       text not null check (problem_id ~ '^[A-Za-z0-9-]{1,64}$'),   -- question group, e.g. 'fa25-6b'
  source_id        text not null check (source_id ~ '^[a-z0-9-]{1,32}$'),       -- exam or worksheet, e.g. 'fa25', 'gl-ep11'
  topics           text[] not null default '{}' check (cardinality(topics) <= 8),
  auto_gradable    boolean not null,                           -- graded automatically on this site (choices, short answers with a key)
  result           text not null check (result in (
                     'correct', 'incorrect',                   -- automatic grade (only these two count toward accuracy)
                     'unmatched',                              -- practice: short answer that isn't an exact match (not wrong)
                     'self_correct', 'self_incorrect',         -- practice: the student's own self-grade
                     'not_graded',                             -- practice: answered, no grade (e.g. code writing)
                     'staff',                                  -- exam: "Graded by Course Staff"
                     'unanswered')),
  first_check      text check (first_check in ('correct', 'incorrect', 'unmatched')), -- practice: the first Check's result
  checks           smallint not null default 0 check (checks between 0 and 1000),
  solution_viewed  boolean not null default false,
  first_checked_at timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  primary key (session_id, question_id),
  -- the session must belong to the same user: with the RLS rule user_id = auth.uid(), nobody can attach rows to
  -- another student's session
  foreign key (session_id, user_id) references public.practice_sessions (id, user_id) on delete cascade
);
comment on table public.question_attempts is 'Phase 2 usage tracking: one summary row per session and question part. No answers are stored.';

-- ── Feature use: one row per (user, dedupe_key); Run Code keeps a count of runs, the others count 1 ──
create table public.feature_events (
  id          uuid primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  session_id  uuid,
  event       text not null check (event in ('run_code', 'python_tutor', 'walkthrough_open', 'review_open', 'diagram_edit')),
  problem_id  text check (problem_id ~ '^[A-Za-z0-9-]{1,64}$'),
  source_id   text check (source_id ~ '^[a-z0-9-]{1,32}$'),
  dedupe_key  text not null check (length(dedupe_key) between 1 and 160),
  count       integer not null default 1 check (count between 1 and 1000000), -- run_code: runs in this session/problem
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, dedupe_key),
  foreign key (session_id, user_id) references public.practice_sessions (id, user_id) on delete cascade
);
comment on table public.feature_events is 'Phase 2 usage tracking: feature use per session and problem (run_code with a run count).';

-- ── Active days: one row per user per day with meaningful activity (daily/weekly active users, returning users) ──
create table public.activity_days (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day        date not null,                                  -- America/Los_Angeles; checked by the trigger below
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);
comment on table public.activity_days is 'Phase 2 usage tracking: one row per user per day (America/Los_Angeles) with meaningful practice activity.';

create index practice_sessions_user_started on public.practice_sessions (user_id, started_at desc);
create index practice_sessions_activity     on public.practice_sessions (last_activity_at);
create index question_attempts_user         on public.question_attempts (user_id, updated_at);
create index question_attempts_problem      on public.question_attempts (source_id, problem_id);
create index feature_events_event_time      on public.feature_events (event, created_at);
create index feature_events_session         on public.feature_events (session_id) where session_id is not null;
create index activity_days_day              on public.activity_days (day);

-- ── Guards ──
-- Sessions: identity never changes; once completed or discarded the row is frozen (later writes are ignored, not
-- errors, so a retry or a stale in-progress update simply has no effect); while in progress, time and activity only
-- move forward. finalized_at and updated_at come from the server clock.
-- A session becomes 'completed' ONLY through finalize_session(): the Data API's roles (anon, authenticated) can never
-- insert or update a session to 'completed' themselves. finalize_session() runs as the table owner (security
-- definer), so inside it the check passes. Nothing a client sends can change the role it runs as. 'discarded' needs
-- no snapshot and may be written directly.
create function public.practice_sessions_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status = 'completed' and (tg_op = 'INSERT' or old.status = 'in_progress')
     and current_user in ('anon', 'authenticated') then
    raise exception 'a session is completed only through finalize_session()' using errcode = '42501';
  end if;
  if tg_op = 'INSERT' then
    new.created_at := now(); new.updated_at := now();
    new.finalized_at := case when new.status = 'in_progress' then null else now() end;
    return new;
  end if;
  if old.status <> 'in_progress' then
    return old; -- final: nothing changes
  end if;
  new.id := old.id; new.user_id := old.user_id; new.mode := old.mode; new.exam_kind := old.exam_kind;
  new.exam_id := old.exam_id; new.started_at := old.started_at; new.created_at := old.created_at;
  new.active_seconds := greatest(old.active_seconds, new.active_seconds);
  new.last_activity_at := greatest(old.last_activity_at, new.last_activity_at);
  new.finalized_at := case when new.status = 'in_progress' then null else now() end;
  new.updated_at := now();
  return new;
end $$;
create trigger practice_sessions_guard before insert or update on public.practice_sessions
  for each row execute function public.practice_sessions_guard();

-- Part rows: frozen with their session (writes for a completed or discarded session are ignored); otherwise identity
-- never changes, the first Check is kept, counters only grow, and an opened solution stays opened.
create function public.question_attempts_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if exists (select 1 from public.practice_sessions s where s.id = new.session_id and s.status <> 'in_progress') then
    return case when tg_op = 'INSERT' then null else old end;
  end if;
  if tg_op = 'INSERT' then
    new.created_at := now(); new.updated_at := now();
    return new;
  end if;
  new.session_id := old.session_id; new.user_id := old.user_id; new.question_id := old.question_id;
  new.problem_id := old.problem_id; new.source_id := old.source_id; new.created_at := old.created_at;
  new.first_check := coalesce(old.first_check, new.first_check);
  new.first_checked_at := coalesce(old.first_checked_at, new.first_checked_at);
  new.checks := greatest(old.checks, new.checks);
  new.solution_viewed := old.solution_viewed or new.solution_viewed;
  new.updated_at := now();
  return new;
end $$;
create trigger question_attempts_guard before insert or update on public.question_attempts
  for each row execute function public.question_attempts_guard();

-- Feature rows: only the count can change, and only upward (so a retry or a stale write never lowers it).
create function public.feature_events_guard() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now(); new.updated_at := now();
    return new;
  end if;
  new.id := old.id; new.user_id := old.user_id; new.session_id := old.session_id; new.event := old.event;
  new.problem_id := old.problem_id; new.source_id := old.source_id; new.dedupe_key := old.dedupe_key;
  new.created_at := old.created_at;
  new.count := greatest(old.count, new.count);
  new.updated_at := now();
  return new;
end $$;
create trigger feature_events_guard before insert or update on public.feature_events
  for each row execute function public.feature_events_guard();

-- Active days: the browser reports the Pacific-time day it saw the activity (so a day recorded offline and sent later
-- keeps its real date). The server accepts it only within the last 30 days (the browser's retry window) or tomorrow
-- (clock skew); anything else, or no day, becomes the server's own Pacific-time day.
create function public.activity_days_set_day() returns trigger
language plpgsql set search_path = '' as $$
declare today date := (now() at time zone 'America/Los_Angeles')::date;
begin
  new.day := case when new.day between today - 30 and today + 1 then new.day else today end;
  new.created_at := now();
  return new;
end $$;
create trigger activity_days_set_day before insert on public.activity_days
  for each row execute function public.activity_days_set_day();

-- ── Finalizing a session: final part rows and "completed" in one transaction ──
-- The site calls this (POST /rest/v1/rpc/finalize_session) when a practice set is finished or an exam is submitted.
-- It is the only way to complete a session, so it runs as the table owner (security definer). Row Level Security does
-- not apply inside it; instead EVERY statement is limited to the caller (auth.uid()), and the ownership foreign key
-- (session_id, user_id) still refuses rows for anyone else's session. Checks and triggers still apply. The whole call
-- is one transaction: if anything fails, nothing of it is kept.
--   1. Make sure the session row exists (finished offline, it may never have reached the database), then LOCK it.
--      Two calls for the same session (two tabs, a retried request) queue here; the second one waits for the first.
--   2. If it is already completed or discarded, change nothing and return 'already_final'.
--   3. The snapshot must have exactly one row per part of the session.
--   4. Write the final part rows, check that the session now has exactly `parts` rows, then mark it completed.
-- It never touches another user's rows: the lock only finds the caller's own session, and the foreign key refuses the
-- rest. search_path is empty and every name is schema-qualified, as a security definer function must be.
create function public.finalize_session(p_session jsonb, p_attempts jsonb) returns text
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  s public.practice_sessions;
  cur text;
  n integer;
  nd integer;
begin
  if uid is null then raise exception 'not signed in' using errcode = '42501'; end if;
  if jsonb_typeof(p_attempts) is distinct from 'array' or jsonb_array_length(p_attempts) > 2000 then
    raise exception 'p_attempts must be an array of at most 2000 rows' using errcode = '22023';
  end if;
  s := jsonb_populate_record(null::public.practice_sessions, p_session);
  if s.id is null or s.status is distinct from 'completed' or s.completed_at is null then
    raise exception 'p_session must be a completed session with an id' using errcode = '22023';
  end if;

  -- 1. exists, then locked
  insert into public.practice_sessions (id, user_id, mode, exam_kind, exam_id, language, status, timed,
    question_groups, parts, started_at, last_activity_at, active_seconds)
  values (s.id, uid, s.mode, s.exam_kind, s.exam_id, s.language, 'in_progress', coalesce(s.timed, false),
    s.question_groups, s.parts, s.started_at, s.last_activity_at, coalesce(s.active_seconds, 0))
  on conflict do nothing; -- any key: under concurrency either unique index (id, or id + user_id) can report the clash
  select status into cur from public.practice_sessions where id = s.id and user_id = uid for update;
  if not found then raise exception 'session not found for this user' using errcode = '42501'; end if;

  -- 2. already final: nothing changes
  if cur <> 'in_progress' then return 'already_final'; end if;

  -- 3. one row per part, no duplicates
  select count(*), count(distinct x ->> 'question_id') into n, nd from jsonb_array_elements(p_attempts) x;
  if n <> nd or n <> s.parts then
    raise exception 'the snapshot must have exactly one row per part (% parts, % rows, % distinct)', s.parts, n, nd using errcode = '22023';
  end if;

  -- 4. final rows, then completed
  insert into public.question_attempts (session_id, user_id, question_id, problem_id, source_id, topics, auto_gradable,
    result, first_check, checks, solution_viewed, first_checked_at)
  select s.id, uid, a.question_id, a.problem_id, a.source_id, coalesce(a.topics, '{}'), a.auto_gradable,
    a.result, a.first_check, coalesce(a.checks, 0), coalesce(a.solution_viewed, false), a.first_checked_at
  from jsonb_populate_recordset(null::public.question_attempts, p_attempts) a
  on conflict (session_id, question_id) do update set
    topics = excluded.topics, auto_gradable = excluded.auto_gradable, result = excluded.result,
    first_check = excluded.first_check, checks = excluded.checks, solution_viewed = excluded.solution_viewed,
    first_checked_at = excluded.first_checked_at;
  select count(*) into n from public.question_attempts where session_id = s.id;
  if n <> s.parts then
    raise exception 'session has % part rows, expected %', n, s.parts using errcode = '22023';
  end if;
  update public.practice_sessions set
    status = 'completed', completed_at = s.completed_at, auto_submitted = coalesce(s.auto_submitted, false),
    timed = coalesce(s.timed, false), language = s.language, question_groups = s.question_groups, parts = s.parts,
    last_activity_at = s.last_activity_at, active_seconds = coalesce(s.active_seconds, 0), wall_seconds = s.wall_seconds
  where id = s.id and user_id = uid;
  return 'finalized';
end $$;

-- ── Row Level Security: each signed-in (anonymous) user reads and writes only their own rows; no deletes ──
alter table public.practice_sessions enable row level security;
alter table public.question_attempts enable row level security;
alter table public.feature_events    enable row level security;
alter table public.activity_days     enable row level security;

create policy "own sessions: read"   on public.practice_sessions for select to authenticated using (user_id = (select auth.uid()));
create policy "own sessions: add"    on public.practice_sessions for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own sessions: update" on public.practice_sessions for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own attempts: read"   on public.question_attempts for select to authenticated using (user_id = (select auth.uid()));
create policy "own attempts: add"    on public.question_attempts for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own attempts: update" on public.question_attempts for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own events: read"     on public.feature_events for select to authenticated using (user_id = (select auth.uid()));
create policy "own events: add"      on public.feature_events for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own events: update"   on public.feature_events for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own days: read"       on public.activity_days for select to authenticated using (user_id = (select auth.uid()));
create policy "own days: add"        on public.activity_days for insert to authenticated with check (user_id = (select auth.uid()));

-- ── Privileges = Data API exposure (new tables are not exposed automatically in this project) ──
-- anon: nothing. authenticated: only what the policies need. Nobody can DELETE through the API.
revoke all on public.practice_sessions, public.question_attempts, public.feature_events, public.activity_days from public, anon, authenticated;
grant select, insert, update on public.practice_sessions, public.question_attempts, public.feature_events to authenticated;
grant select, insert         on public.activity_days to authenticated;
revoke execute on function public.practice_sessions_guard(), public.question_attempts_guard(), public.feature_events_guard(),
  public.activity_days_set_day() from public, anon, authenticated;
revoke execute on function public.finalize_session(jsonb, jsonb) from public, anon;
grant execute on function public.finalize_session(jsonb, jsonb) to authenticated;

commit;

-- Ask the Data API (PostgREST) to pick up the new tables and function now.
notify pgrst, 'reload schema';
