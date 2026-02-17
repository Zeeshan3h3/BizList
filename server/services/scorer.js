// ============================================
// SCORING SERVICE
// ============================================

/**
 * Calculate overall digital health score
 * @param {object} googleData - Google Maps analysis results
 * @param {object} justdialData - JustDial analysis results
 * @param {object} facebookData - Facebook analysis results
 * @returns {object} Complete score breakdown
 */
function calculateScore(googleData, justdialData, facebookData) {
    const googleScore = scoreGoogle(googleData);
    const justdialScore = scoreJustDial(justdialData);
    const facebookScore = scoreFacebook(facebookData);
    const websiteScore = scoreWebsite(googleData, justdialData);

    const totalScore = googleScore.score + justdialScore.score + facebookScore.score + websiteScore.score;

    return {
        totalScore: Math.round(totalScore),
        google: googleScore,
        justdial: justdialScore,
        facebook: facebookScore,
        website: websiteScore
    };
}

/**
 * Score Google Maps presence (40 points max)
 */
function scoreGoogle(data) {
    const breakdown = {
        score: 0,
        maxScore: 40,
        details: []
    };

    const raw = data.rawData;

    // Listing exists (10 points)
    if (raw.hasListing) {
        breakdown.score += 10;
        breakdown.details.push({
            status: 'success',
            text: '✓ Google Maps listing found'
        });
    } else {
        breakdown.details.push({
            status: 'danger',
            text: '✗ No Google Maps listing found'
        });
    }

    // Has website (10 points)
    if (raw.hasWebsite) {
        breakdown.score += 10;
        breakdown.details.push({
            status: 'success',
            text: '✓ Website link added to Google listing'
        });
    } else {
        breakdown.details.push({
            status: 'danger',
            text: '✗ No website link on Google listing'
        });
    }

    // Business hours (5 points)
    if (raw.hasHours) {
        breakdown.score += 5;
        breakdown.details.push({
            status: 'success',
            text: '✓ Business hours provided'
        });
    } else {
        breakdown.details.push({
            status: 'warning',
            text: '⚠ Business hours not set'
        });
    }

    // Photos (5 points)
    if (raw.photoCount >= 5) {
        breakdown.score += 5;
        breakdown.details.push({
            status: 'success',
            text: `✓ Good photo gallery (${raw.photoCount} photos)`
        });
    } else if (raw.photoCount > 0) {
        breakdown.score += 2;
        breakdown.details.push({
            status: 'warning',
            text: `⚠ Only ${raw.photoCount} photos (need at least 5)`
        });
    } else {
        breakdown.details.push({
            status: 'danger',
            text: '✗ No photos uploaded'
        });
    }

    // Reviews (5 points)
    if (raw.reviewCount >= 10) {
        breakdown.score += 5;
        breakdown.details.push({
            status: 'success',
            text: `✓ Good review count (${raw.reviewCount} reviews)`
        });
    } else if (raw.reviewCount > 0) {
        breakdown.score += 2;
        breakdown.details.push({
            status: 'warning',
            text: `⚠ Only ${raw.reviewCount} reviews (need at least 10)`
        });
    } else {
        breakdown.details.push({
            status: 'danger',
            text: '✗ No customer reviews'
        });
    }

    // Rating (5 points)
    if (raw.rating >= 4.0) {
        breakdown.score += 5;
        breakdown.details.push({
            status: 'success',
            text: `✓ Excellent rating (${raw.rating.toFixed(1)} stars)`
        });
    } else if (raw.rating >= 3.0) {
        breakdown.score += 3;
        breakdown.details.push({
            status: 'warning',
            text: `⚠ Average rating (${raw.rating.toFixed(1)} stars)`
        });
    } else if (raw.rating > 0) {
        breakdown.details.push({
            status: 'danger',
            text: `✗ Low rating (${raw.rating.toFixed(1)} stars)`
        });
    }

    return breakdown;
}

/**
 * Score JustDial presence (25 points max)
 */
