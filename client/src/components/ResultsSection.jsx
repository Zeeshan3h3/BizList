import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldX, AlertCircle, Info, RefreshCw, Store } from 'lucide-react';
import ScoreCard from './ScoreCard';
import BreakdownCard from './BreakdownCard';
import ImprovementPanel from './ImprovementPanel';
import ImprovementSimulator from './ImprovementSimulator';
import CTASection from './CTASection';
import AiSuggestions from './AiSuggestions';
import MarketIntelligenceCard from './MarketIntelligenceCard';

/**
 * Severity badge styles for ATS Red Flags
 */
const severityConfig = {
    FATAL: {
        bg: 'bg-red-900/80',
        border: 'border-red-500',
        text: 'text-red-100',
        badge: 'bg-red-600 text-white',
        icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
    },
    HIGH: {
        bg: 'bg-orange-900/60',
        border: 'border-orange-400',
        text: 'text-orange-100',
        badge: 'bg-orange-600 text-white',
        icon: <AlertTriangle className="w-5 h-5 text-orange-300" />,
    },
    MEDIUM: {
        bg: 'bg-amber-900/40',
        border: 'border-amber-400',
        text: 'text-amber-100',
        badge: 'bg-amber-600 text-white',
        icon: <AlertCircle className="w-5 h-5 text-amber-300" />,
    },
    LOW: {
        bg: 'bg-blue-900/30',
        border: 'border-blue-400',
        text: 'text-blue-100',
        badge: 'bg-blue-600 text-white',
        icon: <Info className="w-5 h-5 text-blue-300" />,
    },
};

