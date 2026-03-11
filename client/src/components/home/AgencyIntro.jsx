import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { CheckCircle, Code, Settings, MapPin } from 'lucide-react';

const AGENCY_INFO = {
    title: "How BizCheck Helps Small Businesses",
    services: [
        {
            icon: <CheckCircle className="w-8 h-8 text-blue-500" />,
            title: "Digital Health Audit",
            description: "We analyze your business presence across Google Maps, reviews, and your website."
        },
        {
            icon: <Code className="w-8 h-8 text-indigo-500" />,
            title: "Website Development",
            description: "We build fast and modern websites using proven templates."
        },
        {
            icon: <Settings className="w-8 h-8 text-purple-500" />,
            title: "Website Management",
            description: "We maintain and fix websites so business owners don't worry about technical issues."
        },
        {
            icon: <MapPin className="w-8 h-8 text-green-500" />,
            title: "Google Listing Optimization",
            description: "We improve Google Business profiles to increase local visibility."
        }
    ]
};

const AgencyIntro = () => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col justify-center h-full bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-slate-100"
        >
            <h3 className="text-2xl font-bold text-slate-800 mb-8 border-b border-slate-100 pb-4">
                {AGENCY_INFO.title}
            </h3>

            <div className="space-y-6">
                {AGENCY_INFO.services.map((service, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ x: 10 }}
                        className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-default"
                    >
                        <div className="bg-slate-100 p-3 rounded-2xl flex-shrink-0">
                            {service.icon}
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 mb-1">{service.title}</h4>
                            <p className="text-slate-600 text-sm leading-relaxed">{service.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default AgencyIntro;
