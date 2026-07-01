create extension if not exists "pgcrypto";

create type public.user_role as enum ('renter', 'landlord');
create type public.listing_status as enum ('pending_review', 'active', 'rented', 'expired', 'rejected');
create type public.property_type as enum ('apartment', 'house', 'room', 'studio');
create type public.furnished_type as enum ('yes', 'no', 'partial');
create type public.contact_request_status as enum ('pending', 'approved', 'declined');

create table public.admin_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

insert into public.admin_emails (email)
values ('admin@example.com')
on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  full_name text not null,
  phone text not null,
  phone_verified boolean not null default false,
  is_verified_landlord boolean not null default false,
  avatar_url text,
  created_at timestamptz not null default now(),
  constraint profiles_phone_kosovo_check check (phone ~ '^\+383[0-9]{8}$'),
  constraint profiles_landlord_badge_check check (
    role = 'landlord' or is_verified_landlord = false
  )
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  price integer not null check (price > 0),
  city text not null,
  neighborhood text not null,
  property_type public.property_type not null,
  bedrooms integer not null check (bedrooms >= 0 and bedrooms <= 10),
  size_m2 integer not null check (size_m2 > 0),
  furnished public.furnished_type not null,
  available_from date not null,
  amenities jsonb not null default '{}'::jsonb,
  status public.listing_status not null default 'pending_review',
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now(),
  constraint listings_amenities_object_check check (jsonb_typeof(amenities) = 'object')
);

create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  order_index integer not null check (order_index >= 0 and order_index < 10),
  created_at timestamptz not null default now(),
  unique (listing_id, order_index)
);

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  renter_id uuid not null references public.profiles(id) on delete cascade,
  status public.contact_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (listing_id, renter_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  created_at timestamptz not null default now()
);

create view public.landlord_public_profiles as
select
  id,
  full_name,
  is_verified_landlord
from public.profiles
where role = 'landlord';

grant select on public.landlord_public_profiles to anon, authenticated;

create index listings_active_search_idx on public.listings (status, city, neighborhood, price, bedrooms, created_at desc);
create index listings_landlord_idx on public.listings (landlord_id, created_at desc);
create index listing_photos_listing_idx on public.listing_photos (listing_id, order_index);
create index contact_requests_renter_idx on public.contact_requests (renter_id, status);
create index reports_listing_idx on public.reports (listing_id);

create or replace function public.guard_listing_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending_review';
    return new;
  end if;

  if old.status is distinct from new.status then
    if new.status = 'active' or old.status in ('pending_review', 'rejected') then
      raise exception 'Only admins can approve, reject, or reactivate listings';
    end if;
  end if;

  return new;
end;
$$;

create trigger guard_listing_status_before_write
before insert or update on public.listings
for each row execute function public.guard_listing_status();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, phone, phone_verified)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'renter')::public.user_role,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Përdorues i ri'),
    coalesce(new.raw_user_meta_data ->> 'phone', '+38300000000'),
    coalesce((new.raw_user_meta_data ->> 'phone_verified')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger create_profile_after_auth_signup
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create or replace function public.sync_profile_phone_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    phone = coalesce(new.phone, public.profiles.phone),
    phone_verified = new.phone_confirmed_at is not null
  where id = new.id;
  return new;
end;
$$;

create trigger sync_profile_phone_after_auth_update
after update of phone, phone_confirmed_at on auth.users
for each row execute function public.sync_profile_phone_verification();

alter table public.admin_emails enable row level security;
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.contact_requests enable row level security;
alter table public.reports enable row level security;

create policy "Admins can read allowlist" on public.admin_emails
  for select using (public.is_admin());

create policy "Users can insert their profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can read their profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "Landlords can read approved or pending renters" on public.profiles
  for select using (
    exists (
      select 1
      from public.contact_requests cr
      join public.listings l on l.id = cr.listing_id
      where cr.renter_id = profiles.id
        and l.landlord_id = auth.uid()
    )
  );

create policy "Renters can read approved landlord contacts" on public.profiles
  for select using (
    exists (
      select 1
      from public.contact_requests cr
      join public.listings l on l.id = cr.listing_id
      where l.landlord_id = profiles.id
        and cr.renter_id = auth.uid()
        and cr.status = 'approved'
    )
  );

create policy "Users can update their profile" on public.profiles
  for update using (auth.uid() = id) with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and phone_verified = (select p.phone_verified from public.profiles p where p.id = auth.uid())
    and is_verified_landlord = (select p.is_verified_landlord from public.profiles p where p.id = auth.uid())
  );

create policy "Admins can verify profiles" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

create policy "Anyone can read active listings" on public.listings
  for select using (status = 'active' or public.is_admin());

create policy "Landlords can read their listings" on public.listings
  for select using (auth.uid() = landlord_id);

create policy "Verified-phone landlords can create listings" on public.listings
  for insert with check (
    auth.uid() = landlord_id
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'landlord'
        and p.phone_verified = true
    )
  );

create policy "Landlords can update their listings" on public.listings
  for update using (auth.uid() = landlord_id) with check (auth.uid() = landlord_id);

create policy "Landlords can delete pending own listings" on public.listings
  for delete using (auth.uid() = landlord_id and status in ('pending_review', 'rejected'));

create policy "Admins can update listings" on public.listings
  for update using (public.is_admin()) with check (public.is_admin());

create policy "Read photos for visible listings" on public.listing_photos
  for select using (
    exists (
      select 1
      from public.listings l
      where l.id = listing_photos.listing_id
        and (l.status = 'active' or l.landlord_id = auth.uid() or public.is_admin())
    )
  );

create policy "Landlords manage own listing photos" on public.listing_photos
  for all using (
    exists (
      select 1
      from public.listings l
      where l.id = listing_photos.listing_id
        and l.landlord_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.listings l
      where l.id = listing_photos.listing_id
        and l.landlord_id = auth.uid()
    )
  );

create policy "Renters create contact requests" on public.contact_requests
  for insert with check (
    auth.uid() = renter_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'renter')
    and exists (select 1 from public.listings l where l.id = listing_id and l.status = 'active')
  );

create policy "Renters read own contact requests" on public.contact_requests
  for select using (auth.uid() = renter_id);

create policy "Landlords read requests for own listings" on public.contact_requests
  for select using (
    exists (
      select 1
      from public.listings l
      where l.id = contact_requests.listing_id
        and l.landlord_id = auth.uid()
    )
  );

create policy "Landlords decide requests for own listings" on public.contact_requests
  for update using (
    exists (
      select 1
      from public.listings l
      where l.id = contact_requests.listing_id
        and l.landlord_id = auth.uid()
    )
  ) with check (
    status in ('approved', 'declined')
    and exists (
      select 1
      from public.listings l
      where l.id = contact_requests.listing_id
        and l.landlord_id = auth.uid()
    )
  );

create policy "Users can report active listings" on public.reports
  for insert with check (
    auth.uid() = reporter_id
    and exists (select 1 from public.listings l where l.id = listing_id and l.status = 'active')
  );

create policy "Admins can read reports" on public.reports
  for select using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Listing photos are publicly readable" on storage.objects
  for select using (bucket_id = 'listing-photos');

create policy "Landlords upload listing photos to own folder" on storage.objects
  for insert with check (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Landlords update own uploaded listing photos" on storage.objects
  for update using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Landlords delete own uploaded listing photos" on storage.objects
  for delete using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
