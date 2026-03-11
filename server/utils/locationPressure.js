/**
 * Expectation Scaling: Location Pressure
 * 
 * Calculates an urban intensity heuristics multiplier based on
 * the density of reviews from competitor maps results.
 * 
 * If competitors average 1000+ reviews, expectations are significantly higher 
 * (lower multiplier) than if competitors average 50 reviews (rural/niche).
 */

function getLocationPressure(competitors = []) {
    let multiplier = 0.85; // Baseline standard (suburb/moderate city)
    let marketDensity = 'Moderate Urban Density';
    const numCompetitors = competitors && competitors.length > 0 ? competitors.length : 0;

    if (numCompetitors > 0) {
        const totalReviews = competitors.reduce((sum, comp) => sum + (comp.reviews || 0), 0);
        const avgReviews = totalReviews / numCompetitors;

        if (avgReviews > 2000) {
            multiplier = 0.5; // Extreme tier-1 city intensity (NYC/London)
            marketDensity = 'Extreme Urban Intensity';
        } else if (avgReviews > 800) {
            multiplier = 0.6; // High urban density
            marketDensity = 'High Urban Density';
        } else if (avgReviews > 300) {
            multiplier = 0.75; // Moderate/Standard
            marketDensity = 'Moderate Urban Density';
        } else if (avgReviews > 100) {
            multiplier = 0.9; // Low/Suburban
            marketDensity = 'Low Urban Density';
        } else {
            multiplier = 1.0; // Rural or highly niche market
            marketDensity = 'Rural/Niche Market';
        }
    } else {
        // Fallback when competitor intel couldn't be loaded (like direct URL audits)
        multiplier = 0.8;
        marketDensity = 'Default Fallback Location Pressure';
    }

    return {
        locationMultiplier: multiplier,
        marketDensity
    };
}

module.exports = { getLocationPressure };
