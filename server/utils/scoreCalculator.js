/**
 * ============================================
 * BIZSCORE AUDIT ENGINE — v2.0 (AI Readiness Edition)
 * ============================================
 *
 * 4-Category scoring matrix (100 points total):
 *
 *   Google Maps      — 50 pts  (Claim + NAP + 6 Tiered metrics × 5 pts each)
 *   Website          — 20 pts  (Live + SSL + Base Schema)
 *   Social           — 10 pts  (WhatsApp + Instagram/Brand)
 *   AI Search Ready  — 20 pts  (Organization Schema + FAQ Schema)
 *
 * SAFE MODE: All new scoring blocks are wrapped in try/catch and use optional
 * chaining so this file CANNOT crash if data is missing or malformed.
 */

'use strict';

/**
 * Main export — accepts the same rawData / websiteData / aiData shape.
 *
 * @param {object} rawData      — Google Maps scraped fields
 * @param {object} websiteData  — Result from websiteScraper.scrapeWebsite()
 * @param {object} aiData       — AI-readiness fields (hasOrganizationSchema, hasFAQSchema)
 *                                Defaults to websiteData when not supplied separately,
 *                                because scrapeWebsite() now returns these fields directly.
 * @returns {{ totalScore, breakdown, recommendations }}
 */
