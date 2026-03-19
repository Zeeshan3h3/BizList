const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const path = require('path');
const fs = require('fs');

/**
 * Google Maps Puppeteer Scraper
 * Extracts key business information and handles basic anti-ban logic.
 */

// Configuration
const SCRAPER_CONFIG = {
    headless: true, // Set to false to watch the browser (useful for debugging)
    timeout: 30000, // 30 seconds max wait time
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    maxRetries: 3,  // Maximum retry attempts for failed scrapes
    screenshotOnError: process.env.DEBUG_SCRAPER === 'true' // Enable via env variable
};

/**
 * SELECTOR STRATEGIES
 * Multiple fallback selectors for each data point
 * Google frequently changes class names, so we use multiple strategies:
 * 1. Primary: Most common current selector
 * 2. Fallback: Alternative selectors if primary fails
 * 3. Attribute-based: Using aria-label, data-* attributes (more stable)
 */
const SELECTORS = {
    // Search results list
    searchResults: [
        'div.Nv2PK',                    // Current primary selector
        'a[href*="/maps/place/"]',      // Link-based fallback
        '[role="article"]',             // Semantic fallback
        'div[jsaction*="mouseover"]'    // Action-based fallback
    ],

    // Business name
    businessName: [
        'h1.DUwDvf',                    // Current primary
        'h1[class*="fontHeadline"]',    // Font-based fallback
        '[data-item-id="title"]',       // Data attribute
        'h1'                            // Generic fallback
    ],

    // Rating display
    rating: [
        'div.F7nice span[aria-hidden=\"true\"]',  // Current primary
        'span[role="img"][aria-label*="stars"]',  // Aria-based
        'div[jsaction*="rating"]',                // Action-based
    ],

    // Review count
    reviewCount: [
        'div.F7nice span[aria-label*="review"]',  // Current primary
        'button[jsaction*="reviews"]',            // Button-based
        'span[aria-label*="review"]',             // Generic aria
    ],

    // Website link
    website: [
        'a[data-item-id="authority"]',            // Current primary
        'a[aria-label*="Website"]',               // Aria-based
        'a[href*="http"]:not([href*="google"])',  // Generic link (exclude Google)
    ],

    // Phone number
    phone: [
        'button[data-item-id*="phone"]',          // Current primary
        'button[aria-label*="Phone"]',            // Aria-based
        '[data-tooltip*="phone"]',                // Tooltip-based
    ],

    // Address
    address: [
        'button[data-item-id="address"]',         // Current primary
        'button[aria-label*="Address"]',          // Aria-based
    ],

    // Photos
    photos: [
        'button[jsaction*="photo"] img',          // Current primary
        'img[src*="googleusercontent"]',          // Source-based
    ],

    // Business Category
    category: [
        'button[class*="DkEaL"]',                 // Typical category button
        'div.fontBodyMedium span button',         // Secondary
        'button[jsaction*="category"]'            // Action-based
    ],

    // Claim this business
    claimBusiness: [
        'a[aria-label*="Claim this business"]',
        'button[aria-label*="Claim this business"]',
        'div[aria-label*="Claim this business"]',
        'a[href*="/business"]' // Often links to Google Business Profile
    ],

    // Tabs
    tabs: {
        reviews: 'button[aria-label*="Reviews"], button[jsaction*="reviews"]',
        photos: 'button[aria-label*="Photos"], button[jsaction*="photos"]',
        about: 'button[aria-label*="About"], button[jsaction*="about"]'
    }
};

/**
 * ============================================
 * UTILITY FUNCTIONS
 * ============================================
 */

/**
 * Wait with random jitter to appear more human-like
 * @param {number} baseMs - Base wait time in milliseconds
 * @param {number} jitterMs - Random jitter to add (default: 500ms)
 */
async function randomWait(baseMs, jitterMs = 500) {
    const totalWait = baseMs + Math.random() * jitterMs;
    return new Promise(resolve => setTimeout(resolve, totalWait));
}

/**
 * Try multiple selectors until one works
 * @param {Page} page - Puppeteer page object
 * @param {string[]} selectors - Array of selectors to try
 * @param {number} timeout - Timeout per selector
 * @returns {Promise<string|null>} - First working selector or null
 */
async function trySelectors(page, selectors, timeout = 5000) {
    for (const selector of selectors) {
        try {
            await page.waitForSelector(selector, { timeout });
            console.log(`[SELECTOR] Found element with: ${selector}`);
            return selector;
        } catch (e) {
            // Try next selector
            continue;
        }
    }
    return null;
}

/**
 * Extract text using multiple selector strategies
 * @param {Page} page - Puppeteer page object
 * @param {string[]} selectors - Array of selectors to try
 * @returns {Promise<string|null>} - Extracted text or null
 */
async function extractWithFallback(page, selectors, extractFn = null) {
    return await page.evaluate((selectorArray, extractFunction) => {
        for (const selector of selectorArray) {
            const element = document.querySelector(selector);
            if (element) {
                if (extractFunction) {
                    // Custom extraction function
                    return eval(`(${extractFunction})`)(element);
                }
                return element.textContent?.trim() || null;
            }
        }
        return null;
    }, selectors, extractFn ? extractFn.toString() : null);
}

/**
 * Take screenshot for debugging
 * @param {Page} page - Puppeteer page object
 * @param {string} name - Screenshot name
 */
async function takeDebugScreenshot(page, name) {
    if (!SCRAPER_CONFIG.screenshotOnError) return;

    try {
        const screenshotDir = path.join(__dirname, '..', 'screenshots');
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }

        const timestamp = Date.now();
        const filename = `${timestamp}_${name.replace(/\s/g, '_')}.png`;
        const filepath = path.join(screenshotDir, filename);

        await page.screenshot({ path: filepath, fullPage: true });
        console.log(`[DEBUG] Screenshot saved: ${filepath}`);
    } catch (error) {
        console.error(`[DEBUG] Failed to save screenshot: ${error.message}`);
    }
}

/**
 * ============================================
 * MAIN SCRAPER FUNCTION (WITH RETRY LOGIC)
 * ============================================
 */

/**
 * Main scraper function with retry logic
 * @param {string} businessName - Name of the business to search
 * @param {string} area - Location/area to search in
 * @param {number} attempt - Current retry attempt (internal use)
 * @returns {Promise<Object>} Scraped business data
 * 
 * RETURN FORMAT:
 * Success: { success: true, data: {...}, scrapedAt: ISO_DATE }
 * Failure: { success: false, error: 'ERROR_CODE', message: 'User friendly message' }
 * 
 * ERROR CODES:
 * - NO_RESULTS: Business not found on Google Maps
 * - SCRAPING_FAILED: Technical error during scraping
 * - TIMEOUT: Operation timed out
 */
