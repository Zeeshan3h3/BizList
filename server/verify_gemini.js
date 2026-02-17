require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ Error: GEMINI_API_KEY is missing in .env file");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("🔍 Listing available models...");
        // Just create a dummy model to access the underlying API if needed, 
        // but the SDK usually exposes a way to list models on the client or via a specific call.
        // Actually, the JS SDK doesn't have a direct `listModels` on the top level class easily accessible in all versions.
        // Let's try to get a model and handle the error more gracefully, or use the specific endpoint.
        // NOTE: The current Node SDK might not have a helper for listModels. 
        // Let's try 'gemini-1.5-flash' again but catch the 404/400 explicitly.
        // AND try 'gemini-pro' as a fallback.

        const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-pro"];

        for (const modelName of modelsToTry) {
            console.log(`\n👉 Trying model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hi");
                const response = await result.response;
                console.log(`✅ Success with ${modelName}!`);
                console.log("Response:", response.text());
                return; // Exit on first success
            } catch (e) {
                console.log(`❌ Failed with ${modelName}: ${e.message.split('\n')[0]}`);
            }
        }

        console.error("\n❌ All models failed.");
    } catch (error) {
        console.error("❌ Fatal Error:", error);
    }
}

run();
