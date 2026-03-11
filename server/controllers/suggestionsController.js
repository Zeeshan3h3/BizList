const axios = require('axios');
require('dotenv').config();

/**
 * Generate AI Business Suggestions
 * POST /api/suggestions
 */
exports.getSuggestions = async (req, res) => {
    const { businessName, totalScore, brandClass, brandIntelligence, performanceBreakdown } = req.body;

    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "Server Configuration Error: API Key missing" });
        }

        const prompt = `
            You are "BizList AI," a ruthless but brilliant Senior Competitive Performance Strategist.
            Your job is to analyze a business's local market execution against their structural brand expectations and generate 3 **high-priority** competitive advantages they are currently missing.

            **Target Audience:** A local business owner or regional manager who cares about **Market Share**, **Competitive Pressure**, and **Category Dominance**.
            Avoid financial jargon like "Revenue Leak" or "Lost Money". Use strategic language ("Contextual Expectations", "Competitive Authority", "Category Benchmarks").

            **Brand Intelligence Data:**
            - **Name:** ${businessName}
            - **Brand Classification:** ${brandClass}
            - **Brand Scale Analysis:** ${brandIntelligence?.brandType} (Confidence: ${brandIntelligence?.confidence}%)
            - **Detected Scale Signals:** ${JSON.stringify(brandIntelligence?.signals || [])}
            - **Overall Execution Score:** ${totalScore}/100 

            **Execution Breakdown:**
            ${JSON.stringify(performanceBreakdown)}

            **Output Rules:**
            - Return **ONLY** a raw JSON object (No Markdown, no \`\`\`json blocks).
            - The JSON must have a "suggestions" array with 3 objects.
            - Each object must have:
              - "title": Urgent Benchmark Headline (Max 5 words).
              - "description": 2 sentences. The first states the specific execution gap relative to their brand scale. The second provides the strategic countermeasure.
              - "impact": A specific growth metric (e.g., "Outrank 3 core competitors", "Capture 20% more branded search").
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
            timeout: 15000, // Phase 4 Optimization: Strict 15s timeout
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

        // Provide a smart programmatic fallback if AI fails (to ensure UI never breaks due to quota limits)
        if (process.env.NODE_ENV === 'development' || true) {
            console.log("⚠️ Using smart data-driven fallback due to AI error");

            const fallbackSuggestions = [];

            // 1. Core Legitimacy Focus
            if (totalScore < 60) {
                fallbackSuggestions.push({
                    title: "Establish Core Legitimacy",
                    description: "Your foundational digital footprint is missing key authority signals for your category. Completing your profile establishes baseline market trust.",
                    impact: "Meet minimum category expectations",
                    action_type: "URGENT",
                    icon: "ShieldAlert"
                });
            } else {
                fallbackSuggestions.push({
                    title: "Dominate Category Benchmarks",
                    description: "Your brand is meeting expectations but lacks aggressive competitive differentiation. Scale your visual media to suffocate local competitors.",
                    impact: "Increase category market share",
                    action_type: "GROWTH",
                    icon: "TrendingUp"
                });
            }

            // 2. Reviews/Execution Focus
            if (performanceBreakdown?.execution?.score < performanceBreakdown?.execution?.maxScore * 0.5) {
                fallbackSuggestions.push({
                    title: "Accelerate Local Execution",
                    description: "Your localized interaction velocity is falling behind the competitive pressure of your area. Implement an automated feedback engine.",
                    impact: "Surpass local review averages",
                    action_type: "URGENT",
                    icon: "Star"
                });
            } else {
                fallbackSuggestions.push({
                    title: "Leverage Execution Momentum",
                    description: "Your local review velocity is outperforming category baselines. Convert this trust into direct customer acquisition.",
                    impact: "Secure absolute market dominance",
                    action_type: "TRUST",
                    icon: "MessageCircle"
                });
            }

            // 3. Authority
            if (brandClass === "Market-Dominant Brand" || brandIntelligence?.brandType === "enterprise") {
                fallbackSuggestions.push({
                    title: "Unify Enterprise Authority",
                    description: "As a major brand, local inconsistencies dilute your global footprint. Standardize NAP and cross-platform architecture.",
                    impact: "Protect enterprise brand equity",
                    action_type: "URGENT",
                    icon: "Globe"
                });
            } else {
                fallbackSuggestions.push({
                    title: "Build Cross-Platform Moats",
                    description: "Independent brands must use interconnected social signals to fight enterprise algorithms. Bind your social infrastructure to your maps presence.",
                    impact: "Defend against enterprise budgets",
                    action_type: "GROWTH",
                    icon: "Share2"
                });
            }

            return res.json({
                success: true,
                suggestions: fallbackSuggestions
            });
        }

        res.status(500).json({ success: false, error: "AI Error", details: errorData });
    }
};
