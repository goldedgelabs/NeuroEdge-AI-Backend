const llmService = require('../services/llmService');

exports.generateText = async (req, res) => {
    const { prompt, userId, model } = req.body;
    try {
        const output = await llmService.generate(prompt, userId, model);
        res.json({ output });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.summarizeText = async (req, res) => {
    const { text, userId } = req.body;
    try {
        const summary = await llmService.summarize(text, userId);
        res.json({ summary });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.translateText = async (req, res) => {
    const { text, targetLang, userId } = req.body;
    try {
        const translation = await llmService.translate(text, targetLang, userId);
        res.json({ translation });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
