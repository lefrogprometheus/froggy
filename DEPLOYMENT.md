# LeFrog.io SaaS Deployment Guide 🐸🚀

This guide explains how to move your SEO Suite from your local environment to **app.lefrog.io**.

## 1. Frontend (The UI)
The production files are ready in: `~/seo-suite/frontend/dist`

### Steps for WPX (app.lefrog.io):
1.  **Create Subdomain**: Ensure `app.lefrog.io` is created in your WPX dashboard.
2.  **Upload Files**: Use FTP or the WPX File Manager to upload everything *inside* the `dist` folder to the root directory of `app.lefrog.io`.
3.  **Verify**: Visit `https://app.lefrog.io` - you should see the Onboarding Suite.

## 2. Backend (The Engine)
Since WPX doesn't support Python (FastAPI), you need to host the API on a cloud provider.

### Recommended: Railway.app (Easiest)
1.  **Create Account**: Sign up at [Railway.app](https://railway.app).
2.  **Upload Backend**: Connect your GitHub repo or use the CLI to upload the `~/seo-suite/backend` folder.
3.  **Variables**: Add your `GOOGLE_API_KEY` to the Railway "Variables" section.
4.  **Connect**: Once Railway gives you a URL (e.g., `lefrog-api.up.railway.app`), update the `API_BASE` in your React code and rebuild.

## 3. Important Notes
- **API URL**: Before you run the final `npm run build`, make sure the `API_BASE` constant in `src/App.tsx` points to your *Live* Railway URL, not `localhost:8000`.
- **CORS**: I've already enabled CORS for all origins, so the live frontend will be able to talk to the live backend.

---
*Guide prepared during the Night Shift by Hermes.* 🌙✨
