'use strict';

const Booking = require('../models/Booking');

/**
 * POST /api/bookings
 * Creates a new consultation booking / lead entry.
 */
async function createBooking(req, res) {
    try {
        const { name, phone, email, businessName, area, auditId } = req.body;

        const booking = await Booking.create({
            name,
            phone,
            email,
            businessName,
            area,
            auditId: auditId || undefined,
            ipAddress: req.ip || req.socket?.remoteAddress,
            status: 'new'
        });

        console.log(`[Booking] New lead: ${businessName} — ${phone}`);

        return res.status(201).json({
            success: true,
            message: 'Booking received. We will contact you within 24 hours.',
            bookingId: booking._id
        });
    } catch (error) {
        console.error('[Booking] Create failed:', error.message);
        return res.status(500).json({
            success: false,
            error: 'BOOKING_FAILED',
            message: 'Could not process your booking. Please try again.'
        });
    }
}

/**
 * GET /api/bookings
 * Returns all bookings. Protected by admin key middleware in server.js.
 * Supports optional ?status= filter.
 */
async function getAllBookings(req, res) {
    try {
        const query = req.query.status ? { status: req.query.status } : {};

        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 })
            .lean()
            .populate('auditId', 'businessName area healthScore.totalScore');

        return res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('[Booking] Fetch all failed:', error.message);
        return res.status(500).json({
            success: false,
            error: 'FETCH_FAILED',
            message: 'Could not retrieve bookings'
        });
    }
}

module.exports = { createBooking, getAllBookings };
