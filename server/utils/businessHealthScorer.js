/**
 * ============================================
 * BUSINESS HEALTH SCORING ENGINE
 * ============================================
 * 
 * 6-Tier scoring system that measures how strong a business is online.
 * This is the CUSTOMER-FACING scorer — it helps businesses improve.
 * 
 * HIGH score = business is doing well digitally
 * LOW score  = business needs to improve
 * 
 * Tiers:
 *   1. Business Legitimacy    (20 pts)
 *   2. Customer Trust          (25 pts)
 *   3. Visibility Power        (20 pts)
 *   4. Website Performance     (15 pts)
 *   5. Customer Conversion     (10 pts)
 *   6. Competitive Strength    (10 pts)
 * 
 * Total: 100 points
 */

const { analyzeCompetitors } = require('./competitorAnalyzer');

// Human-friendly labels for business owners
const LABELS = {
    claimedProfile: 'Verified Google Business Profile',
    phoneAvailable: 'Phone Number Listed',
    businessHours: 'Business Hours Published',
    categorySet: 'Business Category Properly Set',
    rating: 'Customer Rating',
    reviewVolume: 'Customer Reviews',
    ownerResponses: 'Owner Reply Activity',
    photos: 'Photo Presence',
    reviewVelocity: 'Recent Customer Activity',
    photoActivity: 'Visual Content Freshness',
    googlePosts: 'Google Business Posts',
    qaActivity: 'Customer Q&A Engagement',
    websiteExists: 'Business Website',
    mobileResponsive: 'Mobile-Friendly Website',
    sslSecure: 'Secure Website (HTTPS)',
    loadSpeed: 'Website Loading Speed',
    localSchema: 'Local Business Schema',
    clickToCall: 'Click-to-Call Enabled',
    whatsapp: 'WhatsApp Contact',
    bookingSystem: 'Online Booking System',
    contactForm: 'Contact Form Available',
    reviewGap: 'Review Volume vs Competitors',
    ratingGap: 'Rating vs Competitors',
    mediaGap: 'Visual Content vs Competitors'
};

