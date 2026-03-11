import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { runAudit } from '../services/api';
import { RefreshCw } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import LoadingScreen from '../components/LoadingScreen';
import ResultsSection from '../components/ResultsSection';
import { ArrowLeft } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', margin: '20px', fontFamily: 'monospace' }}>
                    <h2>React UI Crash Details:</h2>
                    <p><b>{this.state.error && this.state.error.toString()}</b></p>
                    <pre style={{ overflowX: 'auto', whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

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
    const [isCached, setIsCached] = useState(false);

    const businessName = searchParams.get('business');
    const area = searchParams.get('area');
    const placeUrl = searchParams.get('placeUrl'); // Get the exact Google Maps URL if provided

    useEffect(() => {
        if (businessName && area) {
            handleAudit();
        }
    }, [businessName, area, placeUrl]);

    const handleAudit = async (forceReaudit = false) => {
        setLoading(true);
        setError(null);
        setIsCached(false);

        console.log('[SCORE PAGE] Starting audit with params:', { businessName, area, placeUrl, forceReaudit });

        try {
            // If placeUrl is provided, use it for exact business auditing
            const auditParams = placeUrl
                ? { placeUrl, businessName, area, forceReaudit }
                : { businessName, area, forceReaudit };

            console.log('[SCORE PAGE] Calling audit API with:', auditParams);

            const response = await runAudit(auditParams);

            console.log('[SCORE PAGE] API Response:', response);

            if (response.success && response.data) {
                const data = response.data;
                console.log('[SCORE PAGE] Setting results:', data);

                // Track if result came from cache
                setIsCached(!!data.cached);

                // Defensive coding: Map the new architecture payload and fallback correctly
                setResults({
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
                    businessName: data.businessName || businessName,
                    area: data.area || area,
                    scrapedAt: data.scrapedAt || new Date().toISOString(),
                    businessImage: data.businessImage || null,
                    googleMapsUrl: data.googleMapsUrl || null
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

    const handleReaudit = () => {
        if (window.confirm('Run a fresh audit? This will overwrite the previous results.')) {
            handleAudit(true);
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
        <ErrorBoundary>
            <PageWrapper>
                {/* Results with existing ResultsSection component */}
                <ResultsSection
                    results={results}
                    onBookingClick={() => {/* TODO */ }}
                    onReaudit={handleReaudit}
                    isCached={isCached}
                />
            </PageWrapper>
        </ErrorBoundary>
    );
};

export default ScorePage;
