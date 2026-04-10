const OpenAI = require('openai');

// GLM-4-Flash via Zhipu AI — OpenAI-compatible endpoint
const client = new OpenAI({
  apiKey: process.env.ZHIPU_API_KEY,
  baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
});

async function queryGLM(prompt) {
  const response = await client.chat.completions.create({
    model: 'glm-4-flash',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
  });
  return response.choices[0].message.content;
}

module.exports = { queryGLM };
