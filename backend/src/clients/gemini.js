const { GoogleGenerativeAI } = require('@google/generative-ai');

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function queryGemini(prompt) {
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { queryGemini };
