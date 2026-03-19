const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

(async () => {
    try {
        const browser = await puppeteer.launch({
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
        const page = await browser.newPage();

        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('PAGE ERROR LOG:', msg.text());
            }
        });

        page.on('pageerror', error => {
            console.log('PAGE ERROR EXCEPTION:', error.message);
        });

        console.log("Navigating to http://localhost:5173...");
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

        console.log("Navigation complete. Waiting a few seconds...");
        await new Promise(r => setTimeout(r, 2000));

        await browser.close();
        console.log("Check complete.");
    } catch (err) {
        console.error("Script error:", err);
    }
})();
