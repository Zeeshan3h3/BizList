import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';

// Import template screenshots
import doctorImg from '../../assets/Screenshot 2026-03-16 011740.png';
import packrightImg from '../../assets/Screenshot 2026-03-16 011704.png';
import artisanImg from '../../assets/Screenshot 2026-03-16 011720.png';
import lawyerImg from '../../assets/advocateweb.png';
import portfolioImg from '../../assets/Screenshot 2026-03-16 011827.png';

const CARDS = [
    {
        id: 1, image: doctorImg, name: 'Medical Platform', link: 'https://drscsantra.com',
        left: '50%', top: '50%', baseZ: 0, rotate: -2, parallax: 0.015, delay: 0, zIndex: 20,
        className: 'w-[260px] lg:w-[360px] xl:w-[440px] aspect-[16/11]', floatClass: 'ft-float-main', filter: 'none', bright: 1,
        theme: { bg: 'bg-blue-50/50', primary: 'bg-blue-600', secondary: 'bg-blue-200' }
    },
    {
        id: 2, image: lawyerImg, name: 'Legal Advocate', link: '#',
        left: '18%', top: '24%', baseZ: -40, rotate: -6, parallax: 0.03, delay: 0.15, zIndex: 18,
        className: 'w-[140px] lg:w-[200px] xl:w-[260px] aspect-[16/11]', floatClass: 'ft-float-b', filter: 'blur(2px)', bright: 0.85,
        theme: { bg: 'bg-slate-100/50', primary: 'bg-indigo-900', secondary: 'bg-slate-300' }
    },
    {
        id: 3, image: packrightImg, name: 'B2B Commerce', link: '#',
        left: '82%', top: '28%', baseZ: -20, rotate: 5, parallax: 0.025, delay: 0.3, zIndex: 19,
        className: 'w-[130px] lg:w-[180px] xl:w-[240px] aspect-[16/11]', floatClass: 'ft-float-c', filter: 'blur(1px)', bright: 0.9,
        theme: { bg: 'bg-amber-50', primary: 'bg-amber-600', secondary: 'bg-amber-200' }
    },
    {
        id: 4, image: artisanImg, name: 'Artisan Store', link: '#',
        left: '25%', top: '76%', baseZ: -60, rotate: 8, parallax: 0.04, delay: 0.45, zIndex: 17,
        className: 'w-[150px] lg:w-[220px] xl:w-[280px] aspect-[16/11]', floatClass: 'ft-float-d', filter: 'blur(3px)', bright: 0.8,
        theme: { bg: 'bg-orange-50/30', primary: 'bg-orange-800', secondary: 'bg-orange-200' }
    },
    {
        id: 5, image: portfolioImg, name: 'Dev Portfolio', link: '#',
        left: '78%', top: '72%', baseZ: -30, rotate: -4, parallax: 0.02, delay: 0.6, zIndex: 16,
        className: 'w-[160px] lg:w-[240px] xl:w-[300px] aspect-[16/11]', floatClass: 'ft-float-e', filter: 'blur(1.5px)', bright: 0.85,
        theme: { bg: 'bg-[#111]', primary: 'bg-emerald-500', secondary: 'bg-zinc-800' }
    }
];

const BrowserChrome = ({ compact = false, url = "" }) => (
    <div className={`${compact ? 'h-4 lg:h-7' : 'h-10'} bg-[#1a1a1f] border-b border-white/5 flex items-center px-3 lg:px-4 gap-2 backdrop-blur-md flex-shrink-0 z-50`}>
        <div className="flex gap-1.5">
            <div className={`${compact ? 'w-[5px] h-[5px] lg:w-2 lg:h-2' : 'w-3 h-3'} rounded-full bg-[#FF5F56]`}></div>
            <div className={`${compact ? 'w-[5px] h-[5px] lg:w-2 lg:h-2' : 'w-3 h-3'} rounded-full bg-[#FFBD2E]`}></div>
            <div className={`${compact ? 'w-[5px] h-[5px] lg:w-2 lg:h-2' : 'w-3 h-3'} rounded-full bg-[#27C93F]`}></div>
        </div>
        <div className={`ml-2 ${compact ? 'h-1.5 lg:h-2.5 max-w-[60%]' : 'h-6 max-w-[300px] mx-auto absolute left-1/2 -translate-x-1/2'} bg-white/5 rounded-md flex-grow flex items-center justify-center`}>
            {!compact && <span className="text-[10px] text-white/30 font-medium tracking-wide">{url}</span>}
        </div>
    </div>
);

