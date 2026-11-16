-- Supabase Phase 2: "one anonymous student can't read another's data", checked inside the database.
-- Safe to run in the SQL Editor: everything happens in a transaction that is ROLLED BACK at the end, so nothing is
-- kept. It needs two real anonymous users (open the site in a normal window and in a private window, click past the
-- welcome page in each). Find their ids under Authentication → Users and paste them below.
--
-- It acts as user A (the role and token the Data API would use for A's browser), writes a session, and checks that:
--   A sees A's rows, A sees none of B's, A cannot write as B, A cannot complete a session directly, anon sees
--   nothing, and A cannot delete.
-- Every line of output should say "ok".

begin;

-- ⬇ paste the two user ids here
select set_config('test.user_a', 'PASTE-USER-A-UUID', true), set_config('test.user_b', 'PASTE-USER-B-UUID', true);

-- B: one session of their own (as B)
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.user_b'), 'role', 'authenticated')::text, true);
insert into public.practice_sessions (id, mode, question_groups, parts, started_at, last_activity_at)
values ('bbbbbbbb-0000-4000-8000-00000000000b', 'practice', 1, 1, now(), now());

-- A: one session, then try to see / touch B's
select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.user_a'), 'role', 'authenticated')::text, true);
insert into public.practice_sessions (id, mode, question_groups, parts, started_at, last_activity_at)
values ('aaaaaaaa-0000-4000-8000-00000000000a', 'practice', 1, 1, now(), now());

select case when count(*) = 1 then 'ok: A sees exactly A''s test session' else 'FAIL: A sees ' || count(*) end
from public.practice_sessions where id in ('aaaaaaaa-0000-4000-8000-00000000000a', 'bbbbbbbb-0000-4000-8000-00000000000b');
select case when count(*) = 0 then 'ok: A sees no rows of other users in any table' else 'FAIL: A sees ' || count(*) || ' rows of others' end
from (select user_id from public.practice_sessions union all select user_id from public.question_attempts
      union all select user_id from public.feature_events union all select user_id from public.activity_days) x
where x.user_id <> current_setting('test.user_a')::uuid;

do $$
begin
  begin
    insert into public.question_attempts (session_id, question_id, problem_id, source_id, auto_gradable, result)
    values ('bbbbbbbb-0000-4000-8000-00000000000b', 'fa25-1a', 'fa25-1', 'fa25', true, 'correct');
    raise notice 'FAIL: A attached a row to B''s session';
  exception when others then raise notice 'ok: A cannot attach rows to B''s session (%)', sqlerrm;
  end;
  begin
    insert into public.practice_sessions (id, user_id, mode, question_groups, parts, started_at, last_activity_at)
    values (gen_random_uuid(), current_setting('test.user_b')::uuid, 'practice', 1, 1, now(), now());
    raise notice 'FAIL: A created a session as B';
  exception when others then raise notice 'ok: A cannot write as B (%)', sqlerrm;
  end;
  begin
    update public.practice_sessions set status = 'completed', completed_at = now() where id = 'aaaaaaaa-0000-4000-8000-00000000000a';
    raise notice 'FAIL: A completed a session without finalize_session()';
  exception when others then raise notice 'ok: a session can only be completed through finalize_session() (%)', sqlerrm;
  end;
  begin
    delete from public.practice_sessions where id = 'aaaaaaaa-0000-4000-8000-00000000000a';
    raise notice 'FAIL: A could delete';
  exception when others then raise notice 'ok: no deletes through the API (%)', sqlerrm;
  end;
end $$;
with u as (update public.practice_sessions set parts = 99 where id = 'bbbbbbbb-0000-4000-8000-00000000000b' returning 1)
select case when count(*) = 0 then 'ok: updating B''s session changes 0 rows' else 'FAIL' end from u;

-- anon (the publishable key without a signed-in user): no access at all
reset role;
set local role anon;
do $$
begin
  perform 1 from public.practice_sessions limit 1;
  raise notice 'FAIL: anon can read practice_sessions';
exception when others then raise notice 'ok: anon cannot read (%)', sqlerrm;
end $$;

rollback; -- nothing above is kept
