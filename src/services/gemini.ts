import { getCurrentLocation, findNearbyMedicalFacilities, generateMapsUrl } from './location';
import { translationService } from './translation';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const BACKEND_URL = '';

const getDoctorPrompt = (language: string) => {
  const prompts: { [key: string]: string } = {
    en: `You are Surakshabot, a multilingual health guardian AI. Respond in English unless the user writes in another language, then respond in their language.

Capabilities:
1. Vaccination reminders
2. Finding nearby medical facilities  
3. General health guidance
4. Multilingual support (English, Hindi, Spanish, French, German, Chinese, Japanese, Arabic, Portuguese, Russian)

For vaccination reminders:
- Format: 'name: [Child's Name] vaccine: [Vaccine Type] date: [YYYY-MM-DD] time: [HH:MM]'

For medical questions:
- Keep responses concise (2-3 sentences maximum)
- Always end with "Consult a doctor for medical advice."
- Be helpful and empathetic

Always include: "This information is for educational purposes and not a substitute for professional medical advice."`,
    
    hi: `आप सुरक्षाबॉट हैं, एक बहुभाषी स्वास्थ्य संरक्षक AI। अंग्रेजी में जवाब दें जब तक कि उपयोगकर्ता दूसरी भाषा में न लिखे, फिर उनकी भाषा में जवाब दें।

क्षमताएं:
1. टीकाकरण अनुस्मारक
2. नजदीकी चिकित्सा सुविधाएं खोजना
3. सामान्य स्वास्थ्य मार्गदर्शन
4. बहुभाषी समर्थन

चिकित्सा प्रश्नों के लिए:
- संक्षिप्त उत्तर दें (अधिकतम 2-3 वाक्य)
- हमेशा "चिकित्सा सलाह के लिए डॉक्टर से सलाह लें।" के साथ समाप्त करें
- सहायक और सहानुभूतिपूर्ण बनें

हमेशा शामिल करें: "यह जानकारी शैक्षिक उद्देश्यों के लिए है और पेशेवर चिकित्सा सलाह का विकल्प नहीं है।"`,
    
    or: `ଆପଣ ସୁରକ୍ଷାବଟ୍, ଏକ ବହୁଭାଷୀ ସ୍ୱାସ୍ଥ୍ୟ ସଂରକ୍ଷକ AI। ଇଂରାଜୀରେ ଉତ୍ତର ଦିଅନ୍ତୁ ଯଦି ବ୍ୟବହାରକାରୀ ଅନ୍ୟ ଭାଷାରେ ନ ଲେଖନ୍ତି, ତାହାଲେ ତାଙ୍କ ଭାଷାରେ ଉତ୍ତର ଦିଅନ୍ତୁ।

କ୍ଷମତାସମୂହ:
1. ଟିକାକରଣ ଅନୁସ୍ମାରକ
2. ନିକଟସ୍ଥ ଚିକିତ୍ସା ସୁବିଧା ଖୋଜିବା
3. ସାଧାରଣ ସ୍ୱାସ୍ଥ୍ୟ ମାର୍ଗଦର୍ଶନ
4. ବହୁଭାଷୀ ସମର୍ଥନ

ଚିକିତ୍ସା ପ୍ରଶ୍ନ ପାଇଁ:
- ସଂକ୍ଷିପ୍ତ ଉତ୍ତର ଦିଅନ୍ତୁ (ଅଧିକତମ 2-3 ବାକ୍ୟ)
- ସର୍ବଦା "ଚିକିତ୍ସା ସଲାହ ପାଇଁ ଡାକ୍ତରଙ୍କ ସାଥେ ସଲାହ ନିଅନ୍ତୁ।" ସହିତ ଶେଷ କରନ୍ତୁ
- ସହାୟକ ଏବଂ ସହାନୁଭୂତିପୂର୍ଣ୍ଣ ହୁଅନ୍ତୁ

ସର୍ବଦା ଅନ୍ତର୍ଭୁକ୍ତ କରନ୍ତୁ: "ଏହି ଜାଣକାରୀ ଶିକ୍ଷାମୂଳକ ଉଦ୍ଦେଶ୍ୟ ପାଇଁ ଏବଂ ପେଶାଦାର ଚିକିତ୍ସା ସଲାହର ବିକଳ୍ପ ନୁହେଁ।"`,
    
    es: `Eres Surakshabot, una IA guardiana de salud multilingüe. Responde en inglés a menos que el usuario escriba en otro idioma, entonces responde en su idioma.

Capacidades:
1. Recordatorios de vacunación
2. Encontrar instalaciones médicas cercanas
3. Orientación general de salud
4. Soporte multilingüe

Para preguntas médicas:
- Mantén las respuestas concisas (máximo 2-3 oraciones)
- Siempre termina con "Consulta a un médico para consejo médico."
- Sé útil y empático

Siempre incluye: "Esta información es para fines educativos y no es un sustituto del consejo médico profesional."`
  };
  
  return prompts[language] || prompts.en;
};;

