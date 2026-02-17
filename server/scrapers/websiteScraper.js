const puppeteer = require('puppeteer');
const { parentPort } = require('worker_threads');

/**
 * Scrape a business website for analysis
 * @param {string} url - The website URL to scrape
 * @returns {Promise<Object>} - Scraped data
 */
async function scrapeWebsite(url) {
    console.log(`[WEBSITE SCRAPER] Starting analysis for: ${url}`);

    if (!url) return { success: false, error: 'NO_URL' };

    // Ensure URL has protocol
    if (!url.startsWith('http')) {
        url = 'http://' + url;
    }

    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        // Set viewport to simulate desktop
        await page.setViewport({ width: 1366, height: 768 });

        // Set user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const startTime = Date.now();

        // Navigate with timeout
        const response = await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        const loadTime = Date.now() - startTime;
        const status = response ? response.status() : 0;
        const finalUrl = page.url();
        const isSecure = finalUrl.startsWith('https://');

        // Extract Data
        const data = await page.evaluate(() => {
            // Helper to get meta content
            const getMeta = (name) => {
                const element = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
                return element ? element.getAttribute('content') : null;
            };

            // 1. Technical
            const viewport = document.querySelector('meta[name="viewport"]');
            const hasViewport = !!viewport;

            // 2. Content / SEO
            const title = document.title;
            const description = getMeta('description') || getMeta('og:description');
            const h1 = document.querySelector('h1')?.innerText;
            const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.innerText).slice(0, 5);

            // Word count (approx)
            const bodyText = document.body.innerText;
            const wordCount = bodyText.split(/\s+/).length;

            // 3. Business Info
            const links = Array.from(document.querySelectorAll('a')).map(a => a.href);

            // Social Links
            const socialPatterns = [
                'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com',
                'youtube.com', 'pinterest.com', 'tiktok.com'
            ];

            const socialLinks = links.filter(link =>
                socialPatterns.some(pattern => link.includes(pattern))
            );

            // Contact Info (Simple regex search in text)
            const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
            const phoneRegex = /(\+?(\d{1,3})?[-. ]?)?(\(?\d{3}\)?[-. ]?)?\d{3}[-. ]?\d{4}/g;

            const emails = bodyText.match(emailRegex) || [];
            const phones = bodyText.match(phoneRegex) || [];

            // Images
            const images = Array.from(document.querySelectorAll('img')).length;
            const imagesWithAlt = Array.from(document.querySelectorAll('img[alt]')).length;

            return {
                hasViewport,
                title,
                description,
                h1,
                h2s,
                wordCount,
                socialLinks: [...new Set(socialLinks)], // Deduplicate
                emails: [...new Set(emails)].slice(0, 3),
                phones: [...new Set(phones)].slice(0, 3),
                imageCount: images,
                imageAltCount: imagesWithAlt
            };
        });

        console.log(`[WEBSITE SCRAPER] Successfully analyzed ${url}`);

        return {
            success: true,
            url: finalUrl,
            status,
            isSecure,
            loadTime,
            data
        };

    } catch (error) {
        console.error(`[WEBSITE SCRAPER] Error: ${error.message}`);
        return {
            success: false,
            error: error.message,
            url: url
        };
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { scrapeWebsite };
