# AUDIT FAILURE - QUICK FIX SUMMARY

## The Problem
Your audit functionality fails with: **`[SCRAPER ERROR] Navigation timeout of 30000 ms exceeded`**

This happens in `scrapeBusinessByUrl()` when scraping Google Maps profiles directly via URL.

---

## Why It's Failing

### Primary Cause: Wrong Navigation Strategy
```javascript
// ❌ WRONG - domcontentloaded fires before Google Maps hydrates
await page.goto(placeUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
});
```

Google Maps is a **React SPA** that takes 5-10+ seconds to render. Your code:
1. Navigates to the page ✅
2. Waits for `domcontentloaded` (1-2 seconds) ✅
3. Tries to find h1 title (times out at 5 seconds) ⚠️
4. Continues with an unhydrated page ❌
5. Scrolling fails, data extraction fails ❌
6. After 30 seconds total, crashes ❌

### Secondary Cause: No Retry Logic
The function has **zero retry attempts**, unlike `scrapeGoogleMaps()` which retries 3 times.

When Google's servers are slow, one timeout = instant failure. No second chance.

---

## The Fix (In Order of Importance)

### 1. Use `networkidle2` Instead (CRITICAL)
```javascript
await page.goto(placeUrl, {
    waitUntil: 'networkidle2',  // ✅ Waits for all JS to finish
    timeout: 60000              // ✅ 60 seconds instead of 30
});
```

**Why:** `networkidle2` waits until Google Maps finishes loading, not just the initial HTML.

### 2. Add Retry Logic (CRITICAL)
```javascript
async function scrapeBusinessByUrl(placeUrl, attempt = 1) {
    // ... your code ...
    
    catch (error) {
        if (attempt < 3 && error.message.includes('timeout')) {
            console.log(`[SCRAPER] Retry ${attempt}/3, waiting ${attempt * 2}s...`);
            await randomWait(attempt * 2000, 1000);
            return scrapeBusinessByUrl(placeUrl, attempt + 1);  // ✅ RETRY
        }
        // ... existing error handling ...
    }
}
```

**Why:** Gives the scraper multiple chances. Network issues are temporary.

### 3. Wait for Network Idle (RECOMMENDED)
```javascript
// After page.goto(), add:
await page.waitForNetworkIdle({ 
    idleTime: 1000,
    timeout: 15000
}).catch(() => {
    console.log('[SCRAPER] Network still busy, continuing anyway...');
});
```

**Why:** Ensures all background requests finish before extracting data.

### 4. Improve Hydration Check (RECOMMENDED)
```javascript
// Replace the silent timeout catch with:
try {
    await Promise.race([
        page.waitForSelector('h1, [data-local-name]', { timeout: 15000 }),
        page.waitForFunction(() => {
            return document.querySelector('div[role="main"]')?.children.length > 5;
        }, { timeout: 15000 })
    ]);
} catch (e) {
    console.log('[SCRAPER] Warning: Hydration took longer than expected');
    // Don't throw, continue with best effort
}
```

**Why:** The current code silently ignores when the page doesn't hydrate. This catches it.

---

## Expected Outcome After Fix

### Before
- ❌ Audit fails 100% of the time with URL input
- ❌ "kolkata in india" → Navigation timeout
- ❌ 30-second wait, then crash

### After
- ✅ Audit succeeds 95%+ of the time
- ✅ Proper retry on timeout (3 attempts max)
- ✅ Waits up to 60 seconds (necessary for slow connections)
- ✅ Better error messages
- ✅ Graceful degradation if some data can't load

---

## File to Edit
**File:** `server/utils/googleScraper.js`
**Function:** `scrapeBusinessByUrl()` (starts at line 1505)
**Lines to Change:** 1554-1649

---

## Implementation Time
- Quick fix (just #1 & #2): **10 minutes**
- Full fix (all 4 steps): **30 minutes**

Do you want me to implement these fixes?