function calculateBusinessHealth(rawData, websiteData = {}) {
    const reviewCount = rawData.reviewCount || 0;
    const rating = rawData.rating || 0;
    const category = rawData.category || '';
    const phone = rawData.phone || '';
    const photos = rawData.photos || [];
    const isClaimed = rawData.isClaimed !== false;
    const hoursMissing = rawData.hoursMissing === true;
    const ownerResponseCount = rawData.ownerResponseCount || 0;
    const recentReviewsCount = rawData.recentReviewsCount || 0;
    const competitors = rawData.competitors || [];
    const qaPairs = rawData.qaCount || 0;
    const daysSincePost = rawData.daysSincePost || 999;

    const tiers = {};
    const allImprovements = [];
    let totalScore = 0;

    // ═══════════════════════════════════════════
    // TIER 1: Business Legitimacy (20 pts)
    // ═══════════════════════════════════════════
    const tier1 = { title: 'Business Legitimacy', maxScore: 20, score: 0, details: [] };

    // Claimed profile (5 pts)
    const claimedPts = isClaimed ? 5 : 0;
    tier1.score += claimedPts;
    tier1.details.push({
        text: LABELS.claimedProfile,
        earned: claimedPts, possible: 5,
        impact: claimedPts === 5 ? 'Pass' : 'High'
    });
    if (claimedPts === 0) allImprovements.push({ action: 'Claim your Google Business Profile', points: 5, priority: 1 });

    // Phone (5 pts)
    const phonePts = phone ? 5 : 0;
    tier1.score += phonePts;
    tier1.details.push({
        text: LABELS.phoneAvailable,
        earned: phonePts, possible: 5,
        impact: phonePts === 5 ? 'Pass' : 'High'
    });
    if (phonePts === 0) allImprovements.push({ action: 'Add your phone number to Google profile', points: 5, priority: 1 });

    // Hours (5 pts)
    const hoursPts = !hoursMissing ? 5 : 0;
    tier1.score += hoursPts;
    tier1.details.push({
        text: LABELS.businessHours,
        earned: hoursPts, possible: 5,
        impact: hoursPts === 5 ? 'Pass' : 'High'
    });
    if (hoursPts === 0) allImprovements.push({ action: 'Add business hours to Google profile', points: 5, priority: 1 });

    // Category (5 pts)
    const catPts = category ? 5 : 0;
    tier1.score += catPts;
    tier1.details.push({
        text: LABELS.categorySet,
        earned: catPts, possible: 5,
        impact: catPts === 5 ? 'Pass' : 'Medium'
    });
    if (catPts === 0) allImprovements.push({ action: 'Set your business category on Google', points: 5, priority: 2 });

    tiers.legitimacy = tier1;
    totalScore += tier1.score;

    // ═══════════════════════════════════════════
    // TIER 2: Customer Trust (25 pts)
    // ═══════════════════════════════════════════
    const tier2 = { title: 'Customer Trust', maxScore: 25, score: 0, details: [] };

    // Rating (8 pts)
    let ratingPts = 0;
    if (rating >= 4.5) ratingPts = 8;
    else if (rating >= 4.2) ratingPts = 6;
    else if (rating >= 4.0) ratingPts = 4;
    else if (rating >= 3.5) ratingPts = 2;
    tier2.score += ratingPts;
    tier2.details.push({
        text: `${LABELS.rating}: ${rating}★`,
        earned: ratingPts, possible: 8,
        impact: ratingPts >= 6 ? 'Pass' : ratingPts >= 4 ? 'Medium' : 'High'
    });
    if (ratingPts < 6) allImprovements.push({ action: 'Improve customer experience to boost rating above 4.2★', points: 8 - ratingPts, priority: 3 });

    // Review volume (8 pts)
    let reviewPts = 0;
    if (reviewCount >= 200) reviewPts = 8;
    else if (reviewCount >= 100) reviewPts = 6;
    else if (reviewCount >= 50) reviewPts = 5;
    else if (reviewCount >= 20) reviewPts = 3;
    else if (reviewCount >= 5) reviewPts = 1;
    tier2.score += reviewPts;
    tier2.details.push({
        text: `${LABELS.reviewVolume}: ${reviewCount} reviews`,
        earned: reviewPts, possible: 8,
        impact: reviewPts >= 6 ? 'Pass' : reviewPts >= 3 ? 'Medium' : 'High'
    });
    if (reviewPts < 6) {
        const neededReviews = reviewCount < 50 ? 50 - reviewCount : 100 - reviewCount;
        allImprovements.push({ action: `Encourage ${Math.max(10, neededReviews)} more customer reviews`, points: Math.min(5, 8 - reviewPts), priority: 2 });
    }

    // Owner responses (5 pts)
    let responsePts = 0;
    if (ownerResponseCount >= 4) responsePts = 5;
    else if (ownerResponseCount >= 2) responsePts = 3;
    else if (ownerResponseCount >= 1) responsePts = 1;
    tier2.score += responsePts;
    tier2.details.push({
        text: `${LABELS.ownerResponses}: ${ownerResponseCount}/5 recent reviews replied`,
        earned: responsePts, possible: 5,
        impact: responsePts >= 3 ? 'Pass' : 'Medium'
    });
    if (responsePts < 5) allImprovements.push({ action: 'Reply to recent customer reviews', points: 5 - responsePts, priority: 2 });

    // Photos (4 pts)
    let photoPts = 0;
    if (photos.length >= 20) photoPts = 4;
    else if (photos.length >= 10) photoPts = 3;
    else if (photos.length >= 5) photoPts = 2;
    else if (photos.length >= 1) photoPts = 1;
    tier2.score += photoPts;
    tier2.details.push({
        text: `${LABELS.photos}: ${photos.length} photos`,
        earned: photoPts, possible: 4,
        impact: photoPts >= 3 ? 'Pass' : 'Medium'
    });
    if (photoPts < 3) {
        const neededPhotos = Math.max(5, 10 - photos.length);
        allImprovements.push({ action: `Upload ${neededPhotos} more quality photos`, points: Math.min(3, 4 - photoPts), priority: 2 });
    }

    tiers.trust = tier2;
    totalScore += tier2.score;

    // ═══════════════════════════════════════════
    // TIER 3: Visibility Power (20 pts)
    // ═══════════════════════════════════════════
    const tier3 = { title: 'Visibility Power', maxScore: 20, score: 0, details: [] };

    // Review velocity (8 pts) — recent reviews in last 30 days
    let velocityPts = 0;
    if (recentReviewsCount >= 10) velocityPts = 8;
    else if (recentReviewsCount >= 5) velocityPts = 6;
    else if (recentReviewsCount >= 2) velocityPts = 3;
    else if (recentReviewsCount >= 1) velocityPts = 1;
    tier3.score += velocityPts;
    tier3.details.push({
        text: `${LABELS.reviewVelocity}: ${recentReviewsCount} recent reviews`,
        earned: velocityPts, possible: 8,
        impact: velocityPts >= 6 ? 'Pass' : velocityPts >= 3 ? 'Medium' : 'High'
    });
    if (velocityPts < 6) allImprovements.push({ action: 'Ask happy customers to leave reviews consistently', points: Math.min(5, 8 - velocityPts), priority: 3 });

    // Photo upload activity (5 pts)
    let photoActivityPts = 0;
    if (photos.length >= 30) photoActivityPts = 5;
    else if (photos.length >= 15) photoActivityPts = 3;
    else if (photos.length >= 5) photoActivityPts = 1;
    tier3.score += photoActivityPts;
    tier3.details.push({
        text: `${LABELS.photoActivity}: ${photos.length} total photos`,
        earned: photoActivityPts, possible: 5,
        impact: photoActivityPts >= 3 ? 'Pass' : 'Medium'
    });
    if (photoActivityPts < 3) allImprovements.push({ action: 'Upload photos regularly (interiors, products, team)', points: 5 - photoActivityPts, priority: 3 });

    // Google Posts (4 pts)
    let postPts = 0;
    if (daysSincePost <= 7) postPts = 4;
    else if (daysSincePost <= 14) postPts = 3;
    else if (daysSincePost <= 30) postPts = 2;
    else if (daysSincePost <= 90) postPts = 1;
    tier3.score += postPts;
    tier3.details.push({
        text: `${LABELS.googlePosts}: ${daysSincePost < 999 ? daysSincePost + ' days since last post' : 'No posts found'}`,
        earned: postPts, possible: 4,
        impact: postPts >= 3 ? 'Pass' : 'Medium'
    });
    if (postPts < 3) allImprovements.push({ action: 'Post weekly updates on Google Business (offers, news, photos)', points: 4 - postPts, priority: 4 });

    // Q&A Activity (3 pts)
    let qaPts = 0;
    if (qaPairs >= 5) qaPts = 3;
    else if (qaPairs >= 2) qaPts = 2;
    else if (qaPairs >= 1) qaPts = 1;
    tier3.score += qaPts;
    tier3.details.push({
        text: `${LABELS.qaActivity}: ${qaPairs} Q&A pairs`,
        earned: qaPts, possible: 3,
        impact: qaPts >= 2 ? 'Pass' : 'Low'
    });
    if (qaPts < 2) allImprovements.push({ action: 'Add frequently asked questions to your Google profile', points: 3 - qaPts, priority: 5 });

    tiers.visibility = tier3;
    totalScore += tier3.score;

    // ═══════════════════════════════════════════
    // TIER 4: Website Performance (15 pts)
    // ═══════════════════════════════════════════
    const tier4 = { title: 'Website Performance', maxScore: 15, score: 0, details: [] };
    const hasWebsite = !!rawData.website && websiteData.exists !== false && websiteData.websiteStatus !== 'none' && websiteData.websiteStatus !== 'broken';

    // Website exists (5 pts)
    const webExistsPts = hasWebsite ? 5 : (rawData.website ? 2 : 0);
    tier4.score += webExistsPts;
    tier4.details.push({
        text: `${LABELS.websiteExists}: ${hasWebsite ? 'Active' : rawData.website ? 'Broken/Unreachable' : 'Not Found'}`,
        earned: webExistsPts, possible: 5,
        impact: webExistsPts >= 5 ? 'Pass' : 'High'
    });
    if (webExistsPts < 5) allImprovements.push({ action: hasWebsite ? 'Fix your website issues' : 'Create a professional website', points: 5 - webExistsPts, priority: 1 });

    // Mobile responsive (4 pts)
    const mobilePts = websiteData.isMobileResponsive ? 4 : 0;
    tier4.score += mobilePts;
    tier4.details.push({
        text: LABELS.mobileResponsive,
        earned: mobilePts, possible: 4,
        impact: mobilePts === 4 ? 'Pass' : hasWebsite ? 'High' : 'Low'
    });
    if (mobilePts === 0 && hasWebsite) allImprovements.push({ action: 'Make your website mobile-friendly', points: 4, priority: 2 });

    // SSL (2 pts)
    const sslPts = websiteData.isSecure ? 2 : 0;
    tier4.score += sslPts;
    tier4.details.push({
        text: LABELS.sslSecure,
        earned: sslPts, possible: 2,
        impact: sslPts === 2 ? 'Pass' : hasWebsite ? 'Medium' : 'Low'
    });
    if (sslPts === 0 && hasWebsite) allImprovements.push({ action: 'Enable HTTPS on your website', points: 2, priority: 3 });

    // Load speed (2 pts)
    let speedPts = 0;
    if (websiteData.loadTimeMs && websiteData.loadTimeMs < 3000) speedPts = 2;
    else if (websiteData.loadTimeMs && websiteData.loadTimeMs < 5000) speedPts = 1;
    tier4.score += speedPts;
    tier4.details.push({
        text: `${LABELS.loadSpeed}: ${websiteData.loadTimeMs ? (websiteData.loadTimeMs / 1000).toFixed(1) + 's' : 'N/A'}`,
        earned: speedPts, possible: 2,
        impact: speedPts === 2 ? 'Pass' : hasWebsite ? 'Medium' : 'Low'
    });
    if (speedPts < 2 && hasWebsite) allImprovements.push({ action: 'Improve website loading speed (under 3 seconds)', points: 2 - speedPts, priority: 4 });

    // Schema (2 pts)
    const schemaPts = websiteData.hasSchema ? 2 : 0;
    tier4.score += schemaPts;
    tier4.details.push({
        text: LABELS.localSchema,
        earned: schemaPts, possible: 2,
        impact: schemaPts === 2 ? 'Pass' : 'Low'
    });
    if (schemaPts === 0 && hasWebsite) allImprovements.push({ action: 'Add local business schema markup to website', points: 2, priority: 5 });

    tiers.website = tier4;
    totalScore += tier4.score;

    // ═══════════════════════════════════════════
    // TIER 5: Customer Conversion (10 pts)
    // ═══════════════════════════════════════════
    const tier5 = { title: 'Customer Conversion', maxScore: 10, score: 0, details: [] };

    // Click-to-call (3 pts) — phone on profile
    const callPts = phone ? 3 : 0;
    tier5.score += callPts;
    tier5.details.push({
        text: LABELS.clickToCall,
        earned: callPts, possible: 3,
        impact: callPts === 3 ? 'Pass' : 'High'
    });

    // WhatsApp (3 pts)
    const waPts = websiteData.hasWhatsApp ? 3 : 0;
    tier5.score += waPts;
    tier5.details.push({
        text: LABELS.whatsapp,
        earned: waPts, possible: 3,
        impact: waPts === 3 ? 'Pass' : 'Medium'
    });
    if (waPts === 0) allImprovements.push({ action: 'Add WhatsApp contact button', points: 3, priority: 2 });

    // Booking (2 pts)
    const bookPts = websiteData.hasBookingSystem ? 2 : 0;
    tier5.score += bookPts;
    tier5.details.push({
        text: LABELS.bookingSystem,
        earned: bookPts, possible: 2,
        impact: bookPts === 2 ? 'Pass' : 'Medium'
    });
    if (bookPts === 0) allImprovements.push({ action: 'Add online booking or appointment system', points: 2, priority: 3 });

    // Contact form (2 pts)
    const formPts = websiteData.hasContactForm ? 2 : 0;
    tier5.score += formPts;
    tier5.details.push({
        text: LABELS.contactForm,
        earned: formPts, possible: 2,
        impact: formPts === 2 ? 'Pass' : 'Low'
    });
    if (formPts === 0 && hasWebsite) allImprovements.push({ action: 'Add a contact form to your website', points: 2, priority: 4 });

    tiers.conversion = tier5;
    totalScore += tier5.score;

    // ═══════════════════════════════════════════
    // TIER 6: Competitive Strength (10 pts)
    // ═══════════════════════════════════════════
    const tier6 = { title: 'Competitive Strength', maxScore: 10, score: 0, details: [] };
    const compAnalysis = analyzeCompetitors(rawData);

    if (compAnalysis.hasData) {
        // Review gap (4 pts)
        let revGapPts = 0;
        if (compAnalysis.reviewGap >= 0) revGapPts = 4;
        else if (compAnalysis.reviewGapPercent >= -30) revGapPts = 2;
        else if (compAnalysis.reviewGapPercent >= -60) revGapPts = 1;
        tier6.score += revGapPts;
        tier6.details.push({
            text: `${LABELS.reviewGap}: ${compAnalysis.reviewGap >= 0 ? 'Leading' : Math.abs(compAnalysis.reviewGap) + ' behind'}`,
            earned: revGapPts, possible: 4,
            impact: revGapPts >= 3 ? 'Pass' : revGapPts >= 1 ? 'Medium' : 'High'
        });

        // Rating gap (3 pts)
        let ratGapPts = 0;
        if (compAnalysis.ratingGap >= 0) ratGapPts = 3;
        else if (compAnalysis.ratingGap >= -0.3) ratGapPts = 2;
        else if (compAnalysis.ratingGap >= -0.5) ratGapPts = 1;
        tier6.score += ratGapPts;
        tier6.details.push({
            text: `${LABELS.ratingGap}: ${compAnalysis.ratingGap >= 0 ? 'At or above average' : compAnalysis.ratingGap + '★ below average'}`,
            earned: ratGapPts, possible: 3,
            impact: ratGapPts >= 2 ? 'Pass' : 'Medium'
        });

        // Media gap (3 pts)
        let medGapPts = 0;
        if (compAnalysis.mediaGap >= 0) medGapPts = 3;
        else if (compAnalysis.mediaGap >= -5) medGapPts = 2;
        else if (compAnalysis.mediaGap >= -10) medGapPts = 1;
        tier6.score += medGapPts;
        tier6.details.push({
            text: `${LABELS.mediaGap}: ${compAnalysis.mediaGap >= 0 ? 'Leading' : 'Behind competitors'}`,
            earned: medGapPts, possible: 3,
            impact: medGapPts >= 2 ? 'Pass' : 'Medium'
        });
    } else {
        tier6.details.push({ text: 'No competitor data available', earned: 5, possible: 10, impact: 'Low' });
        tier6.score = 5; // Neutral score when no data
    }

    tiers.competitive = tier6;
    totalScore += tier6.score;

    // ═══════════════════════════════════════════
    // TIER 7: AI Search Readiness (20 pts)  ← NEW
    // ═══════════════════════════════════════════
    // SAFE MODE: try/catch + optional chaining so old cached websiteData
    // objects without these fields simply score 0 without crashing.
    const tier7 = { title: 'AI Search Readiness', maxScore: 20, score: 0, details: [] };
    try {
        // Organization / LocalBusiness Schema (+10)
        if (websiteData?.hasOrganizationSchema === true) {
            tier7.score += 10;
            tier7.details.push({
                text: 'Organization / LocalBusiness Schema Present',
                earned: 10, possible: 10, impact: 'Pass'
            });
        } else {
            tier7.details.push({
                text: 'CRITICAL: Organization/LocalBusiness Schema missing. AI engines (ChatGPT/Gemini) cannot reliably extract your entity data.',
                earned: 0, possible: 10, impact: 'High'
            });
            allImprovements.push({
                action: 'Add Organization/LocalBusiness JSON-LD schema to your website',
                points: 10, priority: 2
            });
        }

        // FAQ Schema (+10)
        if (websiteData?.hasFAQSchema === true) {
            tier7.score += 10;
            tier7.details.push({
                text: 'FAQ Schema Page Detected',
                earned: 10, possible: 10, impact: 'Pass'
            });
        } else {
            tier7.details.push({
                text: 'WARNING: FAQ Schema missing. You are losing visibility in AI conversational search queries.',
                earned: 0, possible: 10, impact: 'Medium'
            });
            allImprovements.push({
                action: 'Create an FAQ page with FAQPage JSON-LD schema markup',
                points: 10, priority: 3
            });
        }
    } catch (aiErr) {
        console.error('[HEALTH SCORER] AI Readiness section error:', aiErr.message);
        tier7.details.push({ text: 'AI Readiness data unavailable', earned: 0, possible: 20, impact: 'Low' });
    }
    tiers.aiReadiness = tier7;
    totalScore += tier7.score;

    // ═══════════════════════════════════════════
    // STATUS + IMPROVEMENTS + SIMULATOR
    // ═══════════════════════════════════════════

    // Status classification (total now up to 120, re-scale thresholds accordingly)
    let status, statusColor, opportunityReason;
    if (totalScore >= 100) {
        status = 'Fully Optimized';
        statusColor = '#22c55e'; // Green
        opportunityReason = 'Your digital footprint is highly optimized. You have strong visibility, trust signals, and AI readiness. Excellent work establishing market dominance.';
    }
    else if (totalScore >= 75) {
        status = 'Solid Baseline';
        statusColor = '#f59e0b'; // Yellow/Amber
        opportunityReason = 'You have a healthy online presence, but a few critical gaps are allowing competitors to capture some of your potential local leads. Review the matrix below to optimize.';
    }
    else if (totalScore >= 50) {
        status = 'Needs Urgent Attention';
        statusColor = '#f97316'; // Orange
        opportunityReason = 'Significant visibility gaps detected. Your business is missing key trust signals and local SEO metrics, making it difficult for new customers to find or choose you over competitors.';
    }
    else {
        status = 'Critical Risk';
        statusColor = '#ef4444'; // Red
        opportunityReason = 'CRITICAL: Your digital presence is severely lacking. Customers searching for your services locally are almost certainly going to competitors. Immediate action is required.';
    }

    // Sort improvements by priority then points
    allImprovements.sort((a, b) => a.priority - b.priority || b.points - a.points);
    const topImprovements = allImprovements.slice(0, 5);

    // Improvement simulator — cumulative projection
    let projectedScore = totalScore;
    const simulator = topImprovements.map(imp => {
        projectedScore += imp.points;
        return {
            action: imp.action,
            pointGain: imp.points,
            projectedScore: Math.min(120, projectedScore)
        };
    });

    // Build breakdown for frontend
    const breakdown = {
        legitimacy: tiers.legitimacy,
        trust: tiers.trust,
        visibility: tiers.visibility,
        website: tiers.website,
        conversion: tiers.conversion,
        competitive: tiers.competitive,
        aiReadiness: tiers.aiReadiness    // ← NEW
    };

    return {
        totalScore,
        status,
        statusColor,
        mode: 'business',
        brandClass: status, // backward compat
        breakdown,
        opportunityReason, // ← NEW: Pass this back so the UI can show this dynamic, professional text
        topImprovements,
        simulator,
        competitorAnalysis: compAnalysis,
        websiteStatus: websiteData.websiteStatus || 'none',
        websiteQualityScore: websiteData.websiteQualityScore || 0
    };
}

module.exports = { calculateBusinessHealth };
