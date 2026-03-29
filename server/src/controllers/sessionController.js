const Session = require('../models/Session');

// POST /api/sessions
const createSession = async (req, res) => {
  try {
    const {
      patientName,
      phoneNumber,
      sessionType,
      sessionDateTime,
      therapistName,
    } = req.body;

    if (!patientName || !phoneNumber || !sessionType || !sessionDateTime || !therapistName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const session = new Session({
      patientName,
      phoneNumber,
      sessionType,
      sessionDateTime: new Date(sessionDateTime),
      therapistName,
      reminderStatus: 'pending',
    });

    await session.save();

    res.status(201).json({
      message: 'Session created successfully',
      session,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/sessions
const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ sessionDateTime: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/sessions/:id
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createSession, getAllSessions, getSessionById };