function calculateScore(rawData = {}, websiteData = {}, aiData = null) {

    // If caller doesn't pass a separate aiData object, fall back to websiteData
    // (websiteScraper now appends hasOrganizationSchema and hasFAQSchema to its result).
    const ai = aiData || websiteData;

    const breakdown = {
        google: { score: 0, maxScore: 50, details: [] },
        website: { score: 0, maxScore: 20, details: [] },
        social: { score: 0, maxScore: 10, details: [] },
        aiReadiness: { score: 0, maxScore: 20, details: [] }
    };

    const recommendations = [];

    // ─────────────────────────────────────────────────────────────────────────
    // CATEGORY 1 — GOOGLE MAPS  (max 50 pts)
    // ─────────────────────────────────────────────────────────────────────────
    try {
        // 1a. Claim Status (+10)
        if (rawData?.isUnclaimed === false || rawData?.isClaimed === true) {
            breakdown.google.score += 10;
            breakdown.google.details.push({ text: 'Verified Google Business Profile', impact: 'High', earned: 10, possible: 10 });
        } else {
            breakdown.google.details.push({ text: 'Unverified Google Business Profile', impact: 'High', earned: 0, possible: 10 });
            recommendations.push('CRITICAL: Claim and verify your Google Business Profile immediately.');
        }

        // 1b. NAP Consistency (+10)
        const hasPhone = !!(rawData?.phone);
        const hasHours = !(rawData?.hoursMissing === true);
        if (hasPhone && hasHours) {
            breakdown.google.score += 10;
            breakdown.google.details.push({ text: 'Consistent NAP (Name, Address, Phone)', impact: 'High', earned: 10, possible: 10 });
        } else {
            breakdown.google.details.push({ text: 'Incomplete NAP Details (Phone/Hours missing)', impact: 'High', earned: 0, possible: 10 });
            recommendations.push('WARNING: Add missing NAP details (phone number and/or business hours).');
        }

        // 1c. Six Tiered Metrics — each worth max 5 pts  (6 × 5 = 30 pts)

        // i. Rating (5 pts)
        const rating = parseFloat(rawData?.rating) || 0;
        if (rating >= 4.5) { breakdown.google.score += 5; breakdown.google.details.push({ text: `Excellent Rating (${rating}★)`, impact: 'High', earned: 5, possible: 5 }); }
        else if (rating >= 4.0) { breakdown.google.score += 3; breakdown.google.details.push({ text: `Good Rating (${rating}★)`, impact: 'High', earned: 3, possible: 5 }); }
        else if (rating >= 3.0) { breakdown.google.score += 1; breakdown.google.details.push({ text: `Moderate Rating (${rating}★)`, impact: 'High', earned: 1, possible: 5 }); }
        else { breakdown.google.details.push({ text: `Poor Rating (${rating}★)`, impact: 'High', earned: 0, possible: 5 }); }

        // ii. Review Volume (5 pts)
        const reviewCount = rawData?.reviewCount || 0;
        if (reviewCount >= 200) { breakdown.google.score += 5; breakdown.google.details.push({ text: `Strong Review Volume (${reviewCount})`, impact: 'Medium', earned: 5, possible: 5 }); }
        else if (reviewCount >= 100) { breakdown.google.score += 4; breakdown.google.details.push({ text: `Good Review Volume (${reviewCount})`, impact: 'Medium', earned: 4, possible: 5 }); }
        else if (reviewCount >= 50) { breakdown.google.score += 3; breakdown.google.details.push({ text: `Moderate Review Volume (${reviewCount})`, impact: 'Medium', earned: 3, possible: 5 }); }
        else if (reviewCount >= 10) { breakdown.google.score += 1; breakdown.google.details.push({ text: `Limited Review Volume (${reviewCount})`, impact: 'Medium', earned: 1, possible: 5 }); }
        else { breakdown.google.details.push({ text: `Very Low Review Volume (${reviewCount})`, impact: 'Medium', earned: 0, possible: 5 }); }

        // iii. Review Velocity — recent reviews (5 pts)
        const recentReviews = rawData?.recentReviewsCount || 0;
        if (recentReviews >= 10) { breakdown.google.score += 5; breakdown.google.details.push({ text: `High Review Velocity (${recentReviews} recent)`, impact: 'Medium', earned: 5, possible: 5 }); }
        else if (recentReviews >= 5) { breakdown.google.score += 3; breakdown.google.details.push({ text: `Moderate Review Velocity (${recentReviews} recent)`, impact: 'Medium', earned: 3, possible: 5 }); }
        else if (recentReviews >= 2) { breakdown.google.score += 1; breakdown.google.details.push({ text: `Low Review Velocity (${recentReviews} recent)`, impact: 'Medium', earned: 1, possible: 5 }); }
        else { breakdown.google.details.push({ text: `Stagnant Reviews (${recentReviews} recent)`, impact: 'Medium', earned: 0, possible: 5 }); }

        // iv. Owner Response Rate (5 pts)
        const responseRate = parseInt(rawData?.responseRate) || 0;
        if (responseRate >= 80) { breakdown.google.score += 5; breakdown.google.details.push({ text: `Excellent Response Rate (${responseRate}%)`, impact: 'Medium', earned: 5, possible: 5 }); }
        else if (responseRate >= 50) { breakdown.google.score += 3; breakdown.google.details.push({ text: `Good Response Rate (${responseRate}%)`, impact: 'Medium', earned: 3, possible: 5 }); }
        else if (responseRate >= 20) { breakdown.google.score += 1; breakdown.google.details.push({ text: `Poor Response Rate (${responseRate}%)`, impact: 'Medium', earned: 1, possible: 5 }); }
        else { breakdown.google.details.push({ text: `No Owner Responses (${responseRate}%)`, impact: 'Medium', earned: 0, possible: 5 }); }

        // v. Photos / Media Richness (5 pts)
        const photoCount = (rawData?.photos && rawData.photos.length) || 0;
        if (photoCount >= 30) { breakdown.google.score += 5; breakdown.google.details.push({ text: `Excellent Photo Library (${photoCount} photos)`, impact: 'Medium', earned: 5, possible: 5 }); }
        else if (photoCount >= 15) { breakdown.google.score += 3; breakdown.google.details.push({ text: `Good Photo Count (${photoCount} photos)`, impact: 'Medium', earned: 3, possible: 5 }); }
        else if (photoCount >= 5) { breakdown.google.score += 1; breakdown.google.details.push({ text: `Limited Photos (${photoCount} photos)`, impact: 'Medium', earned: 1, possible: 5 }); }
        else { breakdown.google.details.push({ text: `Very Few Photos (${photoCount})`, impact: 'Medium', earned: 0, possible: 5 }); }

        // vi. Google Posts Freshness (5 pts)
        const daysSincePost = rawData?.daysSincePost;
        if (daysSincePost !== undefined && daysSincePost !== null) {
            if (daysSincePost <= 7) { breakdown.google.score += 5; breakdown.google.details.push({ text: `Recent Google Post (${daysSincePost}d ago)`, impact: 'Low', earned: 5, possible: 5 }); }
            else if (daysSincePost <= 30) { breakdown.google.score += 3; breakdown.google.details.push({ text: `Monthly Google Posts (${daysSincePost}d ago)`, impact: 'Low', earned: 3, possible: 5 }); }
            else if (daysSincePost <= 90) { breakdown.google.score += 1; breakdown.google.details.push({ text: `Stale Google Posts (${daysSincePost}d ago)`, impact: 'Low', earned: 1, possible: 5 }); }
            else { breakdown.google.details.push({ text: 'No Recent Google Posts', impact: 'Low', earned: 0, possible: 5 }); }
        } else {
            breakdown.google.details.push({ text: 'Google Posts data unavailable', impact: 'Low', earned: 0, possible: 5 });
        }

    } catch (err) {
        // SAFE MODE: Google section never crashes the scorer
        console.error('[SCORER] Google section error:', err.message);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CATEGORY 2 — WEBSITE  (max 20 pts)
    // ─────────────────────────────────────────────────────────────────────────
    try {
        // Live & Functional (+10)
        if (websiteData?.exists) {
            breakdown.website.score += 10;
            breakdown.website.details.push({ text: 'Website Live & Functional', impact: 'High', earned: 10, possible: 10 });
        } else {
            breakdown.website.details.push({ text: 'No Functional Website Found', impact: 'High', earned: 0, possible: 10 });
            recommendations.push('CRITICAL: Build or fix your business website to establish online credibility.');
        }

        // SSL / HTTPS (+5)
        if (websiteData?.isSecure) {
            breakdown.website.score += 5;
            breakdown.website.details.push({ text: 'Secure Website (HTTPS / SSL)', impact: 'High', earned: 5, possible: 5 });
        } else {
            breakdown.website.details.push({ text: 'Website not Secure (No SSL)', impact: 'High', earned: 0, possible: 5 });
            if (websiteData?.exists) recommendations.push('ERROR: Enable HTTPS on your website. Google penalises insecure sites.');
        }

        // Base Schema / JSON-LD present (+5)
        if (websiteData?.hasSchema) {
            breakdown.website.score += 5;
            breakdown.website.details.push({ text: 'Schema Markup Detected', impact: 'Medium', earned: 5, possible: 5 });
        } else {
            breakdown.website.details.push({ text: 'No Schema Markup Detected', impact: 'Medium', earned: 0, possible: 5 });
            if (websiteData?.exists) recommendations.push('WARNING: Add JSON-LD schema markup to help search engines understand your content.');
        }

    } catch (err) {
        console.error('[SCORER] Website section error:', err.message);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CATEGORY 3 — SOCIAL PRESENCE  (max 10 pts)
    // ─────────────────────────────────────────────────────────────────────────
    try {
        // WhatsApp Business Link (+5)
        const hasWhatsApp = websiteData?.hasWhatsApp === true;
        if (hasWhatsApp) {
            breakdown.social.score += 5;
            breakdown.social.details.push({ text: 'WhatsApp Business Link Active', impact: 'High', earned: 5, possible: 5 });
        } else {
            breakdown.social.details.push({ text: 'No Direct WhatsApp Business Link', impact: 'High', earned: 0, possible: 5 });
            recommendations.push('WARNING: Missing direct WhatsApp Business link. Add a wa.me link for instant customer contact.');
        }

        // Brand Social Footprint — Instagram (+5)
        const hasInstagram = websiteData?.hasInstagram === true;
        if (hasInstagram) {
            breakdown.social.score += 5;
            breakdown.social.details.push({ text: 'Instagram Brand Presence Detected', impact: 'High', earned: 5, possible: 5 });
        } else {
            breakdown.social.details.push({ text: 'No Instagram Presence Found', impact: 'High', earned: 0, possible: 5 });
            recommendations.push('ERROR: Brand Authority penalty. No Social presence. Create an Instagram page linked from your website.');
        }

    } catch (err) {
        console.error('[SCORER] Social section error:', err.message);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CATEGORY 4 — AI SEARCH READINESS  (max 20 pts)
    // ─────────────────────────────────────────────────────────────────────────
    // SAFE MODE: Uses optional chaining on `ai` object. If websiteScraper
    // fails or returns an old cached result without these fields, they
    // default to false and recommendations are pushed \u2014 no crash, no silent pass.
    try {
        // Organization / LocalBusiness Schema (+10)
        if (ai?.hasOrganizationSchema === true) {
            breakdown.aiReadiness.score += 10;
            breakdown.aiReadiness.details.push({ text: 'Organization / LocalBusiness Schema Present', impact: 'High', earned: 10, possible: 10 });
        } else {
            breakdown.aiReadiness.details.push({ text: 'Organization Schema Missing', impact: 'High', earned: 0, possible: 10 });
            recommendations.push('CRITICAL: Organization/LocalBusiness Schema missing. AI engines (ChatGPT/Gemini) cannot reliably extract your entity data.');
        }

        // FAQ Schema (+10)
        if (ai?.hasFAQSchema === true) {
            breakdown.aiReadiness.score += 10;
            breakdown.aiReadiness.details.push({ text: 'FAQ Schema Page Detected', impact: 'High', earned: 10, possible: 10 });
        } else {
            breakdown.aiReadiness.details.push({ text: 'FAQ Schema Missing', impact: 'High', earned: 0, possible: 10 });
            recommendations.push('WARNING: FAQ Schema missing. You are losing visibility in AI conversational search queries.');
        }

    } catch (err) {
        console.error('[SCORER] AI Readiness section error:', err.message);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FINAL AGGREGATION
    // ─────────────────────────────────────────────────────────────────────────
    const totalScore = Math.min(
        100,
        breakdown.google.score +
        breakdown.website.score +
        breakdown.social.score +
        breakdown.aiReadiness.score
    );

    return {
        totalScore,
        breakdown,
        recommendations
    };
}

module.exports = { calculateScore };
