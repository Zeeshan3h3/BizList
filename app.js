// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
    businessName: '',
    area: '',
    analysisResults: null,
    isLoading: false
};

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    // Hero Section
    searchCard: document.getElementById('searchCard'),
    businessNameInput: document.getElementById('businessName'),
    areaInput: document.getElementById('area'),
    checkButton: document.getElementById('checkButton'),
    
    // Loading Section
    loadingSection: document.getElementById('loadingSection'),
    loadingText: document.getElementById('loadingText'),
    progressBar: document.getElementById('progressBar'),
    
    // Results Section
    resultsSection: document.getElementById('resultsSection'),
    scoreNumber: document.getElementById('scoreNumber'),
    scoreProgressCircle: document.getElementById('scoreProgressCircle'),
    scoreTitle: document.getElementById('scoreTitle'),
    scoreDescription: document.getElementById('scoreDescription'),
    
    // Breakdown Cards
    googleScore: document.getElementById('googleScore'),
    googleBreakdown: document.getElementById('googleBreakdown'),
    justdialScore: document.getElementById('justdialScore'),
    justdialBreakdown: document.getElementById('justdialBreakdown'),
    facebookScore: document.getElementById('facebookScore'),
    facebookBreakdown: document.getElementById('facebookBreakdown'),
    websiteScore: document.getElementById('websiteScore'),
    websiteBreakdown: document.getElementById('websiteBreakdown'),
    
    // CTA & Modal
    bookCallButton: document.getElementById('bookCallButton'),
    bookingModal: document.getElementById('bookingModal'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalClose: document.getElementById('modalClose'),
    bookingForm: document.getElementById('bookingForm')
};

// ============================================
// EVENT LISTENERS
// ============================================
elements.checkButton.addEventListener('click', handleAnalysis);
elements.businessNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAnalysis();
});
elements.areaInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAnalysis();
});

elements.bookCallButton.addEventListener('click', openBookingModal);
elements.modalClose.addEventListener('click', closeBookingModal);
elements.modalOverlay.addEventListener('click', closeBookingModal);
elements.bookingForm.addEventListener('submit', handleBookingSubmit);

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================
async function handleAnalysis() {
    const businessName = elements.businessNameInput.value.trim();
    const area = elements.areaInput.value.trim();
    
    // Validation
    if (!businessName || !area) {
        alert('Please enter both business name and area');
        return;
    }
    
    state.businessName = businessName;
    state.area = area;
    
    // Show loading screen
    showLoadingScreen();
    
    try {
        // Simulate loading progress
        await simulateLoadingProgress();
        
        // Call API
        const results = await fetchAnalysisResults(businessName, area);
        
        // Store results
        state.analysisResults = results;
        
        // Show results
        showResults(results);
    } catch (error) {
        console.error('Analysis error:', error);
        alert('Something went wrong. Please try again.');
        hideLoadingScreen();
    }
}

// ============================================
// LOADING SCREEN
// ============================================
function showLoadingScreen() {
    state.isLoading = true;
    elements.searchCard.style.display = 'none';
    elements.loadingSection.classList.remove('hidden');
    elements.resultsSection.classList.add('hidden');
}

function hideLoadingScreen() {
    state.isLoading = false;
    elements.loadingSection.classList.add('hidden');
}

async function simulateLoadingProgress() {
    const steps = [
        { text: 'Searching Google Maps...', duration: 1500, progress: 33 },
        { text: 'Checking JustDial listings...', duration: 1500, progress: 66 },
        { text: 'Analyzing Facebook presence...', duration: 1500, progress: 100 }
    ];
    
    for (const step of steps) {
        elements.loadingText.textContent = step.text;
        elements.progressBar.style.width = `${step.progress}%`;
        await sleep(step.duration);
    }
}

// ============================================
// API CALL
// ============================================
async function fetchAnalysisResults(businessName, area) {
    const API_URL = 'http://localhost:3000/api/analyze-business';
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ businessName, area })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        // If API fails, use demo data for testing
        console.warn('API call failed, using demo data:', error);
        return generateDemoData(businessName, area);
    }
}

