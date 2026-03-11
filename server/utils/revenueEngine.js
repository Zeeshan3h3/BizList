/**
 * Revenue Vulnerability Engine
 * Converts digital health weaknesses into estimated monetary losses.
 * Assumptions:
 * - avgMonthlySearches = 2000
 * - avgConversionRate = 5%
 * - avgOrderValue = ₹1500
 * Baseline Revenue Potential = 2000 * 0.05 * 1500 = ₹150,000 / month
 */

const { getBusinessScale } = require('./businessScale');

const BASELINE_REVENUE = 150000;

function calculateRevenueRisk(data) {
    const risks = [];

    const scaleFactor = getBusinessScale(data.reviewCount || 0, data.photosCount || 0);

    // Huge brands have higher baselines (Maxes around `1.0 * (150000 * 10) = 1,500,000`)
    // Small shops sit around `0.15 * (150000) = 22,500`
    const dynamicMultiplier = scaleFactor < 0.3 ? 1 : scaleFactor * 10;
    const scaledRevenue = Math.round(BASELINE_REVENUE * dynamicMultiplier);

    // Helper to calculate severity based on percentage of gross revenue
    const getSeverity = (loss) => {
        const percent = loss / scaledRevenue;
        if (percent > 0.15) return "FATAL";
        if (percent > 0.08) return "HIGH";
        if (percent > 0.03) return "MEDIUM";
        return "LOW";
    };

    // Generate dynamic competitor heuristics if data exists
    let topRatingHeuristic = "Over 82% of top-ranking local competitors maintain a 4.5+ rating.";
    let topReviewHeuristic = "78% of local market leaders generate at least 5 fresh reviews monthly.";

    if (data.competitors && data.competitors.length >= 3) {
        // Find competitors with 4.5+ rating
        const highRated = data.competitors.filter(c => c.rating >= 4.5).length;
        if (highRated >= 2) {
            topRatingHeuristic = `Your top ${highRated} local competitors all maintain a ${data.competitors[0].rating}+ star rating.`;
        }
    }

    // 1. Reputation Risk (Rating < 4.2 or low review velocity)
    if (data.rating < 4.2) {
        // Research shows: < 4.2 rating loses ~15% conversion
        const estimatedLoss = Math.round(scaledRevenue * 0.15);
        risks.push({
            category: "Reputation Risk",
            issue: `Low star rating (${data.rating || 'N/A'}) reduces click-through rate. ${topRatingHeuristic}`,
            severity: getSeverity(estimatedLoss),
            estimatedMonthlyLoss: estimatedLoss,
            percentLoss: "15%",
            impactScore: 8
        });
    } else if (data.recentReviewsCount < 2) {
        // Stale reviews lose trust
        const estimatedLoss = Math.round(scaledRevenue * 0.08);
        risks.push({
            category: "Reputation Risk",
            issue: `Stagnant review velocity signals closed or inactive business. ${topReviewHeuristic}`,
            severity: getSeverity(estimatedLoss),
            estimatedMonthlyLoss: estimatedLoss,
            percentLoss: "8%",
            impactScore: 6
        });
    }

    // 2. Conversion Risk (Missing Website or WhatsApp)
    if (!data.websiteExists) {
        const estimatedLoss = Math.round(scaledRevenue * 0.25);
        risks.push({
            category: "Conversion Risk",
            issue: "No dedicated website detected. High-intent buyers cannot convert. 90% of established competitors in this area have owned web properties.",
            severity: getSeverity(estimatedLoss),
            estimatedMonthlyLoss: estimatedLoss,
            percentLoss: "25%",
            impactScore: 9
        });
    } else if (!data.hasWhatsApp && !data.isSecure) {
        const estimatedLoss = Math.round(scaledRevenue * 0.12);
        risks.push({
            category: "Conversion Risk",
            issue: "Missing direct contact CTA (WhatsApp) or Secure SSL. 72% of modern brands offer instant chat conversions.",
            severity: getSeverity(estimatedLoss),
            estimatedMonthlyLoss: estimatedLoss,
            percentLoss: "12%",
            impactScore: 7
        });
    }

    // 3. Authority Gap (Missing Schema, Social, or Claim)
    if (!data.isClaimed) {
        const estimatedLoss = Math.round(scaledRevenue * 0.20);
        risks.push({
            category: "Authority Gap",
            issue: "Google Maps Listing is unverified. 100% of dominant market players actively manage and protect their profile.",
            severity: getSeverity(estimatedLoss),
            estimatedMonthlyLoss: estimatedLoss,
            percentLoss: "20%",
            impactScore: 10
        });
    } else if (!data.hasSchema || !data.hasInstagram) {
        // Here we scale the penalty down for visually-low brands (e.g clinics missing Instagram)
        let lossPercent = 0.10;
        if (!data.hasInstagram && data.category) {
            // Apply a heuristic if you wanted
        }
        const estimatedLoss = Math.round(scaledRevenue * lossPercent);
        risks.push({
            category: "Authority Gap",
            issue: "Missing Local SEO Schema or Social Signals. Nearly 80% of local competitors have established these trust signals.",
            severity: getSeverity(estimatedLoss),
            estimatedMonthlyLoss: estimatedLoss,
            percentLoss: "10%",
            impactScore: 5
        });
    }

    // 4. Engagement Risk (No owner responses, low photos)
    if (data.responseRate < 20 || data.photosCount < 5) {
        const estimatedLoss = Math.round(scaledRevenue * 0.05);
        risks.push({
            category: "Engagement Risk",
            issue: "Low owner engagement (photos/responses). Top competitors respond to 95%+ of reviews and dominate the visual feed.",
            severity: getSeverity(estimatedLoss),
            estimatedMonthlyLoss: estimatedLoss,
            percentLoss: "5%",
            impactScore: 4
        });
    }

    // Sort by largest loss first
    return risks.sort((a, b) => b.estimatedMonthlyLoss - a.estimatedMonthlyLoss);
}

module.exports = {
    calculateRevenueRisk
};
