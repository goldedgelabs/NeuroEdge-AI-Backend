const { getEmbeddings } = require('./embeddingsService');
const { saveToMemory, getFromMemory } = require('./memoryService');
const { reasoning } = require('./reasoningService');
const logger = require('../utils/logger');

exports.generate = async (prompt, userId, model='core-llm') => {
    logger.info(`[LLM] Generating text for user: ${userId}`);
    
    // Optionally retrieve memory context
    const context = await getFromMemory(userId);
    
    // Combine prompt + context
    const fullPrompt = `${context || ''}\n${prompt}`;
    
    // Call LLM (could be local model or API)
    const output = await fakeLLMGenerate(fullPrompt, model);
    
    // Save conversation to memory
    await saveToMemory(userId, fullPrompt, output);
    
    // Optional: reasoning
    const reasoningSteps = await reasoning(fullPrompt, output);
    
    return { text: output, reasoning: reasoningSteps };
};

// Placeholder for real LLM call
async function fakeLLMGenerate(prompt, model) {
    return `Generated output for model ${model}: ${prompt.substring(0, 50)}...`;
}

exports.summarize = async (text, userId) => {
    // Similar flow: call LLM with summarization prompt
    const summary = await fakeLLMGenerate(`Summarize: ${text}`, 'summary-llm');
    return summary;
};

exports.translate = async (text, targetLang, userId) => {
    const translation = await fakeLLMGenerate(`Translate to ${targetLang}: ${text}`, 'translate-llm');
    return translation;
};
