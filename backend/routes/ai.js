const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/chat', aiController.chat);
router.get('/history', aiController.getChatHistory);
router.get('/flashcards', aiController.getFlashcards);
router.post('/generate-quiz', aiController.generateQuiz);
router.post('/generate-flashcards', aiController.generateFlashcards);
router.patch('/flashcards/:id', aiController.updateFlashcardReview);

module.exports = router;