function scoreJustDial(data) {
    const breakdown = {
        score: 0,
        maxScore: 25,
        details: []
    };

    const raw = data.rawData;

    // Listing exists (10 points)
    if (raw.hasListing) {
        breakdown.score += 10;
        breakdown.details.push({
            status: 'success',
            text: '✓ JustDial listing found'
        });
    } else {
        breakdown.details.push({
            status: 'danger',
            text: '✗ No JustDial listing'
        });
    }

    // Complete contact info (10 points)
    if (raw.hasCompleteContact) {
        breakdown.score += 10;
        breakdown.details.push({
            status: 'success',
            text: '✓ Contact information complete'
        });
    } else if (raw.hasListing) {
        breakdown.details.push({
            status: 'warning',
            text: '⚠ Contact information incomplete'
        });
    }

    // Has reviews (5 points)
    if (raw.hasReviews && raw.reviewCount >= 5) {
        breakdown.score += 5;
        breakdown.details.push({
            status: 'success',
            text: `✓ Customer reviews present (${raw.reviewCount})`
        });
    } else if (raw.hasReviews) {
        breakdown.score += 2;
        breakdown.details.push({
            status: 'warning',
            text: `⚠ Few reviews (${raw.reviewCount})`
        });
    } else if (raw.hasListing) {
        breakdown.details.push({
            status: 'danger',
            text: '✗ No customer reviews'
        });
    }

    return breakdown;
}

/**
 * Score Facebook presence (25 points max)
 */
function scoreFacebook(data) {
    const breakdown = {
        score: 0,
        maxScore: 25,
        details: []
    };

    const raw = data.rawData;

    // Page exists (10 points)
    if (raw.hasPage) {
        breakdown.score += 10;
        breakdown.details.push({
            status: 'success',
            text: '✓ Facebook business page found'
        });
    } else {
        breakdown.details.push({
            status: 'danger',
            text: '✗ No Facebook business page'
        });
    }

    // Follower count (5 points)
    if (raw.followerCount >= 100) {
        breakdown.score += 5;
        breakdown.details.push({
            status: 'success',
            text: `✓ Good follower base (${raw.followerCount} followers)`
        });
    } else if (raw.followerCount > 0) {
        breakdown.score += 2;
        breakdown.details.push({
            status: 'warning',
            text: `⚠ Small follower base (${raw.followerCount} followers)`
        });
    } else if (raw.hasPage) {
        breakdown.details.push({
            status: 'danger',
            text: '✗ Very few followers'
        });
    }

    // Recent activity (5 points)
    if (raw.hasRecentPosts) {
        breakdown.score += 5;
        breakdown.details.push({
            status: 'success',
            text: '✓ Active page with recent posts'
        });
    } else if (raw.hasPage) {
        breakdown.details.push({
            status: 'warning',
            text: '⚠ Inactive page (no recent posts)'
        });
    }

    // Verified badge (5 points)
    if (raw.isVerified) {
        breakdown.score += 5;
        breakdown.details.push({
            status: 'success',
            text: '✓ Verified business page'
        });
    } else if (raw.hasPage) {
        breakdown.details.push({
            status: 'warning',
            text: '⚠ Page not verified'
        });
    }

    return breakdown;
}

/**
 * Score website quality (10 points max)
 */
function scoreWebsite(googleData, justdialData) {
    const breakdown = {
        score: 0,
        maxScore: 10,
        details: []
    };

    // Has website (5 points)
    if (googleData.rawData.hasWebsite) {
        breakdown.score += 5;
        breakdown.details.push({
            status: 'success',
            text: '✓ Website exists'
        });

        // Mobile-friendly (5 points)
        // Note: Would need actual website check for this
        // For now, give partial credit
        breakdown.score += 3;
        breakdown.details.push({
            status: 'warning',
            text: '⚠ Website mobile-friendliness not verified'
        });
    } else {
        breakdown.details.push({
            status: 'danger',
            text: '✗ No website found'
        });
        breakdown.details.push({
            status: 'danger',
            text: '✗ Missing online booking/contact forms'
        });
    }

    return breakdown;
}

module.exports = {
    calculateScore
};
