import React, { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import { fetchReviews } from '../utils/reviewApi';
import WriteReviewForm from './WriteReviewForm';
import ReviewsList from './ReviewsList';

const ReviewSection = ({ templateId }) => {
    const [stats, setStats] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const loadStats = useCallback(async () => {
        try {
            const data = await fetchReviews(templateId, { page: 1, limit: 1 });
            setStats(data.stats);
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    }, [templateId]);

    useEffect(() => {
        loadStats();
    }, [loadStats, refreshKey]);

    const handleReviewSubmitted = () => {
        setRefreshKey(k => k + 1);
    };

    const renderStarBar = (starNum, count, total) => {
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
            <div key={starNum} className="flex items-center gap-3 text-sm">
                <span className="text-slate-400 font-medium w-6 text-right">{starNum}</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                    ></div>
                </div>
                <span className="text-slate-500 font-medium w-8 text-right">{count}</span>
            </div>
        );
    };

    const renderStars = (rating) => {
        const stars = [];
        const r = parseFloat(rating) || 0;
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(r)) {
                stars.push(<Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />);
            } else if (i - r < 1 && i - r > 0) {
                stars.push(
                    <div key={i} className="relative w-6 h-6">
                        <Star className="w-6 h-6 text-slate-600 absolute" />
                        <div className="overflow-hidden absolute" style={{ width: `${(r % 1) * 100}%` }}>
                            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                        </div>
                    </div>
                );
            } else {
                stars.push(<Star key={i} className="w-6 h-6 text-slate-600" />);
            }
        }
        return stars;
    };

    return (
        <div className="space-y-10">
            {/* Section Title */}
            <div className="border-b border-white/10 pb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white font-syne tracking-tight">
                    Reviews & Ratings
                </h2>
                <p className="text-slate-400 mt-2">See what others think about this template</p>
            </div>

            {/* "Website made by BizList" Badge */}
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
                    <span className="text-white font-bold text-sm">B</span>
                </div>
                <div>
                    <div className="text-sm font-semibold text-white">Website made by BizList</div>
                    <div className="text-xs text-slate-400">This template is designed, built & maintained by the BizList team</div>
                </div>
                <div className="ml-auto shrink-0">
                    <span className="px-3 py-1 text-xs font-bold bg-blue-600/20 text-blue-400 rounded-full border border-blue-500/30">Verified</span>
                </div>
            </div>

            {/* Ratings Overview + Write Review — Side by side on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ratings Overview */}
                <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-6 md:p-8">
                    <div className="flex items-start gap-6 mb-6">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-white font-syne">
                                {stats?.averageRating?.toFixed(1) || '0.0'}
                            </div>
                            <div className="flex items-center gap-1 mt-2 justify-center">
                                {renderStars(stats?.averageRating || 0)}
                            </div>
                            <div className="text-sm text-slate-500 mt-2 font-medium">
                                {stats?.totalReviews || 0} reviews
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2.5">
                        {[5, 4, 3, 2, 1].map(star =>
                            renderStarBar(star, stats?.breakdown?.[star] || 0, stats?.totalReviews || 0)
                        )}
                    </div>
                </div>

                {/* Write Review Form */}
                <WriteReviewForm templateId={templateId} onReviewSubmitted={handleReviewSubmitted} />
            </div>

            {/* Reviews List */}
            <ReviewsList templateId={templateId} refreshKey={refreshKey} />
        </div>
    );
};

export default ReviewSection;
