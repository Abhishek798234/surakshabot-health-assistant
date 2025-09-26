const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Appointment = require('../models/Appointment');

// Initialize Twilio client only if credentials are available
let client;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Format phone number to international format
const formatPhoneNumber = (phone) => {
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '+91' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+91' + cleanPhone;
  }
  return cleanPhone;
};

// Schedule appointment
router.post('/schedule', async (req, res) => {
  try {
    const { patientName, phone, email, doctorName, specialty, hospitalName, appointmentDate, appointmentTime, symptoms } = req.body;
    
    const formattedPhone = formatPhoneNumber(phone);
    
    const appointment = new Appointment({
      patientName,
      phone: formattedPhone,
      email,
      doctorName,
      specialty,
      hospitalName,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      symptoms
    });
    
    await appointment.save();
    
    // Send confirmation message if Twilio is available
    if (client) {
      const confirmationMessage = `✅ Appointment Scheduled Successfully!\n\nPatient: ${patientName}\nDoctor: Dr. ${doctorName} (${specialty})\nHospital: ${hospitalName}\nDate: ${new Date(appointmentDate).toDateString()}\nTime: ${appointmentTime}\n\nYou will receive a reminder 1 day before your appointment.\n\nAppointment ID: ${appointment._id}`;
      
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
      message: 'Appointment scheduled successfully',
      appointment 
    });
    
  } catch (error) {
    console.error('Appointment scheduling error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get appointments for a phone number
router.get('/:phone', async (req, res) => {
  try {
    const formattedPhone = formatPhoneNumber(req.params.phone);
    const appointments = await Appointment.find({ 
      phone: formattedPhone,
      appointmentDate: { $gte: new Date() }
    }).sort({ appointmentDate: 1 });
    
    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cron job to send appointment reminders (runs daily at 10 AM)
cron.schedule('0 10 * * *', async () => {
  console.log('Checking for appointment reminders...');
  
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    
    const pendingReminders = await Appointment.find({
      appointmentDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      reminderSent: false,
      status: { $in: ['SCHEDULED', 'CONFIRMED'] }
    });
    
    for (const appointment of pendingReminders) {
      try {
        if (client) {
          const reminderMessage = `🏥 Appointment Reminder\n\nHello ${appointment.patientName}!\n\nYou have an appointment tomorrow:\n\nDoctor: Dr. ${appointment.doctorName} (${appointment.specialty})\nHospital: ${appointment.hospitalName}\nDate: ${appointment.appointmentDate.toDateString()}\nTime: ${appointment.appointmentTime}\n\nPlease arrive 15 minutes early.\n\nAppointment ID: ${appointment._id}`;

          await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${appointment.phone}`,
            body: reminderMessage
          });
        }
        
        appointment.reminderSent = true;
        await appointment.save();
        
        console.log(`Reminder sent for appointment: ${appointment._id}`);
        
      } catch (error) {
        console.error(`Failed to send reminder for appointment ${appointment._id}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Appointment reminder cron job error:', error);
  }
});

module.exports = router;