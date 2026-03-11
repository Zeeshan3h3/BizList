/**
 * Brand Intelligence Engine (Enhanced for Lead Scoring)
 * 
 * Analyzes scraped business data to determine if a brand is an independent 
 * local business, a multi-outlet regional player, or a massive enterprise.
 * 
 * Now includes:
 * - Expanded franchise/chain keyword detection
 * - Chain detection from competitors data
 * - Numeric brandPenalty for lead scoring
 */

// Known big brand names — auto-exclude from lead generation
const KNOWN_BRANDS = [
    // Global Food Chains
    'starbucks', 'mcdonalds', 'mcdonald', 'dominos', 'domino', 'kfc',
    'burger king', 'subway', 'pizza hut', 'papa johns', 'dunkin',
    'baskin robbins', 'costa coffee', 'tim hortons', 'wendy',
    // Indian Chains
    'haldirams', 'haldiram', 'bikanervala', 'sagar ratna', 'saravana bhavan',
    'chai point', 'chaayos', 'wow momo', 'faasos', 'behrouz',
    // Healthcare Chains
    'apollo', 'fortis', 'max healthcare', 'medanta', 'manipal hospital',
    'narayana health', 'aster', 'columbia asia',
    // Retail / Enterprise
    'reliance', 'tata', 'birla', 'adani', 'hdfc', 'icici',
    'big bazaar', 'dmart', 'd-mart', 'more supermarket',
    'croma', 'vijay sales', 'poorvika',
    // Fitness/Beauty Chains
    'gold gym', 'anytime fitness', 'cult fit', 'cultfit',
    'lakme salon', 'jawed habib', 'naturals salon', 'vlcc',
    // Education Chains
    'byju', 'unacademy', 'allen', 'aakash', 'fiitjee',
    // Automotive
    'maruti', 'hyundai', 'toyota', 'honda', 'mahindra'
];

// Corporate suffixes
const CORPORATE_KEYWORDS = [
    ' ltd', ' pvt', ' group', ' corporation', ' inc', ' llc', ' holdings',
    ' international', ' enterprises', ' industries', ' solutions',
    ' technologies', ' global', ' worldwide'
];

