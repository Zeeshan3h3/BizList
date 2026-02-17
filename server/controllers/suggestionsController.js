const axios = require('axios');
require('dotenv').config();

/**
 * Generate AI Business Suggestions
 * POST /api/suggestions
 */
exports.getSuggestions = async (req, res) => {
    try {
        const { businessName, area, googleRating, reviewCount, websiteStatus, justDialStatus, totalScore } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "Server Configuration Error: API Key missing" });
        }

        // Calculate Risk Flags
        const riskFlags = [];

        // 1. Check for "Unclaimed" (Logic: If we have data indicating it, or generic check)
        // Since we don't have a direct "isClaimed" field from Google in this simple scraper, 
        // we'll infer it or leave it empty. For now, let's assume if score is very low, it might be unclaimed.
        // Actually, let's look at the data: JustDial presence often implies some activity.
        // For this demo, let's auto-flag "isZombieListing" if review count is low and rating is mediocre.

        if (reviewCount < 5) riskFlags.push("isNewOrZombie");
        if (websiteStatus === "Missing") riskFlags.push("noWebsite");
        if (googleRating && googleRating < 3.5) riskFlags.push("badReputation");

        const prompt = `
            You are "BizList AI," a ruthless but helpful Senior Local Business Auditor. 
            Your job is to analyze a business's digital health and generate 3 **high-priority** consulting recommendations.

            **Target Audience:** A local shop owner in India who cares about **Money**, **Footfall**, and **Reputation**. 
            Avoid fancy jargon. Use urgent, direct language.

            **Business Diagnosis Data:**
            - **Name:** ${businessName}
            - **Total Health Score:** ${totalScore}/100 
            - **Google Maps:** ${googleRating} stars (${reviewCount} reviews).
            - **Website:** ${websiteStatus}
            - **Risk Flags:** ${JSON.stringify(riskFlags)} 

            **Output Rules:**
            - Return **ONLY** a raw JSON object (No Markdown, no \`\`\`json blocks).
            - The JSON must have a "suggestions" array with 3 objects.
            - Each object must have:
              - "title": Urgent Headline (Max 5 words).
              - "description": 2 sentences. First sentence states the problem clearly. Second sentence sells the solution.
              - "impact": A specific metric (e.g., "Prevent listing deletion", "Increase weekend footfall by 20%").
              - "action_type": One of ["URGENT", "GROWTH", "TRUST"].
              - "icon": A Lucide-React icon name (e.g., "ShieldAlert", "Clock", "Star", "Globe", "TrendingUp", "MessageCircle").
        `;

        // Strategy: Use v1beta with the specific model available to this key
        // Found via debug_models.js: "gemini-2.5-flash"
        const model = "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        console.log(`[AI] Requesting ${model}... URL: ${url}`);

        const response = await axios.post(url, {
            contents: [{ parts: [{ text: prompt }] }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': process.env.GEMINI_API_KEY
            }
        });

        const candidate = response.data.candidates && response.data.candidates[0];
        if (!candidate) {
            console.error("No candidates:", response.data);
            throw new Error("No candidates returned from Gemini");
        }

        const text = candidate.content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const data = JSON.parse(jsonMatch ? jsonMatch[0] : text); // Try strict parse if regex fail

        res.json({ success: true, suggestions: data.suggestions });

    } catch (error) {
        const errorData = error.response ? error.response.data : error.message;
        console.error("[AI SUGGESTIONS ERROR]:", JSON.stringify(errorData, null, 2));

        // Fallback mock data if AI fails (to ensure UI doesn't break during demo)
        // Only if error is 404/500 from AI
        if (process.env.NODE_ENV === 'development') {
            console.log("⚠️ Using fallback mock data due to AI error");
            return res.json({
                success: true,
                suggestions: [
                    {
                        title: "Boost Your Reviews (Fallback)",
                        description: "This is a fallback suggestion because the AI service is currently unreachable.",
                        impact: "Ensure API Key permissions for 'Generate Content'",
                        icon: "AlertCircle"
                    },
                    {
                        title: "Optimize Website",
                        description: "Check your website speed and mobile responsiveness.",
                        impact: "Improved UX",
                        icon: "Globe"
                    },
                    {
                        title: "Claim Listings",
                        description: "Claim your business on Google Maps and other directories.",
                        impact: "Better Visibility",
                        icon: "MapPin"
                    }
                ]
            });
        }

        res.status(500).json({ success: false, error: "AI Error", details: errorData });
    }
};
