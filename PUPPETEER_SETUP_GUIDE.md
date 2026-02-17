# 🎓 BizCheck - Puppeteer Scraper Setup Guide
### Created for Zeeshan (Jadavpur University) by Your MERN Stack Mentor

---

## 📚 What We Built

Congratulations Zeeshan! You now have a production-ready Puppeteer-based scraping system. Here's what we created:

### 1️⃣ **Google Maps Scraper** (`utils/googleScraper.js`)
- 🤖 Headless browser automation using Puppeteer
- 🔍 Extracts: Name, Rating, Reviews, Website, Phone, Address, Photos
- 📝 Detailed comments explaining DOM selectors
- 🐛 Built-in debugging with screenshots

### 2️⃣ **Anti-Ban Queue System** (`utils/queueManager.js`)
- ⏱️ Rate limiting: 1 scrape every 12 seconds
- 📊 Queue statistics tracking
- 🚦 FIFO (First In, First Out) processing
- 🛡️ Anti-DOS protection (max 20 in queue)

### 3️⃣ **Audit Controller** (`controllers/auditController.js`)
- 🎯 Main API endpoint handler
- ✅ Input validation
- 🚨 Comprehensive error handling
- 💡 **TODO comments for you to complete scoring logic**

### 4️⃣ **Updated Server** (`server.js`)
- 🔄 New `/api/audit` endpoint
- 📊 Queue monitoring at `/api/audit/queue-status`
- ⚡ Backward compatible with old endpoint

---

## 🚀 Installation & Setup

### Step 1: Install Dependencies

The dependencies are already installing! Wait for `npm install` to complete.

**New packages added:**
- `puppeteer` - Headless browser for web scraping
- `p-queue` - Promise-based queue for rate limiting

### Step 2: Create Screenshots Folder (Optional)

```bash
mkdir screenshots
```

This folder will store debug screenshots when `NODE_ENV=development`.

### Step 3: Restart Your Server

**First, stop the old server:**
- Find the terminal running `node server.js`
- Press `Ctrl + C`

**Then start the new one:**
```bash
cd "c:\ROAD TO !L\Agency\lead-gen-tool\server"
node server.js
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║  BizCheck API Server (Puppeteer Mode)                 ║
║  Status: Running ✓                                    ║
║  Port: 3000                                           ║
║  Scraping: Google Maps (Puppeteer)                    ║
║  Queue: Active (12s interval)                         ║
╚═══════════════════════════════════════════════════════╝
```

---

## 🧪 Testing Your Scraper

### Test 1: Direct Scraper Test

Test the scraper directly (no queue):

```bash
cd utils
node googleScraper.js
```

This will scrape "Dominos Pizza" in "Connaught Place, Delhi" and show results.

### Test 2: API Test with Postman/Thunder Client

**Endpoint:** `POST http://localhost:3000/api/audit`

**Body (JSON):**
```json
{
  "businessName": "Dominos Pizza",
  "area": "Connaught Place, Delhi"
}
```

**Expected Response:**
```json
{
  "success": true,
  "businessName": "Domino's Pizza",
  "area": "Connaught Place, Delhi",
  "scrapedAt": "2026-02-05T...",
  "healthScore": {
    "totalScore": 0,
    "breakdown": {},
    "rawData": {
      "name": "Domino's Pizza",
      "rating": 4.2,
      "reviewCount": 150,
      "website": "https://dominos.co.in",
      "phone": "+91-11-12345678",
      ...
    }
  }
}
```

### Test 3: Queue Status Check

**Endpoint:** `GET http://localhost:3000/api/audit/queue-status`

This shows how many scrapes are pending.

---

## 📝 YOUR HOMEWORK: Implement Scoring Logic

### Task: Create `utils/scoreCalculator.js`

**Location:** `server/utils/scoreCalculator.js`

**Requirements:**

Calculate a health score (0-100) based on:

| Factor | Points | Logic |
|--------|--------|-------|
| Website exists | 20 | `data.website ? 20 : 0` |
| Phone number | 15 | `data.phone ? 15 : 0` |
| Good rating (4.0+) | 30 | `data.rating >= 4.0 ? 30 : (data.rating * 7.5)` |
| Many reviews (50+) | 20 | `data.reviewCount >= 50 ? 20 : (data.reviewCount / 2.5)` |
| Has photos (3+) | 15 | `data.photos.length >= 3 ? 15 : (data.photos.length * 5)` |

**Template to get you started:**

```javascript
function calculateHealthScore(rawData) {
    let totalScore = 0;
    const breakdown = {};
    
    // TODO: Implement logic above
    
    return {
        totalScore,
        breakdown
    };
}

module.exports = { calculateHealthScore };
```

**Then import it in `auditController.js`:**

```javascript
const { calculateHealthScore } = require('../utils/scoreCalculator');

// Replace the TODO section with:
const healthScore = calculateHealthScore(rawData);
```

---

## 🛡️ Important Anti-Ban Tips

