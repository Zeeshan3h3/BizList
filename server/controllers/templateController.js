const Template = require('../models/Template');
const Review = require('../models/Review');

/**
 * GET /api/templates
 * Returns all templates with aggregated review stats
 */
exports.getAllTemplates = async (req, res) => {
    try {
        const templates = await Template.find().sort({ createdAt: -1 }).lean();

        // Aggregate review stats for all templates in one query
        const stats = await Review.aggregate([
            { $match: { isVisible: true } },
            {
                $group: {
                    _id: '$templateId',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        const statsMap = {};
        stats.forEach(s => {
            statsMap[s._id.toString()] = {
                averageRating: Math.round(s.averageRating * 10) / 10,
                totalReviews: s.totalReviews
            };
        });

        const result = templates.map(t => ({
            ...t,
            averageRating: statsMap[t._id.toString()]?.averageRating || 0,
            totalReviews: statsMap[t._id.toString()]?.totalReviews || 0
        }));

        res.json({ success: true, templates: result });
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ success: false, message: 'Server error fetching templates' });
    }
};

/**
 * GET /api/templates/:templateId
 * Returns a single template (supports lookup by ObjectId or code)
 */
exports.getTemplateById = async (req, res) => {
    try {
        const { templateId } = req.params;
        const mongoose = require('mongoose');

        // Try by ObjectId first, then by code
        let template;
        if (mongoose.Types.ObjectId.isValid(templateId)) {
            template = await Template.findById(templateId).lean();
        }
        if (!template) {
            template = await Template.findOne({ code: templateId }).lean();
        }

        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        // Get review stats
        const stats = await Review.aggregate([
            { $match: { templateId: template._id, isVisible: true } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            template: {
                ...template,
                averageRating: stats[0]?.averageRating ? Math.round(stats[0].averageRating * 10) / 10 : 0,
                totalReviews: stats[0]?.totalReviews || 0
            }
        });
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({ success: false, message: 'Server error fetching template' });
    }
};

/**
 * POST /api/templates/:templateId/use
 * Increments usage count
 */
exports.useTemplate = async (req, res) => {
    try {
        const { templateId } = req.params;
        const template = await Template.findByIdAndUpdate(
            templateId,
            { $inc: { usageCount: 1 } },
            { new: true }
        );

        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        res.json({ success: true, usageCount: template.usageCount });
    } catch (error) {
        console.error('Error using template:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * POST /api/templates/seed
 * Seeds templates from hardcoded data (idempotent via code field)
 */
exports.seedTemplates = async (req, res) => {
    try {
        const HARDCODED_TEMPLATES = [
            {
                name: "Doctor Appointment Website",
                code: "MED-01",
                category: "🏥 Health & Clinic",
                description: "A professional design focused on patient trust. Includes built-in appointment booking, review showcasing, and an About section for Doctors.",
                demoUrl: "https://docdemo-chi.vercel.app/",
                emoji: "👨‍⚕️",
                gradient: "from-blue-600 to-indigo-900",
                badge: "Popular",
                price: "$49",
                isFree: false,
                features: ["Online Appointment Booking", "Patient Review Integration", "Service & Treatment Pages"]
            },
            {
                name: "Legal Advocate Website",
                code: "LAW-01",
                category: "⚖️ Legal & Law",
                description: "A premium, trust-inspiring website for lawyers and legal advocates. Showcases expertise, case results, and makes consultation booking seamless.",
                demoUrl: "https://advdemo.vercel.app/",
                emoji: "⚖️",
                gradient: "from-slate-600 to-slate-900",
                badge: "Pro",
                price: "$59",
                isFree: false,
                features: ["Practice Areas Showcase", "Notable Case Results Section", "Consultation Booking Form"]
            },
            {
                name: "Developer Portfolio Website",
                code: "PORT-01",
                category: "👨‍💻 Portfolio",
                description: "A futuristic, dark-themed portfolio for developers, engineers, and tech professionals.",
                demoUrl: "https://portfolio-client-beta-beryl.vercel.app/",
                emoji: "💻",
                gradient: "from-indigo-600 to-purple-900",
                badge: "New",
                price: "Free",
                isFree: true,
                features: ["Animated Hero with Role Typewriter", "Skills & Expertise", "Projects Grid"]
            },
            {
                name: "Artisan & Homemade Store",
                code: "ART-01",
                category: "🛍️ Retail",
                description: "An elegant, warm-toned website for handmade product sellers, craft stores, and artisan businesses.",
                demoUrl: "https://homemadedemo-1fy42zb7i-zeeshan3h3s-projects.vercel.app/",
                emoji: "🏺",
                gradient: "from-orange-500 to-red-900",
                badge: "Free",
                price: "Free",
                isFree: true,
                features: ["Product Collection", "Brand Story", "Gallery Section"]
            },
            {
                name: "Coaching Institute Website",
                code: "EDU-01",
                category: "📚 Education",
                description: "Highlight course details, student success stories, and make enrollment easy for prospective students.",
                demoUrl: "https://demowebsite-kohl.vercel.app/",
                emoji: "🎓",
                gradient: "from-emerald-500 to-teal-900",
                badge: "Popular",
                price: "$39",
                isFree: false,
                features: ["Course & Batch Listings", "Student Results", "Fee Payment Integration"]
            },
            {
                name: "Packaging & B2B Store",
                code: "PACK-01",
                category: "📦 Packaging & B2B",
                description: "A bold, conversion-optimised storefront for packaging suppliers, wholesalers, and B2B product businesses.",
                demoUrl: "#",
                emoji: "📦",
                gradient: "from-amber-500 to-yellow-900",
                badge: "Pro",
                price: "$69",
                isFree: false,
                features: ["Product Category Navigation", "Custom Quote Request Form", "Bulk Order Enquiry System"]
            },
            {
                name: "Restaurant Ordering Website",
                code: "REST-01",
                category: "🍕 Food & Dining",
                description: "Show appetizing menus and take direct orders online without paying third-party commission fees.",
                demoUrl: "https://precious-llama-4bb4e2.netlify.app/",
                previewImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop",
                emoji: "🍔",
                gradient: "from-rose-500 to-red-900",
                badge: "Popular",
                price: "$49",
                isFree: false,
                features: ["Digital Menu", "Direct Online Ordering", "Table Reservation"]
            },
            {
                name: "Salon Booking Website",
                code: "SPA-01",
                category: "💅 Beauty & Salon",
                description: "A beautiful, relaxing aesthetic with easy service selection and staff booking capabilities.",
                demoUrl: "https://saloondemo-ten.vercel.app/",
                emoji: "✂️",
                gradient: "from-fuchsia-500 to-pink-900",
                badge: "New",
                price: "$39",
                isFree: false,
                features: ["Service Catalog", "Staff Selection & Booking", "Gallery Portfolio"]
            },
            {
                name: "Premium Footwear Store",
                code: "SHOE-01",
                category: "🛍️ Retail",
                description: "A sleek, conversion-optimised storefront for shoe brands and footwear retailers.",
                demoUrl: "https://footdemo-beta.vercel.app/",
                emoji: "👟",
                gradient: "from-violet-500 to-purple-900",
                badge: "Pro",
                price: "$59",
                isFree: false,
                features: ["Dynamic Product Galleries", "Advanced Filtering", "Customer Reviews"]
            },
            {
                name: "Luxury Banquet & Venues",
                code: "VENUE-01",
                category: "🎉 Events & Venues",
                description: "An elegant, trust-building website designed for banquet halls, wedding venues, and event spaces.",
                demoUrl: "https://banquetdemo-lilac.vercel.app/",
                emoji: "🏰",
                gradient: "from-yellow-400 to-amber-900",
                badge: "Popular",
                price: "$79",
                isFree: false,
            }
        ];

        let created = 0;
        let skipped = 0;

        for (const t of HARDCODED_TEMPLATES) {
            const exists = await Template.findOne({ code: t.code });
            if (!exists) {
                await Template.create(t);
                created++;
            } else {
                skipped++;
            }
        }

        res.json({
            success: true,
            message: `Seed complete. Created: ${created}, Skipped (already exist): ${skipped}`
        });
    } catch (error) {
        console.error('Error seeding templates:', error);
        res.status(500).json({ success: false, message: 'Server error seeding templates' });
    }
};

exports.HARDCODED_TEMPLATES = HARDCODED_TEMPLATES;