async function scrapeGoogleMaps(businessName, area, attempt = 1) {
    let browser = null;
    let page = null;
    let competitors = []; // Phase 3: Live Local Market Medians

    try {
        console.log(`[SCRAPER] Attempt ${attempt}/${SCRAPER_CONFIG.maxRetries}: ${businessName} in ${area}`);

        // STEP 1: Launch browser
        // Puppeteer launches a Chrome instance we can control programmatically
        browser = await puppeteer.launch({
            args: [
                ...chromium.args,
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process'
            ],
            defaultViewport: chromium.defaultViewport,
            executablePath: process.env.NODE_ENV === 'production' ? await chromium.executablePath() : undefined,
            ...(process.env.NODE_ENV !== 'production' ? { channel: 'chrome' } : {}),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        // STEP 2: Create new page (tab)
        page = await browser.newPage();

        // STEP 3: Set realistic user agent
        // User agent is a string that identifies the browser
        // Google checks this to detect bots
        await page.setUserAgent(SCRAPER_CONFIG.userAgent);

        // STEP 4: Set viewport size & Language Headers (desktop resolution, enforce English)
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
        });

        // PHASE 4 OPTIMIZATION: Block heavy assets (Fonts, CSS, Media) BUT ALLOW IMAGES so we can extract real photos
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            // Block stylesheets, media, and fonts to speed up Map loads, but KEEP images for scraping
            if (['stylesheet', 'media', 'font', 'other'].includes(resourceType)) {
                request.abort();
            } else {
                request.continue();
            }
        });

        // STEP 5: Build Google Maps search URL
        const searchQuery = `${businessName} ${area}`;
        const encodedQuery = encodeURIComponent(searchQuery);
        const googleMapsUrl = `https://www.google.com/maps/search/${encodedQuery}`;

        console.log(`[SCRAPER] Navigating to: ${googleMapsUrl}`);

        // STEP 6: Navigate to Google Maps
        // Phase 4: Use domcontentloaded instead of networkidle2 to skip waiting for map vectors
        await page.goto(googleMapsUrl, {
            waitUntil: 'domcontentloaded',
            timeout: SCRAPER_CONFIG.timeout
        });

        // STEP 7: Wait for search results to load OR for the business page to auto-open
        // Try multiple selectors because Google changes their HTML frequently
        console.log('[SCRAPER] Waiting for search results or auto-open...');
        const combinedSelectors = [...SELECTORS.searchResults, ...SELECTORS.businessName];
        const resultsSelector = await trySelectors(page, combinedSelectors, 10000);

        if (!resultsSelector) {
            console.log('[SCRAPER] No results or business found');
            throw new Error('NO_RESULTS_FOUND');
        }

        console.log('[SCRAPER] Search loaded or business auto-opened');

        // STEP 8: Wait a bit for results to fully render
        await randomWait(800, 200); // Phase 4: Reduced from 2000ms

        // Check if we hit a search list or auto-opened the profile directly
        const isAutoOpen = SELECTORS.businessName.includes(resultsSelector);

        if (!isAutoOpen) {
            // PHASE 3: COMPETITOR INTEL EXTRACTION (Before we click away)
            console.log('[SCRAPER] Extracting Top 5 Competitors for Contextual Medians...');
            competitors = await page.evaluate(() => {
                const compList = [];
                // Nv2PK is the standard Google Maps search result card container
                const cards = document.querySelectorAll('div.Nv2PK');

                // Grab up to top 5
                const max = Math.min(cards.length, 5);
                for (let i = 0; i < max; i++) {
                    const card = cards[i];
                    // Name is usually the only h-font or aria-label text
                    const nameEl = card.querySelector('div.qBF1Pd') || card.querySelector('a');
                    const name = nameEl ? nameEl.textContent || (nameEl.getAttribute && nameEl.getAttribute('aria-label')) : 'Unknown';

                    // Rating and Reviews usually sit together in MW4etd
                    const ratingStr = card.querySelector('span.MW4etd')?.textContent || "0";
                    const reviewStr = card.querySelector('span.UY7F9')?.textContent || "0";

                    compList.push({
                        name: name,
                        rating: parseFloat(ratingStr) || 0,
                        reviews: parseInt(reviewStr.replace(/[^0-9]/g, '')) || 0
                    });
                }
                return compList;
            });

            console.log(`[SCRAPER] Extracted ${competitors.length} competitors.`, competitors);

            // STEP 9: Click the first business result
            console.log('[SCRAPER] Clicking first result from list...');
            const clicked = await page.evaluate(() => {
                const selectors = [
                    'a.hfpxzc', // Google's primary link class for search result cards
                    '[role="feed"] a[href*="/maps/place/"]',
                    'a[href*="/maps/place/"]',
                    'div[jsaction] a[href*="/maps/place/"]',
                    'div.Nv2PK a',
                    '[role="article"] a',
                    'div[role="article"] a[href*="place"]',
                    'div.Nv2PK', // Fallback to clicking the card container itself
                    'div[jsaction*="mouseover"]' // The exact thing we found that triggered results
                ];

                for (const selector of selectors) {
                    const firstResult = document.querySelector(selector);
                    if (firstResult) {
                        console.log(`[CLICK] Using selector: ${selector}`);
                        firstResult.click();
                        return selector;
                    }
                }
                return null;
            });

            if (!clicked) {
                console.log('[SCRAPER] Could not click first result - no matching selector found');
                await takeDebugScreenshot(page, `no-click-${businessName}`);
                throw new Error('NO_RESULTS_FOUND');
            }

            console.log(`[SCRAPER] ✓ Clicked first result using: ${clicked}`);

            // Wait for details panel to slide in
            await randomWait(1000, 500); // Phase 4: Reduced from 3000ms
        } else {
            console.log('[SCRAPER] ✓ Business profile auto-opened directly');
        }

        // STEP 10.5: Auto-scroll the details container to load lazy elements (Social profiles, Q&A, Updates)
        console.log('[SCRAPER] Scrolling details panel to load lazy content...');
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                const container = document.querySelector('div[role="main"]') || document.documentElement;
                let totalHeight = 0;
                const distance = 3000; // Phase 4: Scroll 3000px at a time instead of 800px
                const timer = setInterval(() => {
                    const scrollHeight = container.scrollHeight;
                    if (container.scrollBy) {
                        container.scrollBy(0, distance);
                    } else {
                        window.scrollBy(0, distance);
                    }
                    totalHeight += distance;
                    // Stop scrolling if we reach bottom or 8000px maximum
                    if (totalHeight >= scrollHeight || totalHeight >= 8000) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100); // Phase 4: Tick every 100ms instead of 200ms
            });
        });

        // Wait a bit for the lazy loaded content to fully render
        await randomWait(500, 200); // Phase 4: Reduced from 1500ms

        // STEP 11: Extract business data
        const basicData = await extractBusinessData(page);

        // Validate that we got at least the business name
        if (!basicData.name) {
            console.log('[SCRAPER] Could not extract business name');
            await takeDebugScreenshot(page, `no-name-${businessName}`);
            throw new Error('NO_RESULTS_FOUND');
        }

        // EXTRACT ADVANCED DATA (Reviews, Photos, etc.)
        console.log('[SCRAPER] Extracting advanced data (Reviews, Photos)...');
        const advancedData = await extractAdvancedData(page, basicData);
        const businessData = {
            ...basicData,
            ...advancedData,
            competitors: competitors // Inject phase 3 competitor data
        };

        // COMPETITOR DATA FALLBACK: The first competitor in search results IS the business we clicked.
        // If the detail panel extraction failed for key fields, patch from competitor data.
        if (competitors.length > 0) {
            const self = competitors[0]; // First search result = the business being audited
            if (!businessData.reviewCount && self.reviews > 0) {
                console.log(`[SCRAPER] ⚠ reviewCount fallback from search results: ${self.reviews}`);
                businessData.reviewCount = self.reviews;
            }
            if (!businessData.rating && self.rating > 0) {
                console.log(`[SCRAPER] ⚠ rating fallback from search results: ${self.rating}`);
                businessData.rating = self.rating;
            }
            if (!businessData.name || businessData.name === 'Results') {
                console.log(`[SCRAPER] ⚠ name fallback from search results: ${self.name}`);
                businessData.name = self.name;
            }
        }

        // Log extracted data
        console.log(`[SCRAPER] ✓ Successfully scraped: ${businessData.name}`);
        console.log(`[SCRAPER]   Competitors Scraped: ${competitors.length}`);
        console.log(`[SCRAPER]   Rating: ${businessData.rating || 'N/A'}`);
        console.log(`[SCRAPER]   Reviews: ${businessData.reviewCount || 0}`);
        console.log(`[SCRAPER]   Claimed: ${businessData.isClaimed ? 'Yes' : 'No'}`);
        console.log(`[SCRAPER]   Latest Review: ${businessData.latestReviewDate || 'N/A'}`);
        console.log(`[SCRAPER]   Owner Responses: ${businessData.ownerResponseCount}/5`);
        console.log(`[SCRAPER]   Owner Photos: ${businessData.hasOwnerPhotos ? 'Yes' : 'No'}`);
        console.log(`[SCRAPER]   Hours Missing: ${businessData.hoursMissing ? 'Yes' : 'No'}`);

        // STEP 12: Close browser
        await browser.close();

        // STEP 13: Return success
        return {
            success: true,
            data: businessData,
            scrapedAt: new Date().toISOString(),
            attempt: attempt
        };

    } catch (error) {
        console.error(`[SCRAPER ERROR] Attempt ${attempt}: ${error.message}`);

        // Take screenshot for debugging if enabled
        if (page) {
            await takeDebugScreenshot(page, `error-${businessName}-attempt${attempt}`);
        }

        // Close browser
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('[SCRAPER] Error closing browser:', closeError.message);
            }
        }

        // RETRY LOGIC: Try again if we haven't exceeded max retries
        if (attempt < SCRAPER_CONFIG.maxRetries && error.message !== 'NO_RESULTS_FOUND') {
            console.log(`[SCRAPER] Retrying in ${attempt * 2} seconds...`);
            await randomWait(attempt * 2000, 1000); // Exponential backoff
            return scrapeGoogleMaps(businessName, area, attempt + 1);
        }

        // Return appropriate error
        if (error.message === 'NO_RESULTS_FOUND' || error.message.includes('NO_RESULTS')) {
            return {
                success: false,
                error: 'NO_RESULTS',
                message: 'Business not found on Google Maps',
                attempt: attempt
            };
        }

        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
            return {
                success: false,
                error: 'TIMEOUT',
                message: 'Request timed out. Google Maps took too long to respond.',
                details: error.message,
                attempt: attempt
            };
        }

        return {
            success: false,
            error: 'SCRAPING_FAILED',
            message: 'Could not scrape Google Maps. Please try again later.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            attempt: attempt
        };
    }
}

