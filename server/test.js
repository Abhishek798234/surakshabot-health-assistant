// Simple test script to verify backend functionality
const express = require('express');

console.log('Testing backend dependencies...');

try {
  const mongoose = require('mongoose');
  console.log('✅ Mongoose loaded successfully');
  
  const twilio = require('twilio');
  console.log('✅ Twilio loaded successfully');
  
  const cron = require('node-cron');
  console.log('✅ Node-cron loaded successfully');
  
  const cors = require('cors');
  console.log('✅ CORS loaded successfully');
  
  console.log('✅ All backend dependencies are working!');
  
  // Test environment variables
  require('dotenv').config();
  
  console.log('\nEnvironment Variables Check:');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
  console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing');
  console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing');
  console.log('TWILIO_WHATSAPP_NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER ? '✅ Set' : '❌ Missing');
  
} catch (error) {
  console.error('❌ Error loading dependencies:', error.message);
  console.log('\nPlease run: npm install');
}