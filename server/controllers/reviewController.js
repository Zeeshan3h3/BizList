const mongoose = require('mongoose');
const Review = require('../models/Review');
const Template = require('../models/Template');

/**
 * Resolve templateId param — could be a MongoDB ObjectId or a template code
 * Returns the template document or null
 */
async function resolveTemplate(templateId) {
    let template = null;
    if (mongoose.Types.ObjectId.isValid(templateId)) {
        template = await Template.findById(templateId).lean();
    }
    if (!template) {
        template = await Template.findOne({ code: templateId }).lean();
    }
    return template;
}

/**
 * GET /api/reviews/:templateId
 * Fetch all visible reviews for a template + computed stats
 */
exports.getReviews = async (req, res) => {
    try {
        const { templateId } = req.params;

        const template = await resolveTemplate(templateId);
        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        const sort = req.query.sort || 'recent';
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        // Determine sort order
        let sortObj = { createdAt: -1 };
        if (sort === 'helpful') sortObj = { helpfulCount: -1, createdAt: -1 };
        if (sort === 'highest') sortObj = { rating: -1, createdAt: -1 };
        if (sort === 'lowest') sortObj = { rating: 1, createdAt: -1 };

        const templateObjId = template._id;

        // Get requesting user's IP hash for userVote
        const ip = req.ip || req.connection?.remoteAddress || '0.0.0.0';
        const ipHash = Review.hashIP(ip);

        // Get reviews
        const reviews = await Review.find({ templateId: templateObjId, isVisible: true })
            .sort(sort === 'helpful' ? { createdAt: -1 } : sortObj)
            .skip(skip)
            .limit(limit)
            .lean();

        // If sorting by helpful, we need to sort by computed field
        // Determine if requesting user owns any reviews
        const requestingUserId = req.query.clerkUserId || null;

        let processedReviews = reviews.map(r => {
            const helpfulCount = r.helpfulVotes?.length || 0;
            const notHelpfulCount = r.notHelpfulVotes?.length || 0;

            let userVote = null;
            if (r.helpfulVotes?.includes(ipHash)) userVote = 'helpful';
            else if (r.notHelpfulVotes?.includes(ipHash)) userVote = 'notHelpful';

            // isOwner: true if logged-in user matches clerkUserId, OR if guest IP matches
            let isOwner = false;
            if (requestingUserId && r.clerkUserId && requestingUserId === r.clerkUserId) {
                isOwner = true;
            } else if (!r.clerkUserId && (r.ipHash === ipHash)) {
                // Guest review: match by IP hash
                isOwner = true;
            }

            return {
                _id: r._id,
                authorName: r.authorName,
                websiteUrl: r.websiteUrl,
                rating: r.rating,
                comment: r.comment,
                helpfulCount,
                notHelpfulCount,
                userVote,
                isOwner,
                createdAt: r.createdAt
            };
        });

        // Sort by helpful count if requested (after mapping)
        if (sort === 'helpful') {
            processedReviews.sort((a, b) => b.helpfulCount - a.helpfulCount);
        }

        // Get total count for pagination
        const totalReviews = await Review.countDocuments({ templateId: templateObjId, isVisible: true });
        const totalPages = Math.ceil(totalReviews / limit);

        // Get stats (breakdown by star)
        const statsAgg = await Review.aggregate([
            { $match: { templateId: templateObjId, isVisible: true } },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            }
        ]);

        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let totalRatingSum = 0;
        let totalCount = 0;
        statsAgg.forEach(s => {
            breakdown[s._id] = s.count;
            totalRatingSum += s._id * s.count;
            totalCount += s.count;
        });

        const averageRating = totalCount > 0
            ? Math.round((totalRatingSum / totalCount) * 10) / 10
            : 0;

        res.json({
            reviews: processedReviews,
            stats: {
                averageRating,
                totalReviews: totalCount,
                breakdown
            },
            pagination: {
                currentPage: page,
                totalPages,
                hasMore: page < totalPages
            }
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ success: false, message: 'Server error fetching reviews' });
    }
};

/**
 * POST /api/reviews/:templateId
 * Submit a new review
 */
