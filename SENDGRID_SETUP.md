# SendGrid Email Service Setup

## Overview

We've switched from Gmail SMTP to SendGrid API for sending OTP emails. This works on cloud platforms like Render, Heroku, and Netlify that block outbound SMTP connections.

## Why SendGrid?

- **No SMTP blocking**: Uses REST API instead of SMTP (works on all cloud platforms)
- **Free tier**: 100 emails/day on free account
- **Reliable delivery**: Professional email service with better deliverability
- **No Gmail limitations**: No app password restrictions or 2FA complications

## Setup Steps

### 1. Create a SendGrid Account

1. Go to [SendGrid.com](https://sendgrid.com)
2. Click **Sign Up** (top right)
3. Fill in your details:
   - Email: Use your email address (jaybharuka7@gmail.com or similar)
   - Password: Create a strong password
4. Verify your email address
5. Complete account setup

### 2. Get Your API Key

1. Log in to SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it: `getlost-app` or similar
5. Select **Full Access** (or at minimum: Mail Send)
6. Click **Create & Continue**
7. **Copy the API key** - you'll only see it once!

### 3. Configure Environment Variables

Add these to your `.env` file:

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@getlost.com
```

**For local development:**
- `SENDGRID_API_KEY`: Paste the key from step 2
- `SENDGRID_FROM_EMAIL`: Can be any domain (getlost.com is used as placeholder)

**For Render deployment:**
1. Log in to [Render.com](https://render.com)
2. Go to your backend service
3. **Settings** → **Environment**
4. Add the same two variables
5. Deploy

### 4. Verify Sender Email (Important for Production)

For production, you may need to verify a sender email:

1. In SendGrid dashboard, go to **Settings** → **Sender Authentication**
2. Choose **Single Sender Verification** (easier)
3. Add sender details (your email)
4. Verify the confirmation email
5. Use that email in `SENDGRID_FROM_EMAIL`

For testing with free tier, you can skip this initially.

## Environment Variables

| Variable | Value | Example |
|----------|-------|---------|
| `SENDGRID_API_KEY` | Your API key from SendGrid | `SG.abc123xyz...` |
| `SENDGRID_FROM_EMAIL` | Email to send from | `noreply@getlost.com` |

## Testing

1. Start your backend: `npm start`
2. Use the signup endpoint to request an OTP
3. Check SendGrid dashboard **Activity** → **Mail** to see if email was sent
4. Check your inbox for the OTP email

### Common Issues

**Email not received?**
- Check SendGrid Activity log in dashboard (Mail tab)
- Check spam folder
- Verify API key is set correctly
- Ensure `SENDGRID_FROM_EMAIL` is configured

**"SENDGRID_API_KEY not configured" error?**
- Restart the server after adding to .env
- Verify the variable is in the correct .env file
- Check for typos in variable name

## Cost

- **Free tier**: 100 emails/day (perfect for testing)
- **Paid plan**: $14.95/month for unlimited emails (when you go live)

## Troubleshooting

If emails still aren't sending:

1. Check backend console for error messages
2. Verify API key in SendGrid settings
3. Check SendGrid Activity log for bounces/errors
4. Ensure `SENDGRID_FROM_EMAIL` is set
5. Restart backend service

## Production Checklist

Before deploying to production:

- [ ] Create SendGrid account
- [ ] Generate API key
- [ ] Set `SENDGRID_API_KEY` in Render/Heroku environment
- [ ] Set `SENDGRID_FROM_EMAIL` in Render/Heroku environment
- [ ] Verify sender email in SendGrid (optional but recommended)
- [ ] Test signup flow end-to-end
- [ ] Monitor SendGrid Activity dashboard for first few days
- [ ] Upgrade to paid plan when needed (if exceeding 100 emails/day)

## Support

- SendGrid Docs: https://docs.sendgrid.com/
- SendGrid Support: support@sendgrid.com
