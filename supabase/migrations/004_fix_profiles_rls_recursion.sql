drop policy if exists "Users can update their profile" on public.profiles;

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
