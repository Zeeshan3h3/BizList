/**
 * ============================================
 * LEAD OPPORTUNITY SCORING ENGINE
 * ============================================
 * 
 * 8-Layer scoring system that calculates how much a business would
 * benefit from a website / digital presence improvement.
 * 
 * HIGH score = business NEEDS digital services (opportunity for agency)
 * LOW score  = business already strong digitally (skip)
 * 
 * Layers:
 *   1. Digital Presence Detection   (0–30 pts)
 *   2. Demand Signal                (0–25 pts)
 *   3. Competition Pressure         (0–10 pts)
 *   4. Category Priority            (0–10 pts)
 *   5. Brand Detection Penalty      (0 to -40 pts)
 *   6. Growth Potential Bonus       (0–20 pts)
 *   7. Contactability               (0–10 pts)
 *   8. Digital Gap                  (0–15 pts)
 * 
 * Max theoretical score: ~120 → normalized to 0–100
 */

const { analyzeBrand } = require('./brandIntelligence');
const { getCategoryOpportunity } = require('./categoryOpportunity');

// ═══════════════════════════════════════════════════════════════
// MAIN SCORING FUNCTION
// ═══════════════════════════════════════════════════════════════

function calculateLeadScore(rawData, websiteData = {}) {
    const reviewCount = rawData.reviewCount || 0;
    const rating = rawData.rating || 0;
    const category = rawData.category || '';
    const phone = rawData.phone || '';
    const competitors = rawData.competitors || [];

    // Initialize all layer results
    const layers = {};
    let rawScore = 0;

    // ═══════════════════════════════════════════
    // LAYER 1: Digital Presence Detection (0–30)
    // ═══════════════════════════════════════════
    const presenceLayer = scoreDigitalPresence(rawData, websiteData);
    layers.digitalPresence = presenceLayer;
    rawScore += presenceLayer.points;

    // ═══════════════════════════════════════════
    // LAYER 2: Demand Signal — Reviews (0–25)
    // ═══════════════════════════════════════════
    const demandLayer = scoreDemandSignal(reviewCount, rating);
    layers.demandSignal = demandLayer;
    rawScore += demandLayer.points;

    // ═══════════════════════════════════════════
    // LAYER 3: Competition Pressure (0–10)
    // ═══════════════════════════════════════════
    const competitionLayer = scoreCompetition(competitors);
    layers.competition = competitionLayer;
    rawScore += competitionLayer.points;

    // ═══════════════════════════════════════════
    // LAYER 4: Category Priority (0–10)
    // ═══════════════════════════════════════════
    const categoryLayer = getCategoryOpportunity(category);
    layers.category = {
        points: categoryLayer.points,
        maxPoints: 10,
        label: categoryLayer.label,
        tier: categoryLayer.tier,
        details: `Category: ${category || 'Unknown'} → ${categoryLayer.label}`
    };
    rawScore += categoryLayer.points;

    // ═══════════════════════════════════════════
    // LAYER 5: Brand Detection Penalty (0 to -40)
    // ═══════════════════════════════════════════
    const brandIntel = analyzeBrand({
        businessName: rawData.name || rawData.businessName,
        website: rawData.website,
        reviewCount: reviewCount,
        socialLinks: rawData.socialLinks || {},
        rating: rating,
        competitors: competitors
    });

    layers.brandDetection = {
        points: brandIntel.brandPenalty,
        maxPoints: 0,
        brandType: brandIntel.brandType,
        confidence: brandIntel.confidence,
        isExcluded: brandIntel.isExcluded,
        signals: brandIntel.signals,
        details: brandIntel.isExcluded
            ? `⛔ EXCLUDED — Known brand: ${rawData.name || rawData.businessName}`
            : `Brand Type: ${brandIntel.brandType} (confidence: ${brandIntel.confidence}%)`
    };
    rawScore += brandIntel.brandPenalty;

    // ═══════════════════════════════════════════
    // LAYER 6: Growth Potential Bonus (0–20)
    // ═══════════════════════════════════════════
    const growthLayer = scoreGrowthPotential(reviewCount, rating, websiteData);
    layers.growthPotential = growthLayer;
    rawScore += growthLayer.points;

    // ═══════════════════════════════════════════
    // LAYER 7: Contactability (0–10)
    // ═══════════════════════════════════════════
    const contactLayer = scoreContactability(phone, websiteData, rawData);
    layers.contactability = contactLayer;
    rawScore += contactLayer.points;

    // ═══════════════════════════════════════════
    // LAYER 8: Digital Gap Score (0–15)
    // ═══════════════════════════════════════════
    const gapLayer = scoreDigitalGap(reviewCount, websiteData);
    layers.digitalGap = gapLayer;
    rawScore += gapLayer.points;

    // ═══════════════════════════════════════════
    // FINAL SCORE — Normalize to 0–100
    // ═══════════════════════════════════════════
    // Max possible: 30 + 25 + 10 + 10 + 0 + 20 + 10 + 15 = 120
    // Min possible: 0 + 0 + 0 + 0 + (-40) + 0 + 0 + 0 = -40
    const normalizedScore = Math.round(Math.max(0, Math.min(100, (rawScore / 120) * 100)));

    // Classify lead type
    let leadType, leadColor;
    if (brandIntel.isExcluded) {
        leadType = 'EXCLUDED';
        leadColor = '#6B7280'; // gray
    } else if (normalizedScore >= 80) {
        leadType = 'HOT LEAD';
        leadColor = '#EF4444'; // red-hot
    } else if (normalizedScore >= 60) {
        leadType = 'HIGH POTENTIAL';
        leadColor = '#F97316'; // orange
    } else if (normalizedScore >= 40) {
        leadType = 'MODERATE';
        leadColor = '#EAB308'; // yellow
    } else if (normalizedScore >= 20) {
        leadType = 'LOW PRIORITY';
        leadColor = '#6B7280'; // gray
    } else {
        leadType = 'IGNORE';
        leadColor = '#374151'; // dark gray
    }

    // Generate opportunity reason
    const opportunityReason = generateOpportunityReason(rawData, websiteData, layers, normalizedScore);

    // Build breakdown for frontend (backward compatible with old 3-tier format)
    const breakdown = buildBreakdown(layers);

    return {
        totalScore: normalizedScore,
        rawScore,
        leadType,
        leadColor,
        brandClass: leadType, // backward compat
        opportunityReason,
        brandIntelligence: brandIntel,
        layers,
        breakdown,
        websiteStatus: websiteData.websiteStatus || 'none',
        websiteQualityScore: websiteData.websiteQualityScore || 0
    };
}

