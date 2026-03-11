import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import TemplateCard from '../components/templates/TemplateCard';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import doctorImage from '../assets/Doctor_template.png'
import CoachingImage from '../assets/CoachingT.png'


const TEMPLATES_TEXT = {
    title: "Website Templates for Local Businesses",
    subtitle: "High-converting, mobile-ready websites designed specifically for your industry. Start growing your local customer base today.",
    templates: [
        {
            name: "Doctor Appointment Website",
            code: "MED-01",
            category: "Healthcare",
            description: "A professional design focused on patient trust. Includes built-in appointment booking and review showcasing , About section for Doctors.",
            demoUrl: "https://precious-llama-4bb4e2.netlify.app/",
            image: doctorImage,
            features: [
                "Online Appointment Booking",
                "Patient Review Integration",
                "Service & Treatment Pages",
                "HIPAA Compliant Contact Forms"
            ]
        },
        {
            name: "Restaurant Ordering Website",
            code: "REST-01",
            category: "Food & Beverage",
            description: "Show appetizing menus and take direct orders online without paying third-party commission fees.",
            demoUrl: "https://precious-llama-4bb4e2.netlify.app/",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop",
            features: [
                "Digital Menu Management",
                "Direct Online Ordering",
                "Table Reservation System",
                "Google Maps Integration"
            ]
        },
        {
            name: "Coaching Institute Website",
            code: "EDU-01",
            category: "Education",
            description: "Highlight course details, student success stories, and make enrollment easy for prospective students.",
            demoUrl: "https://comfy-torte-50f9b4.netlify.app/",
            image: CoachingImage,
            features: [
                "Course & Batch Listings",
                "Student Portal Area",
                "Fee Payment Integration",
                "Testimonials Section"
            ]
        },
        {
            name: "Salon Booking Website",
            code: "SPA-01",
            category: "Beauty & Spa",
            description: "A beautiful, relaxing aesthetic with easy service selection and staff booking capabilities.",
            demoUrl: "https://precious-llama-4bb4e2.netlify.app/",
            image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2574&auto=format&fit=crop",
            features: [
                "Service Catalog with Pricing",
                "Staff Selection & Booking",
                "Photo Gallery Portfolio",
                "Automated SMS Reminders"
            ]
        },
        {
            name: "Real Estate Listing Website",
            code: "REAL-01",
            category: "Real Estate",
            description: "Feature your top properties with high-resolution image galleries and lead-capture contact forms.",
            demoUrl: "https://precious-llama-4bb4e2.netlify.app/",
            image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2573&auto=format&fit=crop",
            features: [
                "Property Detail Pages",
                "Advanced Search Filters",
                "Agent Contact Forms",
                "Neighborhood Guides"
            ]
        }
    ]
};

const TemplatesPage = () => {
    return (
        <PageWrapper>
            {/* Header Section */}
            <section className="bg-slate-900 pt-32 pb-24 border-b border-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')]"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-6xl font-heading font-black text-white mb-6"
                    >
                        {TEMPLATES_TEXT.title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-slate-300 max-w-3xl mx-auto"
                    >
                        {TEMPLATES_TEXT.subtitle}
                    </motion.p>
                </div>
            </section>

            {/* Templates Grid Section */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {TEMPLATES_TEXT.templates.map((template, index) => (
                            <TemplateCard key={index} template={template} />
                        ))}
                    </div>
                </div>
            </section>
        </PageWrapper>
    );
};

export default TemplatesPage;
