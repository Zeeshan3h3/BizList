import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';
import PageWrapper from '../components/layout/PageWrapper';

const RecentAuditsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const isProMode = location.pathname.startsWith('/pro');

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchAudits();
    }, []);

    const fetchAudits = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/audits/recent`, {
                params: {
                    limit: 50,
                    mode: isProMode ? 'pro' : 'business'
                },
                timeout: 5000
            });
            if (response.data && response.data.audits) {
                setAudits(response.data.audits);
            }
        } catch (err) {
            console.error('Failed to fetch audits:', err);
            setError('Could not load audits. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (audit) => {
        const params = new URLSearchParams({
            business: audit.businessName,
            area: audit.area || '',
            ...(audit.placeUrl ? { placeUrl: audit.placeUrl } : {})
        });
        navigate(`/${isProMode ? 'pro/scan' : 'check'}?${params.toString()}`);
    };

    const filteredAudits = audits.filter(audit =>
        audit.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.area?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getScoreVal = (audit) => {
        return typeof audit.healthScore === 'object'
            ? audit.healthScore?.totalScore || 0
            : audit.healthScore || 0;
    };

    const getImageUrl = (audit) => {
        const scrapedPhotos = audit.scrapedData?.photos;
        const businessImage = typeof audit.healthScore === 'object' ? audit.healthScore?.businessImage : null;

        return businessImage ||
            (scrapedPhotos && scrapedPhotos.length > 0 ? scrapedPhotos[0] : null) ||
            audit.scrapedData?.googleMapsData?.thumbnail ||
            audit.scrapedData?.websiteData?.imageUrl ||
            `https://placehold.co/800x600/e2e8f0/475569?text=${encodeURIComponent(audit.businessName)}`;
    };

    const getTimeAgo = (date) => {
        if (!date) return '';
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 30) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <PageWrapper>
            <div className={`${isProMode ? 'bg-slate-950' : 'bg-gradient-to-b from-blue-50 via-white to-green-50'} min-h-screen pt-32 pb-20`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h1 className={`text-4xl md:text-5xl font-bold mb-4 tracking-tight ${isProMode ? 'text-white' : 'text-slate-900'}`}>
                            {isProMode ? 'Agency' : 'Recent'} <span className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">{isProMode ? 'Leads' : 'Audits'}</span>
                        </h1>
                        <p className={`text-lg max-w-2xl mx-auto ${isProMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {isProMode ? 'Browse all recently scanned agency leads.' : 'Browse all recently audited businesses.'} Click any card to view the full audit report.
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="max-w-xl mx-auto mb-12"
                    >
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by business name or area..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-12 pr-4 py-4 rounded-2xl border ${isProMode ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'} shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                            />
                        </div>
                    </motion.div>

                    {/* Results Count */}
                    {!loading && !error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-slate-500 mb-6 text-center"
                        >
                            Showing {filteredAudits.length} of {audits.length} {isProMode ? 'leads' : 'audits'}
                        </motion.p>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className={`animate-pulse ${isProMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading {isProMode ? 'leads' : 'audits'}...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="text-center py-20">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isProMode ? 'bg-red-500/10' : 'bg-red-50'}`}>
                                <span className="text-3xl">⚠️</span>
                            </div>
                            <p className={`mb-4 ${isProMode ? 'text-slate-400' : 'text-slate-600'}`}>{error}</p>
                            <button
                                onClick={fetchAudits}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && filteredAudits.length === 0 && (
                        <div className="text-center py-20">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isProMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-100'}`}>
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${isProMode ? 'text-white' : 'text-slate-800'}`}>
                                {searchTerm ? `No matching ${isProMode ? 'leads' : 'audits'}` : `No ${isProMode ? 'leads' : 'audits'} yet`}
                            </h3>
                            <p className={`mb-6 ${isProMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {searchTerm
                                    ? 'Try a different search term.'
                                    : `Run your first business audit to see it here!`}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                                >
                                    Run an Audit <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Audit Cards Grid */}
                    {!loading && !error && filteredAudits.length > 0 && (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAudits.map((audit, i) => {
                                const scoreVal = getScoreVal(audit);
                                const imageUrl = getImageUrl(audit);

                                return (
                                    <motion.div
                                        key={audit._id || i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: i * 0.05 }}
                                        onClick={() => handleCardClick(audit)}
                                        className={`rounded-2xl overflow-hidden shadow-lg border hover:shadow-xl transition-all hover:-translate-y-1 group cursor-pointer ${isProMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-100'}`}
                                    >
                                        {/* Image */}
                                        <div className="h-48 overflow-hidden relative bg-slate-100">
                                            <div className={`absolute top-3 right-3 z-10 text-white font-bold px-3 py-1 rounded-full text-sm shadow-md ${scoreVal >= 70 ? 'bg-green-500' :
                                                scoreVal >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                                }`}>
                                                Score: {scoreVal}
                                            </div>
                                            <img
                                                src={imageUrl}
                                                alt={audit.businessName}
                                                referrerPolicy="no-referrer"
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                            <div style={{ display: 'none' }} className="absolute inset-0 bg-slate-100 items-center justify-center">
                                                <span className="text-4xl">🏪</span>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-5">
                                            <h3 className={`font-bold text-lg mb-1 truncate ${isProMode ? 'text-white' : 'text-slate-800'}`}>
                                                {audit.businessName}
                                            </h3>
                                            {audit.area && (
                                                <p className={`text-xs mb-2 truncate ${isProMode ? 'text-slate-400' : 'text-slate-400'}`}>
                                                    📍 {audit.area}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <p className="text-slate-500 text-sm flex items-center gap-1">
                                                    <span className={`w-2 h-2 rounded-full inline-block ${scoreVal >= 70 ? 'bg-green-500' :
                                                        scoreVal >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                                        }`}></span>
                                                    {scoreVal >= 70 ? 'Excellent' :
                                                        scoreVal >= 40 ? 'Gaps Detected' : 'Critical'}
                                                </p>
                                                {audit.createdAt && (
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {getTimeAgo(audit.createdAt)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default RecentAuditsPage;
