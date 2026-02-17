import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { runAudit } from '../services/api';
import PageWrapper from '../components/layout/PageWrapper';
import LoadingScreen from '../components/LoadingScreen';
import ResultsSection from '../components/ResultsSection';
import { ArrowLeft } from 'lucide-react';

/**
 * ScorePage - Integrates with existing audit system
 * Shows loading then animated results
 */
const ScorePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const businessName = searchParams.get('business');
    const area = searchParams.get('area');
    const placeUrl = searchParams.get('placeUrl'); // Get the exact Google Maps URL if provided

    useEffect(() => {
        if (businessName && area) {
            handleAudit();
        }
    }, [businessName, area, placeUrl]);

    const handleAudit = async () => {
        setLoading(true);
        setError(null);

        console.log('[SCORE PAGE] Starting audit with params:', { businessName, area, placeUrl });

        try {
            // If placeUrl is provided, use it for exact business auditing
            const auditParams = placeUrl
                ? { placeUrl, businessName, area }
                : { businessName, area };

            console.log('[SCORE PAGE] Calling audit API with:', auditParams);

            const response = await runAudit(auditParams);

            console.log('[SCORE PAGE] API Response:', response);

            if (response.success && response.data) {
                const data = response.data;
                console.log('[SCORE PAGE] Setting results:', data);

                // Defensive coding: Handle case where data might be missing or in different format (e.g. from cache)
                // Cache often returns { breakdown: { googleMaps: ... } } while fresh returns { google: ... }
                const googleData = data.google || (data.breakdown && data.breakdown.googleMaps) || { score: 0, details: [] };
                const justdialData = data.justdial || (data.breakdown && data.breakdown.justdial) || { score: 0, details: [] };
                const websiteData = data.website || (data.breakdown && data.breakdown.website) || { score: 0, details: [] };

                setResults({
                    totalScore: data.totalScore || 0,
                    breakdown: {
                        google: googleData,
                        justdial: justdialData,
                        website: websiteData
                    },
                    businessName: data.businessName || businessName,
                    area: data.area || area,
                    scrapedAt: data.scrapedAt || new Date().toISOString()
                });
            } else {
                console.error('[SCORE PAGE] API Error:', response.error);
                setError(response.error || 'Failed to fetch audit results');
            }
        } catch (err) {
            console.error('[SCORE PAGE] Exception during audit:', err);
            setError('An error occurred while fetching results. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <PageWrapper>
                <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-blue-50 via-white to-green-50">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops!</h2>
                        <p className="text-slate-600 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
                        >
                            <ArrowLeft size={20} />
                            Try Again
                        </button>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    if (!results) {
        return (
            <PageWrapper>
                <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-blue-50 via-white to-green-50">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Search Data</h2>
                        <p className="text-slate-600 mb-6">
                            Please go back and search for a business
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
                        >
                            <ArrowLeft size={20} />
                            Back to Home
                        </button>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            {/* Results with existing ResultsSection component */}
            <ResultsSection results={results} onBookingClick={() => {/* TODO */ }} />
        </PageWrapper>
    );
};

export default ScorePage;
