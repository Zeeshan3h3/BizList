import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CTASection = () => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        // Reset after 3 seconds
        setTimeout(() => {
            setShowForm(false);
            setSubmitted(false);
            setFormData({ name: '', phone: '' });
        }, 3000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-strong rounded-2xl p-8 md:p-10 mt-8"
        >
            <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left: CTA Content */}
                <div>
                    <h2 className="text-3xl font-heading font-bold mb-4">
                        Let's fix your score and grow your business.
                    </h2>
                    <p className="text-slate-600 text-lg mb-8">
                        Choose how you want to connect with our experts:
                    </p>

                    <div className="space-y-4 max-w-sm">
                        {/* WhatsApp */}
                        <a
                            href="https://wa.me/919088260058?text=I'm%20interested%20in%20growing%20my%20business%20online"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-6 rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-lg shadow-green-500/30"
                        >
                            🟢 WhatsApp Us (Instant Reply)
                        </a>

                        {/* Call */}
                        <a
                            href="tel:+919088260058"
                            className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white py-3.5 px-6 rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-lg shadow-slate-800/30"
                        >
                            📞 Call +91 9088260058
                        </a>

                        {/* Callback Button */}
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 py-3.5 px-6 rounded-xl font-bold transition-all hover:-translate-y-1 hover:shadow-md"
                            >
                                🗓️ Request a Callback
                            </button>
                        )}

                        {/* Callback Form */}
                        <AnimatePresence>
                            {showForm && (
                                <motion.form
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    onSubmit={handleSubmit}
                                    className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm overflow-hidden"
                                >
                                    {submitted ? (
                                        <div className="text-center py-4 text-emerald-600 font-bold flex flex-col items-center gap-2">
                                            <span className="text-2xl">✅</span>
                                            We'll call you shortly!
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                    placeholder="+91 98765 43210"
                                                />
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowForm(false)}
                                                    className="flex-1 py-2.5 px-4 rounded-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="flex-[2] py-2.5 px-4 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20"
                                                >
                                                    Request Callback
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Features List */}
                <div className="space-y-4">
                    {[
                        'Custom Website Design',
                        'Local SEO & Google Maps',
                        'Expert Strategy Consultation',
                        'Full-Service Digital Solutions',
                    ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 6L9 17L4 12" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-slate-700">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default CTASection;
