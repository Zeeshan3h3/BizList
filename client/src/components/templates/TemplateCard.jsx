import React from 'react';
import { Eye, Star, Check } from 'lucide-react';

const TemplateCard = ({ template, viewMode = "Grid" }) => {
    // Determine badge colors based on exact prompt specifications
    const getBadgeStyle = (badge) => {
        switch (badge) {
            case 'Free': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Popular': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'New': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'Pro': return 'bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/30'; // primary blue
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const getBadgeIcon = (badge) => {
        switch (badge) {
            case 'Free': return '🆓';
            case 'Popular': return '🔥';
            case 'New': return '✨';
            case 'Pro': return '⭐';
            default: return '';
        }
    };

    const CategoryBadge = () => (
        <span className="text-[12px] font-semibold px-3 py-1.5 rounded-full bg-[#0a0f1e] text-slate-300 border border-white/10 shadow-inner">
            {template.category}
        </span>
    );

    const useTemplateLink = `https://wa.me/919088260058?text=${encodeURIComponent(`Hey, I want to use the ${template.name} template (Code: ${template.code}).`)}`;

    const hoverEffects = "hover:-translate-y-1.5 hover:scale-[1.01] hover:border-blue-500/60 hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.25),inset_0_0_20px_rgba(37,99,235,0.05)]";
    const baseCardStyle = "group relative flex h-full rounded-2xl overflow-hidden transition-all duration-400 ease-out font-dm-sans bg-[#0f172a] border border-[rgba(255,255,255,0.07)]";

    if (viewMode === 'List') {
        return (
            <div className={`${baseCardStyle} flex-col sm:flex-row ${hoverEffects}`}>
                {/* Thumbnail */}
                <div className={`sm:w-[320px] h-[240px] sm:h-auto border-r border-[rgba(255,255,255,0.07)] relative flex items-center justify-center shrink-0 ${template.image ? 'bg-slate-800' : `bg-gradient-to-br ${template.gradient || 'from-slate-800 to-slate-900'}`} overflow-hidden`}>
                    {!template.image && (
                        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent mix-blend-overlay"></div>
                    )}

                    {template.image ? (
                        <img
                            src={template.image}
                            alt={template.name}
                            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                        />
                    ) : (
                        <div className="w-28 h-28 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl border border-white/20 group-hover:scale-110 transition-transform duration-500 z-10">
                            <span className="text-[70px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                                {template.emoji || '🌐'}
                            </span>
                        </div>
                    )}
                    <div className={`absolute inset-0 transition-colors duration-300 pointer-events-none ${template.image ? 'bg-[#0f172a]/20 group-hover:bg-transparent' : 'bg-transparent'}`}></div>

                    {template.badge && (
                        <div className="absolute top-4 left-4 z-20">
                            <span className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider border flex items-center gap-1.5 shadow-lg backdrop-blur-md ${getBadgeStyle(template.badge)}`}>
                                <span className="text-[14px] leading-none">{getBadgeIcon(template.badge)}</span>
                                {template.badge}
                            </span>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 px-6">
                        {template.demoUrl && template.demoUrl !== '#' && (
                            <a href={template.demoUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-[14px] border-2 border-white/20 text-white hover:bg-white hover:text-[#0f172a] transition-all shadow-lg active:scale-95">
                                <Eye className="w-4 h-4" /> Preview
                            </a>
                        )}
                        <a href={useTemplateLink} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-[14px] bg-[#2563eb] text-white hover:bg-[#3b82f6] transition-all border-2 border-[#2563eb] shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95">
                            Use Template
                        </a>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between relative z-10 bg-[#0f172a]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-2xl font-bold font-syne text-white leading-tight tracking-tight">
                                {template.name}
                            </h3>
                        </div>
                        <p className="text-[15px] text-[#64748b] mb-6 leading-relaxed max-w-2xl font-medium">
                            {template.description}
                        </p>

                        <div className="flex flex-wrap gap-2.5 mb-6">
                            {template.features && template.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-[13px] font-medium text-slate-300 bg-white/5 py-1.5 px-3 rounded-md border border-white/5 shadow-sm">
                                    <Check className="w-3.5 h-3.5 text-[#06b6d4]" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 mt-auto border-t border-[rgba(255,255,255,0.07)] relative z-10">
                        <CategoryBadge />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${baseCardStyle} flex-col ${hoverEffects}`}>
            {/* THUMBNAIL AREA */}
            <div className={`h-[220px] w-full border-b border-[rgba(255,255,255,0.07)] relative flex items-center justify-center overflow-hidden shrink-0 ${template.image ? 'bg-slate-800' : `bg-gradient-to-br ${template.gradient || 'from-slate-800 to-slate-900'}`} shadow-inner`}>
                {!template.image && (
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent mix-blend-overlay"></div>
                )}

                {template.image ? (
                    <img
                        src={template.image}
                        alt={template.name}
                        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                    />
                ) : (
                    <div className="w-[104px] h-[104px] bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl border border-white/20 group-hover:scale-110 transition-transform duration-500 z-10 group-hover:rotate-6">
                        <span className="text-[64px] drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]">
                            {template.emoji || '🌐'}
                        </span>
                    </div>
                )}
                <div className={`absolute inset-0 transition-colors duration-300 pointer-events-none ${template.image ? 'bg-[#0f172a]/20 group-hover:bg-transparent' : 'bg-transparent'}`}></div>

                {template.badge && (
                    <div className="absolute top-4 left-4 z-20">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 shadow-lg backdrop-blur-md ${getBadgeStyle(template.badge)}`}>
                            <span className="text-[14px] leading-none">{getBadgeIcon(template.badge)}</span>
                            {template.badge}
                        </span>
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col sm:flex-row items-center justify-center gap-3 px-5 z-20">
                    {template.demoUrl && template.demoUrl !== '#' && (
                        <a href={template.demoUrl} target="_blank" rel="noopener noreferrer" className="flex-1 w-full text-center py-3 rounded-lg font-bold text-sm border-2 border-white/20 text-white hover:bg-white hover:text-[#0f172a] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
                            <Eye className="w-4 h-4" /> Preview
                        </a>
                    )}
                    <a href={useTemplateLink} target="_blank" rel="noopener noreferrer" className="flex-1 w-full text-center py-3 rounded-lg font-bold text-sm bg-[#2563eb] text-white hover:bg-[#3b82f6] transition-all border-2 border-[#2563eb] shadow-[0_0_20px_rgba(37,99,235,0.5)] active:scale-95 flex items-center justify-center">
                        Use Template
                    </a>
                </div>
            </div>

            {/* CARD BODY */}
            <div className="p-6 flex flex-col flex-grow relative z-10 bg-[#0f172a]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                <div className="flex justify-between items-start mb-3 gap-3 relative z-10">
                    <h3 className="text-[22px] font-bold font-syne text-white leading-tight tracking-tight">
                        {template.name}
                    </h3>
                </div>

                <p className="text-[15px] font-medium text-[#64748b] line-clamp-3 mb-8 flex-grow leading-relaxed relative z-10">
                    {template.description}
                </p>

                {/* FOOTER ROW */}
                <div className="flex items-center justify-between pt-5 mt-auto border-t border-[rgba(255,255,255,0.07)] relative z-10">
                    <CategoryBadge />
                </div>
            </div>
        </div>
    );
};

export default TemplateCard;
