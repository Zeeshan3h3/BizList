/**
 * ============================================
 * INTELLIGENCE MODULES TEST SUITE
 * ============================================
 * 
 * Tests the 4 new intelligence modules locally.
 */
const { analyzeMarketDemand } = require('../intelligence/localDemandScanner');

const { calculateCompetitorGap } = require('../intelligence/competitorGapEngine');
const { calculateVisibilityRanking } = require('../intelligence/visibilityRadar');
const { predictGrowthPotential } = require('../prediction/growthPotentialPredictor');
const { generateGrowthPlan } = require('../ai/growthPlaybookGenerator');

// --- Simulated Data ---

const sampleBusiness = {
    name: 'Main Street Plumbers',
    reviewCount: 15,
    rating: 3.8,
    photoCount: 2,
    responseRate: 10 // 10%
};

const sampleCompetitors = [
    { name: 'Elite Plumbing', reviewCount: 150, rating: 4.8, photoCount: 45, responseRate: 98 },
    { name: 'City Wide Pipes', reviewCount: 85, rating: 4.5, photoCount: 20, responseRate: 75 },
    { name: 'Joe The Plumber', reviewCount: 5, rating: 3.0, photoCount: 1, responseRate: 0 }
];

console.log('============================================');
console.log('🧪 RUNNING INTELLIGENCE MODULE TESTS');
console.log('============================================\n');

// 1. Test Competitor Gap Engine
console.log('--- 1. Competitor Gap Engine ---');
const gapResult = calculateCompetitorGap(sampleBusiness, sampleCompetitors);
console.log(JSON.stringify(gapResult, null, 2));
console.log('\n');

// 2. Test Visibility Radar
console.log('--- 2. Visibility Radar ---');
const visibilityResult = calculateVisibilityRanking(sampleBusiness, sampleCompetitors);
console.log(JSON.stringify(visibilityResult, null, 2));
console.log('\n');

// 3. Test Growth Potential Predictor
console.log('--- 3. Growth Potential Predictor ---');
const growthResult = predictGrowthPotential(sampleBusiness, gapResult);
console.log(JSON.stringify(growthResult, null, 2));
console.log('\n');

// 4. Test AI Growth Playbook
console.log('--- 4. AI Growth Playbook Generator ---');
const playbookResult = generateGrowthPlan({
    businessScore: 45,
    competitorGap: gapResult,
    websiteQuality: {
        websiteStatus: 'outdated',
        isMobileResponsive: false,
        hasBookingSystem: false
    },
    category: 'Plumber'
});
console.log(JSON.stringify(playbookResult, null, 2));
console.log('\n');

console.log('✅ ALL TESTS COMPLETED');
// 5. Test Local Demand Scanner
console.log('--- 5. Local Demand Scanner ---');
const demandResult = analyzeMarketDemand('Plumber', 'Downtown', sampleCompetitors);
console.log(JSON.stringify(demandResult, null, 2));
console.log('\n');
