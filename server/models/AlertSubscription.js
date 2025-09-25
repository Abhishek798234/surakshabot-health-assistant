const mongoose = require('mongoose');

const alertSubscriptionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  location: {
    state: String,
    district: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  preferences: {
    email: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  categories: [{
    type: String,
    enum: ['OUTBREAK', 'VACCINATION', 'ADVISORY', 'EMERGENCY']
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AlertSubscription', alertSubscriptionSchema);