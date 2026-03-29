const getFirebaseAdmin = require('../config/firebase');

// POST /api/pain-score
const logPainScore = async (req, res) => {
  try {
    const { patientId, patientName, score, note } = req.body;

    if (!patientId || !patientName || score === undefined) {
      return res.status(400).json({ error: 'patientId, patientName and score are required' });
    }

    if (score < 0 || score > 10) {
      return res.status(400).json({ error: 'Score must be between 0 and 10' });
    }
const db = getFirebaseAdmin().firestore();
    const entry = {
      patientId,
      patientName,
      score,
      note: note || '',
      recordedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('painScores').add(entry);

    res.status(201).json({
      message: 'Pain score logged successfully',
      id: docRef.id,
      entry,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/pain-score/:patientId
const getPainScores = async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db
      .collection('painScores')
      .where('patientId', '==', req.params.patientId)
      .orderBy('recordedAt', 'desc')
      .get();

    const scores = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};

module.exports = { logPainScore, getPainScores };