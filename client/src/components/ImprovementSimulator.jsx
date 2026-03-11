import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, ArrowUpCircle } from 'lucide-react';

const ImprovementSimulator = ({ baseScore = 0, simulator = [] }) => {
    // Array of booleans to track toggled state of each improvement
    const [toggled, setToggled] = useState(new Array(simulator.length).fill(false));

    if (!simulator || simulator.length === 0) return null;

    const handleToggle = (index) => {
        const newToggled = [...toggled];
        newToggled[index] = !newToggled[index];
        setToggled(newToggled);
    };

    // Calculate projected score based on active toggles
    const addedPoints = simulator.reduce((total, imp, idx) => {
        return total + (toggled[idx] ? imp.pointGain : 0);
    }, 0);

    const projectedScore = Math.min(100, baseScore + addedPoints);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden mb-8 text-white relative"
        >
            {/* Background Accent */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 pointer-events-none" />

            <div className="p-6 md:p-8 relative z-10 border-b border-white/10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-500/20 rounded-xl">
                            <Calculator className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-heading">Improvement Simulator</h3>
                            <p className="text-slate-400 text-sm">See how fixes impact your score</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {simulator.map((imp, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleToggle(idx)}
                            className={`w-full text-left flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${toggled[idx]
                                ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-colors ${toggled[idx] ? 'bg-indigo-500 border-indigo-500' : 'bg-slate-900 border-slate-600'
                                    }`}>
                                    {toggled[idx] && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                </div>
                                <span className={toggled[idx] ? 'text-white font-medium' : 'text-slate-300'}>
                                    If you {imp.action.toLowerCase()}
                                </span>
                            </div>
                            <span className={`shrink-0 font-bold ${toggled[idx] ? 'text-indigo-300' : 'text-slate-500'}`}>
                                +{imp.pointGain} pts
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 to-indigo-950 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-slate-400 font-medium">
                    Current Score:{' '}
                    <span className="text-white text-xl ml-2">{baseScore}</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-1">
                            Projected Score
                        </div>
                        <div className="text-4xl md:text-5xl font-black text-white flex items-center gap-2 justify-end">
                            {projectedScore}
                            {addedPoints > 0 && (
                                <ArrowUpCircle className="w-8 h-8 text-green-400" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ImprovementSimulator;
