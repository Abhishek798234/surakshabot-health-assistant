const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create or get user
router.post('/', async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    
    let user = await User.findOne({ phone });
    
    if (!user) {
      user = new User({ name, phone, email });
      await user.save();
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user by phone
router.get('/:phone', async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    res.json({ success: true, user });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;