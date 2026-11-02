do $test$
declare
  a       uuid := gen_random_uuid();
  b       uuid := gen_random_uuid();
  adm     uuid := gen_random_uuid();
  unv     uuid := gen_random_uuid();
  idea_a  uuid;
  copy_id uuid;
  n       int;
  passed  int;
  failed  int;
  failing text;
begin
  create temp table rls_test_log (name text, ok boolean);

  -- Runs one statement as a given user.
  -- Returns rows affected, -1 if a security or data rule rejected it,
  -- or -99 for any other error (such as a typo), which counts as a FAILED test.
  -- Every token carries fake admin metadata, which must have no effect.
  create function pg_temp.attempt(who uuid, role_name text, aal text, stmt text)
  returns int language plpgsql as $fn$
  declare
    original text := current_user;
    affected int;
  begin
    perform set_config('request.jwt.claims', jsonb_strip_nulls(jsonb_build_object(
      'sub', who, 'role', role_name, 'aal', aal,
      'user_metadata', jsonb_build_object('role', 'admin'),
      'app_metadata',  jsonb_build_object('role', 'admin')))::text, true);
    execute format('set local role %I', role_name);
    begin
      execute stmt;
      get diagnostics affected = row_count;
    exception when others then
      -- 42501 permission or RLS, 23503 foreign key, 23505 unique,
      -- 23514 check, P0001 raised by the email trigger
      if sqlstate in ('42501', '23503', '23505', '23514', 'P0001') then
        affected := -1;
      else
        affected := -99;
      end if;
    end;
    execute format('set local role %I', original);
    return affected;
  end;
  $fn$;

  create function pg_temp.is_n(label text, got int, want int) returns void
  language sql as $fn$ insert into rls_test_log values (label, got = want); $fn$;

  create function pg_temp.blocked(label text, got int) returns void
  language sql as $fn$ insert into rls_test_log values (label, got in (0, -1)); $fn$;

  insert into auth.users (id, email, email_confirmed_at) values
    (a,   'rls-test-a@example.invalid',   now()),
    (b,   'rls-test-b@example.invalid',   now()),
    (adm, 'rls-test-adm@example.invalid', now()),
    (unv, 'rls-test-unv@example.invalid', null);
  insert into private.admins (user_id) values (adm);

  -- Registration
  perform pg_temp.blocked('Forged email', pg_temp.attempt(a, 'authenticated', 'aal1',
    $$insert into public.inspector_profiles (full_name, email, inspector_code) values ('Fake Name', 'x@example.invalid', 'X')$$));
  perform pg_temp.blocked('Forged owner', pg_temp.attempt(a, 'authenticated', 'aal1',
    format($$insert into public.inspector_profiles (user_id, full_name, inspector_code) values (%L, 'Fake Name', 'X')$$, b)));
  perform pg_temp.blocked('Unverified user registers', pg_temp.attempt(unv, 'authenticated', 'aal1',
    $$insert into public.inspector_profiles (full_name, inspector_code) values ('Fake Name', 'X')$$));
  perform pg_temp.blocked('Signed-out visitor registers', pg_temp.attempt(null, 'anon', null,
    $$insert into public.inspector_profiles (full_name, inspector_code) values ('Fake Name', 'X')$$));
  perform pg_temp.is_n('Inspector A registers', pg_temp.attempt(a, 'authenticated', 'aal1',
    $$insert into public.inspector_profiles (full_name, inspector_code) values ('Inspector A', 'TEST-1')$$), 1);
  perform pg_temp.is_n('Inspector B registers with the same ID', pg_temp.attempt(b, 'authenticated', 'aal1',
    $$insert into public.inspector_profiles (full_name, inspector_code) values ('Inspector B', 'TEST-1')$$), 1);
  perform pg_temp.blocked('A registers twice', pg_temp.attempt(a, 'authenticated', 'aal1',
    $$insert into public.inspector_profiles (full_name, inspector_code) values ('Again Name', 'X')$$));

  -- Profiles
  perform pg_temp.is_n('A sees only one profile', pg_temp.attempt(a, 'authenticated', 'aal1',
    $$select 1 from public.inspector_profiles$$), 1);
  perform pg_temp.blocked('A reads B by id', pg_temp.attempt(a, 'authenticated', 'aal1',
    format($$select 1 from public.inspector_profiles where user_id = %L$$, b)));
  perform pg_temp.blocked('A searches B by email', pg_temp.attempt(a, 'authenticated', 'aal1',
    $$select 1 from public.inspector_profiles where email = 'rls-test-b@example.invalid'$$));
  perform pg_temp.blocked('A edits own profile', pg_temp.attempt(a, 'authenticated', 'aal1',
    $$update public.inspector_profiles set full_name = 'Changed Name'$$));
  perform pg_temp.blocked('A deletes profile', pg_temp.attempt(a, 'authenticated', 'aal1',
    $$delete from public.inspector_profiles$$));

  -- Private ideas
  perform pg_temp.blocked('A submits an idea as B', pg_temp.attempt(a, 'authenticated', 'aal1',
    format($$insert into public.ideas (user_id, title, description, project) values (%L, 't', 'd', 'p')$$, b)));
  perform pg_temp.blocked('A fakes an idea created_at', pg_temp.attempt(a, 'authenticated', 'aal1',
    $$insert into public.ideas (title, description, project, created_at) values ('t', 'd', 'p', '2000-01-01')$$));
  perform pg_temp.blocked('A fakes an idea id', pg_temp.attempt(a, 'authenticated', 'aal1',
    $$insert into public.ideas (id, title, description, project) values ('00000000-0000-4000-8000-000000000001', 't', 'd', 'p')$$));
  perform pg_temp.is_n('A adds an idea', pg_temp.attempt(a, 'authenticated', 'aal1',
    $$insert into public.ideas (title, description, project, priority) values ('RLS test idea', 'd', 'p', 'high')$$), 1);
  select id into idea_a from public.ideas where user_id = a;
  perform pg_temp.blocked('B lists A ideas', pg_temp.attempt(b, 'authenticated', 'aal1',
    $$select 1 from public.ideas$$));
  perform pg_temp.blocked('B opens A idea by direct id', pg_temp.attempt(b, 'authenticated', 'aal1',
    format($$select 1 from public.ideas where id = %L$$, idea_a)));
  perform pg_temp.blocked('B edits A idea', pg_temp.attempt(b, 'authenticated', 'aal1',
    format($$update public.ideas set title = 'x' where id = %L$$, idea_a)));
  perform pg_temp.blocked('B deletes A idea', pg_temp.attempt(b, 'authenticated', 'aal1',
    format($$delete from public.ideas where id = %L$$, idea_a)));
  perform pg_temp.blocked('A hands idea to B', pg_temp.attempt(a, 'authenticated', 'aal1',
    format($$update public.ideas set user_id = %L$$, b)));
  perform pg_temp.blocked('Signed-out visitor reads ideas', pg_temp.attempt(null, 'anon', null,
    $$select 1 from public.ideas$$));
  perform pg_temp.blocked('Unverified user reads ideas', pg_temp.attempt(unv, 'authenticated', 'aal1',
    $$select 1 from public.ideas$$));

  -- Admin boundary
  perform pg_temp.blocked('A reads admin list', pg_temp.attempt(a, 'authenticated', 'aal1',
    $$select 1 from private.admins$$));
  perform pg_temp.blocked('A makes self admin', pg_temp.attempt(a, 'authenticated', 'aal1',
    format($$insert into private.admins (user_id) values (%L)$$, a)));
  perform pg_temp.is_n('A with aal2 and fake admin metadata still sees only self', pg_temp.attempt(a, 'authenticated', 'aal2',
    $$select 1 from public.inspector_profiles$$), 1);
  perform pg_temp.blocked('Admin without authenticator reads profiles', pg_temp.attempt(adm, 'authenticated', 'aal1',
    format($$select 1 from public.inspector_profiles where user_id in (%L, %L)$$, a, b)));
  perform pg_temp.blocked('Admin without authenticator publishes', pg_temp.attempt(adm, 'authenticated', 'aal1',
    $$insert into public.published_ideas (title, description) values ('x', 'y')$$));
  perform pg_temp.is_n('Admin reads all test profiles', pg_temp.attempt(adm, 'authenticated', 'aal2',
    format($$select 1 from public.inspector_profiles where user_id in (%L, %L)$$, a, b)), 2);
  perform pg_temp.is_n('Admin reads A idea', pg_temp.attempt(adm, 'authenticated', 'aal2',
    format($$select 1 from public.ideas where id = %L$$, idea_a)), 1);
  perform pg_temp.blocked('A publishes', pg_temp.attempt(a, 'authenticated', 'aal1',
    $$insert into public.published_ideas (title, description) values ('x', 'y')$$));
  perform pg_temp.is_n('Admin publishes a copy', pg_temp.attempt(adm, 'authenticated', 'aal2',
    $$insert into public.published_ideas (title, description) values ('RLS test copy', 'desc')$$), 1);
  select id into copy_id from public.published_ideas where title = 'RLS test copy';
  perform pg_temp.is_n('Admin links copy to source', pg_temp.attempt(adm, 'authenticated', 'aal2',
    format($$insert into public.publication_links (published_idea_id, source_idea_id) values (%L, %L)$$, copy_id, idea_a)), 1);
  perform pg_temp.blocked('A reads source links', pg_temp.attempt(a, 'authenticated', 'aal1',
    $$select 1 from public.publication_links$$));
  perform pg_temp.blocked('A edits a copy', pg_temp.attempt(a, 'authenticated', 'aal1',
    format($$update public.published_ideas set title = 'x' where id = %L$$, copy_id)));
  perform pg_temp.is_n('B can read the live copy', pg_temp.attempt(b, 'authenticated', 'aal1',
    format($$select 1 from public.published_ideas where id = %L$$, copy_id)), 1);
  perform pg_temp.blocked('Signed-out visitor reads copies', pg_temp.attempt(null, 'anon', null,
    $$select 1 from public.published_ideas$$));
  select count(*) into n from information_schema.columns
  where table_schema = 'public' and table_name = 'published_ideas'
    and column_name ~ '(user|email|name|code|inspector|source)';
  perform pg_temp.is_n('Copies have no inspector columns', n, 0);

  -- Am-I-admin check (grants nothing; only answers about the caller)
  perform pg_temp.blocked('A is not told they are admin', pg_temp.attempt(a, 'authenticated', 'aal2',
    $$select 1 where public.am_i_admin()$$));
  perform pg_temp.blocked('Admin without authenticator is not told they are admin', pg_temp.attempt(adm, 'authenticated', 'aal1',
    $$select 1 where public.am_i_admin()$$));
  perform pg_temp.is_n('Admin with authenticator is told they are admin', pg_temp.attempt(adm, 'authenticated', 'aal2',
    $$select 1 where public.am_i_admin()$$), 1);
  perform pg_temp.blocked('Signed-out visitor cannot call the check', pg_temp.attempt(null, 'anon', null,
    $$select public.am_i_admin()$$));

  -- Ratings and comments
  perform pg_temp.blocked('A rates as B', pg_temp.attempt(a, 'authenticated', 'aal1',
    format($$insert into public.ratings (user_id, published_idea_id, stars) values (%L, %L, 5)$$, b, copy_id)));
  perform pg_temp.blocked('Stars out of range', pg_temp.attempt(a, 'authenticated', 'aal1',
    format($$insert into public.ratings (published_idea_id, stars) values (%L, 6)$$, copy_id)));
  perform pg_temp.blocked('Forged timestamp', pg_temp.attempt(a, 'authenticated', 'aal1',
    format($$insert into public.ratings (published_idea_id, stars, created_at) values (%L, 5, '2000-01-01')$$, copy_id)));
  perform pg_temp.blocked('A rates a private idea', pg_temp.attempt(a, 'authenticated', 'aal1',
    format($$insert into public.ratings (published_idea_id, stars) values (%L, 5)$$, idea_a)));
  perform pg_temp.is_n('A rates', pg_temp.attempt(a, 'authenticated', 'aal1',
    format($$insert into public.ratings (published_idea_id, stars, comment) values (%L, 5, 'comment from A')$$, copy_id)), 1);
  perform pg_temp.is_n('B rates', pg_temp.attempt(b, 'authenticated', 'aal1',
    format($$insert into public.ratings (published_idea_id, stars, comment) values (%L, 1, 'comment from B')$$, copy_id)), 1);
  perform pg_temp.blocked('A rates twice', pg_temp.attempt(a, 'authenticated', 'aal1',
    format($$insert into public.ratings (published_idea_id, stars) values (%L, 4)$$, copy_id)));
  perform pg_temp.is_n('A sees only own rating on the copy', pg_temp.attempt(a, 'authenticated', 'aal1',
    format($$select 1 from public.ratings where published_idea_id = %L$$, copy_id)), 1);
  perform pg_temp.is_n('B sees only own rating on the copy', pg_temp.attempt(b, 'authenticated', 'aal1',
    format($$select 1 from public.ratings where published_idea_id = %L$$, copy_id)), 1);
  perform pg_temp.blocked('A searches for B comment', pg_temp.attempt(a, 'authenticated', 'aal1',
    $$select 1 from public.ratings where comment = 'comment from B'$$));
  perform pg_temp.blocked('A edits own rating', pg_temp.attempt(a, 'authenticated', 'aal1',
    $$update public.ratings set stars = 1$$));
  perform pg_temp.blocked('A deletes own rating', pg_temp.attempt(a, 'authenticated', 'aal1',
    $$delete from public.ratings$$));
  perform pg_temp.blocked('B edits A rating', pg_temp.attempt(b, 'authenticated', 'aal1',
    format($$update public.ratings set comment = 'x' where user_id = %L$$, a)));
  perform pg_temp.blocked('Signed-out visitor reads ratings', pg_temp.attempt(null, 'anon', null,
    $$select 1 from public.ratings$$));
  perform pg_temp.is_n('Admin reads both ratings', pg_temp.attempt(adm, 'authenticated', 'aal2',
    format($$select 1 from public.ratings where published_idea_id = %L$$, copy_id)), 2);
  perform pg_temp.blocked('Admin without authenticator reads ratings', pg_temp.attempt(adm, 'authenticated', 'aal1',
    format($$select 1 from public.ratings where published_idea_id = %L$$, copy_id)));

  -- Votes
  perform pg_temp.blocked('A votes as B', pg_temp.attempt(a, 'authenticated', 'aal1',
    format($$insert into public.votes (user_id, published_idea_id) values (%L, %L)$$, b, copy_id)));
  perform pg_temp.is_n('A votes', pg_temp.attempt(a, 'authenticated', 'aal1',
    format($$insert into public.votes (published_idea_id) values (%L)$$, copy_id)), 1);
  perform pg_temp.blocked('B sees A vote', pg_temp.attempt(b, 'authenticated', 'aal1',
    format($$select 1 from public.votes where published_idea_id = %L$$, copy_id)));
  perform pg_temp.blocked('B removes A vote', pg_temp.attempt(b, 'authenticated', 'aal1',
    format($$delete from public.votes where user_id = %L$$, a)));
  perform pg_temp.is_n('A removes own vote', pg_temp.attempt(a, 'authenticated', 'aal1',
    format($$delete from public.votes where published_idea_id = %L$$, copy_id)), 1);

  -- Unpublish, email change, admin removal
  perform pg_temp.is_n('Admin unpublishes', pg_temp.attempt(adm, 'authenticated', 'aal2',
    format($$update public.published_ideas set unpublished_at = now() where id = %L$$, copy_id)), 1);
  perform pg_temp.blocked('B reads unpublished copy', pg_temp.attempt(b, 'authenticated', 'aal1',
    format($$select 1 from public.published_ideas where id = %L$$, copy_id)));
  perform pg_temp.blocked('B votes on unpublished copy', pg_temp.attempt(b, 'authenticated', 'aal1',
    format($$insert into public.votes (published_idea_id) values (%L)$$, copy_id)));
  update auth.users set email = 'rls-test-a2@example.invalid' where id = a;
  perform pg_temp.is_n('Profile email follows the account', pg_temp.attempt(a, 'authenticated', 'aal1',
    $$select 1 from public.inspector_profiles where email = 'rls-test-a2@example.invalid'$$), 1);
  delete from private.admins where user_id = adm;
  perform pg_temp.blocked('Removed admin loses access immediately', pg_temp.attempt(adm, 'authenticated', 'aal2',
    format($$select 1 from public.ratings where published_idea_id = %L$$, copy_id)));

  select count(*) filter (where ok),
         count(*) filter (where not ok),
         coalesce(string_agg(name, ' | ') filter (where not ok), 'none')
    into passed, failed, failing
  from rls_test_log;

  -- Deliberate error: this undoes every test row, user and helper above.
  raise exception 'RLS TEST FINISHED. Passed: %. Failed: %. Failing tests: %. All test data rolled back.',
    passed, failed, failing;
end;
$test$;
