# Deploy TaskMaster Pro to Vercel (skip local, start in production)

## 1. Push your code to GitHub

1. **Create a new repo on GitHub**
   - Go to https://github.com/new
   - Repository name: `taskmaster-pro` (or any name)
   - **Do not** add README, .gitignore, or license (you already have them)
   - Create repository

2. **Connect and push from your project folder** (in terminal):

   ```bash
   cd C:\Users\palam\OneDrive\Desktop\TEST
   git remote add origin https://github.com/YOUR_USERNAME/taskmaster-pro.git
   git add -A
   git commit -m "Prepare for Vercel deploy"   # if there are changes
   git branch -M main
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub username and `taskmaster-pro` with your repo name.

---

## 2. Deploy on Vercel

1. Go to **https://vercel.com** and sign in (use GitHub if you can).

2. Click **Add New…** → **Project**.

3. **Import** your `taskmaster-pro` (or your repo name) from the list. Click **Import**.

4. **Environment variables** (add these before deploying):
   - Click **Environment Variables**.
   - Add each variable; use **Production** (and optionally Preview) for each.

   | Name | Value |
   |------|--------|
   | `DATABASE_URL` | Your Supabase **pooled** URL (port **6543**) |
   | `DIRECT_URL` | Your Supabase **direct** URL (port **5432**) |
   | `NEXTAUTH_URL` | `https://your-project.vercel.app` (you’ll get this after first deploy; you can set it now or edit after) |
   | `NEXTAUTH_SECRET` | Same secret you use in `.env.local` (e.g. from `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`) |
   | `GOOGLE_CLIENT_ID` | (if you use Google sign-in) |
   | `GOOGLE_CLIENT_SECRET` | (if you use Google sign-in) |
   | `GITHUB_ID` | (if you use GitHub sign-in) |
   | `GITHUB_SECRET` | (if you use GitHub sign-in) |

   For **NEXTAUTH_URL**: after the first deploy, Vercel will show the URL (e.g. `https://taskmaster-pro-xxx.vercel.app`). Update this env var to that URL and **redeploy** so OAuth works.

5. Click **Deploy**. Wait for the build to finish.

---

## 3. Set production URL for OAuth (after first deploy)

1. In Vercel, open your project → **Settings** → **Environment Variables**.
2. Set **NEXTAUTH_URL** to your live URL, e.g. `https://your-app-name.vercel.app`.
3. In **Google Cloud Console** (APIs & Services → Credentials → your OAuth client):
   - Add **Authorized JavaScript origin**: `https://your-app-name.vercel.app`
   - Add **Authorized redirect URI**: `https://your-app-name.vercel.app/api/auth/callback/google`
4. In **GitHub** (Settings → Developer settings → OAuth Apps → your app):
   - Set **Authorization callback URL** to: `https://your-app-name.vercel.app/api/auth/callback/github`
5. In Vercel, go to **Deployments** → **⋯** on the latest → **Redeploy** (so the new NEXTAUTH_URL is used).

---

## 4. Create database tables and seed (one time)

Vercel doesn’t run Prisma migrations for you. Run these **once** from your **local machine** using your **production** Supabase URLs:

1. In Vercel: **Settings** → **Environment Variables** → copy `DATABASE_URL` and `DIRECT_URL` (or use **Vercel CLI**: `npx vercel env pull .env.production.local`).

2. In a **local** `.env` or `.env.local` (temporarily), set:
   - `DATABASE_URL` = same as Vercel (pooled, port 6543)
   - `DIRECT_URL` = same as Vercel (direct, port 5432)

3. In your project folder run:

   ```bash
   cd C:\Users\palam\OneDrive\Desktop\TEST
   npx prisma db push
   npx prisma db seed
   ```

4. After that, your Vercel app can use the database. Admin login (from seed): **admin@taskmaster.pro** / **changeme123** — change the password after first login in production.

---

## 5. You’re done

- App URL: `https://your-project.vercel.app`
- Sign up / sign in and use the app from there; no need to run it on localhost unless you want to develop locally later.
