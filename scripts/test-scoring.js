const { calculateHealthScore } = require('../server/utils/scoreCalculator');

console.log('Running STRICT Digital Health Score Calculator Test...');
console.log('==================================================');

// Mock Data
const perfectBusiness = {
    google: {
        name: 'Perfect Business',
        website: 'https://www.perfect.com',
        phone: '1234567890',
        email: 'info@perfect.com',
        instagram: 'perfect_biz',
        rating: 4.8,
        reviewCount: 600,
        photos: Array(20).fill('photo.jpg')
    },
    justdial: {
        hasListing: true,
        verified: true,
        phone: '1234567890',
        rating: 4.5,
        reviewCount: 250
    }
};

const averageBusiness = {
    google: {
        name: 'Average Joe Shop',
        website: 'http://average.com', // No SSL
        phone: '1234567890',
        // Missing email/insta
        rating: 4.2,
        reviewCount: 40, // < 50
        photos: Array(5).fill('photo.jpg') // < 10
    },
    justdial: {
        hasListing: true,
        verified: false, // Not verified
        phone: '1234567890',
        rating: 3.8, // < 4.0
        reviewCount: 5 // < 10
    }
};

const poorBusiness = {
    google: {
        name: 'Ghost Shop',
        // No website
        // No contact
        rating: 0,
        reviewCount: 0,
        photos: []
    },
    justdial: null // No JustDial
};

function runTest(name, googleData, justdialData) {
    console.log(`\nTesting: ${name}`);
    const result = calculateHealthScore(googleData, justdialData);

    console.log(`Total Score: ${result.totalScore}/100`);
    console.log(`Status: ${result.status} - ${result.message}`);

    console.log('Breakdown:');
    console.log(`- Google Maps: ${result.breakdown.googleMaps.score}/50`);
    result.breakdown.googleMaps.details.forEach(d => console.log(`  ${d.text}`));

    console.log(`- JustDial: ${result.breakdown.justdial.score}/20`);
    result.breakdown.justdial.details.forEach(d => console.log(`  ${d.text}`));

    console.log(`- Website: ${result.breakdown.website.score}/30`);
    result.breakdown.website.details.forEach(d => console.log(`  ${d.text}`));
}

runTest('PERFECT BUSINESS (Should be near 100)', perfectBusiness.google, perfectBusiness.justdial);
runTest('AVERAGE BUSINESS (Should be ~40-60)', averageBusiness.google, averageBusiness.justdial);
runTest('POOR BUSINESS (Should be near 0)', poorBusiness.google, poorBusiness.justdial);
