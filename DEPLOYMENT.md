# TaskMaster Pro - Deployment Guide

## Prerequisites

- GitHub account
- Vercel account
- Supabase account (free tier)

## 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database** and copy the connection string
3. Use the **Connection pooling** URL for `DATABASE_URL` (port 6543)
4. Use the **Direct connection** URL for `DIRECT_URL` (port 5432)
5. Add both to your environment variables

## 2. Environment Variables

Create these in Vercel (Settings → Environment Variables):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase Postgres connection string (pooled) |
| `DIRECT_URL` | Supabase Postgres direct connection |
| `NEXTAUTH_URL` | Your production URL (e.g. https://your-app.vercel.app) |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | (Optional) Google OAuth |
| `GOOGLE_CLIENT_SECRET` | (Optional) Google OAuth |
| `GITHUB_ID` | (Optional) GitHub OAuth |
| `GITHUB_SECRET` | (Optional) GitHub OAuth |
| `OPENAI_API_KEY` | (Optional) For AI features |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

## 3. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repository
4. Add all environment variables
5. Deploy

## 4. Post-Deploy: Database Setup

After first deploy, run migrations:

```bash
# Set DATABASE_URL and DIRECT_URL, then:
npx prisma db push
npx prisma db seed
```

Or use Vercel's CLI with env vars:

```bash
vercel env pull .env.local
npx prisma db push
npx prisma db seed
```

## 5. Admin Access

After seeding:

- **Email**: admin@taskmaster.pro
- **Password**: changeme123

**Change this password immediately in production!**

## 6. Scale Guide

- **Add Redis**: Sign up for Upstash Redis, add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for rate limiting
- **Upgrade Supabase**: Move to Pro tier for more connections and storage
- **Inngest**: Add `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` for background jobs
