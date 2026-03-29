const ChatMessage = require('../models/ChatMessage');
const axios = require('axios');

const sendMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }

    await ChatMessage.create({ sessionId, role: 'user', content: message });

    const history = await ChatMessage.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(6);

    const conversationContext = history
      .reverse()
      .map((msg) => `${msg.role === 'user' ? 'Patient' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You are CasaMed AI physiotherapy assistant. When a patient describes their condition, provide 3-5 personalized exercise recommendations. Always respond with ONLY valid JSON, no extra text, no markdown, no code blocks. Use this exact format: {"recommendations":[{"name":"Exercise Name","description":"Clear step by step instructions","duration":"30 seconds","reps":"10 reps"}],"disclaimer":"These recommendations are for guidance only and are not a substitute for professional medical diagnosis or treatment. Please consult your CasaMed physiotherapist before starting any exercise program."}'
          },
          {
            role: 'user',
            content: `Previous conversation:\n${conversationContext}\n\nCurrent patient message: ${message}`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const rawText = response.data.choices[0].message.content;
    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error('Groq returned non-JSON:', rawText);
      return res.status(500).json({ error: 'AI returned invalid format. Please try again.' });
    }

    await ChatMessage.create({ sessionId, role: 'assistant', content: JSON.stringify(parsed) });

    res.json(parsed);
  } catch (err) {
    console.error('Chat error FULL:', JSON.stringify(err.response?.data) || err.message);
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ sessionId: req.params.sessionId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { sendMessage, getChatHistory };
