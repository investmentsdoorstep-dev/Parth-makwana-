
import { GoogleGenAI, Type } from "@google/genai";
import { OptimizationResult, EmailData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const optimizeEmail = async (data: EmailData): Promise<OptimizationResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze and optimize this business email for maximum deliverability and engagement. 
    Recipients: ${data.recipients.join(', ')}
    Subject: ${data.subject}
    Body: ${data.body}`,
    config: {
      systemInstruction: `You are an expert email deliverability engineer and copywriter. 
      Your goal is to rewrite the email so it bypasses spam filters (avoiding spam trigger words, all-caps, excessive punctuation, and deceptive links) 
      while remaining professional and persuasive for a business context.
      
      Return the results in JSON format following the schema precisely.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          optimizedSubject: { type: Type.STRING, description: "A high-conversion, spam-safe subject line." },
          optimizedBody: { type: Type.STRING, description: "The full body of the email, formatted professionally." },
          deliverabilityScore: { type: Type.NUMBER, description: "A score from 0-100 indicating how likely it is to reach the inbox." },
          spamFlags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific elements that might trigger spam filters." },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable advice for the user." }
        },
        required: ["optimizedSubject", "optimizedBody", "deliverabilityScore", "spamFlags", "suggestions"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