// ═══════════════════════════════════════════════════════════════
// LAYER SCORING FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function scoreDigitalPresence(rawData, websiteData) {
    const status = websiteData.websiteStatus || 'none';
    const qualityScore = websiteData.websiteQualityScore || 0;
    const website = rawData.website || '';

    let points = 0;
    let details = '';

    if (!website || status === 'none') {
        points = 30;
        details = 'No website found — maximum opportunity';
    } else if (status === 'broken') {
        points = 25;
        details = 'Website is broken/unreachable — high opportunity';
    } else if (status === 'outdated') {
        points = 20;
        details = `Outdated website (quality: ${qualityScore}/100) — strong opportunity`;
    } else if (status === 'basic') {
        points = 10;
        details = `Basic website (quality: ${qualityScore}/100) — moderate opportunity`;
    } else {
        points = -10;
        details = `Good website (quality: ${qualityScore}/100) — low opportunity`;
    }

    // Additional penalty checks
    if (websiteData.exists && !websiteData.isSecure) {
        points += 5;
        details += ' | No SSL';
    }
    if (websiteData.exists && !websiteData.isMobileResponsive) {
        points += 5;
        details += ' | Not mobile-friendly';
    }
    if (websiteData.exists && websiteData.loadTimeMs > 5000) {
        points += 5;
        details += ' | Very slow loading';
    }

    return {
        points: Math.min(30, Math.max(-10, points)),
        maxPoints: 30,
        status,
        qualityScore,
        details
    };
}

function scoreDemandSignal(reviewCount, rating) {
    let points = 0;
    let details = '';

    // Review volume as demand indicator
    if (reviewCount > 200) {
        points += 25;
        details = `Very high demand (${reviewCount} reviews)`;
    } else if (reviewCount > 100) {
        points += 20;
        details = `High demand (${reviewCount} reviews)`;
    } else if (reviewCount > 50) {
        points += 15;
        details = `Moderate demand (${reviewCount} reviews)`;
    } else if (reviewCount > 20) {
        points += 10;
        details = `Growing demand (${reviewCount} reviews)`;
    } else {
        points += 5;
        details = `Low activity (${reviewCount} reviews)`;
    }

    // Rating context
    if (rating > 0 && rating < 4.0) {
        points += 0; // Low rating = they need help but may not convert
        details += ' | Below-average rating';
    } else if (rating >= 4.0 && rating <= 4.5) {
        details += ' | Solid rating';
    } else if (rating > 4.5) {
        details += ' | Excellent rating — strong reputation';
    }

    return { points: Math.min(25, points), maxPoints: 25, details, reviewCount, rating };
}

