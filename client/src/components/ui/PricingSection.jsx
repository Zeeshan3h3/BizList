import React from 'react';
import { Check } from 'lucide-react';

const PricingSection = () => {
    return (
        <section className="py-24 bg-white" id="pricing">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-heading font-bold text-slate-900 mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        No hidden fees. Just affordable solutions designed explicitly for small local businesses.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 items-start">

                    {/* Management */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Website Management</h3>
                        <p className="text-slate-500 mb-6 min-h-[48px]">For businesses with an existing website that needs maintenance.</p>
                        <div className="mb-6">
                            <span className="text-4xl font-extrabold text-slate-900">₹999</span>
                            <span className="text-slate-500">/month</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {['Bug fixes & Troubleshooting', 'Security updates', 'Speed optimization', 'Monthly content updates'].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                                    <span className="text-slate-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl transition-colors">
                            Get Started
                        </button>
                    </div>

                    {/* Development - Highlighted */}
                    <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl relative md:-mt-4 md:mb-4">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase shadow-lg">Most Popular</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Website Development</h3>
                        <p className="text-slate-400 mb-6 min-h-[48px]">Professional, blazing-fast websites using our ready-made templates.</p>
                        <div className="mb-6">
                            <span className="text-3xl font-medium text-slate-300">Starts at </span>
                            <span className="text-4xl font-extrabold text-white">₹5k</span>
                            <span className="text-slate-400"> - ₹15k</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {['Template customization', 'Mobile responsive design', 'WhatsApp/Booking integration', '1 Year Free Hosting', 'Basic SEO setup'].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                    <span className="text-white">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors">
                            View Templates
                        </button>
                    </div>

                    {/* Google Listing */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Google Enhancement</h3>
                        <p className="text-slate-500 mb-6 min-h-[48px]">Rank higher on Google Maps and drive more local footfall.</p>
                        <div className="mb-6">
                            <span className="text-3xl font-medium text-slate-500">Starts at </span>
                            <span className="text-4xl font-extrabold text-slate-900">₹999</span>
                            <span className="text-slate-500"> - ₹2999</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {['Profile verification & Setup', 'Keyword & category optimization', 'Custom posters & photos', 'Automated review strategy'].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span className="text-slate-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl transition-colors">
                            Boost My Rank
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default PricingSection;
