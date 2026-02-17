import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
    const [progress, setProgress] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);

    const messages = [
        'Searching Google Maps...',
        'Checking JustDial...',
        'Analyzing Facebook presence...',
        'Calculating your score...',
    ];

    useEffect(() => {
        // Progress animation
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 2;
            });
        }, 100);

        // Message rotation
        const messageInterval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 2000);

        return () => {
            clearInterval(progressInterval);
            clearInterval(messageInterval);
        };
    }, []);

    return (
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-white to-green-50">
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="glass-strong rounded-2xl p-12 max-w-2xl mx-auto text-center backdrop-blur-xl"
                >
                    {/* Spinner */}
                    <div className="mb-8 flex justify-center">
                        <div className="relative w-24 h-24">
                            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-t-blue-500 border-r-green-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        </div>
                    </div>

                    <h2 className="text-3xl font-heading font-bold mb-4 text-slate-800">
                        Analyzing Your Digital Presence...
                    </h2>

                    <motion.p
                        key={messageIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-lg text-slate-600 mb-8"
                    >
                        {messages[messageIndex]}
                    </motion.p>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-green-500 to-blue-600"
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    <p className="text-sm text-slate-500 mt-4">{progress}% Complete</p>
                </motion.div>
            </div>
        </section>
    );
};

export default LoadingScreen;
