const { queryDeepSeek } = require('../clients/deepseek');

/**
 * Given an array of { modelId, content } results,
 * call DeepSeek to generate a structured writing analysis.
 * Returns parsed JSON with per-model tags + overall diff summary.
 */
async function analyzeResults(prompt, results) {
  // Only analyze results that actually have content
  const validResults = results.filter(r => r.content && !r.error);
  if (validResults.length === 0) return null;

  const responsesText = validResults
    .map(r => `【${r.modelId}的回答】\n${r.content}`)
    .join('\n\n---\n\n');

  const analysisPrompt = `
你是一个写作风格分析专家。用户发出了这个写作请求：
「${prompt}」

以下是不同AI模型的回答：

${responsesText}

请对每个模型的回答进行写作维度分析，并总结它们之间的核心差异。

严格按照以下JSON格式输出，不要有任何额外文字：
{
  "summary": "一段话总结各模型回答的核心差异（50字以内）",
  "chips": ["差异亮点1", "差异亮点2", "差异亮点3"],
  "models": {
    "模型id": {
      "tags": [
        {"label": "标签文字", "type": "tone|structure|quality|warning"}
      ],
      "stats": {
        "创意度": 0到100的数字,
        "文采": 0到100的数字,
        "实用性": 0到100的数字,
        "口语化": 0到100的数字
      },
      "keyPoint": "这个模型回答最突出的一个特点（20字以内）"
    }
  }
}

tags的type说明：
- tone: 语气风格（如：口语化、正式、文学感）
- structure: 结构特点（如：分段清晰、列表式、流水文）
- quality: 质量亮点（如：开头吸引人、有独特观点、举例具体）
- warning: 潜在问题（如：有陈词滥调、内容空泛、偏离主题）
`;

  try {
    const raw = await queryDeepSeek(analysisPrompt);
    // Extract JSON from the response (strip any markdown code blocks)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in analysis response');
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('Analysis failed:', err.message);
    return null;
  }
}

module.exports = { analyzeResults };
