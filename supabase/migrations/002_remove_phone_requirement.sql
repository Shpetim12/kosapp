drop policy if exists "Verified-phone landlords can create listings" on public.listings;

create policy "Landlords can create listings" on public.listings
  for insert with check (
    auth.uid() = landlord_id
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'landlord'
    )
  );
