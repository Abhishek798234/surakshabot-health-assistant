const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const { generateGeminiResponse, createOrGetUser } = require('../services/geminiService');

// Middleware to parse form data from Twilio
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Initialize separate Twilio client for SMS
let smsClient;
console.log('📱 SMS WEBHOOK STARTUP:');
console.log('SMS_ACCOUNT_SID:', process.env.TWILIO_SMS_ACCOUNT_SID ? `${process.env.TWILIO_SMS_ACCOUNT_SID.substring(0, 10)}...` : 'MISSING');
console.log('SMS_AUTH_TOKEN:', process.env.TWILIO_SMS_AUTH_TOKEN ? `${process.env.TWILIO_SMS_AUTH_TOKEN.substring(0, 10)}...` : 'MISSING');
console.log('SMS_NUMBER:', process.env.TWILIO_SMS_NUMBER || 'MISSING');

if (process.env.TWILIO_SMS_ACCOUNT_SID && process.env.TWILIO_SMS_AUTH_TOKEN) {
  try {
    smsClient = twilio(process.env.TWILIO_SMS_ACCOUNT_SID, process.env.TWILIO_SMS_AUTH_TOKEN);
    console.log('✅ Separate Twilio SMS client created successfully');
    
    // Test SMS credentials by making a simple API call
    smsClient.api.accounts(process.env.TWILIO_SMS_ACCOUNT_SID).fetch()
      .then(account => {
        console.log('✅ SMS Twilio authentication verified for account:', account.friendlyName);
        console.log('✅ SMS Account SID:', account.sid);
        console.log('✅ SMS Account Status:', account.status);
      })
      .catch(error => {
        console.error('❌ SMS Twilio authentication failed:', error.message);
        console.error('SMS Error code:', error.code);
        console.error('SMS More info:', error.moreInfo);
      });
      
  } catch (error) {
    console.error('❌ SMS Twilio initialization failed:', error.message);
    smsClient = null;
  }
} else {
  console.log('❌ SMS Twilio not initialized - missing SMS credentials');
  console.log('SMS_ACCOUNT_SID present:', !!process.env.TWILIO_SMS_ACCOUNT_SID);
  console.log('SMS_AUTH_TOKEN present:', !!process.env.TWILIO_SMS_AUTH_TOKEN);
  smsClient = null;
}

// SMS webhook verification (GET request)
router.get('/webhook', (req, res) => {
  console.log('🔥 GET SMS WEBHOOK - Verification request');
  console.log('Query params:', req.query);
  res.status(200).send('Surakshabot SMS webhook is active and ready!');
});

