import React from 'react';
import { motion } from 'framer-motion';

const BreakdownCard = ({
    platform,
    icon,
    score,
    maxScore,
    breakdown = [],
}) => {
    const getItemIcon = (item) => {
        // Use emoji icon from backend if available
        if (item.icon) {
            return <span className="text-lg leading-none">{item.icon}</span>;
        }

        if (item.earned >= item.possible) {
            return (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.667 5L7.5 14.167 3.333 10" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        }
        if (item.impact === 'Medium' || item.impact === 'Low') {
            return (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L18.66 17H1.34L10 2Z" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                    <path d="M10 8v3M10 14h.01" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            );
        }
        if (item.impact === 'Critical') {
            return (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="#ef4444" strokeWidth="2" fill="none" />
                    <path d="M7 7l6 6M13 7l-6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                </svg>
            );
        }
        return (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    };

    const getScoreColor = () => {
        const ratio = maxScore > 0 ? score / maxScore : 0;
        if (ratio >= 0.6) return 'text-green-400';
        if (ratio >= 0.3) return 'text-amber-400';
        return 'text-red-500';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-xl p-6 h-full flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center">
                        {icon}
                    </div>
                    <h3 className="text-xl font-heading font-bold">{platform}</h3>
                </div>
                <div className="text-2xl font-bold">
                    <span className={getScoreColor()}>
                        {score}
                    </span>
                    <span className="text-slate-500">/{maxScore}</span>
                </div>
            </div>

            {/* Breakdown List */}
            <ul className="space-y-3">
                {breakdown.length > 0 ? (
                    breakdown.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm">
                            <div className="mt-0.5 shrink-0">
                                {getItemIcon(item)}
                            </div>
                            <span className={
                                item.impact === 'Critical' ? 'text-red-500 font-bold' :
                                    item.earned >= item.possible ? 'text-slate-700' :
                                        item.impact === 'High' ? 'text-red-600 font-medium' :
                                            item.impact === 'Medium' ? 'text-amber-500' :
                                                'text-amber-600'
                            }>
                                {item.text}
                            </span>
                        </li>
                    ))
                ) : (
                    <li className="text-slate-500 text-sm">No data available</li>
                )}
            </ul>
        </motion.div>
    );
};

export default BreakdownCard;
