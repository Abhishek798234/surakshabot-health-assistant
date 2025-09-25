const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

module.exports = app;