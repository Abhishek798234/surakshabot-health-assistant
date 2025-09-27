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
        responseMessage = `👋 Hello! Welcome to Surakshabot - Your AI Health Assistant

I can help you with:

1. Health Questions - Ask any health query
2. Vaccination Reminders - Schedule alerts  
3. Appointments - Book doctor visits
4. Help - Get instructions

Reply with the number (1, 2, 3, or 4) or type:
• "Health question"
• "Vaccination" 
• "Appointment"
• "Help"

What would you like to do?`;
      }
      // Handle menu selections
      else if (messageBody.trim() === '1' || messageBody.toLowerCase().includes('health question')) {
        responseMessage = `🩺 Health Questions

I can help with:
• Symptoms and conditions
• General health advice
• Medication information
• First aid guidance

Just describe your concern, for example:
"I have a headache"
"What should I do for fever?"

Note: This is for educational purposes only. Consult a doctor for medical advice.`;
      }
      else if (messageBody.trim() === '2' || messageBody.toLowerCase().includes('vaccination')) {
        responseMessage = `💉 Vaccination Reminders

To schedule a vaccination reminder, use this format:

name: [Child's Name] vaccine: [Vaccine] date: [YYYY-MM-DD] time: [HH:MM]

Example:
"name: John vaccine: Polio date: 2024-12-15 time: 09:00"

I'll send you an SMS reminder one day before the due date!`;
      }
      else if (messageBody.trim() === '3' || messageBody.toLowerCase().includes('appointment')) {
        responseMessage = `🏥 Doctor Appointments

To book an appointment, use this format:

appointment: patient: [Name] doctor: [Doctor] date: [YYYY-MM-DD] time: [HH:MM]

Example:
"appointment: patient: John doctor: Dr. Smith date: 2024-12-15 time: 10:00"

I'll send you a confirmation and reminder!`;
      }
      else if (messageBody.trim() === '4' || messageBody.toLowerCase().includes('help')) {
        responseMessage = `ℹ️ Surakshabot Help

Available Services:
🩺 Health Questions - Ask any health query
💉 Vaccination Reminders - Get SMS alerts
🏥 Appointments - Book and get reminders

Quick Commands:
• Type "hi" - Show main menu
• Type "1" - Health questions
• Type "2" - Vaccination reminders
• Type "3" - Appointments
• Type "4" - Help

Examples:
"I have fever"
"name: John vaccine: MMR date: 2024-12-15 time: 09:00"

Type "hi" anytime to return to the main menu!`;
      }
      else {
        // Check for common health queries and provide fallback responses
        const healthQuery = messageBody.toLowerCase();
        
        if (healthQuery.includes('headache') || healthQuery.includes('head pain')) {
          responseMessage = `🩺 Headache Relief

Common causes:
• Stress and tension
• Dehydration
• Lack of sleep
• Eye strain

What you can do:
• Rest in a quiet, dark room
• Drink plenty of water
• Apply cold compress to forehead
• Take over-the-counter pain reliever if needed

See a doctor if:
• Severe or sudden headache
• Headache with fever
• Vision changes

This is for educational purposes only. Consult a doctor for medical advice.`;
        }
        else if (healthQuery.includes('fever') || healthQuery.includes('temperature')) {
          responseMessage = `🌡️ Fever Management

Normal temperature: 98.6°F (37°C)
Fever: Above 100.4°F (38°C)

What you can do:
• Rest and stay hydrated
• Take paracetamol or ibuprofen
• Use cool compresses
• Monitor temperature regularly

See a doctor if:
• Fever above 103°F (39.4°C)
• Fever lasts more than 3 days
• Difficulty breathing

This is for educational purposes only. Consult a doctor for medical advice.`;
        }
        else if (healthQuery.includes('cough') || healthQuery.includes('cold')) {
          responseMessage = `🤧 Cough & Cold Care

What you can do:
• Rest and drink fluids
• Warm salt water gargle
• Honey for cough (not for babies under 1 year)
• Steam inhalation
• Use humidifier

See a doctor if:
• Symptoms worsen after 7 days
• High fever
• Difficulty breathing
• Chest pain

This is for educational purposes only. Consult a doctor for medical advice.`;
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
              .substring(0, 1500);  // SMS length limit
              
          } catch (error) {
            console.error('Gemini API failed, using fallback response');
            responseMessage = `🩺 Health Guidance

I'm currently experiencing technical difficulties.

For your health query: "${messageBody}"

General advice:
• Stay hydrated
• Get adequate rest
• Maintain good hygiene
• Eat nutritious food

For specific medical concerns, please consult a healthcare provider.

This is for educational purposes only. Always consult a doctor for medical advice.`;
          }
        }
        
        // Add menu prompt at the end
        responseMessage += '\n\nType "hi" to see the main menu anytime!';
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