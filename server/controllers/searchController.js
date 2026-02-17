const { searchMultipleBusinesses } = require('../utils/googleScraper');

/**
 * ============================================
 * BUSINESS SEARCH CONTROLLER
 * ============================================
 * 
 * Handles searching Google Maps for multiple businesses
 * Returns preview data for user selection
 */

/**
 * Search for businesses on Google Maps
 * POST /api/search-businesses
 */
const searchBusinesses = async (req, res) => {
    try {
        const { businessName, area } = req.body;

        // Validation
        if (!businessName || !area) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Please provide both business name and area'
            });
        }

        console.log(`[SEARCH CONTROLLER] Searching: ${businessName} in ${area}`);

        // Search Google Maps
        const searchResult = await searchMultipleBusinesses(businessName, area, 5);

        if (!searchResult.success) {
            return res.status(404).json({
                error: searchResult.error,
                message: searchResult.message,
                results: []
            });
        }

        // Return search results
        res.json({
            success: true,
            results: searchResult.results,
            query: searchResult.query,
            count: searchResult.results.length
        });

    } catch (error) {
        console.error('[SEARCH CONTROLLER ERROR] Full error details:', error);
        console.error('[SEARCH CONTROLLER ERROR] Stack:', error.stack);

        res.status(500).json({
            error: 'INTERNAL_ERROR',
            message: error.message || 'An error occurred while searching. Please try again.'
        });
    }
};

module.exports = {
    searchBusinesses
};
