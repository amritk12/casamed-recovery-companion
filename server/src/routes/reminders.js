const router = require('express').Router();
const {
  triggerReminder,
  updateReminderStatus,
} = require('../controllers/reminderController');

router.post('/trigger', triggerReminder);
router.post('/status', updateReminderStatus);

module.exports = router;