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
  if (!client) return "API Key missing. Cannot generate analysis.";

  // Sort records by date
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Take last 5 records for context, or all if less than 5
  const recentRecords = sortedRecords.slice(-10);

  const prompt = `
    You are a helpful pediatric growth assistant. 
    Please analyze the following growth data for a child.
    
    Child Profile:
    - Name: ${profile.name}
    - Gender: ${profile.gender}
    - Birth Date: ${profile.birthDate}
    
    Recent Growth Records (Height in cm, Weight in kg):
    ${JSON.stringify(recentRecords, null, 2)}
    
    Task:
    1. Calculate the current age based on the last record or today's date.
    2. Compare the latest stats roughly against WHO child growth standards (percentiles).
    3. Provide a brief, encouraging summary of their growth trend.
    4. Mention if the growth seems steady or if there are any sudden changes.
    5. Keep the tone warm, reassuring, and professional. 
    6. IMPORTANT: Add a disclaimer that you are an AI and this is not medical advice.
    
    Output format: a short paragraph (max 150 words).
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Error generating growth analysis:", error);
    return "Sorry, I couldn't analyze the data at this moment. Please check your connection or API key.";
  }
};
