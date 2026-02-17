const axios = require('axios');

async function testSuggestions() {
    try {
        console.log("🚀 Testing AI Suggestions Endpoint...");

        const payload = {
            businessName: "Joe's Pizza & Pasta",
            area: "Brooklyn, NY",
            googleRating: 3.8,
            reviewCount: 42,
            websiteStatus: "Missing",
            justDialStatus: "Missing",
            totalScore: 45
        };

        // Note: Ensure server is running on port 3000 or 3001
        const port = process.env.PORT || 3001;
        const response = await axios.post(`http://localhost:${port}/api/suggestions`, payload);

        if (response.data.success) {
            console.log("✅ Success! ID:", response.data.auditId || "N/A");
            console.log("\n📋 Suggestions:");
            response.data.suggestions.forEach((s, i) => {
                console.log(`${i + 1}. [${s.icon}] ${s.title}`);
                console.log(`   ${s.description}`);
                console.log(`   Impact: ${s.impact}\n`);
            });
        } else {
            console.log("❌ Failed:", response.data);
        }

    } catch (error) {
        console.error("❌ Error:", error.response ? error.response.data : error.message);
    }
}

testSuggestions();
