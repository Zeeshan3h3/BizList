/**
 * ============================================
 * LOCAL DEMAND SCANNER
 * ============================================
 * 
 * Analyzes an entire local market to determine the actual
 * opportunity for a business to succeed based on consumer
 * demand vs competitor strength.
 */

function analyzeMarketDemand(category, location, competitors = []) {
    // 1. Handle edge cases (no competitors found)
    if (!competitors || competitors.length === 0) {
        return {
            demandScore: 0,
            competitionScore: 0,
            opportunityIndex: 0,
            insights: ['Not enough market data to analyze demand.']
        };
    }

    // 2. Calculate Market Demand (Based on total reviews in the market)
    let totalReviews = 0;
    
    // We count how many competitors are considered "strong"
    let strongBusinesses = 0; 
    
    competitors.forEach(comp => {
        const reviews = Number(comp.reviews || comp.reviewCount || 0);
        const rating = Number(comp.rating || 0);

        totalReviews += reviews;

        // A business is "strong" if it has > 100 reviews and a rating >= 4.2
        if (reviews > 100 && rating >= 4.2) {
            strongBusinesses++;
        }
    });

    // Demand Formula: log10(totalReviews + 1) * 25
    // Logarithmic scale prevents mega-markets from breaking the 0-100 scale
    let demandScore = Math.round(Math.log10(totalReviews + 1) * 25);
    // Cap at 100
    demandScore = Math.min(100, Math.max(0, demandScore));

    // 3. Calculate Competition Density (Percentage of strong competitors)
    // Formula: strongBusinesses / totalBusinesses
    const competitionRatio = strongBusinesses / competitors.length; 
    
    // Convert to a 0-100 score
    const competitionScore = Math.round(competitionRatio * 100);

    // 4. Calculate Opportunity Index
    // High Demand + Low Competition = High Opportunity
    // Formula: demandScore * (1 - competitionRatio)
    const opportunityIndex = Math.round(demandScore * (1 - competitionRatio));

    // 5. Generate Human-Readable Labels
    const demandLevel = demandScore > 75 ? 'HIGH' : demandScore > 40 ? 'MEDIUM' : 'LOW';
    const competitionLevel = competitionScore > 50 ? 'HIGH' : competitionScore > 25 ? 'MEDIUM' : 'LOW';
    const opportunityLevel = opportunityIndex > 60 ? 'HIGH' : opportunityIndex > 30 ? 'MEDIUM' : 'LOW';

    // 6. Generate Contextual Insights
    const insights = [
        `${totalReviews.toLocaleString()} customer reviews across top competitors.`,
        `${strongBusinesses} ${category || 'businesses'} currently dominate this local market.`,
    ];

    if (opportunityIndex > 60) {
        insights.push('Strong demand with weak competition. Excellent market to capture.');
    } else if (competitionScore > 50) {
        insights.push('Highly competitive market. Requires aggressive digital strategy to stand out.');
    } else if (demandScore < 40) {
        insights.push('Low search volume/demand in this specific area for this category.');
    }

    // 7. Return the structured data
    return {
        metrics: {
            demandScore,
            competitionScore,
            opportunityIndex
        },
        labels: {
            demandLevel,
            competitionLevel,
            opportunityLevel
        },
        insightDetails: {
            totalMarketReviews: totalReviews,
            strongCompetitors: strongBusinesses,
            totalCompetitorsAnalyzed: competitors.length
        },
        insights
    };
}

module.exports = { analyzeMarketDemand };
