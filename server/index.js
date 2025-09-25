const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000', 
  'https://suraksha8bot.netlify.app',
  'https://idyllic-tiramisu-3c3358.netlify.app'
];

// Add frontend URL from environment if available
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches netlify pattern
    if (allowedOrigins.includes(origin) || /\.netlify\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
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