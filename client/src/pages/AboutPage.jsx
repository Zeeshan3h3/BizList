import React, { useEffect } from 'react';
import { Target, Users, Zap } from 'lucide-react';
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
            name: "Alex Morgan",
            role: "Founder & CEO",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"
        },
        {
            name: "Sarah Chen",
            role: "Head of Engineering",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
        },
        {
            name: "Michael Ross",
            role: "Product Design",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400"
        }
    ];

    return (
        <PageWrapper>
            <div className="bg-white min-h-screen pt-32 pb-20">
                {/* Hero */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
                        Empowering Local Business <br />
                        <span className="text-blue-600">In The Digital Age</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        BizList was founded on a simple premise: every business deserves to be found online.
                        We provide the tools and insights necessary to turn digital confusion into clear, actionable growth strategies.
                    </p>
                </div>

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
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                        <p className="text-blue-100 mb-8 max-w-xl mx-auto">Join over 10,000 businesses using BizList to improve their online presence today.</p>
                        <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg">
                            Get Started Free
                        </button>
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
