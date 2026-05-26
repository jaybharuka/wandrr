const { Resend } = require('resend');
const { authenticator } = require('otplib');
const crypto = require('crypto');

class OTPService {
  constructor() {
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your-resend-api-key') {
      this.resend = new Resend(process.env.RESEND_API_KEY);
      console.log('✅ Resend initialized with API key:', process.env.RESEND_API_KEY.substring(0, 10) + '...');
    } else {
      this.resend = null;
    }
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  getOTPExpiry() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now;
  }

  async sendEmailOTP(email, otp, purpose = 'verification') {
    if (!this.resend || !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key') {
      console.log('⚠️  RESEND NOT CONFIGURED - EMAIL OTP:', {
        email: email,
        otp: otp,
        purpose: purpose,
        message: 'Please configure RESEND_API_KEY in .env file'
      });
      return {
        success: false,
        message: 'Email service not configured',
        debug: `Email OTP for ${email}: ${otp}`
      };
    }

    try {
      console.log('📧 Attempting to send email via Resend to:', email);
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

      console.log('📧 Resend response:', { id: result.id, error: result.error });

      if (result.error) {
        throw new Error(result.error.message);
      }

      console.log('✅ Email sent successfully via Resend');
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
        message: 'Failed to send email OTP',
        debug: `Email OTP for ${email}: ${otp}`
      };
    }
  }

  async sendPhoneOTP(phone, otp, purpose = 'verification') {
    console.log('📱 PHONE OTP (SMS Service Not Configured):', {
      phone: phone,
      otp: otp,
      purpose: purpose,
      message: 'SMS integration pending'
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'OTP logged to console',
          debug: `Phone OTP for ${phone}: ${otp}`
        });
      }, 1000);
    });
  }

  isOTPValid(storedOTP, providedOTP, expiryTime) {
    if (!storedOTP || !providedOTP) {
      return false;
    }

    const now = new Date();
    const expiry = new Date(expiryTime);

    return storedOTP === providedOTP && now <= expiry;
  }

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
