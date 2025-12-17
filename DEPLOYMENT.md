# Deployment Guide

This project consists of two parts:
1. **Frontend (Client)**: A React/Vite app.
2. **Backend (Server)**: A Node.js/Express app with Prisma.

You will need to deploy them separately, but they will communicate with each other.

---

## 1. Database Deployment (Supabase)
Since you are already using Supabase, your database is already in the cloud! ✅

**Crucial Step**: Ensure your `DATABASE_URL` uses the **Transaction Pooler** (port 6543) if deploying to a serverless environment (like Vercel functions), but for a standard Node server (Render/Railway), the standard Session pooler (port 5432) is usually fine.
However, for reliability, strictly use the **Transaction** connection string for production APIs if possible.

---

## 2. Backend Deployment (Render / Railway)
We recommend **Render** or **Railway** as they have free tiers/easy setup for Node.js.

### Option A: Railway (Easiest)
1. Push your code to GitHub.
2. Sign up at [Railway.app](https://railway.app/).
3. Create a **New Project** -> **Deploy from GitHub repo**.
4. Select your repository.
5. Railway will try to auto-detect. Since we have a monorepo structure (`client/` and `server/`), you need to configure the **Root Directory** for the service.
6. **Settings** -> **Root Directory**: Set to `/server`.
7. **Variables**: Add the following:
   - `DATABASE_URL`: *Your Supabase Connection String*
   - `PORT`: `4000` (or let Railway assign one, usually it sets `PORT` automatically and you just listen on it. Our code listens on `process.env.PORT`).
8. **Build Command**: `npm install && npm run build` (Railway usually auto-detects `npm install`, but ensure `npm run build` runs `tsc`).
   - *Note*: We added a `"build"` script to `server/package.json` for this.
9. **Start Command**: `npm start` (which runs `node dist/index.js`).

### Option B: Render
1. Sign up at [Render.com](https://render.com/).
2. Create **New Web Service**.
3. Connect GitHub repo.
4. **Root Directory**: `server`.
5. **Build Command**: `npm install && npm run build`.
6. **Start Command**: `npm start`.
7. **Environment Variables**: Add `DATABASE_URL`.

**Once Deployed**: Note down the URL (e.g., `https://my-api-production.up.railway.app`).

---

## 3. Frontend Deployment (Vercel)
Vercel is the best host for Vite (React) apps.

1. Push code to GitHub.
2. Sign up at [Vercel.com](https://vercel.com/).
3. **Add New Project** -> Import your repo.
4. **Framework Preset**: Vite (should auto-detect).
5. **Root Directory**: Click `Edit` and select `client`.
6. **Environment Variables**:
   It is CRITICAL to tell the frontend where the backend lives.
   - Name: `VITE_API_URL`
   - Value: `https://my-api-production.up.railway.app/api` (The URL from Step 2, **with /api appended** if your routes are there. In our `index.ts`, we mounted routes at `/api`, so append `/api`).
7. Click **Deploy**.

---

## 4. Verification
1. Open your Vercel URL.
2. The app should load.
3. Try to book a court. It should succeed.
   - *If it fails*, open Inspector -> Network Tab. Check if the request is going to `localhost` (bad) or your `railway/render` URL (good).
   - If it goes to `localhost`, you did not set `VITE_API_URL` correctly in Vercel. Redeploy after fixing.

---

## Troubleshooting
- **CORS Issues**: If the frontend says "Network Error" or "CORS", go to `server/src/index.ts`. currently `app.use(cors())` allows ALL origins. This is fine for a prototype. For production, you might want to restrict it: `app.use(cors({ origin: 'https://your-vercel-app.vercel.app' }))`.
- **Prisma Errors**: If the server crashes saying it can't find schema, ensure `npx prisma generate` runs during build. You might need to add `"postinstall": "prisma generate"` to your `server/package.json` scripts if the platform doesn't cache it.
  - Recommended: Update `server/package.json` scripts:
    ```json
    "build": "npx prisma generate && tsc"
    ```
