const { calculateHealthScore } = require('../server/utils/scoreCalculator');

console.log('Running Website Analysis Scoring Test...');
console.log('=======================================');

// Mock Data
const basicGoogleData = {
    name: 'Test Biz',
    website: 'https://test.com',
    phone: '1234567890',
    rating: 4.8,
    reviewCount: 600,
    photos: Array(20).fill('photo.jpg')
};

const basicJustdialData = {
    hasListing: true,
    verified: true,
    phone: '1234567890',
    rating: 4.5,
    reviewCount: 250
};

// 1. Excellent Website Data
const excellentWebsiteData = {
    isSecure: true, // +5
    data: {
        hasViewport: true, // +5
        title: 'Best Coffee in Town', // +2
        description: 'We serve the best coffee.', // +2
        h1: 'Welcome to Our Cafe', // +2
        wordCount: 500, // +4 (Total Content: 10)
        socialLinks: ['https://facebook.com/cafe'], // +5
        emails: ['info@cafe.com'], // +5 (Total Business: 10)
    }
    // Total Website: 10 + 10 + 10 = 30
};

// 2. Average Website Data
const averageWebsiteData = {
    isSecure: false, // 0
    data: {
        hasViewport: true, // +5 (Total Tech: 5)
        title: 'Home Page', // +2
        description: null,
        h1: null,
        wordCount: 150, // 0 (Total Content: 2)
        socialLinks: [], // 0
        emails: ['contact@site.com'], // +5 (Total Business: 5)
    }
    // Total Website: 5 + 2 + 5 = 12
};

// 3. Poor/Failed Website Data
const poorWebsiteData = {
    isSecure: false,
    data: null // Analysis failed
    // Total Website: 0 (Fallback might give 0 or partial execution based on logic)
};

function runTest(name, websiteData) {
    console.log(`\nTesting: ${name}`);
    const result = calculateHealthScore(basicGoogleData, basicJustdialData, websiteData);

    console.log(`Total Score: ${result.totalScore}/100`);
    console.log(`Website Score: ${result.breakdown.website.score}/30`);
    console.log('Website Breakdown:');
    result.breakdown.website.details.forEach(d => console.log(`  ${d.text}`));
}

runTest('EXCELLENT WEBSITE (Should be 30/30)', excellentWebsiteData);
runTest('AVERAGE WEBSITE (Should be ~12/30)', averageWebsiteData);
runTest('POOR/FAILED WEBSITE (Should be 0/30)', poorWebsiteData);
