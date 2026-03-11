import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const TemplateCard = ({ template }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-xl transition-all group flex flex-col h-full"
        >
            <div className="h-64 overflow-hidden relative bg-slate-100">
                <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                    <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold font-heading uppercase tracking-wider border border-white/30">
                        {template.category}
                    </span>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{template.name}</h3>
                <p className="text-slate-600 text-sm mb-6">{template.description}</p>

                <div className="space-y-3 mb-8 flex-grow">
                    {template.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-indigo-500 shrink-0" />
                            <span className="text-sm text-slate-700">{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-slate-100 mt-auto flex flex-col gap-3">
                    {template.demoUrl && (
                        <a
                            href={template.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-center bg-white border-2 border-slate-900 hover:bg-slate-50 text-slate-900 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
                        >
                            Visit Live Site
                        </a>
                    )}
                    <a
                        href={`https://wa.me/919088260058?text=${encodeURIComponent(`Hey, I want to use the ${template.name} template (Code: ${template.code}).`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block text-center bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-colors shadow-md"
                    >
                        Use This Template
                    </a>
                </div>
            </div>
        </motion.div>
    );
};

export default TemplateCard;