function scoreCompetition(competitors) {
    let points = 0;
    let details = '';

    if (!competitors || competitors.length === 0) {
        details = 'No competitor data available';
        return { points: 0, maxPoints: 10, details };
    }

    // Check how many competitors likely have websites (high review count = proxy for digital maturity)
    const digitallyMatureCompetitors = competitors.filter(c => (c.reviews || 0) > 50).length;

    if (digitallyMatureCompetitors >= 3) {
        points += 7;
        details = `${digitallyMatureCompetitors} competitors appear digitally mature — competitive pressure HIGH`;
    } else if (digitallyMatureCompetitors >= 1) {
        points += 4;
        details = `${digitallyMatureCompetitors} competitors appear digitally mature — moderate pressure`;
    } else {
        points += 2;
        details = 'Competitors appear digitally weak — low pressure but also low awareness';
    }

    // Average competitor reviews
    const avgReviews = competitors.reduce((sum, c) => sum + (c.reviews || 0), 0) / competitors.length;
    if (avgReviews > 100) {
        points += 3;
        details += ` | Avg competitor reviews: ${Math.round(avgReviews)}`;
    }

    return { points: Math.min(10, points), maxPoints: 10, details, competitorCount: competitors.length };
}

function scoreGrowthPotential(reviewCount, rating, websiteData) {
    const websiteStatus = websiteData.websiteStatus || 'none';
    let points = 0;
    let details = '';
    const signals = [];

    // 🔥 HIGH-VALUE: Popular business with no/bad website
    if (reviewCount > 100 && (websiteStatus === 'none' || websiteStatus === 'broken')) {
        points += 20;
        signals.push(`${reviewCount} reviews but no working website — massive opportunity`);
    } else if (reviewCount > 50 && (websiteStatus === 'none' || websiteStatus === 'broken')) {
        points += 15;
        signals.push(`${reviewCount} reviews but no working website — strong opportunity`);
    } else if (reviewCount > 50 && websiteStatus === 'outdated') {
        points += 10;
        signals.push(`${reviewCount} reviews with outdated website — upgrade opportunity`);
    }

    // Good rating + poor website = customers love them but website doesn't match
    if (rating >= 4.0 && (websiteStatus === 'none' || websiteStatus === 'broken' || websiteStatus === 'outdated')) {
        points += 5;
        signals.push(`${rating}★ rating with ${websiteStatus} website — reputation exceeds digital presence`);
    }

    details = signals.join(' | ') || 'No significant growth signals detected';

    return { points: Math.min(20, points), maxPoints: 20, details, signals };
}

function scoreContactability(phone, websiteData, rawData) {
    let points = 0;
    const signals = [];

    if (phone) {
        points += 5;
        signals.push('Phone number available');
    }

    if (websiteData.hasWhatsApp) {
        points += 5;
        signals.push('WhatsApp available');
    } else if (rawData.phone) {
        // If they have a phone, we can WhatsApp them (Indian market)
        points += 2;
        signals.push('Phone exists — potential WhatsApp contact');
    }

    return {
        points: Math.min(10, points),
        maxPoints: 10,
        details: signals.join(' | ') || 'No contact info found'
    };
}

function scoreDigitalGap(reviewCount, websiteData) {
    const websiteStatus = websiteData.websiteStatus || 'none';

    // Digital Gap = Customer Demand - Digital Presence
    // Uses log scale to prevent runaway scores for mega-businesses
    let websiteFactor = 0;
    switch (websiteStatus) {
        case 'none': websiteFactor = 3.0; break;
        case 'broken': websiteFactor = 2.5; break;
        case 'outdated': websiteFactor = 2.0; break;
        case 'basic': websiteFactor = 1.0; break;
        case 'good': websiteFactor = 0; break;
        default: websiteFactor = 1.5;
    }

    const gap = Math.log10(Math.max(1, reviewCount) + 1) * websiteFactor;
    const points = Math.min(15, Math.round(gap));

    return {
        points,
        maxPoints: 15,
        gap: Math.round(gap * 100) / 100,
        details: websiteFactor > 0
            ? `Digital Gap: ${Math.round(gap * 10) / 10} (demand: ${reviewCount} reviews × website factor: ${websiteFactor})`
            : 'No digital gap — website is adequate'
    };
}

// ═══════════════════════════════════════════════════════════════
// OPPORTUNITY REASON GENERATOR
// ═══════════════════════════════════════════════════════════════