// SMS message webhook (POST request from Twilio)
router.post('/webhook', async (req, res) => {
  try {
    console.log('\n\n🔥🔥🔥 SMS WEBHOOK HIT 🔥🔥🔥');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body (parsed):', JSON.stringify(req.body, null, 2));
    console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥\n\n');

    // Skip Twilio system notifications and error reports
    if (req.body.Level || req.body.Payload || req.body.PayloadType) {
      console.log('🤖 Ignoring Twilio system notification');
      return res.status(200).send('OK');
    }
    
    // Extract Twilio SMS data
    const messageBody = req.body.Body;
    const fromNumber = req.body.From;
    const toNumber = req.body.To;
    
    console.log('📨 Extracted SMS data:');
    console.log('Body:', messageBody);
    console.log('From:', fromNumber);
    console.log('To:', toNumber);
    
    if (!messageBody || !fromNumber) {
      console.log('⚠️ Empty message or missing sender, ignoring');
      return res.status(200).send('OK');
    }

    // Extract phone number (remove any prefixes)
    const userPhone = fromNumber.replace(/^\+/, '');
    const botNumber = toNumber.replace(/^\+/, '');
    
    console.log('📨 SMS Message:');
    console.log('From:', userPhone);
    console.log('Message:', messageBody);
    console.log('To Bot:', botNumber);
    
    let responseMessage = '';
    
    try {
      // Handle greeting and menu
      if (messageBody.toLowerCase().trim() === 'hi' || messageBody.toLowerCase().trim() === 'hello' || messageBody.toLowerCase().trim() === 'start') {
        responseMessage = `👋 Surakshabot Health Assistant

1. Health Questions
2. Vaccination Reminders
3. Appointments
4. Help

Reply with number (1-4) or type service name.`;
      }
      // Handle menu selections
      else if (messageBody.trim() === '1' || messageBody.toLowerCase().includes('health question')) {
        responseMessage = `🩺 Health Questions

Describe your health concern:
"I have headache"
"What for fever?"

Note: Educational only. Consult doctor for medical advice.`;
      }
      else if (messageBody.trim() === '2' || messageBody.toLowerCase().includes('vaccination')) {
        responseMessage = `💉 Vaccination Reminders

Format:
name: [Name] vaccine: [Type] date: [YYYY-MM-DD] time: [HH:MM]

Example:
"name: John vaccine: Polio date: 2024-12-15 time: 09:00"`;
      }
      else if (messageBody.trim() === '3' || messageBody.toLowerCase().includes('appointment')) {
        responseMessage = `🏥 Appointments

Format:
appointment: patient: [Name] doctor: [Dr Name] date: [YYYY-MM-DD] time: [HH:MM]

Example:
"appointment: patient: John doctor: Dr. Smith date: 2024-12-15 time: 10:00"`;
      }
      else if (messageBody.trim() === '4' || messageBody.toLowerCase().includes('help')) {
        responseMessage = `ℹ️ Help

🩺 Health Questions
💉 Vaccination Reminders
🏥 Appointments

Commands:
"hi" - Menu
"1" - Health
"2" - Vaccination
"3" - Appointments

Type "hi" for menu.`;
      }
      else {
        // Check for common health queries and provide fallback responses
        const healthQuery = messageBody.toLowerCase();
        
        if (healthQuery.includes('headache') || healthQuery.includes('head pain')) {
          responseMessage = `🩺 Headache Relief

Causes: Stress, dehydration, lack of sleep

Treatment:
• Rest in dark room
• Drink water
• Cold compress
• Pain reliever if needed

See doctor if severe/sudden.
Educational only.`;
        }
        else if (healthQuery.includes('fever') || healthQuery.includes('temperature')) {
          responseMessage = `🌡️ Fever Management

Normal: 98.6°F, Fever: >100.4°F

Treatment:
• Rest, hydrate
• Paracetamol/ibuprofen
• Cool compress

See doctor if >103°F or >3 days.
Educational only.`;
        }
        else if (healthQuery.includes('cough') || healthQuery.includes('cold')) {
          responseMessage = `🤧 Cough & Cold

Treatment:
• Rest, fluids
• Salt water gargle
• Honey (not <1yr babies)
• Steam inhalation

See doctor if worsens >7 days.
Educational only.`;
        }
        else {
          // Try Gemini API, but provide fallback if it fails
          try {
            console.log('🤖 Generating AI response...');
            responseMessage = await generateGeminiResponse(messageBody, `+${userPhone}`);
            console.log('🤖 AI response generated, length:', responseMessage.length);
            
            // Clean up response for SMS (remove markdown formatting)
            responseMessage = responseMessage
              .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold
              .replace(/\[(.*?)\]\((.*?)\)/g, '$1: $2')  // Links to text: url
              .replace(/\\n/g, '\n')  // Fix line breaks
              .substring(0, 800);  // Shorter SMS limit
              
          } catch (error) {
            console.error('Gemini API failed, using fallback response');
            responseMessage = `🩺 Health Guidance

Technical difficulties.

General advice:
• Stay hydrated
• Rest well
• Good hygiene
• Nutritious food

Consult healthcare provider.
Educational only.`;
          }
        }
        
        // Add short menu prompt
        responseMessage += '\n\nType "hi" for menu.';
      }
      
    } catch (error) {
      console.error('❌ Error generating response:', error);
      responseMessage = `🤖 I apologize, but I encountered an error processing your message. Please try again.

For immediate medical emergencies, please contact your local emergency services.`;
    }
    
    // Send response back via SMS
    if (smsClient && responseMessage && process.env.TWILIO_SMS_NUMBER) {
      try {
        console.log('📤 Sending SMS response:');
        console.log('To:', fromNumber);
        console.log('From:', process.env.TWILIO_SMS_NUMBER);
        console.log('Message length:', responseMessage.length);
        
        const message = await smsClient.messages.create({
          from: process.env.TWILIO_SMS_NUMBER,
          to: fromNumber,
          body: responseMessage
        });
        
        console.log('✅ SMS response sent successfully!');
        console.log('Message SID:', message.sid);
        
      } catch (twilioError) {
        console.error('❌ Failed to send SMS response:');
        console.error('Error code:', twilioError.code);
        console.error('Error message:', twilioError.message);
        console.error('More info:', twilioError.moreInfo);
      }
    } else {
      console.log('⚠️ SMS response skipped:');
      console.log('SMS Client available:', !!smsClient);
      console.log('Response message:', !!responseMessage);
      console.log('SMS number set:', !!process.env.TWILIO_SMS_NUMBER);
    }
    
    // Always respond with 200 to Twilio
    console.log('🔥 Sending OK response to Twilio');
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('❌ SMS webhook error:', error);
    res.status(200).send('OK'); // Still return 200 to avoid Twilio retries
  }
});

// Test SMS endpoint
router.post('/send-test', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!smsClient) {
      return res.status(400).json({
        success: false,
        error: 'SMS Twilio not configured'
      });
    }
    
    const testMessage = await smsClient.messages.create({
      from: process.env.TWILIO_SMS_NUMBER,
      to: phone,
      body: message || '🧪 Test SMS from Surakshabot Health Assistant!'
    });
    
    res.json({
      success: true,
      messageSid: testMessage.sid,
      message: 'Test SMS sent successfully'
    });
    
  } catch (error) {
    console.error('❌ Test SMS send failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;