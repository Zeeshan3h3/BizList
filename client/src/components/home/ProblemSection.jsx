import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Star, MapPin, Globe, TrendingUp } from 'lucide-react';

const PROBLEM_TEXT = {
    title: "Why Many Small Businesses Struggle Online",
    stats: [
        {
            stat: "46% of all Google searches are looking for local information.",
            source: "Google Consumer Insights"
        },
        {
            stat: "88% of consumers who search for a local business on their phone visit or call within 24 hours.",
            source: "Nectafy Local Search Study"
        },
        {
            stat: "Businesses with a website are perceived as 3x more trustworthy than those without one.",
            source: "Verisign Digital Trust Study"
        }
    ],
    button: "Run Free Audit",
    scoreExample: {
        score: "42",
        status: "Gaps Detected",
        problems: [
            "No website",
            "Low review count",
            "Weak Google visibility"
        ]
    },
    improvementTips: {
        title: "How To Win Local Customers & Grow Sales",
        tips: [
            {
                icon: <Star className="w-5 h-5 text-amber-400" />,
                title: "Build Trust with Reviews",
                desc: "Automate review collection to outshine local competitors."
            },
            {
                icon: <MapPin className="w-5 h-5 text-green-400" />,
                title: "Dominate Local Search",
                desc: "Optimize your Google Profile for 'near me' searches."
            },
            {
                icon: <Globe className="w-5 h-5 text-blue-400" />,
                title: "Convert with a Modern Site",
                desc: "Turn visitors into paying customers with mobile-first design."
            }
        ]
    }
};

const ProblemSection = () => {
    return (
        <section className="py-24 bg-slate-900 overflow-hidden relative border-y border-slate-800">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                    {/* Left: Problem List */}
                    <motion.div
                        className="lg:col-span-7"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-10 leading-tight">
                            {PROBLEM_TEXT.title}
                        </h2>

                        <div className="space-y-6 mb-12">
                            {PROBLEM_TEXT.stats.map((item, idx) => (
                                <div key={idx} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 relative pl-12 shadow-lg">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-indigo-500 rounded-r-full"></div>
                                    <p className="text-lg text-white font-medium mb-2 leading-relaxed">"{item.stat}"</p>
                                    <p className="text-xs text-indigo-300 font-semibold tracking-wide uppercase">Source: {item.source}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                document.getElementById('check-score')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-bold shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all flex items-center gap-3 text-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {PROBLEM_TEXT.button}
                        </button>
                    </motion.div>

                    {/* Right: Visual Score & Tips Representation */}
                    <motion.div
                        className="lg:col-span-5 space-y-6"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        {/* Audit Card - Scaled Down */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-red-500/20 rounded-3xl transform rotate-2 scale-105 opacity-50 blur-lg"></div>
                            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl relative">
                                <div className="flex flex-col items-center text-center pb-6 border-b border-slate-700/50 mb-6">
                                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Sample BizCheck Audit</div>
                                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-amber-500 bg-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.2)] mb-3">
                                        <span className="text-4xl font-black text-white">{PROBLEM_TEXT.scoreExample.score}<span className="text-lg text-slate-500 font-medium">/100</span></span>
                                    </div>
                                    <div className="text-amber-400 text-sm font-bold bg-amber-500/10 py-1 px-4 rounded-full inline-block tracking-wide">
                                        {PROBLEM_TEXT.scoreExample.status}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-slate-300 font-bold mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Problems Detected
                                    </h4>
                                    <ul className="space-y-2">
                                        {PROBLEM_TEXT.scoreExample.problems.map((prob, idx) => (
                                            <li key={idx} className="flex items-center gap-2 bg-red-500/10 text-red-200 py-2 px-3 rounded-lg border border-red-500/20 text-sm">
                                                <span className="text-red-400 text-xs">●</span> {prob}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* New Info Card: How to attract more customers */}
                        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-800 border border-indigo-500/20 rounded-3xl p-6 shadow-xl relative">
                            <h4 className="text-white font-bold mb-5 flex items-center gap-2 text-lg">
                                <TrendingUp className="text-indigo-400 w-5 h-5" />
                                {PROBLEM_TEXT.improvementTips.title}
                            </h4>
                            <div className="space-y-4">
                                {PROBLEM_TEXT.improvementTips.tips.map((tip, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-700 shrink-0 mt-0.5">
                                            {tip.icon}
                                        </div>
                                        <div>
                                            <h5 className="text-slate-200 font-semibold text-sm">{tip.title}</h5>
                                            <p className="text-slate-400 text-sm mt-0.5 leading-relaxed">{tip.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ProblemSection;
