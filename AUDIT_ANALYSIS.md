# Audit Functionality - Root Cause Analysis

## 🔴 CRITICAL ISSUE: Navigation Timeout in scrapeBusinessByUrl()

### Problem Summary
The audit is **failing with a 30-second navigation timeout** when scraping Google Maps business profiles directly via URL. The error occurs at:
```
[SCRAPER ERROR] Navigation timeout of 30000 ms exceeded
```

---

## 🎯 Root Cause Analysis

### Issue 1: Google Maps No Longer Loads with `domcontentloaded`
**Location:** `server/utils/googleScraper.js` - Line 1554-1559

**Current Code:**
```javascript
await page.goto(placeUrl, {
    waitUntil: 'domcontentloaded',
    timeout: SCRAPER_CONFIG.timeout  // 30 seconds
});
```

**Why It Fails:**
- Google Maps is a **single-page application (SPA)** that requires React/Angular hydration
- The `domcontentloaded` event fires before Maps renders the interactive interface
- The page appears blank/unresponsive while waiting for JavaScript to execute
- The 30-second timeout is **too aggressive** for modern SPA behavior

**Evidence from logs:**
```
[SCRAPER] Place page loaded. Waiting for JavaScript hydration...
[SCRAPER] Warning: Title h1 didn't appear within 5s.
[SCRAPER] Scrolling details panel to load lazy content...
[SCRAPER ERROR] Navigation timeout of 30000 ms exceeded
```

---

### Issue 2: Inadequate Waiting Strategy for Hydration
**Location:** `server/utils/googleScraper.js` - Line 1563-1566

**Current Code:**
```javascript
try {
    await page.waitForSelector('h1', { timeout: 5000 });
} catch (e) {
    console.log('[SCRAPER] Warning: Title h1 didn\'t appear within 5s.');
}
```

**Problems:**
- The code **silently ignores** the 5-second timeout without taking action
- No retry mechanism or fallback when the h1 fails to appear
- The h1 selector might not exist for location-based searches (e.g., "Kolkata, India")
- The code continues assuming success even when hydration failed

---

### Issue 3: Scrolling Before Page Is Ready
**Location:** `server/utils/googleScraper.js` - Line 1571-1595

**Problem:**
- Attempting to scroll the details panel immediately after a failed hydration wait
- If the page hasn't fully rendered, scrolling will:
  - Fail silently
  - Not load lazy content as expected
  - Cause subsequent selectors to fail

---

### Issue 4: Inadequate Error Handling for SPA Navigation
**Location:** `server/utils/googleScraper.js` - Line 1637-1649

**Current Code:**
```javascript
} catch (error) {
    console.error(`[SCRAPER ERROR] ${error.message}`);
    // ... cleanup ...
    return {
        success: false,
        error: 'SCRAPING_FAILED',
        message: 'Could not scrape business data. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
}
```

**Problems:**
- **No retry logic** like in `scrapeGoogleMaps()` which has 3 retry attempts
- Generic error message doesn't distinguish between navigation timeout and extraction failure
- No exponential backoff to handle temporary network issues
- The function fails instantly instead of being resilient

---

## 📊 Comparison: scrapeGoogleMaps() vs scrapeBusinessByUrl()

| Feature | scrapeGoogleMaps() | scrapeBusinessByUrl() |
|---------|-------------------|----------------------|
| Retry Logic | ✅ 3 retries with exponential backoff | ❌ No retries |
| Navigation Strategy | ✅ Search flow (less JS-heavy) | ❌ Direct URL (full SPA load) |
| Hydration Waiting | ✅ `trySelectors()` multiple fallbacks | ❌ Single h1 selector, ignores timeout |
| Network Idle | ✅ Uses `waitForNetworkIdle()` | ❌ Not implemented |
| Scrolling Strategy | ✅ After hydration confirmed | ❌ Immediately after page load |

---

## 🚨 Why URL-Based Audits Fail Most

When a user provides a **direct Google Maps URL** like:
```
https://www.google.com/maps/place/Kolkata,+West+Bengal,+India/@22.5354273,88.3473527...
```

The flow is:
1. ✅ Page navigates to URL (domcontentloaded fires)
2. ❌ JavaScript begins hydrating React components (invisible to Puppeteer)
3. ❌ Google Maps takes **5-10+ seconds** to render the place details
4. ❌ Our h1 wait times out at 5 seconds
5. ❌ Code continues with unhydrated page
6. ❌ Scrolling fails because DOM isn't ready
7. ❌ Data extraction returns empty/null values
8. ❌ After 30s, navigation timeout throws and crashes

---

## ✅ SOLUTIONS

### Solution 1: Use networkidle2 Instead of domcontentloaded
```javascript
await page.goto(placeUrl, {
    waitUntil: 'networkidle2',  // Wait for network to be idle
    timeout: 60000              // 60 seconds for full hydration
});
```

### Solution 2: Implement Proper Hydration Wait
```javascript
// Wait for key indicators of hydration
try {
    await Promise.race([
        page.waitForSelector('h1, h2, [data-local-name]', { timeout: 15000 }),
        page.waitForFunction(() => {
            return document.querySelector('div[role="main"]')?.children.length > 0;
        }, { timeout: 15000 })
    ]);
} catch (e) {
    console.log('[SCRAPER] Warning: Page hydration incomplete');
    // Continue anyway, let extraction handle missing data
}
```

### Solution 3: Wait for Network to Be Idle
```javascript
await page.waitForNetworkIdle({ 
    idleTime: 1000,      // 1 second of no new requests
    timeout: 15000       // Max 15 seconds to wait
}).catch(() => {
    console.log('[SCRAPER] Network idle timeout, continuing...');
});
```

### Solution 4: Add Retry Logic to scrapeBusinessByUrl()
```javascript
async function scrapeBusinessByUrl(placeUrl, attempt = 1) {
    try {
        // ... existing code ...
    } catch (error) {
        if (attempt < 3 && error.message.includes('timeout')) {
            console.log(`[SCRAPER] Retrying in ${attempt * 2}s...`);
            await randomWait(attempt * 2000, 1000);
            return scrapeBusinessByUrl(placeUrl, attempt + 1);
        }
        // ... error handling ...
    }
}
```

### Solution 5: Increase Timeout for URL-Based Scraping
```javascript
const SCRAPER_CONFIG = {
    headless: true,
    timeout: 60000,           // Increased from 30s to 60s
    urlTimeout: 90000,        // Separate, longer timeout for direct URLs
    // ...
};
```

---

## 🔧 Implementation Priority

1. **HIGH (Critical):** Change `domcontentloaded` → `networkidle2` + increase timeout
2. **HIGH (Critical):** Add retry logic to `scrapeBusinessByUrl()`
3. **MEDIUM:** Implement proper network idle waiting
4. **MEDIUM:** Add hydration confirmation before scrolling
5. **LOW:** Increase global timeout config

---

## 📝 Testing Recommendations

After fixes:
1. Test with location-based queries (e.g., "Kolkata, India")
2. Test with business URLs that are slow to load
3. Test with network throttling (simulate poor connection)
4. Monitor timeout distribution in production logs
5. Set up alerts for audit failures > 5% of requests

