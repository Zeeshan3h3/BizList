import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye, Star, Users, ExternalLink } from 'lucide-react';
import { fetchTemplate, useTemplate as useTemplateApi } from '../utils/reviewApi';
import ReviewSection from '../components/ReviewSection';
import PageWrapper from '../components/layout/PageWrapper';

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
                setTemplate(data.template);
            } catch (err) {
                setError(err.message);
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
                        <div className={`h-72 md:h-96 relative overflow-hidden ${template.previewImage ? 'bg-slate-800' : `bg-gradient-to-br ${template.gradient || 'from-slate-800 to-slate-900'}`}`}>
                            {template.previewImage ? (
                                <img
                                    src={template.previewImage}
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
