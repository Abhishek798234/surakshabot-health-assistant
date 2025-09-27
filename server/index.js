const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 10000; // Render uses port 10000 by default

// CORS configuration
app.use(cors());
app.use(express.json());

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('✅ Connected to MongoDB');
  }).catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
  });
} else {
  console.error('❌ MONGODB_URI not found in environment variables');
}

// Import routes
const vaccinationRoutes = require('./routes/vaccination');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const placesRoutes = require('./routes/places');
const healthAlertsRoutes = require('./routes/healthAlerts');
const appointmentRoutes = require('./routes/appointments');
const whatsappRoutes = require('./routes/whatsapp');

// API routes (must come before static file serving)
app.use('/api/vaccination', vaccinationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/health-alerts', healthAlertsRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/sms', require('./routes/sms'));

// SMS test endpoint
app.get('/api/sms/test', (req, res) => {
  res.json({
    success: true,
    message: 'SMS service is running',
    timestamp: new Date().toISOString(),
    routes: [
      'GET /api/sms/webhook - Webhook verification',
      'POST /api/sms/webhook - SMS message handler', 
      'POST /api/sms/send-test - Send test SMS'
    ]
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    const otpCount = await mongoose.connection.db.collection('otps').countDocuments();
    
    res.json({ 
      status: 'Server is running', 
      mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      users: userCount,
      otps: otpCount,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.json({ 
      status: 'Server is running', 
      mongodb: 'Error',
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
});

// Test CORS endpoint
app.get('/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS is working!',
    origin: req.headers.origin,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// List all routes for debugging
app.get('/api/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.json({
    success: true,
    routes: routes,
    smsRouteExists: routes.some(r => r.path && r.path.includes('/api/sms')),
    timestamp: new Date().toISOString()
  });
});

// Serve frontend for all non-API routes (must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
});

module.exports = app;