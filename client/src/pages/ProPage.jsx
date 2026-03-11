import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Server, Search, ArrowRight, Activity, Users, ShieldAlert } from 'lucide-react';
import BusinessSearchSelector from '../components/BusinessSearchSelector';
import ResultsSection from '../components/ResultsSection';
import LoadingScreen from '../components/LoadingScreen';
import { runAudit } from '../services/api';

const ProPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [loadingStep, setLoadingStep] = useState(1);
    const [isCached, setIsCached] = useState(false);
    const hasSearched = useRef(false);

    useEffect(() => {
        const business = searchParams.get('business');
        const area = searchParams.get('area');
        const placeUrl = searchParams.get('placeUrl');

        if (business && area && !hasSearched.current && !results && !loading) {
            hasSearched.current = true;
            handleSearch({ businessName: business, area, placeUrl });
        }
    }, [searchParams]);

    const handleSearch = async (businessData) => {
        setLoading(true);
        setError('');
        setResults(null);
        setLoadingStep(1);

        // Progress simulation for UX
        const interval = setInterval(() => {
            setLoadingStep(prev => prev < 4 ? prev + 1 : prev);
        }, 3000);

        try {
            // Include mode=pro to trigger the leadScorer.js engine
            const payload = { ...businessData, mode: 'pro' };

            const response = await runAudit(payload);

            clearInterval(interval);

            if (response.success && response.data) {
                const data = response.data;
                setIsCached(!!data.cached);

                setResults({
                    mode: 'pro',
                    brandClass: data.brandClass || data.leadType || 'MODERATE',
                    leadType: data.leadType || 'MODERATE',
                    leadColor: data.leadColor || '#EAB308',
                    opportunityReason: data.opportunityReason || '',
                    brandIntelligence: data.brandIntelligence || null,
                    totalScore: data.totalScore || 0,
                    breakdown: data.breakdown || {},
                    layers: data.layers || {},
                    websiteStatus: data.websiteStatus || 'none',
                    websiteQualityScore: data.websiteQualityScore || 0,
                    businessName: data.businessName || businessData.businessName,
                    area: data.area || businessData.area,
                    scrapedAt: data.scrapedAt || new Date().toISOString(),
                    businessImage: data.businessImage || null,
                    googleMapsUrl: data.googleMapsUrl || null
                });
            } else {
                setError(response.error || 'Failed to analyze business opportunity');
            }
        } catch (err) {
            clearInterval(interval);
            setError('An unexpected error occurred while analyzing the target.');
        } finally {
            clearInterval(interval);
            setLoading(false);
        }
    };

    const handleReaudit = () => {
        if (!results) return;
        if (window.confirm("Bypass cache and run a fresh deep scan? This will take 10-15 seconds.")) {
            handleSearch({
                businessName: results.businessName,
                area: results.area,
                forceReaudit: true
            });
        }
    };

    if (loading) {
        return <LoadingScreen step={loadingStep} mode="pro" />;
    }

    if (results) {
        return (
            <div className="bg-slate-50 min-h-screen">
                {/* Pro Header */}
                <div className="bg-slate-900 border-b border-slate-800 py-6 px-6 sticky top-0 z-40 shadow-md">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                <Activity className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white leading-tight">Lead Opportunity Scanner</h1>
                                <p className="text-slate-400 text-xs mt-0.5" > Analyzing: <span className="text-indigo-300 font-medium">{results.businessName}</span></p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setResults(null);
                                hasSearched.current = false;
                                navigate('/pro'); // Go back to Pro Home
                            }}
                            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            ← New Scan
                        </button>
                    </div>
                </div>

                <ResultsSection
                    results={results}
                    onReaudit={handleReaudit}
                    isCached={isCached}
                />
            </div>
        );
    }

    // Fallback UI if not loading or displaying results (though typically ProHome handles this)
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <p className="text-slate-400">Invalid Target Parameters</p>
        </div>
    );
};
export default ProPage;
