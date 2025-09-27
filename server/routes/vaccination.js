const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const cron = require('node-cron');
const Vaccination = require('../models/Vaccination');

// Initialize Twilio client with enhanced logging
let client;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER) {
  try {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio initialized for vaccination reminders');
    console.log('📱 WhatsApp Number:', process.env.TWILIO_WHATSAPP_NUMBER);
  } catch (error) {
    console.error('❌ Twilio initialization failed:', error.message);
  }
} else {
  console.log('⚠️ Twilio disabled - Missing credentials:');
  console.log('ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Missing');
  console.log('AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Missing');
  console.log('WHATSAPP_NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER ? 'Set' : 'Missing');
}

// Format phone number to international format
const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  let cleanPhone = phone.replace(/\D/g, '');
  
  console.log('📞 Original phone:', phone);
  console.log('📞 Clean phone:', cleanPhone);
  
  // If it starts with 0, replace with +91 (India)
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '+91' + cleanPhone.substring(1);
  }
  // If it starts with 91, add +
  else if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    cleanPhone = '+' + cleanPhone;
  }
  // If it doesn't start with +, add +91
  else if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+91' + cleanPhone;
  }
  
  console.log('📞 Formatted phone:', cleanPhone);
  return cleanPhone;
};

// Schedule vaccination reminder
router.post('/schedule', async (req, res) => {
  try {
    const { name, phone, vaccine, dueDate, reminderTime } = req.body;
    
    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);
    console.log('Original phone:', phone, 'Formatted phone:', formattedPhone);
    
    // Create vaccination record
    const vaccination = new Vaccination({
      name,
      phone: formattedPhone,
      vaccine,
      dueDate: new Date(dueDate),
      reminderTime,
      reminderSent: false
    });
    
    await vaccination.save();
    
    // Send immediate WhatsApp confirmation if Twilio is available
    if (client && process.env.TWILIO_WHATSAPP_NUMBER) {
      const confirmationMessage = `✅ Vaccination Reminder Scheduled!

Child: ${name}
Vaccine: ${vaccine}
Due Date: ${new Date(dueDate).toDateString()}
Reminder Time: ${reminderTime}

You will receive a reminder one day before the due date. Please consult with a healthcare provider for proper vaccination guidance.

👨‍⚕️ Surakshabot Health Assistant`;

      try {
        console.log('📤 Attempting WhatsApp send:');
        console.log('From:', process.env.TWILIO_WHATSAPP_NUMBER);
        console.log('To:', `whatsapp:${formattedPhone}`);
        console.log('Message length:', confirmationMessage.length);
        
        const message = await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: `whatsapp:${formattedPhone}`,
          body: confirmationMessage
        });
        console.log('✅ WhatsApp confirmation sent successfully!');
        console.log('Message SID:', message.sid);
        console.log('Status:', message.status);
      } catch (twilioError) {
        console.error('❌ WhatsApp send failed:');
        console.error('Error code:', twilioError.code);
        console.error('Error message:', twilioError.message);
        console.error('More info:', twilioError.moreInfo);
        console.error('Status:', twilioError.status);
        console.error('Full error:', JSON.stringify(twilioError, null, 2));
      }
    } else {
      console.log('⚠️ WhatsApp confirmation skipped:');
      console.log('Client available:', !!client);
      console.log('WhatsApp number set:', !!process.env.TWILIO_WHATSAPP_NUMBER);
      console.log('Account SID:', !!process.env.TWILIO_ACCOUNT_SID);
      console.log('Auth Token:', !!process.env.TWILIO_AUTH_TOKEN);
    }
    
    res.json({ 
      success: true, 
      message: 'Vaccination reminder scheduled and WhatsApp confirmation sent',
      vaccination 
    });
    
  } catch (error) {
    console.error('Vaccination scheduling error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Manual test endpoint for immediate WhatsApp
router.post('/test-immediate', async (req, res) => {
  try {
    const { phone, name, vaccine } = req.body;
    const formattedPhone = formatPhoneNumber(phone);
    
    if (!client) {
      return res.status(400).json({
        success: false,
        error: 'Twilio not configured'
      });
    }
    
    const testMessage = `✅ TEST Vaccination Reminder!

Child: ${name || 'Test Child'}
Vaccine: ${vaccine || 'Test Vaccine'}
Due Date: Tomorrow

This is a test message to verify WhatsApp integration.

👨⚕️ Surakshabot Health Assistant`;
    
    console.log('🧪 MANUAL TEST - Sending to:', formattedPhone);
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${formattedPhone}`,
      body: testMessage
    });
    
    console.log('✅ Manual test sent. SID:', message.sid);
    
    res.json({
      success: true,
      message: 'Manual test WhatsApp sent successfully',
      messageSid: message.sid,
      to: formattedPhone
    });
    
  } catch (error) {
    console.error('❌ Manual test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }
});

// Test WhatsApp endpoint
router.get('/test-whatsapp/:phone', async (req, res) => {
  try {
    const phone = formatPhoneNumber(req.params.phone);
    
    if (!client) {
      return res.status(400).json({
        success: false,
        error: 'Twilio not configured',
        config: {
          accountSid: !!process.env.TWILIO_ACCOUNT_SID,
          authToken: !!process.env.TWILIO_AUTH_TOKEN,
          whatsappNumber: !!process.env.TWILIO_WHATSAPP_NUMBER
        }
      });
    }
    
    const testMessage = `🧪 Test Message from Surakshabot

This is a test WhatsApp message to verify the integration is working.

Phone: ${phone}
Time: ${new Date().toLocaleString()}

👨⚕️ Surakshabot Health Assistant`;
    
    console.log('📤 Sending test WhatsApp to:', phone);
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${phone}`,
      body: testMessage
    });
    
    console.log('✅ Test WhatsApp sent. SID:', message.sid);
    
    res.json({
      success: true,
      message: 'Test WhatsApp sent successfully',
      messageSid: message.sid,
      to: phone
    });
    
  } catch (error) {
    console.error('❌ Test WhatsApp failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      moreInfo: error.moreInfo
    });
  }
});

