const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

/**
 * ============================================
 * WEBSITE & SOCIAL SCRAPER (ENHANCED)
 * ============================================
 * 
 * Fetches website HTML and extracts:
 * 1. Existence & Status (broken, SSL, load time)
 * 2. Mobile Responsiveness
 * 3. Schema / SEO Markup
 * 4. Social Links (WhatsApp, Instagram, Facebook)
 * 5. Booking / Appointment Systems
 * 6. CTA Buttons & Contact Forms
 * 7. Google Maps Embed
 */

const axiosInstance = axios.create({
    timeout: 15000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
    },
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    }),
    maxRedirects: 5
});

async function scrapeWebsite(url) {
    const result = {
        // Core
        exists: false,
        isSecure: false,
        isBroken: false,
        loadTimeMs: 0,

        // SEO / Technical
        hasSchema: false,
        isMobileResponsive: false,

        // AI Search Readiness (NEW — Safe Mode append)
        hasOrganizationSchema: false,
        hasFAQSchema: false,
        hasMetaDescription: false,
        hasTitle: false,

        // Social
        hasWhatsApp: false,
        hasInstagram: false,
        hasFacebook: false,

        // UX / Business Features
        hasBookingSystem: false,
        hasCTA: false,
        hasContactForm: false,
        hasGoogleMap: false,

        // Quality Score (computed)
        websiteQualityScore: 0,
        websiteStatus: 'none', // 'none' | 'broken' | 'outdated' | 'basic' | 'good'

        error: null
    };

    if (!url || typeof url !== 'string' || url.trim() === '') {
        result.websiteStatus = 'none';
        return result;
    }

    // Ensure URL has protocol
    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
    }

    try {
        console.log(`[WEBSCRAPER] Fetching: ${targetUrl}`);

        result.isSecure = targetUrl.startsWith('https://');

        const startTime = Date.now();
        const response = await axiosInstance.get(targetUrl);
        result.loadTimeMs = Date.now() - startTime;

        result.exists = response.status === 200;
        result.isBroken = response.status >= 400;

        if (!result.exists) {
            result.websiteStatus = 'broken';
            return result;
        }

        const html = response.data;
        const $ = cheerio.load(html);
        const htmlLower = html.toLowerCase();

        // ═══════════════════════════════════════════
        // 1. TECHNICAL / SEO CHECKS
        // ═══════════════════════════════════════════

        // Schema Markup (JSON-LD)
        result.hasSchema = $('script[type="application/ld+json"]').length > 0;

        // ═══════════════════════════════════════════
        // AI SEARCH READINESS — Schema Type Detection
        // ═══════════════════════════════════════════
        // SAFE MODE: Each tag is parsed individually. Malformed JSON on any
        // website will NOT crash the server — it is silently skipped.
        const ORG_TYPES = new Set(['Organization', 'LocalBusiness', 'Store']);
        $('script[type="application/ld+json"]').each((i, el) => {
            try {
                const raw = $(el).html() || $(el).text() || '';
                if (!raw.trim()) return; // skip empty tags
                const parsed = JSON.parse(raw);

                // Handle both single objects and @graph arrays
                const items = Array.isArray(parsed)
                    ? parsed
                    : parsed['@graph']
                        ? parsed['@graph']
                        : [parsed];

                items.forEach(item => {
                    const type = item?.['@type'];
                    if (!type) return;

                    // Support both string and array @type values
                    const typeArr = Array.isArray(type) ? type : [type];

                    if (typeArr.some(t => ORG_TYPES.has(t))) {
                        result.hasOrganizationSchema = true;
                    }
                    if (typeArr.includes('FAQPage')) {
                        result.hasFAQSchema = true;
                    }
                });
            } catch (jsonErr) {
                // Malformed JSON-LD — silently skip this tag
                console.warn(`[WEBSCRAPER] Skipped malformed ld+json tag on ${targetUrl}`);
            }
        });

        // Mobile Responsive (viewport meta)
        const viewportMeta = $('meta[name="viewport"]').attr('content') || '';
        result.isMobileResponsive = viewportMeta.includes('width=');

        // Meta Description
        result.hasMetaDescription = !!($('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content'));

        // Title tag
        result.hasTitle = !!$('title').text().trim();

        // ═══════════════════════════════════════════
        // 2. SOCIAL LINKS
        // ═══════════════════════════════════════════

        $('a').each((i, link) => {
            const href = ($(link).attr('href') || '').toLowerCase();
            const text = ($(link).text() || '').toLowerCase();
            const aria = ($(link).attr('aria-label') || '').toLowerCase();

            // WhatsApp
            if (href.includes('wa.me') || href.includes('api.whatsapp.com') ||
                href.includes('whatsapp://') || href.includes('chat.whatsapp.com') ||
                href.includes('send?phone=') || text.includes('whatsapp') ||
                aria.includes('whatsapp')) {
                result.hasWhatsApp = true;
            }

            // Instagram
            if (href.includes('instagram.com/')) {
                result.hasInstagram = true;
            }

            // Facebook
            if (href.includes('facebook.com/')) {
                result.hasFacebook = true;
            }
        });

        // Fallback: check raw HTML for social patterns
        if (!result.hasWhatsApp && htmlLower.includes('wa.me/')) result.hasWhatsApp = true;
        if (!result.hasInstagram && htmlLower.includes('instagram.com/')) result.hasInstagram = true;
        if (!result.hasFacebook && htmlLower.includes('facebook.com/')) result.hasFacebook = true;

        // ═══════════════════════════════════════════
        // 3. BOOKING / APPOINTMENT SYSTEM
        // ═══════════════════════════════════════════
        const bookingKeywords = [
            'book now', 'book appointment', 'schedule', 'book a visit',
            'make an appointment', 'reserve', 'book online', 'book consultation',
            'book session', 'book slot', 'appointment booking'
        ];

        const bookingPlatforms = [
            'calendly.com', 'acuityscheduling', 'booksy.com', 'fresha.com',
            'appointy.com', 'practo.com', 'zocdoc.com', 'setmore.com',
            'simplybook.me', 'square.site', 'vagaro.com', 'mindbodyonline',
            'classpass.com', 'treatwell.com'
        ];

        // Check links and buttons
        $('a, button').each((i, el) => {
            const text = ($(el).text() || '').toLowerCase().trim();
            const href = ($(el).attr('href') || '').toLowerCase();
            if (bookingKeywords.some(kw => text.includes(kw)) ||
                bookingPlatforms.some(p => href.includes(p))) {
                result.hasBookingSystem = true;
            }
        });

        // Check iframes for booking embeds
        $('iframe').each((i, el) => {
            const src = ($(el).attr('src') || '').toLowerCase();
            if (bookingPlatforms.some(p => src.includes(p))) {
                result.hasBookingSystem = true;
            }
        });

        // ═══════════════════════════════════════════
        // 4. CTA BUTTONS
        // ═══════════════════════════════════════════
        const ctaKeywords = [
            'contact us', 'get in touch', 'call now', 'get started',
            'enquire', 'inquire', 'request a quote', 'get quote',
            'free consultation', 'learn more', 'sign up', 'register',
            'join now', 'apply now', 'download', 'try free'
        ];

        $('a, button').each((i, el) => {
            const text = ($(el).text() || '').toLowerCase().trim();
            if (ctaKeywords.some(kw => text.includes(kw))) {
                result.hasCTA = true;
            }
        });

        // ═══════════════════════════════════════════
        // 5. CONTACT FORM
        // ═══════════════════════════════════════════
        const forms = $('form');
        forms.each((i, form) => {
            const inputs = $(form).find('input, textarea, select');
            if (inputs.length >= 2) {
                result.hasContactForm = true;
            }
        });

        // ═══════════════════════════════════════════
        // 6. GOOGLE MAP EMBED
        // ═══════════════════════════════════════════
        $('iframe').each((i, el) => {
            const src = ($(el).attr('src') || '').toLowerCase();
            if (src.includes('google.com/maps') || src.includes('maps.google.com')) {
                result.hasGoogleMap = true;
            }
        });

        // ═══════════════════════════════════════════
        // 7. COMPUTE WEBSITE QUALITY SCORE (0–100)
        // ═══════════════════════════════════════════
        let qualityScore = 0;

        // Technical (35 pts max)
        if (result.isSecure) qualityScore += 10;
        if (result.isMobileResponsive) qualityScore += 10;
        if (result.loadTimeMs < 3000) qualityScore += 10;
        else if (result.loadTimeMs < 5000) qualityScore += 5;
        if (result.hasSchema) qualityScore += 5;

        // SEO (10 pts max)
        if (result.hasMetaDescription) qualityScore += 5;
        if (result.hasTitle) qualityScore += 5;

        // UX Features (35 pts max)
        if (result.hasBookingSystem) qualityScore += 15;
        if (result.hasCTA) qualityScore += 5;
        if (result.hasContactForm) qualityScore += 10;
        if (result.hasGoogleMap) qualityScore += 5;

        // Social Integration (20 pts max)
        if (result.hasWhatsApp) qualityScore += 10;
        if (result.hasInstagram || result.hasFacebook) qualityScore += 10;

        result.websiteQualityScore = Math.min(100, qualityScore);

        // Determine status
        if (qualityScore >= 60) {
            result.websiteStatus = 'good';
        } else if (qualityScore >= 30) {
            result.websiteStatus = 'basic';
        } else {
            result.websiteStatus = 'outdated';
        }

        console.log(`[WEBSCRAPER] Success → Quality:${result.websiteQualityScore}/100 | Status:${result.websiteStatus} | Mobile:${result.isMobileResponsive} | Booking:${result.hasBookingSystem} | WA:${result.hasWhatsApp} | IG:${result.hasInstagram} | OrgSchema:${result.hasOrganizationSchema} | FAQSchema:${result.hasFAQSchema}`);

    } catch (error) {
        console.error(`[WEBSCRAPER ERROR] Fetch failed for ${targetUrl}: ${error.message}`);
        result.error = error.message;

        // Determine if broken vs doesn't exist
        if (error.code === 'ENOTFOUND' || error.code === 'ERR_BAD_REQUEST') {
            result.websiteStatus = 'broken';
            result.isBroken = true;
        } else if (error.code === 'CERT_HAS_EXPIRED' || error.message.includes('SSL')) {
            result.isSecure = false;
            result.websiteStatus = 'broken';
            result.isBroken = true;
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            result.websiteStatus = 'broken';
            result.isBroken = true;
        } else {
            result.websiteStatus = 'broken';
            result.isBroken = true;
        }
    }

    return result;
}

// Allow running this file directly for testing
if (require.main === module) {
    const testUrl = process.argv[2] || 'https://www.apple.com';
    scrapeWebsite(testUrl).then(data => console.log('Result:', JSON.stringify(data, null, 2)));
}

module.exports = { scrapeWebsite };
