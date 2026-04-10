const express = require('express');
const router = express.Router();
const { queryOpenAI } = require('../clients/openai');
const { queryClaude } = require('../clients/anthropic');
const { queryGemini } = require('../clients/gemini');
const { queryDeepSeek } = require('../clients/deepseek');
const { analyzeResults } = require('../analysis/analyze');

// Map model id → actual query function
const MODEL_HANDLERS = {
  gpt4o: queryOpenAI,
  claude: queryClaude,
  gemini: queryGemini,
  deepseek: queryDeepSeek,
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

module.exports = router;
