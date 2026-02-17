const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * ============================================
 * GOOGLE MAPS PUPPETEER SCRAPER (ENHANCED)
 * ============================================
 * 
 * Purpose: Scrape Google Maps data without using the official API
 * Created for: BizCheck by Zeeshan (Jadavpur University)
 * 
 * IMPORTANT NOTES FOR LEARNING:
 * 1. Google Maps DOM changes frequently - selectors may break
 * 2. Always respect robots.txt and use delays to avoid bans
 * 3. This is for educational/small-scale use only
 * 4. For production at scale, use the official API
 * 
 * HOW THIS SCRAPER WORKS (FOR INTERVIEWS):
 * 1. Launches a headless Chrome browser using Puppeteer
 * 2. Navigates to Google Maps search URL
 * 3. Waits for search results to load (with fallback selectors)
 * 4. Clicks the first business result
 * 5. Extracts data using multiple selector strategies
 * 6. Returns structured data or error
 * 
 * ANTI-BAN STRATEGIES USED:
 * - Realistic user agent (appears as real Chrome browser)
 * - Random delays between actions (mimics human behavior)
 * - Retry logic with exponential backoff (3 attempts max)
 * - Queue system limits requests (see queueManager.js)
 * 
 * HOW TO UPDATE SELECTORS IF THEY BREAK:
 * 1. Open Chrome and go to Google Maps
 * 2. Search for a business (e.g., "Dominos Connaught Place Delhi")
 * 3. Right-click on elements and "Inspect"
 * 4. Look for unique attributes like aria-label, data-*, or role
 * 5. Update the SELECTORS object below
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

    try {
        console.log(`[SCRAPER] Attempt ${attempt}/${SCRAPER_CONFIG.maxRetries}: ${businessName} in ${area}`);

        // STEP 1: Launch browser
        // Puppeteer launches a Chrome instance we can control programmatically
        browser = await puppeteer.launch({
            headless: SCRAPER_CONFIG.headless,
            args: [
                '--no-sandbox',                    // Required for some server environments
                '--disable-setuid-sandbox',        // Security setting for root users
                '--disable-dev-shm-usage',         // Prevents crashes on low-memory systems
                '--disable-accelerated-2d-canvas', // Reduces resource usage
                '--disable-gpu',                   // Not needed for headless mode
                '--window-size=1920,1080'          // Set window size
            ]
        });

        // STEP 2: Create new page (tab)
        page = await browser.newPage();

        // STEP 3: Set realistic user agent
        // User agent is a string that identifies the browser
        // Google checks this to detect bots
        await page.setUserAgent(SCRAPER_CONFIG.userAgent);

        // STEP 4: Set viewport size (desktop resolution)
        await page.setViewport({ width: 1920, height: 1080 });

        // STEP 5: Build Google Maps search URL
        const searchQuery = `${businessName} ${area}`;
        const encodedQuery = encodeURIComponent(searchQuery);
        const googleMapsUrl = `https://www.google.com/maps/search/${encodedQuery}`;

        console.log(`[SCRAPER] Navigating to: ${googleMapsUrl}`);

        // STEP 6: Navigate to Google Maps
        // waitUntil: 'networkidle2' means wait until network is mostly quiet
        // This ensures the page is fully loaded
        await page.goto(googleMapsUrl, {
            waitUntil: 'networkidle2',
            timeout: SCRAPER_CONFIG.timeout
        });

        // STEP 7: Wait for search results to load
        // Try multiple selectors because Google changes their HTML frequently
        console.log('[SCRAPER] Waiting for search results...');
        const resultsSelector = await trySelectors(page, SELECTORS.searchResults, 10000);

        if (!resultsSelector) {
            console.log('[SCRAPER] No results found');
            throw new Error('NO_RESULTS_FOUND');
        }

        console.log('[SCRAPER] Search results loaded');

        // STEP 8: Wait a bit for results to fully render
        // Human-like delay with random jitter
        await randomWait(2000, 1000);

        // STEP 9: Click the first business result
        console.log('[SCRAPER] Clicking first result...');
        const clicked = await page.evaluate(() => {
            // Try different methods to find the first result
            // This runs in the browser context, not Node.js
            const selectors = [
                '[role="feed"] a[href*="/maps/place/"]',  // Feed container approach (most reliable)
                'a[href*="/maps/place/"]',                 // Direct link approach
                'div[jsaction] a[href*="/maps/place/"]',   // Interactive div approach
                'div.Nv2PK a',                             // Legacy class-based approach
                '[role="article"] a',                      // Article role approach
                'div[role="article"] a[href*="place"]'     // Combined approach
            ];

            for (const selector of selectors) {
                const firstResult = document.querySelector(selector);
                if (firstResult) {
                    console.log(`[CLICK] Using selector: ${selector}`);
                    firstResult.click();
                    return selector; // Return which selector worked
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

        // STEP 10: Wait for details panel to load
        // The details panel slides in from the left
        await randomWait(3000, 1000);

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
        const businessData = { ...basicData, ...advancedData };

        // Log extracted data
        console.log(`[SCRAPER] ✓ Successfully scraped: ${businessData.name}`);
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
        for (const selector of SELECTORS.photos) {
            const photoElements = document.querySelectorAll(selector);
            const photoUrls = [];

            photoElements.forEach(img => {
                if (img.src && (img.src.includes('googleusercontent') || img.src.includes('ggpht'))) {
                    photoUrls.push(img.src);
                }
            });

            if (photoUrls.length > 0) {
                data.photos = photoUrls.slice(0, 10); // Limit to 10 photos
                break;
            }
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

        // ===== EXTRACT CLAIM STATUS (Basic Check) =====
        data.isClaimed = true; // Default
        for (const selector of SELECTORS.claimBusiness) {
            if (document.querySelector(selector)) {
                data.isClaimed = false;
                break;
            }
        }
        // Also check for "Own this business?" text
        const ownThisBusiness = Array.from(document.querySelectorAll('a, button')).find(el =>
            el.textContent.includes('Own this business') ||
            el.textContent.includes('Claim this business')
        );
        if (ownThisBusiness) {
            data.isClaimed = false;
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
        hasOwnerPhotos: false
    };

    try {
        // 1. REVIEWS TAB
        console.log('[SCRAPER] Checking Reviews tab...');

        // Try multiple selectors for the reviews tab
        const reviewsTabSelectors = [
            'button[aria-label*="Reviews"]',
            'button[jsaction*="reviews"]',
            'div[role="tab"][aria-label*="Reviews"]',
            'div[role="tab"] > div:first-child' // Sometimes tabs are just divs, check text content later
        ];

        let reviewsTabBtn = null;
        for (const selector of reviewsTabSelectors) {
            const elements = await page.$$(selector);
            for (const el of elements) {
                const text = await page.evaluate(e => e.textContent, el);
                if (text && text.includes('Reviews')) {
                    reviewsTabBtn = el;
                    break;
                }
            }
            if (reviewsTabBtn) break;
        }

        if (reviewsTabBtn) {
            await reviewsTabBtn.click();
            await randomWait(2000, 1000);

            // Sort by Newest (Try to find the sort button)
            try {
                // Look for button that says "Sort"
                const sortBtn = await page.evaluateHandle(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    return buttons.find(b => b.textContent && b.textContent.includes('Sort'));
                });

                if (sortBtn && sortBtn.asElement()) {
                    await sortBtn.asElement().click();
                    await randomWait(1000, 500);

                    // Click "Newest"
                    const newestOption = await page.evaluateHandle(() => {
                        const options = Array.from(document.querySelectorAll('div[role="menuitemradio"], div[role="menuitem"]'));
                        return options.find(o => o.textContent && o.textContent.includes('Newest'));
                    });

                    if (newestOption && newestOption.asElement()) {
                        await newestOption.asElement().click();
                        await randomWait(2000, 1000); // Wait for sort
                    }
                }
            } catch (e) {
                console.log('[SCRAPER] Could not sort reviews, utilizing default order');
            }

            // Extract Review Data - MORE ROBUST EVALUATION
            const reviewData = await page.evaluate(() => {
                // Generic selector for review cards
                const possibleReviewCards = document.querySelectorAll('div.jftiEf, div[data-review-id]');

                let latestDate = null;
                let responseCount = 0;

                // If specific classes fail, try finding any div that looks like a review
                const reviews = possibleReviewCards.length > 0 ? possibleReviewCards : document.querySelectorAll('div[role="article"]');

                // Check first 5 reviews
                const limit = Math.min(reviews.length, 5);
                for (let i = 0; i < limit; i++) {
                    const review = reviews[i];
                    const reviewText = review.textContent;

                    // Get date - Look for typical date patterns like "2 weeks ago", "a month ago"
                    if (i === 0) {
                        // Strategy: Find strings that look like relative dates
                        // Usually found in spans near the top
                        const spans = Array.from(review.querySelectorAll('span'));
                        for (const span of spans) {
                            const text = span.textContent.trim();
                            if (text.match(/(second|minute|hour|day|week|month|year)s? ago/)) {
                                latestDate = text;
                                break;
                            }
                        }
                    }

                    // Check for owner response - Robust Text Check
                    // Google often wraps this in "Response from the owner"
                    if (reviewText.includes('Response from the owner')) {
                        responseCount++;
                    }
                }
                return { latestDate, responseCount };
            });

            console.log(`[SCRAPER] Extracted Review Data: Date=${reviewData.latestDate}, Responses=${reviewData.responseCount}`);
            advanced.latestReviewDate = reviewData.latestDate;
            advanced.ownerResponseCount = reviewData.responseCount;
        } else {
            console.log('[SCRAPER] "Reviews" tab button not found');
        }

        // 2. PHOTOS TAB
        console.log('[SCRAPER] Checking Photos tab...');
        // Try to find "Photos" button
        const photoTabSelectors = [
            'button[aria-label*="Photos"]',
            'button[jsaction*="photos"]',
            'div[role="tab"][aria-label*="Photos"]'
        ];

        let photosTabBtn = null;
        for (const selector of photoTabSelectors) {
            const elements = await page.$$(selector);
            for (const el of elements) {
                const text = await page.evaluate(e => e.textContent, el);
                if (text && text.includes('Photos')) {
                    photosTabBtn = el;
                    break;
                }
            }
            if (photosTabBtn) break;
        }

        if (photosTabBtn) {
            await photosTabBtn.click();
            await randomWait(2000, 500);

            // Check for "By Owner" tab/pill
            const hasOwnerPhotos = await page.evaluate(() => {
                // Look for any tab or button that says "By owner"
                const candidates = Array.from(document.querySelectorAll('div[role="tab"], button'));
                return candidates.some(el => {
                    const text = el.textContent || el.getAttribute('aria-label') || '';
                    return text.toLowerCase().includes('by owner');
                });
            });

            advanced.hasOwnerPhotos = hasOwnerPhotos;
        } else {
            console.log('[SCRAPER] "Photos" tab button not found');
        }

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
            headless: SCRAPER_CONFIG.headless,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920,1080'
            ]
        });

        page = await browser.newPage();
        await page.setUserAgent(SCRAPER_CONFIG.userAgent);
        await page.setViewport({ width: 1920, height: 1080 });

        // STEP 2: Navigate to Google Maps search
        const searchQuery = `${businessName} ${area}`;
        const encodedQuery = encodeURIComponent(searchQuery);
        const googleMapsUrl = `https://www.google.com/maps/search/${encodedQuery}`;

        console.log(`[SEARCH] Navigating to: ${googleMapsUrl}`);
        await page.goto(googleMapsUrl, {
            waitUntil: 'networkidle2',
            timeout: SCRAPER_CONFIG.timeout
        });

        // STEP 3: Wait for search results
        const resultsSelector = await trySelectors(page, SELECTORS.searchResults, 10000);
        if (!resultsSelector) {
            throw new Error('NO_RESULTS_FOUND');
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
            headless: SCRAPER_CONFIG.headless,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920,1080'
            ]
        });

        page = await browser.newPage();
        await page.setUserAgent(SCRAPER_CONFIG.userAgent);
        await page.setViewport({ width: 1920, height: 1080 });

        // Navigate directly to the place URL
        await page.goto(placeUrl, {
            waitUntil: 'networkidle2',
            timeout: SCRAPER_CONFIG.timeout
        });

        console.log('[SCRAPER] Place page loaded');
        await randomWait(2000, 1000);

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
            headless: SCRAPER_CONFIG.headless,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920,1080'
            ]
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
