const mongoose = require('mongoose');
const crypto = require('crypto');

const reviewSchema = new mongoose.Schema({
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        required: true,
        index: true
    },
    authorName: {
        type: String,
        default: 'Anonymous',
        trim: true,
        maxlength: 50
    },
    clerkUserId: {
        type: String,
        default: null
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer'
        }
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 1000
    },
    websiteUrl: {
        type: String,
        trim: true,
        maxlength: 200
    },
    helpfulVotes: {
        type: [String], // hashed IPs
        default: []
    },
    notHelpfulVotes: {
        type: [String], // hashed IPs
        default: []
    },
    ipHash: {
        type: String,
        index: true
    },
    isVisible: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Compound indexes
reviewSchema.index({ templateId: 1, createdAt: -1 });
reviewSchema.index({ templateId: 1, clerkUserId: 1 });
reviewSchema.index({ templateId: 1, ipHash: 1 });

/**
 * Hash an IP address with the secret salt
 */
reviewSchema.statics.hashIP = function (ip) {
    const secret = process.env.IP_HASH_SECRET || 'default-secret-change-me';
    return crypto.createHash('sha256').update(ip + secret).digest('hex');
};

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
