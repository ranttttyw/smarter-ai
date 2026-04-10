const express = require('express');
const router = express.Router();
const { queryOpenAI } = require('../clients/openai');
const { queryClaude } = require('../clients/anthropic');
const { queryGemini } = require('../clients/gemini');
const { queryDeepSeek } = require('../clients/deepseek');
const { queryGLM } = require('../clients/glm');
const { analyzeResults } = require('../analysis/analyze');

// Map model id → actual query function
const MODEL_HANDLERS = {
  gpt4o: queryOpenAI,
  claude: queryClaude,
  gemini: queryGemini,
  deepseek: queryDeepSeek,
  glm: queryGLM,
};

// POST /api/compare
// Body: { prompt: string, models: ['gpt4o', 'claude', 'gemini'] }
router.post('/compare', async (req, res) => {
  const { prompt, models } = req.body;

  // Validate
  if (!prompt || !models || models.length === 0) {
    return res.status(400).json({ error: 'prompt and models are required' });
  }
  if (models.length > 3) {
    return res.status(400).json({ error: 'max 3 models allowed' });
  }

  // Run all selected models in parallel
  // Even if one fails, the others still return
  const tasks = models.map(async (modelId) => {
    const handler = MODEL_HANDLERS[modelId];
    if (!handler) {
      return { modelId, content: null, error: `Unknown model: ${modelId}` };
    }
    try {
      const content = await handler(prompt);
      return { modelId, content, error: null };
    } catch (err) {
      console.error(`Error from ${modelId}:`, err.message);
      return { modelId, content: null, error: err.message };
    }
  });

  const results = await Promise.all(tasks);

  // Run writing analysis on the results
  const analysis = await analyzeResults(prompt, results);

  res.json({ results, analysis });
});

// POST /api/chat
// Body: { model: 'deepseek', messages: [{role, content}, ...] }
// Supports multi-turn conversation with a single model
router.post('/chat', async (req, res) => {
  const { model, messages } = req.body;

  if (!model || !messages || messages.length === 0) {
    return res.status(400).json({ error: 'model and messages are required' });
  }

  const handler = MODEL_HANDLERS[model];
  if (!handler) {
    return res.status(400).json({ error: `Unknown model: ${model}` });
  }

  try {
    // For multi-turn, we send the last user message but include context
    // Build a combined prompt with conversation history
    const contextPrompt = messages
      .map(m => m.role === 'user' ? `用户：${m.content}` : `助手：${m.content}`)
      .join('\n\n');

    const content = await handler(contextPrompt);
    res.json({ content });
  } catch (err) {
    console.error(`Chat error from ${model}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