const ResultsSection = ({ results, onBookingClick, onReaudit, isCached }) => {
    if (!results) return null;

    const { mode = 'business', totalScore, brandClass = "MODERATE", status = "Competitive", brandIntelligence, breakdown, opportunityReason, leadColor, websiteStatus, topImprovements, simulator } = results;

    // Extract performance gaps (where earned < possible)
    const performanceGaps = [];
    if (breakdown) {
        Object.values(breakdown).forEach(tier => {
            if (tier?.details) {
                tier.details.forEach(detail => {
                    if (detail.earned < detail.possible) {
                        performanceGaps.push(detail);
                    }
                });
            }
        });
    }

    // Sort gaps by impact
    const impactWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
    performanceGaps.sort((a, b) => (impactWeight[b.impact] || 0) - (impactWeight[a.impact] || 0));

    // Platform icons
    const platformIcons = {
        google: (
            <img
                src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
                alt="Google"
                className="w-full h-full object-contain"
            />
        ),
        social: (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 rounded-lg text-white">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.105a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
                </svg>
            </div>
        ),
        website: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-blue-400">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2" />
            </svg>
        ),
        // NEW — AI Search Readiness icon (brain/sparkle)
        aiReadiness: (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
                    <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6l-.7.5V17h-6v-1.5l-.7-.5A7 7 0 0 1 12 2z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 21h6M10 17v2M14 17v2" strokeLinecap="round" />
                    <path d="M9.5 9.5L12 7l2.5 2.5L12 12 9.5 9.5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        ),
    };

    // Human-friendly titles for breakdown keys (used for both legacy and new categories)
    const platformTitles = {
        google: 'Google Maps',
        website: 'Website',
        social: 'Social Presence',
        // NEW — AI Readiness key maps to friendly label
        aiReadiness: 'AI Search Readiness',
        // Legacy business health tier keys
        legitimacy: 'Business Legitimacy',
        trust: 'Customer Trust',
        visibility: 'Visibility Power',
        conversion: 'Customer Conversion',
        competitive: 'Competitive Strength',
    };

    // Helper: pick the right icon for a breakdown key
    const getIcon = (key) => {
        if (key === 'aiReadiness') return platformIcons.aiReadiness;
        if (key === 'website') return platformIcons.website;
        if (key === 'social' || key === 'leadQuality') return platformIcons.social;
        return platformIcons.google;
    };

    return (
        <section className="relative min-h-screen py-20 bg-gradient-to-b from-blue-50 via-white to-green-50">
            <div className="container-custom">
                <ScoreCard
                    mode={mode}
                    score={totalScore}
                    status={status}
                    brandClass={brandClass}
                    brandIntelligence={brandIntelligence}
                    businessName={results.businessName}
                    businessImage={results.businessImage}
                    googleMapsUrl={results.googleMapsUrl}
                    opportunityReason={opportunityReason}
                    leadColor={leadColor}
                    websiteStatus={websiteStatus}
                />

                {/* ── NEW: BUSINESS SNAPSHOT GALLERY ── */}
                <div className="mb-10 w-full mt-6">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                            {results.businessName} <span className="font-medium text-slate-400 text-lg ml-1">Visual footprint</span>
                        </h3>
                    </div>
                    {(() => {
                        const hasPhotos = results.scrapedData?.photos && results.scrapedData.photos.length > 0;
                        const displayPhotos = hasPhotos
                            ? results.scrapedData.photos.slice(0, 5)
                            : [
                                "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
                                "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=800",
                                "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800",
                                "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800",
                                "https://images.unsplash.com/photo-1582653291997-079a1c04e5d1?auto=format&fit=crop&q=80&w=800"
                            ];

                        return (
                            <div className="relative">
                                {!hasPhotos && (
                                    <div className="absolute top-4 left-4 z-10 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        No authentic photos found. Showing standard examples.
                                    </div>
                                )}
                                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory pt-2 px-2 no-scrollbar">
                                    {displayPhotos.map((photoUrl, idx) => (
                                        <div
                                            key={idx}
                                            className="relative shrink-0 w-64 h-48 md:w-72 md:h-52 rounded-2xl overflow-hidden shadow-md border border-slate-200 snap-center hover:shadow-xl transition-all hover:-translate-y-1 group"
                                        >
                                            <img
                                                src={photoUrl}
                                                alt={`${results.businessName} showcase ${idx + 1}`}
                                                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${!hasPhotos ? 'grayscale-[30%]' : ''}`}
                                                referrerPolicy="no-referrer"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                            {/* Fallback pattern if image is blocked */}
                                            <div style={{ display: 'none' }} className="absolute inset-0 bg-slate-100 flex-col items-center justify-center text-slate-400">
                                                <Store className="w-8 h-8 mb-2 opacity-50" />
                                                <span className="text-sm font-medium">Image unavailable</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Market Intelligence / Local Demand Scanner */}
                {results.advancedIntelligence?.localDemand && (
                    <div className="mb-8">
                        <MarketIntelligenceCard
                            localDemand={results.advancedIntelligence.localDemand}
                            mode={mode}
                        />
                    </div>
                )}

                {/* Re-Audit Button */}
                {onReaudit && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="mb-6 flex justify-center"
                    >
                        {isCached ? (
                            <div className="flex flex-col sm:flex-row items-center gap-3 px-6 py-4 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
                                <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                                    <Info className="w-4 h-4" />
                                    <span>Showing cached results</span>
                                </div>
                                <button
                                    onClick={onReaudit}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg shadow-md hover:from-orange-600 hover:to-amber-600 hover:shadow-lg transition-all duration-200 text-sm"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Re-Audit for Fresh Data
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onReaudit}
                                className="inline-flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200 text-sm font-medium"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Re-Audit
                            </button>
                        )}
                    </motion.div>
                )}

                {/* Breakdown Grid — 3 Groups: Opportunity Analysis, Market Context, Lead Quality */}
                {mode === 'business' ? (
                    <>
                        <ImprovementPanel improvements={topImprovements} />
                        <ImprovementSimulator baseScore={totalScore} simulator={simulator} />

                        {/* Breakdown Cards — uses breakdown key for icon & label resolution */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 mt-12">
                            <h2 className="col-span-full text-2xl font-bold font-heading mb-4 px-2">Detailed Health Audit</h2>
                            {Object.entries(breakdown || {}).map(([key, tier]) => (
                                <BreakdownCard
                                    key={key}
                                    platform={platformTitles[key] || tier?.title || key}
                                    icon={getIcon(key)}
                                    score={Math.max(0, tier?.score || 0)}
                                    maxScore={tier?.maxScore || 100}
                                    breakdown={tier?.details || []}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Pro-mode Breakdown Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {Object.entries(breakdown || {}).map(([key, group]) => (
                                <BreakdownCard
                                    key={key}
                                    platform={platformTitles[key] || group?.title || key}
                                    icon={getIcon(key)}
                                    score={Math.max(0, group?.score || 0)}
                                    maxScore={group?.maxScore || 100}
                                    breakdown={group?.details || []}
                                />
                            ))}
                        </div>

                        {/* ═══════════════════════════════════════════════ */}
                        {/* PERFORMANCE GAPS — Structured Severity Panel    */}
                        {/* ═══════════════════════════════════════════════ */}
                        {performanceGaps.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="mb-8"
                            >
                                <div className="bg-gray-950 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                                    {/* Header */}
                                    <div className="px-6 py-5 bg-gradient-to-r from-gray-900 to-gray-950 border-b border-gray-800">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-red-600/20 rounded-lg shadow-lg">
                                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                        Competitive Performance Gaps
                                                    </h3>
                                                    <div className="text-2xl font-black text-white flex items-center gap-2">
                                                        Identified Areas for Category Dominance
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="hidden md:flex flex-col items-end">
                                                <div className="text-sm text-gray-400">Total Gaps</div>
                                                <div className="text-2xl font-bold text-red-400">{performanceGaps.length}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Failure List */}
                                    <div className="p-4 md:p-6 space-y-3">
                                        {performanceGaps.map((gap, index) => {
                                            // Map impact to visual severity
                                            const severityKey = gap.impact === 'High' ? 'FATAL' : gap.impact === 'Medium' ? 'HIGH' : 'LOW';
                                            const config = severityConfig[severityKey] || severityConfig.LOW;

                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.4 + index * 0.05 }}
                                                    className={`flex justify-between items-center gap-4 p-4 rounded-lg border ${config.bg} ${config.border}/30`}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="shrink-0 mt-0.5">
                                                            {config.icon}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider ${config.badge}`}>
                                                                    {gap.impact} IMPACT
                                                                </span>
                                                                <span className="text-gray-300 font-bold text-sm">
                                                                    Score Lost: {gap.possible - gap.earned} pts
                                                                </span>
                                                            </div>
                                                            <p className={`text-sm ${config.text}`}>
                                                                {gap.text}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {/* Footer CTA */}
                                    <div className="px-6 py-4 bg-gradient-to-r from-gray-900 to-gray-950 border-t border-gray-800">
                                        <p className="text-center text-gray-400 text-sm">
                                            Closing these gaps will directly improve your local market execution velocity.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}

                {/* AI Suggestions Section */}
                <AiSuggestions businessData={results} />

                {/* CTA Section */}
                <CTASection onBookingClick={onBookingClick} />
            </div>
        </section >
    );
};

export default ResultsSection;
