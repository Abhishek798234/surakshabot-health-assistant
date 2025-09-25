# 🤖 Surakshabot - AI Health Assistant

A comprehensive multilingual health chatbot powered by AI, providing 24/7 health assistance, location-based medical services, and real-time health alerts.

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Chat** - Intelligent health conversations using Google Gemini 2.0
- **Voice Interface** - Speech-to-text and text-to-speech in multiple languages
- **Multilingual Support** - 11 languages including English, Hindi, Odia, Spanish, French, German, Chinese, Japanese, Arabic, Portuguese, Russian
- **Location Services** - Find nearby hospitals, clinics, and pharmacies
- **Health Alerts** - Real-time disease outbreak notifications
- **Appointment Booking** - Schedule and manage medical appointments
- **Vaccination Reminders** - Automated WhatsApp and email reminders

### 🌍 Multilingual Support
- 🇺🇸 English
- 🇮🇳 हिंदी (Hindi)
- 🇮🇳 ଓଡ଼ିଆ (Odia)
- 🇪🇸 Español (Spanish)
- 🇫🇷 Français (French)
- 🇩🇪 Deutsch (German)
- 🇨🇳 中文 (Chinese)
- 🇯🇵 日本語 (Japanese)
- 🇸🇦 العربية (Arabic)
- 🇧🇷 Português (Portuguese)
- 🇷🇺 Русский (Russian)

### 📱 Communication Channels
- **WhatsApp Integration** - Automated messaging via Twilio
- **Email Notifications** - SMTP-based email alerts
- **SMS Support** - Text message notifications
- **Real-time Chat** - Instant web-based conversations

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Component library
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Nodemailer** - Email service
- **Node-cron** - Scheduled tasks

### AI & APIs
- **Google Gemini 2.0 Flash** - AI language model
- **Web Speech API** - Voice recognition
- **Google Places API** - Location services
- **Google Maps API** - Maps integration
- **Twilio** - WhatsApp & SMS
- **MyMemory Translation API** - Language translation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- Twilio account for WhatsApp/SMS
- Google Cloud account for APIs
- Gmail account for SMTP

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/surakshabot.git
cd surakshabot
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_atlas_uri
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+your_number
PORT=8001
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

4. **Start Development Servers**
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:8080
- Backend: http://localhost:8001

## 📋 API Endpoints

### User Management
- `POST /api/users` - Create/get user
- `GET /api/users/:phone` - Get user by phone

### Health Services
- `POST /api/vaccination/schedule` - Schedule vaccination reminder
- `GET /api/vaccination/:phone` - Get vaccination reminders
- `POST /api/appointments/schedule` - Book appointment
- `GET /api/appointments/:phone` - Get appointments
- `POST /api/health-alerts/subscribe` - Subscribe to health alerts
- `GET /api/health-alerts/active` - Get active alerts
- `POST /api/places/nearby` - Find nearby medical facilities

## 👥 Development Team

- **Abhishek Kumar Pal** - Lead Developer (B.Tech)
- **Aditi Sinha** - Frontend Developer (B.Tech Pursuing)
- **Aasta Tiwari** - Backend Developer (B.Tech Pursuing)
- **Abhinav Tomar** - AI Specialist (B.Tech Pursuing)
- **Aditya Koundal** - DevOps Engineer (B.Tech Pursuing)
- **Arya Gupta** - QA Engineer (B.Tech Pursuing)

### Medical Advisory
- **Dr. Ramesh Pal** - Chief Medical Advisor, INDIRA GANDHI ESI HOSPITAL

## 🔒 Security & Privacy

- **Data Encryption** - All sensitive data encrypted
- **HIPAA Ready** - Healthcare compliance standards
- **Privacy by Design** - User privacy prioritized
- **Secure APIs** - Protected endpoints with validation

## 📱 Usage Examples

### Schedule Vaccination Reminder
```
User: "name: John vaccine: Polio date: 2024-02-15 time: 09:00"
Bot: "✅ Vaccination reminder scheduled successfully!"
```

### Find Nearby Hospital
```
User: "find hospital near me"
Bot: Shows list of nearby hospitals with maps links
```

### Book Appointment
```
User: "appointment: patient: John doctor: Dr. Smith specialty: Cardiology hospital: City Hospital date: 2024-02-15 time: 10:00"
Bot: "✅ Appointment scheduled successfully!"
```

## 🌐 Deployment

### Recommended: Vercel + Railway
1. **Frontend (Vercel)**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `dist`

2. **Backend (Railway)**
   - Connect GitHub repository
   - Set start command: `npm start`
   - Add environment variables

### Alternative Platforms
- **Netlify** - Frontend hosting
- **Render** - Full-stack deployment
- **Heroku** - Traditional PaaS
- **AWS Amplify** - Enterprise solution

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

- **Email**: surakshabot8@gmail.com
- **WhatsApp**: +1 (415) 523-8886
- **Issues**: GitHub Issues page

## ⚠️ Medical Disclaimer

Surakshabot provides health information for educational purposes only. Always consult with qualified healthcare professionals for medical advice, diagnosis, or treatment. This AI assistant is not a substitute for professional medical care.

---

**Made with ❤️ by the Surakshabot Team**