/**
 * Extract all business data from the details panel
 * Uses multiple selector strategies for robustness
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<Object>} - Extracted business data
 */
async function extractBusinessData(page) {
    return await page.evaluate((SELECTORS) => {
        const data = {
            name: null,
            category: null,
            rating: null,
            reviewCount: null,
            website: null,
            phone: null,
            address: null,
            photos: [],
            hours: null
        };

        // ===== EXTRACT BUSINESS NAME =====
        for (const selector of SELECTORS.businessName) {
            const element = document.querySelector(selector);
            if (element && element.textContent) {
                data.name = element.textContent.trim();
                break;
            }
        }

        // ===== EXTRACT CATEGORY =====
        for (const selector of SELECTORS.category) {
            const element = document.querySelector(selector);
            if (element && element.textContent) {
                // E.g., removes dot separators commonly used in Maps DOM
                const catText = element.textContent.trim().replace(/·/g, '').trim();
                // Check if it's actually just text and not a weird element
                if (catText.length > 2 && catText.length < 50) {
                    data.category = catText;
                    break;
                }
            }
        }

        // ===== EXTRACT RATING =====
        for (const selector of SELECTORS.rating) {
            const element = document.querySelector(selector);
            if (element) {
                const text = element.textContent || element.getAttribute('aria-label') || '';
                const ratingMatch = text.match(/(\d+\.?\d*)/);
                if (ratingMatch) {
                    data.rating = parseFloat(ratingMatch[1]);
                    break;
                }
            }
        }

        // ===== EXTRACT REVIEW COUNT =====
        for (const selector of SELECTORS.reviewCount) {
            const element = document.querySelector(selector);
            if (element) {
                const ariaLabel = element.getAttribute('aria-label') || element.textContent || '';
                const reviewMatch = ariaLabel.match(/([\d,]+)/);
                if (reviewMatch) {
                    data.reviewCount = parseInt(reviewMatch[1].replace(/,/g, ''));
                    break;
                }
            }
        }

        // ===== EXTRACT WEBSITE =====
        for (const selector of SELECTORS.website) {
            const element = document.querySelector(selector);
            if (element && element.href) {
                // Make sure it's not a Google link
                if (!element.href.includes('google.com/search')) {
                    data.website = element.href;
                    break;
                }
            }
        }

        // ===== EXTRACT PHONE NUMBER =====
        for (const selector of SELECTORS.phone) {
            const element = document.querySelector(selector);
            if (element) {
                const text = element.textContent || element.getAttribute('aria-label') || '';
                const phoneMatch = text.match(/[\d\s\-\+\(\)]+/);
                if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 7) {
                    data.phone = phoneMatch[0].trim();
                    break;
                }
            }
        }

        // ===== EXTRACT ADDRESS =====
        for (const selector of SELECTORS.address) {
            const element = document.querySelector(selector);
            if (element) {
                // Try to find the address text within the button
                const addressDiv = element.querySelector('div.fontBodyMedium') || element;
                if (addressDiv && addressDiv.textContent) {
                    data.address = addressDiv.textContent.trim();
                    break;
                }
            }
        }

        // ===== EXTRACT PHOTOS =====
        const photoUrls = [];

        // 1. High Priority: Meta Tags often contain the best hero photo natively injected by Google
        const metaImage = document.querySelector('meta[itemprop="image"]');
        if (metaImage && metaImage.content && !metaImage.content.includes('maps/vt/')) {
            photoUrls.push(metaImage.content);
        }
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage && ogImage.content && !photoUrls.includes(ogImage.content) && !ogImage.content.includes('maps/vt/')) {
            photoUrls.push(ogImage.content);
        }

        // 2. Try traditional IMG tags based on selectors
        for (const selector of SELECTORS.photos) {
            const photoElements = document.querySelectorAll(selector);
            photoElements.forEach(img => {
                if (img.src && (img.src.includes('googleusercontent') || img.src.includes('ggpht'))) {
                    if (!photoUrls.includes(img.src)) photoUrls.push(img.src);
                }
            });
        }

        // 3. Aggressive fallback: Sweep the DOM for any Google-hosted background images
        // Maps often loads the hero carousel images as div background-images.
        const allDivs = document.querySelectorAll('div[style*="background-image"], button[style*="background-image"]');
        allDivs.forEach(el => {
            const style = el.getAttribute('style') || '';
            const match = style.match(/url\(['"]?(https:\/\/[^'"]+(?:googleusercontent|ggpht)[^'"]+)['"]?\)/i);
            if (match && match[1]) {
                let url = match[1];

                // Strip sizing constraints from the URL (e.g., =w200-h200) so we get the full res photo
                // Google URLs use this format: hostname.com/id=w123-h123-k-no
                url = url.replace(/=w\d+-h\d+.*$/, '=s800-k-no'); // Force 800px size

                // Make sure it's not a generic map tile or tiny icon by checking URL params (w/h)
                if (!photoUrls.includes(url)) {
                    photoUrls.push(url);
                }
            }
        });

        // Clean up duplicate URLs that might just have different sizing flags attached
        const uniqueUrls = photoUrls.filter((url, index, self) =>
            index === self.findIndex((t) => (
                t.split('=')[0] === url.split('=')[0]
            ))
        );

        // Limit to 50
        if (uniqueUrls.length > 0) {
            data.photos = uniqueUrls.slice(0, 50);
        }

        // ===== EXTRACT BUSINESS HOURS =====
        // Hours are often in a table format
        const hoursTable = document.querySelector('table.eK4R0e') ||
            document.querySelector('table[aria-label*="Hours"]');

        if (hoursTable) {
            const rows = hoursTable.querySelectorAll('tr');
            const hoursArray = [];

            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 2) {
                    const day = cells[0].textContent.trim();
                    const hours = cells[1].textContent.trim();
                    hoursArray.push(`${day}: ${hours}`);
                }
            });

            if (hoursArray.length > 0) {
                data.hours = hoursArray.join(', ');
            }
        }

        // ===== EXTRACT HOURS MISSING STATUS =====
        if (!data.hours) {
            // Double check if we can find "Add hours" or similar text which confirms it's missing
            const addHoursBtn = document.querySelector('button[aria-label*="Add hours"]');
            if (addHoursBtn) {
                data.hoursMissing = true;
            } else {
                // If we just can't find the table, it might be missing or we just missed it. 
                // For safety, only flag if we explicitly see indicators or if the section is empty.
                const hoursSection = document.querySelector('div[aria-label*="Hours"]');
                if (!hoursSection && !hoursTable) {
                    data.hoursMissing = true;
                } else {
                    data.hoursMissing = false;
                }
            }
        } else {
            data.hoursMissing = false;
        }

        // ===== EXTRACT CLAIM STATUS =====
        data.isClaimed = true; // Default
        for (const selector of SELECTORS.claimBusiness) {
            if (document.querySelector(selector)) {
                data.isClaimed = false;
                break;
            }
        }
        const ownThisBusiness = Array.from(document.querySelectorAll('a, button')).find(el =>
            el.textContent.includes('Own this business') ||
            el.textContent.includes('Claim this business')
        );
        if (ownThisBusiness) {
            data.isClaimed = false;
        }

        // ===== EXTRACT SOCIAL LINKS =====
        data.hasSocialLinks = false;
        const socialLinks = Array.from(document.querySelectorAll('a[href]'));
        for (const link of socialLinks) {
            const href = link.href.toLowerCase();
            if (href.includes('instagram.com') || href.includes('facebook.com') || href.includes('twitter.com') || href.includes('linkedin.com')) {
                data.hasSocialLinks = true;
                break;
            }
        }

        return data;
    }, SELECTORS); // Pass SELECTORS to the browser context
}

