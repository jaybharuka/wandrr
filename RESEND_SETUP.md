# Resend Email Service Setup

## Overview

We use Resend for sending OTP emails. Resend is a modern email API built for developers with a clean API and excellent documentation.

## Why Resend?

- **REST API**: Works on all cloud platforms (Render, Heroku, etc.)
- **Free tier**: 100 emails/day (plenty for testing)
- **Fast setup**: Simplest email service to configure
- **Developer-friendly**: Clean API, great docs
- **Reliable**: Built-in email verification, bounce handling

## Setup Steps

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Click **Sign Up** (top right)
3. Sign up with your email (jaybharuka7@gmail.com)
4. Verify your email
5. Create your account

### 2. Get Your API Key

1. Go to [resend.com/api-keys](https://resend.com/api-keys)
2. Click **Create API Key**
3. Name it: `getlost-app`
4. Copy the API key (starts with `re_`)

### 3. Configure Environment Variables

Add these to your `.env` file:

```env
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**For local development:**
- `RESEND_API_KEY`: Paste the key from step 2
- `RESEND_FROM_EMAIL`: Use the default `onboarding@resend.dev` (sandbox domain for testing)

**For production/custom domain:**
- Update `RESEND_FROM_EMAIL` after you verify a custom domain in Resend dashboard

**For Render deployment:**
1. Go to [render.com](https://render.com)
2. Open your backend service
3. **Settings** → **Environment**
4. Add:
   - `RESEND_API_KEY` = (your API key)
   - `RESEND_FROM_EMAIL` = `onboarding@resend.dev` (or your verified domain)
5. Deploy

### 4. (Optional) Add Custom Domain

For production, verify your own domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Add your domain (e.g., `noreply@yourdomain.com`)
4. Follow the DNS verification steps
5. Update `RESEND_FROM_EMAIL` in `.env`

For testing, the default `onboarding@resend.dev` works fine.

## Environment Variables

| Variable | Value | Example |
|----------|-------|---------|
| `RESEND_API_KEY` | Your API key from Resend | `re_abc123xyz...` |
| `RESEND_FROM_EMAIL` | Email to send from | `onboarding@resend.dev` |

## Testing

1. Start your backend: `npm start`
2. Use the signup endpoint to request an OTP
3. Check your inbox for the OTP email
4. (Optional) Check Resend dashboard **Emails** tab to see delivery status

### Common Issues

**Email not received?**
- Check spam folder first
- Verify API key is set correctly
- Ensure backend was restarted after adding `.env` variables
- Check Resend dashboard for delivery failures

**"RESEND NOT CONFIGURED" error?**
- Restart the server after adding to `.env`
- Verify variable name is exactly `RESEND_API_KEY`
- Check for extra spaces in the API key

**Can't log in to Resend?**
- Resend requires email verification
- Check your email for verification link from Resend

## Cost

- **Free tier**: 100 emails/day (perfect for testing)
- **Paid plan**: $20/month for unlimited emails

## Troubleshooting

1. Check backend console for error messages
2. Verify API key in Resend dashboard (resend.com/api-keys)
3. Ensure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set
4. Restart backend service
5. Check Resend **Emails** dashboard for delivery status

## Production Checklist

Before deploying to production:

- [ ] Create Resend account (free)
- [ ] Generate API key
- [ ] Set `RESEND_API_KEY` in Render environment
- [ ] Set `RESEND_FROM_EMAIL` in Render environment
- [ ] (Recommended) Verify a custom domain
- [ ] Test signup flow end-to-end
- [ ] Monitor Resend Emails dashboard for first few days

## Support

- Resend Docs: https://resend.com/docs
- Resend Support: support@resend.com
- Status: https://resend.com/status
