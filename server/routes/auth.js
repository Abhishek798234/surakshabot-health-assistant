const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OTP = require('../models/OTP');

// Multi-provider SMTP configuration
const createTransporter = () => {
  // Try Outlook first (more reliable on cloud platforms)
  if (process.env.SMTP_HOST === 'smtp-mail.outlook.com') {
    return nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });
  }
  
  // Fallback to Gmail
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const transporter = createTransporter();

// Test SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP Error:', error.message);
  } else {
    console.log('✅ SMTP Server ready');
  }
});

console.log('✅ SMTP configured for OTP sending:', process.env.SMTP_HOST || 'smtp-mail.outlook.com');

// Test SMTP endpoint
router.get('/test-smtp', async (req, res) => {
  try {
    console.log('🧪 Testing SMTP connection...');
    await transporter.verify();
    
    res.json({
      success: true,
      message: 'SMTP connection successful',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        user: process.env.SMTP_USER,
        passSet: !!process.env.SMTP_PASS
      }
    });
  } catch (error) {
    console.error('❌ SMTP test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }
});



// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};



// Send OTP to email
router.post('/send-otp', async (req, res) => {
  console.log('📱 Send OTP request:', req.body);
  
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number is required.' 
      });
    }
    
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    console.log('🔍 Looking for user with phone:', cleanPhone);
    
    let user = await User.findOne({ phone: cleanPhone });
    console.log('👤 User found:', user ? `Yes - ${user.name}` : 'No');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Phone number not registered. Please register first with your email address.' 
      });
    }
    
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
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
    
    console.log('🔐 Generated OTP:', otp);
    
    // Check SMTP configuration
    console.log('📧 SMTP Config Check:');
    console.log('SMTP_USER:', process.env.SMTP_USER ? 'Set' : 'Missing');
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'Set' : 'Missing');
    
    // Send OTP via Gmail SMTP
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: user.email,
        subject: 'Surakshabot Login OTP',
        text: `Hello ${user.name}, Your OTP for Surakshabot login is: ${otp}. This OTP will expire in 5 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #6366f1; text-align: center;">Surakshabot Login OTP</h2>
            <p>Hello ${user.name},</p>
            <p>Your OTP for login is:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h1 style="color: #6366f1; font-size: 32px; margin: 0; letter-spacing: 3px;">${otp}</h1>
            </div>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>Surakshabot Team</p>
          </div>
        `
      };
      
      console.log('📧 Attempting to send email to:', user.email);
      console.log('📧 From address:', process.env.SMTP_USER);
      
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully. Message ID:', info.messageId);
      
      res.json({
        success: true,
        message: `OTP sent to ${user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`,
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      });
      
    } catch (emailError) {
      console.error('❌ Email sending failed:');
      console.error('Error code:', emailError.code);
      console.error('Error message:', emailError.message);
      console.error('Error response:', emailError.response);
      
      // Fallback: return OTP in response
      res.json({
        success: true,
        message: `Email failed (${emailError.code || 'SMTP_ERROR'}). Your OTP: ${otp}`,
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        otp: otp,
        emailError: emailError.message
      });
    }
    
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// Verify OTP and login
router.post('/verify-otp', async (req, res) => {
  console.log('🔐 Verify OTP request:', req.body);
  
  try {
    const { phone, otp } = req.body;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    console.log('🔍 Looking for OTP record for phone:', cleanPhone, 'OTP:', otp);
    
    const otpRecord = await OTP.findOne({ 
      phone: cleanPhone, 
      otp: otp,
      verified: false,
      expiresAt: { $gt: new Date() }
    });
    
    console.log('📄 OTP record found:', otpRecord ? 'Yes' : 'No');
    
    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired OTP' 
      });
    }
    
    otpRecord.verified = true;
    await otpRecord.save();
    
    const user = await User.findOne({ phone: cleanPhone });
    
    console.log('✅ Login successful for:', user.name);
    
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
    console.error('❌ Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Verification failed. Please try again.' 
    });
  }
});

module.exports = router;