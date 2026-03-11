// Translates technical scoring terms into human-friendly language for business owners

export const LABEL_MAP = {
    // Tier 1
    claimedProfile: 'Verified Google Business Profile',
    phoneAvailable: 'Phone Number Listed',
    businessHours: 'Business Hours Published',
    categorySet: 'Business Category Properly Set',

    // Tier 2
    rating: 'Customer Rating',
    reviewVolume: 'Customer Reviews',
    ownerResponses: 'Owner Reply Activity',
    photos: 'Photo Presence',

    // Tier 3
    reviewVelocity: 'Recent Customer Activity',
    photoActivity: 'Visual Content Freshness',
    googlePosts: 'Google Business Posts',
    qaActivity: 'Customer Q&A Engagement',

    // Tier 4
    websiteExists: 'Business Website',
    mobileResponsive: 'Mobile-Friendly Website',
    sslSecure: 'Secure Website (HTTPS)',
    loadSpeed: 'Website Loading Speed',
    localSchema: 'Local Business Structure Elements',

    // Tier 5
    clickToCall: 'Click-to-Call Accessibility',
    whatsapp: 'WhatsApp Contact Available',
    bookingSystem: 'Online Booking/Ordering',
    contactForm: 'Website Contact Form',

    // Tier 6
    reviewGap: 'Customer Reviews vs Competitors',
    ratingGap: 'Rating vs Competitors',
    mediaGap: 'Visual Content vs Competitors'
};

export const getFriendlyLabel = (key) => LABEL_MAP[key] || key;
