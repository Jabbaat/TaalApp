import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const MODEL_NAME = "gemini-flash-latest";

// Helper function to handle rate limits/retries with aggressive backoff
async function generateContentWithRetry(model: any, prompt: string, retries = 5, initialDelay = 2000) {
  let currentDelay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return await result.response;
    } catch (error: any) {
      const isRateLimit = error.message?.includes("429") || error.status === 429;

      // Try to extract retry delay from error message if available (e.g., "Please retry in 50s")
      const match = error.message?.match(/retry in ([\d\.]+)s/);
      if (match && match[1]) {
        currentDelay = Math.ceil(parseFloat(match[1]) * 1000) + 1000; // Wait requested time + 1s buffer
      }

      if (isRateLimit && i < retries - 1) {
        console.warn(`Rate limit hit (Attempt ${i + 1}/${retries}). Waiting ${currentDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= 2; // Exponential backoff for next time if we didn't parse a specific delay
        continue;
      }
      throw error;
    }
  }
}

export const generateLessonService = async (targetLanguage: string, skillLevel: string) => {
  // Check if API key is configured
  if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === "YOUR_GOOGLE_API_KEY_HERE") {
    const errorMsg = "GOOGLE_API_KEY is not set or is still the placeholder. Please configure it in backend/.env.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
        You are a helpful language tutor API that outputs only valid JSON.
        Generate a language lesson for a ${skillLevel} student learning ${targetLanguage}.
        The lesson should focus on a specific useful topic suitable for this level.
        
        Return ONLY valid JSON (no markdown formatting, no backticks) with the following structure:
        {
          "title": "Lesson Title",
          "difficultyLevel": "${skillLevel}",
          "content": {
            "introduction": "Brief introduction to the topic",
            "vocabulary": [
              { "word": "TargetWord", "translation": "NativeTranslation", "note": "Optional usage note" }
            ],
            "exercises": [
              { "type": "multiple-choice", "question": "Question text", "options": ["Option1", "Option2", "Option3"], "answer": "CorrectOption" }
            ]
          }
        }`;

    const response = await generateContentWithRetry(model, prompt);
    let text = response.text();

    // Clean up markdown code blocks if present
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(text);

    return {
      title: parsed.title,
      difficultyLevel: parsed.difficultyLevel,
      content: JSON.stringify(parsed.content),
    };

  } catch (error) {
    console.error("Google Gemini generation failed:", error);
    throw error;
  }
};
