const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);