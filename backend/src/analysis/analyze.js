const { queryDeepSeek } = require('../clients/deepseek');

/**
 * Analyze writing responses.
 * - 1 model: per-model breakdown, summary = single-model notice
 * - 2+ models: per-model breakdown + substantive cross-model comparison
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
    ? `"summary": "当前仅选择了单一模型，以下为该模型的写作风格与内容分析",
  "chips": [],`
    : `"summary": "指出各模型在切入角度、内容重点或写作风格上最有价值的差异。重点传递有用的判断依据，不要因为字数限制而省略关键信息（可写80-120字）",
  "chips": ["差异点1（6字以内）", "差异点2（6字以内）", "差异点3（6字以内）"],`;

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
      "keyPoint": "概括这个回答最重要的内容、立场或做法。目标是让读者不用展开全文就能判断这个回答适不适合自己，字数不是关键，传递最核心的信息才是关键"
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
