import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import TemplateCard from '../components/templates/TemplateCard';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import doctorImage from '../assets/Doctor_template.png';
import CoachingImage from '../assets/CoachingT.png';
import lawyerImage from '../assets/Screenshot 2026-03-16 011803.png';
import portfolioImage from '../assets/Screenshot 2026-03-16 011827.png';
import artisanImage from '../assets/Screenshot 2026-03-16 011720.png';
import packrightImage from '../assets/Screenshot 2026-03-16 011704.png';
import footwearImage from '../assets/Screenshot 2026-03-20 095755.png';
import banquetImage from '../assets/Screenshot 2026-03-20 101856.png';
import saloonImage from '../assets/saloontemp.png';

const TEMPLATES_TEXT = {
    title: "Website Templates for Local Businesses",
    subtitle: "High-converting, mobile-ready websites designed specifically for your industry. Start growing your local customer base today.",
    templates: [
        {
            name: "Doctor Appointment Website",
            code: "MED-01",
            category: "Healthcare",
            description: "A professional design focused on patient trust. Includes built-in appointment booking, review showcasing, and an About section for Doctors.",
            demoUrl: "https://docdemo-chi.vercel.app/",
            image: doctorImage,
            features: [
                "Online Appointment Booking",
                "Patient Review Integration",
                "Service & Treatment Pages",
                "WhatsApp & Call Quick Actions"
            ]
        },
        {
            name: "Legal Advocate Website",
            code: "LAW-01",
            category: "Legal",
            description: "A premium, trust-inspiring website for lawyers and legal advocates. Showcases expertise, case results, and makes consultation booking seamless.",
            demoUrl: "https://advdemo.vercel.app/",
            image: lawyerImage,
            features: [
                "Practice Areas Showcase",
                "Notable Case Results Section",
                "Consultation Booking Form",
                "Client Testimonials & Reviews",
                "Legal Blog / Articles Section",
                "WhatsApp Chat Integration"
            ]
        },
        {
            name: "Developer Portfolio Website",
            code: "PORT-01",
            category: "Portfolio",
            description: "A futuristic, dark-themed portfolio for developers, engineers, and tech professionals. Highlights skills, projects, and contact in a visually stunning layout.",
            demoUrl: "https://portfolio-client-beta-beryl.vercel.app/",
            image: portfolioImage,
            features: [
                "Animated Hero with Role Typewriter",
                "Skills & Expertise Showcase",
                "Projects Grid with Live Links",
                "Education & Certifications",
                "Interactive Contact Section",
                "Dark Mode Cyberpunk Aesthetic"
            ]
        },
        {
            name: "Artisan & Homemade Store",
            code: "ART-01",
            category: "Artisan / E-Commerce",
            description: "An elegant, warm-toned website for handmade product sellers, craft stores, and artisan businesses. Built to drive sales and tell your brand story.",
            demoUrl: "https://homemadedemo-1fy42zb7i-zeeshan3h3s-projects.vercel.app/",
            image: artisanImage,
            features: [
                "Product Collection Showcase",
                "Brand Story / Our Story Page",
                "High-quality Gallery Section",
                "WhatsApp Order Integration",
                "Sustainability / Values Section",
                "Instagram-style Visual Aesthetic"
            ]
        },
        {
            name: "Coaching Institute Website",
            code: "EDU-01",
            category: "Education",
            description: "Highlight course details, student success stories, and make enrollment easy for prospective students.",
            demoUrl: "https://demowebsite-kohl.vercel.app/",
            image: CoachingImage,
            features: [
                "Course & Batch Listings",
                "Student Results & Toppers",
                "Fee Payment Integration",
                "Testimonials & Star Ratings"
            ]
        },
        {
            name: "Packaging & B2B Store",
            code: "PACK-01",
            category: "E-Commerce / B2B",
            description: "A bold, conversion-optimised storefront for packaging suppliers, wholesalers, and B2B product businesses. Built to drive bulk enquiries and repeat orders.",
            demoUrl: "#",
            image: packrightImage,
            features: [
                "Product Category Navigation",
                "Custom Quote Request Form",
                "Bulk Order Enquiry System",
                "Trust Badges & Statistics Bar",
                "Search Bar with Filters",
                "Mobile-Optimised Catalog"
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
            name: "Salon Booking Website",
            code: "SPA-01",
            category: "Beauty & Spa",
            description: "A beautiful, relaxing aesthetic with easy service selection and staff booking capabilities.",
            demoUrl: "https://saloondemo-ten.vercel.app/",
            image: saloonImage,
            features: [
                "Service Catalog with Pricing",
                "Staff Selection & Booking",
                "Photo Gallery Portfolio",
                "Automated SMS Reminders"
            ]
        },
        {
            name: "Premium Footwear Store",
            code: "SHOE-01",
            category: "Retail & E-Commerce",
            description: "A sleek, conversion-optimised storefront for shoe brands and footwear retailers. Features high-impact hero sections and intuitive product discovery.",
            demoUrl: "https://footdemo-beta.vercel.app/",
            image: banquetImage,
            features: [
                "Dynamic Product Galleries",
                "Advanced Filtering & Search",
                "Customer Reviews & Ratings",
                "Responsive Mobile Checkout"
            ]
        },
        {
            name: "Luxury Banquet & Venues",
            code: "VENUE-01",
            category: "Events & Hospitality",
            description: "An elegant, trust-building website designed for banquet halls, wedding venues, and event spaces. Showcases your venue's grandeur to attract high-ticket bookings.",
            demoUrl: "https://banquetdemo-lilac.vercel.app/",
            image: footwearImage,
            features: [
                "Immersive Video/Image Galleries",
                "Venue Capacity & Layout Showcase",
                "Lead Generation Booking Form",
                "Client Testimonials & Trust Badges"
            ]
        },
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
