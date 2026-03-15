# TaskMaster Pro

Production-ready collaborative task management SaaS platform.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn/UI, React Query, Zustand
- **Backend**: Next.js API routes, Prisma ORM, tRPC
- **Database**: PostgreSQL (Supabase)
- **Auth**: NextAuth.js (credentials + Google/GitHub OAuth)
- **Real-time**: Supabase Realtime
- **AI**: OpenAI for task prioritization and summarization

## Quick Start

1. Copy `.env.example` to `.env.local` and fill in your keys.
2. Set up Supabase: create a project, get the connection string.
3. Run migrations:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

## Admin Credentials (after seed)

- Email: `admin@taskmaster.pro`
- Password: `changeme123`

## Deployment (Vercel)

1. Push to GitHub.
2. Import project in Vercel.
3. Add environment variables from `.env.example`.
4. Deploy.

## Security

- Input validation with Zod
- Auth guards on protected routes
- JWT sessions
- OWASP best practices
