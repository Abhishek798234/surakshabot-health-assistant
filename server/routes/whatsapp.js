const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const { generateGeminiResponse, createOrGetUser } = require('../services/geminiService');

// Middleware to parse form data from Twilio
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Initialize Twilio client
let client;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('✅ Twilio initialized for WhatsApp webhook');
}

// Webhook verification (GET request from Twilio)
router.get('/webhook', (req, res) => {
  console.log('🔥 GET WEBHOOK - Verification request');
  console.log('Query params:', req.query);
  res.status(200).send('Surakshabot WhatsApp webhook is active and ready!');
});

// Manual webhook test
router.post('/test-webhook', (req, res) => {
  console.log('🧪 Manual webhook test triggered');
  console.log('Test body:', req.body);
  
  res.json({
    success: true,
    message: 'Webhook test successful',
    timestamp: new Date().toISOString(),
    body: req.body
  });
});

// WhatsApp message webhook (POST request from Twilio)
router.post('/webhook', async (req, res) => {
  try {
    console.log('\n\n🔥🔥🔥 WHATSAPP WEBHOOK HIT 🔥🔥🔥');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body (parsed):', JSON.stringify(req.body, null, 2));
    console.log('Raw body keys:', Object.keys(req.body));
    console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥\n\n');
    
    // Extract Twilio webhook data
    const messageBody = req.body.Body;
    const fromNumber = req.body.From;
    const toNumber = req.body.To;
    const userName = req.body.ProfileName;
    
    console.log('📨 Extracted data:');
    console.log('Body:', messageBody);
    console.log('From:', fromNumber);
    console.log('To:', toNumber);
    console.log('ProfileName:', userName);
    
    if (!messageBody || !fromNumber) {
      console.log('⚠️ Empty message or missing sender, ignoring');
      console.log('Available fields:', Object.keys(req.body));
      return res.status(200).send('OK');
    }
    
    // Extract phone number (remove whatsapp: prefix)
    const userPhone = fromNumber.replace('whatsapp:', '');
    const botNumber = toNumber.replace('whatsapp:', '');
    
    console.log(`📨 WhatsApp Message:`);
    console.log('From:', userPhone);
    console.log('Name:', userName || 'Unknown');
    console.log('Message:', messageBody);
    console.log('To Bot:', botNumber);
    
    // Skip if message is empty or from bot
    if (!messageBody || messageBody.trim() === '') {
      return res.status(200).send('OK');
    }
    
    // Handle Twilio sandbox join/leave messages
    if (messageBody.toLowerCase().includes('sandbox') || 
        messageBody.toLowerCase().includes('joined') ||
        messageBody.toLowerCase().includes('left') ||
        messageBody.toLowerCase().includes('your code is')) {
      console.log('🤖 Ignoring Twilio system message');
      return res.status(200).send('OK');
    }
    
    let responseMessage = '';
    
    try {
      // Handle greeting and menu
      if (messageBody.toLowerCase().trim() === 'hi' || messageBody.toLowerCase().trim() === 'hello' || messageBody.toLowerCase().trim() === 'start') {
        responseMessage = `👋 Hello! Welcome to *Surakshabot* - Your AI Health Assistant\n\nI can help you with:\n\n1️⃣ *Health Questions* - Ask any health-related query\n2️⃣ *Vaccination Reminders* - Schedule vaccination alerts\n3️⃣ *Appointments* - Book doctor appointments\n4️⃣ *Help* - Get detailed instructions\n\nJust reply with the number (1, 2, 3, or 4) or type:\n• "Health question"\n• "Vaccination"\n• "Appointment"\n• "Help"\n\nWhat would you like to do?`;
      }
      // Handle menu selections
      else if (messageBody.trim() === '1' || messageBody.toLowerCase().includes('health question')) {
        responseMessage = `🩺 *Health Questions*\n\nI can help with:\n• Symptoms and conditions\n• General health advice\n• Medication information\n• First aid guidance\n\nJust describe your health concern, for example:\n"I have a headache"\n"What should I do for fever?"\n\n*Note: This is for educational purposes only. Consult a doctor for medical advice.*`;
      }
      else if (messageBody.trim() === '2' || messageBody.toLowerCase().includes('vaccination')) {
        responseMessage = `💉 *Vaccination Reminders*\n\nTo schedule a vaccination reminder, use this format:\n\n*name: [Child's Name] vaccine: [Vaccine] date: [YYYY-MM-DD] time: [HH:MM]*\n\nExample:\n"name: John vaccine: Polio date: 2024-12-15 time: 09:00"\n\nI'll send you a WhatsApp reminder one day before the due date!`;
      }
      else if (messageBody.trim() === '3' || messageBody.toLowerCase().includes('appointment')) {
        responseMessage = `🏥 *Doctor Appointments*\n\nTo book an appointment, use this format:\n\n*appointment: patient: [Name] doctor: [Doctor] date: [YYYY-MM-DD] time: [HH:MM]*\n\nExample:\n"appointment: patient: John doctor: Dr. Smith date: 2024-12-15 time: 10:00"\n\nI'll send you a confirmation and reminder!`;
      }
      else if (messageBody.trim() === '4' || messageBody.toLowerCase().includes('help')) {
        responseMessage = `ℹ️ *Surakshabot Help*\n\n*Available Services:*\n🩺 Health Questions - Ask any health query\n💉 Vaccination Reminders - Get WhatsApp alerts\n🏥 Appointments - Book and get reminders\n🔍 Find Hospitals - Get nearby medical facilities\n\n*Quick Commands:*\n• Type "hi" - Show main menu\n• Type "1" - Health questions\n• Type "2" - Vaccination reminders\n• Type "3" - Appointments\n• Type "4" - Help\n\n*Examples:*\n"I have fever"\n"name: John vaccine: MMR date: 2024-12-15 time: 09:00"\n"find hospital near me"\n\nType "hi" anytime to return to the main menu!`;
      }
      else {
        // Generate AI response using Gemini
        console.log('🤖 Generating AI response...');
        responseMessage = await generateGeminiResponse(messageBody, userPhone);
        console.log('🤖 AI response generated, length:', responseMessage.length);
        
        // Clean up response for WhatsApp (remove markdown formatting)
        responseMessage = responseMessage
          .replace(/\*\*(.*?)\*\*/g, '*$1*')  // Bold to WhatsApp bold
          .replace(/\[(.*?)\]\((.*?)\)/g, '$1: $2')  // Links to text: url
          .replace(/\\n/g, '\n')  // Fix line breaks
          .substring(0, 1600);  // WhatsApp message limit
          
        console.log('🤖 Cleaned response for WhatsApp:', responseMessage.substring(0, 100) + '...');
        
        // Add menu prompt at the end
        responseMessage += '\n\n💡 Type "hi" to see the main menu anytime!';
      }
      
    } catch (error) {
      console.error('❌ Error generating response:', error);
      responseMessage = `🤖 I apologize, but I encountered an error processing your message. Please try again.\n\nFor immediate medical emergencies, please contact your local emergency services.`;
    }
    
    // Send response back via WhatsApp
    if (client && responseMessage) {
      try {
        console.log(`📤 Sending WhatsApp response:`);
        console.log('To:', fromNumber);
        console.log('From:', process.env.TWILIO_WHATSAPP_NUMBER);
        console.log('Message length:', responseMessage.length);
        
        const message = await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: fromNumber,
          body: responseMessage
        });
        
        console.log('✅ WhatsApp response sent successfully!');
        console.log('Message SID:', message.sid);
        
      } catch (twilioError) {
        console.error('❌ Failed to send WhatsApp response:');
        console.error('Error code:', twilioError.code);
        console.error('Error message:', twilioError.message);
        console.error('More info:', twilioError.moreInfo);
      }
    } else {
      console.log('⚠️ WhatsApp response skipped:');
      console.log('Client available:', !!client);
      console.log('Response message:', !!responseMessage);
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