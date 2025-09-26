const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OTP = require('../models/OTP');

// Email transporter setup - multiple fallback configurations
const createTransporter = () => {
  // Primary: Gmail service
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    pool: false,
    maxConnections: 1,
    rateDelta: 20000,
    rateLimit: 5
  });
};

const createBackupTransporter = () => {
  // Backup: Direct SMTP
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const transporter = createTransporter();

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
    
    // Send OTP via email with multiple attempts
    let emailSent = false;
    let finalResponse;
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Surakshabot Login OTP',
        text: `Your OTP for Surakshabot login is: ${otp}. This OTP will expire in 5 minutes.`,
        html: `<h2>Surakshabot Login OTP</h2><p>Hello ${user.name},</p><p>Your OTP is: <strong>${otp}</strong></p><p>This OTP will expire in 5 minutes.</p>`
      };
      
      // Try primary transporter
      try {
        console.log('📧 Attempting primary email send to:', user.email);
        await transporter.sendMail(mailOptions);
        console.log('✅ Primary email sent successfully');
        emailSent = true;
      } catch (primaryError) {
        console.error('❌ Primary email failed:', primaryError.message);
        
        // Try backup transporter
        try {
          console.log('🔄 Trying backup SMTP...');
          const backupTransporter = createBackupTransporter();
          await backupTransporter.sendMail(mailOptions);
          console.log('✅ Backup email sent successfully');
          emailSent = true;
        } catch (backupError) {
          console.error('❌ Backup email failed:', backupError.message);
          
          // Try simple configuration
          try {
            console.log('🔄 Trying simple SMTP...');
            const simpleTransporter = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 465,
              secure: true,
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
              }
            });
            
            await simpleTransporter.sendMail({
              from: process.env.EMAIL_USER,
              to: user.email,
              subject: 'OTP',
              text: `Your OTP: ${otp}`
            });
            console.log('✅ Simple email sent successfully');
            emailSent = true;
          } catch (simpleError) {
            console.error('❌ All email methods failed:', simpleError.message);
          }
        }
      }
    }
    
    // Send response based on email success
    if (emailSent) {
      finalResponse = {
        success: true,
        message: `OTP sent to ${user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`,
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      };
    } else {
      console.log('⚠️ Email failed, returning OTP directly');
      finalResponse = {
        success: true,
        message: `Email unavailable. Your OTP: ${otp}`,
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        otp: otp,
        emailFailed: true
      };
    }
    
    res.json(finalResponse);
    
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