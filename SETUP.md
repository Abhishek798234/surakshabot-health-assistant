# Surakshabot Setup Guide

## Prerequisites
1. Node.js (v16 or higher)
2. MongoDB (local or cloud)
3. Twilio Account with WhatsApp Business API

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. MongoDB Setup
- Install MongoDB locally or use MongoDB Atlas
- Create a database named `HealthChatbotDB`
- Update `MONGODB_URI` in `.env` file

### 3. Twilio WhatsApp Setup
1. Create a Twilio account at https://www.twilio.com
2. Get your Account SID and Auth Token from Twilio Console
3. Set up WhatsApp Sandbox or get approved WhatsApp Business API
4. Update the following in `.env` file:
   - `TWILIO_ACCOUNT_SID=your_account_sid`
   - `TWILIO_AUTH_TOKEN=your_auth_token`
   - `TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886` (or your approved number)

### 4. Environment Variables
Update your `.env` file with:
```
VITE_GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb://127.0.0.1:27017/HealthChatbotDB
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
PORT=8001
```

### 5. Start the Application
```bash
npm run dev
```

This will start both the frontend (Vite) and backend (Express) servers concurrently.

## Features Added

### 1. User Registration
- Users can register by saying: "My name is [Name] and my phone number is [Phone]"
- User data is stored in MongoDB

### 2. Vaccination Reminders
- Schedule vaccination reminders with: "name: John vaccine: Polio date: 2024-02-15 time: 09:00"
- Automatic WhatsApp confirmation sent immediately
- Reminder sent one day before due date

### 3. WhatsApp Integration
- Immediate confirmation messages
- Automated reminder system using cron jobs
- Runs daily at 9 AM to check for pending reminders

### 4. Health Assistant
- AI-powered health guidance using Gemini 2.0 Flash
- Personalized responses based on user context
- Educational health information with medical disclaimers

## API Endpoints

### Backend Server (Port 8001)
- `POST /api/users` - Create or get user
- `GET /api/users/:phone` - Get user by phone
- `POST /api/vaccination/schedule` - Schedule vaccination reminder
- `GET /api/vaccination/:phone` - Get vaccinations for user
- `GET /health` - Health check

## Troubleshooting

1. **MongoDB Connection Issues**: Ensure MongoDB is running and connection string is correct
2. **Twilio Errors**: Verify Account SID, Auth Token, and WhatsApp number are correct
3. **Port Conflicts**: Change PORT in .env if 8001 is already in use
4. **CORS Issues**: Backend includes CORS middleware for frontend communication

## Testing WhatsApp Integration

1. Join Twilio WhatsApp Sandbox (for testing)
2. Send the join code to the sandbox number
3. Register a user in the chatbot with your WhatsApp number
4. Schedule a vaccination reminder
5. Check your WhatsApp for confirmation message