# 🚀 Is My Business Online? - Lead Generation Tool

A powerful lead magnet tool that analyzes local businesses' online presence and generates a **Digital Health Score** to convert prospects into agency clients.

![Lead Gen Tool](https://img.shields.io/badge/Status-Ready-green)
![Node.js](https://img.shields.io/badge/Node.js-18+-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎯 What Does This Do?

Shop owners enter their business name and location. The tool:
1. ✅ Scrapes **Google Maps**, **JustDial**, and **Facebook**
2. 📊 Generates a 0-100 **Digital Health Score**
3. 📋 Shows specific gaps (missing website, no reviews, incorrect hours, etc.)
4. 💰 Presents clear upsell: **"We can fix this for ₹5,000"**

**Result:** Warm leads who understand they need your agency's help!

---

## 📸 Preview

The tool features:
- 🎨 **Premium glassmorphism UI** with dark mode
- 🌈 **Vibrant gradients** and smooth animations
- 📱 **Fully responsive** mobile design
- ⚡ **Real-time analysis** with loading animations
- 🎯 **Conversion-optimized** CTA and booking flow

---

## 🛠️ Tech Stack

**Frontend:**
- Pure HTML, CSS, JavaScript (no framework needed!)
- Google Fonts: Inter + Outfit
- Glassmorphism effects
- Smooth animations

**Backend:**
- Node.js + Express
- Google Places API
- Web scraping (Axios + Cheerio)
- Rate limiting (10 requests/hour per IP)

---

## 📦 Installation & Setup

### Step 1: Install Dependencies

```bash
cd server
npm install
```

### Step 2: Get Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Places API**
4. Go to **Credentials** → Create **API Key**
5. Copy your API key

### Step 3: Configure Environment

```bash
# In the server directory
cp .env.example .env
```

Edit `.env` and add your API key:
```env
GOOGLE_PLACES_API_KEY=YOUR_ACTUAL_API_KEY_HERE
PORT=3000
NODE_ENV=development
```

### Step 4: Start the Backend

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║  Lead Gen Tool Backend Server                         ║
║  Status: Running ✓                                    ║
║  Port: 3000                                           ║
║  Environment: development                             ║
║  API Key: Configured ✓                                ║
╚═══════════════════════════════════════════════════════╝
```

### Step 5: Open the Frontend

Simply open `index.html` in your browser:

```bash
# From the project root directory
cd ..
start index.html   # Windows
# or
open index.html    # Mac
```

---

## 🎮 How to Use

1. **Enter business details:**
   - Business name (e.g., "Sharma Medical Store")
   - Area/City (e.g., "Connaught Place, Delhi")

2. **Click "Check My Digital Score"**

3. **Wait 5-10 seconds** for analysis

4. **See the results:**
   - Overall score (0-100)
   - Detailed breakdown for each platform
   - Specific issues highlighted

5. **Conversion:** Click "Book a Free Consultation"

---

## 📊 Scoring Algorithm

| Platform | Max Points | Criteria |
|----------|------------|----------|
| **Google Maps** | 40 | Listing exists, website link, business hours, photos (5+), reviews (10+), rating (>4.0) |
| **JustDial** | 25 | Listing exists, complete contact info, customer reviews |
| **Facebook** | 25 | Page exists, followers (100+), recent activity, verified badge |
| **Website** | 10 | Website exists, mobile-friendly |
| **TOTAL** | **100** | |

### Score Interpretation:
- **0-39:** 🔴 Urgent attention needed
- **40-69:** 🟡 Room for improvement  
- **70-100:** 🟢 Good (but not perfect)

---

## 🔌 API Endpoints

### `POST /api/analyze-business`

Analyze a business's online presence.

**Request:**
```json
{
  "businessName": "Sharma Medical Store",
  "area": "Connaught Place, Delhi"
}
```

**Response:**
```json
{
  "totalScore": 42,
  "google": {
    "score": 15,
    "maxScore": 40,
    "details": [...]
  },
  "justdial": { ... },
  "facebook": { ... },
  "website": { ... },
  "businessName": "Sharma Medical Store",
  "area": "Connaught Place, Delhi",
  "analyzedAt": "2026-02-05T17:00:00.000Z"
}
```

### `POST /api/book-call`

Submit a consultation booking.

**Request:**
```json
{
  "name": "John Doe",
  "phone": "+91 98765 43210",
  "email": "john@example.com",
  "businessName": "Sharma Medical Store",
  "area": "Connaught Place, Delhi"
}
```

---

## 🚀 Deployment Options

### Option 1: Simple Hosting (Frontend Only)
- Upload `index.html`, `styles.css`, `app.js` to any static host
- Use demo data mode (already implemented in JavaScript)
- **Pros:** Free, instant
- **Cons:** No real data

### Option 2: Full Stack (Recommended)
**Backend:** Deploy to Heroku, Railway, or Render
**Frontend:** Netlify, Vercel, or GitHub Pages
- Update API URL in `app.js` to your backend URL

### Option 3: VPS (DigitalOcean, AWS, etc.)
- Full control
- Can run both frontend and backend on same server

---

## 💡 Customization Ideas

1. **Add more platforms:** Instagram, LinkedIn, Yelp
2. **Tiered pricing:** Different packages based on score
3. **Email reports:** Send PDF reports to customers
4. **Lead magnets:** Offer free downloadable guides
5. **A/B testing:** Test different pricing/CTAs
6. **Analytics:** Track conversion rates

---

## 🔐 Security Notes

- ✅ Rate limiting enabled (10 requests/hour per IP)
- ✅ Input validation on all endpoints
- ✅ CORS configured
- ⚠️ **Important:** Don't commit `.env` file to Git!
- ⚠️ **Important:** Restrict your Google API key in production

---

## 📈 Next Steps

1. **Get your Google Places API key** (required for real data)
2. **Test with real businesses** in your area
3. **Customize the pricing** and offer details
4. **Set up booking notifications** (email/SMS)
5. **Add to your website** with a prominent CTA
6. **Track conversions** and optimize

---

## 🐛 Troubleshooting

**Issue:** "API Key not configured"
- **Fix:** Make sure `.env` file exists with valid `GOOGLE_PLACES_API_KEY`

**Issue:** Frontend can't connect to backend
- **Fix:** Check backend is running on port 3000
- **Fix:** Update `API_URL` in `app.js` if using different port

**Issue:** Getting 429 (Too Many Requests)
- **Fix:** You've hit the rate limit. Wait 1 hour or increase limit in `server.js`

**Issue:** No results found
- **Fix:** Try more specific business name + area
- **Fix:** Check Google Places API quota

---

## 📝 License

MIT License - feel free to use this for your agency!

---

## 🎉 Pro Tips

1. **Share on social media:** "Check if YOUR business is visible online!"
2. **Add urgency:** "First 10 businesses get 50% off"
3. **Follow up fast:** Call leads within 24 hours
4. **Show before/after:** Create case studies
5. **Upsell services:** SEO, social media management, PPC

---

**Built with ❤️ for local service agencies**

Need help? Have questions? Found a bug? Open an issue!