// ============================================
// DEMO DATA (for testing without backend)
// ============================================
function generateDemoData(businessName, area) {
    const score = Math.floor(Math.random() * 60) + 20; // Random score 20-80
    
    return {
        totalScore: score,
        google: {
            score: Math.floor(score * 0.4),
            maxScore: 40,
            details: [
                { status: 'success', text: 'Google Maps listing found' },
                { status: 'danger', text: 'No website link provided' },
                { status: 'warning', text: 'Business hours incomplete' },
                { status: 'danger', text: 'Only 2 photos uploaded (need at least 5)' },
                { status: 'warning', text: 'Only 3 reviews (need at least 10)' },
                { status: 'success', text: 'Good rating: 4.2 stars' }
            ]
        },
        justdial: {
            score: Math.floor(score * 0.25),
            maxScore: 25,
            details: [
                { status: 'success', text: 'JustDial listing exists' },
                { status: 'warning', text: 'Contact information incomplete' },
                { status: 'danger', text: 'No customer reviews' }
            ]
        },
        facebook: {
            score: Math.floor(score * 0.25),
            maxScore: 25,
            details: [
                { status: 'danger', text: 'No Facebook business page found' },
                { status: 'danger', text: 'Missing social media presence' }
            ]
        },
        website: {
            score: 0,
            maxScore: 10,
            details: [
                { status: 'danger', text: 'No website detected' },
                { status: 'danger', text: 'Not mobile-friendly' }
            ]
        },
        businessName,
        area
    };
}

// ============================================
// DISPLAY RESULTS
// ============================================
function showResults(results) {
    hideLoadingScreen();
    elements.resultsSection.classList.remove('hidden');
    
    // Animate scroll to results
    setTimeout(() => {
        elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }, 300);
    
    // Display total score
    displayScore(results.totalScore);
    
    // Display breakdowns
    displayBreakdown(elements.googleScore, elements.googleBreakdown, results.google);
    displayBreakdown(elements.justdialScore, elements.justdialBreakdown, results.justdial);
    displayBreakdown(elements.facebookScore, elements.facebookBreakdown, results.facebook);
    displayBreakdown(elements.websiteScore, elements.websiteBreakdown, results.website);
}

function displayScore(score) {
    // Animate score number
    animateNumber(elements.scoreNumber, 0, score, 2000);
    
    // Animate circular progress
    const circumference = 2 * Math.PI * 90; // radius = 90
    const offset = circumference - (score / 100) * circumference;
    
    // Add gradient definition for SVG
    const svg = elements.scoreProgressCircle.closest('svg');
    if (!svg.querySelector('#scoreGradient')) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
        `;
        svg.insertBefore(defs, svg.firstChild);
    }
    
    setTimeout(() => {
        elements.scoreProgressCircle.style.strokeDashoffset = offset;
    }, 500);
    
    // Update message based on score
    if (score < 40) {
        elements.scoreTitle.textContent = 'Your Business Needs Urgent Attention! ⚠️';
        elements.scoreDescription.textContent = 'Most customers can\'t find you online. You\'re losing sales every day.';
    } else if (score < 70) {
        elements.scoreTitle.textContent = 'Room for Improvement 📈';
        elements.scoreDescription.textContent = 'You have a presence, but major gaps are costing you customers.';
    } else {
        elements.scoreTitle.textContent = 'Good Start, But Not Perfect 👍';
        elements.scoreDescription.textContent = 'You\'re doing well, but small improvements can bring more customers.';
    }
}

function displayBreakdown(scoreElement, listElement, data) {
    // Update score
    scoreElement.textContent = `${data.score}/${data.maxScore}`;
    
    // Clear loading state
    listElement.innerHTML = '';
    
    // Add details
    data.details.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = item.status;
        li.textContent = item.text;
        li.style.animationDelay = `${index * 0.1}s`;
        listElement.appendChild(li);
    });
}

// ============================================
// BOOKING MODAL
// ============================================
function openBookingModal() {
    elements.bookingModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
    elements.bookingModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function handleBookingSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const phone = document.getElementById('contactPhone').value;
    const email = document.getElementById('contactEmail').value;
    
    // In a real app, send this to your CRM or email service
    console.log('Booking submitted:', { name, phone, email, businessName: state.businessName, area: state.area });
    
    // Show success message
    alert(`Thank you, ${name}! We'll call you within 24 hours to discuss how we can boost ${state.businessName}'s online presence.`);
    
    // Close modal and reset form
    closeBookingModal();
    elements.bookingForm.reset();
    
    // Optional: Send to backend
    sendBookingToBackend({ name, phone, email, businessName: state.businessName, area: state.area });
}

async function sendBookingToBackend(data) {
    try {
        await fetch('http://localhost:3000/api/book-call', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Failed to send booking:', error);
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16); // ~60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Lead Gen Tool initialized');
    
    // Check if there's cached data
    const cachedData = localStorage.getItem('lastAnalysis');
    if (cachedData) {
        try {
            const data = JSON.parse(cachedData);
            // Could auto-populate form or show last results
        } catch (e) {
            console.error('Failed to parse cached data');
        }
    }
});
