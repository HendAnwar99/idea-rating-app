select 'tables with RLS on' as check_name,
       count(*) filter (where c.relrowsecurity) || ' of ' || count(*) as result
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('public', 'private') and c.relkind = 'r'
union all
select 'policies', count(*)::text from pg_policies where schemaname = 'public'
union all
select 'private functions', count(*)::text
from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'private'
union all
select 'triggers', count(*)::text from pg_trigger
where tgname in ('set_profile_email', 'sync_profile_email') and not tgisinternal
union all
select 'table permissions for signed-out visitors', count(*)::text
from information_schema.role_table_grants
where table_schema = 'public' and grantee = 'anon'
union all
select 'admins', count(*)::text from private.admins;
