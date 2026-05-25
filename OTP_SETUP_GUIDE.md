# OTP-Based Authentication Setup Guide

## Overview
The authentication system has been updated to use OTP (One-Time Password) verification for both signup and signin processes. Users now need to verify both their email and phone number during signup, and can signin using either email or phone with OTP verification.

## Features Implemented

### 1. Signup Flow
- User enters name, phone number, and email
- System sends OTP to both email and phone
- User must verify both OTPs to complete signup
- Users are marked as verified only after successful OTP verification

### 2. Signin Flow
- User can signin with either phone number OR email
- System sends OTP to the provided contact method
- User verifies OTP to complete signin
- No password required - completely OTP-based

## Database Changes

### New Columns Added to `users` table:
```sql
- email_otp VARCHAR(6) - Stores email OTP
- phone_otp VARCHAR(6) - Stores phone OTP  
- email_otp_expires_at TIMESTAMP - Email OTP expiry time
- phone_otp_expires_at TIMESTAMP - Phone OTP expiry time
- email_verified BOOLEAN - Email verification status
- phone_verified BOOLEAN - Phone verification status
- is_verified BOOLEAN - Overall verification status
```

### To apply database changes:
1. Connect to your MySQL database
2. Run the SQL script: `backend/config/otp_schema.sql`

## Backend Changes

### New API Endpoints:

#### Signup Endpoints:
- `POST /api/auth/signup/initiate` - Start signup process, send OTPs
- `POST /api/auth/signup/verify` - Verify OTPs and complete signup

#### Signin Endpoints:
- `POST /api/auth/signin/initiate` - Send OTP for signin
- `POST /api/auth/signin/verify` - Verify OTP and complete signin

#### Legacy Endpoints (maintained for compatibility):
- `POST /api/auth/signup` - Original signup (no OTP)
- `POST /api/auth/signin` - Original signin (no OTP)

### New Services:
- `backend/services/otpService.js` - Handles OTP generation and email/SMS sending

## Frontend Changes

### SignUpPage Updates:
- Two-step process: Details entry → OTP verification
- Real-time validation for phone and email formats
- OTP input fields with automatic number-only filtering
- Resend OTP functionality
- Visual feedback for OTP sending status

### SignInPage Updates:
- Two-step process: Contact entry → OTP verification  
- Support for both phone and email signin
- Dynamic OTP type detection
- Resend OTP functionality

## Environment Configuration

### Required Environment Variables (.env file):
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
DB_HOST=localhost
DB_USER=root  
DB_PASSWORD=your-db-password
DB_NAME=yaatra
PORT=5000
```

### Gmail Setup:
1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password
3. Use the app password (not your regular Gmail password) in EMAIL_PASS

## Installation & Setup

### 1. Install Dependencies:
```bash
cd backend
npm install nodemailer otplib crypto-js
```

### 2. Environment Setup:
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your actual credentials
```

### 3. Database Setup:
```sql
-- Run this in your MySQL database
SOURCE backend/config/otp_schema.sql;
```

### 4. Start the Application:
```bash
# Backend
cd backend
npm start

# Frontend (in another terminal)
cd frontend  
npm run dev
```

## Testing the Implementation

### Test Signup:
1. Go to signup page
2. Enter name, phone (+91XXXXXXXXXX format), and email
3. Click "Send OTPs & Continue"
4. Check email for OTP (phone OTP will be logged to console for now)
5. Enter both OTPs and click "Verify & Sign Up"

### Test Signin:
1. Go to signin page
2. Enter either phone number OR email (not both)
3. Click "Send OTP"
4. Check email/console for OTP
5. Enter OTP and click "Sign In"

## SMS Integration (Future)

Currently, phone OTPs are logged to the console. To implement actual SMS:

1. Sign up for Twilio account
2. Add Twilio credentials to .env
3. Update `otpService.js` to use Twilio API instead of console.log

## Security Features

- OTPs expire after 5 minutes
- 6-digit numeric OTPs for better security
- OTPs are cleared after successful verification
- Rate limiting can be added to prevent OTP spam
- Input validation on both frontend and backend

## Error Handling

- Network error handling with user-friendly messages
- Invalid OTP format validation
- Expired OTP detection
- Duplicate registration prevention
- Missing field validation

## Troubleshooting

### Common Issues:

1. **Email OTP not received**:
   - Check spam folder
   - Verify Gmail app password setup
   - Check console for email service errors

2. **Phone OTP not working**:
   - Currently logged to backend console
   - Check terminal running the backend server

3. **Database errors**:
   - Ensure otp_schema.sql has been applied
   - Check database connection credentials

4. **OTP expired errors**:
   - OTPs expire after 5 minutes
   - Use "Resend OTP" button to get new OTP

## Future Enhancements

1. SMS integration with Twilio
2. Rate limiting for OTP requests
3. Backup authentication methods
4. OTP attempt limiting
5. Advanced logging and monitoring
6. Push notification OTPs
7. Biometric authentication fallback