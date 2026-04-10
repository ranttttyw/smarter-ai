const OpenAI = require('openai');

// DeepSeek uses OpenAI-compatible API
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

async function queryDeepSeek(prompt) {
  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
  });
  return response.choices[0].message.content;
}

module.exports = { queryDeepSeek };
