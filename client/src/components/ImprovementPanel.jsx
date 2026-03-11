import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb, CheckCircle2 } from 'lucide-react';

const ImprovementPanel = ({ improvements = [] }) => {
    if (!improvements || improvements.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 mb-8"
        >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center gap-3 text-white">
                <Lightbulb className="w-6 h-6 text-yellow-300" />
                <div>
                    <h3 className="text-xl font-bold font-heading">Top Growth Opportunities</h3>
                    <p className="text-blue-100 text-sm mt-1">Implement these fixes to improve your local ranking and customer trust.</p>
                </div>
            </div>

            <div className="p-6">
                <div className="space-y-4">
                    {improvements.map((imp, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                            <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {idx + 1}
                            </div>
                            <div className="flex-1 pt-1">
                                <h4 className="text-slate-800 font-medium mb-1">{imp.action}</h4>
                            </div>
                            <div className="shrink-0 pt-1">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold">
                                    <ArrowRight className="w-3.5 h-3.5" />
                                    +{imp.points} points
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {improvements.length === 0 && (
                    <div className="text-center py-8 text-slate-500 flex flex-col items-center gap-3">
                        <CheckCircle2 className="w-12 h-12 text-green-400" />
                        <p>Great job! Your profile covers all the fundamental elements.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ImprovementPanel;
