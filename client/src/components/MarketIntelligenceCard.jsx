import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Users, AlertCircle } from 'lucide-react';

const MarketIntelligenceCard = ({ localDemand, mode }) => {
    if (!localDemand || !localDemand.metrics) return null;

    const { metrics, labels, insights, insightDetails } = localDemand;

    // Theme colors based on mode
    const isPro = mode === 'pro';
    const cardBg = isPro ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
    const textColor = isPro ? 'text-white' : 'text-slate-900';
    const subtextColor = isPro ? 'text-slate-400' : 'text-slate-500';
    const panelBg = isPro ? 'bg-slate-800/50' : 'bg-slate-50';
    const barEmptyColor = isPro ? 'bg-slate-800' : 'bg-slate-200';

    // Gradient for the opportunity metric
    const getGradientFields = (val) => {
        if (val > 70) return 'from-green-500 to-emerald-400';
        if (val > 40) return 'from-amber-500 to-yellow-400';
        return 'from-red-500 to-rose-400';
    };

    const ProgressBar = ({ label, value, labelVal }) => {
        const colorClass = getGradientFields(value);
        return (
            <div className="mb-4 last:mb-0">
                <div className="flex justify-between items-end mb-1.5">
                    <span className={`text-sm font-medium ${textColor}`}>{label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPro ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                        {labelVal} ({value}/100)
                    </span>
                </div>
                <div className={`h-2.5 w-full rounded-full overflow-hidden ${barEmptyColor}`}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
                    />
                </div>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border shadow-sm overflow-hidden ${cardBg}`}
        >
            <div className={`px-6 py-4 border-b flex items-center gap-3 ${isPro ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className={`p-2 rounded-lg ${isPro ? 'bg-indigo-500/20 text-indigo-400' : 'bg-blue-50 text-blue-600'}`}>
                    <Target className="w-5 h-5" />
                </div>
                <div>
                    <h3 className={`font-bold text-lg leading-tight ${textColor}`}>Local Market Intelligence</h3>
                    <p className={`text-xs ${subtextColor}`}>Demand vs Competition Analysis</p>
                </div>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-8">
                {/* Left Side: The Radar */}
                <div>
                    <h4 className={`text-sm font-bold uppercase tracking-wider mb-5 flex items-center gap-2 ${subtextColor}`}>
                        <TrendingUp className="w-4 h-4" /> Opportunity Radar
                    </h4>

                    <div className="space-y-6">
                        <ProgressBar
                            label="Market Demand"
                            value={metrics.demandScore}
                            labelVal={labels.demandLevel}
                        />
                        <ProgressBar
                            label="Competition Density"
                            value={metrics.competitionScore}
                            // For competition, lower is usually better for opportunity, so we might want to invert the color visually if we were purely looking at opportunity.
                            // But keeping the standard scale is fine for now.
                            labelVal={labels.competitionLevel}
                        />

                        <div className={`mt-6 pt-5 border-t ${isPro ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className={`font-bold flex items-center gap-2 ${textColor}`}>
                                    Opportunity Index
                                </span>
                                <span className={`text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r ${getGradientFields(metrics.opportunityIndex)}`}>
                                    {metrics.opportunityIndex}
                                </span>
                            </div>
                            <p className={`text-xs ${subtextColor}`}>Overall viability of capturing this specific local market.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Insights */}
                <div className={`rounded-xl p-5 ${panelBg}`}>
                    <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${subtextColor}`}>
                        <Users className="w-4 h-4" /> Strategic Insights
                    </h4>

                    <ul className="space-y-4">
                        {insights.map((insight, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <div className={`mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full ${isPro ? 'bg-indigo-400' : 'bg-blue-500'}`} />
                                <span className={`text-sm leading-snug ${textColor}`}>{insight}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Stats mini-bar */}
                    <div className={`mt-6 pt-4 border-t grid grid-cols-2 gap-4 ${isPro ? 'border-slate-700/50' : 'border-slate-200'}`}>
                        <div>
                            <div className={`text-xs font-medium mb-1 ${subtextColor}`}>Total Market Reviews</div>
                            <div className={`font-bold ${textColor}`}>{insightDetails.totalMarketReviews.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className={`text-xs font-medium mb-1 ${subtextColor}`}>Dominant Competitors</div>
                            <div className={`font-bold ${textColor}`}>{insightDetails.strongCompetitors} / {insightDetails.totalCompetitorsAnalyzed}</div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MarketIntelligenceCard;
