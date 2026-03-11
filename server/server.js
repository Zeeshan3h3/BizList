const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

// Safety: Handle uncaught exceptions and unhandled rejections gracefully
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥');
    console.error(err);
    // In a real production scenario, gracefully close server before exiting
});

// Database
const connectDB = require('./config/database');

// Controllers
const auditController = require('./controllers/auditController');
const bookingController = require('./controllers/bookingController');
const searchController = require('./controllers/searchController');
const autocompleteController = require('./controllers/autocompleteController');
const suggestionsController = require('./controllers/suggestionsController');
const path = require('path');
const validate = require('./middlewares/validate');
const schemas = require('./validators/schemas');

const app = express();
const PORT = process.env.PORT || 3000;
//connection from DB
connectDB();

//MiddleWares
app.use(helmet()); // Security headers for Safe Mode deployment
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting (generous for read endpoints)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limit for heavy audit operations
const auditLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        error: 'Too many audit requests. Please try again later.'
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
//google maps listing suggestions
app.post('/api/autocomplete', validate(schemas.autocompleteSchema), autocompleteController.getAutocompleteSuggestions);

// Search route (for business selection)
app.post('/api/search-businesses', validate(schemas.searchBusinessesSchema), searchController.searchBusinesses);

// AI Suggestions route
app.post('/api/suggestions', validate(schemas.suggestionsSchema), suggestionsController.getSuggestions);

// User routes
app.use('/api/users', require('./routes/userRoutes'));

// Audit routes
app.post('/api/audit', auditLimiter, validate(schemas.runAuditSchema), auditController.runBusinessAudit);
app.get('/api/audits/recent', auditController.getRecentAudits);
app.get('/api/analytics', auditController.getAnalytics);
app.get('/api/audit/queue-status', auditController.getQueueStatus);

// Booking routes
app.post('/api/bookings', validate(schemas.createBookingSchema), bookingController.createBooking);
app.get('/api/bookings', bookingController.getAllBookings);

// Legacy endpoint (backward compatibility)
app.post('/api/analyze-business', validate(schemas.runAuditSchema), auditController.runBusinessAudit);

// Serve static files from the React client
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// 404 handler (API only, if needed, or rely on React's 404)
// app.use((req, res) => {
//     res.status(404).json({
//         error: 'Route not found'
//     });
// });

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
║  Port: ${PORT}                                        ║
║  Environment: ${process.env.NODE_ENV || 'development'}║
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
