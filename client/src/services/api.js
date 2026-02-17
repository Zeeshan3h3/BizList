import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Run business audit
export const runAudit = async (businessInfo) => {
    try {
        // businessInfo can contain: { businessName, area, placeUrl }
        // placeUrl is optional - if provided, audit will use that specific Google Maps listing
        const response = await apiClient.post('/audit', businessInfo);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || error.message || 'Failed to run audit',
        };
    }
};

// Create booking/lead
export const createBooking = async (bookingData) => {
    try {
        const response = await apiClient.post('/bookings', bookingData);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || error.message || 'Failed to create booking',
        };
    }
};

// Get analytics (for future use)
export const getAnalytics = async () => {
    try {
        const response = await apiClient.get('/analytics');
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error || error.message || 'Failed to fetch analytics',
        };
    }
};

export default {
    runAudit,
    createBooking,
    getAnalytics,
};
