const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
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
});

// Database
const connectDB = require('./config/database');

// Controllers
const auditController = require('./controllers/auditController');
const bookingController = require('./controllers/bookingController');
const searchController = require('./controllers/searchController');
const autocompleteController = require('./controllers/autocompleteController');
const suggestionsController = require('./controllers/suggestionsController');
const validate = require('./middlewares/validate');
const schemas = require('./validators/schemas');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to DB
connectDB();

// ============================================
// MIDDLEWARE
// ============================================

app.use(helmet());

// CORS — only allow known origins
const allowedOrigins = [
    'https://biz-list.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (Postman, server-to-server, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    },
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// RATE LIMITING
// ============================================

// Global rate limit
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict limit for scraping operations
const auditLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many audit requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', globalLimiter);

// ============================================
// ADMIN MIDDLEWARE (for protected admin routes)
// ============================================

const requireAdminKey = (req, res, next) => {
    const key = req.headers['x-admin-key'] || req.query.adminKey;
    const validKey = process.env.ADMIN_SECRET_KEY;

    if (!validKey) {
        // If no admin key is configured, block access entirely
        return res.status(503).json({
            error: 'Admin access not configured on this server.'
        });
    }

    if (key !== validKey) {
        return res.status(401).json({ error: 'Unauthorized: Invalid admin key.' });
    }

    next();
};

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

// Autocomplete (business name suggestions from Google Maps)
app.post('/api/autocomplete', validate(schemas.autocompleteSchema), autocompleteController.getAutocompleteSuggestions);

// Search businesses on Google Maps
app.post('/api/search-businesses', validate(schemas.searchBusinessesSchema), searchController.searchBusinesses);

// AI Suggestions
app.post('/api/suggestions', validate(schemas.suggestionsSchema), suggestionsController.getSuggestions);

// User routes
app.use('/api/users', require('./routes/userRoutes'));

// Audit routes
app.post('/api/audit', auditLimiter, validate(schemas.runAuditSchema), auditController.runBusinessAudit);
app.get('/api/audits/recent', auditController.getRecentAudits);
app.get('/api/analytics', auditController.getAnalytics);
app.get('/api/audit/queue-status', auditController.getQueueStatus);

// Booking routes — GET is protected by admin key
app.post('/api/bookings', validate(schemas.createBookingSchema), bookingController.createBooking);
app.get('/api/bookings', requireAdminKey, bookingController.getAllBookings);

// Legacy endpoint (backward compatibility)
app.post('/api/analyze-business', validate(schemas.runAuditSchema), auditController.runBusinessAudit);

// ============================================
// API 404 HANDLER
// Must come before static file serving so API
// routes return JSON, not an HTML page.
// ============================================
app.use('/api', (req, res) => {
    res.status(404).json({
        error: 'API route not found',
        path: req.originalUrl
    });
});

// ============================================
// STATIC FILE SERVING (Optional)
// Only active when client/dist exists (i.e., monolith deployment).
// On Render backend-only deployments this is skipped — prevents 500s.
// ============================================
const clientDistPath = path.join(__dirname, '../client/dist');

if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
} else {
    // Fallback: inform callers this is an API-only deployment
    app.get('*', (req, res) => {
        res.status(200).json({
            service: 'BizCheck API',
            status: 'running',
            note: 'This is a backend-only deployment. Access the frontend at https://biz-list.vercel.app'
        });
    });
}

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
    // CORS errors from our whitelist check
    if (err.message && err.message.startsWith('CORS policy:')) {
        return res.status(403).json({ error: err.message });
    }

    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
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
║  Environment: ${process.env.NODE_ENV || 'development'} ║
║  CORS: Restricted to known origins                    ║
╚═══════════════════════════════════════════════════════╝
    `);

    console.log('📊 Endpoints:');
    console.log('   POST   /api/audit');
    console.log('   POST   /api/search-businesses');
    console.log('   GET    /api/audits/recent');
    console.log('   GET    /api/analytics');
    console.log('   POST   /api/bookings');
    console.log('   GET    /api/bookings  (admin key required)\n');
});

module.exports = app;
