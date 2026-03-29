const router = require('express').Router();
const {
  createSession,
  getAllSessions,
  getSessionById,
} = require('../controllers/sessionController');

router.post('/', createSession);
router.get('/', getAllSessions);
router.get('/:id', getSessionById);

module.exports = router;