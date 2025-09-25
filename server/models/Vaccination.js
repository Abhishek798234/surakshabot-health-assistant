const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  vaccine: { type: String, required: true },
  dueDate: { type: Date, required: true },
  reminderTime: { type: String, required: true },
  reminderSent: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vaccination', vaccinationSchema);