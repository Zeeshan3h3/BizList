const Booking = require('../models/Booking');

/**
 * ============================================
 * BOOKING CONTROLLER
 * ============================================
 */

/**
 * Create booking/lead
 * POST /api/bookings
 */
async function createBooking(req, res) {
    try {
        const { name, phone, email, businessName, area, auditId } = req.body;

        // Validation
        if (!name || !phone || !businessName) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_FIELDS',
                message: 'Please provide name, phone, and business name'
            });
        }

        // Create booking
        const booking = new Booking({
            name,
            phone,
            email,
            businessName,
            area,
            auditId,
            ipAddress: req.ip || req.connection.remoteAddress,
            status: 'new'
        });

        await booking.save();

        console.log(`[BOOKING] New lead: ${name} - ${phone} - ${businessName}`);

        // TODO: Send email notification to your team
        // TODO: Send SMS confirmation to customer

        return res.status(201).json({
            success: true,
            message: 'Booking received. We will contact you within 24 hours.',
            bookingId: booking._id
        });

    } catch (error) {
        console.error('[BOOKING ERROR]', error);
        return res.status(500).json({
            success: false,
            error: 'BOOKING_FAILED',
            message: 'Could not process booking. Please try again.'
        });
    }
}

/**
 * Get all bookings (admin)
 * GET /api/bookings
 */
async function getAllBookings(req, res) {
    try {
        const status = req.query.status;
        const query = status ? { status } : {};

        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 })
            .populate('auditId', 'businessName area healthScore.totalScore');

        return res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('[GET BOOKINGS ERROR]', error);
        return res.status(500).json({
            success: false,
            error: 'FETCH_FAILED',
            message: 'Could not fetch bookings'
        });
    }
}

module.exports = {
    createBooking,
    getAllBookings
};
