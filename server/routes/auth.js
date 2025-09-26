const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OTP = require('../models/OTP');

// Email transporter using Gmail SMTP (matching working project)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'surakshabot8@gmail.com',
    pass: process.env.SMTP_PASS || 'fchyaishxyslmhtv'
  }
});

// Test email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error.message);
  } else {
    console.log('✅ Email server is ready to send messages');
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
    
    // Send OTP via email (matching working project flow)
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || '"Suraksha Bot <surakshabot8@gmail.com>"',
        to: user.email,
        subject: 'Surakshabot Login OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">Suraksha Bot</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Health Assistant</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Hello ${user.name},</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.5;">Your OTP for login verification is:</p>
              
              <div style="background: #f8f9fa; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px;">
                <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 5px; font-family: monospace;">${otp}</h1>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.5;">
                <strong>Important:</strong> This OTP will expire in <strong>10 minutes</strong>. 
                Please do not share this code with anyone for your security.
              </p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  If you didn't request this OTP, please ignore this email.
                </p>
                <p style="color: #667eea; font-size: 14px; margin: 10px 0 0 0; font-weight: bold;">
                  Suraksha Bot Team
                </p>
              </div>
            </div>
          </div>
        `
      };
      
      console.log('📧 Sending OTP email to:', user.email);
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully. Message ID:', info.messageId);
      
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