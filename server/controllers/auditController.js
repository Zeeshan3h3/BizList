// Using real Puppeteer scraper for live Google Maps data
const { scrapeGoogleMaps, scrapeBusinessByUrl } = require('../utils/googleScraper');
const { scrapeJustDial } = require('../scrapers/justdial');
const { addToQueue } = require('../utils/queueManager');
const { calculateHealthScore } = require('../utils/scoreCalculator');
const Audit = require('../models/Audit');

/**
 * ============================================
 * ENHANCED AUDIT CONTROLLER WITH MONGODB
 * ============================================
 */

/**
 * Run business audit (with database persistence)
 * POST /api/audit
 */
async function runBusinessAudit(req, res) {
    const startTime = Date.now();

    try {
        const { businessName, area, placeUrl } = req.body;

        // Validate input - accept either placeUrl OR businessName+area
        if (!placeUrl && (!businessName || !area)) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_FIELDS',
                message: 'Please provide either a placeUrl or both business name and area'
            });
        }

        if (placeUrl) {
            console.log(`[AUDIT] Request via URL: ${placeUrl}`);
        } else {
            console.log(`[AUDIT] Request: ${businessName} in ${area}`);
        }

        // Check cache only if DB is available
        let recentAudit = null;
        try {
            recentAudit = await Audit.findOne({
                businessName: { $regex: new RegExp(`^${businessName}$`, 'i') },
                area: { $regex: new RegExp(`^${area}$`, 'i') },
                status: 'completed',
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }).sort({ createdAt: -1 });
        } catch (dbError) {
            console.log('[AUDIT] Database not available, skipping cache check');
        }

        if (recentAudit) {
            console.log('[AUDIT] Returning cached result');
            return res.status(200).json({
                success: true,
                cached: true,
                auditId: recentAudit._id,
                businessName: recentAudit.businessName,
                area: recentAudit.area,
                scrapedAt: recentAudit.scrapedAt,
                ...recentAudit.healthScore,
                processingTime: recentAudit.processingTime,
                message: 'Recent audit found (cached for 24 hours)'
            });
        }

        // Create audit record only if DB is available
        let audit = null;
        try {
            audit = new Audit({
                businessName,
                area,
                searchQuery: `${businessName} ${area}`,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                status: 'pending'
            });
            await audit.save();
        } catch (dbError) {
            console.log('[AUDIT] Database not available, continuing without saving');
        }

        // Scrape Google Maps and JustDial in parallel
        let googleResult;
        let justdialResult;

        try {
            if (placeUrl) {
                // Scrape Google Maps directly by URL (user selected specific business)
                googleResult = await scrapeBusinessByUrl(placeUrl);
            } else {
                // Use queue for Google Maps search-based scraping
                googleResult = await addToQueue(scrapeGoogleMaps, businessName, area);
            }

            // Scrape JustDial (run after Google Maps to avoid parallel browser load)
            console.log('[AUDIT] Starting JustDial scrape...');
            const justdialPromise = scrapeJustDial(businessName, area);

            // Scrape Website (skipped to avoid OOM)
            // if (googleResult.success && googleResult.data.website) { ... }

            justdialResult = await justdialPromise;
            console.log(`[AUDIT] JustDial result: ${justdialResult.found ? 'Found' : 'Not found'}`);

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

        // Check Google Maps scraping success
        if (!googleResult.success) {
            if (audit) {
                try {
                    audit.status = 'failed';
                    audit.error = googleResult.message;
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

        // Merge Google Maps and JustDial data
        const googleData = googleResult.data;
        const justdialData = justdialResult?.data || {};

        // Calculate health score from Google Maps data
        const rawData = googleData;
        const healthScore = calculateHealthScore(rawData, justdialData, googleResult.websiteData);

        // Use the new breakdown structure directly from scoreCalculator
        const transformedScore = {
            totalScore: healthScore.totalScore,
            google: {
                score: healthScore.breakdown.googleMaps.score,
                maxScore: healthScore.breakdown.googleMaps.maxScore,
                details: healthScore.breakdown.googleMaps.details,
                businessImage: rawData.photos && rawData.photos.length > 0 ? rawData.photos[0] : null,
                googleMapsUrl: placeUrl || `https://www.google.com/maps/search/${encodeURIComponent(businessName + ' ' + area)}`
            },
            justdial: {
                score: healthScore.breakdown.justdial.score,
                maxScore: healthScore.breakdown.justdial.maxScore,
                details: healthScore.breakdown.justdial.details
            },
            website: {
                score: healthScore.breakdown.website.score,
                maxScore: healthScore.breakdown.website.maxScore,
                details: healthScore.breakdown.website.details
            }
        };

        // Update audit with results (if DB available)
        const processingTime = Date.now() - startTime;
        if (audit) {
            try {
                audit.scrapedData = rawData;
                audit.healthScore = transformedScore;
                audit.status = 'completed';
                audit.scrapedAt = new Date(scrapeResult.scrapedAt);
                audit.processingTime = processingTime;
                await audit.save();
            } catch (dbError) {
                console.log('[AUDIT] Could not save results to database');
            }
        }

        console.log(`[AUDIT] Completed in ${processingTime}ms - Score: ${transformedScore.totalScore}`);

        // Send response
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
        const audits = await Audit.findRecent(limit);

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
