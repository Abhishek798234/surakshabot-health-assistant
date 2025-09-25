const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  doctorName: { type: String, required: true },
  specialty: { type: String, required: true },
  hospitalName: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  symptoms: { type: String },
  status: { type: String, enum: ['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'], default: 'SCHEDULED' },
  reminderSent: { type: Boolean, default: false },
  notes: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', appointmentSchema);