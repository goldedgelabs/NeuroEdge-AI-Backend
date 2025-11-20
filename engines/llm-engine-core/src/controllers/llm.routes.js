const express = require('express');
const router = express.Router();
const llmController = require('../controllers/llmController');

router.post('/generate', llmController.generateText);
router.post('/summarize', llmController.summarizeText);
router.post('/translate', llmController.translateText);

module.exports = router;
