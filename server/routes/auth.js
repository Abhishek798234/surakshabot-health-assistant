const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OTP = require('../models/OTP');

// Email transporter setup for Render cloud hosting
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 120000,
  greetingTimeout: 60000,
  socketTimeout: 120000,
  pool: true,
  maxConnections: 1,
  rateDelta: 20000,
  rateLimit: 5,
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  debug: true
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Verify transporter connection with retry
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('SMTP server is ready to take our messages');
  } catch (error) {
    console.log('SMTP connection error:', error.message);
    console.log('Retrying SMTP connection in 5 seconds...');
    setTimeout(verifyConnection, 5000);
  }
};

verifyConnection();

// Send OTP to email
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Find user by phone
    const user = await User.findOne({ phone: cleanPhone });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Phone number not registered. Please register first.' 
      });
    }
    
    if (!user.email) {
      return res.status(400).json({ 
        success: false, 
        error: 'No email associated with this phone number.' 
      });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    // Save OTP to database
    await OTP.findOneAndUpdate(
      { phone: cleanPhone },
      { 
        phone: cleanPhone,
        email: user.email,
        otp: otp,
        expiresAt: expiresAt,
        verified: false
      },
      { upsert: true, new: true }
    );
    
    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Surakshabot Login OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Surakshabot Login Verification</h2>
          <p>Hello ${user.name},</p>
          <p>Your OTP for login is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #6366f1; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <br>
          <p>Best regards,<br>Surakshabot Team</p>
        </div>
      `
    };
    
    // Send email with retry logic
    let emailSent = false;
    let retryCount = 0;
    const maxRetries = 3;

    while (!emailSent && retryCount < maxRetries) {
      try {
        await transporter.sendMail(mailOptions);
        emailSent = true;
        console.log(`OTP email sent successfully to ${user.email} for phone ${cleanPhone}`);
      } catch (emailError) {
        retryCount++;
        console.error(`Email send attempt ${retryCount} failed for ${user.email}:`, emailError.message);
        console.error('Email error details:', emailError);

        if (retryCount >= maxRetries) {
          console.error(`Failed to send OTP email after ${maxRetries} attempts to ${user.email}`);
          throw emailError;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
      }
    }
    
    res.json({ 
      success: true, 
      message: `OTP sent to ${user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`,
      email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    });
    
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send OTP. Please try again.' 
    });
  }
});

// Verify OTP and login
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Find OTP record
    const otpRecord = await OTP.findOne({ 
      phone: cleanPhone, 
      otp: otp,
      verified: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired OTP' 
      });
    }
    
    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();
    
    // Get user data
    const user = await User.findOne({ phone: cleanPhone });
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        name: user.name,
        phone: user.phone,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Verification failed. Please try again.' 
    });
  }
});

module.exports = router;