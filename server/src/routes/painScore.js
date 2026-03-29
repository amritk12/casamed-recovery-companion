const router = require('express').Router();
const { logPainScore, getPainScores } = require('../controllers/painScoreController');

router.post('/', logPainScore);
router.get('/:patientId', getPainScores);

module.exports = router;