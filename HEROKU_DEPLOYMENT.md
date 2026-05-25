# Heroku Deployment Guide for Wandrr

This guide walks you through deploying Wandrr to Heroku.

## Prerequisites

1. **Heroku Account**: Sign up at [heroku.com](https://www.heroku.com)
2. **Heroku CLI**: Install from [heroku.com/cli](https://devcenter.heroku.com/articles/heroku-cli)
3. **GitHub**: Your code must be pushed to GitHub (already done: https://github.com/jaybharuka/wandrr)

## Step 1: Install Heroku CLI

**Windows:**
```bash
# Download and run the installer from https://cli-assets.heroku.com/heroku-x86_64-windows.exe
# Or use Chocolatey:
choco install heroku-cli
```

**macOS:**
```bash
brew install heroku/brew/heroku
```

**Linux:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

Verify installation:
```bash
heroku --version
```

## Step 2: Login to Heroku

```bash
heroku login
```

This opens your browser to authenticate. After logging in, return to terminal.

## Step 3: Create Heroku App

```bash
cd path/to/wandrr
heroku create wandrr-app
```

Replace `wandrr-app` with your desired app name (must be unique on Heroku).

## Step 4: Set Environment Variables

Set all required environment variables on Heroku:

```bash
heroku config:set DATABASE_URL="postgresql://user:password@host:5432/wandrr"
heroku config:set EMAIL_USER="your-gmail@gmail.com"
heroku config:set EMAIL_PASS="your-gmail-app-password"
heroku config:set DUFFEL_API_KEY="your_duffel_api_key"
heroku config:set GEMINI_API_KEY="your_gemini_api_key"
```

**For PostgreSQL Database:**

Option A: Use Heroku Postgres (free tier available)
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

This will automatically set `DATABASE_URL`.

Option B: Use external PostgreSQL (e.g., AWS RDS, Railway, etc.)
Just set the `DATABASE_URL` config variable above.

## Step 5: Deploy

### Option A: Direct Push (if you have Heroku CLI)

```bash
git push heroku master
```

### Option B: Connect GitHub (Recommended)

1. Go to [Heroku Dashboard](https://dashboard.heroku.com/apps)
2. Select your app
3. Go to "Deploy" tab
4. Click "Connect to GitHub"
5. Search for "wandrr" repository
6. Click "Connect"
7. Under "Manual Deploy", click "Deploy Branch"

## Step 6: Run Database Migrations

After deployment, initialize the database:

```bash
heroku run bash
# In the Heroku bash shell:
cd backend/config
psql $DATABASE_URL -f setup.sql
psql $DATABASE_URL -f hotels_seed.sql
exit
```

Or use a SQL client to connect to your Heroku PostgreSQL database and run the SQL files.

## Step 7: View Logs

Monitor your app:

```bash
heroku logs --tail
```

## Step 8: Open App

```bash
heroku open
```

This opens your app in the browser at `https://wandrr-app.herokuapp.com`

## Troubleshooting

### Build Fails

Check logs:
```bash
heroku logs --tail
```

Common issues:
- Missing environment variables
- Database connection error
- Missing Node modules

### Database Connection Error

Verify DATABASE_URL:
```bash
heroku config:get DATABASE_URL
```

### Frontend not loading

Make sure frontend is built before deployment. The `package.json` postinstall script handles this automatically.

### Hot-reload not working

This is normal — Heroku deploys the production build. For development, use:
```bash
npm run dev  # Local development with hot-reload
```

## Scaling

To upgrade your app tier (after launch):

```bash
heroku dyno:type standard-1x --app=wandrr-app
```

## Useful Commands

```bash
# View config variables
heroku config --app=wandrr-app

# View app info
heroku apps:info --app=wandrr-app

# Restart app
heroku restart --app=wandrr-app

# View database
heroku pg:psql --app=wandrr-app

# Check build status
heroku builds --app=wandrr-app
```

## Monitoring & Maintenance

1. **Logs**: Use `heroku logs --tail` to monitor errors
2. **Metrics**: Heroku Dashboard shows CPU, Memory, Requests/sec
3. **Alerts**: Set up email alerts in Dashboard → Settings
4. **Database**: Regular backups available via Heroku Postgres settings

## Next Steps

- Set up custom domain: `heroku domains:add wandrr.yourdomain.com`
- Enable SSL: Automatically included with Heroku
- Setup CI/CD: Enable automatic deploys on push to `master` branch

---

For more help, see:
- [Heroku Docs](https://devcenter.heroku.com)
- [Heroku PostgreSQL](https://devcenter.heroku.com/articles/heroku-postgresql)
