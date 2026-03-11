import React from 'react';
import { Sparkles, Wrench, Megaphone, CheckCircle2 } from 'lucide-react';

const ServicesSection = () => {
    const services = [
        {
            icon: <Sparkles className="w-8 h-8 text-blue-500" />,
            title: "Website Development",
            subtitle: "Professional websites for small businesses.",
            features: [
                "Mobile responsive",
                "Fast loading",
                "SEO optimized",
                "Online booking / WhatsApp integration"
            ],
            color: "blue"
        },
        {
            icon: <Wrench className="w-8 h-8 text-indigo-500" />,
            title: "Website Management",
            subtitle: "Already have a website? We maintain and fix it.",
            features: [
                "Bug fixes",
                "Security updates",
                "Speed optimization",
                "Content updates"
            ],
            color: "indigo"
        },
        {
            icon: <Megaphone className="w-8 h-8 text-green-500" />,
            title: "Google Listing Enhancer",
            subtitle: "Improve your Google Business Profile visibility.",
            features: [
                "Profile optimization",
                "Photo & poster design",
                "Service listings",
                "Review strategy"
            ],
            color: "green"
        }
    ];

    return (
        <section className="py-24 bg-white" id="services">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-heading font-bold text-slate-900 mb-4">
                        Our Core Services
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Everything you need to grow your local business online. No technical skills required.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group"
                        >
                            {/* Decorative background element */}
                            <div className={`absolute -right-16 -top-16 w-32 h-32 bg-${service.color}-500/10 rounded-full blur-2xl group-hover:bg-${service.color}-500/20 transition-colors duration-300`}></div>

                            <div className={`bg-${service.color}-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative z-10`}>
                                {service.icon}
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-2 relative z-10">{service.title}</h3>
                            <p className="text-slate-500 mb-6 min-h-[48px] relative z-10">{service.subtitle}</p>

                            <ul className="space-y-3 relative z-10">
                                {service.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-start gap-3">
                                        <CheckCircle2 className={`w-5 h-5 text-${service.color}-500 shrink-0 mt-0.5`} />
                                        <span className="text-slate-700 font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
