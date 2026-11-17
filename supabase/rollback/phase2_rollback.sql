-- Supabase Phase 2: rollback. DESTRUCTIVE: it deletes every tracked session, attempt row, feature row and active day.
--
-- You almost certainly want the safe rollback instead: set `analytics: { enabled: false }` in app/config.js and
-- deploy. The site then stops sending anything, and the tables and their data stay as they are.
--
-- Run this only if you decide to remove Phase 2 from the database entirely. It never touches public.profiles,
-- auth.users or anything from Phase 1. Turn analytics off in config.js first, or browsers will keep trying (and
-- failing) to write.

begin;
drop function if exists public.finalize_session(jsonb, jsonb);
drop table if exists public.activity_days;
drop table if exists public.feature_events;
drop table if exists public.question_attempts;
drop table if exists public.practice_sessions;
drop function if exists public.question_attempts_guard();
drop function if exists public.practice_sessions_guard();
drop function if exists public.feature_events_guard();
drop function if exists public.activity_days_set_day();
commit;
notify pgrst, 'reload schema';
