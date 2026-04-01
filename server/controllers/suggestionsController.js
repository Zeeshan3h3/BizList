'use strict';

const axios = require('axios');

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Build a clean prompt for Gemini from the audit payload.
 */
function buildPrompt({ businessName, totalScore, brandClass, brandIntelligence, performanceBreakdown }) {
    return `
You are "BizList AI," a ruthless but brilliant Senior Competitive Performance Strategist.
Analyze the business below and return 3 high-priority competitive advantages they are currently missing.

Target audience: local business owner who cares about market share and category dominance.
Use strategic language — avoid financial jargon like "revenue leak".

Brand Intelligence:
- Name: ${businessName}
- Brand Classification: ${brandClass}
- Brand Scale: ${brandIntelligence?.brandType ?? 'Unknown'} (Confidence: ${brandIntelligence?.confidence ?? 0}%)
- Signals: ${JSON.stringify(brandIntelligence?.signals ?? [])}
- Overall Score: ${totalScore}/100

Execution Breakdown:
${JSON.stringify(performanceBreakdown ?? {})}

Rules:
- Return ONLY raw JSON — no markdown, no code fences.
- The JSON must have a "suggestions" array with exactly 3 objects.
- Each object must contain:
  - "title": max 5-word headline
  - "description": 2 sentences (gap + countermeasure)
  - "impact": specific metric e.g. "Outrank 3 competitors"
  - "action_type": one of ["URGENT", "GROWTH", "TRUST"]
  - "icon": a Lucide-React icon name e.g. "ShieldAlert", "Star", "Globe", "TrendingUp", "MessageCircle"
`.trim();
}

/**
 * Extract a clean JSON object from a raw Gemini text response.
 * Gemini sometimes wraps the JSON in markdown — this handles both cases.
 */
function parseGeminiJson(text) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON object found in Gemini response');
    return JSON.parse(match[0]);
}

/**
 * Build data-driven fallback suggestions when Gemini is unavailable.
 * These are contextual — not generic placeholders.
 */
function buildFallbackSuggestions({ totalScore, brandClass, brandIntelligence, performanceBreakdown }) {
    const suggestions = [];
    const execScore = performanceBreakdown?.execution?.score ?? 0;
    const execMax = performanceBreakdown?.execution?.maxScore ?? 1;

    // Suggestion 1: based on overall score
    if (totalScore < 60) {
        suggestions.push({
            title: "Establish Core Legitimacy",
            description: "Your foundational digital footprint is missing key authority signals for your category. Completing your profile establishes baseline market trust.",
            impact: "Meet minimum category expectations",
            action_type: "URGENT",
            icon: "ShieldAlert"
        });
    } else {
        suggestions.push({
            title: "Dominate Category Benchmarks",
            description: "Your brand is meeting expectations but lacks aggressive competitive differentiation. Scale your visual media to suffocate local competitors.",
            impact: "Increase category market share",
            action_type: "GROWTH",
            icon: "TrendingUp"
        });
    }

    // Suggestion 2: based on execution score
    if (execScore < execMax * 0.5) {
        suggestions.push({
            title: "Accelerate Local Execution",
            description: "Your localized interaction velocity is falling behind the competitive pressure of your area. Implement an automated review feedback engine.",
            impact: "Surpass local review averages",
            action_type: "URGENT",
            icon: "Star"
        });
    } else {
        suggestions.push({
            title: "Leverage Execution Momentum",
            description: "Your local review velocity outperforms category baselines. Convert this trust signal into direct customer acquisition.",
            impact: "Secure absolute market dominance",
            action_type: "TRUST",
            icon: "MessageCircle"
        });
    }

    // Suggestion 3: based on brand scale
    const isEnterprise = brandClass === 'Market-Dominant Brand' || brandIntelligence?.brandType === 'enterprise';
    if (isEnterprise) {
        suggestions.push({
            title: "Unify Enterprise Authority",
            description: "As a major brand, local inconsistencies dilute your global footprint. Standardize NAP and cross-platform architecture.",
            impact: "Protect enterprise brand equity",
            action_type: "URGENT",
            icon: "Globe"
        });
    } else {
        suggestions.push({
            title: "Build Cross-Platform Moats",
            description: "Independent brands must use interconnected social signals to fight enterprise algorithms. Bind your social infrastructure to your Maps presence.",
            impact: "Defend against enterprise budgets",
            action_type: "GROWTH",
            icon: "Globe"
        });
    }

    return suggestions;
}

/**
 * POST /api/suggestions
 */
exports.getSuggestions = async (req, res) => {
    const { businessName, totalScore, brandClass, brandIntelligence, performanceBreakdown } = req.body;

    if (!process.env.GEMINI_API_KEY) {
        console.warn('[Suggestions] GEMINI_API_KEY not set — using fallback');
        return res.json({
            success: true,
            suggestions: buildFallbackSuggestions({ totalScore, brandClass, brandIntelligence, performanceBreakdown })
        });
    }

    try {
        const prompt = buildPrompt({ businessName, totalScore, brandClass, brandIntelligence, performanceBreakdown });

        const response = await axios.post(
            GEMINI_URL,
            { contents: [{ parts: [{ text: prompt }] }] },
            {
                timeout: 18_000,
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': process.env.GEMINI_API_KEY
                }
            }
        );

        const candidate = response.data?.candidates?.[0];
        if (!candidate) throw new Error('Empty candidate list from Gemini');

        const text = candidate.content.parts[0].text;
        const parsed = parseGeminiJson(text);

        return res.json({ success: true, suggestions: parsed.suggestions });

    } catch (error) {
        // Log enough to debug but don't expose API keys or internals
        const detail = error.response?.data?.error?.message ?? error.message;
        console.error(`[Suggestions] Gemini request failed: ${detail} — falling back to static suggestions`);

        return res.json({
            success: true,
            suggestions: buildFallbackSuggestions({ totalScore, brandClass, brandIntelligence, performanceBreakdown })
        });
    }
};
