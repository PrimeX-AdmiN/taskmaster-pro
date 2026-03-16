# Fix "Application error: a server-side exception" on Vercel

Do these in order:

---

## 1. Check environment variables in Vercel

In Vercel: **Project → Settings → Environment Variables**.

Ensure these exist for **Production** (and optionally Preview):

| Variable | Required | Example / note |
|----------|----------|----------------|
| `DATABASE_URL` | ✅ Yes | Supabase **pooled** URL (port **6543**) |
| `DIRECT_URL`   | ✅ Yes | Supabase **direct** URL (port **5432**) |
| `NEXTAUTH_URL` | ✅ Yes | **Must be your Vercel URL**, e.g. `https://taskmaster-pro-xxx.vercel.app` |
| `NEXTAUTH_SECRET` | ✅ Yes | Same long random string you use locally |

If any are missing or wrong, add/update them, then **Redeploy** (Deployments → ⋯ → Redeploy).

---

## 2. Create database tables (one-time)

The app uses Prisma and expects tables (User, Workspace, Task, etc.). If you haven’t run migrations against your **production** Supabase, the app will crash.

**On your local machine**, with the **same** `DATABASE_URL` and `DIRECT_URL` as in Vercel (e.g. copy from Vercel or use `npx vercel env pull`):

```bash
cd C:\Users\palam\OneDrive\Desktop\TEST
npx prisma db push
npx prisma db seed
```

Then redeploy or just reload the Vercel URL.

---

## 3. See the real error in Vercel logs

- **Project → Deployments** → click the latest deployment.
- Open **Functions** or **Logs** / **Runtime Logs**.
- Reproduce the error (open the app URL) and check the log line that appears. It will show the actual exception (e.g. connection refused, table missing, env var missing).

---

## 4. Quick checklist

- [ ] `DATABASE_URL` and `DIRECT_URL` set in Vercel
- [ ] `NEXTAUTH_URL` = your exact Vercel app URL (no trailing slash)
- [ ] `NEXTAUTH_SECRET` set
- [ ] Ran `npx prisma db push` (and `npx prisma db seed`) once against production DB
- [ ] Redeployed after changing env vars

After 2 and 4, the "Application error" usually goes away. If not, the logs from step 3 will show the next fix.
