const { scrapeJustDial } = require('../server/scrapers/justdial');

async function testScraper() {
    console.log('Testing JustDial Scraper...');
    const result = await scrapeJustDial('Dominos Pizza', 'Kasba Kolkata');
    console.log('Scrape Result:', JSON.stringify(result, null, 2));
}

testScraper();
