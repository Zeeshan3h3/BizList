import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Store, Globe, MapPin, ArrowRight } from 'lucide-react';

const HERO_TEXT = {
    headlineStart: "See Your Business",
    headlineHighlight: "Growing",
    headlineEnd: "Online",
    subheadline: "Run a free digital audit and discover how visible your business is on Google.",
    supportLine: "We analyze your Google presence, website health, and local competition in seconds.",
    button: "Run Audit"
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const HeroSection = () => {
    return (
        <motion.div
            className="flex flex-col justify-center h-full pr-0 md:pr-8 text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Micro Illustrations / Breadcrumbs */}
            <motion.div variants={itemVariants} className="flex items-center gap-1.5 text-slate-500 font-semibold text-[10px] sm:text-xs mb-4 bg-white/60 w-fit px-4 py-1.5 rounded-full border border-slate-200/60 shadow-sm backdrop-blur-md">
                <span className="flex items-center gap-1"><Store className="w-3.5 h-3.5 text-indigo-500" /> Local Business</span>
                <ArrowRight className="w-2.5 h-2.5 text-slate-300" />
                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-blue-500" /> Website</span>
                <ArrowRight className="w-2.5 h-2.5 text-slate-300" />
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> Google Rank</span>
            </motion.div>

            <motion.h1
                variants={itemVariants}
                className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-slate-800 tracking-tight mb-4 leading-[1.05]"
            >
                {HERO_TEXT.headlineStart} <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent pb-1">
                    {HERO_TEXT.headlineHighlight}
                </span> {HERO_TEXT.headlineEnd}
            </motion.h1>

            <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-slate-600 mb-3 font-medium leading-relaxed"
            >
                {HERO_TEXT.subheadline}
            </motion.p>

            <motion.p
                variants={itemVariants}
                className="text-base text-slate-500 mb-6"
            >
                {HERO_TEXT.supportLine}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <button
                    onClick={() => {
                        document.getElementById('check-score')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-1 transition-all text-lg flex items-center gap-3"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {HERO_TEXT.button}
                </button>
            </motion.div>

        </motion.div>
    );
};

export default HeroSection;
