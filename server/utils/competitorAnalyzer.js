/**
 * ============================================
 * COMPETITOR ANALYZER
 * ============================================
 * 
 * Computes competitive gaps from scraper competitors[] data.
 * Used by Business Health Scorer for Tier 6 (Competitive Strength).
 */

function analyzeCompetitors(rawData) {
    const competitors = rawData.competitors || [];
    const myReviews = rawData.reviewCount || 0;
    const myRating = rawData.rating || 0;
    const myPhotos = (rawData.photos || []).length;

    // Filter out self from competitors (first entry is usually self)
    const others = competitors.length > 1 ? competitors.slice(1) : competitors;

    if (others.length === 0) {
        return {
            hasData: false,
            competitorCount: 0,
            avgCompetitorReviews: 0,
            avgCompetitorRating: 0,
            reviewGap: 0,
            ratingGap: 0,
            mediaGap: 0,
            reviewGapPercent: 0,
            isLeading: false,
            insights: ['No competitor data available']
        };
    }

    const avgReviews = Math.round(others.reduce((sum, c) => sum + (c.reviews || 0), 0) / others.length);
    const avgRating = parseFloat((others.reduce((sum, c) => sum + (c.rating || 0), 0) / others.length).toFixed(1));

    // Estimated competitor photos (proxy: reviews / 10, capped at 50)
    const avgCompetitorPhotos = Math.min(50, Math.round(avgReviews / 10));

    const reviewGap = myReviews - avgReviews;
    const ratingGap = parseFloat((myRating - avgRating).toFixed(1));
    const mediaGap = myPhotos - avgCompetitorPhotos;
    const reviewGapPercent = avgReviews > 0 ? Math.round((reviewGap / avgReviews) * 100) : 0;

    const insights = [];

    if (reviewGap < -50) {
        insights.push(`Competitors average ${avgReviews} reviews — you have ${myReviews}. Gap: ${Math.abs(reviewGap)} reviews behind.`);
    } else if (reviewGap < 0) {
        insights.push(`Slightly behind on reviews (${myReviews} vs avg ${avgReviews}).`);
    } else {
        insights.push(`Leading in reviews (${myReviews} vs avg ${avgReviews}).`);
    }

    if (ratingGap < -0.3) {
        insights.push(`Rating (${myRating}★) is below competitor average (${avgRating}★).`);
    } else if (ratingGap >= 0) {
        insights.push(`Rating (${myRating}★) matches or beats competitors (${avgRating}★).`);
    }

    if (mediaGap < -5) {
        insights.push(`Fewer photos than competitors — consider adding more.`);
    }

    return {
        hasData: true,
        competitorCount: others.length,
        avgCompetitorReviews: avgReviews,
        avgCompetitorRating: avgRating,
        reviewGap,
        ratingGap,
        mediaGap,
        reviewGapPercent,
        isLeading: reviewGap >= 0 && ratingGap >= 0,
        insights
    };
}

module.exports = { analyzeCompetitors };
