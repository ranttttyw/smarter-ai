const { queryDeepSeek } = require('../clients/deepseek');

/**
 * Analyze writing responses.
 * CRITICAL: All models in a single query share the SAME 4 dimensions
 * so the user can compare apples to apples.
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
    ? `"summary": "当前仅选择了单一模型，以下为该模型的内容与风格分析",
  "chips": [],`
    : `"summary": "指出各模型在切入角度、内容重点或风格上最有价值的差异。重点传递有用的判断依据，不要因为字数限制而省略关键信息（可写80-120字）",
  "chips": ["差异点1（6字以内）", "差异点2（6字以内）", "差异点3（6字以内）"],`;

  const analysisPrompt = `
你是内容分析专家。用户的请求是：
「${prompt}」

以下是AI模型的回答片段：

${responsesText}

请分析${isSingleModel ? '这个模型的' : '各模型的'}回答特点。

⚠️ 关键规则：所有模型必须使用完全相同的4个维度名称和顺序，方便横向对比。
先根据用户请求的类型确定4个共用维度，然后给每个模型在这4个维度上打分。

维度选择参考（第一个固定为切题度）：
- 写小红书：切题度 / 种草感 / 情绪感染 / 口语化
- 写邮件：切题度 / 专业度 / 礼貌感 / 简洁度
- 写产品介绍：切题度 / 说服力 / 差异化 / 可信度
- 知识问答：切题度 / 准确性 / 深度 / 易读性
- 观点讨论：切题度 / 洞察力 / 多元性 / 启发性
其他类型自行选择最合适的4个维度。

严格按JSON输出，不要有任何额外文字：
{
  ${summaryInstruction}
  "dimensions": ["切题度", "维度2", "维度3", "维度4"],
  "models": {
    "模型id": {
      "tags": [
        {"label": "标签（4字以内）", "type": "tone|structure|quality|warning"}
      ],
      "stats": {
        "切题度": 0到100,
        "维度2": 0到100,
        "维度3": 0到100,
        "维度4": 0到100
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
