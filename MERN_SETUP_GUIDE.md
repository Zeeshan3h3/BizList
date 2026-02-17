# �� MERN Stack BizCheck - Setup Guide

## 🎉 What We Built

**Full MERN Stack Application:**
- ✅ **MongoDB** - Database with Audit & Booking models
- ✅ **Express** - REST API with enhanced controllers
- ✅ **React** - Modern frontend (creating now...)
- ✅ **Node.js** - Backend with Puppeteer scraping

---

## 📂 Project Structure

```
lead-gen-tool/
├── server/                    # Backend (Node.js + Express + MongoDB)
│   ├── config/
│   │   └── database.js       # MongoDB connection
│   ├── models/
│   │   ├── Audit.js          # Audit schema ✅
│   │   └── Booking.js        # Booking schema ✅
│   ├── controllers/
│   │   ├── auditController.js    # Enhanced with DB ✅
│   │   └── bookingController.js  # Lead management ✅
│   ├── utils/
│   │   ├── googleScraper.js      # Puppeteer scraper ✅
│   │   ├── queueManager.js       # Rate limiting ✅
│   │   └── scoreCalculator.js    # Complete scoring ✅
│   ├── .env                  # Configuration
│   ├── package.json
│   └── server.js             # Main app ✅
│
└── client/                    # Frontend (React + Tailwind) 
    ├── src/
    │   ├── components/       # React components (will create)
    │   ├── pages/           # Page components
    │   ├── services/        # API calls
    │   └── App.jsx
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Quick Start

### Step 1: Install MongoDB Locally

**Option A: Download MongoDB Community Server**
1. Go to https://www.mongodb.com/try/download/community
2. Download Windows version
3. Install with default settings
4. MongoDB will run automatically as a service

**Option B: Use MongoDB Atlas (Cloud - Free)**
1. Create account at mongodb.com/atlas
2. Create free M0 cluster
3. Get connection string
4. Update `.env` file with your Atlas URI

### Step 2: Start Backend Server

```bash
cd server
npm install  # Install dependencies (if not done)
node server.js
```

You should see:
```
✅ MongoDB Connected: localhost
╔═══════════════════════════════════════════════════════╗
║  BizCheck MERN API Server                             ║
║  Status: Running ✓                                    ║
╚═══════════════════════════════════════════════════════╝
```

### Step 3: Start React Frontend (Once Created)

```bash
cd client
npm start
```

React will open at `http://localhost:3000`

---

## 📊 API Endpoints

### Audit Endpoints
```
POST   /api/audit              # Run business audit
GET    /api/audits/recent      # Get recent audits (10 latest)
GET    /api/analytics          # Get analytics stats
GET    /api/audit/queue-status # Queue monitoring
```

### Booking Endpoints
```
POST   /api/bookings           # Create lead/booking
GET    /api/bookings           # Get all bookings (admin)
```

### Test with cURL:
```bash
# Run audit
curl -X POST http://localhost:3000/api/audit \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Dominos Pizza",
    "area": "Connaught Place, Delhi"
  }'

# Get analytics
curl http://localhost:3000/api/analytics
```

---

## 🎨 Frontend (Coming Next)

Once React app is created, we'll add:

1. **Tailwind CSS** setup
2. **Components:**
   - Hero with search form
   - Loading screen
   - Results with score visualization
   - Business branding display
   - CTA section
3. **Pages:**
   - Home
   - Audit Results
   - Dashboard (admin)
4. **State Management:**
   - Context API for global state

Your premium glassmorphism design will be recreated with Tailwind!

---

## 🗄️ Database Features

### Automatic Caching
- Audits cached for 24 hours
- Reduces scraping load
- Faster response for repeat queries

### Analytics Tracking
- Total audits count
- Average score across all audits
- Top searched areas
- Failed scrape tracking

### Lead Management
- All bookings stored in DB
- Status tracking (new → contacted → converted)
- IP and user-agent logging

---

## 🧪 Testing Checklist

### Backend Tests
- [ ] Server starts without errors
- [ ] MongoDB connects successfully
- [ ] POST /api/audit works
- [ ] Results cached (try same business twice)
- [ ] GET /api/analytics returns stats
- [ ] POST /api/bookings saves lead

### Frontend Tests (After React Setup)
- [ ] React app starts
- [ ] Tailwind classes work
- [ ] Search form submits
- [ ] Loading animation shows
- [ ] Results display correctly
- [ ] Booking modal works

---

## 📝 Next Steps

**Right Now (Creating):**
- ✅ React app installing...

**After React Creates:**
1. Install Tailwind CSS in client
2. Create component structure
3. Build Hero & Search Form
4. Build Results display
5. Add animations
6. Connect to backend API

**Deployment (Later):**
1. MongoDB Atlas (free tier)
2. Backend → Railway.app
3. Frontend → Vercel
4. Environment variables setup

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
**Solution:** Make sure MongoDB is running:
```bash
# Check if MongoDB service is running
net start MongoDB

# Or start manually
mongod
```

### "Port 3000 already in use"
**Solution:**
```bash
# Kill the process
taskkill /F /IM node.exe

# Or use different port
PORT=5000 node server.js
```

### React app not created yet
**Be patient!** Creating React app takes 2-3 minutes. You'll see a success message when done.

---

## 💡 What You're Learning

By building this MERN stack, you're mastering:

✅ **MongoDB:**
- Mongoose ODM
- Schema design
- Indexes and queries
- Aggregation pipelines

✅ **Express:**
- RESTful API design
- Middleware
- Error handling
- Request validation

✅ **React:**
- Component architecture
- Hooks (useState, useEffect, useContext)
- API integration
- Tailwind CSS

✅ **Node.js:**
- Async/await patterns
- File organization
- Environment variables
- Process management

---

**Status: Backend Complete ✅ | React Creating... ⏳**

*Zeeshan - You're building a production-ready MERN stack app! 🚀*
