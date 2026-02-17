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
    scrapedData: {
        name: String,
        rating: Number,
        reviewCount: Number,
        website: String,
        phone: String,
        address: String,
        photos: [String],
        hours: String,
        icon: String,

        // New Advanced Fields
        isClaimed: { type: Boolean, default: true }, // Default to true to be safe
        latestReviewDate: Date,
        ownerResponseCount: { type: Number, default: 0 },
        hasOwnerPhotos: { type: Boolean, default: false },
        hoursMissing: { type: Boolean, default: false }
    },

    // Health Score Results
    healthScore: {
        totalScore: {
            type: Number,
            min: 0,
            max: 100
        },
        maxScore: Number,
        percentage: Number,
        status: {
            type: String,
            enum: ['success', 'warning', 'danger']
        },
        message: String,
        breakdown: {
            website: {
                score: Number,
                status: String,
                message: String,
                recommendation: String
            },
            phone: {
                score: Number,
                status: String,
                message: String,
                recommendation: String
            },
            rating: {
                score: Number,
                status: String,
                message: String,
                recommendation: String
            },
            reviews: {
                score: Number,
                status: String,
                message: String,
                recommendation: String
            },
            photos: {
                score: Number,
                status: String,
                message: String,
                recommendation: String
            }
        }
    },

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
auditSchema.statics.findRecent = function (limit = 10) {
    return this.find({ status: 'completed' })
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
