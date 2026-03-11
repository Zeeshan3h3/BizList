import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import PricingCard from '../components/pricing/PricingCard';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Settings, Code, MapPin } from 'lucide-react';

const PRICING_TEXT = {
    title: "Simple, Transparent Pricing",
    subtitle: "Choose the right plan to establish and grow your local business presence online.",
    plans: [
        {
            title: "Google Listing Enhancement",
            icon: <MapPin className="w-8 h-8" />,
            description: "Optimize your Google Business Profile to rank higher in local searches.",
            price: "₹999",
            period: "/starting at",
            features: [
                "Profile Claiming & Verification",
                "Category & Attribute Optimization",
                "Keyword-Rich Description",
                "Photo Upload & Organization",
                "Review Generation Strategy"
            ],
            button: "Book a Meeting",
            popular: false
        },
        {
            title: "Website Development",
            icon: <Code className="w-8 h-8" />,
            description: "A fast, modern, and mobile-responsive website built on our proven templates.",
            price: "₹2,999",
            period: "/starting at",
            features: [
                "Up to 5 Pages (Home, About, Services, etc.)",
                "Mobile & SEO Optimized",
                "Custom Domain Setup",
                "Contact Forms & Lead Capture",
                "Basic Google Analytics Integration"
            ],
            button: "Book a Meeting",
            popular: true
        },
        {
            title: "Website Management",
            icon: <Settings className="w-8 h-8" />,
            description: "Ongoing hosting, maintenance, and minor updates so you never worry about tech.",
            price: "₹999",
            period: "/starting at",
            features: [
                "Premium Cloud Hosting",
                "Daily Automated Backups",
                "SSL Certificate Included",
                "Monthly Performance Reports",
                "1 Hour of Content Updates/Month"
            ],
            button: "Book a Meeting",
            popular: false
        }
    ]
};

const PricingPage = () => {
    return (
        <PageWrapper>
            <section className="bg-slate-900 pt-32 pb-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-slate-900"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-6xl font-heading font-black text-white mb-6"
                    >
                        {PRICING_TEXT.title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-slate-300 max-w-2xl mx-auto"
                    >
                        {PRICING_TEXT.subtitle}
                    </motion.p>
                </div>
            </section>

            <section className="py-20 bg-slate-50 -mt-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 relative z-20">
                        {PRICING_TEXT.plans.map((plan, index) => (
                            <PricingCard key={index} plan={plan} />
                        ))}
                    </div>
                </div>
            </section>
        </PageWrapper>
    );
};

export default PricingPage;
