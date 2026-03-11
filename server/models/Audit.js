const mongoose = require('mongoose');

/**
 * ============================================
 * AUDIT MODEL
 * ============================================
 * 
 * Stores business audit results in MongoDB
 * Created for: BizCheck by Zeeshan
 */

const auditSchema = new mongoose.Schema({
    // Search Information
    businessName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    area: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    searchQuery: {
        type: String,
        index: true
    },

    // Scraped Business Data
    scrapedData: mongoose.Schema.Types.Mixed,

    // Health Score Results
    // Health Score Results
    // Phase 4: Replaced strict schema with Mixed.
    // The previous strict schema caused Mongoose to strip new keys like 'google', 'social', and 'totalRevenueLeakage' on cached saves.
    healthScore: mongoose.Schema.Types.Mixed,

    // Request Metadata
    ipAddress: String,
    userAgent: String,

    // Status Tracking
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
        index: true
    },
    error: String,

    // Timestamps
    scrapedAt: Date,
    processingTime: Number // in milliseconds
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexes for common queries
auditSchema.index({ businessName: 1, area: 1 });
auditSchema.index({ createdAt: -1 });
auditSchema.index({ 'healthScore.totalScore': -1 });

// Virtual for search key (for caching)
auditSchema.virtual('cacheKey').get(function () {
    return `${this.businessName.toLowerCase()}_${this.area.toLowerCase()}`.replace(/\s+/g, '_');
});

// Static method to find recent audits
auditSchema.statics.findRecent = function (limit = 10, mode = null) {
    const query = { status: 'completed' };
    if (mode) {
        query['healthScore.mode'] = mode;
    }
    return this.find(query)
        .sort({ createdAt: -1 }).limit(limit)
        .select('-__v');
};

// Static method to get analytics
auditSchema.statics.getAnalytics = async function () {
    const total = await this.countDocuments({ status: 'completed' });
    const avgScore = await this.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, avgScore: { $avg: '$healthScore.totalScore' } } }
    ]);

    const topAreas = await this.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$area', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);

    return {
        totalAudits: total,
        avgScore: avgScore[0]?.avgScore || 0,
        topAreas: topAreas.map(a => ({ area: a._id, count: a.count }))
    };
};

const Audit = mongoose.model('Audit', auditSchema);

module.exports = Audit;
