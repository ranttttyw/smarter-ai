const { queryDeepSeek } = require('../clients/deepseek');

/**
 * Analyze writing responses.
 * - 1 model: per-model breakdown only (no comparison summary)
 * - 2+ models: per-model breakdown + cross-model comparison summary
 */
async function analyzeResults(prompt, results) {
  const validResults = results.filter(r => r.content && !r.error);
  if (validResults.length === 0) return null;

  const isSingleModel = validResults.length === 1;

  // Truncate each response to save tokens
  const MAX_CHARS = 600;
  const responsesText = validResults
    .map(r => {
      const snippet = r.content.length > MAX_CHARS
        ? r.content.slice(0, MAX_CHARS) + '…（已截取）'
        : r.content;
      return `【${r.modelId}】\n${snippet}`;
    })
    .join('\n\n---\n\n');

  const summaryInstruction = isSingleModel
    ? `"summary": null,\n  "chips": [],`
    : `"summary": "一句话点出各模型最核心的差异，比较切入角度或风格（40字以内）",
  "chips": ["差异点1（5字以内）", "差异点2（5字以内）", "差异点3（5字以内）"],`;

  const analysisPrompt = `
你是写作风格分析专家。用户的写作请求是：
「${prompt}」

以下是AI模型的回答片段：

${responsesText}

请分析${isSingleModel ? '这个模型的' : '各模型的'}写作特点，严格按JSON输出，不要有任何额外文字：
{
  ${summaryInstruction}
  "models": {
    "模型id": {
      "tags": [
        {"label": "标签（4字以内）", "type": "tone|structure|quality|warning"}
      ],
      "stats": {
        根据本次写作任务选择4个最相关的维度（维度名2-3字，分数0到100）
        例如写小红书：种草感/情绪感染/实用性/口语化
        例如写邮件：专业度/礼貌感/清晰度/简洁度
        例如写产品介绍：说服力/差异化/可信度/简洁度
      },
      "keyPoint": "一句话概括这个回答的核心内容或主要立场（不是描述风格，30字以内）"
    }
  }
}
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
