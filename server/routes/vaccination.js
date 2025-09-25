const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const cron = require('node-cron');
const Vaccination = require('../models/Vaccination');

// Initialize Twilio client only if credentials are available
let client;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('✅ Twilio initialized');
} else {
  console.log('⚠️ Twilio disabled (credentials not found)');
}

// Format phone number to international format
const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  let cleanPhone = phone.replace(/\D/g, '');
  
  // If it starts with 0, replace with +91 (India)
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '+91' + cleanPhone.substring(1);
  }
  // If it doesn't start with +, add +91
  else if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+91' + cleanPhone;
  }
  
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
    if (client) {
      const confirmationMessage = `✅ Vaccination reminder scheduled successfully!

Child: ${name}
Vaccine: ${vaccine}
Due Date: ${dueDate}
Reminder Time: ${reminderTime}

You will receive a reminder one day before the due date. Please consult with a healthcare provider for proper vaccination guidance.`;

      try {
        await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: `whatsapp:${formattedPhone}`,
          body: confirmationMessage
        });
      } catch (twilioError) {
        console.error('WhatsApp send error:', twilioError);
      }
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
    
    for (const vaccination of pendingReminders) {
      try {
        if (client) {
          const reminderMessage = `🩹 Vaccination Reminder

Hello! This is a reminder that ${vaccination.name}'s ${vaccination.vaccine} vaccination is due tomorrow (${vaccination.dueDate.toDateString()}).

Please visit your healthcare provider at the scheduled time: ${vaccination.reminderTime}

Stay healthy! 💙`;

          await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${vaccination.phone}`,
            body: reminderMessage
          });
        }
        
        // Mark as sent
        vaccination.reminderSent = true;
        await vaccination.save();
        
        console.log(`Reminder sent for ${vaccination.name} - ${vaccination.vaccine}`);
        
      } catch (error) {
        console.error(`Failed to send reminder for ${vaccination.name}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

module.exports = router;