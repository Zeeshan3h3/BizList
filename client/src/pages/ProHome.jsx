import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Server, Zap, ShieldAlert, Binary } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import BusinessSearchSelector from '../components/BusinessSearchSelector';

const ProHome = () => {
    const navigate = useNavigate();

    const handleAuditStart = (businessInfo) => {
        const params = new URLSearchParams({
            business: businessInfo.businessName,
            area: businessInfo.area,
            ...(businessInfo.placeUrl ? { placeUrl: businessInfo.placeUrl } : {})
        });
        navigate(`/pro/scan?${params.toString()}`);
    };

    return (
        <PageWrapper>
            <div className="min-h-screen bg-slate-950 text-slate-300 relative overflow-hidden flex flex-col pt-32 px-4">
                {/* Background elements */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Header */}
                <div className="max-w-4xl mx-auto w-full text-center relative z-10 mb-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold tracking-wide uppercase mb-6"
                    >
                        <Server className="w-4 h-4" />
                        BizCheck Agency & Developer Protocol
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight font-heading mb-6 tracking-tight"
                    >
                        Find Highly Profitable <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
                            Local Business Leads
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-slate-400 max-w-2xl mx-auto mb-10"
                    >
                        Deploy the 8-layer opportunity engine. Detect local businesses exhibiting digital weaknesses while algorithmically filtering out uncloseable corporate networks.
                    </motion.p>
                </div>

                {/* Search Component */}
                <div className="max-w-3xl mx-auto w-full relative z-10 mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 p-6 md:p-8"
                    >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Binary className="w-5 h-5 text-indigo-400" />
                            Target Acquisition
                        </h3>
                        <BusinessSearchSelector onAuditStart={handleAuditStart} darkTheme={true} />
                    </motion.div>
                </div>

                {/* Features inline */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto relative z-10 pb-20"
                >
                    <div className="flex flex-col items-center flex-1 text-center bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm">
                        <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-5 shrink-0">
                            <Zap className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="font-bold text-slate-200 mb-2 truncate">Deep Scanning</h3>
                        <p className="text-sm text-slate-400">Analyzes websites, Google Maps, and competitors instantly to generate a 0-100 Opportunity Score.</p>
                    </div>
                    <div className="flex flex-col items-center flex-1 text-center bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm">
                        <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-5 shrink-0">
                            <ShieldAlert className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="font-bold text-slate-200 mb-2 truncate">Brand Guard</h3>
                        <p className="text-sm text-slate-400">Automatically excludes franchises, chains, and corporate-owned locations that are unlikely to buy services.</p>
                    </div>
                    <div className="flex flex-col items-center flex-1 text-center bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm">
                        <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-5 shrink-0">
                            <Server className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h3 className="font-bold text-slate-200 mb-2 truncate">Digital Gap Matrix</h3>
                        <p className="text-sm text-slate-400">Measures the discrepancy between actual customer demand and the target's current digital presence.</p>
                    </div>
                </motion.div>
            </div>
        </PageWrapper>
    );
};

export default ProHome;
