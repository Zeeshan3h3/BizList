import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Store, CheckCircle, AlertTriangle, XCircle, ExternalLink, Flame, TrendingUp, Minus, Ban } from 'lucide-react';

const ScoreCard = ({ mode = 'business', status = "Competitive", score = 0, brandClass = "MODERATE", brandIntelligence = null, businessName = "Your Business", businessImage = null, googleMapsUrl = null, opportunityReason = '', leadColor = '#EAB308', websiteStatus = 'none' }) => {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = score;
        const duration = 2000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setAnimatedScore(end);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [score]);

    // Lead-type color scheme
    const getLeadConfig = () => {
        if (brandClass === 'HOT LEAD') return {
            scoreColor: 'text-red-500',
            bgColor: 'bg-white border-red-200 shadow-red-900/5',
            gradient: { start: '#ef4444', end: '#e11d48' },
            blobColor: 'bg-red-500',
            messageBoxBg: 'bg-red-50/50 border-red-100',
            messageTextColor: 'text-red-800',
            badgeBg: 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200',
            statusBadgeBg: 'bg-red-100 text-red-800',
            icon: <Flame className="w-3.5 h-3.5" />,
            emoji: '🔥'
        };
        if (brandClass === 'HIGH POTENTIAL') return {
            scoreColor: 'text-orange-500',
            bgColor: 'bg-white border-orange-200 shadow-orange-900/5',
            gradient: { start: '#f97316', end: '#ea580c' },
            blobColor: 'bg-orange-500',
            messageBoxBg: 'bg-orange-50/50 border-orange-100',
            messageTextColor: 'text-orange-800',
            badgeBg: 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-200',
            statusBadgeBg: 'bg-orange-100 text-orange-800',
            icon: <TrendingUp className="w-3.5 h-3.5" />,
            emoji: '⚡'
        };
        if (brandClass === 'MODERATE') return {
            scoreColor: 'text-amber-500',
            bgColor: 'bg-white border-amber-200 shadow-amber-900/5',
            gradient: { start: '#f59e0b', end: '#d97706' },
            blobColor: 'bg-amber-500',
            messageBoxBg: 'bg-amber-50/50 border-amber-100',
            messageTextColor: 'text-amber-800',
            badgeBg: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200',
            statusBadgeBg: 'bg-amber-100 text-amber-800',
            icon: <Minus className="w-3.5 h-3.5" />,
            emoji: '📊'
        };
        if (brandClass === 'EXCLUDED') return {
            scoreColor: 'text-gray-400',
            bgColor: 'bg-white border-gray-200 shadow-gray-900/5',
            gradient: { start: '#6b7280', end: '#374151' },
            blobColor: 'bg-gray-500',
            messageBoxBg: 'bg-gray-50/50 border-gray-100',
            messageTextColor: 'text-gray-800',
            badgeBg: 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200',
            statusBadgeBg: 'bg-gray-100 text-gray-800',
            icon: <Ban className="w-3.5 h-3.5" />,
            emoji: '⛔'
        };
        // LOW PRIORITY / IGNORE
        return {
            scoreColor: 'text-green-500',
            bgColor: 'bg-white border-green-200 shadow-green-900/5',
            gradient: { start: '#22c55e', end: '#10b981' },
            blobColor: 'bg-green-500',
            messageBoxBg: 'bg-green-50/50 border-green-100',
            messageTextColor: 'text-green-800',
            badgeBg: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200',
            statusBadgeBg: 'bg-green-100 text-green-800',
            icon: <CheckCircle className="w-3.5 h-3.5" />,
            emoji: '✅'
        };
    };

    const getBusinessConfig = () => {
        // >= 70: GREEN
        if (score >= 70) return {
            scoreColor: 'text-green-500',
            bgColor: 'bg-white border-green-200 shadow-green-900/5',
            gradient: { start: '#22c55e', end: '#10b981' },
            blobColor: 'bg-green-500',
            messageBoxBg: 'bg-green-50/50 border-green-100',
            messageTextColor: 'text-green-800',
            badgeBg: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200',
            statusBadgeBg: 'bg-green-100 text-green-800',
            icon: <CheckCircle className="w-3.5 h-3.5" />,
            emoji: '🏆',
            title: status || 'Fully Optimized'
        };
        // 30 - 69: ORANGE
        if (score >= 30) return {
            scoreColor: 'text-orange-500',
            bgColor: 'bg-white border-orange-200 shadow-orange-900/5',
            gradient: { start: '#f97316', end: '#ea580c' },
            blobColor: 'bg-orange-500',
            messageBoxBg: 'bg-orange-50/50 border-orange-100',
            messageTextColor: 'text-orange-800',
            badgeBg: 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-200',
            statusBadgeBg: 'bg-orange-100 text-orange-800',
            icon: <AlertTriangle className="w-3.5 h-3.5" />,
            emoji: '⚠️',
            title: status || 'Needs Improvement'
        };
        // < 30: RED
        return {
            scoreColor: 'text-red-500',
            bgColor: 'bg-white border-red-200 shadow-red-900/5',
            gradient: { start: '#ef4444', end: '#e11d48' },
            blobColor: 'bg-red-500',
            messageBoxBg: 'bg-red-50/50 border-red-100',
            messageTextColor: 'text-red-800',
            badgeBg: 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200',
            statusBadgeBg: 'bg-red-100 text-red-800',
            icon: <XCircle className="w-3.5 h-3.5" />,
            emoji: '🚨',
            title: status || 'Critical Risk'
        };
    };

    const config = mode === 'pro' ? getLeadConfig() : getBusinessConfig();

    // Website status badge
    const getWebsiteBadge = () => {
        switch (websiteStatus) {
            case 'none': return { label: 'No Website', color: 'bg-red-100 text-red-700' };
            case 'broken': return { label: 'Broken Website', color: 'bg-red-100 text-red-700' };
            case 'outdated': return { label: 'Outdated Website', color: 'bg-amber-100 text-amber-700' };
            case 'basic': return { label: 'Basic Website', color: 'bg-blue-100 text-blue-700' };
            case 'good': return { label: 'Good Website', color: 'bg-green-100 text-green-700' };
            default: return { label: 'Unknown', color: 'bg-gray-100 text-gray-700' };
        }
    };

    const webBadge = getWebsiteBadge();

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className={`relative overflow-hidden rounded-3xl mb-12 border shadow-2xl transition-colors duration-1000 ${config.bgColor}`}
        >
            {/* Animated Background blob */}
            <motion.div
                className={`absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-10 ${config.blobColor}`}
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="flex flex-col lg:flex-row relative z-10">
                {/* LEFT PANE: Business Context & Messaging */}
                <div className="lg:w-7/12 p-8 md:p-12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/50 backdrop-blur-sm">
                    {/* Header Tag */}
                    <div className="flex items-center gap-2 mb-6">
                        <span className="uppercase tracking-widest text-xs font-bold text-slate-500">
                            {mode === 'pro' ? 'Lead Opportunity Analysis' : 'Digital Health Snapshot'}
                        </span>
                        <div className="flex-1 h-px bg-slate-200"></div>
                    </div>

                    {/* Business Identity */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
                        <div className="shrink-0 relative">
                            {businessImage ? (
                                <img
                                    src={businessImage}
                                    alt={businessName}
                                    referrerPolicy="no-referrer"
                                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2 border-white shadow-lg"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                />
                            ) : null}
                            <div className={`${businessImage ? 'hidden' : 'flex'} w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 items-center justify-center border-2 border-white shadow-lg`}>
                                <Store className="w-10 h-10 text-slate-400" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-3xl md:text-4xl font-heading font-black text-slate-900 leading-tight break-words">
                                {businessName}
                            </h2>
                            {/* Classifications / Badges */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 shadow-sm ${config.badgeBg}`}>
                                    {config.icon}
                                    {mode === 'pro' ? brandClass : config.title}
                                </div>

                                {mode === 'pro' && websiteStatus !== 'none' && (
                                    <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border shadow-sm ${webBadge.color}`}>
                                        {webBadge.label}
                                    </div>
                                )}
                            </div>
                            {googleMapsUrl && (
                                <a
                                    href={googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex flex-wrap items-center mt-4 gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 decoration-2 transition-all"
                                >
                                    <ExternalLink size={16} />
                                    Visit Google Maps Profile
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Opportunity Reason Box */}
                    <div className={`p-5 rounded-2xl border ${config.messageBoxBg}`}>
                        <p className={`text-base md:text-lg leading-relaxed ${config.messageTextColor}`}>
                            {opportunityReason || 'Comprehensive digital footprint analysis complete. Review the performance matrix below to identify critical visibility gaps, AI readiness, and conversion opportunities.'}
                        </p>
                    </div>
                </div>

                {/* RIGHT PANE: Score Visualization */}
                <div className="lg:w-5/12 p-8 md:p-12 flex flex-col items-center justify-center relative">
                    <div className="text-center mb-6 z-10">
                        <h3 className="text-lg font-bold text-slate-800">
                            {mode === 'pro' ? 'Opportunity Score' : 'Digital Health Score'}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {mode === 'pro' ? 'Based on 8 growth signals' : 'Based on 6 trust signals'}
                        </p>
                    </div>

                    {/* SVG Circular Progress Ring */}
                    <div className="relative w-56 h-56 shrink-0 mb-8">
                        <svg className="transform -rotate-90 w-56 h-56 drop-shadow-lg">
                            <circle cx="112" cy="112" r="100" stroke="rgba(0, 0, 0, 0.04)" strokeWidth="14" fill="none" />
                            <circle
                                cx="112" cy="112" r="100"
                                stroke="url(#scoreGradient)" strokeWidth="14" fill="none"
                                strokeDasharray={2 * Math.PI * 100}
                                strokeDashoffset={(2 * Math.PI * 100) - (animatedScore / 100) * (2 * Math.PI * 100)}
                                strokeLinecap="round" className="transition-all duration-1000 ease-out"
                            />
                            <defs>
                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={config.gradient.start} />
                                    <stop offset="100%" stopColor={config.gradient.end} />
                                </linearGradient>
                            </defs>
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.4, type: "spring" }}
                                className={`text-7xl font-black tracking-tighter ${config.scoreColor}`}
                            >
                                {animatedScore}
                            </motion.div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">out of 100</div>
                        </div>
                    </div>

                    {/* Lead Classification */}
                    <div className="flex flex-col items-center gap-2 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border ${config.badgeBg}`}>
                            {config.emoji} {brandClass}
                        </span>

                        {brandIntelligence?.brandType && (
                            <span className="text-xs font-bold text-slate-500 mt-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                {brandIntelligence.brandType === 'enterprise' ? 'Enterprise Brand Detected' :
                                    brandIntelligence.brandType === 'multi_outlet' ? 'Multi-Outlet Business' :
                                        'Independent Local Business'}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Panel */}
            {mode === 'pro' && (
                <div className={`px-8 md:px-12 py-5 border-t border-slate-100 flex items-start gap-4 ${config.messageBoxBg}`}>
                    <div className="text-2xl mt-0.5">{config.emoji}</div>
                    <div>
                        <h4 className={`font-bold text-sm ${config.messageTextColor} uppercase tracking-wider mb-1`}>
                            {brandClass === 'EXCLUDED' ? 'System Exclusion' : 'Lead Intelligence'}
                        </h4>
                        <p className={`text-md font-medium ${config.messageTextColor} opacity-90`}>
                            {brandIntelligence ? 'Excluded: Known Corporate Brand/Chain' : opportunityReason}
                        </p>
                    </div>
                </div>
            )}

            {mode === 'business' && score < 80 && (
                <div className={`px-8 md:px-12 py-5 border-t border-slate-100 flex items-start gap-4 ${config.messageBoxBg}`}>
                    <div className="text-2xl mt-0.5">💡</div>
                    <div>
                        <h4 className={`font-bold text-sm ${config.messageTextColor} uppercase tracking-wider mb-1`}>
                            Growth Opportunity
                        </h4>
                        <p className={`text-md font-medium ${config.messageTextColor} opacity-90`}>
                            Your score indicates lost revenue due to local visibility gaps. Fixing these issues will improve your Google Maps ranking.
                        </p>
                    </div>
                </div>
            )}

            {mode === 'business' && score >= 80 && (
                <div className={`px-8 md:px-12 py-5 border-t border-slate-100 flex items-start gap-4 ${config.messageBoxBg}`}>
                    <div className="text-2xl mt-0.5">🏆</div>
                    <div>
                        <h4 className={`font-bold text-sm ${config.messageTextColor} uppercase tracking-wider mb-1`}>
                            Excellent Work
                        </h4>
                        <p className={`text-md font-medium ${config.messageTextColor} opacity-90`}>
                            Your business has an excellent digital foundation. Maintain consistent activity to keep your edge over competitors.
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ScoreCard;