// Get all vaccinations for a phone number
router.get('/:phone', async (req, res) => {
  try {
    const vaccinations = await Vaccination.find({ phone: req.params.phone });
    res.json({ success: true, vaccinations });
  } catch (error) {
    console.error('Vaccination fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cron job to send vaccination reminders (runs every day at 9 AM)
cron.schedule('0 9 * * *', async () => {
  console.log('Checking for vaccination reminders...');
  
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    
    // Find vaccinations due tomorrow that haven't been reminded
    const pendingReminders = await Vaccination.find({
      dueDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      reminderSent: false
    });
    
    console.log(`Found ${pendingReminders.length} vaccination reminders to send`);
    
    for (const vaccination of pendingReminders) {
      try {
        if (client && process.env.TWILIO_WHATSAPP_NUMBER) {
          const reminderMessage = `🩹 Vaccination Reminder

Hello! This is a reminder that ${vaccination.name}'s ${vaccination.vaccine} vaccination is due tomorrow (${vaccination.dueDate.toDateString()}).

Please visit your healthcare provider at the scheduled time: ${vaccination.reminderTime}

Stay healthy! 💙

👨⚕️ Surakshabot Health Assistant`;

          console.log(`📤 Sending vaccination reminder to ${vaccination.phone} for ${vaccination.name}`);
          const message = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${vaccination.phone}`,
            body: reminderMessage
          });
          console.log(`✅ Vaccination reminder sent. SID: ${message.sid}`);
        } else {
          console.log(`⚠️ Skipping reminder for ${vaccination.name} - Twilio not configured`);
        }
        
        // Mark as sent
        vaccination.reminderSent = true;
        await vaccination.save();
        
        console.log(`✅ Reminder marked as sent for ${vaccination.name} - ${vaccination.vaccine}`);
        
      } catch (error) {
        console.error(`❌ Failed to send reminder for ${vaccination.name}:`);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('More info:', error.moreInfo);
      }
    }
    
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

module.exports = router;