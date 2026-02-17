require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log("------------------------------------------------");
        console.log("AVAILABLE MODELS FOR THIS KEY:");
        console.log("------------------------------------------------");

        if (data.models) {
            data.models.forEach(m => {
                // Log name and supported generation methods
                console.log(`Name: ${m.name}`);
                console.log(`Methods: ${m.supportedGenerationMethods.join(', ')}`);
                console.log("");
            });
        } else {
            console.log("No models found. Response:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
