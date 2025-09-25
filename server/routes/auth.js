const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OTP = require('../models/OTP');

// Email transporter setup - optimized for cloud hosting
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail service instead of manual SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 60000, // Reduced timeout
  greetingTimeout: 30000,
  socketTimeout: 60000,
  pool: false, // Disable connection pooling
  maxConnections: 1,
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// SMTP connection will be verified when needed

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
    
    // Check email configuration
    console.log('📧 Email config check:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Missing');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    
    // Send OTP via email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        // Skip SMTP verification to avoid timeout issues
        console.log('📧 Attempting to send email directly...');
        
        const mailOptions = {
          from: `"Surakshabot" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: 'Surakshabot Login OTP',
          text: `Your OTP for Surakshabot login is: ${otp}. This OTP will expire in 5 minutes.`,
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
        
        console.log('📧 Sending email to:', user.email);
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully. Message ID:', info.messageId);
        
        res.json({ 
          success: true, 
          message: `OTP sent to ${user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`,
          email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
        });
        
      } catch (emailError) {
        console.error('❌ Primary email failed:', emailError.message);
        
        // Try alternative SMTP configuration
        try {
          console.log('🔄 Trying alternative SMTP...');
          const altTransporter = nodemailer.createTransporter({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Use SSL
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            },
            connectionTimeout: 30000,
            socketTimeout: 30000
          });
          
          const simpleMailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Surakshabot OTP',
            text: `Your OTP is: ${otp}. Valid for 5 minutes.`
          };
          
          await altTransporter.sendMail(simpleMailOptions);
          console.log('✅ Alternative email sent successfully');
          
          res.json({ 
            success: true, 
            message: `OTP sent to ${user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`,
            email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
          });
          
        } catch (altError) {
          console.error('❌ Alternative email also failed:', altError.message);
          
          // Final fallback: return OTP in response
          res.json({ 
            success: true, 
            message: `Email service unavailable. Your OTP is: ${otp}`,
            email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
            otp: otp,
            note: 'Please use the OTP shown above'
          });
        }
      }
    } else {
      console.log('⚠️ No email configuration found');
      // No email config, return OTP directly
      res.json({ 
        success: true, 
        message: `OTP: ${otp} (No email config)`,
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        otp: otp
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