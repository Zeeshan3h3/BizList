const { getAutocompletesuggestions } = require('../utils/googleScraper');

/**
 * ============================================
 * AUTOCOMPLETE CONTROLLER
 * ============================================
 * 
 * Provides business name suggestions as user types
 */

/**
 * Get autocomplete suggestions for business names
 * POST /api/autocomplete
 */
const getAutocompleteSuggestions = async (req, res) => {
    try {
        const { query, area } = req.body;

        // Validation
        if (!query || query.length < 2) {
            return res.json({
                success: true,
                suggestions: []
            });
        }

        console.log(`[AUTOCOMPLETE] Getting suggestions for: ${query} in ${area || 'any location'}`);

        // Get suggestions from Google Maps autocomplete
        const suggestions = await getAutocompletesuggestions(query, area);

        res.json({
            success: true,
            suggestions: suggestions || [],
            query
        });

    } catch (error) {
        console.error('[AUTOCOMPLETE ERROR]', error);
        // Don't fail the request, just return empty suggestions
        res.json({
            success: true,
            suggestions: []
        });
    }
};

module.exports = {
    getAutocompleteSuggestions
};
