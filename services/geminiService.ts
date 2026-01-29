
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Subject } from "../types";

export const generateDailyDPP = async (subject: Subject, difficulty: string, chapter?: string): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const context = chapter ? `specifically for the chapter: ${chapter}` : `for the general subject area`;
  
  const prompt = `Generate 10 high-quality MCQ questions for Bihar Board (BSEB) Class 10 students for the subject: ${subject}, ${context}.
  
  Requirements:
  1. Difficulty Level: ${difficulty}. Ensure all questions strictly adhere to this level.
  2. Language: Mix of Hindi and English (Hinglish).
  3. Include detailed explanations in Hindi.
  4. Ensure all options are realistic and distinct.
  5. The response must be a valid JSON array.
  
  Format for each question:
  - id: unique string
  - question: string
  - options: array of 4 strings
  - correctAnswerIndex: number (0-3)
  - explanation: string (detailed in Hindi)
  - difficulty: string (must be "${difficulty}")`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a senior educator for the Bihar School Examination Board (BSEB). You specialize in creating practice material for Class 10 students. Your tone is encouraging and your questions are strictly aligned with the SCERT/NCERT Bihar syllabus.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              difficulty: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctAnswerIndex", "explanation", "difficulty"],
            propertyOrdering: ["id", "question", "options", "correctAnswerIndex", "explanation", "difficulty"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI returned empty result");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
