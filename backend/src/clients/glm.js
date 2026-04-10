const OpenAI = require('openai');
const jwt = require('jsonwebtoken');

/**
 * Zhipu AI (GLM-4-Flash) client.
 *
 * Key format note:
 * - Old format: "id.secret" → must generate a JWT token
 * - New format: plain string → use directly as Bearer token
 */
function generateZhipuToken(apiKey) {
  const [id, secret] = apiKey.split('.');
  const now = Date.now();
  const payload = {
    api_key: id,
    exp: now + 3600 * 1000,   // 1 hour
    timestamp: now,
  };
  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    header: { alg: 'HS256', sign_type: 'SIGN' },
  });
}

function getAuthToken(apiKey) {
  // If key contains a dot, it's the old id.secret format → generate JWT
  if (apiKey && apiKey.includes('.')) {
    return generateZhipuToken(apiKey);
  }
  // New format: use directly
  return apiKey;
}

async function queryGLM(prompt) {
  const apiKey = process.env.ZHIPU_API_KEY;
  const token = getAuthToken(apiKey);

  const client = new OpenAI({
    apiKey: token,
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  });

  const response = await client.chat.completions.create({
    model: 'glm-4.7-flash',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
  });
  return response.choices[0].message.content;
}

module.exports = { queryGLM };
