import React, { useState, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import TemplateCard from '../components/templates/TemplateCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, CheckCircle, Smartphone, Users, Lock, Gift, LayoutGrid, List, ChevronDown } from 'lucide-react';
import doctorImage from '../assets/Doctor_template.png';
import CoachingImage from '../assets/CoachingT.png';
import lawyerImage from '../assets/Screenshot 2026-03-16 011803.png';
import portfolioImage from '../assets/Screenshot 2026-03-16 011827.png';
import artisanImage from '../assets/Screenshot 2026-03-16 011720.png';
import packrightImage from '../assets/Screenshot 2026-03-16 011704.png';
import footwearImage from '../assets/Screenshot 2026-03-20 095755.png';
import banquetImage from '../assets/Screenshot 2026-03-20 101856.png';
import saloonImage from '../assets/saloontemp.png';

const ALL_CATEGORIES = [
    "All Templates", "🍕 Food & Dining", "💅 Beauty & Salon", "🏥 Health & Clinic",
    "🔧 Trades", "🛍️ Retail", "💪 Fitness", "🏠 Real Estate", "⚖️ Legal & Law",
    "👨‍💻 Portfolio", "📚 Education", "📦 Packaging & B2B", "🎉 Events & Venues"
];

const TEMPLATES_TEXT = {
    title: "Website Templates for Local Businesses",
    subtitle: "High-converting, mobile-ready websites designed specifically for your industry. Start growing your local customer base today.",
    templates: [
        {
            name: "Doctor Appointment Website",
            code: "MED-01",
            category: "🏥 Health & Clinic",
            description: "A professional design focused on patient trust. Includes built-in appointment booking, review showcasing, and an About section for Doctors.",
            demoUrl: "https://docdemo-chi.vercel.app/",
            image: doctorImage,
            emoji: "👨‍⚕️",
            gradient: "from-blue-600 to-indigo-900",
            badge: "Popular",
            price: "$49",
            rating: "4.9",
            features: ["Online Appointment Booking", "Patient Review Integration", "Service & Treatment Pages"]
        },
        {
            name: "Legal Advocate Website",
            code: "LAW-01",
            category: "⚖️ Legal & Law",
            description: "A premium, trust-inspiring website for lawyers and legal advocates. Showcases expertise, case results, and makes consultation booking seamless.",
            demoUrl: "https://advdemo.vercel.app/",
            image: lawyerImage,
            emoji: "⚖️",
            gradient: "from-slate-600 to-slate-900",
            badge: "Pro",
            price: "$59",
            rating: "4.8",
            features: ["Practice Areas Showcase", "Notable Case Results Section", "Consultation Booking Form"]
        },
        {
            name: "Developer Portfolio Website",
            code: "PORT-01",
            category: "👨‍💻 Portfolio",
            description: "A futuristic, dark-themed portfolio for developers, engineers, and tech professionals. Highlights skills, projects, and contact in a visually stunning layout.",
            demoUrl: "https://portfolio-client-beta-beryl.vercel.app/",
            image: portfolioImage,
            emoji: "💻",
            gradient: "from-indigo-600 to-purple-900",
            badge: "New",
            price: "Free",
            rating: "5.0",
            features: ["Animated Hero with Role Typewriter", "Skills & Expertise", "Projects Grid"]
        },
        {
            name: "Artisan & Homemade Store",
            code: "ART-01",
            category: "🛍️ Retail",
            description: "An elegant, warm-toned website for handmade product sellers, craft stores, and artisan businesses. Built to drive sales and tell your brand story.",
            demoUrl: "https://homemadedemo-1fy42zb7i-zeeshan3h3s-projects.vercel.app/",
            image: artisanImage,
            emoji: "🏺",
            gradient: "from-orange-500 to-red-900",
            badge: "Free",
            price: "Free",
            rating: "4.7",
            features: ["Product Collection", "Brand Story", "Gallery Section"]
        },
        {
            name: "Coaching Institute Website",
            code: "EDU-01",
            category: "📚 Education",
            description: "Highlight course details, student success stories, and make enrollment easy for prospective students.",
            demoUrl: "https://demowebsite-kohl.vercel.app/",
            image: CoachingImage,
            emoji: "🎓",
            gradient: "from-emerald-500 to-teal-900",
            badge: "Popular",
            price: "$39",
            rating: "4.8",
            features: ["Course & Batch Listings", "Student Results", "Fee Payment Integration"]
        },
        {
            name: "Packaging & B2B Store",
            code: "PACK-01",
            category: "📦 Packaging & B2B",
            description: "A bold, conversion-optimised storefront for packaging suppliers, wholesalers, and B2B product businesses. Built to drive bulk enquiries and repeat orders.",
            demoUrl: "#",
            image: packrightImage,
            emoji: "📦",
            gradient: "from-amber-500 to-yellow-900",
            badge: "Pro",
            price: "$69",
            rating: "4.9",
            features: ["Product Category Navigation", "Custom Quote Request Form", "Bulk Order Enquiry System"]
        },
        {
            name: "Restaurant Ordering Website",
            code: "REST-01",
            category: "🍕 Food & Dining",
            description: "Show appetizing menus and take direct orders online without paying third-party commission fees.",
            demoUrl: "https://precious-llama-4bb4e2.netlify.app/",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop",
            emoji: "🍔",
            gradient: "from-rose-500 to-red-900",
            badge: "Popular",
            price: "$49",
            rating: "4.9",
            features: ["Digital Menu", "Direct Online Ordering", "Table Reservation"]
        },
        {
            name: "Salon Booking Website",
            code: "SPA-01",
            category: "💅 Beauty & Salon",
            description: "A beautiful, relaxing aesthetic with easy service selection and staff booking capabilities.",
            demoUrl: "https://saloondemo-ten.vercel.app/",
            image: saloonImage,
            emoji: "✂️",
            gradient: "from-fuchsia-500 to-pink-900",
            badge: "New",
            price: "$39",
            rating: "4.8",
            features: ["Service Catalog", "Staff Selection & Booking", "Gallery Portfolio"]
        },
        {
            name: "Premium Footwear Store",
            code: "SHOE-01",
            category: "🛍️ Retail",
            description: "A sleek, conversion-optimised storefront for shoe brands and footwear retailers. Features high-impact hero sections and intuitive product discovery.",
            demoUrl: "https://footdemo-beta.vercel.app/",
            image: footwearImage,
            emoji: "👟",
            gradient: "from-violet-500 to-purple-900",
            badge: "Pro",
            price: "$59",
            rating: "4.9",
            features: ["Dynamic Product Galleries", "Advanced Filtering", "Customer Reviews"]
        },
        {
            name: "Luxury Banquet & Venues",
            code: "VENUE-01",
            category: "🎉 Events & Venues",
            description: "An elegant, trust-building website designed for banquet halls, wedding venues, and event spaces. Showcases your venue's grandeur to attract high-ticket bookings.",
            demoUrl: "https://banquetdemo-lilac.vercel.app/",
            image: banquetImage,
            emoji: "🏰",
            gradient: "from-yellow-400 to-amber-900",
            badge: "Popular",
            price: "$79",
            rating: "5.0",
            features: ["Immersive Galleries", "Venue Capacity Info", "Lead Gen Form"]
        }
    ]
};

const TemplatesPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Templates");
    const [sortBy, setSortBy] = useState("Default");
    const [viewMode, setViewMode] = useState("Grid");
    const [isSortOpen, setIsSortOpen] = useState(false);

    const filteredTemplates = useMemo(() => {
        let result = TEMPLATES_TEXT.templates;

        if (selectedCategory !== "All Templates") {
            result = result.filter(t => t.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.name.toLowerCase().includes(query) ||
                t.category.toLowerCase().includes(query) ||
                t.description.toLowerCase().includes(query)
            );
        }

        if (sortBy === "A→Z") {
            result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === "Newest") {
            result = [...result].sort((a, b) => (a.badge === "New" ? -1 : b.badge === "New" ? 1 : 0));
        } else if (sortBy === "Most Popular") {
            result = [...result].sort((a, b) => (a.badge === "Popular" ? -1 : b.badge === "Popular" ? 1 : 0));
        }

        return result;
    }, [searchQuery, selectedCategory, sortBy]);

    const handleClearSearch = () => {
        setSearchQuery("");
        setSelectedCategory("All Templates");
    };

    return (
        <PageWrapper>
            <style>
                {`
                @keyframes floatY {
                    0% { background-position: 0px 0px; }
                    100% { background-position: 0px 100vh; }
                }
                .bg-dots-animated {
                    background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px);
                    background-size: 36px 36px;
                    animation: floatY 12s infinite alternate ease-in-out;
                }
                .font-syne { font-family: 'Syne', sans-serif; }
                .font-dm-sans { font-family: 'DM Sans', sans-serif; }
                `}
            </style>

            {/* 1. HERO SECTION REDESIGN */}
            <section className="pt-20 pb-16 relative overflow-hidden font-dm-sans" style={{ backgroundColor: '#0a0f1e' }}>
                <div className="absolute inset-0 bg-dots-animated opacity-70"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/30 rounded-full blur-[140px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-white/10 text-sm text-slate-300 font-medium mb-6 shadow-[0_0_20px_rgba(6,182,212,0.1)] backdrop-blur-md"
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] animate-pulse drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                        50+ Industry Templates Available
                    </motion.div>

                    {/* 2. SEARCH BAR (ABOVE HEADING) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="w-full max-w-[620px] relative group mb-8"
                    >
                        <div className="relative flex items-center">
                            <span className="absolute left-6 text-xl group-focus-within:scale-110 transition-transform">🔍</span>
                            <input
                                type="text"
                                placeholder="Search templates... e.g. Restaurant, Salon, Plumber"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white placeholder:text-slate-500 rounded-full py-4 pl-16 pr-36 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(37,99,235,0.1)] focus:shadow-[0_0_40px_rgba(37,99,235,0.3)] text-[16px] min-h-[64px]"
                            />
                            <div className="absolute right-2 flex items-center gap-1.5">
                                {searchQuery && (
                                    <button
                                        onClick={() => { setSearchQuery(""); document.querySelector('input[placeholder^="Search"]').focus(); }}
                                        className="text-slate-400 hover:text-white p-2 rounded-full transition-colors hover:bg-slate-800"
                                        aria-label="Clear search"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                                <button className="bg-[#2563eb] hover:bg-[#3b82f6] text-white font-medium py-2.5 px-6 rounded-full transition-colors shadow-[0_0_20px_rgba(37,99,235,0.4)] min-h-[48px]">
                                    Search
                                </button>
                            </div>
                        </div>
                        <div className="mt-3 text-sm font-medium text-slate-400 h-5">
                            {searchQuery ? `Showing ${filteredTemplates.length} of ${TEMPLATES_TEXT.templates.length} templates` : `Showing all ${TEMPLATES_TEXT.templates.length} templates`}
                        </div>
                    </motion.div>

                    {/* Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-5xl md:text-6xl font-syne font-extrabold text-white mb-4 tracking-tight leading-tight"
                    >
                        Website Templates for <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                            Local Businesses
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-xl text-[#64748b] max-w-2xl mx-auto leading-relaxed font-medium"
                    >
                        {TEMPLATES_TEXT.subtitle}
                    </motion.p>
                </div>
            </section>

            {/* 3. TRUST STRIP */}
            <div className="border-y border-white/5 font-dm-sans bg-[#0a0f1e]/80 relative z-20 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-[13px] md:text-sm font-medium text-[#64748b]">
                        <div className="flex items-center gap-2"><span className="text-xl leading-none">⚡</span> Instant one-click setup</div>
                        <div className="hidden md:block w-1 h-1 rounded-full bg-slate-700"></div>
                        <div className="flex items-center gap-2"><span className="text-xl leading-none">📱</span> 100% mobile-ready</div>
                        <div className="hidden md:block w-1 h-1 rounded-full bg-slate-700"></div>
                        <div className="flex items-center gap-2"><span className="text-xl leading-none">🎯</span> 2,000+ businesses trust us</div>
                        <div className="hidden lg:block w-1 h-1 rounded-full bg-slate-700"></div>
                        <div className="flex items-center gap-2"><span className="text-xl leading-none">🔒</span> SSL included</div>
                        <div className="hidden lg:block w-1 h-1 rounded-full bg-slate-700"></div>
                        <div className="flex items-center gap-2"><span className="text-xl leading-none">🆓</span> Free templates available</div>
                    </div>
                </div>
            </div>

            {/* 4. FILTERS BAR */}
            <section className="pt-8 pb-6 bg-[#0a0f1e] font-dm-sans sticky top-0 z-40 border-b border-[rgba(255,255,255,0.07)] backdrop-blur-xl bg-[#0a0f1e]/80 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

                        {/* Categories List */}
                        <div className="flex-1 w-full overflow-x-auto pb-2 scrollbar-hide -mb-2">
                            <div className="flex gap-3 min-w-max">
                                {ALL_CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-[14px] font-semibold transition-all whitespace-nowrap border tracking-wide ${selectedCategory === cat
                                            ? 'bg-[#2563eb] border-[#3b82f6] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                            : 'bg-[#0f172a] border-[rgba(255,255,255,0.07)] text-[#64748b] hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort & View Toggle */}
                        <div className="flex items-center gap-4 shrink-0">
                            <div className="relative">
                                <button
                                    onClick={() => setIsSortOpen(!isSortOpen)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f172a] border border-[rgba(255,255,255,0.07)] text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors shadow-sm"
                                >
                                    Sort: {sortBy} <ChevronDown className="w-4 h-4 text-slate-400" />
                                </button>

                                <AnimatePresence>
                                    {isSortOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 top-full mt-2 w-52 bg-[#0f172a] border border-[rgba(255,255,255,0.07)] rounded-xl shadow-2xl overflow-hidden z-50 py-1"
                                        >
                                            {["Default", "Most Popular", "Newest", "A→Z"].map(option => (
                                                <button
                                                    key={option}
                                                    onClick={() => { setSortBy(option); setIsSortOpen(false); }}
                                                    className={`w-full text-left px-5 py-2.5 text-sm font-medium transition-colors ${sortBy === option ? 'bg-[#2563eb]/20 text-[#3b82f6]' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex bg-[#0f172a] border border-[rgba(255,255,255,0.07)] rounded-lg p-1.5 shadow-sm">
                                <button
                                    onClick={() => setViewMode("Grid")}
                                    className={`p-1.5 rounded transition-all ${viewMode === "Grid" ? 'bg-[#2563eb] text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("List")}
                                    className={`p-1.5 rounded transition-all ${viewMode === "List" ? 'bg-[#2563eb] text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. TEMPLATES GRID SECTION */}
            <section className="py-16 pb-32 bg-[#0a0f1e] min-h-[600px] relative z-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {filteredTemplates.length > 0 ? (
                            <motion.div
                                layout
                                className={`grid ${viewMode === "Grid" ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : 'grid-cols-1 gap-6'}`}
                            >
                                {filteredTemplates.map((template, index) => (
                                    <motion.div
                                        key={template.code}
                                        layout
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
                                        className="h-full"
                                    >
                                        <TemplateCard template={template} viewMode={viewMode} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            /* 6. EMPTY / NO RESULTS STATE */
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-28 text-center"
                            >
                                <div className="w-24 h-24 bg-[#0f172a] rounded-full flex items-center justify-center mb-6 shadow-xl border border-[rgba(255,255,255,0.07)] relative">
                                    <span className="text-4xl absolute">🔍</span>
                                    <div className="absolute inset-0 bg-[#2563eb]/10 rounded-full blur-xl"></div>
                                </div>
                                <h3 className="text-3xl font-syne font-bold text-white mb-3 tracking-tight">
                                    No templates found
                                </h3>
                                <p className="text-lg text-[#64748b] mb-8 max-w-md">
                                    Try a different keyword or browsing a different category to find exactly what you need.
                                </p>
                                <button
                                    onClick={handleClearSearch}
                                    className="bg-[#2563eb] hover:bg-[#3b82f6] text-white font-medium px-8 py-3 rounded-full transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95"
                                >
                                    Clear all filters
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </PageWrapper>
    );
};

export default TemplatesPage;