exports.createReview = async (req, res) => {
    try {
        const { templateId } = req.params;

        // Resolve template (supports ObjectId or code)
        const template = await resolveTemplate(templateId);
        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        const realTemplateId = template._id;
        const { authorName, websiteUrl, rating, comment, clerkUserId } = req.body;

        // Validation
        if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
        }

        const trimmedComment = (comment || '').trim();
        if (trimmedComment.length < 10 || trimmedComment.length > 1000) {
            return res.status(400).json({ success: false, message: 'Comment must be between 10 and 1000 characters' });
        }

        const trimmedName = (authorName || 'Anonymous').trim().substring(0, 50);

        // Get IP hash
        const ip = req.ip || req.connection?.remoteAddress || '0.0.0.0';
        const ipHash = Review.hashIP(ip);

        // Duplicate prevention
        if (clerkUserId) {
            const existingReview = await Review.findOne({
                templateId: realTemplateId,
                clerkUserId
            });
            if (existingReview) {
                return res.status(429).json({
                    success: false,
                    message: 'You already reviewed this template'
                });
            }
        } else {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const existingReview = await Review.findOne({
                templateId: realTemplateId,
                ipHash,
                clerkUserId: null,
                createdAt: { $gte: twentyFourHoursAgo }
            });
            if (existingReview) {
                return res.status(429).json({
                    success: false,
                    message: 'You already reviewed this template'
                });
            }
        }

        // Sanitize - basic XSS removal
        const sanitize = (str) => str ? str.replace(/[<>]/g, '') : '';

        // Validate basic URL structure if provided
        let safeUrl = sanitize(websiteUrl || '').trim();
        if (safeUrl && !safeUrl.startsWith('http://') && !safeUrl.startsWith('https://')) {
            safeUrl = 'https://' + safeUrl;
        }

        const review = await Review.create({
            templateId: realTemplateId,
            authorName: sanitize(trimmedName),
            websiteUrl: safeUrl || undefined,
            clerkUserId: clerkUserId || null,
            rating,
            comment: sanitize(trimmedComment),
            ipHash
        });

        res.status(201).json({
            success: true,
            review: {
                _id: review._id,
                authorName: review.authorName,
                websiteUrl: review.websiteUrl,
                rating: review.rating,
                comment: review.comment,
                helpfulCount: 0,
                notHelpfulCount: 0,
                createdAt: review.createdAt
            }
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ success: false, message: 'Server error creating review' });
    }
};

/**
 * POST /api/reviews/:reviewId/vote
 * Vote a review as helpful or not helpful
 */
exports.voteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ success: false, message: 'Invalid review ID' });
        }

        const { vote } = req.body;
        if (!['helpful', 'notHelpful'].includes(vote)) {
            return res.status(400).json({ success: false, message: 'Vote must be "helpful" or "notHelpful"' });
        }

        const review = await Review.findById(reviewId);
        if (!review || !review.isVisible) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        const ip = req.ip || req.connection?.remoteAddress || '0.0.0.0';
        const ipHash = Review.hashIP(ip);

        const isInHelpful = review.helpfulVotes.includes(ipHash);
        const isInNotHelpful = review.notHelpfulVotes.includes(ipHash);

        if (vote === 'helpful') {
            if (isInHelpful) {
                // Toggle off
                review.helpfulVotes = review.helpfulVotes.filter(h => h !== ipHash);
            } else {
                // Add to helpful, remove from notHelpful if present
                if (isInNotHelpful) {
                    review.notHelpfulVotes = review.notHelpfulVotes.filter(h => h !== ipHash);
                }
                review.helpfulVotes.push(ipHash);
            }
        } else {
            if (isInNotHelpful) {
                // Toggle off
                review.notHelpfulVotes = review.notHelpfulVotes.filter(h => h !== ipHash);
            } else {
                // Add to notHelpful, remove from helpful if present
                if (isInHelpful) {
                    review.helpfulVotes = review.helpfulVotes.filter(h => h !== ipHash);
                }
                review.notHelpfulVotes.push(ipHash);
            }
        }

        await review.save();

        // Determine current user vote
        let userVote = null;
        if (review.helpfulVotes.includes(ipHash)) userVote = 'helpful';
        else if (review.notHelpfulVotes.includes(ipHash)) userVote = 'notHelpful';

        res.json({
            helpfulCount: review.helpfulVotes.length,
            notHelpfulCount: review.notHelpfulVotes.length,
            userVote
        });
    } catch (error) {
        console.error('Error voting review:', error);
        res.status(500).json({ success: false, message: 'Server error voting' });
    }
};

/**
 * DELETE /api/reviews/:reviewId
 * Delete a review (only the author can delete — logged-in by clerkUserId, guest by IP)
 */
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ success: false, message: 'Invalid review ID' });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        const { clerkUserId } = req.body;
        const ip = req.ip || req.connection?.remoteAddress || '0.0.0.0';
        const ipHash = Review.hashIP(ip);

        // Check ownership: logged-in user by clerkUserId, or guest by IP hash
        let isOwner = false;
        if (clerkUserId && review.clerkUserId && review.clerkUserId === clerkUserId) {
            isOwner = true;
        } else if (!review.clerkUserId && (review.ipHash === ipHash)) {
            isOwner = true;
        }

        if (!isOwner) {
            return res.status(403).json({ success: false, message: 'You can only delete your own reviews' });
        }

        await Review.findByIdAndDelete(reviewId);

        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ success: false, message: 'Server error deleting review' });
    }
};
