import React from 'react';
import { motion } from 'framer-motion';
import Button from './ui/Button';

const CTASection = ({ onBookingClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-strong rounded-2xl p-8 md:p-10 mt-8"
        >
            <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left: CTA Content */}
                <div>
                    <h2 className="text-3xl font-heading font-bold mb-4">
                        Ready to Fix This?
                    </h2>
                    <p className="text-slate-600 text-lg mb-6">
                        We'll get your business fully online in <strong className="text-slate-800">7 days</strong>.
                        Google Maps setup, website creation, social media presence - everything you need.
                    </p>

                    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 mb-6">
                        <div className="text-sm text-slate-600 mb-2">Complete Digital Makeover</div>
                        <div className="text-4xl font-bold gradient-text mb-1">₹5,000</div>
                        <div className="text-sm text-slate-500">One-time setup fee</div>
                    </div>

                    <Button
                        variant="primary"
                        className="w-full md:w-auto text-lg"
                        onClick={onBookingClick}
                        icon={
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        }
                    >
                        Book a Free Consultation
                    </Button>
                </div>

                {/* Right: Features List */}
                <div className="space-y-4">
                    {[
                        'Google Maps listing optimized',
                        'Professional website created',
                        'Social media setup',
                        '7-day delivery guarantee',
                    ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 6L9 17L4 12" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-slate-700">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default CTASection;