export const generateGeminiResponse = async (message: string, phone?: string): Promise<string> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  let userContext = '';
  let user = null;
  
  // Get user context if phone is provided
  if (phone) {
    try {
      const userResponse = await fetch(`/api/users/${phone}`);
      const userData = await userResponse.json();
      if (userData.success && userData.user) {
        user = userData.user;
        userContext = `\n\nPatient Information: Name: ${user.name}, Phone: ${user.phone}${user.email ? `, Email: ${user.email}` : ''}, Member since: ${new Date(user.created_at).toDateString()}`;
      }
    } catch (error) {
      console.error('User fetch error:', error);
    }
  }
  
  // Check for appointment scheduling patterns
  const appointmentPatterns = [
    /appointment[:\s]*patient[:\s]*(\w+).*doctor[:\s]*([\w\s]+).*specialty[:\s]*([\w\s]+).*hospital[:\s]*([\w\s]+).*date[:\s]*(\d{4}-\d{2}-\d{2}).*time[:\s]*(\d{1,2}:\d{2})/i,
    /book.*appointment.*patient[:\s]*(\w+).*doctor[:\s]*([\w\s]+).*date[:\s]*(\d{4}-\d{2}-\d{2}).*time[:\s]*(\d{1,2}:\d{2})/i
  ];
  
  let appointmentMatch = null;
  for (const pattern of appointmentPatterns) {
    const match = message.match(pattern);
    if (match) {
      appointmentMatch = match;
      break;
    }
  }
  
  if (appointmentMatch && user) {
    try {
      const [, patientName, doctorName, specialty, hospitalName, appointmentDate, appointmentTime] = appointmentMatch;
      
      const response = await fetch('/api/appointments/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patientName,
          phone: user.phone,
          email: user.email,
          doctorName: doctorName || 'General Physician',
          specialty: specialty || 'General Medicine',
          hospitalName: hospitalName || 'City Hospital',
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime,
          symptoms: 'General consultation'
        })
      });
      
      const appointmentData = await response.json();
      
      if (appointmentData.success) {
        return `✅ Appointment scheduled successfully!\n\nPatient: ${patientName}\nDoctor: Dr. ${doctorName} (${specialty})\nHospital: ${hospitalName}\nDate: ${appointmentDate}\nTime: ${appointmentTime}\n\nA WhatsApp confirmation has been sent. You will receive a reminder 1 day before your appointment.\n\n📱 **WhatsApp Setup Required:**\nTo receive WhatsApp reminders, send "join sit-remove" to:\n[+14155238886](https://wa.me/14155238886?text=join%20sit-remove)`;
      } else {
        return `❌ Error scheduling appointment: ${appointmentData.error || 'Unknown error'}`;
      }
    } catch (error) {
      console.error('Appointment scheduling error:', error);
      return `❌ Failed to schedule appointment. Please try again.`;
    }
  }
  
  // Check for appointment alerts request
  if (message.toLowerCase().includes('appointment alerts') || message.toLowerCase().includes('show my appointments')) {
    if (user) {
      try {
        const response = await fetch(`/api/appointments/${user.phone}`);
        const appointmentData = await response.json();
        
        if (appointmentData.success && appointmentData.appointments.length > 0) {
          let appointmentList = `📅 Your Upcoming Appointments:\n\n`;
          
          appointmentData.appointments.forEach((apt, index) => {
            const date = new Date(apt.appointmentDate).toDateString();
            appointmentList += `${index + 1}. **${apt.doctorName}** (${apt.specialty})\n`;
            appointmentList += `   🏥 ${apt.hospitalName}\n`;
            appointmentList += `   📅 ${date} at ${apt.appointmentTime}\n`;
            appointmentList += `   📋 Status: ${apt.status}\n\n`;
          });
          
          appointmentList += `💡 You will receive WhatsApp reminders 1 day before each appointment.`;
          return appointmentList;
        } else {
          return `📅 No upcoming appointments found.\n\nTo schedule an appointment, use this format:\n"appointment: patient: [Name] doctor: [Doctor Name] specialty: [Specialty] hospital: [Hospital] date: [YYYY-MM-DD] time: [HH:MM]"\n\nExample: "appointment: patient: John doctor: Dr. Smith specialty: Cardiology hospital: City Hospital date: 2024-02-15 time: 10:00"\n\n📱 **WhatsApp Setup:**\nFor WhatsApp reminders, send "join sit-remove" to:\n[+14155238886](https://wa.me/14155238886?text=join%20sit-remove)`;
        }
      } catch (error) {
        console.error('Get appointments error:', error);
        return `❌ Unable to fetch appointments. Please try again.`;
      }
    } else {
      return `To view your appointments, please register first by sharing your details: 'My name is [Your Name] and my phone number is [Your Phone Number]'`;
    }
  }
  
  // Check for help or WhatsApp setup requests
  if (message.toLowerCase().includes('help') || message.toLowerCase().includes('whatsapp') || message.toLowerCase().includes('reminder') || message.toLowerCase().includes('notification') || message.toLowerCase().includes('setup')) {
    const helpInfo = `🩺 **Surakshabot Help**\n\n**Available Services:**\n• 🩹 Vaccination reminders\n• 🏥 Appointment scheduling\n• 🏥 Find nearby hospitals\n• 🚨 Health alerts\n• 💬 Health guidance\n\n📱 **WhatsApp Reminders Setup:**\n\n1. Click: [+14155238886](https://wa.me/14155238886?text=join%20sit-remove)\n2. Send: "join sit-remove"\n3. Get confirmation\n\n**Examples:**\n• "name: John vaccine: Polio date: 2024-02-15 time: 09:00"\n• "find nearby hospital"\n• "appointment: patient: John doctor: Dr. Smith date: 2024-02-15 time: 10:00"\n\nNote: WhatsApp uses Twilio Sandbox for testing.`;
    
    return helpInfo;
  }
  
  // Check for vaccination details with flexible patterns including time
  const vaccinationPatterns = [
    /name[:\s]*(\w+).*vaccine[:\s]*(\w+).*date[:\s]*(\d{4}-\d{2}-\d{2}).*time[:\s]*(\d{1,2}:\d{2})/i,
    /name[:\s]*(\w+).*vaccine[:\s]*(\w+).*date[:\s]*(\d{4}-\d{2}-\d{2})/i,
    /(\w+).*?(polio|bcg|dpt|measles|hepatitis|mmr|rotavirus|pneumococcal|hib|varicella|influenza|covid).*?(\d{4}-\d{2}-\d{2}).*?(\d{1,2}:\d{2})/i,
    /(\w+).*?(polio|bcg|dpt|measles|hepatitis|mmr|rotavirus|pneumococcal|hib|varicella|influenza|covid).*?(\d{4}-\d{2}-\d{2})/i
  ];
  
  let vaccinationMatch = null;
  for (const pattern of vaccinationPatterns) {
    const match = message.match(pattern);
    if (match) {
      vaccinationMatch = match;
      break;
    }
  }
  
  if (vaccinationMatch && user) {
    try {
      const [, childName, vaccine, dueDate, reminderTime] = vaccinationMatch;
      
      // If no time provided, ask for it
      if (!reminderTime) {
        return `I have the vaccination details:\n\nChild: ${childName}\nVaccine: ${vaccine}\nDue Date: ${dueDate}\n\nAt what time would you like to receive the reminder? Please reply with:\n\n"time: HH:MM" (e.g., "time: 09:00" for 9 AM)`;
      }
      
      // Call vaccination API to save and send WhatsApp
      const vacResponse = await fetch('/api/vaccination/schedule', {
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
      
      const vacData = await vacResponse.json();
      
      if (vacData.success) {
        return `✅ Vaccination reminder scheduled successfully!\n\nChild: ${childName}\nVaccine: ${vaccine}\nDue Date: ${dueDate}\nReminder Time: ${reminderTime}\n\nA WhatsApp confirmation has been sent to your number. You will also receive a reminder one day before the due date at ${reminderTime}.\n\n📱 **WhatsApp Setup Required:**\nTo receive WhatsApp reminders, send "join sit-remove" to:\n[+14155238886](https://wa.me/14155238886?text=join%20sit-remove)\n\nPlease consult with a healthcare provider for proper vaccination guidance.`;
      } else {
        return `❌ Error scheduling vaccination: ${vacData.error || 'Unknown error'}`;
      }
    } catch (error) {
      console.error('Vaccination save error:', error);
    }
  }
  
  // Check for time-only pattern when user provides time after vaccination details
  const timePattern = /time[:\s]*(\d{1,2}:\d{2})/i;
  const timeMatch = message.match(timePattern);
  
  if (timeMatch && user) {
    const [, reminderTime] = timeMatch;
    return `Thank you! Now please provide the complete vaccination details with time:\n\n"name: [Child's Name] vaccine: [Vaccine Type] date: [YYYY-MM-DD] time: ${reminderTime}"\n\nExample: "name: John vaccine: Polio date: 2024-02-15 time: ${reminderTime}"`;
  }
  
  // Check for medical facility search requests
  const facilityPatterns = [
    /find (hospital|clinic|pharmacy|doctor|medical store)/i,
    /nearby (hospital|clinic|pharmacy|doctor|medical store)/i,
    /need (hospital|clinic|pharmacy|doctor|medical store)/i,
    /emergency/i,
    /where.*?(hospital|clinic|pharmacy|doctor)/i
  ];
  
  let facilityMatch = null;
  for (const pattern of facilityPatterns) {
    const match = message.match(pattern);
    if (match) {
      facilityMatch = match;
      break;
    }
  }
  
  if (facilityMatch) {
    return JSON.stringify({
      type: 'location_request',
      facilityType: facilityMatch[1]?.toLowerCase() || 'hospital',
      message: `I'll help you find nearby ${facilityMatch[1]?.toLowerCase() || 'hospital'}s. I need your location permission first.`
    });
  }

  // Get current language and appropriate prompt
  const currentLang = translationService.getCurrentLanguage();
  const doctorPrompt = getDoctorPrompt(currentLang.code);
  
  // Detect if user is writing in a different language
  const detectedLang = translationService.detectLanguage(message);
  let processedMessage = message;
  
  // If user writes in non-English, translate for processing but keep original for context
  if (detectedLang.code !== 'en' && currentLang.code === 'en') {
    try {
      const translatedMessage = await translationService.translateText(message, 'en', detectedLang.code);
      processedMessage = `[User wrote in ${detectedLang.name}: "${message}"] Translated: ${translatedMessage}`;
    } catch (error) {
      console.error('Translation error:', error);
    }
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${doctorPrompt}${userContext}\n\nPatient: ${processedMessage}`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I encountered an issue processing your request.';
    
    // Add WhatsApp setup info to relevant responses
    if (aiResponse.toLowerCase().includes('vaccination') || aiResponse.toLowerCase().includes('appointment') || aiResponse.toLowerCase().includes('reminder')) {
      return aiResponse + '\n\n📱 **WhatsApp Reminders:**\nFor WhatsApp notifications, send "join sit-remove" to [+14155238886](https://wa.me/14155238886?text=join%20sit-remove)';
    }
    
    // If response mentions finding facilities, add location prompt
    if (aiResponse.toLowerCase().includes('hospital') || aiResponse.toLowerCase().includes('clinic') || aiResponse.toLowerCase().includes('pharmacy')) {
      return aiResponse + '\n\n💡 I can help you find nearby medical facilities! Just say "find hospital", "nearby clinic", or "medical store" and I\'ll use your location to show the closest options.';
    }
    
    return aiResponse;
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'I apologize, but I\'m having trouble connecting right now. Please try again later.';
  }
};

// Create or get user
export const createOrGetUser = async (name: string, phone: string, email?: string) => {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('User creation error:', error);
    return { success: false, error: error.message };
  }
};