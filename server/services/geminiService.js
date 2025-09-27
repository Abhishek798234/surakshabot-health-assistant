const fetch = require('node-fetch');
const User = require('../models/User');

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const getDoctorPrompt = () => {
  return `You are Surakshabot, a multilingual health guardian AI accessible via WhatsApp.

Capabilities:
1. Vaccination reminders
2. Finding nearby medical facilities  
3. General health guidance
4. Appointment scheduling
5. Health alerts

For vaccination reminders:
- Format: 'name: [Child's Name] vaccine: [Vaccine Type] date: [YYYY-MM-DD] time: [HH:MM]'

For appointments:
- Format: 'appointment: patient: [Name] doctor: [Doctor Name] date: [YYYY-MM-DD] time: [HH:MM]'

For medical questions:
- Keep responses concise (2-3 sentences maximum)
- Always end with "Consult a doctor for medical advice."
- Be helpful and empathetic

Always include: "This information is for educational purposes and not a substitute for professional medical advice."

Respond in a WhatsApp-friendly format without complex markdown.`;
};

const generateGeminiResponse = async (message, phone) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  let userContext = '';
  let user = null;
  
  // Get user context if phone is provided
  if (phone) {
    try {
      user = await User.findOne({ phone: phone.replace(/[\s\-\(\)]/g, '') });
      if (user) {
        userContext = `\n\nPatient Information: Name: ${user.name}, Phone: ${user.phone}${user.email ? `, Email: ${user.email}` : ''}`;
      }
    } catch (error) {
      console.error('User fetch error:', error);
    }
  }
  
  // Check for vaccination scheduling
  const vaccinationPatterns = [
    /name[:\s]*(\w+).*vaccine[:\s]*(\w+).*date[:\s]*(\d{4}-\d{2}-\d{2}).*time[:\s]*(\d{1,2}:\d{2})/i,
    /(\w+).*?(polio|bcg|dpt|measles|hepatitis|mmr|rotavirus|pneumococcal|hib|varicella|influenza|covid).*?(\d{4}-\d{2}-\d{2}).*?(\d{1,2}:\d{2})/i
  ];
  
  for (const pattern of vaccinationPatterns) {
    const match = message.match(pattern);
    if (match && user) {
      try {
        const [, childName, vaccine, dueDate, reminderTime] = match;
        
        // Call vaccination API
        const response = await fetch(`${process.env.BASE_URL}/api/vaccination/schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: childName,
            phone: user.phone,
            vaccine: vaccine,
            dueDate: dueDate,
            reminderTime: reminderTime
          })
        });
        
        const vacData = await response.json();
        
        if (vacData.success) {
          return `✅ Vaccination reminder scheduled!\n\nChild: ${childName}\nVaccine: ${vaccine}\nDue Date: ${dueDate}\nReminder Time: ${reminderTime}\n\nYou'll receive a reminder one day before the due date.\n\nConsult with a healthcare provider for proper vaccination guidance.`;
        }
      } catch (error) {
        console.error('Vaccination scheduling error:', error);
      }
    }
  }
  
  // Check for appointment scheduling
  const appointmentPatterns = [
    /appointment[:\s]*patient[:\s]*(\w+).*doctor[:\s]*([\w\s]+).*date[:\s]*(\d{4}-\d{2}-\d{2}).*time[:\s]*(\d{1,2}:\d{2})/i
  ];
  
  for (const pattern of appointmentPatterns) {
    const match = message.match(pattern);
    if (match && user) {
      try {
        const [, patientName, doctorName, appointmentDate, appointmentTime] = match;
        
        // Call appointment API
        const response = await fetch(`${process.env.BASE_URL}/api/appointments/schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientName: patientName,
            phone: user.phone,
            email: user.email,
            doctorName: doctorName || 'General Physician',
            specialty: 'General Medicine',
            hospitalName: 'City Hospital',
            appointmentDate: appointmentDate,
            appointmentTime: appointmentTime,
            symptoms: 'General consultation'
          })
        });
        
        const appointmentData = await response.json();
        
        if (appointmentData.success) {
          return `✅ Appointment scheduled!\n\nPatient: ${patientName}\nDoctor: Dr. ${doctorName}\nDate: ${appointmentDate}\nTime: ${appointmentTime}\n\nYou'll receive a reminder 1 day before your appointment.`;
        }
      } catch (error) {
        console.error('Appointment scheduling error:', error);
      }
    }
  }

  // Generate AI response using Gemini
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${getDoctorPrompt()}${userContext}\n\nPatient: ${message}`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I encountered an issue processing your request.';
    
    return aiResponse;
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'I apologize, but I\'m having trouble connecting right now. Please try again later.';
  }
};

const createOrGetUser = async (name, phone, email) => {
  try {
    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({ name, phone, email });
      await user.save();
    }

    return { success: true, user };
  } catch (error) {
    console.error('User creation error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateGeminiResponse,
  createOrGetUser
};