import React, { useState, useEffect, useCallback, memo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import { runAudit } from '../services/api';
import PageWrapper from '../components/layout/PageWrapper';
import LoadingScreen from '../components/LoadingScreen';
import ResultsSection from '../components/ResultsSection';

// Catches render-time crashes in child components (ResultsSection, etc.)
class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
                        <p className="text-slate-500 mb-6">The results view encountered an unexpected error.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

/**
 * Shapes the raw API response into the props ResultsSection expects.
 * Keeps the mapping in one place and makes it easy to unit-test.
 */
function normalizeAuditData(data, fallbackName, fallbackArea) {
    return {
        brandClass: data.brandClass || data.leadType || 'MODERATE',
        leadType: data.leadType || 'MODERATE',
        leadColor: data.leadColor || '#EAB308',
        opportunityReason: data.opportunityReason || '',
        brandIntelligence: data.brandIntelligence ?? null,
        totalScore: data.totalScore ?? 0,
        breakdown: data.breakdown ?? {},
        layers: data.layers ?? {},
        websiteStatus: data.websiteStatus || 'none',
        websiteQualityScore: data.websiteQualityScore ?? 0,
        businessName: data.businessName || fallbackName,
        area: data.area || fallbackArea,
        scrapedAt: data.scrapedAt || new Date().toISOString(),
        businessImage: data.businessImage ?? null,
        googleMapsUrl: data.googleMapsUrl ?? null,
        advancedIntelligence: data.advancedIntelligence ?? null
    };
}

const ScorePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [isCached, setIsCached] = useState(false);

    const businessName = searchParams.get('business') || '';
    const area = searchParams.get('area') || '';
    const placeUrl = searchParams.get('placeUrl') || '';

    const runAuditRequest = useCallback(async (forceReaudit = false) => {
        // Prevent concurrent runs from effect
        if (status === 'loading') return;

        if (!businessName && !placeUrl) {
            setStatus('error');
            setError('Missing search parameters. Please go back and try again.');
            return;
        }

        setStatus('loading');
        setError(null);
        setIsCached(false);

        const params = placeUrl
            ? { placeUrl, businessName, area, forceReaudit }
            : { businessName, area, forceReaudit };

        try {
            const response = await runAudit(params);

            if (response.success && response.data) {
                setResults(normalizeAuditData(response.data, businessName, area));
                setIsCached(!!response.data.cached);
                setStatus('success');
            } else {
                setError(response.error || 'Failed to fetch results. Please try again.');
                setStatus('error');
            }
        } catch (err) {
            console.error("Audit request failed:", err);
            setError(err.message || 'Failed to fetch results. Please try again.');
            setStatus('error');
        }
    }, [businessName, area, placeUrl]); // remove status from deps so it doesn't re-trigger

    // On mount, run the audit. We use a ref to ensure we only run it once.
    const hasRun = React.useRef(false);
    useEffect(() => {
        if (!hasRun.current) {
            hasRun.current = true;
            runAuditRequest();
        }
    }, [businessName, area, placeUrl]); // Intentionally omitting runAuditRequest to break infinite loops

    if (status === 'loading') return <LoadingScreen />;

    if (status === 'error') {
        return (
            <PageWrapper>
                <div className="min-h-[80vh] flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert className="w-7 h-7 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Audit Failed</h2>
                        <p className="text-slate-500 mb-6 text-sm">{error}</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                            >
                                <ArrowLeft size={16} /> Go Back
                            </button>
                            <button
                                onClick={() => runAuditRequest()}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
                            >
                                <RefreshCw size={16} /> Retry
                            </button>
                        </div>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    if (!results) {
        return (
            <PageWrapper>
                <div className="min-h-[80vh] flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">No Business Selected</h2>
                        <p className="text-slate-500 mb-6 text-sm">Please go back and search for a business to audit.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 mx-auto transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to Home
                        </button>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <ErrorBoundary>
            <PageWrapper>
                <ResultsSection
                    results={results}
                    onBookingClick={() => { }}
                    onReaudit={() => runAuditRequest(true)}
                    isCached={isCached}
                />
            </PageWrapper>
        </ErrorBoundary>
    );
};

export default memo(ScorePage);
