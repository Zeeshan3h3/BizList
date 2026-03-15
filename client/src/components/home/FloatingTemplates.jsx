import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

// Import user's actual template screenshots
import doctorImg from '../../assets/Screenshot 2026-03-16 011740.png';
import coachingImg from '../../assets/CoachingT.png';
import packrightImg from '../../assets/Screenshot 2026-03-16 011704.png';
import artisanImg from '../../assets/Screenshot 2026-03-16 011720.png';
import lawyerImg from '../../assets/Screenshot 2026-03-16 011803.png';
import portfolioImg from '../../assets/Screenshot 2026-03-16 011827.png';

const TEMPLATES = [
    {
        id: 1, name: 'Dr. S.C. Santra', category: 'Medical',
        image: doctorImg, link: 'https://drscsantra.com',
        orbit: { radius: 0, angle: 0 }, // CENTER hero card
        size: 'w-[300px]', depth: 1, zIndex: 20,
    },
    {
        id: 2, name: 'Arjun Sharma', category: 'Legal',
        image: lawyerImg, link: '#',
        orbit: { radius: 180, angle: 30 },
        size: 'w-[230px]', depth: 0.85, zIndex: 14,
    },
    {
        id: 3, name: 'MD Zeeshan', category: 'Portfolio',
        image: portfolioImg, link: 'https://mdzeeshan.me',
        orbit: { radius: 200, angle: 120 },
        size: 'w-[220px]', depth: 0.75, zIndex: 12,
    },
    {
        id: 4, name: 'PackRight', category: 'E-Commerce',
        image: packrightImg, link: '#',
        orbit: { radius: 190, angle: 210 },
        size: 'w-[240px]', depth: 0.8, zIndex: 13,
    },
    {
        id: 5, name: 'The Learning Pro', category: 'Education',
        image: coachingImg, link: '#',
        orbit: { radius: 170, angle: 300 },
        size: 'w-[210px]', depth: 0.7, zIndex: 10,
    },
    {
        id: 6, name: 'Aura & Clay', category: 'Artisan',
        image: artisanImg, link: '#',
        orbit: { radius: 220, angle: 160 },
        size: 'w-[200px]', depth: 0.6, zIndex: 8,
    },
];