function generateOpportunityReason(rawData, websiteData, layers, score) {
    const name = rawData.name || rawData.businessName || 'This business';
    const reviewCount = rawData.reviewCount || 0;
    const rating = rawData.rating || 0;
    const websiteStatus = websiteData.websiteStatus || 'none';
    const category = rawData.category || '';

    const reasons = [];

    // Lead-type specific opener
    if (score >= 80) {
        reasons.push(`${name} is a prime lead opportunity.`);
    } else if (score >= 60) {
        reasons.push(`${name} shows strong potential for digital improvement.`);
    } else if (score >= 40) {
        reasons.push(`${name} has moderate digital improvement potential.`);
    } else {
        reasons.push(`${name} has limited opportunity for digital services.`);
    }

    // Website insight
    if (websiteStatus === 'none') {
        reasons.push(`No website detected — they're losing customers to competitors with online booking.`);
    } else if (websiteStatus === 'broken') {
        reasons.push(`Their website is broken or unreachable — visitors are bouncing to competitors.`);
    } else if (websiteStatus === 'outdated') {
        reasons.push(`Their website is outdated (quality: ${websiteData.websiteQualityScore}/100) and missing modern features.`);
    }

    // Review insight
    if (reviewCount > 100 && websiteStatus !== 'good') {
        reasons.push(`With ${reviewCount} Google reviews and a ${rating}★ rating, they have proven demand but poor digital capture.`);
    } else if (reviewCount > 30) {
        reasons.push(`${reviewCount} reviews suggest active customer base.`);
    }

    // Missing features
    const missing = [];
    if (websiteData.exists && !websiteData.hasBookingSystem) missing.push('online booking');
    if (websiteData.exists && !websiteData.hasWhatsApp) missing.push('WhatsApp integration');
    if (websiteData.exists && !websiteData.isMobileResponsive) missing.push('mobile optimization');
    if (websiteData.exists && !websiteData.hasContactForm) missing.push('contact form');

    if (missing.length > 0) {
        reasons.push(`Missing: ${missing.join(', ')}.`);
    }

    return reasons.join(' ');
}

// ═══════════════════════════════════════════════════════════════
// BREAKDOWN BUILDER (for frontend BreakdownCard compatibility)
// ═══════════════════════════════════════════════════════════════

function buildBreakdown(layers) {
    return {
        // Group 1: Opportunity Analysis
        opportunity: {
            title: 'Opportunity Analysis',
            maxScore: 55,
            score: layers.digitalPresence.points + layers.demandSignal.points,
            details: [
                {
                    text: layers.digitalPresence.details,
                    impact: layers.digitalPresence.points >= 20 ? 'High' : layers.digitalPresence.points >= 10 ? 'Medium' : 'Low',
                    earned: Math.max(0, layers.digitalPresence.points),
                    possible: layers.digitalPresence.maxPoints,
                    icon: layers.digitalPresence.points >= 20 ? '🌐' : '✅'
                },
                {
                    text: layers.demandSignal.details,
                    impact: layers.demandSignal.points >= 20 ? 'High' : layers.demandSignal.points >= 10 ? 'Medium' : 'Low',
                    earned: layers.demandSignal.points,
                    possible: layers.demandSignal.maxPoints,
                    icon: layers.demandSignal.points >= 15 ? '🔥' : '📊'
                },
                {
                    text: layers.digitalGap.details,
                    impact: layers.digitalGap.points >= 10 ? 'High' : layers.digitalGap.points >= 5 ? 'Medium' : 'Low',
                    earned: layers.digitalGap.points,
                    possible: layers.digitalGap.maxPoints,
                    icon: '📈'
                }
            ]
        },
        // Group 2: Market Context
        market: {
            title: 'Market Context',
            maxScore: 20,
            score: layers.competition.points + layers.category.points,
            details: [
                {
                    text: layers.competition.details,
                    impact: layers.competition.points >= 7 ? 'High' : 'Medium',
                    earned: layers.competition.points,
                    possible: layers.competition.maxPoints,
                    icon: '⚔️'
                },
                {
                    text: layers.category.details,
                    impact: layers.category.points >= 8 ? 'High' : 'Medium',
                    earned: layers.category.points,
                    possible: layers.category.maxPoints,
                    icon: '🏷️'
                }
            ]
        },
        // Group 3: Lead Quality
        leadQuality: {
            title: 'Lead Quality',
            maxScore: 30,
            score: Math.max(0, layers.growthPotential.points + layers.contactability.points + layers.brandDetection.points),
            details: [
                {
                    text: layers.growthPotential.details,
                    impact: layers.growthPotential.points >= 15 ? 'High' : layers.growthPotential.points >= 5 ? 'Medium' : 'Low',
                    earned: layers.growthPotential.points,
                    possible: layers.growthPotential.maxPoints,
                    icon: layers.growthPotential.points >= 15 ? '🚀' : '📈'
                },
                {
                    text: layers.contactability.details,
                    impact: layers.contactability.points >= 7 ? 'High' : 'Medium',
                    earned: layers.contactability.points,
                    possible: layers.contactability.maxPoints,
                    icon: '📞'
                },
                {
                    text: layers.brandDetection.details,
                    impact: layers.brandDetection.isExcluded ? 'Critical' : layers.brandDetection.points < -15 ? 'High' : 'Low',
                    earned: Math.max(0, layers.brandDetection.points + 40), // Shift to 0-40 range for display
                    possible: 40,
                    icon: layers.brandDetection.isExcluded ? '⛔' : '🏢'
                }
            ]
        }
    };
}

module.exports = { calculateLeadScore };
