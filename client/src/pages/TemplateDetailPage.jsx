import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye, Star, Users, ExternalLink } from 'lucide-react';
import { fetchTemplate, useTemplate as useTemplateApi } from '../utils/reviewApi';
import ReviewSection from '../components/ReviewSection';
import PageWrapper from '../components/layout/PageWrapper';
import doctorImage from '../assets/Doctor_template.png';
import CoachingImage from '../assets/CoachingT.png';
import lawyerImage from '../assets/advocateweb.png';
import portfolioImage from '../assets/Screenshot 2026-03-16 011827.png';
import artisanImage from '../assets/Screenshot 2026-03-16 011720.png';
import packrightImage from '../assets/Screenshot 2026-03-16 011704.png';
import footwearImage from '../assets/footware.png';
import banquetImage from '../assets/banquet.png';
import saloonImage from '../assets/saloontemp.png';

// Local fallback data — mirrors TemplatesPage so the detail page always works
const LOCAL_TEMPLATES = [
    { code: "MED-01", name: "Doctor Appointment Website", category: "🏥 Health & Clinic", description: "A professional design focused on patient trust. Includes built-in appointment booking, review showcasing, and an About section for Doctors.", demoUrl: "https://docdemo-chi.vercel.app/", image: doctorImage, emoji: "👨‍⚕️", gradient: "from-blue-600 to-indigo-900", badge: "Popular", price: "$49", features: ["Online Appointment Booking", "Patient Review Integration", "Service & Treatment Pages"] },
    { code: "LAW-01", name: "Legal Advocate Website", category: "⚖️ Legal & Law", description: "A premium, trust-inspiring website for lawyers and legal advocates. Showcases expertise, case results, and makes consultation booking seamless.", demoUrl: "https://advdemo.vercel.app/", image: lawyerImage, emoji: "⚖️", gradient: "from-slate-600 to-slate-900", badge: "Pro", price: "$59", features: ["Practice Areas Showcase", "Notable Case Results Section", "Consultation Booking Form"] },
    { code: "PORT-01", name: "Developer Portfolio Website", category: "👨‍💻 Portfolio", description: "A futuristic, dark-themed portfolio for developers, engineers, and tech professionals.", demoUrl: "https://portfolio-client-beta-beryl.vercel.app/", image: portfolioImage, emoji: "💻", gradient: "from-indigo-600 to-purple-900", badge: "New", price: "Free", features: ["Animated Hero with Role Typewriter", "Skills & Expertise", "Projects Grid"] },
    { code: "ART-01", name: "Artisan & Homemade Store", category: "🛍️ Retail", description: "An elegant, warm-toned website for handmade product sellers, craft stores, and artisan businesses.", demoUrl: "https://homemadedemo-1fy42zb7i-zeeshan3h3s-projects.vercel.app/", image: artisanImage, emoji: "🏺", gradient: "from-orange-500 to-red-900", badge: "Free", price: "Free", features: ["Product Collection", "Brand Story", "Gallery Section"] },
    { code: "EDU-01", name: "Coaching Institute Website", category: "📚 Education", description: "Highlight course details, student success stories, and make enrollment easy for prospective students.", demoUrl: "https://demowebsite-kohl.vercel.app/", image: CoachingImage, emoji: "🎓", gradient: "from-emerald-500 to-teal-900", badge: "Popular", price: "$39", features: ["Course & Batch Listings", "Student Results", "Fee Payment Integration"] },
    { code: "PACK-01", name: "Packaging & B2B Store", category: "📦 Packaging & B2B", description: "A bold, conversion-optimised storefront for packaging suppliers, wholesalers, and B2B product businesses.", demoUrl: "#", image: packrightImage, emoji: "📦", gradient: "from-amber-500 to-yellow-900", badge: "Pro", price: "$69", features: ["Product Category Navigation", "Custom Quote Request Form", "Bulk Order Enquiry System"] },
    { code: "REST-01", name: "Restaurant Ordering Website", category: "🍕 Food & Dining", description: "Show appetizing menus and take direct orders online without paying third-party commission fees.", demoUrl: "https://precious-llama-4bb4e2.netlify.app/", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop", emoji: "🍔", gradient: "from-rose-500 to-red-900", badge: "Popular", price: "$49", features: ["Digital Menu", "Direct Online Ordering", "Table Reservation"] },
    { code: "SPA-01", name: "Salon Booking Website", category: "💅 Beauty & Salon", description: "A beautiful, relaxing aesthetic with easy service selection and staff booking capabilities.", demoUrl: "https://saloondemo-ten.vercel.app/", image: saloonImage, emoji: "✂️", gradient: "from-fuchsia-500 to-pink-900", badge: "New", price: "$39", features: ["Service Catalog", "Staff Selection & Booking", "Gallery Portfolio"] },
    { code: "SHOE-01", name: "Premium Footwear Store", category: "🛍️ Retail", description: "A sleek, conversion-optimised storefront for shoe brands and footwear retailers.", demoUrl: "https://footdemo-beta.vercel.app/", image: footwearImage, emoji: "👟", gradient: "from-violet-500 to-purple-900", badge: "Pro", price: "$59", features: ["Dynamic Product Galleries", "Advanced Filtering", "Customer Reviews"] },
    { code: "VENUE-01", name: "Luxury Banquet & Venues", category: "🎉 Events & Venues", description: "An elegant, trust-building website designed for banquet halls, wedding venues, and event spaces.", demoUrl: "https://banquetdemo-lilac.vercel.app/", image: banquetImage, emoji: "🏰", gradient: "from-yellow-400 to-amber-900", badge: "Popular", price: "$79", features: ["Immersive Galleries", "Venue Capacity Info", "Lead Gen Form"] },
];

const TemplateDetailPage = () => {
    const { templateId } = useParams();
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await fetchTemplate(templateId);
                // Merge backend data (stats, _id) with local data (images)
                const local = LOCAL_TEMPLATES.find(t => t.code === (data.template.code || templateId));
                setTemplate({ ...data.template, image: local?.image || data.template.previewImage });
            } catch (err) {
                // API failed (not seeded yet, or network error) — fall back to local data
                const local = LOCAL_TEMPLATES.find(
                    t => t.code === templateId || t._id === templateId
                );
                if (local) {
                    setTemplate({ ...local, averageRating: 0, totalReviews: 0, usageCount: 0 });
                    // Silently trigger seed so DB is populated for next time
                    fetch('/api/templates/seed', { method: 'POST' }).catch(() => { });
                } else {
                    setError('Template not found');
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [templateId]);

    const handleUseTemplate = async () => {
        try {
            await useTemplateApi(templateId);
            const whatsappUrl = `https://wa.me/919088260058?text=${encodeURIComponent(`Hey, I want to use the ${template.name} template (Code: ${template.code}).`)}`;
            window.open(whatsappUrl, '_blank');
        } catch (err) {
            console.error('Error using template:', err);
        }
    };

    if (loading) {
        return (
            <PageWrapper>
                <div className="min-h-screen bg-[#0a0f1e] pt-28 pb-20">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Skeleton */}
                        <div className="animate-pulse">
                            <div className="h-6 w-32 bg-slate-700 rounded mb-8"></div>
                            <div className="bg-[#0f172a] rounded-2xl border border-white/10 overflow-hidden">
                                <div className="h-72 bg-slate-800"></div>
                                <div className="p-8 space-y-4">
                                    <div className="h-8 w-3/4 bg-slate-700 rounded"></div>
                                    <div className="h-4 w-full bg-slate-700/50 rounded"></div>
                                    <div className="h-4 w-2/3 bg-slate-700/50 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    if (error || !template) {
        return (
            <PageWrapper>
                <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">😕</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Template Not Found</h2>
                        <p className="text-slate-400 mb-6">{error || "This template doesn't exist."}</p>
                        <Link to="/templates" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            ← Back to Templates
                        </Link>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    const renderStars = (rating) => {
        const stars = [];
        const r = parseFloat(rating) || 0;
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`w-5 h-5 ${i <= r ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                />
            );
        }
        return stars;
    };

    return (
        <PageWrapper>
            <div className="min-h-screen bg-[#0a0f1e] pt-28 pb-20 font-dm-sans">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <Link
                        to="/templates"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Templates
                    </Link>

                    {/* Template Header Card */}
                    <div className="bg-[#0f172a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl mb-12">
                        {/* Preview Image */}
                        <div className={`h-72 md:h-96 relative overflow-hidden ${template.image ? 'bg-slate-800' : `bg-gradient-to-br ${template.gradient || 'from-slate-800 to-slate-900'}`}`}>
                            {template.image ? (
                                <img
                                    src={template.image}
                                    alt={template.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <span className="text-8xl">{template.emoji || '🌐'}</span>
                                </div>
                            )}

                            {/* Badge */}
                            {template.badge && (
                                <div className="absolute top-6 left-6">
                                    <span className="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md text-white border border-white/20">
                                        {template.badge}
                                    </span>
                                </div>
                            )}

                            {/* Category */}
                            <div className="absolute bottom-6 left-6">
                                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-black/50 backdrop-blur-md text-white border border-white/20">
                                    {template.category}
                                </span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-8">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                <div className="flex-1">
                                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 font-syne tracking-tight">
                                        {template.name}
                                    </h1>
                                    <p className="text-lg text-slate-400 leading-relaxed mb-6">
                                        {template.description}
                                    </p>

                                    {/* Stats Row */}
                                    <div className="flex flex-wrap items-center gap-6 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="flex">{renderStars(template.averageRating)}</div>
                                            <span className="text-white font-semibold">{template.averageRating || '0'}</span>
                                            <span className="text-slate-500">({template.totalReviews || 0} reviews)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Users className="w-4 h-4" />
                                            <span>{template.usageCount || 0} uses</span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    {template.features?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-6">
                                            {template.features.map((f, i) => (
                                                <span key={i} className="px-3 py-1.5 text-sm font-medium bg-white/5 text-slate-300 rounded-lg border border-white/10">
                                                    ✓ {f}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3 shrink-0 md:w-48">
                                    <button
                                        onClick={handleUseTemplate}
                                        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-95"
                                    >
                                        Use Template
                                    </button>
                                    {template.demoUrl && template.demoUrl !== '#' && (
                                        <a
                                            href={template.demoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-3 px-6 border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-all text-center flex items-center justify-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" /> Preview
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Review Section */}
                    <ReviewSection templateId={templateId} />
                </div>
            </div>
        </PageWrapper>
    );
};

export default TemplateDetailPage;
