Surakshabot Health Assistant
AI-powered health chatbot with multi-platform accessibility through web, WhatsApp, and SMS interfaces.

Features
🤖 AI Health Assistant - Google Gemini-powered medical guidance

📱 WhatsApp Integration - Complete health services via WhatsApp chat

💬 SMS Support - Health alerts and appointment reminders via SMS

🏥 Medical Facility Finder - GPS-based hospital/clinic recommendations

📅 Appointment Management - Book and track medical appointments

💉 Vaccination Tracking - Schedule and reminder system

🚨 Health Alerts - Real-time notifications across all platforms

🌐 Multi-Language Support - Accessible in multiple languages

♿ Accessibility Features - Voice input/output, screen reader support

Accessibility Channels
1. Web Interface
Responsive design for all devices

Voice input and text-to-speech

Keyboard navigation support

Screen reader compatibility

2. WhatsApp Bot
Send messages to your Twilio WhatsApp number

Full chatbot functionality via WhatsApp

Appointment booking through chat

Health alerts and reminders

Voice message support

3. SMS Services
Text-based health consultations

Appointment confirmations

Vaccination reminders

Emergency health alerts

Works on any mobile phone

Quick Start
Prerequisites
Node.js >= 18.0.0

MongoDB Atlas account

Google Gemini API key

Twilio account (for WhatsApp/SMS)

Installation
# Install dependencies
npm install
cd server && npm install && cd ..

# Setup environment
cp .env.example .env
# Add your API keys to .env

# Run application
npm run dev

Copy

Insert at cursor
bash
Access Points
Web: http://localhost:8000

WhatsApp: Message your Twilio WhatsApp number

SMS: Text your Twilio phone number

API: http://localhost:8000/api

Environment Variables
VITE_GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_uri
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+your_number
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=8000

Copy

Insert at cursor
env
Multi-Platform Usage
WhatsApp Commands
"Hi" - Start conversation

"Book appointment" - Schedule medical visit

"Find hospital" - Locate nearby facilities

"Health alert" - Subscribe to notifications

"Vaccination" - Track immunizations

SMS Commands
Text "HELP" for command list

"BOOK [date] [time]" - Quick appointment

"ALERT ON/OFF" - Toggle notifications

"FIND [location]" - Nearby facilities

API Endpoints
Core Services
POST /api/auth/register - User registration

GET /api/appointments - Appointment management

GET /api/places/nearby - Medical facilities

POST /api/health-alerts - Alert subscriptions

Communication Channels
POST /api/whatsapp/webhook - WhatsApp message handling

POST /api/sms/webhook - SMS message processing

POST /api/sms/send - Send SMS notifications

POST /api/whatsapp/send - Send WhatsApp messages

Scripts
npm run dev - Development mode (web + API)

npm run build - Production build

npm start - Production server

Tech Stack
Frontend: React 18, TypeScript, Tailwind CSS, Vite
Backend: Node.js, Express, MongoDB, Mongoose
AI: Google Gemini API
Communication: Twilio (WhatsApp/SMS), SendGrid (Email)
Maps: Google Maps API

License
MIT License - Surakshabot Team

