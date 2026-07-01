# KosBanesa

KosBanesa is a mobile-first rental listings web app for Kosovo focused on verified listings, transparent browsing, admin approval, and contact request gating.

## Tech Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, Storage, RLS
- Vercel deployment

## Local Setup

Install dependencies:

```powershell
npm.cmd install
```

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_EMAILS=your_admin_email@example.com
```

Run the app:

```powershell
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

Open:

```txt
http://127.0.0.1:3000
```

## Supabase Setup

Run the SQL files in Supabase SQL Editor in this order:

```txt
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_remove_phone_requirement.sql
supabase/migrations/003_seed_admin_email.sql
```

The app uses:

- `profiles`
- `listings`
- `listing_photos`
- `contact_requests`
- `reports`
- Supabase Storage bucket: `listing-photos`

## Vercel Deployment

In Vercel project settings, add these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ADMIN_EMAILS
```

Then deploy from GitHub. Vercel should detect Next.js automatically.

Build command:

```txt
npm run build
```

Output is handled by Next.js/Vercel automatically.

## Important Privacy Rules

- Public listing queries must not expose landlord email.
- Landlord phone is only fetched after a renter has an approved contact request.
- New listings start as `pending_review`.
- Admin approval changes listing status to `active`.

## Useful Commands

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```
