import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sparkles, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import BizListLogo from '../ui/BizListLogo';
import CustomUserMenu from './CustomUserMenu';

/**
 * Modern Glassy Header
 * - Fixed at top
 * - Backdrop blur effect
 * - Responsive with mobile menu
 */
const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Determine if we are currently in Pro Mode based on the URL
    const isProMode = location.pathname.startsWith('/pro');

    const navLinks = [
        { name: 'Home', path: isProMode ? '/pro' : '/' },
        { name: 'Recent Audits', path: isProMode ? '/pro/audits' : '/audits' },
        { name: 'Listings', path: '/listings' },
        { name: 'Templates', path: '/templates' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'About', path: '/about' }
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to={isProMode ? '/pro' : '/'} className="flex items-center">
                        <BizListLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-12 ml-12">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-slate-800 hover:text-primary transition-all duration-200 font-medium relative group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-200"></span>
                            </Link>
                        ))}
                    </div>

                    {/* Auth Buttons & Toggles */}
                    <div className="hidden md:flex items-center space-x-4 ml-8">

                        {/* Pro Mode Demo Toggle */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 xl:mr-4 rounded-xl border border-slate-200/60 shadow-inner">
                            <button
                                onClick={() => navigate('/')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all duration-300 ${!isProMode ? 'bg-white text-slate-800 font-semibold shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                            >
                                <Building2 size={14} className={!isProMode ? "text-blue-600" : "text-slate-400"} />
                                Business
                            </button>
                            <button
                                onClick={() => navigate('/pro')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all duration-300 ${isProMode ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                            >
                                <Sparkles size={14} className={isProMode ? "text-amber-300" : "text-slate-400"} />
                                Pro Mode
                            </button>
                        </div>

                        <SignedOut>
                            <Link to="/sign-in" className="px-4 py-2 text-slate-800 hover:text-primary transition-colors">
                                Login
                            </Link>
                            <Link to="/sign-up" className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all hover:scale-105 shadow-sm">
                                Sign Up
                            </Link>
                        </SignedOut>
                        <SignedIn>
                            <CustomUserMenu />
                        </SignedIn>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-slate-200"
                    >
                        <div className="px-4 py-4 space-y-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-slate-200 space-y-2">
                                {/* Mobile Pro Mode Toggle */}
                                <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                                    <button
                                        onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                                        className={`flex-1 flex justify-center items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-all ${!isProMode ? 'bg-white text-slate-800 font-semibold shadow-sm' : 'text-slate-500'}`}
                                    >
                                        <Building2 size={14} className={!isProMode ? "text-blue-600" : "text-slate-400"} />
                                        Business
                                    </button>
                                    <button
                                        onClick={() => { navigate('/pro'); setMobileMenuOpen(false); }}
                                        className={`flex-1 flex justify-center items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-all ${isProMode ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-sm' : 'text-slate-500'}`}
                                    >
                                        <Sparkles size={14} className={isProMode ? "text-amber-300" : "text-slate-400"} />
                                        Pro Mode
                                    </button>
                                </div>

                                <SignedOut>
                                    <Link
                                        to="/sign-in"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors block text-center"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/sign-up"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-colors block text-center"
                                    >
                                        Sign Up
                                    </Link>
                                </SignedOut>
                                <SignedIn>
                                    <div className="flex justify-center py-4">
                                        <CustomUserMenu />
                                    </div>
                                </SignedIn>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Header;
