import React, { useState } from 'react';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import DOMPurify from 'dompurify';
import { submitReview } from '../utils/reviewApi';

const RATING_LABELS = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very good',
    5: 'Excellent'
};

const WriteReviewForm = ({ templateId, onReviewSubmitted }) => {
    const { user, isSignedIn } = useUser();

    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [comment, setComment] = useState('');
    const [authorName, setAuthorName] = useState(isSignedIn ? user?.firstName || '' : '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        const trimmed = comment.trim();
        if (trimmed.length < 10) {
            setError('Comment must be at least 10 characters');
            return;
        }

        try {
            setIsSubmitting(true);
            const sanitizedComment = DOMPurify.sanitize(trimmed);
            const sanitizedUrl = DOMPurify.sanitize((websiteUrl || '').trim().substring(0, 200));
            const sanitizedName = DOMPurify.sanitize((authorName || 'Anonymous').trim().substring(0, 50));

            await submitReview(templateId, {
                authorName: sanitizedName,
                websiteUrl: sanitizedUrl,
                rating,
                comment: sanitizedComment,
                clerkUserId: isSignedIn ? user.id : undefined
            });

            setSuccess(true);
            setRating(0);
            setComment('');
            setWebsiteUrl('');
            setAuthorName(isSignedIn ? user?.firstName || '' : '');
            onReviewSubmitted?.();

            // Hide success after 5 seconds
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayRating = hoveredStar || rating;

    return (
        <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-6 md:p-8">
            <h3 className="text-lg font-bold text-white mb-4">Write a Review</h3>

            {/* Website made by BizList badge */}
            <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 border border-blue-500/20 rounded-lg mb-6">
                <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-xs">B</span>
                </div>
                <div className="text-xs">
                    <span className="text-white font-semibold">Website made by BizList</span>
                    <span className="text-slate-400 ml-1">• Verified Template</span>
                </div>
            </div>

            {success && (
                <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 mb-6">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">Review submitted! Thank you for your feedback.</span>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Star Rating Picker */}
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3">Your Rating</label>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(0)}
                                onClick={() => setRating(star)}
                                className="p-0.5 transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-8 h-8 transition-colors ${star <= displayRating
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-slate-600'
                                        }`}
                                />
                            </button>
                        ))}
                        {displayRating > 0 && (
                            <span className="ml-3 text-sm font-medium text-amber-400">
                                {RATING_LABELS[displayRating]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Your Review</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value.substring(0, 1000))}
                        placeholder="Share your experience with this template..."
                        rows={4}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none text-sm"
                    />
                    <div className="flex justify-between items-center mt-1.5">
                        {comment.trim().length > 0 && comment.trim().length < 10 && (
                            <span className="text-xs text-red-400">Minimum 10 characters</span>
                        )}
                        <span className={`text-xs ml-auto ${comment.length > 900 ? 'text-amber-400' : 'text-slate-500'}`}>
                            {comment.length} / 1000
                        </span>
                    </div>
                </div>

                {/* Author Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Your Name (optional)</label>
                        <input
                            type="text"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value.substring(0, 50))}
                            placeholder="Your name (optional)"
                            className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Built Website URL (optional)</label>
                        <input
                            type="url"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value.substring(0, 200))}
                            placeholder="https://your-site.com"
                            className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Review'
                    )}
                </button>
            </form>
        </div>
    );
};

export default WriteReviewForm;
