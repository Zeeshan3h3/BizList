const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Database
const connectDB = require('./config/database');

// Controllers
const auditController = require('./controllers/auditController');
const bookingController = require('./controllers/bookingController');
const searchController = require('./controllers/searchController');
const autocompleteController = require('./controllers/autocompleteController');
const suggestionsController = require('./controllers/suggestionsController');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// DATABASE CONNECTION
// ============================================
connectDB();

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', globalLimiter);

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'BizCheck MERN API',
        database: 'connected'
    });
});

// Autocomplete route (for business name suggestions)
app.post('/api/autocomplete', autocompleteController.getAutocompleteSuggestions);

// Search route (for business selection)
app.post('/api/search-businesses', searchController.searchBusinesses);

// AI Suggestions route
app.post('/api/suggestions', suggestionsController.getSuggestions);

// User routes
app.use('/api/users', require('./routes/userRoutes'));

// Audit routes
app.post('/api/audit', auditController.runBusinessAudit);
app.get('/api/audits/recent', auditController.getRecentAudits);
app.get('/api/analytics', auditController.getAnalytics);
app.get('/api/audit/queue-status', auditController.getQueueStatus);

// Booking routes
app.post('/api/bookings', bookingController.createBooking);
app.get('/api/bookings', bookingController.getAllBookings);

// Legacy endpoint (backward compatibility)
app.post('/api/analyze-business', auditController.runBusinessAudit);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error'
    });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║  BizCheck MERN API Server                             ║
║  Status: Running ✓                                    ║
║  Port: ${PORT}                                           ║
║  Environment: ${process.env.NODE_ENV || 'development'}                            ║
║  Stack: MongoDB + Express + React + Node              ║
║  Scraping: Puppeteer (12s queue)                      ║
╚═══════════════════════════════════════════════════════╝
    `);

    console.log('📊 Endpoints:');
    console.log('   POST   /api/audit');
    console.log('   GET    /api/audits/recent');
    console.log('   GET    /api/analytics');
    console.log('   POST   /api/bookings');
    console.log('   GET    /api/bookings\n');
});

module.exports = app;