/**
 * Extract advanced data by clicking tabs
 * @param {Page} page 
 * @param {Object} basicData
 */
async function extractAdvancedData(page, basicData) {
    const advanced = {
        ...basicData,
        latestReviewDate: null,
        ownerResponseCount: 0,
        responseRate: 0,
        recentReviewsCount: 0,
        qaCount: 0,
        daysSinceLastPost: 999,
        hasOwnerPhotos: false
    };

    try {
        console.log('[SCRAPER] Extracting Page Scan: QA, Posts, etc...');

        // Defensive wait so we don't scan too early before Maps renders the sections at the bottom
        await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 }).catch(() => { });
        await randomWait(1500, 500);

        // Wait for Q&A section to potentially load (case-insensitive check)
        await page.waitForFunction(() => {
            const text = (document.body.textContent || '').toLowerCase();
            return text.includes('questions & answers') || text.includes('questions and answers');
        }, { timeout: 5000 }).catch(() => console.log('[SCRAPER] Q&A section not found within timeout.'));

        // 0. QUICK PAGE SCAN (Q&A, Updates, etc)
        const pageScan = await page.evaluate(() => {
            let qaCount = 0;
            let daysSinceLastPost = 999;

            const allText = document.body.textContent || '';
            const allTextLower = allText.toLowerCase();

            // Q&A — case-insensitive check for both forms
            if (allTextLower.includes('questions & answers') || allTextLower.includes('questions and answers')) {
                // Try to find "See all X questions" text
                const allElements = Array.from(document.querySelectorAll('span, div, a, button'));
                for (const el of allElements) {
                    const txt = el.textContent || '';
                    const match = txt.match(/(?:See all|View all)\s+(\d+)\s+questions/i);
                    if (match) {
                        qaCount = parseInt(match[1]);
                        break;
                    }
                }
                // If section exists but no count found, at least 1
                if (qaCount === 0) qaCount = 1;
            }

            // Google Posts / Updates
            const updatesTextMatch = allTextLower.includes('updates from') || allTextLower.includes('from the owner');

            if (updatesTextMatch) {
                const updateElements = Array.from(document.querySelectorAll('*'));
                const headerIndex = updateElements.findIndex(el => {
                    const txt = el.textContent ? el.textContent.trim().toLowerCase() : '';
                    return txt === 'updates' || txt.startsWith('updates from') || txt === 'from the owner';
                });

                if (headerIndex !== -1) {
                    for (let i = headerIndex + 1; i < Math.min(headerIndex + 200, updateElements.length); i++) {
                        const txt = updateElements[i].textContent ? updateElements[i].textContent.trim() : '';
                        if (!txt) continue;

                        const match = txt.match(/(\d+)\s+(hour|day|week|month|year)s?\s+ago/i);
                        if (match) {
                            const val = parseInt(match[1]);
                            const unit = match[2].toLowerCase();
                            if (unit === 'hour' || unit === 'day') daysSinceLastPost = val;
                            else if (unit === 'week') daysSinceLastPost = val * 7;
                            else if (unit === 'month') daysSinceLastPost = val * 30;
                            else if (unit === 'year') daysSinceLastPost = 365;
                            break;
                        }

                        const singleMatch = txt.match(/(a|an)\s+(hour|day|week|month|year)\s+ago/i);
                        if (singleMatch) {
                            const unit = singleMatch[2].toLowerCase();
                            if (unit === 'hour' || unit === 'day') daysSinceLastPost = 1;
                            else if (unit === 'week') daysSinceLastPost = 7;
                            else if (unit === 'month') daysSinceLastPost = 30;
                            else if (unit === 'year') daysSinceLastPost = 365;
                            break;
                        }
                    }
                }
            }

            return { qaCount, daysSinceLastPost };
        });

        console.log(`[SCRAPER] Extracted Page Scan: Q&A=${pageScan.qaCount}, DaysSincePost=${pageScan.daysSinceLastPost}`);
        advanced.qaCount = pageScan.qaCount;
        advanced.daysSinceLastPost = pageScan.daysSinceLastPost;

        // 1. REVIEWS TAB
        console.log('[SCRAPER] Checking Reviews tab...');

        // Robust approach: first try role="tab" elements (fewer matches), then fallback to all buttons
        let reviewsTabBtn = null;
        try {
            // Strategy 1: tab-role elements first (most specific)
            const tabElements = await page.$$('div[role="tab"], button[role="tab"], div.Gpq6fe');
            for (const el of tabElements) {
                const text = await page.evaluate(e => (e.textContent || '').trim().toLowerCase(), el);
                if (text === 'reviews' || text.startsWith('reviews')) {
                    reviewsTabBtn = el;
                    break;
                }
            }

            // Strategy 2: broader button search if tabs didn't work
            if (!reviewsTabBtn) {
                const allButtons = await page.$$('button');
                for (const el of allButtons) {
                    const text = await page.evaluate(e => {
                        const t = (e.textContent || '').trim().toLowerCase();
                        const aria = (e.getAttribute('aria-label') || '').toLowerCase();
                        return t + '|' + aria;
                    }, el);
                    if (text.split('|')[0] === 'reviews' || text.split('|')[0].startsWith('reviews') ||
                        text.split('|')[1].includes('reviews')) {
                        reviewsTabBtn = el;
                        break;
                    }
                }
            }
        } catch (e) {
            console.log('[SCRAPER] Error finding Reviews tab:', e.message);
        }

        if (reviewsTabBtn) {
            console.log('[SCRAPER] Clicking Reviews tab...');
            await reviewsTabBtn.click();

            // Critical fix: We must wait for the React client to actually fetch and render the reviews API data
            await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 }).catch(() => { });
            await randomWait(2000, 1000);

            // SIMULATE SCROLL TO HYDRATE VIRTUALIZED REVIEW DOM
            console.log('[SCRAPER] Scrolling Reviews pane to trigger DOM hydration...');
            try {
                await page.evaluate(async () => {
                    // Try multiple scrollable container selectors
                    const scrollCandidates = [
                        ...Array.from(document.querySelectorAll('div.m6QErb[aria-label]')),
                        ...Array.from(document.querySelectorAll('div.m6QErb.DxyBCb')),
                        ...Array.from(document.querySelectorAll('div.k7jAl')),
                        ...Array.from(document.querySelectorAll('div[role="main"] div')).filter(el => el.scrollHeight > el.clientHeight + 100 && el.clientHeight > 200)
                    ];
                    const scrollableDiv = scrollCandidates.find(el => el.scrollHeight > el.clientHeight) || document.querySelector('div[role="main"]');
                    if (scrollableDiv) {
                        for (let i = 0; i < 4; i++) {
                            scrollableDiv.scrollBy(0, 800);
                            await new Promise(r => setTimeout(r, 600));
                        }
                        // Scroll back to top to see first reviews
                        scrollableDiv.scrollTop = 0;
                        await new Promise(r => setTimeout(r, 500));
                    }
                });
            } catch (e) {
                console.log('[SCRAPER] Review scroll bypass executed');
            }

            // Sort by Newest (Try to find the sort button)
            try {
                const sortBtn = await page.evaluateHandle(() => {
                    const ariaBtn = document.querySelector('button[aria-label*="Sort reviews"], button[aria-label*="Sort"]');
                    if (ariaBtn) return ariaBtn;

                    const buttons = Array.from(document.querySelectorAll('button'));
                    return buttons.find(b => {
                        const text = (b.textContent || '').trim();
                        return text.includes('Sort') || text.includes('Most relevant');
                    });
                });

                if (sortBtn && sortBtn.asElement()) {
                    await sortBtn.asElement().click();
                    await randomWait(1500, 500);

                    const newestOption = await page.evaluateHandle(() => {
                        const options = Array.from(document.querySelectorAll('div[role="menuitemradio"], div[role="menuitem"], li[role="menuitemradio"]'));
                        return options.find(o => o.textContent && (o.textContent.includes('Newest') || o.textContent.includes('newest')));
                    });

                    if (newestOption && newestOption.asElement()) {
                        await newestOption.asElement().click();
                        await randomWait(3000, 1000);
                    }
                }
            } catch (e) {
                console.log('[SCRAPER] Could not sort reviews, utilizing default order');
            }

            // Extract Review Data — BROADER SELECTORS + DATE PATTERNS
            const reviewData = await page.evaluate(() => {
                // Try multiple review card selectors (Google changes these frequently)
                let reviews = document.querySelectorAll('div.jftiEf');
                if (reviews.length === 0) reviews = document.querySelectorAll('div[data-review-id]');
                if (reviews.length === 0) reviews = document.querySelectorAll('div.GHT2ce');
                if (reviews.length === 0) reviews = document.querySelectorAll('div[jscontroller][jsaction] div[class*="review"]');
                if (reviews.length === 0) reviews = document.querySelectorAll('div[role="article"]');

                let latestDate = null;
                let responseCount = 0;
                let recentCount = 0;

                const limit = Math.min(reviews.length, 10);
                for (let i = 0; i < limit; i++) {
                    const review = reviews[i];
                    const reviewText = review.textContent || '';

                    // Get relative date — check ALL text nodes for time patterns
                    const spans = Array.from(review.querySelectorAll('span, div'));
                    let foundDate = false;
                    for (const el of spans) {
                        const text = (el.textContent || '').trim().toLowerCase();
                        // Match patterns like "2 weeks ago", "a month ago", "3 days ago"
                        if (text.match(/^(\d+|a|an)\s+(second|minute|hour|day|week|month|year)s?\s+ago$/)) {
                            recentCount++;
                            if (i === 0) latestDate = text;
                            foundDate = true;
                            break;
                        }
                    }

                    // Fallback: if we didn't find exact match, check for partial match in the full review text
                    if (!foundDate) {
                        const dateMatch = reviewText.match(/(\d+|a|an)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i);
                        if (dateMatch) {
                            recentCount++;
                            if (i === 0) latestDate = dateMatch[0].toLowerCase();
                        }
                    }

                    // Check for owner response — multiple text variants
                    if (reviewText.includes('Response from the owner') ||
                        reviewText.includes('response from the owner') ||
                        reviewText.includes('Owner\'s response') ||
                        reviewText.toLowerCase().includes('response from')) {
                        responseCount++;
                    }
                }

                const responseRate = limit > 0 ? Math.round((responseCount / limit) * 100) : 0;

                return { latestDate, responseCount, responseRate, recentCount, totalReviewsFound: reviews.length };
            });

            console.log(`[SCRAPER] Extracted Review Data: Date=${reviewData.latestDate}, ResponseRate=${reviewData.responseRate}%, RecentReviews=${reviewData.recentCount}, ReviewCardsFound=${reviewData.totalReviewsFound}`);
            advanced.latestReviewDate = reviewData.latestDate;
            advanced.ownerResponseCount = reviewData.responseCount;
            advanced.responseRate = reviewData.responseRate;
            advanced.recentReviewsCount = reviewData.recentCount;
        } else {
            console.log('[SCRAPER] "Reviews" tab button not found');
        }

        // FALLBACK: If we couldn't find reviews but the business has a high review count,
        // infer that there ARE recent reviews. A business with 100+ reviews almost certainly
        // has reviews from the past few months.
        if (advanced.recentReviewsCount === 0 && (advanced.reviewCount || 0) > 100) {
            console.log(`[SCRAPER] Review extraction returned 0 but total reviews=${advanced.reviewCount}. Applying heuristic fallback.`);
            // Conservative estimate: assume at least moderate recent activity
            advanced.recentReviewsCount = Math.min(Math.round((advanced.reviewCount || 0) * 0.01), 10);
            console.log(`[SCRAPER] Heuristic recentReviewsCount set to: ${advanced.recentReviewsCount}`);
        }

        // 2. PHOTOS EXTRACTION — FIXED: Extract count from tab labels instead of blocked images
        console.log('[SCRAPER] Extracting media richness...');

        // Strategy A: Extract photo count from tab labels or aria attributes
        // Google Maps tabs often show "Photos (234)" or similar text, or have aria-label with counts
        let foundPhotosCount = await page.evaluate(() => {
            let count = 0;

            // 1. Try to find photo count from tab text: "Photos (234)" or similar
            const allElements = Array.from(document.querySelectorAll('button, div[role="tab"], div.Gpq6fe, a'));
            for (const el of allElements) {
                const text = (el.textContent || '').trim();
                // Match "Photos" or "Photos (123)" or "123 photos"
                const matchParens = text.match(/photos?\s*\(?([\d,]+)\)?/i);
                if (matchParens && matchParens[1]) {
                    count = parseInt(matchParens[1].replace(/,/g, ''));
                    if (count > 0) return count;
                }
                // Match aria-label like "Photos, 234"
                const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
                const ariaMatch = ariaLabel.match(/photos?[,:]?\s*([\d,]+)/i);
                if (ariaMatch && ariaMatch[1]) {
                    count = parseInt(ariaMatch[1].replace(/,/g, ''));
                    if (count > 0) return count;
                }
            }

            // 2. Try the photo button in the overview (e.g., "All" photos button)
            const photoButton = document.querySelector('button[aria-label*="photo"], button[aria-label*="Photo"]');
            if (photoButton) {
                const ariaLabel = photoButton.getAttribute('aria-label') || '';
                const photoMatch = ariaLabel.match(/([\d,]+)/);
                if (photoMatch) {
                    count = parseInt(photoMatch[1].replace(/,/g, ''));
                    if (count > 0) return count;
                }
            }

            // 3. Fallback: count img elements that actually have loaded src (not blocked)
            const imgs = Array.from(document.querySelectorAll('img'));
            const validPhotos = imgs.filter(img => {
                const src = img.src || '';
                if (src.includes('streetviewpixels') || src.includes('googleusercontent') || src.includes('ggpht')) {
                    if (img.width && img.width < 60) return false;
                    return true;
                }
                return false;
            });
            if (validPhotos.length > 0) return validPhotos.length;

            // 4. Count div elements with background-image from Google CDN
            const bgDivs = Array.from(document.querySelectorAll('div[style*="background-image"]'));
            const validBgPhotos = bgDivs.filter(div => {
                const style = div.getAttribute('style') || '';
                return style.includes('googleusercontent') || style.includes('ggpht');
            });
            if (validBgPhotos.length > 0) return validBgPhotos.length;

            return count;
        });

        // Strategy B: Try clicking Photos tab and extracting count from there
        let photosTabBtn = null;
        try {
            const possibleTabs = await page.$$('div[role="tab"], button[role="tab"], button, div.Gpq6fe');
            for (const el of possibleTabs) {
                const text = await page.evaluate(e => (e.textContent || '').trim().toLowerCase(), el);
                if (text === 'photos' || text.startsWith('photos')) {
                    photosTabBtn = el;
                    break;
                }
            }
        } catch (e) {
            console.log('[SCRAPER] Error finding Photos tab:', e.message);
        }

        if (photosTabBtn) {
            console.log('[SCRAPER] Clicking Photos tab...');
            await photosTabBtn.click();
            await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 }).catch(() => { });
            await randomWait(1500, 500);

            // Check for "By Owner" tab/pill
            const hasOwnerPhotos = await page.evaluate(() => {
                const candidates = Array.from(document.querySelectorAll('div[role="tab"], button'));
                return candidates.some(el => {
                    const text = el.textContent || el.getAttribute('aria-label') || '';
                    return text.toLowerCase().includes('by owner');
                });
            });
            advanced.hasOwnerPhotos = hasOwnerPhotos;

            // Try to get a more accurate photo count from the Photos tab page
            const tabPhotoCount = await page.evaluate(() => {
                // Look for text like "234 photos" or heading with count
                const allText = document.body.textContent || '';
                const countMatch = allText.match(/([\d,]+)\s+photos?/i);
                if (countMatch) return parseInt(countMatch[1].replace(/,/g, ''));

                // Count loaded images
                const imgs = Array.from(document.querySelectorAll('img'));
                return imgs.filter(img => {
                    const src = img.src || '';
                    if (src.includes('streetviewpixels') || src.includes('googleusercontent') || src.includes('ggpht')) {
                        if (img.width && img.width < 60) return false;
                        return true;
                    }
                    return false;
                }).length;
            });

            if (tabPhotoCount > foundPhotosCount) {
                foundPhotosCount = tabPhotoCount;
            }
        } else {
            console.log('[SCRAPER] "Photos" tab button not found (common for restaurants). Falling back to Overview scans.');
        }

        // FALLBACK: if photo extraction still yielded 0 but we know the business has lots of reviews,
        // infer a minimum photo count. Businesses with 500+ reviews virtually always have photos.
        if (foundPhotosCount < 5 && (advanced.reviewCount || 0) > 200) {
            console.log(`[SCRAPER] Photo extraction returned only ${foundPhotosCount} but reviewCount=${advanced.reviewCount}. Applying heuristic.`);
            foundPhotosCount = Math.min(Math.round((advanced.reviewCount || 0) * 0.05), 30);
            console.log(`[SCRAPER] Heuristic foundPhotosCount set to: ${foundPhotosCount}`);
        }

        console.log(`[SCRAPER] Final photo count: ${foundPhotosCount}`);

        // Do NOT overwrite advanced.photos with placeholder strings here anymore.
        // It was actively destroying the real photo array data retrieved from extractBusinessData.
    } catch (error) {
        console.log(`[SCRAPER] Advanced extraction warning: ${error.message}`);
        // Don't fail the whole scrape, just return what we have
    }

    return advanced;
}

