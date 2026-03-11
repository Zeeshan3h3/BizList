// Using real Puppeteer scraper for live Google Maps data
const { scrapeGoogleMaps, scrapeBusinessByUrl } = require('../utils/googleScraper');
const { scrapeJustDial } = require('../scrapers/justdial');
const { addToQueue } = require('../utils/queueManager');
const { calculateLeadScore } = require('../utils/leadScorer');
const { calculateBusinessHealth } = require('../utils/businessHealthScorer');
const { scrapeWebsite } = require('../utils/websiteScraper');
const Audit = require('../models/Audit');

// --- NEW INTELLIGENCE MODULES ---
const { analyzeMarketDemand } = require('../intelligence/localDemandScanner');
const { calculateCompetitorGap } = require('../intelligence/competitorGapEngine');
const { calculateVisibilityRanking } = require('../intelligence/visibilityRadar');
const { predictGrowthPotential } = require('../prediction/growthPotentialPredictor');
const { generateGrowthPlan } = require('../ai/growthPlaybookGenerator');


async function runBusinessAudit(req, res) {
    const startTime = Date.now();

    try {
        const { businessName, area, placeUrl, forceReaudit, mode = 'business' } = req.body;

        // Validate input
        if (!placeUrl && (!businessName || !area)) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_FIELDS',
                message: 'Please provide either a placeUrl or both business name and area'
            });
        }

        if (placeUrl) {
            console.log(`[AUDIT] Request via URL: ${placeUrl}${forceReaudit ? ' (FORCE RE-AUDIT)' : ''}`);
        } else {
            console.log(`[AUDIT] Request: ${businessName} in ${area}${forceReaudit ? ' (FORCE RE-AUDIT)' : ''}`);
        }

        // Check cache (skip if forceReaudit is true)
        let recentAudit = null;
        if (!forceReaudit) {
            try {
                recentAudit = await Audit.findOne({
                    businessName: { $regex: new RegExp(`^${businessName}$`, 'i') },
                    area: { $regex: new RegExp(`^${area}$`, 'i') },
                    status: 'completed',
                    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                }).sort({ createdAt: -1 });
            } catch (dbError) {
                console.log('[AUDIT] Database is not available, skipping cache check');
            }
        } else {
            console.log('[AUDIT] Skipping cache — forced re-audit requested');
        }

        if (recentAudit) {
            console.log('[AUDIT] Returning cached result');

            // Backward compatibility for legacy cache structure (pre-Phase 4 schema)
            let parsedScore = recentAudit.healthScore ? (recentAudit.healthScore.toObject ? recentAudit.healthScore.toObject() : recentAudit.healthScore) : {};

            if (parsedScore && !parsedScore.breakdown && parsedScore.google) {
                // Reconstruct the nested breakdown structure
                parsedScore.breakdown = {
                    google: parsedScore.google,
                    website: parsedScore.website,
                    social: parsedScore.social
                };
            }

            return res.status(200).json({
                success: true,
                cached: true,
                auditId: recentAudit._id,
                businessName: recentAudit.businessName,
                area: recentAudit.area,
                scrapedAt: recentAudit.scrapedAt,
                ...parsedScore,
                processingTime: recentAudit.processingTime,
                message: 'This Business is already audited'
            });
        }

        // Create or find audit record to mark as pending
        let audit = null;
        try {
            // Find existing record or create new one
            audit = await Audit.findOneAndUpdate(
                {
                    businessName: { $regex: new RegExp(`^${businessName}$`, 'i') },
                    area: { $regex: new RegExp(`^${area}$`, 'i') }
                },
                {
                    businessName,
                    area,
                    searchQuery: `${businessName} ${area}`,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.headers['user-agent'],
                    status: 'pending'
                },
                { new: true, upsert: true }
            );
        } catch (dbError) {
            console.log('[AUDIT] Database not available, continuing without saving pending state');
        }

        // Scrape Google Maps
        let googleResult;
        try {
            if (placeUrl) {
                googleResult = await scrapeBusinessByUrl(placeUrl);
            } else {
                googleResult = await addToQueue(scrapeGoogleMaps, businessName, area);
            }
        } catch (queueError) {
            if (audit) {
                try {
                    audit.status = 'failed';
                    audit.error = queueError.message;
                    await audit.save();
                } catch (dbError) {
                    console.log('[AUDIT] Could not save error to database');
                }
            }

            if (queueError.message.includes('QUEUE_FULL')) {
                return res.status(503).json({
                    success: false,
                    error: 'HIGH_TRAFFIC',
                    message: 'Traffic high, please try again in 2 minutes.',
                    retryAfter: 120
                });
            }

            throw queueError;
        }

        if (!googleResult || !googleResult.success) {
            if (audit) {
                try {
                    audit.status = 'failed';
                    audit.error = googleResult ? googleResult.message : 'Scraping timed out or returned no data';
                    await audit.save();
                } catch (dbError) {
                    console.log('[AUDIT] Could not save error to database');
                }
            }

            if (googleResult.error === 'NO_RESULTS') {
                return res.status(404).json({
                    success: false,
                    error: 'BUSINESS_NOT_FOUND',
                    message: `Could not find "${businessName}" in ${area} on Google Maps`,
                    suggestion: 'Try entering a more specific business name or area'
                });
            }

            return res.status(503).json({
                success: false,
                error: 'SCRAPING_FAILED',
                message: 'Traffic high, please try again in 2 minutes.',
                retryAfter: 120
            });
        }

        // Data processing
        const rawData = googleResult.data;

        let websiteData = null;
        let contactData = {
            hasWhatsApp: false,
            hasInstagram: false,
        };

        if (rawData.website) {
            console.log(`[AUDIT] Extracting Website/Social data from: ${rawData.website}`);
            websiteData = await scrapeWebsite(rawData.website);

            // Map the website scraper results
            contactData.hasWhatsApp = websiteData.hasWhatsApp;
            contactData.hasInstagram = websiteData.hasInstagram;

            // FALLBACK: Google Maps often hides social links behind lazy-loading or dynamic DOM changes.
            // If the business's official website has social links, we credit the Maps profile to prevent false penalties.
            if (contactData.hasInstagram || websiteData.hasFacebook) {
                rawData.hasSocialLinks = true;
                console.log(`[AUDIT] Applied Social Links fallback from Website to Google Maps profile.`);
            }
        }

        // ═══════════════════════════════════════════
        // DUAL-MODE SCORING
        // ═══════════════════════════════════════════
        let transformedScore;

        if (mode === 'pro') {
            // PRO MODE — Lead Opportunity Score (agency-facing)
            const leadScore = calculateLeadScore(rawData, websiteData || {});
            transformedScore = {
                mode: 'pro',
                totalScore: leadScore.totalScore,
                brandClass: leadScore.leadType,
                leadType: leadScore.leadType,
                leadColor: leadScore.leadColor,
                opportunityReason: leadScore.opportunityReason,
                brandIntelligence: leadScore.brandIntelligence,
                breakdown: leadScore.breakdown,
                layers: leadScore.layers,
                websiteStatus: leadScore.websiteStatus,
                websiteQualityScore: leadScore.websiteQualityScore,
                businessImage: rawData.photos && rawData.photos.length > 0 ? rawData.photos[0] : null,
                googleMapsUrl: placeUrl || `https://www.google.com/maps/search/${encodeURIComponent(businessName + ' ' + area)}`
            };
        } else {
            // BUSINESS MODE — Business Health Score (customer-facing, default)
            const healthScore = calculateBusinessHealth(rawData, websiteData || {});
            transformedScore = {
                mode: 'business',
                totalScore: healthScore.totalScore,
                status: healthScore.status,
                statusColor: healthScore.statusColor,
                brandClass: healthScore.status,
                breakdown: healthScore.breakdown,
                topImprovements: healthScore.topImprovements,
                simulator: healthScore.simulator,
                competitorAnalysis: healthScore.competitorAnalysis,
                websiteStatus: healthScore.websiteStatus,
                websiteQualityScore: healthScore.websiteQualityScore,
                businessImage: rawData.photos && rawData.photos.length > 0 ? rawData.photos[0] : null,
                googleMapsUrl: placeUrl || `https://www.google.com/maps/search/${encodeURIComponent(businessName + ' ' + area)}`
            };
        }

        // ═══════════════════════════════════════════
        // ADVANCED INTELLIGENCE INJECTION
        // ═══════════════════════════════════════════
        const safeReviewCount = rawData.reviewCount || 0;
        const safeRating = rawData.rating || 0;
        const safePhotoCount = rawData.photos && Array.isArray(rawData.photos) ? rawData.photos.length : 0;
        const localDemand = analyzeMarketDemand(
            rawData.category || 'Business',
            area,
            rawData.competitors || []
        );

        const businessMetricsObj = {
            name: rawData.name || businessName,
            reviewCount: safeReviewCount,
            rating: safeRating,
            photoCount: safePhotoCount,
            responseRate: 0 // Default until we have a scraper for this
        };

        const compGap = calculateCompetitorGap(businessMetricsObj, rawData.competitors || []);
        const visRank = calculateVisibilityRanking(businessMetricsObj, rawData.competitors || []);
        const growthPot = predictGrowthPotential(businessMetricsObj, compGap);
        const aiPlaybook = generateGrowthPlan({
            businessScore: transformedScore.totalScore,
            competitorGap: compGap,
            websiteQuality: websiteData || {},
            category: rawData.category
        });

        const advancedIntelligence = {
            competitorGap: compGap,
            visibilityRanking: visRank,
            growthPotential: growthPot,
            aiPlaybook,
            localDemand
        };

        // Attach to transformedScore so it is saved to DB and sent to frontend
        transformedScore.advancedIntelligence = advancedIntelligence;

        const processingTime = Date.now() - startTime;
        if (audit) {
            try {
                audit.scrapedData = rawData;
                audit.healthScore = transformedScore;
                audit.status = 'completed';
                audit.scrapedAt = new Date(googleResult.scrapedAt || Date.now());
                audit.processingTime = processingTime;
                await audit.save();
            } catch (dbError) {
                console.log('[AUDIT] Could not save results to database');
            }
        }

        console.log(`[AUDIT] Completed in ${processingTime}ms - Mode: ${mode} | Score: ${transformedScore.totalScore}/100 | ${mode === 'pro' ? 'Lead: ' + transformedScore.leadType : 'Status: ' + transformedScore.status}`);

        return res.status(200).json({
            success: true,
            auditId: audit?._id || 'no-db',
            businessName: rawData.name || businessName,
            area: area,
            scrapedAt: googleResult.scrapedAt,
            ...transformedScore,
            processingTime: processingTime,
            cached: false
        });

    } catch (error) {
        console.error('[AUDIT ERROR]', error);

        return res.status(500).json({
            success: false,
            error: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * Get recent audits
 * GET /api/audits/recent
 */
async function getRecentAudits(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const mode = req.query.mode || null;
        const audits = await Audit.findRecent(limit, mode);

        return res.status(200).json({
            success: true,
            count: audits.length,
            audits: audits
        });
    } catch (error) {
        console.error('[GET RECENT ERROR]', error);
        return res.status(500).json({
            success: false,
            error: 'FETCH_FAILED',
            message: 'Could not fetch recent audits'
        });
    }
}

/**
 * Get analytics
 * GET /api/analytics
 */
async function getAnalytics(req, res) {
    try {
        const stats = await Audit.getAnalytics();

        return res.status(200).json({
            success: true,
            analytics: stats
        });
    } catch (error) {
        console.error('[ANALYTICS ERROR]', error);
        return res.status(500).json({
            success: false,
            error: 'FETCH_FAILED',
            message: 'Could not fetch analytics'
        });
    }
}

/**
 * Get queue status
 * GET /api/audit/queue-status
 */
function getQueueStatus(req, res) {
    const { getQueueStats } = require('../utils/queueManager');
    const stats = getQueueStats();

    return res.status(200).json({
        success: true,
        queue: stats
    });
}

module.exports = {
    runBusinessAudit,
    getRecentAudits,
    getAnalytics,
    getQueueStatus
};
