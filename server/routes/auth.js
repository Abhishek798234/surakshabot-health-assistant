const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OTP = require('../models/OTP');

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

console.log('✅ Gmail SMTP configured for OTP sending');



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
    
    // Send OTP via Gmail SMTP
    try {
      const mailOptions = {
        from: `"Surakshabot" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Surakshabot Login OTP',
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
      
      console.log('📧 Sending OTP email to:', user.email);
      await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully');
      
      res.json({
        success: true,
        message: `OTP sent to ${user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`,
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      });
      
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      
      // Fallback: return OTP in response
      res.json({
        success: true,
        message: `Email failed. Your OTP: ${otp}`,
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