// ── Desktop Orbital Cluster ──
const OrbitalCluster = () => {
    const containerRef = useRef(null);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });

    // Mouse parallax — subtle shift on hover
    const handleMouseMove = useCallback((e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        // Normalized -1 to 1, clamped
        const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
        const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
        setMouse({ x: nx, y: ny });
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full flex items-center justify-center"
            style={{ perspective: '1000px' }}
        >
            {/* ── Atmospheric Gradient Glow Layers ── */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Primary purple-blue orb */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-radial from-indigo-500/25 via-blue-400/15 to-transparent blur-[100px] animate-glow-pulse"></div>
                {/* Secondary cyan accent */}
                <div className="absolute top-[30%] left-[60%] w-[300px] h-[300px] rounded-full bg-gradient-radial from-cyan-400/15 via-blue-300/8 to-transparent blur-[80px] animate-glow-drift"></div>
                {/* Soft pink whisper */}
                <div className="absolute top-[65%] left-[35%] w-[250px] h-[250px] rounded-full bg-gradient-radial from-violet-400/12 to-transparent blur-[90px] animate-glow-pulse" style={{ animationDelay: '3s' }}></div>
            </div>

            {/* ── Subtle Grid Texture Overlay ── */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.035]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                }}
            ></div>

            {/* ── Orbital Container with slow rotation ── */}
            <div
                className="relative w-[500px] h-[500px] animate-orbit-rotate"
                style={{
                    transformStyle: 'preserve-3d',
                    // Mouse parallax on the whole cluster
                    transform: `
                        rotateY(${mouse.x * 4}deg)
                        rotateX(${mouse.y * -3}deg)
                    `,
                    transition: 'transform 0.3s ease-out',
                }}
            >
                {TEMPLATES.map((tpl, i) => {
                    const isCenter = tpl.orbit.radius === 0;
                    const angleRad = (tpl.orbit.angle * Math.PI) / 180;
                    const tx = isCenter ? 0 : Math.cos(angleRad) * tpl.orbit.radius;
                    const ty = isCenter ? 0 : Math.sin(angleRad) * tpl.orbit.radius * 0.55; // Elliptical
                    const parallaxMultiplier = tpl.depth;
                    const mx = mouse.x * 10 * parallaxMultiplier;
                    const my = mouse.y * 8 * parallaxMultiplier;

                    return (
                        <motion.div
                            key={tpl.id}
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="absolute"
                            style={{
                                left: '50%',
                                top: '50%',
                                zIndex: tpl.zIndex,
                                transform: `
                                    translate(-50%, -50%)
                                    translate(${tx + mx}px, ${ty + my}px)
                                    scale(${tpl.depth})
                                `,
                                transition: 'transform 0.3s ease-out',
                            }}
                        >
                            <a
                                href={tpl.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block group"
                                title={`Visit ${tpl.name}`}
                            >
                                <div
                                    className={`
                                        relative animate-card-breathe
                                        ${isCenter ? 'animate-float-slow' : i % 2 === 0 ? 'animate-float-mid' : 'animate-float-fast'}
                                    `}
                                    style={{ animationDelay: `${i * 0.6}s` }}
                                >
                                    {/* Ambient glow shadow */}
                                    <div
                                        className="absolute -inset-4 rounded-[26px] opacity-0 group-hover:opacity-100 transition-all duration-500"
                                        style={{
                                            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
                                            filter: 'blur(20px)',
                                        }}
                                    ></div>

                                    {/* Card */}
                                    <div
                                        className={`
                                            relative overflow-hidden rounded-[18px] border border-white/30
                                            transition-all duration-500
                                            group-hover:scale-[1.06] group-hover:border-indigo-300/40
                                            ${isCenter
                                                ? 'shadow-[0_15px_50px_rgba(0,0,0,0.12),0_0_30px_rgba(99,102,241,0.1)]'
                                                : 'shadow-[0_8px_30px_rgba(0,0,0,0.08)]'
                                            }
                                        `}
                                        style={{
                                            transform: `rotate(${isCenter ? 0 : (i % 2 === 0 ? 3 : -3)}deg)`,
                                            filter: tpl.depth < 0.75 ? `blur(${(1 - tpl.depth) * 2}px)` : 'none',
                                        }}
                                    >
                                        <img
                                            src={tpl.image}
                                            alt={`${tpl.name} — ${tpl.category}`}
                                            className={`${tpl.size} aspect-[16/10] object-cover object-top`}
                                            loading="lazy"
                                            draggable={false}
                                        />

                                        {/* Hover label */}
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <p className="text-white text-[10px] font-black tracking-[0.14em] uppercase">{tpl.name}</p>
                                            <p className="text-white/60 text-[8px] font-semibold tracking-wider uppercase mt-0.5">{tpl.category}</p>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

// ── Mobile Horizontal Scroller ──
const MobileScroller = () => (
    <div className="md:hidden">
        {/* Mobile glow */}
        <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[200px] bg-gradient-radial from-indigo-400/15 to-transparent blur-[60px] pointer-events-none"></div>
            <div className="flex items-center h-[220px] overflow-hidden">
                <div className="flex gap-5 animate-infinite-scroll whitespace-nowrap px-4">
                    {[...TEMPLATES, ...TEMPLATES].map((tpl, idx) => (
                        <a
                            key={`${tpl.id}-${idx}`}
                            href={tpl.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block flex-shrink-0"
                        >
                            <div className="relative overflow-hidden rounded-2xl shadow-lg border border-white/20 w-72">
                                <img
                                    src={tpl.image}
                                    alt={tpl.name}
                                    className="w-full aspect-[16/10] object-cover object-top"
                                    loading="lazy"
                                    draggable={false}
                                />
                                <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm p-2.5 border-t border-white/10">
                                    <p className="text-white text-[9px] font-black tracking-[0.12em] uppercase">{tpl.name}</p>
                                    <p className="text-white/50 text-[8px] font-semibold tracking-wider uppercase">{tpl.category}</p>
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
const FloatingTemplates = () => {
    return (
        <>
            {/* Desktop: Orbital Cluster */}
            <div className="hidden md:block w-full h-full min-h-[580px]">
                <OrbitalCluster />
            </div>
            {/* Mobile: Scroller */}
            <MobileScroller />
        </>
    );
};

export default FloatingTemplates;