/**
 * ============================================
 * SEARCH MULTIPLE BUSINESSES (NEW FEATURE)
 * ============================================
 * 
 * Search Google Maps and return multiple business results for user selection
 * This ensures users pick the exact business they want to audit
 * 
 * @param {string} businessName - Name of the business to search
 * @param {string} area - Location/area to search in
 * @param {number} limit - Maximum number of results to return (default: 5)
 * @returns {Promise<Object>} Array of business previews
 */
async function searchMultipleBusinesses(businessName, area, limit = 5) {
    let browser = null;
    let page = null;

    try {
        console.log(`[SEARCH] Searching for: ${businessName} in ${area}`);

        // STEP 1: Launch browser
        browser = await puppeteer.launch({
            args: [
                ...chromium.args,
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process'
            ],
            defaultViewport: chromium.defaultViewport,
            executablePath: process.env.NODE_ENV === 'production' ? await chromium.executablePath() : undefined,
            ...(process.env.NODE_ENV !== 'production' ? { channel: 'chrome' } : {}),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        page = await browser.newPage();
        await page.setUserAgent(SCRAPER_CONFIG.userAgent);
        await page.setViewport({ width: 1920, height: 1080 });

        // STEP 2: Navigate to Google Maps search
        const searchQuery = `${businessName} ${area}`;
        const encodedQuery = encodeURIComponent(searchQuery);
        const googleMapsUrl = `https://www.google.com/maps/search/${encodedQuery}`;

        console.log(`[SEARCH] Navigating to: ${googleMapsUrl}`);

        // PHASE 4 OPTIMIZATION: Block heavy assets for speed
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (['image', 'stylesheet', 'media', 'font', 'other'].includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });

        await page.goto(googleMapsUrl, {
            waitUntil: 'domcontentloaded', // Reverted from networkidle2 because Maps leaves polling connections open
            timeout: SCRAPER_CONFIG.timeout
        });

        console.log('[SEARCH] Search page loaded. Waiting for JavaScript hydration...');

        // Explicity wait for the main h1 to appear, which means Maps has hydrated the React/Angular view
        try {
            await page.waitForSelector('h1', { timeout: 15000 });
        } catch (e) {
            console.log('[SEARCH] Warning: Main h1 didn\'t appear within 15s.');
        }

        // Check for either search results OR a direct business page
        const combinedSelectors = [...SELECTORS.searchResults, ...SELECTORS.businessName];
        const resultsSelector = await trySelectors(page, combinedSelectors, 10000);

        if (!resultsSelector) {
            throw new Error('NO_RESULTS_FOUND');
        }

        const isDirectProfile = SELECTORS.businessName.includes(resultsSelector);

        if (isDirectProfile) {
            console.log('[SEARCH] Google Maps auto-directed to a single business profile.');

            const name = await page.evaluate(() => document.querySelector('h1')?.textContent?.trim() || 'Exact Match Business');
            const placeUrl = page.url();
            const placeIdMatch = placeUrl.match(/!1s([^!]+)/);
            const placeId = placeIdMatch ? placeIdMatch[1] : `direct_${Date.now()}`;

            const thumbnail = await page.evaluate(() => {
                const img = document.querySelector('button[jsaction*="photo"] img, img[src*="googleusercontent"], img[src*="ggpht"]');
                return img ? img.src : null;
            });

            const ratingInfo = await page.evaluate(() => {
                let rating = null;
                let reviewCount = 0;

                const ratingElement = document.querySelector('div.F7nice span[aria-hidden="true"], span[role="img"][aria-label*="stars"]');
                if (ratingElement) {
                    const match = (ratingElement.textContent || ratingElement.getAttribute('aria-label') || '').match(/(\d+\.?\d*)/);
                    if (match) rating = parseFloat(match[1]);
                }

                const reviewElement = document.querySelector('div.F7nice span[aria-label*="review"]');
                if (reviewElement) {
                    const aria = reviewElement.getAttribute('aria-label') || '';
                    const revMatch = aria.match(/([\d,]+)/);
                    if (revMatch) reviewCount = parseInt(revMatch[1].replace(/,/g, ''));
                }

                return { rating, reviewCount };
            });

            const results = [{
                id: placeId,
                name: name,
                address: 'Auto-directed exact match',
                rating: ratingInfo.rating,
                reviewCount: ratingInfo.reviewCount,
                thumbnail: thumbnail,
                placeUrl: placeUrl
            }];

            await browser.close();
            return {
                success: true,
                results: results,
                query: searchQuery
            };
        }

        console.log('[SEARCH] Search results loaded');
        await randomWait(2000, 1000);

        // STEP 4: Extract multiple business previews
        const businesses = await page.evaluate(async (limit) => {
            const results = [];

            // SCROLL TO TRIGGER IMAGES (with longer waits for lazy-load)
            const feed = document.querySelector('div[role="feed"]') || document.querySelector('.m6QErb[aria-label]');
            if (feed) {
                feed.scrollTop = 1000;
                await new Promise(r => setTimeout(r, 1500));
                feed.scrollTop = 0;
                await new Promise(r => setTimeout(r, 1500));
            } else {
                window.scrollBy(0, 500);
                await new Promise(r => setTimeout(r, 1500));
            }

            // Find containers (cards) directly
            let allContainers = Array.from(document.querySelectorAll('div.Nv2PK'));
            if (allContainers.length === 0) allContainers = Array.from(document.querySelectorAll('div[role="article"]'));

            const containers = allContainers.slice(0, limit);

            for (let i = 0; i < containers.length; i++) {
                const container = containers[i];
                const link = container.querySelector('a[href*="/maps/place/"]');
                if (!link) continue;

                try {
                    // Extract business name from link aria-label or text
                    const ariaLabel = link.getAttribute('aria-label') || '';
                    let businessName = ariaLabel.split(',')[0] || link.textContent.trim();

                    // If name is empty, try to find h3 or h2 in container
                    if (!businessName) {
                        const heading = container.querySelector('h3, h2, .fontHeadlineSmall');
                        if (heading) businessName = heading.textContent.trim();
                    }

                    // Extract rating
                    let rating = null;
                    const ratingElement = container.querySelector('span[role="img"][aria-label*="star"]');
                    if (ratingElement) {
                        const ratingMatch = ratingElement.getAttribute('aria-label').match(/(\d+\.?\d*)/);
                        if (ratingMatch) rating = parseFloat(ratingMatch[1]);
                    }

                    // Extract review count
                    let reviewCount = null;
                    const reviewElements = container.querySelectorAll('span');
                    for (const span of reviewElements) {
                        const text = span.textContent;
                        if (text.includes('(') && text.includes(')')) {
                            const reviewMatch = text.match(/\(([0-9,]+)\)/);
                            if (reviewMatch) {
                                reviewCount = parseInt(reviewMatch[1].replace(/,/g, ''));
                                break;
                            }
                        }
                    }

                    // Extract address - look for text that looks like an address
                    let address = ariaLabel.split(',').slice(1).join(',').trim();
                    if (!address) {
                        const addressSpans = container.querySelectorAll('span');
                        for (const span of addressSpans) {
                            const text = span.textContent.trim();
                            // Simple heuristic: addresses usually have street/area names
                            if (text.length > 10 && !text.includes('★') && !text.includes('(')) {
                                address = text;
                                break;
                            }
                        }
                    }

                    // Extract thumbnail - ULTRA AGGRESSIVE STRATEGY
                    let thumbnail = null;

                    // Strategy 1: Google-specific images
                    let img = container.querySelector('img[src*="googleusercontent"], img[src*="ggpht"]');
                    if (img && img.src) thumbnail = img.src;

                    // Strategy 2: Check lazy-load data attributes (data-src, data-lazy-src)
                    if (!thumbnail) {
                        const allImages = container.querySelectorAll('img');
                        for (const candidate of allImages) {
                            // Check data-src first (lazy-load attribute)
                            const dataSrc = candidate.getAttribute('data-src') || candidate.getAttribute('data-lazy-src');
                            if (dataSrc && dataSrc.length > 50 && !dataSrc.includes('icon')) {
                                thumbnail = dataSrc;
                                break;
                            }
                            // Then check regular src
                            if (candidate.src && candidate.src.length > 50 && !candidate.src.includes('icon')) {
                                thumbnail = candidate.src;
                                break;
                            }
                        }
                    }

                    // Strategy 3: Background images
                    if (!thumbnail) {
                        const divs = container.querySelectorAll('div[style*="background-image"]');
                        if (divs.length > 0) {
                            const style = divs[0].getAttribute('style');
                            const match = style.match(/url\(['"]?(.*?)['"]?\)/);
                            if (match && match[1]) {
                                thumbnail = match[1];
                            }
                        }
                    }

                    // Strategy 4: NUCLEAR FALLBACK - STRICT WHITELIST (IMG + DIV BACKGROUNDS)
                    // Captures both standard images and CSS background-images (common for hero photos)
                    if (!thumbnail) {
                        const allPageImages = [];

                        // 1. Scan <img> tags
                        document.querySelectorAll('img').forEach(img => {
                            const src = img.src || img.getAttribute('data-src');
                            if (src && (src.includes('googleusercontent.com') || src.includes('ggpht.com'))) {
                                allPageImages.push(src);
                            }
                        });

                        // 2. Scan <div> background-images
                        document.querySelectorAll('div[style*="background-image"]').forEach(div => {
                            const style = div.getAttribute('style');
                            const match = style.match(/url\(['"]?(.*?)['"]?\)/);
                            if (match && match[1]) {
                                const src = match[1];
                                if (src.includes('googleusercontent.com') || src.includes('ggpht.com')) {
                                    allPageImages.push(src);
                                }
                            }
                        });

                        if (allPageImages[i]) {
                            thumbnail = allPageImages[i];
                        } else if (allPageImages.length > 0) {
                            thumbnail = allPageImages[0];
                        }
                    }

                    // Get place URL
                    const placeUrl = link.href;

                    // Extract place_id from URL
                    const placeIdMatch = placeUrl.match(/!1s([^!]+)/);
                    const placeId = placeIdMatch ? placeIdMatch[1] : null;

                    results.push({
                        id: placeId || `result_${i}`,
                        name: businessName || 'Unknown Business',
                        address: address || 'Address not available',
                        rating: rating,
                        reviewCount: reviewCount || 0,
                        thumbnail: thumbnail,
                        placeUrl: placeUrl
                    });
                } catch (error) {
                    console.error(`Error extracting business ${i}:`, error);
                }
            }

            return results;
        }, limit);

        console.log(`[SEARCH] Found ${businesses.length} businesses`);

        await browser.close();

        return {
            success: true,
            results: businesses,
            query: searchQuery
        };

    } catch (error) {
        console.error(`[SEARCH ERROR] ${error.message}`);

        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('[SEARCH] Error closing browser:', closeError.message);
            }
        }

        if (error.message === 'NO_RESULTS_FOUND') {
            return {
                success: false,
                error: 'NO_RESULTS',
                message: 'No businesses found for this search',
                results: []
            };
        }

        return {
            success: false,
            error: 'SEARCH_FAILED',
            message: 'Could not search Google Maps. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            results: []
        };
    }
}

/**
 * Scrape a specific business by its Google Maps URL
 * @param {string} placeUrl - Full Google Maps place URL
 * @returns {Promise<Object>} Scraped business data
 */
async function scrapeBusinessByUrl(placeUrl) {
    let browser = null;
    let page = null;

    try {
        console.log(`[SCRAPER] Scraping business by URL: ${placeUrl}`);

        browser = await puppeteer.launch({
            args: [
                ...chromium.args,
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process'
            ],
            defaultViewport: chromium.defaultViewport,
            executablePath: process.env.NODE_ENV === 'production' ? await chromium.executablePath() : undefined,
            ...(process.env.NODE_ENV !== 'production' ? { channel: 'chrome' } : {}),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        page = await browser.newPage();
        await page.setUserAgent(SCRAPER_CONFIG.userAgent);
        await page.setViewport({ width: 1920, height: 1080 });

        // PHASE 4 OPTIMIZATION: Block heavy assets for speed
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (['image', 'stylesheet', 'media', 'font', 'other'].includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });

        // Navigate directly to the place URL
        // Use domcontentloaded instead of networkidle2 because Maps often leaves polling connections open
        await page.goto(placeUrl, {
            waitUntil: 'domcontentloaded',
            timeout: SCRAPER_CONFIG.timeout
        });

        console.log('[SCRAPER] Place page loaded. Waiting for JavaScript hydration...');

        // Explicity wait for the main h1 to appear, which means Maps has hydrated the React/Angular view
        try {
            await page.waitForSelector('h1', { timeout: 15000 });
        } catch (e) {
            console.log('[SCRAPER] Warning: Title h1 didn\'t appear within 15s.');
        }

        await randomWait(1500, 500);

        // Auto-scroll the details container to load lazy elements (Q&A, Social)
        console.log('[SCRAPER] Scrolling details panel to load lazy content...');
        try {
            await page.evaluate(async () => {
                await new Promise((resolve) => {
                    const container = document.querySelector('div[role="main"]') || document.documentElement;
                    let totalHeight = 0;
                    const distance = 3000;
                    const timer = setInterval(() => {
                        const scrollHeight = container.scrollHeight;
                        if (container.scrollBy) {
                            container.scrollBy(0, distance);
                        } else {
                            window.scrollBy(0, distance);
                        }
                        totalHeight += distance;
                        if (totalHeight >= scrollHeight || totalHeight >= 8000) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 100);
                });
            });
        } catch (e) { /* ignore */ }
        await randomWait(500, 200);

        // Extract business data
        const basicData = await extractBusinessData(page);

        if (!basicData.name) {
            console.log('[SCRAPER] Could not extract business name');
            await takeDebugScreenshot(page, 'no-name-url-scrape');
            throw new Error('NO_DATA_FOUND');
        }

        // EXTRACT ADVANCED DATA
        console.log('[SCRAPER] Extracting advanced data (Reviews, Photos)...');
        const advancedData = await extractAdvancedData(page, basicData);
        const businessData = { ...basicData, ...advancedData };

        console.log(`[SCRAPER] ✓ Successfully scraped: ${businessData.name}`);
        console.log(`[SCRAPER]   Rating: ${businessData.rating || 'N/A'}`);
        console.log(`[SCRAPER]   Reviews: ${businessData.reviewCount || 0}`);
        console.log(`[SCRAPER]   Claimed: ${businessData.isClaimed ? 'Yes' : 'No'}`);

        await browser.close();

        return {
            success: true,
            data: businessData,
            scrapedAt: new Date().toISOString()
        };

    } catch (error) {
        console.error(`[SCRAPER ERROR] ${error.message}`);

        if (page) {
            await takeDebugScreenshot(page, 'error-url-scrape');
        }

        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('[SCRAPER] Error closing browser:', closeError.message);
            }
        }

        return {
            success: false,
            error: 'SCRAPING_FAILED',
            message: 'Could not scrape business data. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        };
    }
}

/**
 * ============================================
 * AUTOCOMPLETE SUGGESTIONS
 * ============================================
 * 
 * Get business name suggestions from Google Maps autocomplete
 * This helps users find the exact business they're looking for
 * 
 * @param {string} query - Partial business name
 * @param {string} area - Optional location/area
 * @returns {Promise<Array>} Array of suggestion strings
 */
async function getAutocompletesuggestions(query, area = '') {
    let browser = null;
    let page = null;

    try {
        console.log(`[AUTOCOMPLETE] Getting suggestions for: "${query}" in "${area}"`);

        browser = await puppeteer.launch({
            args: [
                ...chromium.args,
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process'
            ],
            defaultViewport: chromium.defaultViewport,
            executablePath: process.env.NODE_ENV === 'production' ? await chromium.executablePath() : undefined,
            ...(process.env.NODE_ENV !== 'production' ? { channel: 'chrome' } : {}),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        page = await browser.newPage();
        await page.setUserAgent(SCRAPER_CONFIG.userAgent);
        await page.setViewport({ width: 1920, height: 1080 });

        // Navigate to Google Maps
        await page.goto('https://www.google.com/maps', {
            waitUntil: 'networkidle2',
            timeout: SCRAPER_CONFIG.timeout
        });

        await randomWait(1000, 500);

        // Find the search input and type
        const searchInput = await page.waitForSelector('#searchboxinput, input[name="q"]', { timeout: 10000 });

        const fullQuery = area ? `${query} ${area}` : query;
        await searchInput.type(fullQuery, { delay: 100 }); // Slow typing to trigger autocomplete

        // Wait for autocomplete dropdown to appear
        await randomWait(1500, 500);

        // Extract suggestions from autocomplete dropdown
        const suggestions = await page.evaluate(() => {
            const results = [];

            // Try different selectors for autocomplete suggestions
            const selectors = [
                '[role="option"]',
                '.tactile-searchbox-suggestion',
                '[data-suggestion-index]',
                'div[jsaction*="suggestion"]'
            ];

            let suggestionElements = [];
            for (const selector of selectors) {
                suggestionElements = document.querySelectorAll(selector);
                if (suggestionElements.length > 0) break;
            }

            suggestionElements.forEach((element, index) => {
                if (index >= 10) return; // Limit to 10 suggestions

                const text = element.textContent?.trim();
                if (text && text.length > 0) {
                    results.push({
                        text: text,
                        type: 'autocomplete'
                    });
                }
            });

            return results;
        });

        await browser.close();

        console.log(`[AUTOCOMPLETE] Found ${suggestions.length} suggestions`);
        return suggestions.map(s => s.text);

    } catch (error) {
        console.error(`[AUTOCOMPLETE ERROR] ${error.message}`);

        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('[AUTOCOMPLETE] Error closing browser:', closeError.message);
            }
        }

        // Return empty array on error instead of failing
        return [];
    }
}

/**
 * Test function for debugging
 * Run: node utils/googleScraper.js
 */
async function testScraper() {
    console.log('Testing Google Maps Scraper...\n');

    const result = await scrapeGoogleMaps('Dominos Pizza', 'Connaught Place, Delhi');

    console.log('\n=== SCRAPING RESULT ===');
    console.log(JSON.stringify(result, null, 2));
}

// Allow running this file directly for testing
if (require.main === module) {
    testScraper();
}

module.exports = {
    scrapeGoogleMaps,
    searchMultipleBusinesses,
    scrapeBusinessByUrl,
    getAutocompletesuggestions
};
