const { queryDeepSeek } = require('../clients/deepseek');

/**
 * Analyze writing-style differences across multiple model responses.
 * Returns structured JSON, or null if < 2 valid results (nothing to compare).
 */
async function analyzeResults(prompt, results) {
  const validResults = results.filter(r => r.content && !r.error);

  // Need at least 2 models to have a meaningful comparison
  if (validResults.length < 2) return null;

  // Truncate each response to save tokens and speed up analysis
  const MAX_CHARS = 600;
  const responsesText = validResults
    .map(r => {
      const snippet = r.content.length > MAX_CHARS
        ? r.content.slice(0, MAX_CHARS) + '…（已截取）'
        : r.content;
      return `【${r.modelId}】\n${snippet}`;
    })
    .join('\n\n---\n\n');

  const analysisPrompt = `
你是写作风格分析专家。用户的写作请求是：
「${prompt}」

以下是不同AI模型的回答片段：

${responsesText}

请分析各模型的写作差异，严格按JSON输出，不要有任何额外文字：
{
  "summary": "一句话点出各模型最核心的差异，比较它们的切入角度或风格（40字以内）",
  "chips": ["差异点1（5字以内）", "差异点2（5字以内）", "差异点3（5字以内）"],
  "models": {
    "模型id": {
      "tags": [
        {"label": "标签（4字以内）", "type": "tone|structure|quality|warning"}
      ],
      "stats": {
        "根据本次写作任务选择4个最相关的维度，维度名2-3字，分数0到100": 0
      },
      "keyPoint": "用一句话概括这个模型回答的核心内容或主要立场，而不是描述风格（30字以内）"
    }
  }
}

stats维度选择原则：根据用户的写作任务类型自主选择最有区分度的4个维度。
例如写小红书：种草感/情绪感染/实用性/口语化
例如写邮件：专业度/礼貌感/清晰度/简洁度
例如写产品介绍：说服力/差异化/可信度/简洁度
`;

  try {
    const raw = await queryDeepSeek(analysisPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in analysis response');
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('Analysis failed:', err.message);
    return null;
  }
}

module.exports = { analyzeResults };
