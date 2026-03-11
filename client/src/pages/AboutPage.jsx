import React, { useEffect } from 'react';
import { Target, Users, Zap } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';

const AboutPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const values = [
        {
            icon: <Target className="w-6 h-6 text-blue-600" />,
            title: "Accuracy First",
            description: "We believe data must be precise. Our algorithms are constantly refined to provide the most accurate business health scores."
        },
        {
            icon: <Users className="w-6 h-6 text-green-600" />,
            title: "Community Driven",
            description: "We build tools that empower local businesses to thrive in their communities by connecting them with more customers online."
        },
        {
            icon: <Zap className="w-6 h-6 text-purple-600" />,
            title: "Fast & innovative",
            description: "The digital landscape changes fast. We ship updates weekly to ensure our users stay ahead of the curve."
        }
    ];

    const team = [
        {
            name: "Md Zeeshan",
            role: "Founder & CEO",
            image: "/founder.jpg"
        }
    ];

    return (
        <PageWrapper>
            <div className="bg-white min-h-screen">
                {/* Hero */}
                <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900">
                    {/* Background Modern Glows */}
                    <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] opacity-70 pointer-events-none"></div>
                    <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight font-heading"
                        >
                            Empowering Local Business <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">In The Digital Age</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl text-indigo-100 max-w-3xl mx-auto leading-relaxed"
                        >
                            BizCheck was founded on a simple premise: every business deserves to be found online.
                            We provide the tools and insights necessary to turn digital confusion into clear, actionable growth strategies.
                        </motion.p>
                    </div>
                </section>

                {/* Values Grid */}
                <div className="bg-slate-50 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900">Our Core Values</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {values.map((value, i) => (
                                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6">
                                        {value.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Meet The Team</h2>
                        <p className="text-slate-600">The minds behind the platform.</p>
                    </div>
                    <div className="flex justify-center gap-8 max-w-5xl mx-auto">
                        {team.map((member, i) => (
                            <div key={i} className="text-center group">
                                <div className="relative overflow-hidden rounded-2xl mb-6 aspect-square max-w-[280px] mx-auto">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                                <p className="text-blue-600 font-medium">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="max-w-4xl mx-auto px-4 text-center bg-blue-600 rounded-3xl p-12 text-white relative overflow-hidden mx-4 md:mx-auto">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-6">Ready to grow your business?</h2>
                        <p className="text-blue-100 mb-8 max-w-xl mx-auto">Join over 10,000 businesses using BizCheck to improve their online presence today.</p>
                        <a
                            href="https://wa.me/919088260058?text=I'm%20interested%20in%20BizCheck%20services%20to%20grow%20my%20business."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg inline-block"
                        >
                            Get Started Free
                        </a>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default AboutPage;