const FauxPage = ({ card }) => {
    const theme = card.theme;
    return (
        <div className={`w-full flex-grow ${theme.bg} overflow-hidden`}>
            <img src={card.image} alt={card.name} className="w-full h-auto object-cover object-top" />
            {/* Scrollable faux content to simulate a full long website */}
            <div className="p-8 sm:p-14 pb-24">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="space-y-4">
                        <div className={`h-12 w-3/4 ${theme.primary} rounded-2xl opacity-20`}></div>
                        <div className={`h-6 w-full ${theme.secondary} rounded-xl opacity-60`}></div>
                        <div className={`h-6 w-5/6 ${theme.secondary} rounded-xl opacity-60`}></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className={`h-56 ${theme.primary} rounded-3xl opacity-[0.08]`}></div>
                        <div className={`h-56 ${theme.primary} rounded-3xl opacity-[0.08]`}></div>
                    </div>
                    <div className="flex gap-4">
                        <div className={`h-14 w-40 ${theme.primary} rounded-xl opacity-90 shadow-lg`}></div>
                        <div className={`h-14 w-40 ${theme.secondary} rounded-xl opacity-70`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Desktop Premium Card Cluster ──
const ParallaxShowcase = () => {
    const containerRef = useRef(null);
    const renderRef = useRef(null);
    const [activeCard, setActiveCard] = useState(null);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (activeCard) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [activeCard]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setActiveCard(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const mouseParams = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            mouseParams.current.x = (e.clientX - cx) / cx;
            mouseParams.current.y = (e.clientY - cy) / cy;
        };

        window.addEventListener('mousemove', handleMouseMove);

        const renderLoop = () => {
            const p = mouseParams.current;
            p.targetX += (p.x - p.targetX) * 0.1;
            p.targetY += (p.y - p.targetY) * 0.1;

            if (containerRef.current) {
                const cardNodes = containerRef.current.querySelectorAll('.parallax-card-node');

                cardNodes.forEach(node => {
                    // Only apply parallax if not hovered and not active
                    if (!node.matches(':hover') && !node.classList.contains('is-active')) {
                        const bz = parseFloat(node.dataset.baseZ || 0);
                        const br = parseFloat(node.dataset.baseRot || 0);
                        const pFactor = parseFloat(node.dataset.parallax || 0);

                        const px = p.targetX * (window.innerWidth * pFactor);
                        const py = p.targetY * (window.innerHeight * pFactor);

                        const clampX = Math.max(-40, Math.min(40, px));
                        const clampY = Math.max(-40, Math.min(40, py));

                        node.style.transform = `translate3d(calc(-50% + ${clampX}px), calc(-50% + ${clampY}px), ${bz}px) rotate(${br}deg)`;
                    }
                });
            }
            renderRef.current = requestAnimationFrame(renderLoop);
        };

        renderRef.current = requestAnimationFrame(renderLoop);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (renderRef.current) cancelAnimationFrame(renderRef.current);
        };
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-auto overflow-visible" style={{ perspective: '1200px' }}>

            {/* ── Background Glow Orbs ── */}
            <div className="absolute inset-0 pointer-events-none overflow-visible">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-radial from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-[80px]"></div>
                <div className="absolute top-[20%] right-[15%] w-[250px] h-[250px] bg-gradient-radial from-cyan-400/15 to-transparent rounded-full blur-[70px] animate-pulse"></div>
            </div>

            {/* ── Card Stack ── */}
            {CARDS.map((card, i) => {
                const isActive = activeCard?.id === card.id;

                return (
                    <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 80, z: -100 }}
                        animate={{ opacity: 1, y: 0, z: 0 }}
                        transition={{ duration: 1.0, delay: card.delay, ease: [0.34, 1.56, 0.64, 1] }}
                        className="absolute"
                        style={{
                            zIndex: isActive ? 0 : card.zIndex, // Drop zIndex when active so layoutId handles it via AnimatePresence overlay
                            left: card.left,
                            top: card.top,
                            opacity: isActive ? 0 : 1, // Hide base card while modal is dominating via layoutId
                        }}
                        onAnimationComplete={() => {
                            const el = document.getElementById(`parallax-card-${card.id}`);
                            if (el && !isActive) {
                                el.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.4s ease, box-shadow 0.4s ease';
                                setTimeout(() => { el.style.transition = 'none'; }, 400);
                            }
                        }}
                    >
                        <motion.div
                            id={`parallax-card-${card.id}`}
                            layoutId={`mockup-card-${card.id}`}
                            onClick={() => setActiveCard(card)}
                            className={`parallax-card-node block absolute group cursor-pointer ${isActive ? 'is-active pointer-events-none' : ''}`}
                            data-base-z={card.baseZ}
                            data-base-rot={card.rotate}
                            data-parallax={card.parallax}
                            style={{
                                transform: `translate3d(-50%, -50%, ${card.baseZ}px) rotate(${card.rotate}deg)`,
                            }}
                            onMouseEnter={(e) => {
                                if (isActive) return;
                                e.currentTarget.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease, filter 0.3s ease';
                                e.currentTarget.style.transform = `translate3d(-50%, -50%, 60px) scale(1.08) rotate(0deg)`;
                                e.currentTarget.style.filter = 'blur(0) brightness(1.1)';
                                e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(0,0,0,0.4), 0 0 32px rgba(79,70,229,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                if (isActive) return;
                                e.currentTarget.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.4s ease, box-shadow 0.4s ease';
                                e.currentTarget.style.filter = `${card.filter} brightness(${card.bright})`;
                                e.currentTarget.style.boxShadow = '0 24px 48px -12px rgba(0,0,0,0.3)';
                                setTimeout(() => { e.currentTarget.style.transition = 'none'; }, 400);
                            }}
                        >
                            <div className={isActive ? '' : card.floatClass}>
                                <div
                                    className={`relative bg-[#19191E]/70 border border-white/10 rounded-[12px] lg:rounded-[16px] backdrop-blur-[12px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] flex flex-col overflow-hidden ${card.className}`}
                                    style={{
                                        filter: isActive ? 'none' : `${card.filter} brightness(${card.bright})`,
                                    }}
                                >
                                    <BrowserChrome compact={true} />
                                    <div className="flex-grow relative overflow-hidden bg-slate-900 flex items-center justify-center">
                                        <img
                                            src={card.image}
                                            alt={card.name}
                                            className="absolute top-0 left-0 w-full h-full object-cover object-top opacity-90 transition-transform duration-700 group-hover:scale-105"
                                            loading="lazy"
                                            draggable={false}
                                        />
                                    </div>
                                    <div className="absolute inset-0 rounded-[12px] lg:rounded-[16px] border border-white/5 pointer-events-none z-20"></div>

                                    {/* Tooltip affordance on hover */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg opacity-0 transform translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-30 flex items-center gap-1.5">
                                        <span className="text-white text-[10px] font-bold uppercase tracking-wider">Expand</span>
                                        <ExternalLink className="w-3 h-3 text-indigo-400" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                );
            })}

            {/* ── Modal Overlay ── */}
            <AnimatePresence>
                {activeCard && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setActiveCard(null)}
                            className="absolute inset-0 bg-black/75 backdrop-blur-[12px]"
                        ></motion.div>

                        {/* Modal Content */}
                        <div className="relative z-10 w-full max-w-[900px] px-4 pointer-events-none flex items-center justify-center h-full max-h-screen py-8">

                            <motion.div
                                layoutId={`mockup-card-${activeCard.id}`}
                                transition={{ type: "spring", stiffness: 220, damping: 25, bounce: 0.1, duration: 0.5 }}
                                className="relative w-[95vw] lg:w-[85vw] max-w-[900px] max-h-full bg-[#111] border border-white/[0.15] rounded-[16px] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.6)] flex flex-col pointer-events-auto"
                            >
                                <BrowserChrome compact={false} url={`https://${activeCard.name.replace(/\s+/g, '').toLowerCase()}.com`} />

                                <div className="overflow-y-auto scrollbar-hide flex-grow select-auto bg-slate-900 relative h-full">
                                    <FauxPage card={activeCard} />
                                </div>
                            </motion.div>

                            {/* Close Button */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                transition={{ delay: 0.2 }}
                                onClick={() => setActiveCard(null)}
                                className="absolute top-4 md:top-8 right-6 md:right-10 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-center z-50 transition-colors pointer-events-auto cursor-pointer group shadow-xl"
                            >
                                <X className="w-5 h-5 text-white/80 group-hover:text-white" />
                            </motion.button>
                        </div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

// ── Mobile Horizontal Scroller ──
const MobileScroller = () => (
    <div className="md:hidden">
        <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[200px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}
            />
            <div className="flex items-center h-[300px] overflow-hidden">
                <div className="flex gap-5 animate-infinite-scroll whitespace-nowrap px-4 py-8">
                    {[...CARDS, ...CARDS].map((card, idx) => (
                        <a
                            key={`${card.id}-${idx}`}
                            href={card.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block flex-shrink-0"
                        >
                            <div className="relative bg-[#19191E]/70 border border-white/10 rounded-[12px] shadow-2xl backdrop-blur-md overflow-hidden flex flex-col w-[260px] aspect-[16/11]">
                                <BrowserChrome compact={true} />
                                <div className="flex-grow relative overflow-hidden bg-slate-900">
                                    <img
                                        src={card.image}
                                        alt={card.name}
                                        className="absolute top-0 left-0 w-full h-full object-cover object-top opacity-90"
                                        loading="lazy"
                                        draggable={false}
                                    />
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

// ── Main Export ──
const FloatingTemplates = () => (
    <div className="w-full h-full">
        <div className="hidden md:block relative w-full min-h-[500px] h-[550px] overflow-visible">
            <ParallaxShowcase />
        </div>
        <MobileScroller />
    </div>
);

export default FloatingTemplates;
