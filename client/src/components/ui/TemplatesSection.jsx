import React from 'react';
import { ExternalLink, Check, ShoppingCart, Stethoscope, BookOpen, Scissors, Dumbbell, Home } from 'lucide-react';

const TemplatesSection = () => {
    const templates = [
        {
            id: 1,
            type: "Clinic",
            name: "Doctor Appointment Website",
            icon: <Stethoscope className="w-5 h-5" />,
            image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800&h=500",
            features: ["Doctor profile", "WhatsApp Appointment", "Clinic timing", "Location map", "Service pages"],
            color: "blue"
        },
        {
            id: 2,
            type: "Restaurant",
            name: "Menu + Online Order Website",
            icon: <ShoppingCart className="w-5 h-5" />,
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800&h=500",
            features: ["Digital Menu", "Online Ordering", "Table Reservation", "Review Integration", "Gallery"],
            color: "orange"
        },
        {
            id: 3,
            type: "Coaching",
            name: "Course + Student Enquiry",
            icon: <BookOpen className="w-5 h-5" />,
            image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800&h=500",
            features: ["Course catalog", "Student testimonials", "Admission forms", "Faculty profiles", "Syllabus download"],
            color: "indigo"
        },
        {
            id: 4,
            type: "Salon",
            name: "Services + Booking Website",
            icon: <Scissors className="w-5 h-5" />,
            image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800&h=500",
            features: ["Service list & pricing", "Stylist profiles", "Online booking", "Instagram feed", "Special offers"],
            color: "pink"
        },
        {
            id: 5,
            type: "Gym",
            name: "Membership + Trainer Website",
            icon: <Dumbbell className="w-5 h-5" />,
            image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800&h=500",
            features: ["Membership plans", "Class schedules", "Trainer profiles", "Transformation gallery", "Free trial page"],
            color: "red"
        },
        {
            id: 6,
            type: "Real Estate",
            name: "Property Listing Website",
            icon: <Home className="w-5 h-5" />,
            image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800&h=500",
            features: ["Property catalog", "Search filters", "Agent profiles", "Mortgage calculator", "Lead capture forms"],
            color: "emerald"
        }
    ];

    return (
        <section className="py-24 bg-slate-50" id="templates">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase mb-4 inline-block">
                        Ready-Made Websites
                    </span>
                    <h2 className="text-3xl md:text-5xl font-heading font-bold text-slate-900 mb-4">
                        Choose a professionally designed website template
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Don't wait weeks for a custom build. Select a template designed for your industry and launch your business website in days.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {templates.map((template) => (
                        <div key={template.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 flex flex-col hover:shadow-2xl transition-shadow duration-300">
                            {/* Image Header */}
                            <div className="relative h-48 sm:h-56 overflow-hidden group">
                                <img
                                    src={template.image}
                                    alt={template.name}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <button className="bg-white text-slate-900 px-6 py-2 rounded-full font-semibold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                                        Live Demo <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="absolute top-4 left-4">
                                    <span className={`bg-white/95 backdrop-blur-sm text-${template.color}-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-sm`}>
                                        {template.icon}
                                        {template.type}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 sm:p-8 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold text-slate-800 mb-6">{template.name}</h3>

                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Key Features</h4>
                                    <ul className="space-y-2.5 mb-8">
                                        {template.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2.5">
                                                <Check className={`w-5 h-5 text-${template.color}-500 shrink-0 mt-0.5`} />
                                                <span className="text-slate-600">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-auto space-y-3">
                                    <button className={`w-full bg-${template.color}-50 hover:bg-${template.color}-100 text-${template.color}-700 font-bold py-3 rounded-xl transition-colors`}>
                                        Use This Template
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-20 text-center bg-white rounded-3xl p-10 sm:p-14 shadow-xl border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/3"></div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">Found a template you like?</h3>
                        <p className="text-lg text-slate-600 mb-8">We handle the hosting, domain setup, customization, and launch. Your business can be online in 72 hours.</p>
                        <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all text-lg">
                            Launch My Website
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TemplatesSection;
