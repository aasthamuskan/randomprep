const express = require('express');
const router = express.Router();
const {
  savePractice,
  getHistory,
  getStats,
  transcribeAudio,
} = require('../controllers/practiceController');

router.post('/', savePractice);
router.post('/transcribe', transcribeAudio);
router.get('/history', getHistory);
router.get('/stats', getStats);

module.exports = router;
