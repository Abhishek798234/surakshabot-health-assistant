const mongoose = require('mongoose');

const healthAlertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
  category: { type: String, enum: ['OUTBREAK', 'VACCINATION', 'ADVISORY', 'EMERGENCY'], required: true },
  location: {
    state: String,
    district: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  affectedPopulation: Number,
  source: { type: String, default: 'Ministry of Health' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('HealthAlert', healthAlertSchema);