### DO ✅
1. **Respect the 12-second delay** - Don't change it to faster
2. **Use real business names** - Avoid testing with gibberish
3. **Test during off-peak hours** - Google is more lenient at night
4. **Rotate user agents** - Already implemented
5. **Handle CAPTCHAs gracefully** - Return "try again later" message

### DON'T ❌
1. **Don't scrape 100 times in a row** - Use demo data for testing
2. **Don't deploy without understanding** - Read all the comments first
3. **Don't ignore errors** - Log them and learn from them
4. **Don't remove the queue** - It's your ban protection
5. **Don't use in production at scale** - This is for learning/MVP only

---

## 🐛 Debugging Guide

### If Selectors Break (Google Maps changed layout):

1. **Open Chrome DevTools:**
   - Go to Google Maps
   - Search for a business
   - Press `F12` or Right-click → Inspect

2. **Find the new selector:**
   - Right-click on business name → Inspect
   - Look at the HTML element
   - Find a unique attribute (`aria-label`, `data-*`, etc.)

3. **Update `googleScraper.js`:**
   - Find the relevant `querySelector` line
   - Update the selector
   - Test with `node googleScraper.js`

### If Puppeteer Fails to Launch:

**Error:** "Failed to launch browser"

**Solution:**
```bash
# Reinstall Puppeteer
npm uninstall puppeteer
npm install puppeteer --save
```

**Error:** "Could not find Chrome"

**Solution:**
Set `executablePath` in `googleScraper.js`:
```javascript
const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
});
```

### If Queue Gets Stuck:

Check queue status:
```bash
curl http://localhost:3000/api/audit/queue-status
```

Clear queue (in Node REPL):
```javascript
const { clearQueue } = require('./utils/queueManager');
clearQueue();
```

---

## 📊 Monitoring Your System

### Queue Statistics

Visit: `http://localhost:3000/api/audit/queue-status`

**Metrics you'll see:**
- `totalProcessed` - Total scrapes completed
- `totalFailed` - Total failures
- `currentQueueSize` - People waiting
- `lastScrapeTime` - When last scrape happened

### Performance Tips

- **If queue > 10:** Consider adding more delay or scaling
- **If many failures:** Check Google Maps selectors
- **If slow:** Optimize Puppeteer settings (remove screenshots, use `--no-sandbox`)

---

## 🎯 Next Steps (Learning Path)

### Week 1: Understanding
- ✅ Read all code comments
- ✅ Test the scraper manually
- ✅ Understand the queue system

### Week 2: Implementation
- [ ] Create `scoreCalculator.js`
- [ ] Integrate scoring into controller
- [ ] Test with 10 different businesses

### Week 3: Enhancement
- [ ] Add IP-based rate limiting per user
- [ ] Cache results for 24 hours (use Redis or simple object)
- [ ] Add error logging to a file

### Week 4: Production Ready
- [ ] Add retry logic for failed scrapes
- [ ] Implement CAPTCHA detection
- [ ] Create admin dashboard for queue monitoring

---

## 🚨 When to Use API vs Scraping

### Use Scraping (What you built) ✅
- Learning projects
- MVP / Proof of concept
- < 100 requests per day
- You don't have a credit card

### Use Google Places API ⚡
- Production applications
- > 1000 requests per day
- Need 99.9% reliability
- Can afford $0.017 per request

**Pro Tip:** Start with scraping, migrate to API when you get customers!

---

## 📞 Support & Resources

### If You Get Stuck

1. **Check the comments** - Every file has detailed explanations
2. **Read error messages** - They tell you exactly what's wrong
3. **Test in isolation** - Run `node googleScraper.js` directly
4. **Enable debugging** - Set `headless: false` to watch the browser

### Learning Resources

- **Puppeteer Docs:** https://pptr.dev/
- **p-queue:** https://github.com/sindresorhus/p-queue
- **Web Scraping Ethics:** https://www.scrapehero.com/web-scraping-legal/

---

## 🎓 What You Learned

Congratulations! You now understand:

✅ **Web Scraping** with Puppeteer  
✅ **DOM Manipulation** and CSS selectors  
✅ **Async/Await** patterns in Node.js  
✅ **Queue Systems** and rate limiting  
✅ **Error Handling** in production code  
✅ **API Design** with Express.js  

**Put this on your resume:**
> "Built a web scraping system with Puppeteer, implementing rate-limiting queues and anti-ban mechanisms to extract business data from Google Maps"

---

## 🏆 Final Checklist

Before deploying to production:

- [ ] Implemented `scoreCalculator.js`
- [ ] Tested with 20+ different businesses
- [ ] Added proper logging
- [ ] Created `.env` file with configuration
- [ ] Set `headless: true` in scraper (for deployment)
- [ ] Added IP rate limiting per user
- [ ] Created caching layer for repeat queries
- [ ] Written API documentation
- [ ] Set up error monitoring (Sentry.io)

---

**Good luck, Zeeshan! You're on your way to becoming a MERN Stack expert! 🚀**

**Questions? Review the comments in the code - I left detailed explanations everywhere for you.**

---

*Last Updated: Feb 5, 2026*  
*Created by: Your MERN Stack Mentor*  
*For: Zeeshan, Jadavpur University IT Student*
