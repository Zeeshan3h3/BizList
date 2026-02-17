import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ScoreCard = ({ score = 0 }) => {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = score;
        const duration = 2000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setAnimatedScore(end);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [score]);

    const getScoreColor = () => {
        if (score >= 70) return 'text-green-400';
        if (score >= 40) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreMessage = () => {
        if (score >= 70) {
            return {
                title: "Excellent Digital Presence!",
                description: "Your business is highly visible online. Keep up the great work!"
            };
        }
        if (score >= 40) {
            return {
                title: "Room for Improvement",
                description: "Your online presence is good, but there's potential to do better."
            };
        }
        return {
            title: "Your Business Needs Attention",
            description: "You're missing out on potential customers. Let's fix this."
        };
    };

    const message = getScoreMessage();
    const circumference = 2 * Math.PI * 90;
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass rounded-2xl p-8 md:p-10 mb-8"
        >
            <h2 className="text-3xl font-heading font-bold mb-8 text-center">
                Your Digital Health Score
            </h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                {/* Circular Progress */}
                <div className="relative w-48 h-48">
                    <svg className="transform -rotate-90 w-48 h-48">
                        <circle
                            cx="96"
                            cy="96"
                            r="90"
                            stroke="rgba(0, 0, 0, 0.1)"
                            strokeWidth="12"
                            fill="none"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r="90"
                            stroke="url(#scoreGradient)"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={`text-5xl font-bold ${getScoreColor()}`}>
                            {animatedScore}
                        </div>
                        <div className="text-sm text-slate-500">out of 100</div>
                    </div>
                </div>

                {/* Score Message */}
                <div className="max-w-md text-center md:text-left">
                    <h3 className="text-2xl font-heading font-bold mb-3">
                        {message.title}
                    </h3>
                    <p className="text-slate-600 text-lg">
                        {message.description}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default ScoreCard;
