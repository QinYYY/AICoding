import { GoogleGenAI } from "@google/genai";
import { ChildProfile, GrowthRecord } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeGrowth = async (
  profile: ChildProfile,
  records: GrowthRecord[]
): Promise<string> => {
  const client = getClient();
  if (!client) return "缺少 API 密钥，无法生成分析报告。";

  // Sort records by date
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Take last 5 records for context, or all if less than 5
  const recentRecords = sortedRecords.slice(-10);

  const prompt = `
    你是一位专业的儿科成长助手。
    请分析以下儿童的生长数据。
    请使用中文回答。
    
    儿童档案:
    - 姓名: ${profile.name}
    - 性别: ${profile.gender}
    - 出生日期: ${profile.birthDate}
    
    近期生长记录 (身高 cm, 体重 kg):
    ${JSON.stringify(recentRecords, null, 2)}
    
    任务:
    1. 根据最后一条记录或今天日期计算当前年龄。
    2. 将最新数据与 WHO 儿童生长标准（百分位）进行大致比较。
    3. 提供一段简短、鼓励性的生长趋势总结。
    4. 指出生长是否平稳，或是否有突然的变化。
    5. 语气要温暖、让人安心且专业。
    6. 重要：必须添加免责声明，说明你是一个 AI，此分析不构成医疗建议。
    
    输出格式: 一段简短的段落（不超过 150 字）。
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "无法生成分析报告。";
  } catch (error) {
    console.error("Error generating growth analysis:", error);
    return "抱歉，暂时无法分析数据。请检查您的网络连接或 API 密钥。";
  }
};