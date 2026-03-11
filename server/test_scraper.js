const { scrapeGoogleMaps } = require('./utils/googleScraper');

async function test() {
    console.log("Starting scraper test...");
    // Test Shimla Biryani
    const res = await scrapeGoogleMaps("Shimla Biryani", "Topsia Kolkatta");
    if (res.data) {
        console.log("Name:", res.data.name);
        console.log("Reviews:", res.data.reviewCount);
        console.log("Recent Reviews:", res.data.recentReviewsCount);
        console.log("Latest Date:", res.data.latestReviewDate);
    } else {
        console.log("Error:", res);
    }
}
test();
