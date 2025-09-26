const express = require('express');
const router = express.Router();
const emailjs = require('@emailjs/nodejs');
const User = require('../models/User');
const OTP = require('../models/OTP');

// EmailJS configuration
const emailConfig = {
  serviceId: process.env.EMAILJS_SERVICE_ID || 'service_surakshabot',
  templateId: process.env.EMAILJS_TEMPLATE_ID || 'template_otp',
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY
};

console.log('✅ EmailJS configured for OTP sending');

// Test EmailJS connection
router.get('/test-email', async (req, res) => {
  try {
    const testParams = {
      to_email: 'test@example.com',
      to_name: 'Test User',
      otp_code: '123456',
      from_name: 'Surakshabot Team'
    };
    
    console.log('🧪 Testing EmailJS configuration...');
    console.log('Service ID:', emailConfig.serviceId);
    console.log('Template ID:', emailConfig.templateId);
    console.log('Public Key:', emailConfig.publicKey ? 'Present' : 'Missing');
    console.log('Private Key:', emailConfig.privateKey ? 'Present' : 'Missing');
    
    res.json({
      success: true,
      message: 'EmailJS configuration check',
      config: {
        serviceId: emailConfig.serviceId,
        templateId: emailConfig.templateId,
        publicKeySet: !!emailConfig.publicKey,
        privateKeySet: !!emailConfig.privateKey
      }
    });
    
  } catch (error) {
    console.error('❌ EmailJS test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
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
    
    // Check EmailJS configuration
    console.log('📧 EmailJS config check:');
    console.log('Service ID:', emailConfig.serviceId ? 'Set' : 'Missing');
    console.log('Template ID:', emailConfig.templateId ? 'Set' : 'Missing');
    console.log('Public Key:', emailConfig.publicKey ? 'Set' : 'Missing');
    console.log('Private Key:', emailConfig.privateKey ? 'Set' : 'Missing');
    
    // Send OTP via EmailJS
    try {
      const templateParams = {
        to_email: user.email,
        to_name: user.name,
        otp_code: otp,
        from_name: 'Surakshabot Team'
      };
      
      console.log('📧 Sending OTP email via EmailJS to:', user.email);
      
      const response = await emailjs.send(
        emailConfig.serviceId,
        emailConfig.templateId,
        templateParams,
        {
          publicKey: emailConfig.publicKey,
          privateKey: emailConfig.privateKey
        }
      );
      
      console.log('✅ Email sent successfully via EmailJS:', response.status);
      
      res.json({
        success: true,
        message: `OTP sent to ${user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`,
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      });
      
    } catch (emailError) {
      console.error('❌ EmailJS sending failed:', emailError);
      
      // Fallback: return OTP in response
      res.json({
        success: true,
        message: `Email service unavailable. Your OTP: ${otp}`,
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        otp: otp,
        note: 'Use the OTP above to login'
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