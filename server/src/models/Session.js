const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    sessionType: {
      type: String,
      enum: ['home', 'clinic', 'tele'],
      required: true,
    },
    sessionDateTime: {
      type: Date,
      required: true,
    },
    therapistName: {
      type: String,
      required: true,
      trim: true,
    },
    reminderStatus: {
      type: String,
      enum: ['pending', 'sent_24h', 'sent_1h', 'done'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);