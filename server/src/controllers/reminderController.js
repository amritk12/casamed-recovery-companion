const Session = require('../models/Session');
const axios = require('axios');

const sendWhatsAppMessage = async (phone, templateParams) => {
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: 'casamed_session_reminder',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: templateParams.map((p) => ({
            type: 'text',
            text: p,
          })),
        },
      ],
    },
  };

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

// POST /api/reminders/trigger
const triggerReminder = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sessionDate = new Date(session.sessionDateTime);
    const formattedDate = sessionDate.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata',
    });

    const templateParams = [
      session.patientName,
      session.therapistName,
      formattedDate,
    ];

    const waResult = await sendWhatsAppMessage(
      session.phoneNumber,
      templateParams
    );

    // Update reminder status
    session.reminderStatus = 'sent_24h';
    await session.save();

    res.json({
      message: 'WhatsApp reminder sent successfully',
      whatsappResponse: waResult,
      session,
    });
  } catch (err) {
    console.error('Reminder error:', err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data || err.message,
    });
  }
};
// POST /api/reminders/status (called by Java scheduler)
const updateReminderStatus = async (req, res) => {
  try {
    const { sessionId, status } = req.body;
    const session = await Session.findByIdAndUpdate(
      sessionId,
      { reminderStatus: status },
      { new: true }
    );
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ message: 'Status updated', session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { triggerReminder, updateReminderStatus };