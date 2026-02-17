import React from 'react';
import { motion } from 'framer-motion';
import BusinessSearchSelector from './BusinessSearchSelector';

const Hero = ({ onSearch }) => {
    const handleAuditStart = (businessInfo) => {
        // businessInfo contains: placeUrl, businessName, area
        // Pass to App.jsx which will run the audit
        onSearch(businessInfo);
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-radial opacity-50"></div>
            <div className="absolute inset-0 animated-gradient opacity-20"></div>

            <div className="container-custom relative z-10 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto text-center"
                >
                    {/* Hero Title */}
                    <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">
                        Is Your Business <span className="gradient-text">Invisible</span> Online?
                    </h1>

                    <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto">
                        90% of customers search online before visiting. Find out in 30 seconds if they can find <strong className="text-white">you</strong>.
                    </p>

                    {/* Business Search & Selection */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <BusinessSearchSelector onAuditStart={handleAuditStart} />

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-white/60">
                            <div className="flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>100% Free</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>No Signup Required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>Instant Results</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
