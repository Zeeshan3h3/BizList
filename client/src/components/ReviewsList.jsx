import React, { useState, useEffect, useCallback } from 'react';
import { Star, ThumbsUp, ThumbsDown, Loader2, ChevronDown, Trash2, ExternalLink } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { fetchReviews, voteReview, deleteReview } from '../utils/reviewApi';

const AVATAR_COLORS = [
    'bg-blue-600', 'bg-emerald-600', 'bg-purple-600',
    'bg-amber-600', 'bg-rose-600', 'bg-cyan-600'
];

const SORT_OPTIONS = [
    { value: 'recent', label: 'Most recent' },
    { value: 'helpful', label: 'Most helpful' },
    { value: 'highest', label: 'Highest rated' },
    { value: 'lowest', label: 'Lowest rated' }
];

const ReviewsList = ({ templateId, refreshKey }) => {
    const { user, isSignedIn } = useUser();
    const [reviews, setReviews] = useState([]);
    const [sort, setSort] = useState('recent');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const loadReviews = useCallback(async (pageNum = 1, append = false) => {
        try {
            if (append) setIsLoadingMore(true);
            else setIsLoading(true);

            const data = await fetchReviews(templateId, {
                sort,
                page: pageNum,
                limit: 10,
                clerkUserId: isSignedIn ? user?.id : null
            });

            if (append) {
                setReviews(prev => [...prev, ...data.reviews]);
            } else {
                setReviews(data.reviews);
            }
            setHasMore(data.pagination.hasMore);
            setPage(pageNum);
        } catch (err) {
            console.error('Error loading reviews:', err);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [templateId, sort, isSignedIn, user?.id]);

    useEffect(() => {
        setPage(1);
        loadReviews(1, false);
    }, [loadReviews, refreshKey]);

    const handleSortChange = (newSort) => {
        setSort(newSort);
        setSortOpen(false);
    };

    const handleLoadMore = () => {
        loadReviews(page + 1, true);
    };

    const handleVote = async (reviewId, vote) => {
        try {
            const result = await voteReview(reviewId, vote);
            setReviews(prev => prev.map(r =>
                r._id === reviewId
                    ? { ...r, helpfulCount: result.helpfulCount, notHelpfulCount: result.notHelpfulCount, userVote: result.userVote }
                    : r
            ));
        } catch (err) {
            console.error('Error voting:', err);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!confirm('Are you sure you want to delete your review?')) return;
        try {
            setDeletingId(reviewId);
            await deleteReview(reviewId, user?.id || null);
            setReviews(prev => prev.filter(r => r._id !== reviewId));
        } catch (err) {
            console.error('Error deleting review:', err);
            alert(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    const getInitials = (name) => {
        if (!name || name === 'Anonymous') return 'AN';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const getAvatarColor = (name) => {
        const code = (name || 'A').charCodeAt(0);
        return AVATAR_COLORS[code % AVATAR_COLORS.length];
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const renderStars = (rating) => {
        return [1, 2, 3, 4, 5].map(i => (
            <Star
                key={i}
                className={`w-4 h-4 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
            />
        ));
    };

    // Skeleton
    if (isLoading) {
        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-40 bg-slate-700 rounded animate-pulse"></div>
                    <div className="h-9 w-36 bg-slate-700 rounded animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-[#0f172a] rounded-2xl border border-white/10 p-6 animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-slate-700 rounded"></div>
                                    <div className="h-3 w-32 bg-slate-700/50 rounded"></div>
                                </div>
                            </div>
                            <div className="h-3 w-full bg-slate-700/50 rounded mb-2"></div>
                            <div className="h-3 w-3/4 bg-slate-700/50 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header with sort */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">
                    All Reviews {reviews.length > 0 && `(${reviews.length})`}
                </h3>

                <div className="relative">
                    <button
                        onClick={() => setSortOpen(!sortOpen)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f172a] border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
                    >
                        {SORT_OPTIONS.find(o => o.value === sort)?.label}
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                    {sortOpen && (
                        <div className="absolute right-0 top-full mt-2 w-44 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 py-1">
                            {SORT_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleSortChange(opt.value)}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${sort === opt.value
                                        ? 'bg-blue-600/20 text-blue-400'
                                        : 'text-slate-300 hover:bg-white/5'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Empty state */}
            {reviews.length === 0 && (
                <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-12 text-center">
                    <div className="text-4xl mb-4">✍️</div>
                    <h4 className="text-lg font-bold text-white mb-2">No reviews yet</h4>
                    <p className="text-slate-400">Be the first to review this template!</p>
                </div>
            )}

            {/* Reviews */}
            <div className="space-y-4">
                {reviews.map(review => (
                    <div key={review._id} className="bg-[#0f172a] rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-colors">
                        {/* Author row */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-full ${getAvatarColor(review.authorName)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                                {getInitials(review.authorName)}
                            </div>
                            <div className="min-w-0">
                                <div className="font-semibold text-white text-sm truncate">
                                    {review.authorName}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <span>{formatDate(review.createdAt)}</span>
                                    {review.websiteUrl && (
                                        <>
                                            <span>•</span>
                                            <a
                                                href={review.websiteUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                View Site
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 ml-auto shrink-0">
                                <div className="flex items-center gap-0.5">
                                    {renderStars(review.rating)}
                                </div>
                                {/* Delete button — only visible to the review owner */}
                                {review.isOwner && (
                                    <button
                                        onClick={() => handleDelete(review._id)}
                                        disabled={deletingId === review._id}
                                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all ml-1"
                                        title="Delete your review"
                                    >
                                        {deletingId === review._id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Comment */}
                        <p className="text-sm text-slate-300 leading-relaxed mb-4">
                            {review.comment}
                        </p>

                        {/* Vote buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleVote(review._id, 'helpful')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${review.userVote === 'helpful'
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:bg-slate-700/50 hover:text-white'
                                    }`}
                            >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                Helpful {review.helpfulCount > 0 && `(${review.helpfulCount})`}
                            </button>
                            <button
                                onClick={() => handleVote(review._id, 'notHelpful')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${review.userVote === 'notHelpful'
                                    ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                                    : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:bg-slate-700/50 hover:text-white'
                                    }`}
                            >
                                <ThumbsDown className="w-3.5 h-3.5" />
                                {review.notHelpfulCount > 0 && `(${review.notHelpfulCount})`}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More */}
            {hasMore && (
                <div className="text-center mt-8">
                    <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-white font-medium rounded-xl transition-all border border-white/10 inline-flex items-center gap-2"
                    >
                        {isLoadingMore ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Load more reviews'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewsList;
