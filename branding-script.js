// ============================================
// BUSINESS BRANDING DISPLAY FUNCTION
// Add this function to app.js (after showResults function)
// ============================================

/**
 * Display business branding (logo, photos, verified name)
 * @param {object} branding - Business branding data from API
 * @param {string} businessName - Original business name entered
 * @param {string} area - Area/city location
 */
function displayBusinessBranding(branding, businessName, area) {
    if (!branding) {
        // Use placeholder if no branding data
        document.getElementById('businessNameDisplay').textContent = businessName;
        document.getElementById('businessLocationDisplay').textContent = area;
        document.getElementById('verificationBadge').classList.add('not-found');
        document.getElementById('verificationBadge').innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Not found on Google Maps</span>
        `;
        return;
    }

    // Display verified business name or fallback
    const verifiedName = branding.verifiedName || businessName;
    document.getElementById('businessNameDisplay').textContent = verifiedName;
    document.getElementById('businessLocationDisplay').textContent = area;

    // Display logo
    const logoContainer = document.getElementById('businessLogo');
    if (branding.logo) {
        logoContainer.innerHTML = `<img src="${branding.logo}" alt="${verifiedName} logo" loading="lazy" crossorigin="anonymous">`;
    } else if (branding.icon) {
        logoContainer.innerHTML = `<img src="${branding.icon}" alt="${verifiedName} icon" loading="lazy" crossorigin="anonymous">`;
    }
    // else keep the placeholder SVG

    // Display photo gallery
    const galleryContainer = document.getElementById('businessGallery');
    if (branding.photos && branding.photos.length > 0) {
        galleryContainer.innerHTML = branding.photos.map((photoUrl, index) => `
            <div class="gallery-photo">
                <img src="${photoUrl}" alt="${verifiedName} photo ${index + 1}" loading="lazy" crossorigin="anonymous">
            </div>
        `).join('');
    } else {
        galleryContainer.innerHTML = `
            <div class="gallery-empty">
                No photos available from Google Maps
            </div>
        `;
    }
}

// ============================================
// UPDATE showResults function
// Add this line after hideLoadingScreen() and before displayScore()
// ============================================

/*
function showResults(results) {
    hideLoadingScreen();
    elements.resultsSection.classList.remove('hidden');

    // Animate scroll to results
    setTimeout(() => {
        elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }, 300);

    // >>> ADD THIS LINE <<<
    displayBusinessBranding(results.businessBranding, results.businessName, results.area);

    // Display total score
    displayScore(results.totalScore);

    // ... rest of the function
}
*/

// ============================================
// UPDATE generateDemoData function
// Add businessBranding to the return object
// ============================================

/*
function generateDemoData(businessName, area) {
    const score = Math.floor(Math.random() * 60) + 20;
    
    return {
        totalScore: score,
        google: { ...existing code... },
        justdial: { ...existing code... },
        facebook: { ...existing code... },
        website: { ...existing code... },
        businessName,
        area,
        // >>> ADD THIS <<<
        businessBranding: {
            logo: null, // In demo mode, no logo
            photos: [], // In demo mode, no photos  
            verifiedName: businessName,
            icon: null
        }
    };
}
*/
