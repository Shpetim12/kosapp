# Deployment Checklist

## Before Pushing To GitHub

Make sure these files are not committed:

- `.env.local`
- `.next`
- `node_modules`
- `.vercel`
- `*.log`

They are already covered by `.gitignore`.

## GitHub

If Git is installed, from the project root:

```powershell
git init
git add .
git commit -m "Initial KosBanesa MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Vercel

1. Import the GitHub repo in Vercel.
2. Add environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ADMIN_EMAILS
```

3. Deploy.

## Supabase

If you create a new Supabase project later, run migrations in order:

```txt
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_remove_phone_requirement.sql
supabase/migrations/003_seed_admin_email.sql
```

Also confirm Storage bucket `listing-photos` exists.
