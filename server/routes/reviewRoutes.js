const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Rate limiter for review submissions: 3 per hour per IP
const reviewSubmitLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { error: 'Too many review submissions. Try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for votes: 20 per minute per IP
const voteLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { error: 'Too many votes. Slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// GET reviews for a template
router.get('/:templateId', reviewController.getReviews);

// POST vote on a review — MUST come before /:templateId to avoid route conflict
router.post('/:reviewId/vote', voteLimiter, reviewController.voteReview);

// POST new review
router.post('/:templateId', reviewSubmitLimiter, reviewController.createReview);

// DELETE a review (author only)
router.delete('/:reviewId', reviewController.deleteReview);

module.exports = router;
