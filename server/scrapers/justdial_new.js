const puppeteer = require('puppeteer');

/**
 * ============================================
 * JUSTDIAL SCRAPER (PUPPETEER-BASED)
 * ============================================
 * 
 * Scrapes business data from JustDial.com
 * Similar approach to Google Maps scraper
 */

const SCRAPER_CONFIG = {
    headless: "new", // Use new headless mode
    timeout: 60000, // Increased timeout
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

/**
 * Helper: Random wait to appear more human-like
 */
function randomWait(baseMs, varianceMs = 500) {
    const wait = baseMs + Math.random() * varianceMs;
    return new Promise(resolve => setTimeout(resolve, wait));
}

/**
 * Scrape business from JustDial
 * @param {string} businessName - Name of business
 * @param {string} area - Location/area
 * @returns {Promise<Object>} Scraped data
 */
async function scrapeJustDial(businessName, area) {
    let browser = null;
    let page = null;

    try {
        console.log(`[JUSTDIAL] Searching for: ${businessName} in ${area}`);

        // Launch browser with stealthier args
        browser = await puppeteer.launch({
            headless: SCRAPER_CONFIG.headless,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920,1080',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        page = await browser.newPage();

        // Enable console log from browser
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));

        // Helper to randomize viewport slightly
        await page.setViewport({
            width: 1920 + Math.floor(Math.random() * 100),
            height: 1080 + Math.floor(Math.random() * 100)
        });

        // Set realistic headers
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Referer': 'https://www.google.com/'
        });

        await page.setUserAgent(SCRAPER_CONFIG.userAgent);

        // Build search URL
        const searchQuery = `${businessName} ${area}`;
        const encodedQuery = encodeURIComponent(searchQuery);
        const justdialUrl = `https://www.justdial.com/Search?q=${encodedQuery}`;

        console.log(`[JUSTDIAL] Navigating to: ${justdialUrl}`);

        await page.goto(justdialUrl, {
            waitUntil: 'networkidle2',
            timeout: SCRAPER_CONFIG.timeout
        });

        await randomWait(2000, 1000);

        // Check if we got results
        const hasResults = await page.evaluate(() => {
            // JustDial shows "No results found" message
            const noResults = document.body.textContent.includes('No results found') ||
                document.body.textContent.includes('Sorry');
            return !noResults;
        });

        if (!hasResults) {
            console.log('[JUSTDIAL] No results found');
            await browser.close();
            return {
                success: true,
                found: false,
                data: getDefaultData()
            };
        }

        // Extract business data from first result
        const businessData = await page.evaluate(() => {
            const data = {
                hasListing: false,
                phone: null,
                address: null,
                rating: null,
                reviewCount: 0,
                hasPhotos: false,
                verified: false
            };

            try {
                // Try to find first listing with more broad selectors
                const firstListing = document.querySelector('#bcard0') ||
                    document.querySelector('.cntanr') ||
                    document.querySelector('.store-details') ||
                    document.querySelector('.jspL') ||
                    document.querySelector('li.cntanr') ||
                    document.querySelector('.ResultList_cont_box') ||
                    document.querySelector('[class*="listing"]');

                if (!firstListing) {
                    return data;
                }

                data.hasListing = true;

                // Extract phone
                // Look for common phone patterns or icons
                const phoneElement = firstListing.querySelector('.mobilesv') ||
                    firstListing.querySelector('.callcontent') ||
                    firstListing.querySelector('[href^="tel:"]');
                if (phoneElement) {
                    const phoneText = phoneElement.textContent || phoneElement.href;
                    data.phone = phoneText.replace(/[^0-9]/g, '').slice(0, 10);
                }

                // Extract address
                const addressElement = firstListing.querySelector('.cont_fl_addr') ||
                    firstListing.querySelector('.address-info');
                if (addressElement) {
                    data.address = addressElement.textContent.trim();
                }

                // Extract rating
                // JustDial often uses .green-box for rating
                const ratingElement = firstListing.querySelector('.green-box') ||
                    firstListing.querySelector('.total-rating') ||
                    firstListing.querySelector('.star_m') ||
                    firstListing.querySelector('[class*="rating"]') ||
                    firstListing.querySelector('.star-rating');

                if (ratingElement) {
                    const ratingText = ratingElement.textContent.trim();
                    console.log(`[JUSTDIAL DEBUG] Rating element found: "${ratingText.substring(0, 50)}"`);
                    const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
                    if (ratingMatch) {
                        data.rating = parseFloat(ratingMatch[1]);
                    } else {
                        console.log('[JUSTDIAL DEBUG] Rating regex failed on: ' + ratingText.substring(0, 50));
                    }
                } else {
                    console.log('[JUSTDIAL DEBUG] Rating element not found. Listing HTML snippet:');
                    if (firstListing && firstListing.innerHTML) {
                        data.debugHtml = firstListing.innerHTML.substring(0, 1000);
                        console.log(firstListing.innerHTML.substring(0, 500));
                    }
                }

                // Extract review count
                // Usually roughly "123 Votes" or similar
                const reviewElement = firstListing.querySelector('.rt_count') ||
                    firstListing.querySelector('.lng_vote') ||
                    firstListing.querySelector('.votes') ||
                    firstListing.querySelector('[class*="review"]') ||
                    firstListing.querySelector('.rating-count');

                if (reviewElement) {
                    const reviewText = reviewElement.textContent.trim();
                    const reviewMatch = reviewText.match(/(\d+)/);
                    if (reviewMatch) {
                        data.reviewCount = parseInt(reviewMatch[1]);
                    }
                }

                // Check for photos
                const photoElements = firstListing.querySelectorAll('img[src*="jdmagicbox"]') ||
                    firstListing.querySelectorAll('[class*="photo"]');
                data.hasPhotos = photoElements.length > 0;

                // Check if verified
                const verifiedBadge = firstListing.querySelector('[class*="verified"]') ||
                    firstListing.querySelector('.jd-badge');
                data.verified = !!verifiedBadge;

            } catch (error) {
                console.error('Error parsing JustDial data:', error);
            }

            return data;
        });

        console.log(`[JUSTDIAL] ✓ Found: ${businessData.hasListing ? 'Yes' : 'No'}`);
        if (businessData.hasListing) {
            console.log(`[JUSTDIAL]   Phone: ${businessData.phone ? 'Yes' : 'No'}`);
            console.log(`[JUSTDIAL]   Rating: ${businessData.rating || 'N/A'}`);
            console.log(`[JUSTDIAL]   Reviews: ${businessData.reviewCount || 0}`);
        }

        await browser.close();

        return {
            success: true,
            found: businessData.hasListing,
            data: businessData
        };

    } catch (error) {
        console.error(`[JUSTDIAL ERROR] ${error.message}`);

        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('[JUSTDIAL] Error closing browser:', closeError.message);
            }
        }

        return {
            success: false,
            found: false,
            error: 'SCRAPING_FAILED',
            message: 'Could not scrape JustDial',
            data: getDefaultData()
        };
    }
}

/**
 * Get default data structure
 */
function getDefaultData() {
    return {
        hasListing: false,
        phone: null,
        address: null,
        rating: null,
        reviewCount: 0,
        hasPhotos: false,
        verified: false
    };
}

module.exports = {
    scrapeJustDial,
    getDefaultData
};
