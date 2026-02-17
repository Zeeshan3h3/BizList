import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const BreakdownCard = ({
    platform,
    icon,
    score,
    maxScore,
    breakdown = [],
    businessName,
    businessImage,
    googleMapsUrl
}) => {
    const getItemIcon = (status) => {
        if (status === 'success') {
            return (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.667 5L7.5 14.167 3.333 10" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        }
        return (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    };

    const [imageError, setImageError] = React.useState(false);

    const isGoogleMaps = platform === 'Google Maps';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-xl p-6"
        >
            {/* Business Image & Name (Google Maps only) */}
            {isGoogleMaps && businessName && (
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
                    {businessImage && !imageError && (
                        <img
                            src={businessImage}
                            alt={businessName}
                            className="w-16 h-16 rounded-lg object-cover shadow-md"
                            referrerPolicy="no-referrer"
                            onError={() => setImageError(true)}
                        />
                    )}
                    <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 text-lg">{businessName}</h4>
                        {googleMapsUrl && (
                            <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors mt-1"
                            >
                                <ExternalLink size={14} />
                                Visit Google Maps
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center">
                        {icon}
                    </div>
                    <h3 className="text-xl font-heading font-bold">{platform}</h3>
                </div>
                <div className="text-2xl font-bold">
                    <span className={score > 0 ? 'text-green-400' : 'text-red-400'}>
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
                            <div className="mt-0.5">
                                {getItemIcon(item.status)}
                            </div>
                            <span className={item.status === 'success' ? 'text-slate-700' : 'text-slate-500'}>
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
