# Deployment Guide: Prometheus SEO Suite

## Frontend (Vercel)
1. Push to GitHub.
2. Import project in Vercel.
3. Root Directory: `frontend`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   - `VITE_API_BASE_URL`: URL of your deployed backend.

## Backend (Railway)
1. Push to GitHub.
2. Create new project in Railway -> Deploy from GitHub repo.
3. Root Directory: `backend`
4. Environment Variables:
   - `GOOGLE_API_KEY`: Your Gemini API Key.
   - `DATAFORSEO_LOGIN`: Your DataForSEO login.
   - `DATAFORSEO_PASSWORD`: Your DataForSEO password.
   - `PORT`: 8000 (Railway handles this).

## Custom Domain
- Point `app.lefrog.io` (CNAME) to the Vercel deployment URL.
