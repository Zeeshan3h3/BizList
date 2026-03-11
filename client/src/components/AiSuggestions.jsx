import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Globe, MessageSquare, Star, Zap, AlertCircle, ShieldAlert, Clock, MessageCircle } from 'lucide-react';
import axios from 'axios';

const AiSuggestions = ({ businessData }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!businessData) return;

            try {
                const payload = {
                    businessName: businessData.businessName,
                    totalScore: businessData.totalScore,
                    brandClass: businessData.brandClass || 'Emerging Brand',
                    brandIntelligence: businessData.brandIntelligence || {},
                    performanceBreakdown: businessData.breakdown || {}
                };
                const response = await axios.post('/api/suggestions', payload);

                if (response.data.success) {
                    setSuggestions(response.data.suggestions);
                }
            } catch (err) {
                console.error("AI Fetch Error:", err);
                setError("AI Consultant is momentarily unavailable.");
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [businessData]);

    const getIcon = (iconName) => {
        const icons = { Star, Globe, TrendingUp, MessageSquare, Zap, ShieldAlert, Clock, MessageCircle, AlertCircle };
        const IconComponent = icons[iconName] || Sparkles;
        return <IconComponent className="w-6 h-6 text-white" />;
    };

    const getActionStyle = (type) => {
        switch (type) {
            case 'URGENT': return 'bg-red-500 shadow-red-200';
            case 'GROWTH': return 'bg-emerald-500 shadow-emerald-200';
            case 'TRUST': return 'bg-blue-500 shadow-blue-200';
            default: return 'bg-indigo-500 shadow-indigo-200';
        }
    };

    const getTagStyle = (type) => {
        switch (type) {
            case 'URGENT': return 'bg-red-50 text-red-700 border-red-100';
            case 'GROWTH': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'TRUST': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
        }
    };

    const score = businessData?.totalScore || 0;
    const getThemeConfig = () => {
        if (score >= 70) return {
            container: 'bg-gradient-to-br from-green-50/90 via-white/90 to-emerald-50/90 border-green-200',
            glow: 'bg-green-400',
            headerIcon: 'bg-green-600',
            text: 'text-green-950',
            subText: 'text-green-700/80'
        };
        if (score >= 40) return {
            container: 'bg-gradient-to-br from-amber-50/90 via-white/90 to-orange-50/90 border-amber-200',
            glow: 'bg-amber-400',
            headerIcon: 'bg-amber-600',
            text: 'text-amber-950',
            subText: 'text-amber-700/80'
        };
        return {
            container: 'bg-gradient-to-br from-red-50/90 via-white/90 to-rose-50/90 border-red-200',
            glow: 'bg-red-400',
            headerIcon: 'bg-red-600',
            text: 'text-red-950',
            subText: 'text-red-700/80'
        };
    };
    const theme = getThemeConfig();

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg border border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg animate-pulse">
                        <Sparkles className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Analysing Weaknesses...</h2>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-gray-50 rounded-lg animate-pulse border border-gray-100" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) return null; // Hide silently on error to not disrupt UX

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl mx-auto mt-8 relative"
        >
            <div className={`backdrop-blur-sm rounded-2xl shadow-xl border overflow-hidden transition-colors duration-1000 ${theme.container}`}>
                {/* Background Decorative Elements */}
                <motion.div
                    className={`absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none ${theme.glow}`}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.15, 0.3, 0.15],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="p-6 md:p-8 relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`p-3 rounded-xl shadow-lg transition-colors duration-1000 ${theme.headerIcon}`}>
                            <ShieldAlert className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className={`text-2xl font-bold transition-colors duration-1000 ${theme.text}`}>Critical Growth Targets</h2>
                            <p className={`text-sm transition-colors duration-1000 ${theme.subText}`}>Priority actions for {businessData.businessName}</p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {suggestions.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`group relative bg-white border rounded-xl p-5 hover:shadow-lg transition-all duration-300 ${item.action_type === 'URGENT' ? 'border-red-100 hover:border-red-300' : 'border-gray-100 hover:border-indigo-200'}`}
                            >
                                <div className="flex flex-col md:flex-row gap-5 items-start">
                                    <div className={`p-3 rounded-lg shrink-0 shadow-lg ${getActionStyle(item.action_type)}`}>
                                        {getIcon(item.icon)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
                                                {item.title}
                                            </h3>
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getTagStyle(item.action_type)}`}>
                                                {item.action_type}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed text-sm">
                                            {item.description}
                                        </p>
                                        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-gray-500">
                                            <TrendingUp className="w-3 h-3" />
                                            Target Impact: <span className="text-gray-700">{item.impact}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AiSuggestions;
