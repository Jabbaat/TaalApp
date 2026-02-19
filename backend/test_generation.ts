import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

async function testModel(modelName: string) {
    console.log(`\nStarting test for model: ${modelName}`);
    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: modelName });

        console.log(`   sending request...`);
        const result = await model.generateContent("Hello!");
        const response = await result.response;
        console.log(`   ✅ SUCCESS! Response: "${response.text().trim()}"`);
        return true;
    } catch (error: any) {
        console.error(`   ❌ FAILED: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log("Initializing model verification...");
    if (!process.env.GOOGLE_API_KEY) {
        console.error("API Key missing!");
        return;
    }

    const models = ["gemini-1.5-flash", "gemini-flash-latest", "gemini-pro", "gemini-1.0-pro"];

    for (const m of models) {
        const working = await testModel(m);
        if (working) {
            console.log(`\n>>> RECOMMENDED MODEL: ${m} <<<`);
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between tests
    }
    console.log("\n>>> NO WORKING MODELS FOUND <<<");
}

main();
