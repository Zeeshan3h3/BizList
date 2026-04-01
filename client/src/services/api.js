import axios from 'axios';

// In production, VITE_API_URL points to the backend host.
// In local dev, Vite's proxy handles /api/* so we use a relative path.
const BASE_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 90_000, // 90s — audit scraping can take a while
    headers: { 'Content-Type': 'application/json' },
});

// Normalise any Axios error into a plain string the UI can display
function extractErrorMessage(error) {
    return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'An unexpected error occurred'
    );
}

// ─── Audit ────────────────────────────────────────────────────────────────────

/** Run a full business audit.
 * @param {{ businessName?: string, area?: string, placeUrl?: string, forceReaudit?: boolean, mode?: string }} params
 */
export const runAudit = async (params) => {
    try {
        const { data } = await apiClient.post('/audit', params);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: extractErrorMessage(error) };
    }
};

// ─── Bookings ─────────────────────────────────────────────────────────────────

/** Create a lead / consultation booking. */
export const createBooking = async (bookingData) => {
    try {
        const { data } = await apiClient.post('/bookings', bookingData);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: extractErrorMessage(error) };
    }
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const getAnalytics = async () => {
    try {
        const { data } = await apiClient.get('/analytics');
        return { success: true, data };
    } catch (error) {
        return { success: false, error: extractErrorMessage(error) };
    }
};

// ─── Recent Audits ────────────────────────────────────────────────────────────

export const getRecentAudits = async (limit = 10) => {
    try {
        const { data } = await apiClient.get('/audits/recent', { params: { limit } });
        return { success: true, data };
    } catch (error) {
        return { success: false, error: extractErrorMessage(error) };
    }
};

// ─── Business Search / Autocomplete ──────────────────────────────────────────

export const searchBusinesses = async (businessName, area) => {
    try {
        const { data } = await apiClient.post('/search-businesses', { businessName, area });
        return { success: true, data };
    } catch (error) {
        return { success: false, error: extractErrorMessage(error) };
    }
};

export const getAutocompleteSuggestions = async (query, area) => {
    try {
        const { data } = await apiClient.post('/autocomplete', { query, area });
        return { success: true, data };
    } catch (error) {
        return { success: false, error: extractErrorMessage(error) };
    }
};

// ─── Templates ────────────────────────────────────────────────────────────────

export const getTemplates = async () => {
    try {
        const { data } = await apiClient.get('/templates');
        return { success: true, data };
    } catch (error) {
        return { success: false, error: extractErrorMessage(error) };
    }
};

export const getTemplateById = async (templateId) => {
    try {
        const { data } = await apiClient.get(`/templates/${templateId}`);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: extractErrorMessage(error) };
    }
};

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const getReviews = async (templateId, params = {}) => {
    try {
        const { data } = await apiClient.get(`/reviews/${templateId}`, { params });
        return { success: true, data };
    } catch (error) {
        return { success: false, error: extractErrorMessage(error) };
    }
};

export const createReview = async (templateId, reviewData) => {
    try {
        const { data } = await apiClient.post(`/reviews/${templateId}`, reviewData);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: extractErrorMessage(error) };
    }
};

export const voteReview = async (reviewId, vote) => {
    try {
        const { data } = await apiClient.post(`/reviews/${reviewId}/vote`, { vote });
        return { success: true, data };
    } catch (error) {
        return { success: false, error: extractErrorMessage(error) };
    }
};

export const deleteReview = async (reviewId, clerkUserId) => {
    try {
        const { data } = await apiClient.delete(`/reviews/${reviewId}`, { data: { clerkUserId } });
        return { success: true, data };
    } catch (error) {
        return { success: false, error: extractErrorMessage(error) };
    }
};

export { apiClient };
export const API_BASE_URL = BASE_URL;

export default {
    runAudit,
    createBooking,
    getAnalytics,
    getRecentAudits,
    searchBusinesses,
    getAutocompleteSuggestions,
    getTemplates,
    getTemplateById,
    getReviews,
    createReview,
    voteReview,
    deleteReview,
};
