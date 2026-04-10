import React from 'react';
import { motion } from 'framer-motion';
import { Store, Globe, MapPin, ArrowRight, Play, ExternalLink, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <motion.div
            className="flex flex-col justify-center h-full pr-0 lg:pr-10 text-left relative z-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Breadcrumb pill */}
            <motion.div variants={itemVariants} className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px] sm:text-xs mb-8 bg-white/60 w-fit px-4 py-1.5 rounded-full border border-slate-200/60 shadow-sm backdrop-blur-md">
                <span className="flex items-center gap-1"><Store className="w-3.5 h-3.5 text-indigo-500" /> Local Business</span>
                <ArrowRight className="w-2.5 h-2.5 text-slate-300" />
                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-blue-500" /> Website</span>
                <ArrowRight className="w-2.5 h-2.5 text-slate-300" />
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> Google Rank</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
                variants={itemVariants}
                style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
                className="font-heading font-black text-slate-900 tracking-tight mb-6 leading-[1.05]"
            >
                {HERO_TEXT.headlineStart} <br />
                <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent pb-2 block">
                    {HERO_TEXT.headlineHighlight}
                </span>
                <span className="relative">
                    {HERO_TEXT.headlineEnd}
                    <div className="absolute -bottom-2 left-0 w-24 h-1.5 bg-indigo-600/10 rounded-full"></div>
                </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
                variants={itemVariants}
                className="text-xl md:text-2xl text-slate-600 mb-4 font-semibold leading-relaxed max-w-xl"
            >
                {HERO_TEXT.subheadline}
            </motion.p>

            {/* Support line */}
            <motion.p
                variants={itemVariants}
                className="text-lg text-slate-500 mb-10 font-medium"
            >
                {HERO_TEXT.supportLine}
            </motion.p>

            {/* ── CTA Button Group ── */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                {/* Primary — Run Audit */}
                <button
                    onClick={() => {
                        document.getElementById('audit-tool')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group relative bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 hover:from-indigo-500 hover:via-blue-500 hover:to-violet-500 text-white px-10 py-[18px] rounded-2xl font-black shadow-[0_8px_30px_-6px_rgba(79,70,229,0.45)] hover:shadow-[0_12px_45px_-6px_rgba(79,70,229,0.6)] hover:-translate-y-0.5 hover:scale-[1.03] transition-all duration-300 text-lg flex items-center justify-center gap-3"
                >
                    <div className="absolute inset-0 bg-white/15 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Play className="w-5 h-5 fill-current relative z-10" />
                    <span className="relative z-10">{HERO_TEXT.button}</span>
                </button>

                {/* Secondary — See Templates (glass style) */}
                <button
                    onClick={() => navigate('/templates')}
                    className="group relative overflow-hidden px-8 py-[18px] rounded-2xl font-bold text-slate-700 hover:text-indigo-600 transition-all duration-300 text-base flex items-center justify-center gap-2 border border-slate-200/80 bg-white/50 backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02] hover:border-indigo-200/60 hover:bg-indigo-50/40"
                >
                    {/* Subtle gradient border shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/0 via-indigo-100/30 to-blue-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    <ExternalLink className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">See Templates</span>
                </button>

                {/* Tertiary — Contact (ghost) */}
                <button
                    onClick={() => navigate('/contact')}
                    className="px-6 py-[18px] rounded-2xl font-bold text-slate-500 hover:text-indigo-600 transition-all duration-300 text-base flex items-center justify-center gap-2 group hover:scale-[1.02]"
                >
                    <Mail className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="relative">
                        Contact
                        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-indigo-500 to-blue-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
                    </span>
                </button>
            </motion.div>
        </motion.div>
    );
};

export default HeroSection;
