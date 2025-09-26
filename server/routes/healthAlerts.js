const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const emailjs = require('@emailjs/nodejs');
const cron = require('node-cron');
const HealthAlert = require('../models/HealthAlert');
const AlertSubscription = require('../models/AlertSubscription');

// Initialize Twilio client only if credentials are available
let client;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// EmailJS configuration for health alerts
const emailConfig = {
  serviceId: process.env.EMAILJS_SERVICE_ID,
  templateId: process.env.EMAILJS_TEMPLATE_ID,
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY
};

// Subscribe to health alerts
router.post('/subscribe', async (req, res) => {
  try {
    const { name, phone, email, location, preferences, categories } = req.body;
    
    const subscription = new AlertSubscription({
      userId: phone, // Using phone as unique identifier
      name,
      phone,
      email,
      location,
      preferences: preferences || { email: true, whatsapp: true, sms: false },
      categories: categories || ['OUTBREAK', 'VACCINATION', 'ADVISORY', 'EMERGENCY']
    });
    
    await subscription.save();
    
    // Send confirmation
    const confirmationMessage = `✅ Health Alert Subscription Activated!\n\nHello ${name},\n\nYou will now receive real-time health alerts for:\n${categories.join(', ')}\n\nNotification methods:\n${preferences.email ? '📧 Email' : ''}${preferences.whatsapp ? '\n📱 WhatsApp' : ''}${preferences.sms ? '\n💬 SMS' : ''}\n\nStay safe and informed!`;
    
    if (preferences.whatsapp && client) {
      try {
        await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: `whatsapp:${phone}`,
          body: confirmationMessage
        });
      } catch (twilioError) {
        console.error('WhatsApp send error:', twilioError);
      }
    }
    
    res.json({ success: true, message: 'Successfully subscribed to health alerts' });
    
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get active health alerts
router.get('/active', async (req, res) => {
  try {
    const { location } = req.query;
    
    let query = { 
      isActive: true, 
      expiresAt: { $gt: new Date() } 
    };
    
    // Filter by location if provided
    if (location) {
      query.$or = [
        { 'location.state': new RegExp(location, 'i') },
        { 'location.district': new RegExp(location, 'i') }
      ];
    }
    
    const alerts = await HealthAlert.find(query)
      .sort({ severity: -1, createdAt: -1 })
      .limit(10);
    
    res.json({ success: true, alerts });
    
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mock government health data integration
const fetchGovernmentHealthData = async () => {
  // Simulating government health database integration
  const mockAlerts = [
    {
      alertId: `ALERT_${Date.now()}_1`,
      title: 'Dengue Outbreak Alert - Delhi',
      description: 'Increased dengue cases reported in South Delhi. Take preventive measures against mosquito breeding.',
      severity: 'HIGH',
      category: 'OUTBREAK',
      location: { state: 'Delhi', district: 'South Delhi', coordinates: { latitude: 28.5355, longitude: 77.3910 } },
      affectedPopulation: 150,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    },
    {
      alertId: `ALERT_${Date.now()}_2`,
      title: 'COVID-19 Vaccination Drive',
      description: 'Free COVID-19 booster shots available at all government hospitals. Book your slot now.',
      severity: 'MEDIUM',
      category: 'VACCINATION',
      location: { state: 'All States', district: 'All Districts' },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  ];
  
  return mockAlerts;
};

// Send alert notifications
const sendAlertNotifications = async (alert) => {
  try {
    const subscriptions = await AlertSubscription.find({
      isActive: true,
      categories: alert.category
    });
    
    for (const subscription of subscriptions) {
      const alertMessage = `🚨 ${alert.severity} HEALTH ALERT\n\n${alert.title}\n\n${alert.description}\n\nLocation: ${alert.location.state}${alert.location.district ? `, ${alert.location.district}` : ''}\n\nSource: ${alert.source}\n\nStay safe and follow health guidelines.`;
      
      // Send WhatsApp notification
      if (subscription.preferences.whatsapp && client) {
        try {
          await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${subscription.phone}`,
            body: alertMessage
          });
        } catch (error) {
          console.error(`WhatsApp error for ${subscription.phone}:`, error);
        }
      }
      
      // Send Email notification via EmailJS
      if (subscription.preferences.email && subscription.email && emailConfig.serviceId) {
        try {
          const templateParams = {
            to_email: subscription.email,
            to_name: subscription.name,
            alert_title: alert.title,
            alert_description: alert.description,
            alert_severity: alert.severity,
            alert_location: `${alert.location.state}${alert.location.district ? `, ${alert.location.district}` : ''}`,
            from_name: 'Surakshabot Health Alert System'
          };
          
          await emailjs.send(
            emailConfig.serviceId,
            emailConfig.templateId,
            templateParams,
            {
              publicKey: emailConfig.publicKey,
              privateKey: emailConfig.privateKey
            }
          );
        } catch (error) {
          console.error(`EmailJS error for ${subscription.email}:`, error);
        }
      }
      
      // Send SMS notification
      if (subscription.preferences.sms && client) {
        try {
          await client.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
            to: subscription.phone,
            body: alertMessage.substring(0, 160) // SMS character limit
          });
        } catch (error) {
          console.error(`SMS error for ${subscription.phone}:`, error);
        }
      }
    }
    
    console.log(`Alert notifications sent for: ${alert.title}`);
    
  } catch (error) {
    console.error('Send notifications error:', error);
  }
};

// Cron job to fetch and process health alerts (runs every 30 minutes)
cron.schedule('*/30 * * * *', async () => {
  console.log('Fetching government health data...');
  
  try {
    const governmentAlerts = await fetchGovernmentHealthData();
    
    for (const alertData of governmentAlerts) {
      // Check if alert already exists
      const existingAlert = await HealthAlert.findOne({ alertId: alertData.alertId });
      
      if (!existingAlert) {
        // Create new alert
        const newAlert = new HealthAlert(alertData);
        await newAlert.save();
        
        // Send notifications
        await sendAlertNotifications(newAlert);
        
        console.log(`New health alert processed: ${alertData.title}`);
      }
    }
    
  } catch (error) {
    console.error('Health data fetch error:', error);
  }
});

module.exports = router;