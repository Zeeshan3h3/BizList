import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldCheck } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';
import PageWrapper from '../components/layout/PageWrapper';
import BusinessSearchSelector from '../components/BusinessSearchSelector';
import HeroSection from '../components/home/HeroSection';
import AgencyIntro from '../components/home/AgencyIntro';
import ProblemSection from '../components/home/ProblemSection';
import PricingSection from '../components/ui/PricingSection';

/**
 * HomePage - Agency Pivot
 * Focuses on offering an Audit as the primary lead gen magnet.
 */
const HomePage = () => {
    const navigate = useNavigate();
    const [recentAudits, setRecentAudits] = useState([]);
    const [isLoadingAudits, setIsLoadingAudits] = useState(true);

    useEffect(() => {
        const fetchRecentAudits = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/audits/recent?mode=business`, { timeout: 3000 });
                if (response.data && response.data.audits && response.data.audits.length > 0) {
                    setRecentAudits(response.data.audits.slice(0, 3));
                }
            } catch (err) {
                console.error("Failed to fetch recent audits, falling back to specific examples:", err);
            } finally {
                setIsLoadingAudits(false);
            }
        };

        fetchRecentAudits();
    }, []);

    // Handle when user selects a business and clicks "Run Audit"
    const handleAuditStart = (businessInfo) => {
        // businessInfo contains: { placeUrl, businessName, area }
        const params = new URLSearchParams({
            business: businessInfo.businessName,
            area: businessInfo.area,
            placeUrl: businessInfo.placeUrl
        });
        navigate(`/check?${params.toString()}`);
    };

    return (
        <PageWrapper>
            {/* Hero Section */}
            <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-white via-indigo-50/50 to-purple-50 pt-16 lg:pt-24 pb-20 lg:pb-24">
                {/* Background Modern Glows */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] opacity-70 animate-pulse mix-blend-multiply pointer-events-none"></div>
                <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-purple-400/20 rounded-full blur-[120px] opacity-60 mix-blend-multiply pointer-events-none" style={{ animationDelay: '2s' }}></div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4 lg:mt-8">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
                        <HeroSection />

                        {/* RIGHT COLUMN — Run Audit CTA Visual */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex flex-col items-center justify-center gap-8 mt-12 lg:mt-0"
                        >
                            {/* Main glowing card */}
                            <div className="relative w-full max-w-sm mx-auto">
                                {/* Glow ring */}
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 blur-2xl opacity-20 scale-105"></div>
                                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-[0_20px_60px_-12px_rgba(99,102,241,0.25)] border border-indigo-100 flex flex-col items-center gap-6 text-center">
                                    {/* Pulse indicator */}
                                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Free Instant Audit
                                    </div>

                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>

                                    <div>
                                        <p className="text-2xl font-black text-slate-800 mb-1">Score Your Business</p>
                                        <p className="text-slate-500 text-sm">Google • Website • AI Readiness</p>
                                    </div>

                                    {/* RUN AUDIT button */}
                                    <button
                                        onClick={() => {
                                            document.getElementById('audit-tool')?.scrollIntoView({ behavior: 'smooth' });
                                            setTimeout(() => {
                                                const input = document.querySelector('input[placeholder*="Search"]');
                                                if (input) input.focus();
                                            }, 600);
                                        }}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-[0_8px_30px_rgba(99,102,241,0.4)] hover:shadow-[0_8px_40px_rgba(99,102,241,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        RUN AUDIT — It's Free
                                    </button>

                                    {/* Trust micro-badges */}
                                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-100 w-full">
                                        {['No signup needed', 'Results in 30s', '100% Free'].map(label => (
                                            <span key={label} className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── AUDIT TOOL SECTION (moved below hero) ── */}
            <section id="audit-tool" className="relative bg-gradient-to-b from-purple-50 to-indigo-50 py-16 scroll-mt-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_-12px_rgba(99,102,241,0.2)] border border-white relative text-left"
                    >
                        {/* Live Audit Mini Badge */}
                        <div className="absolute top-0 right-10 -translate-y-1/2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            Live Audit Tool
                        </div>

                        <h3 className="text-3xl font-black text-slate-800 text-center mb-3">Get Your Free Digital Audit</h3>
                        <p className="text-slate-500 text-center text-sm font-medium mb-8 pb-6 border-b border-slate-100">Enter your business details below to instantly check your online presence and score.</p>
                        <BusinessSearchSelector onAuditStart={handleAuditStart} />
                    </motion.div>
                </div>
            </section>

            {/* Wave Divider */}
            <div className="w-full overflow-hidden leading-none bg-slate-900 border-none m-0 p-0 relative -mt-1">
                <svg className="relative block w-full h-[50px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-purple-50"></path>
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.15,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".5" className="fill-indigo-50"></path>
                    <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" className="fill-white"></path>
                </svg>
            </div>

            {/* Why Small Businesses Lose Customers Section */}
            <ProblemSection />

            <div className="py-12 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Agency Intro Component below hero */}
                    <div className="w-full max-w-4xl mx-auto relative z-40 mb-16 mt-[-100px]">
                        <AgencyIntro />
                    </div>

                    {/* Recently Audited Section - only shows when real audits exist */}
                    {!isLoadingAudits && recentAudits.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="mb-20"
                        >
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-8 text-center">
                                Recently Audited Local Brands
                            </p>

                            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                                {recentAudits.map((place, i) => {
                                    const scoreVal = typeof place.healthScore === 'object' ? place.healthScore?.totalScore || 0 : place.healthScore || 0;

                                    const scrapedPhotos = place.scrapedData?.photos;
                                    const businessImage = typeof place.healthScore === 'object' ? place.healthScore?.businessImage : null;

                                    const imageUrl = businessImage ||
                                        (scrapedPhotos && scrapedPhotos.length > 0 ? scrapedPhotos[0] : null) ||
                                        place.scrapedData?.googleMapsData?.thumbnail ||
                                        place.scrapedData?.websiteData?.imageUrl ||
                                        `https://placehold.co/800x600/e2e8f0/475569?text=${encodeURIComponent(place.businessName)}`;

                                    return (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                const params = new URLSearchParams({
                                                    business: place.businessName,
                                                    area: place.area || '',
                                                    ...(place.placeUrl ? { placeUrl: place.placeUrl } : {})
                                                });
                                                navigate(`/check?${params.toString()}`);
                                            }}
                                            className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1 group text-left cursor-pointer"
                                        >
                                            <div className="h-48 overflow-hidden relative bg-slate-100">
                                                <div className={`absolute top-3 right-3 z-10 text-white font-bold px-3 py-1 rounded-full text-sm shadow-md ${scoreVal >= 70 ? 'bg-green-500' :
                                                    scoreVal >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                                    }`}>
                                                    Score: {scoreVal}
                                                </div>
                                                <img
                                                    src={imageUrl}
                                                    alt={place.businessName}
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
                                            <div className="p-5">
                                                <h3 className="font-bold text-lg text-slate-800 mb-1 truncate">{place.businessName}</h3>
                                                <p className="text-slate-500 text-sm flex flex-wrap items-center gap-1">
                                                    <span className={`w-2 h-2 rounded-full inline-block ${scoreVal >= 70 ? 'bg-green-500' : scoreVal >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                                                    {scoreVal >= 70 ? 'Excellent Digital Presence' :
                                                        scoreVal >= 40 ? 'Gaps Detected' : 'Critical Failures Detected'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Imported Agency Sections */}
            <PricingSection />

            {/* Final CTA Section */}
            <section className="py-24 bg-gradient-to-br from-slate-900 to-indigo-950 text-center px-4">
                <div className="max-w-3xl mx-auto relative z-10">
                    <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6">
                        Not sure where your business stands?
                    </h2>
                    <p className="text-xl text-indigo-200 mb-10">
                        Don't let competitors steal your local customers. Run a free instant audit and find out exactly what needs fixing.
                    </p>
                    <button
                        onClick={() => {
                            document.getElementById('check-score')?.scrollIntoView({ behavior: 'smooth' });
                            // Focus the input to prompt interaction
                            setTimeout(() => {
                                const input = document.querySelector('input[placeholder*="Search for your business"]');
                                if (input) input.focus();
                            }, 500);
                        }}
                        className="bg-white text-indigo-900 px-10 py-5 rounded-full font-bold shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-105 transition-transform text-lg inline-flex items-center gap-3"
                    >
                        Run a FREE BizCheck Audit
                        <ShieldCheck className="w-6 h-6 text-indigo-600" />
                    </button>
                </div>
            </section>
        </PageWrapper>
    );
};

export default HomePage;
