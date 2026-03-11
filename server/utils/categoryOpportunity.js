/**
 * Category Opportunity Engine
 * 
 * Maps business categories to opportunity weights for lead scoring.
 * Higher weight = business benefits MORE from website/digital services.
 */

// Category keywords mapped to opportunity tiers
const HIGH_OPPORTUNITY = {
    keywords: [
        'clinic', 'doctor', 'dentist', 'dental', 'physiotherapist', 'physiotherapy',
        'dermatologist', 'eye', 'ortho', 'pediatric', 'hospital', 'medical',
        'coaching', 'tuition', 'academy', 'institute', 'training', 'education',
        'classes', 'tutorial', 'school', 'learning'
    ],
    points: 10,
    label: 'High Value — Appointment-based service'
};

const MEDIUM_HIGH_OPPORTUNITY = {
    keywords: [
        'salon', 'spa', 'beauty', 'parlour', 'parlor', 'hair',
        'gym', 'fitness', 'yoga', 'pilates', 'crossfit',
        'restaurant', 'cafe', 'bakery', 'catering',
        'lawyer', 'advocate', 'attorney', 'legal', 'consultant',
        'chartered accountant', 'ca firm', 'tax', 'audit firm'
    ],
    points: 8,
    label: 'Medium-High — Experience-driven business'
};

const MEDIUM_OPPORTUNITY = {
    keywords: [
        'hotel', 'lodge', 'resort', 'homestay', 'guest house',
        'auto', 'car', 'garage', 'mechanic', 'repair',
        'plumber', 'electrician', 'carpenter', 'painter',
        'photography', 'studio', 'event', 'wedding',
        'real estate', 'property', 'broker',
        'pet', 'veterinary', 'vet', 'animal'
    ],
    points: 6,
    label: 'Medium — Service business with digital potential'
};

const LOW_OPPORTUNITY = {
    keywords: [
        'shop', 'store', 'retail', 'mart', 'bazaar',
        'laundry', 'dry clean', 'tailor', 'alteration',
        'pharmacy', 'chemist', 'medical store',
        'courier', 'logistics', 'transport'
    ],
    points: 4,
    label: 'Low — Retail/commodity business'
};

const MINIMAL_OPPORTUNITY = {
    keywords: [
        'hardware', 'grocery', 'kirana', 'paan',
        'stationery', 'tyre', 'tire', 'scrap', 'junk',
        'vendor', 'hawker', 'street food', 'dhaba'
    ],
    points: 2,
    label: 'Minimal — Walk-in oriented business'
};

function getCategoryOpportunity(categoryName = '') {
    const category = (categoryName || '').toLowerCase();

    if (!category) {
        return { points: 4, label: 'Unknown Category', tier: 'unknown' };
    }

    if (HIGH_OPPORTUNITY.keywords.some(kw => category.includes(kw))) {
        return { points: HIGH_OPPORTUNITY.points, label: HIGH_OPPORTUNITY.label, tier: 'high' };
    }
    if (MEDIUM_HIGH_OPPORTUNITY.keywords.some(kw => category.includes(kw))) {
        return { points: MEDIUM_HIGH_OPPORTUNITY.points, label: MEDIUM_HIGH_OPPORTUNITY.label, tier: 'medium_high' };
    }
    if (MEDIUM_OPPORTUNITY.keywords.some(kw => category.includes(kw))) {
        return { points: MEDIUM_OPPORTUNITY.points, label: MEDIUM_OPPORTUNITY.label, tier: 'medium' };
    }
    if (LOW_OPPORTUNITY.keywords.some(kw => category.includes(kw))) {
        return { points: LOW_OPPORTUNITY.points, label: LOW_OPPORTUNITY.label, tier: 'low' };
    }
    if (MINIMAL_OPPORTUNITY.keywords.some(kw => category.includes(kw))) {
        return { points: MINIMAL_OPPORTUNITY.points, label: MINIMAL_OPPORTUNITY.label, tier: 'minimal' };
    }

    // Default: moderate opportunity for unrecognized categories
    return { points: 5, label: 'General Business', tier: 'general' };
}

module.exports = { getCategoryOpportunity };
