begin;

-- ---------- Private area: not reachable through the API ----------
create schema private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table private.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  granted_at timestamptz not null default now()
);
alter table private.admins enable row level security;
revoke all on table private.admins from public, anon, authenticated;

-- Admin = listed in private.admins AND finished the authenticator step.
create function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((auth.jwt() ->> 'aal') = 'aal2', false)
     and exists (select 1 from private.admins a where a.user_id = auth.uid());
$$;

-- Verified email and not an anonymous session.
create function private.is_verified_user() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from auth.users u
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
      and coalesce(u.is_anonymous, false) = false
  );
$$;

-- ---------- Tables ----------
-- inspector_code is typed by the inspector and is NOT verified identity.
-- It is deliberately not unique, so nobody can test whether an ID exists.
create table public.inspector_profiles (
  user_id        uuid primary key default auth.uid()
                 references auth.users (id) on delete restrict,
  full_name      text not null
                 check (full_name = btrim(full_name) and char_length(full_name) between 2 and 120),
  email          text not null,
  inspector_code text not null
                 check (inspector_code = btrim(inspector_code) and char_length(inspector_code) between 1 and 50),
  created_at     timestamptz not null default now()
);

-- Private ideas: only the author and the admin can read them.
create table public.ideas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid()
              references public.inspector_profiles (user_id) on delete restrict,
  title       text not null check (char_length(btrim(title)) between 1 and 200),
  description text not null check (char_length(btrim(description)) between 1 and 5000),
  project     text not null check (char_length(btrim(project)) between 1 and 200),
  priority    text check (priority in ('high', 'medium', 'low')),
  created_at  timestamptz not null default now()
);

-- Anonymous copies written by the admin. No inspector column exists here.
create table public.published_ideas (
  id             uuid primary key default gen_random_uuid(),
  title          text not null check (char_length(btrim(title)) between 1 and 200),
  description    text not null check (char_length(btrim(description)) between 1 and 5000),
  project        text check (project is null or char_length(btrim(project)) between 1 and 200),
  priority       text check (priority in ('high', 'medium', 'low')),
  published_at   timestamptz not null default now(),
  unpublished_at timestamptz
);

-- Which private idea a published copy came from: admin only.
create table public.publication_links (
  published_idea_id uuid primary key references public.published_ideas (id) on delete restrict,
  source_idea_id    uuid not null references public.ideas (id) on delete restrict,
  created_at        timestamptz not null default now()
);

-- One rating per inspector per published idea. Cannot be edited or deleted.
create table public.ratings (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid()
                    references public.inspector_profiles (user_id) on delete restrict,
  published_idea_id uuid not null references public.published_ideas (id) on delete restrict,
  stars             smallint not null check (stars between 1 and 5),
  comment           text check (comment is null or char_length(comment) <= 2000),
  created_at        timestamptz not null default now(),
  unique (user_id, published_idea_id)
);

create table public.votes (
  user_id           uuid not null default auth.uid()
                    references public.inspector_profiles (user_id) on delete restrict,
  published_idea_id uuid not null references public.published_ideas (id) on delete restrict,
  created_at        timestamptz not null default now(),
  primary key (user_id, published_idea_id)
);

create index ideas_user_id_idx on public.ideas (user_id);
create index ratings_published_idea_id_idx on public.ratings (published_idea_id);
create index votes_published_idea_id_idx on public.votes (published_idea_id);

-- ---------- The profile email always comes from the verified account ----------
create function private.set_profile_email() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  select u.email into new.email from auth.users u where u.id = new.user_id;
  if new.email is null then
    raise exception 'A verified account email is required';
  end if;
  return new;
end;
$$;

create trigger set_profile_email
  before insert on public.inspector_profiles
  for each row execute function private.set_profile_email();

create function private.sync_profile_email() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.inspector_profiles set email = new.email where user_id = new.id;
  return new;
end;
$$;

