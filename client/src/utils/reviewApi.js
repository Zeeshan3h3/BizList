const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Fetch all templates with review stats
 */
export async function fetchTemplates() {
    const res = await fetch(`${API_URL}/api/templates`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch templates');
    return data;
}

/**
 * Fetch a single template by ID
 */
export async function fetchTemplate(templateId) {
    const res = await fetch(`${API_URL}/api/templates/${templateId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Template not found');
    return data;
}

/**
 * Fetch reviews for a template
 */
export async function fetchReviews(templateId, { sort = 'recent', page = 1, limit = 10, clerkUserId = null } = {}) {
    const params = new URLSearchParams({ sort, page, limit });
    if (clerkUserId) params.append('clerkUserId', clerkUserId);
    const res = await fetch(`${API_URL}/api/reviews/${templateId}?${params}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch reviews');
    return data;
}

/**
 * Submit a new review
 */
export async function submitReview(templateId, { authorName, websiteUrl, rating, comment, clerkUserId }) {
    const res = await fetch(`${API_URL}/api/reviews/${templateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName, websiteUrl, rating, comment, clerkUserId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to submit review');
    return data;
}

/**
 * Vote on a review
 */
export async function voteReview(reviewId, vote) {
    const res = await fetch(`${API_URL}/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to vote');
    return data;
}

/**
 * Increment template usage count
 */
export async function useTemplate(templateId) {
    const res = await fetch(`${API_URL}/api/templates/${templateId}/use`, {
        method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to record usage');
    return data;
}

/**
 * Delete a review (author only)
 */
export async function deleteReview(reviewId, clerkUserId) {
    const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkUserId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete review');
    return data;
}

/**
 * Seed templates into DB if missing
 */
export async function seedTemplates() {
    const res = await fetch(`${API_URL}/api/templates/seed`, {
        method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to seed templates');
    return data;
}
