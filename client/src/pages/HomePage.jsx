import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import BusinessSearchSelector from '../components/BusinessSearchSelector';

/**
 * HomePage - Modern Hero Section with Business Search
 * "BizList: Are You On The List?"
 * 
 * Flow: Search → Select Exact Business → Run Audit
 */
const HomePage = () => {
    const navigate = useNavigate();

    // Handle when user selects a business and clicks "Run Audit"
    const handleAuditStart = (businessInfo) => {
        // businessInfo contains: { placeUrl, businessName, area }
        // Navigate to check page with the placeUrl so we audit the EXACT business
        const params = new URLSearchParams({
            business: businessInfo.businessName,
            area: businessInfo.area,
            placeUrl: businessInfo.placeUrl
        });
        navigate(`/check?${params.toString()}`);
    };

    const features = [
        {
            icon: <CheckCircle className="w-6 h-6 text-accent" />,
            title: "Instant Analysis",
            description: "Get your digital health score in seconds"
        },
        {
            icon: <TrendingUp className="w-6 h-6 text-accent" />,
            title: "Actionable Insights",
            description: "Know exactly what to improve"
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-accent" />,
            title: "Multi-Platform",
            description: "Google Maps, JustDial & Website analysis"
        }
    ];

    return (
        <PageWrapper>
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 pt-32">
                {/* Background Elements - More Vibrant */}
                <div className="absolute inset-0 bg-gradient-radial opacity-60"></div>
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-400/5 rounded-full blur-3xl"></div>

                {/* Content */}
                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-heading font-bold text-slate-800 tracking-tight mb-6"
                    >
                        BizList: Are You <br />
                        <span className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
                            On The List?
                        </span>
                    </motion.h1>


                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto"
                    >
                        40% of local businesses are <span className="text-danger font-semibold bg-red-50 px-2 py-1 rounded">invisible online</span>.
                        Check your Digital Health Score instantly.
                    </motion.p>

                    {/* Information Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto mb-16 bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-white shadow-sm"
                    >
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                How Modern Industries Are Growing
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                97% of consumers search online before visiting a local store. Digital-first businesses are proven to grow 2.8x faster than traditional ones in today's market.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-green-600" />
                                How Our Score System Works
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                We analyze 50+ critical data points across Google, Social Media, and Web presence to calculate your precise 0-100 Digital Health Score.
                            </p>
                        </div>
                    </motion.div>

                    {/* CTA Heading */}
                    <div id="check-score" className="w-full max-w-6xl mx-auto scroll-mt-24">
                        <motion.h2
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-10 tracking-tight leading-tight"
                        >
                            Is Your Business Online ??? <br className="hidden md:block" />
                            <span className="text-blue-600 bg-blue-50 px-4 py-1 rounded-xl inline-block mt-2">Check Score</span>
                        </motion.h2>

                        {/* Business Search & Selection Component - Wider Container */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                            className="bg-transparent w-full mb-20"
                        >
                            <BusinessSearchSelector onAuditStart={handleAuditStart} />
                        </motion.div>
                    </div>

                    {/* Trusted Examples Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="mb-20"
                    >
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-8">Trusted Examples</p>
                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {[
                                {
                                    name: "Starbucks Coffee",
                                    score: 98,
                                    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=80",
                                    location: "Downtown, Seattle"
                                },
                                {
                                    name: "Domino's Pizza",
                                    score: 97,
                                    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
                                    location: "Times Square, NY"
                                },
                                {
                                    name: "McDonald's",
                                    score: 95,
                                    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
                                    location: "Chicago, IL"
                                }
                            ].map((place, i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1 group text-left">
                                    <div className="h-48 overflow-hidden relative">
                                        <div className="absolute top-3 right-3 z-10 bg-green-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-md">
                                            Score: {place.score}
                                        </div>
                                        <img
                                            src={place.image}
                                            alt={place.name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-lg text-slate-800 mb-1">{place.name}</h3>
                                        <p className="text-slate-500 text-sm flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                                            Excellent Digital Presence
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Stats or Social Proof */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="text-sm text-slate-500 pb-12"
                    >
                        ✓ No credit card required • Free instant analysis • 1000+ businesses checked
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gradient-to-b from-white to-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-800 mb-4">
                            Why Check Your Score?
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                            Get a complete picture of your online presence across multiple platforms
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const gradients = [
                                'from-blue-500 to-blue-600',
                                'from-green-500 to-green-600',
                                'from-purple-500 to-purple-600'
                            ];
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all border border-slate-200 hover:-translate-y-1"
                                >
                                    <div className={`bg-gradient-to-br ${gradients[index]} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                                        <div className="text-white">
                                            {feature.icon}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-800 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-500">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-16 max-w-3xl mx-auto text-center bg-blue-50/50 rounded-2xl p-8 border border-blue-100"
                    >
                        <p className="text-lg text-slate-700 leading-relaxed font-medium">
                            "Your digital score is the key to unlocking hidden revenue. By identifying gaps in your online presence, you can outrank competitors, attract more local customers, and build a brand that people trust—all starting with a free audit."
                        </p>
                    </motion.div>
                </div>
            </section>
        </PageWrapper>
    );
};

export default HomePage;
