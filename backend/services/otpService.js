const { Resend } = require('resend');
const { authenticator } = require('otplib');
const crypto = require('crypto');

class OTPService {
  constructor() {
    // Initialize Resend with API key
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your-resend-api-key') {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    } else {
      this.resend = null;
    }
  }

  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Get OTP expiry time (5 minutes from now)
  getOTPExpiry() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now;
  }

  // Send OTP via email
  async sendEmailOTP(email, otp, purpose = 'verification') {
    // Check if Resend is configured
    if (!this.resend || !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key') {
      console.log('⚠️  RESEND NOT CONFIGURED - EMAIL OTP:', {
        email: email,
        otp: otp,
        purpose: purpose,
        message: 'Please configure RESEND_API_KEY in .env file'
      });
      return {
        success: false,
        message: 'Email service not configured - check console for OTP',
        debug: `Email OTP for ${email}: ${otp}`
      };
    }

    try {
      const result = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: email,
        subject: `YAATRA - Your OTP for ${purpose}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>YAATRA - OTP Verification</h2>
            <p>Your OTP for ${purpose} is:</p>
            <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
          </div>
        `
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return { success: true, message: 'OTP sent to email successfully' };
    } catch (error) {
      console.error('❌ Email OTP send error:', error.message);
      console.log('📧 EMAIL OTP (sent to console due to error):', {
        email: email,
        otp: otp,
        purpose: purpose,
        error: error.message
      });
      return {
        success: false,
        message: 'Failed to send email OTP - check console for OTP',
        debug: `Email OTP for ${email}: ${otp}`
      };
    }
  }

  // Send OTP via SMS (placeholder - integrate with SMS service like Twilio)
  async sendPhoneOTP(phone, otp, purpose = 'verification') {
    // TODO: Integrate with SMS service like Twilio
    // For now, we'll just log the OTP (in production, replace with actual SMS service)
    console.log('📱 PHONE OTP (SMS Service Not Configured):', {
      phone: phone,
      otp: otp,
      purpose: purpose,
      message: 'SMS integration pending - Using console output for testing'
    });
    
    // Simulate SMS sending delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          message: 'OTP logged to console (SMS service not configured)',
          note: 'SMS integration pending - check console for OTP',
          debug: `Phone OTP for ${phone}: ${otp}`
        });
      }, 1000);
    });
  }

  // Verify if OTP is valid and not expired
  isOTPValid(storedOTP, providedOTP, expiryTime) {
    if (!storedOTP || !providedOTP) {
      return false;
    }
    
    const now = new Date();
    const expiry = new Date(expiryTime);
    
    return storedOTP === providedOTP && now <= expiry;
  }

  // Clear OTP after successful verification
  clearOTP(type) {
    if (type === 'email') {
      return {
        email_otp: null,
        email_otp_expires_at: null
      };
    } else if (type === 'phone') {
      return {
        phone_otp: null,
        phone_otp_expires_at: null
      };
    }
    return {};
  }
}

module.exports = new OTPService();