const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

// Manual CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Also use cors middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Import routes
const vaccinationRoutes = require('./routes/vaccination');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const placesRoutes = require('./routes/places');
const healthAlertsRoutes = require('./routes/healthAlerts');
const appointmentRoutes = require('./routes/appointments');

// Use routes
app.use('/api/vaccination', vaccinationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/health-alerts', healthAlertsRoutes);
app.use('/api/appointments', appointmentRoutes);

// Root route - API information
app.get('/', (req, res) => {
  res.json({
    name: 'Surakshabot Health Assistant API',
    version: '1.0.0',
    status: 'Running',
    message: 'Welcome to Surakshabot API! This is the backend service.',
    endpoints: {
      health: '/health',
      healthCheck: '/healthz',
      users: '/api/users',
      appointments: '/api/appointments',
      vaccinations: '/api/vaccination',
      healthAlerts: '/api/health-alerts',
      places: '/api/places'
    },
    frontend: 'Visit the main website for the chatbot interface',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint for Render
app.get('/healthz', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Surakshabot API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

module.exports = app;