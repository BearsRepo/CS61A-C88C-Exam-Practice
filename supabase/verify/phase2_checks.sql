-- Supabase Phase 2: read-only checks. Safe to run any time in the SQL Editor; nothing here changes data or settings.
-- For the "one student can't read another's rows" test, see phase2_rls_simulation.sql.

-- 1. The four tables exist, with Row Level Security on.
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('practice_sessions', 'question_attempts', 'feature_events', 'activity_days')
order by 1;

-- 2. Policies. Expected: read/add/update on practice_sessions, question_attempts and feature_events; read/add on
--    activity_days. All for the authenticated role, all comparing user_id with auth.uid(). No delete policies.
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('practice_sessions', 'question_attempts', 'feature_events', 'activity_days')
order by tablename, cmd;

-- 3. Data API exposure = privileges (new tables are not exposed automatically in this project).
--    Expected: anon has nothing at all; authenticated has SELECT, INSERT, UPDATE on practice_sessions,
--    question_attempts and feature_events, SELECT and INSERT on activity_days; nobody has DELETE.
select t.table_name, r.role,
  has_table_privilege(r.role, 'public.' || t.table_name, 'SELECT') as can_select,
  has_table_privilege(r.role, 'public.' || t.table_name, 'INSERT') as can_insert,
  has_table_privilege(r.role, 'public.' || t.table_name, 'UPDATE') as can_update,
  has_table_privilege(r.role, 'public.' || t.table_name, 'DELETE') as can_delete
from (values ('practice_sessions'), ('question_attempts'), ('feature_events'), ('activity_days')) as t (table_name)
cross join (values ('anon'), ('authenticated')) as r (role)
order by 1, 2;

-- 4. Functions. Expected: authenticated can execute finalize_session, anon cannot; nobody can call the trigger
--    functions directly.
select f.fn, r.role, has_function_privilege(r.role, f.fn, 'EXECUTE') as can_execute
from (values ('public.finalize_session(jsonb, jsonb)'), ('public.practice_sessions_guard()'), ('public.question_attempts_guard()'),
             ('public.feature_events_guard()'), ('public.activity_days_set_day()')) as f (fn)
cross join (values ('anon'), ('authenticated')) as r (role)
order by 1, 2;

-- 5. Phase 1 is untouched: profiles still has RLS, and authenticated can still read/insert it.
select has_table_privilege('authenticated', 'public.profiles', 'SELECT') as profiles_select,
       has_table_privilege('authenticated', 'public.profiles', 'INSERT') as profiles_insert,
       (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass) as profiles_rls,
       (select count(*) from pg_policies where schemaname = 'public' and tablename = 'profiles') as profiles_policies;

-- 6. Foreign keys (ownership): question_attempts and feature_events → practice_sessions (id, user_id);
--    every table → auth.users (directly or through practice_sessions), on delete cascade.
select conrelid::regclass as table_name, conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where contype = 'f' and conrelid in ('public.practice_sessions'::regclass, 'public.question_attempts'::regclass,
  'public.feature_events'::regclass, 'public.activity_days'::regclass)
order by 1, 2;

-- 7. Triggers in place.
select event_object_table as table_name, trigger_name, action_timing, string_agg(event_manipulation, ', ') as events
from information_schema.triggers
where event_object_schema = 'public' and event_object_table in ('practice_sessions', 'question_attempts', 'feature_events', 'activity_days')
group by 1, 2, 3 order by 1;

-- 8. How much is stored so far.
select (select count(*) from public.practice_sessions) as sessions,
       (select count(*) from public.question_attempts) as attempt_rows,
       (select count(*) from public.feature_events) as feature_rows,
       (select count(*) from public.activity_days) as active_user_days,
       pg_size_pretty(pg_total_relation_size('public.practice_sessions') + pg_total_relation_size('public.question_attempts')
                      + pg_total_relation_size('public.feature_events') + pg_total_relation_size('public.activity_days')) as total_size;

-- 9. A quick look at the newest rows (the SQL Editor sees every row; students never do).
select id, mode, exam_kind, exam_id, language, status, parts, active_seconds, started_at, last_activity_at, completed_at, finalized_at
from public.practice_sessions order by created_at desc limit 20;
select session_id, question_id, result, first_check, checks, solution_viewed, auto_gradable, topics
from public.question_attempts order by updated_at desc limit 40;
select event, problem_id, source_id, count, dedupe_key, updated_at from public.feature_events order by updated_at desc limit 20;
select user_id, day, created_at from public.activity_days order by created_at desc limit 20;
