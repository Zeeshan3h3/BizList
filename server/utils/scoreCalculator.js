/**
 * ============================================
 * SALES-DRIVEN DIGITAL HEALTH SCORE CALCULATOR
 * ============================================
 * 
 * Purpose: Calculate a 0-100 score focusing on "Sales Triggers"
 * Philosophy: POSITIVE REINFORCEMENT ONLY (No negative points)
 * 
 * SCORING BREAKDOWN (Total 100):
 * 1. Google Maps: 80 points (The core of local business)
 * 2. JustDial: 10 points (Local presence)
 * 3. Website: 10 points (Credibility)
 */

/**
 * Calculate Google Maps Score (MAX 80 points)
 */
function calculateGoogleMapsScore(data) {
    let score = 0;
    const details = [];

    // 1. Claimed Status (20 pts) - The "Golden Ticket"
    // If unclaimed, they miss out on 20 huge points.
    if (data.isClaimed) {
        score += 20;
        details.push({ status: 'success', text: '✓ Business is claimed (+20)' });
    } else {
        details.push({ status: 'danger', text: '🚨 BUSINESS IS UNCLAIMED (0) - Critical Risk!' });
    }

    // 2. Review Recency "Zombie Check" (10 pts)
    // Active if latest review is < 30 days old
    let isRecent = false;
    if (data.latestReviewDate) {
        // Parsing "5 days ago", "2 weeks ago" etc is hard without library, 
        // usually the raw string "a month ago" is enough to guess. 
        // But for robust scoring, we rely on the string not containing "year" or "months" (plural) if we want strict < 1 month.
        // Actually simpler: if it says "days", "hours", "minutes", or "a week", "2 weeks", "3 weeks", or "a month".
        // If it says "2 months", "year", it's old.
        const dateStr = (data.latestReviewDate || '').toLowerCase();
        if (
            dateStr.includes('second') ||
            dateStr.includes('minute') ||
            dateStr.includes('hour') ||
            dateStr.includes('day') ||
            dateStr.includes('week') ||
            dateStr === 'a month ago'
        ) {
            isRecent = true;
        }
    }

    if (isRecent) {
        score += 10;
        details.push({ status: 'success', text: '✓ Recent reviews found (Alive & Kicking) (+10)' });
    } else {
        details.push({ status: 'warning', text: '⚠️ No recent reviews (Zombie Listing) (0)' });
    }

    // 3. Owner Response "Ignorant Check" (10 pts)
    if (data.ownerResponseCount > 0) {
        score += 10;
        details.push({ status: 'success', text: '✓ Owner replies to reviews (+10)' });
    } else {
        details.push({ status: 'warning', text: '⚠️ No owner responses to recent reviews (0)' });
    }

    // 4. Photos "Visual Appeal" (10 pts)
    if (data.hasOwnerPhotos) {
        score += 10;
        details.push({ status: 'success', text: '✓ Owner-uploaded photos present (+10)' });
    } else {
        details.push({ status: 'warning', text: '⚠️ No "By Owner" photos detected (0)' });
    }

    // 5. Reliability / Hours (10 pts)
    if (!data.hoursMissing && data.hours) {
        score += 10;
        details.push({ status: 'success', text: '✓ Operating hours present (+10)' });
    } else {
        details.push({ status: 'danger', text: '🚨 Missing operating hours (Ghost Store) (0)' });
    }

    // 6. Rating (10 pts)
    const rating = parseFloat(data.rating) || 0;
    if (rating >= 4.0) {
        score += 10;
        details.push({ status: 'success', text: `⭐ Good rating (${rating}) (+10)` });
    } else {
        details.push({ status: 'warning', text: `⚠️ Rating below 4.0 (${rating}) (0)` });
    }

    // 7. Information Found (10 pts)
    // Phone (5) + Address (5)
    let infoScore = 0;
    if (data.phone) infoScore += 5;
    if (data.address) infoScore += 5;

    if (infoScore === 10) {
        score += 10;
        details.push({ status: 'success', text: '✓ Complete info (Phone & Address) (+10)' });
    } else {
        score += infoScore;
        details.push({ status: 'warning', text: `⚠️ Incomplete info (+${infoScore})` });
    }

    return { score: Math.min(score, 80), details };
}

/**
 * Calculate JustDial Score (MAX 10 points)
 */
function calculateJustDialScore(data) {
    const details = [];
    if (data && data.hasListing) {
        details.push({ status: 'success', text: '✓ Listed on JustDial (+10)' });
        return { score: 10, details };
    }
    details.push({ status: 'danger', text: '✗ Not found on JustDial (0)' });
    return { score: 0, details };
}

/**
 * Calculate Website Score (MAX 10 points)
 */
function calculateWebsiteScore(websiteUrl) {
    const details = [];
    if (websiteUrl && websiteUrl.length > 5) { // Basic validation
        details.push({ status: 'success', text: '✓ Website link present (+10)' });
        return { score: 10, details };
    }
    details.push({ status: 'danger', text: '✗ No website link (0)' });
    return { score: 0, details };
}

/**
 * Main Function: Calculate Complete Health Score
 */
function calculateHealthScore(rawData, justdialData, websiteData = null) {
    const googleMaps = calculateGoogleMapsScore(rawData);
    const justdial = calculateJustDialScore(justdialData);
    const website = calculateWebsiteScore(rawData.website);

    const totalScore = googleMaps.score + justdial.score + website.score;

    // Status message based on sales potential
    let status, message;
    if (totalScore >= 80) {
        status = 'success';
        message = '🏆 Market Leader - Hard to fail!';
    } else if (totalScore >= 50) {
        status = 'warning';
        message = '⚠️ Vulnerable - Needs optimization';
    } else {
        status = 'danger';
        message = '🚨 Critical Condition - Ignoring digital customers';
    }

    return {
        totalScore: Math.round(totalScore),
        maxScore: 100,
        percentage: Math.round(totalScore),
        status,
        message,
        breakdown: {
            googleMaps: {
                score: googleMaps.score,
                maxScore: 80,
                details: googleMaps.details
            },
            justdial: {
                score: justdial.score,
                maxScore: 10,
                details: justdial.details
            },
            website: {
                score: website.score,
                maxScore: 10,
                details: website.details
            }
        }
    };
}

module.exports = {
    calculateHealthScore
};
