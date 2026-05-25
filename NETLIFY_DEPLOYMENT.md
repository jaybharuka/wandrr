# Netlify + Render Deployment Guide for Wandrr

Deploy your frontend to **Netlify** (fast, free) and backend to **Render** (free tier).

## Architecture

```
GitHub (wandrr repo)
  ├── Netlify (Frontend) ← frontend/dist
  └── Render (Backend) ← backend/ + PostgreSQL
```

---

## Part 1: Deploy Backend to Render

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended)
3. Grant Render access to your repositories

### Step 2: Create PostgreSQL Database

1. Dashboard → **New** → **PostgreSQL**
2. Name: `wandrr-db`
3. Region: Pick closest to you
4. Plan: **Free** ($0/month)
5. Click **Create Database**
6. Copy the **Internal Database URL** — you'll need this

### Step 3: Create Backend Service

1. Dashboard → **New** → **Web Service**
2. Select your **wandrr** repository
3. **Branch**: `master`
4. **Name**: `wandrr-api`
5. **Runtime**: `Node`
6. **Build Command**: 
   ```
   npm install --prefix backend
   ```
7. **Start Command**: 
   ```
   node backend/server.js
   ```
8. **Plan**: **Free** ($0/month)
9. Click **Create Web Service**

### Step 4: Set Environment Variables

In Render dashboard for your service:

1. Go to **Environment** (on the left sidebar)
2. Add these variables:
   ```
   DATABASE_URL = (paste your PostgreSQL URL from step 2)
   EMAIL_USER = your-gmail@gmail.com
   EMAIL_PASS = your-gmail-app-password
   DUFFEL_API_KEY = your_duffel_api_key
   GEMINI_API_KEY = your_gemini_api_key
   PORT = 5000
   NODE_ENV = production
   ```
3. Click **Save**

### Step 5: Initialize Database

After backend deploys:

1. In Render, go to your PostgreSQL database
2. Click **Connect** → **External Connection**
3. Use a SQL client (e.g., DBeaver, pgAdmin) to connect
4. Run these SQL files:
   - `backend/config/setup.sql` (creates tables)
   - `backend/config/hotels_seed.sql` (seeds hotel data)

Or via command line:
```bash
psql <DATABASE_URL> -f backend/config/setup.sql
psql <DATABASE_URL> -f backend/config/hotels_seed.sql
```

### Step 6: Get Backend URL

After deployment succeeds, Render gives you a URL like:
```
https://wandrr-api.onrender.com
```

Copy this — you'll need it for Netlify.

---

## Part 2: Deploy Frontend to Netlify

### Step 1: Create Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Authorize Netlify to access your repositories

### Step 2: Connect Repository

1. Dashboard → **Add new site** → **Import an existing project**
2. Select **GitHub**
3. Search for **wandrr** repository
4. Click **Install** (if first time)
5. Select **wandrr** repo
6. **Branch to deploy**: `master`
7. Click **Deploy site**

### Step 3: Update netlify.toml

Edit `netlify.toml` in your repo root and update the backend URL:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://wandrr-api.onrender.com/api/:splat"
  status = 200
  force = true
```

Replace `wandrr-api.onrender.com` with your actual Render backend URL.

### Step 4: Push to GitHub

```bash
git add netlify.toml
git commit -m "update: Configure Netlify to use Render backend"
git push origin master
```

Netlify automatically redeploys on push.

### Step 5: Test Deployment

1. Your frontend is live at: `https://wandrr.netlify.app` (or custom domain)
2. API calls route to: `https://wandrr-api.onrender.com/api/*`
3. Open your Netlify URL and test the app

---

## Environment Variables Summary

### Backend (Render)
```
DATABASE_URL = postgresql://...
EMAIL_USER = your-gmail@gmail.com
EMAIL_PASS = your-gmail-app-password
DUFFEL_API_KEY = your_key
GEMINI_API_KEY = your_key
PORT = 5000
NODE_ENV = production
```

### Frontend (Netlify)
No environment variables needed — all API URLs are hardcoded in `netlify.toml`

---

## Troubleshooting

### Frontend builds but shows blank page
- Check Netlify logs: Dashboard → **Deploys** → **Deploy logs**
- Ensure `netlify.toml` exists in root
- Check build command: should output to `frontend/dist`

### API calls fail with CORS error
- Backend must have `CORS` enabled (it does in your code)
- Check that API URL in `netlify.toml` is correct
- Verify backend is running on Render

### Backend deploy fails
- Check Render logs: Service → **Logs**
- Verify all environment variables are set
- Ensure PostgreSQL database is created and URL is correct

### Database connection error
- Test connection URL manually with psql
- Ensure database exists and user has permissions
- Check that `DATABASE_URL` is set in Render

### Emails not sending
- Verify `EMAIL_USER` and `EMAIL_PASS` are correct
- Generate [Gmail App Password](https://support.google.com/accounts/answer/185833) (not regular password)
- Enable "Less secure app access" if not using App Password

---

## Monitoring

### Netlify
- **Dashboard**: Monitor build status, logs, analytics
- **Speedbot**: Automatic performance suggestions
- **Analytics**: Page views, user sessions

### Render
- **Logs**: Real-time backend logs
- **Metrics**: CPU, Memory, Network usage
- **Auto-deploy**: Redeploys on every push to `master`

---

## Custom Domain

### Netlify
1. Domain Settings → Add Custom Domain
2. Update DNS records at your registrar
3. Netlify provides free SSL certificate

### Render
1. Backend Service → Settings → Custom Domain
2. Update DNS records
3. Same SSL certificate from Netlify proxy

---

## Scaling (Future)

### When free tier isn't enough:

**Netlify Pro**: $19/month (more build minutes, better analytics)

**Render Paid**: $7/month (0.5 CPU, 1GB RAM) — still very affordable

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Initialize database
3. ✅ Deploy frontend to Netlify
4. ✅ Test API connectivity
5. 📱 Share your live app!

---

**Your Live App**: https://wandrr.netlify.app  
**Backend API**: https://wandrr-api.onrender.com

Enjoy! 🚀
