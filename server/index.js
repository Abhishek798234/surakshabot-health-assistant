const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 8000;

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

// API routes (must come before static file serving)
app.use('/api/vaccination', vaccinationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/health-alerts', healthAlertsRoutes);
app.use('/api/appointments', appointmentRoutes);

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

// Serve frontend for all non-API routes (must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Frontend: http://localhost:${PORT}`);
  console.log(`✅ API: http://localhost:${PORT}/api`);
});

module.exports = app;