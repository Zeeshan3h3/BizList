const axios = require('axios');

// ============================================
// GOOGLE PLACES API INTEGRATION
// ============================================

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';

/**
 * Analyze a business on Google Maps
 * @param {string} businessName - Name of the business
 * @param {string} area - Area/city location
 * @returns {object} Analysis results
 */
async function analyze(businessName, area) {
    try {
        // Step 1: Find the place
        const placeId = await findPlace(businessName, area);

        if (!placeId) {
            return getDefaultResult(false);
        }

        // Step 2: Get detailed information
        const details = await getPlaceDetails(placeId);

        // Step 3: Analyze the data
        return analyzeDetails(details);

    } catch (error) {
        console.error('Google Maps analysis error:', error.message);
        return getDefaultResult(false);
    }
}

/**
 * Find a place using Google Places API
 */
async function findPlace(businessName, area) {
    if (!API_KEY) {
        console.warn('Google Places API key not configured');
        return null;
    }

    try {
        const query = `${businessName} ${area}`;
        const response = await axios.get(`${PLACES_API_BASE}/findplacefromtext/json`, {
            params: {
                input: query,
                inputtype: 'textquery',
                fields: 'place_id,name',
                key: API_KEY
            }
        });

        if (response.data.status === 'OK' && response.data.candidates.length > 0) {
            return response.data.candidates[0].place_id;
        }

        return null;
    } catch (error) {
        console.error('Find place error:', error.message);
        return null;
    }
}

/**
 * Get detailed information about a place
 */
async function getPlaceDetails(placeId) {
    try {
        const response = await axios.get(`${PLACES_API_BASE}/details/json`, {
            params: {
                place_id: placeId,
                fields: 'name,website,formatted_phone_number,opening_hours,rating,user_ratings_total,photos,types,business_status,icon',
                key: API_KEY
            }
        });

        if (response.data.status === 'OK') {
            return response.data.result;
        }

        return null;
    } catch (error) {
        console.error('Place details error:', error.message);
        return null;
    }
}

/**
 * Get photo URL from photo reference
 * @param {string} photoReference - Photo reference from Places API
 * @param {number} maxWidth - Maximum width of the photo (default 400)
 */
function getPhotoUrl(photoReference, maxWidth = 400) {
    if (!API_KEY || !photoReference) {
        return null;
    }

    return `${PLACES_API_BASE}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${API_KEY}`;
}

/**
 * Analyze place details and generate insights
 */
function analyzeDetails(details) {
    if (!details) {
        return getDefaultResult(false);
    }

    const findings = {
        hasListing: true,
        hasWebsite: !!details.website,
        hasPhone: !!details.formatted_phone_number,
        hasHours: !!details.opening_hours,
        photoCount: details.photos ? details.photos.length : 0,
        reviewCount: details.user_ratings_total || 0,
        rating: details.rating || 0,
        isActive: details.business_status === 'OPERATIONAL',
        businessName: details.name || '',
        icon: details.icon || null
    };

    // Get logo (first photo or icon)
    let logo = null;
    if (details.photos && details.photos.length > 0) {
        logo = getPhotoUrl(details.photos[0].photo_reference, 200);
    }

    // Get business photos (up to 5)
    const photos = [];
    if (details.photos && details.photos.length > 0) {
        const photoCount = Math.min(details.photos.length, 5);
        for (let i = 0; i < photoCount; i++) {
            photos.push(getPhotoUrl(details.photos[i].photo_reference, 400));
        }
    }

    return {
        found: true,
        rawData: findings,
        details,
        logo,
        photos
    };
}

/**
 * Get default result when business not found or API fails
 */
function getDefaultResult(found = false) {
    return {
        found,
        rawData: {
            hasListing: found,
            hasWebsite: false,
            hasPhone: false,
            hasHours: false,
            photoCount: 0,
            reviewCount: 0,
            rating: 0,
            isActive: false,
            businessName: '',
            icon: null
        },
        details: null,
        logo: null,
        photos: []
    };
}

module.exports = {
    analyze,
    getDefaultResult
};