create trigger sync_profile_email
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function private.sync_profile_email();

revoke execute on all functions in schema private from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_verified_user() to authenticated;

-- Lets the signed-in user ask whether they are the admin, so the app knows
-- which screens to show. It only answers about the caller and grants nothing.
create function public.am_i_admin() returns boolean
language sql stable security invoker set search_path = '' as $$
  select private.is_admin();
$$;
revoke execute on function public.am_i_admin() from public, anon;
grant execute on function public.am_i_admin() to authenticated;

-- ---------- Permissions: remove everything, then grant the minimum ----------
-- Columns left out (user_id, email, created_at) cannot be sent in a request.
revoke all on table
  public.inspector_profiles, public.ideas, public.published_ideas,
  public.publication_links, public.ratings, public.votes
from public, anon, authenticated;

grant select on table
  public.inspector_profiles, public.ideas, public.published_ideas,
  public.publication_links, public.ratings, public.votes
to authenticated;

grant insert (full_name, inspector_code) on public.inspector_profiles to authenticated;
grant insert (title, description, project, priority) on public.ideas to authenticated;
grant insert (published_idea_id, stars, comment) on public.ratings to authenticated;
grant insert (published_idea_id), delete on public.votes to authenticated;
grant insert (title, description, project, priority),
      update (title, description, project, priority, unpublished_at)
  on public.published_ideas to authenticated;
grant insert (published_idea_id, source_idea_id) on public.publication_links to authenticated;

-- Future tables start with no API access until they are explicitly granted.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- ---------- Row Level Security ----------
alter table public.inspector_profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.published_ideas enable row level security;
alter table public.publication_links enable row level security;
alter table public.ratings enable row level security;
alter table public.votes enable row level security;

-- Every table: signed in with a verified email, always.
create policy require_verified on public.inspector_profiles as restrictive for all to authenticated
  using ((select private.is_verified_user()));
create policy require_verified on public.ideas as restrictive for all to authenticated
  using ((select private.is_verified_user()));
create policy require_verified on public.published_ideas as restrictive for all to authenticated
  using ((select private.is_verified_user()));
create policy require_verified on public.publication_links as restrictive for all to authenticated
  using ((select private.is_verified_user()));
create policy require_verified on public.ratings as restrictive for all to authenticated
  using ((select private.is_verified_user()));
create policy require_verified on public.votes as restrictive for all to authenticated
  using ((select private.is_verified_user()));

-- Profiles
create policy read_own_or_admin on public.inspector_profiles for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy add_own on public.inspector_profiles for insert to authenticated
  with check (user_id = (select auth.uid()));

-- Private ideas
create policy read_own_or_admin on public.ideas for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy add_own on public.ideas for insert to authenticated
  with check (user_id = (select auth.uid()));

-- Published copies: inspectors read live copies; only the admin manages them
create policy read_live_or_admin on public.published_ideas for select to authenticated
  using (unpublished_at is null or (select private.is_admin()));
create policy admin_add on public.published_ideas for insert to authenticated
  with check ((select private.is_admin()));
create policy admin_update on public.published_ideas for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- Links: admin only
create policy admin_read on public.publication_links for select to authenticated
  using ((select private.is_admin()));
create policy admin_add on public.publication_links for insert to authenticated
  with check ((select private.is_admin()));

-- Ratings: add your own on a live copy; no update or delete policy exists
create policy read_own_or_admin on public.ratings for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy add_own_on_live on public.ratings for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.published_ideas p
                where p.id = published_idea_id and p.unpublished_at is null)
  );

-- Votes: add or remove your own on a live copy
create policy read_own_or_admin on public.votes for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy add_own_on_live on public.votes for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.published_ideas p
                where p.id = published_idea_id and p.unpublished_at is null)
  );
create policy remove_own on public.votes for delete to authenticated
  using (user_id = (select auth.uid()));

commit;
