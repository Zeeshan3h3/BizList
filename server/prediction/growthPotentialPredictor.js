/**
 * ============================================
 * GROWTH POTENTIAL PREDICTOR
 * ============================================
 * 
 * Estimates if a business can reach a Top 3 ranking in their
 * local market by closing their competitor gaps.
 * 
 * @module growthPotentialPredictor
 */

/**
 * Normalizes input data to ensure safe calculation
 * @param {Object} data - Business or gap data
 * @returns {Object} Normalized data with defaults
 */
function normalizeData(data = {}) {
    return {
        reviewCount: Number(data.reviewCount || data.reviews || 0),
        rating: Number(data.rating || 0),
        photoCount: Number(data.photoCount || (Array.isArray(data.photos) ? data.photos.length : 0)),
        responseRate: Number(data.responseRate || 0)
    };
}

/**
 * Predicts the growth potential of a business
 * 
 * @param {Object} businessData - Current business metrics
 * @param {Object} competitorGap - The output from competitorGapEngine
 * @returns {Object} Growth potential prediction
 */
function predictGrowthPotential(businessData, competitorGap = {}) {
    const businessMetrics = normalizeData(businessData);
    const gap = competitorGap.gap || { reviewsNeeded: 0, photosNeeded: 0, responseRateNeeded: 0 };
    const compAvg = competitorGap.competitorAverage || normalizeData({});

    // 1. Compute current ranking strength
    const rankingStrength =
        (0.4 * businessMetrics.reviewCount) +
        (0.3 * businessMetrics.rating * 100) +
        (0.2 * businessMetrics.photoCount) +
        (0.1 * businessMetrics.responseRate);

    // 2. Compute competitor average strength
    const competitorStrength =
        (0.4 * compAvg.reviews) +
        (0.3 * compAvg.rating * 100) +
        (0.2 * compAvg.photos) +
        (0.1 * compAvg.responseRate);

    // 3. Simulate improvements using gap data
    // If they close the gap exactly, they should match the average.
    const simulatedStrength =
        rankingStrength +
        (gap.reviewsNeeded * 0.4) +
        (gap.photosNeeded * 0.2) +
        (gap.responseRateNeeded * 0.1);

    // 4. Determine Potential
    // To reach Top 3, they usually need to EXCEED the average.
    let potential = 'LOW';
    if (simulatedStrength > competitorStrength * 1.5) {
        // If closing the gap pushes them way past the average (likely due to already having strong baseline stats in other areas)
        potential = 'HIGH';
    } else if (simulatedStrength >= competitorStrength) {
        potential = 'MEDIUM';
    } else if (rankingStrength > competitorStrength) {
        // They are already beating the average without closing gaps
        potential = 'HIGH';
    }

    return {
        potential,
        metrics: {
            currentStrength: Math.round(rankingStrength * 10) / 10,
            simulatedStrength: Math.round(simulatedStrength * 10) / 10,
            targetAverageStrength: Math.round(competitorStrength * 10) / 10
        },
        improvementsNeeded: {
            reviews: gap.reviewsNeeded || 0,
            photos: gap.photosNeeded || 0,
            responseRate: gap.responseRateNeeded || 0
        }
    };
}

module.exports = { predictGrowthPotential };
