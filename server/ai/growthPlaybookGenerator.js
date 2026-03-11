/**
 * ============================================
 * AI GROWTH PLAYBOOK GENERATOR
 * ============================================
 * 
 * Generates a prioritized, time-bound growth plan based on 
 * a business's specific digital gaps and market position.
 * 
 * @module growthPlaybookGenerator
 */

/**
 * Generates a structured growth playbook
 * 
 * @param {Object} data - Aggregate intelligence data
 * @param {number} data.businessScore - Overall health or lead score
 * @param {Object} data.competitorGap - Output from competitorGapEngine
 * @param {Object} data.websiteQuality - Website analysis data
 * @param {string} data.category - Business category
 * @param {string} data.brandType - Output from brand intelligence
 * @returns {Object} A structured timeline playbook
 */
function generateGrowthPlan(data = {}) {
    const {
        competitorGap = {},
        websiteQuality = {},
        category = 'business'
    } = data;

    const gap = competitorGap.gap || { reviewsNeeded: 0, photosNeeded: 0, responseRateNeeded: 0, ratingImprovement: 0 };
    const websiteStatus = websiteQuality.websiteStatus || 'none';
    const isMobileResponsive = websiteQuality.isMobileResponsive !== false; // default true if unknown
    const hasBookingSystem = websiteQuality.hasBookingSystem || false;

    const timeline = {
        week1_2: [],
        week3_6: [],
        week7_12: []
    };

    // --- Critical Priority (Weeks 1-2) ---
    // Rule 1: Fix missing or broken website immediately
    if (websiteStatus === 'none' || websiteStatus === 'broken') {
        timeline.week1_2.push({
            action: 'Deploy Foundation Website',
            reason: 'You currently have no working website. Competitors are actively capturing your search traffic.',
            impact: 'Critical'
        });
    } else if (websiteStatus === 'outdated' || !isMobileResponsive) {
        timeline.week1_2.push({
            action: 'Modernize & Mobile-Optimize Website',
            reason: 'Your current site is outdated or not mobile-friendly, causing high bounce rates on phones.',
            impact: 'High'
        });
    }

    // Rule 2: Fix severe owner response gaps
    if (gap.responseRateNeeded > 20) {
        timeline.week1_2.push({
            action: 'Implement Review Response Protocol',
            reason: `You are responding to ${gap.responseRateNeeded}% fewer reviews than top competitors. Google algorithm favors active owners.`,
            impact: 'Medium'
        });
    }

    // --- High Priority (Weeks 3-6) ---
    // Rule 3: Close the review gap
    if (gap.reviewsNeeded > 0) {
        timeline.week3_6.push({
            action: 'Launch Automated Review Campaign',
            reason: `You need ${gap.reviewsNeeded} more reviews to match local market averages. Implement SMS/Email review requests.`,
            impact: 'High'
        });
    }

    // Rule 4: Fix rating issues
    if (gap.ratingImprovement > 0) {
        timeline.week3_6.push({
            action: 'Internal Operations Audit',
            reason: `Your rating is ${gap.ratingImprovement} stars below competitors. Intercept negative feedback before it reaches Google.`,
            impact: 'High'
        });
    }

    // Rule 5: Photo freshness
    if (gap.photosNeeded > 0) {
        timeline.week3_6.push({
            action: 'Local SEO Visual Update',
            reason: `Upload ${gap.photosNeeded} new photos/updates to your Google profile to signal active status to the algorithm.`,
            impact: 'Medium'
        });
    }

    // --- Growth & Conversion (Weeks 7-12) ---
    // Rule 6: Conversion Features
    if (websiteStatus !== 'none' && !hasBookingSystem) {
        timeline.week7_12.push({
            action: `Implement Online Conversion Tools for ${category}`,
            reason: 'Add direct booking/quoting systems to capture leads immediately when they find you.',
            impact: 'High'
        });
    }

    // If they have no gaps, give them an advanced play
    if (timeline.week1_2.length === 0 && timeline.week3_6.length === 0) {
        timeline.week7_12.push({
            action: 'Scale Paid Acquisition',
            reason: 'Your digital foundations are flawless. It is time to scale traffic using Google Ads or Meta Ads to dominate the local market.',
            impact: 'High'
        });
    }

    return {
        strategy: 'Local Market Dominance',
        timeline
    };
}

module.exports = { generateGrowthPlan };
