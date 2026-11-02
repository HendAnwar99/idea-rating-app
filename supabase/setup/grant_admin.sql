insert into private.admins (user_id)
select id from auth.users
where email = lower('YOUR-ADMIN-EMAIL')
  and email_confirmed_at is not null
returning user_id, granted_at;
