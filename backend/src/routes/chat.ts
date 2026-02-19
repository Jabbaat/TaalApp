import express from "express";
import { verifyToken } from "../utils/auth.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const MODEL_NAME = "gemini-flash-latest";

// Helper function (duplicated for now, could move to shared util)
async function generateContentWithRetry(model: any, prompt: string, retries = 5, initialDelay = 2000) {
    let currentDelay = initialDelay;
    for (let i = 0; i < retries; i++) {
        try {
            const result = await model.generateContent(prompt);
            return await result.response;
        } catch (error: any) {
            const isRateLimit = error.message?.includes("429") || error.status === 429;

            // Try to extract retry delay from error message if available
            const match = error.message?.match(/retry in ([\d\.]+)s/);
            if (match && match[1]) {
                currentDelay = Math.ceil(parseFloat(match[1]) * 1000) + 1000;
            }

            if (isRateLimit && i < retries - 1) {
                console.warn(`Rate limit hit in chat (Attempt ${i + 1}/${retries}). Waiting ${currentDelay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, currentDelay));
                currentDelay *= 2;
                continue;
            }
            throw error;
        }
    }
}

const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Invalid token" });

    req.userId = decoded.userId;
    next();
};

router.post("/", authenticate, async (req: any, res: any) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === "YOUR_GOOGLE_API_KEY_HERE") {
            const errorMsg = "GOOGLE_API_KEY is not set or is still the placeholder. Please configure it in backend/.env.";
            console.error(errorMsg);
            return res.status(500).json({ error: errorMsg });
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const prompt = `You are a helpful and patient Dutch language tutor. Conversing with a student. Correct them gently if they make mistakes, but keep the conversation flowing naturally in Dutch.
        
        User: ${message}
        Tutor:`;

        const response = await generateContentWithRetry(model, prompt);
        const reply = response.text();

        res.json({ reply });

    } catch (error) {
        console.error("Google Gemini chat failed:", error);
        res.status(500).json({ error: "Failed to generate response from AI (Rate Limit or API Error)." });
    }
});

export default router;
