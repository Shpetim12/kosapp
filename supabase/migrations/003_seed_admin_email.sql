insert into public.admin_emails (email)
values ('jayceleague92@gmail.com')
on conflict (email) do nothing;