function analyzeBrand(scrapedData) {
    const { businessName = '', website = '', reviewCount = 0, socialLinks = {}, rating = 0, competitors = [] } = scrapedData;

    let enterpriseConfidence = 0;
    let multiOutletConfidence = 0;
    let independentConfidence = 0;
    const signals = [];
    let brandPenalty = 0;

    const nameLower = (businessName || '').toLowerCase().trim();
    const websiteLower = (website || '').toLowerCase();

    // ═══════════════════════════════════════════
    // LAYER 1: Known Brand Name Detection
    // ═══════════════════════════════════════════
    const isKnownBrand = KNOWN_BRANDS.some(brand => nameLower.includes(brand));
    if (isKnownBrand) {
        enterpriseConfidence += 50;
        brandPenalty -= 40;
        signals.push(`Known brand detected: "${businessName}"`);
    }

    // ═══════════════════════════════════════════
    // LAYER 2: Corporate Keyword Detection
    // ═══════════════════════════════════════════
    if (CORPORATE_KEYWORDS.some(keyword => nameLower.includes(keyword))) {
        enterpriseConfidence += 15;
        brandPenalty -= 10;
        signals.push('Business name contains corporate entity markers');
    }

    // ═══════════════════════════════════════════
    // LAYER 3: Chain Detection from Competitors
    // ═══════════════════════════════════════════
    if (competitors && competitors.length > 0) {
        const sameNameCount = competitors.filter(c =>
            (c.name || '').toLowerCase().trim() === nameLower
        ).length;

        if (sameNameCount >= 3) {
            enterpriseConfidence += 25;
            brandPenalty -= 30;
            signals.push(`Chain detected: ${sameNameCount} locations with same name in search results`);
        } else if (sameNameCount >= 2) {
            multiOutletConfidence += 15;
            brandPenalty -= 15;
            signals.push(`Multi-outlet detected: ${sameNameCount} same-name locations`);
        }
    }

    // ═══════════════════════════════════════════
    // LAYER 4: Domain Pattern Analysis
    // ═══════════════════════════════════════════
    if (websiteLower) {
        try {
            const url = new URL(websiteLower.startsWith('http') ? websiteLower : `https://${websiteLower}`);
            const hostname = url.hostname;

            if (hostname.match(/([a-z0-9]+)\.([a-z0-9]+)\.(com|net|org)/) && hostname.split('.')[0] !== 'www') {
                multiOutletConfidence += 10;
                signals.push('Domain uses multi-outlet subdomain structure');
            }

            if (hostname.split('.').length === 2 || (hostname.split('.').length === 3 && hostname.startsWith('www.'))) {
                enterpriseConfidence += 10;
            }

            if (url.pathname.length > 1 && url.pathname.match(/\/(locations|stores|store-locator|city|branch|outlets)\//i)) {
                enterpriseConfidence += 20;
                brandPenalty -= 20;
                signals.push('Domain contains enterprise/franchise location path');
            }
        } catch (e) {
            // Invalid URL, ignore
        }
    }

    // ═══════════════════════════════════════════
    // LAYER 5: Social Handle Pattern Analysis
    // ═══════════════════════════════════════════
    const hasSocials = Object.keys(socialLinks || {}).length > 0;
    if (hasSocials) {
        const allHandles = Object.values(socialLinks).join(' ').toLowerCase();

        if (allHandles.match(/_(newyork|london|chicago|city|local|branch|uk|us|ind)/)) {
            independentConfidence += 15;
            signals.push('Social handles contain local/regional modifiers');
        } else {
            enterpriseConfidence += 15;
            signals.push('Social handles appear to be global/generic root brands');
        }
    }

    // ═══════════════════════════════════════════
    // LAYER 6: Review Volume Scale
    // ═══════════════════════════════════════════
    if (reviewCount > 10000) {
        enterpriseConfidence += 40;
        brandPenalty -= 15;
        signals.push('Massive review volume (>10k) strongly indicates enterprise');
    } else if (reviewCount > 5000) {
        enterpriseConfidence += 25;
        brandPenalty -= 10;
        signals.push('Very high review volume (>5k) indicates enterprise/major brand');
    } else if (reviewCount > 800) {
        multiOutletConfidence += 20;
        signals.push('Moderate-high review volume indicates established business');
    } else {
        independentConfidence += 20;
        signals.push('Normal review volume aligns with independent business scale');
    }

    // ═══════════════════════════════════════════
    // FINAL CLASSIFICATION
    // ═══════════════════════════════════════════
    let brandType = 'independent';
    let maxConfidence = independentConfidence;

    if (enterpriseConfidence >= 50) {
        brandType = 'enterprise';
        maxConfidence = enterpriseConfidence;
    } else if (multiOutletConfidence >= 40 || enterpriseConfidence >= 30) {
        brandType = 'multi_outlet';
        maxConfidence = Math.max(multiOutletConfidence, enterpriseConfidence);
    } else {
        brandType = 'independent';
        maxConfidence = independentConfidence;
    }

    maxConfidence = Math.min(100, maxConfidence);

    // Clamp penalty: max -40 for known brands, no penalty for independents
    brandPenalty = Math.max(-40, brandPenalty);
    if (brandType === 'independent') brandPenalty = 0;

    return {
        brandType,
        confidence: maxConfidence,
        brandPenalty,
        isExcluded: brandPenalty <= -35, // Auto-exclude known chains
        signals,
        rawScores: {
            enterprise: enterpriseConfidence,
            multiOutlet: multiOutletConfidence,
            independent: independentConfidence
        }
    };
}

module.exports = { analyzeBrand };
