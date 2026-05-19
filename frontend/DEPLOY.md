Deployment notes — frontend
===========================

Purpose
-------
This file explains how to point the frontend to the deployed backend by setting the `REACT_APP_API_URL` environment variable and rebuilding.

Quick steps
-----------

- Set environment variable `REACT_APP_API_URL` to `https://its-backend-egsg.onrender.com` in your hosting provider (Render, Vercel, Netlify, etc.).
- Rebuild and redeploy the frontend after adding the variable:

```bash
cd frontend
npm install
npm run build
``` 

- Deploy the produced build according to your hosting provider's instructions.

Examples (UI)
-------------
- Render: Project → Environment → Add Environment Variable → `REACT_APP_API_URL` = `https://its-backend-egsg.onrender.com` → Redeploy
- Vercel: Project Settings → Environment Variables → Add → Redeploy
- Netlify: Site settings → Build & deploy → Environment → Add variable → Redeploy

Local development
-----------------
Create a `.env` file inside the `frontend` folder with:

```
REACT_APP_API_URL=https://its-backend-egsg.onrender.com
```
Then run `npm start`.

Notes
-----
- The frontend already falls back to `https://its-backend-egsg.onrender.com` when `REACT_APP_API_URL` is not set. See `frontend/src/api/client.js` for details.
- After changing environment variables you must rebuild/redeploy the frontend for changes to take effect.
