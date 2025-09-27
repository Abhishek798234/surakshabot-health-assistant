const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const { generateGeminiResponse, createOrGetUser } = require('../services/geminiService');

// Initialize Twilio client
let client;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('✅ Twilio initialized for WhatsApp webhook');
}

// Webhook verification (GET request from Twilio)
router.get('/webhook', (req, res) => {
  console.log('🔥 GET WEBHOOK HIT - Verification request');
  console.log('🔥 Query params:', req.query);
  console.log('🔥 Headers:', req.headers);
  res.status(200).send('WhatsApp webhook is working!');
});

// WhatsApp message webhook (POST request from Twilio)
router.post('/webhook', async (req, res) => {
  try {
    console.log('🔥 WEBHOOK HIT - Raw body:', JSON.stringify(req.body, null, 2));
    console.log('🔥 Headers:', JSON.stringify(req.headers, null, 2));
    console.log('🔥 Method:', req.method);
    console.log('🔥 URL:', req.url);
    
    const { Body: messageBody, From: fromNumber, To: toNumber } = req.body;
    
    // Extract phone number (remove whatsapp: prefix)
    const userPhone = fromNumber.replace('whatsapp:', '');
    const botNumber = toNumber.replace('whatsapp:', '');
    
    console.log(`📨 Message from ${userPhone}: ${messageBody}`);
    
    // Skip if message is empty or from bot
    if (!messageBody || messageBody.trim() === '') {
      return res.status(200).send('OK');
    }
    
    // Handle Twilio sandbox join/leave messages
    if (messageBody.toLowerCase().includes('sandbox') || 
        messageBody.toLowerCase().includes('joined') ||
        messageBody.toLowerCase().includes('left')) {
      return res.status(200).send('OK');
    }
    
    let responseMessage = '';
    
    try {
      // Check for user registration pattern
      const userPattern = /my name is ([\w\s]+) and my phone number is ([\+\d\s\-\(\)]+)/i;
      const userMatch = messageBody.match(userPattern);
      
      if (userMatch) {
        const [, name, phone] = userMatch;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        
        // Create user account
        const userData = await createOrGetUser(name.trim(), cleanPhone);
        
        if (userData.success) {
          responseMessage = `🎉 Welcome ${name.trim()}! Your Surakshabot profile has been created successfully.\n\nI can now help you with:\n• 🩹 Vaccination reminders\n• 🏥 Appointment scheduling\n• 🔍 Find nearby hospitals\n• 🚨 Health alerts\n• 💬 Health guidance\n\nHow can I assist you today?`;
        } else {
          responseMessage = `❌ There was an error creating your profile. Please try again or contact support.`;
        }
      } else {
        // Generate AI response using Gemini
        responseMessage = await generateGeminiResponse(messageBody, userPhone);
        
        // Clean up response for WhatsApp (remove markdown formatting)
        responseMessage = responseMessage
          .replace(/\*\*(.*?)\*\*/g, '*$1*')  // Bold to WhatsApp bold
          .replace(/\[(.*?)\]\((.*?)\)/g, '$1: $2')  // Links to text: url
          .replace(/\\n/g, '\n');  // Fix line breaks
      }
      
    } catch (error) {
      console.error('❌ Error generating response:', error);
      responseMessage = `🤖 I apologize, but I encountered an error processing your message. Please try again.\n\nFor immediate medical emergencies, please contact your local emergency services.`;
    }
    
    // Send response back via WhatsApp
    if (client && responseMessage) {
      try {
        console.log(`📤 Sending response to ${userPhone}`);
        
        await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: fromNumber,
          body: responseMessage
        });
        
        console.log('✅ WhatsApp response sent successfully');
        
      } catch (twilioError) {
        console.error('❌ Failed to send WhatsApp response:', twilioError);
      }
    }
    
    // Always respond with 200 to Twilio
    console.log('🔥 Sending OK response to Twilio');
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('❌ WhatsApp webhook error:', error);
    res.status(200).send('OK'); // Still return 200 to avoid Twilio retries
  }
});

// Test endpoint to send WhatsApp message
router.post('/send-test', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!client) {
      return res.status(400).json({
        success: false,
        error: 'Twilio not configured'
      });
    }
    
    const testMessage = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${phone}`,
      body: message || '🧪 Test message from Surakshabot WhatsApp integration!'
    });
    
    res.json({
      success: true,
      messageSid: testMessage.sid,
      message: 'Test WhatsApp message sent successfully'
    });
    
  } catch (error) {
    console.error('❌ Test WhatsApp send failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;