const mongoose = require('mongoose');

/**
 * ============================================
 * BOOKING/LEAD MODEL
 * ============================================
 * 
 * Stores consultation booking requests
 * Created for: BizCheck by Zeeshan
 */

const bookingSchema = new mongoose.Schema({
    // Contact Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },

    // Business Information
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    area: String,

    // Related Audit
    auditId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Audit'
    },

    // Lead Status
    status: {
        type: String,
        enum: ['new', 'contacted', 'converted', 'lost'],
        default: 'new'
    },
    notes: String,

    // Metadata
    ipAddress: String,
    source: {
        type: String,
        default: 'website'
    }
}, {
    timestamps: true
});

// Indexes
bookingSchema.index({ phone: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
