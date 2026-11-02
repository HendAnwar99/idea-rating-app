select 'CONFLICT: schema exists' as finding, nspname::text as detail
from pg_namespace where nspname = 'private'
union all
select 'CONFLICT: table exists', tablename::text from pg_tables
where schemaname = 'public'
  and tablename in ('inspector_profiles', 'ideas', 'published_ideas',
                    'publication_links', 'ratings', 'votes')
union all
select 'INFO: other public table', tablename::text from pg_tables
where schemaname = 'public'
  and tablename not in ('inspector_profiles', 'ideas', 'published_ideas',
                        'publication_links', 'ratings', 'votes')
union all
select 'INFO: existing trigger on auth.users', t.tgname::text
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'auth' and c.relname = 'users' and not t.tgisinternal
union all
select 'INFO: existing sign-in accounts', count(*)::text from auth.users
union all
select 'INFO: running as', current_user::text;
