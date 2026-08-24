const express = require('express');
const router = express.Router();
const {
  getSubjectOverview,
  getRandomQuestion,
  getQuestions,
  getQuestionById,
  getCategories,
} = require('../controllers/questionController');

// IMPORTANT: /subjects, /random and /categories must come before /:id
router.get('/subjects', getSubjectOverview);
router.get('/random', getRandomQuestion);
router.get('/categories', getCategories);
router.get('/', getQuestions);
router.get('/:id', getQuestionById);

module.exports = router;
