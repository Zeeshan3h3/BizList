/**
 * Expectation Scaling: Category Multiplier
 * 
 * Maps business categories into High Visual, Medium, and Low Visual tiers.
 * Visual categories (like Restaurants, Cafes, and Spas) are expected to have
 * much higher photo, review, and social interaction density than B2B or trade services.
 */

function getCategoryMultiplier(categoryName = '') {
    const category = (categoryName || '').toLowerCase();

    const highVisualKeywords = [
        'restaurant', 'cafe', 'coffee', 'bakery', 'bar', 'club',
        'salon', 'spa', 'gym', 'fitness', 'hotel', 'resort',
        'apparel', 'boutique', 'florist', 'jewelry'
    ];

    const mediumVisualKeywords = [
        'dental', 'medical', 'real estate', 'auto', 'car wash',
        'repair', 'plumber', 'roofing', 'contractor', 'landscaping',
        'cleaning', 'laundry', 'veterinarian'
    ];

    // Low visual is the fallback/default for trade, B2B, attorneys, accounting, etc.
    let multiplier = 1.0;
    let tier = 'Low Visual';

    if (highVisualKeywords.some(kw => category.includes(kw))) {
        multiplier = 0.4;
        tier = 'High Visual';
    } else if (mediumVisualKeywords.some(kw => category.includes(kw))) {
        multiplier = 0.7;
        tier = 'Medium Visual';
    }

    return {
        categoryMultiplier: multiplier,
        visualExpectationTier: tier
    };
}

module.exports = { getCategoryMultiplier };
