/**
 * ============================================
 * COMPETITOR GAP ENGINE
 * ============================================
 * 
 * Calculates the exact numerical gap between a business
 * and the average performance of their local competitors.
 * 
 * @module competitorGapEngine
 */

/**
 * Normalizes input data to ensure safe calculation
 * @param {Object} data - Business or competitor data
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
 * Calculates the gap between a business and its competitors
 * 
 * @param {Object} businessData - The target business metrics
 * @param {number} businessData.reviewCount
 * @param {number} businessData.rating
 * @param {number} businessData.photoCount
 * @param {number} businessData.responseRate
 * 
 * @param {Array<Object>} competitors - Array of competitor metrics
 * @param {number} competitors[].reviewCount
 * @param {number} competitors[].rating
 * @param {number} competitors[].photoCount
 * @param {number} competitors[].responseRate
 * 
 * @returns {Object} Structured gap analysis
 */
function calculateCompetitorGap(businessData, competitors = []) {
    // 1. Normalize business data
    const businessMetrics = normalizeData(businessData);

    // 2. Handle edge case: no competitors
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
        return {
            competitorAverage: { reviews: 0, rating: 0, photos: 0, responseRate: 0 },
            businessMetrics: {
                reviews: businessMetrics.reviewCount,
                rating: businessMetrics.rating,
                photos: businessMetrics.photoCount,
                responseRate: businessMetrics.responseRate
            },
            gap: { reviewsNeeded: 0, ratingImprovement: 0, photosNeeded: 0, responseRateNeeded: 0 }
        };
    }

    // 3. Normalize all competitors and calculate sums
    let totalReviews = 0;
    let totalRating = 0;
    let totalPhotos = 0;
    let totalResponseRate = 0;

    competitors.forEach(comp => {
        const norm = normalizeData(comp);
        totalReviews += norm.reviewCount;
        totalRating += norm.rating;
        totalPhotos += norm.photoCount;
        totalResponseRate += norm.responseRate;
    });

    const count = competitors.length;

    // 4. Calculate averages
    const competitorAverage = {
        reviews: Math.round(totalReviews / count),
        rating: Number((totalRating / count).toFixed(1)),
        photos: Math.round(totalPhotos / count),
        responseRate: Math.round(totalResponseRate / count)
    };

    // 5. Calculate gaps (only positive gaps, negatives mean the business is winning)
    const gap = {
        reviewsNeeded: Math.max(0, competitorAverage.reviews - businessMetrics.reviewCount),
        ratingImprovement: Number(Math.max(0, competitorAverage.rating - businessMetrics.rating).toFixed(1)),
        photosNeeded: Math.max(0, competitorAverage.photos - businessMetrics.photoCount),
        responseRateNeeded: Math.max(0, competitorAverage.responseRate - businessMetrics.responseRate)
    };

    return {
        competitorAverage,
        businessMetrics: {
            reviews: businessMetrics.reviewCount,
            rating: businessMetrics.rating,
            photos: businessMetrics.photoCount,
            responseRate: businessMetrics.responseRate
        },
        gap
    };
}

module.exports = { calculateCompetitorGap };
