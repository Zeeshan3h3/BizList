import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Mail, Heart } from 'lucide-react';
import BizListLogo from '../ui/BizListLogo';

/**
 * Modern Footer Component
 * Clean white background with organized sections
 */
const Footer = () => {
    const footerSections = {
        product: [
            { name: 'Check Score', path: '/check' },
            { name: 'Listings', path: '/listings' },
            { name: 'API', path: '/api' },
        ],
        legal: [
            { name: 'Privacy Policy', path: '/privacy' },
            { name: 'Terms & Conditions', path: '/terms' },
            { name: 'Cookie Policy', path: '/cookies' },
        ],
        connect: [
            { name: 'Contact Us', path: '/contact' },
            { name: 'About', path: '/about' },
            { name: 'Blog', path: '/blog' },
        ],
    };

    return (
        <footer className="bg-white border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Logo & Tagline */}
                    <div className="space-y-4">
                        <BizListLogo showTagline />
                        <p className="text-sm text-slate-500 max-w-xs">
                            Making local businesses visible and official online.
                            Check your digital health score instantly.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-primary transition-colors"
                            >
                                <Twitter size={20} />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-primary transition-colors"
                            >
                                <Linkedin size={20} />
                            </a>
                            <a
                                href="mailto:mdzeeshan08886@gmail.com"
                                className="text-slate-400 hover:text-primary transition-colors"
                            >
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Product Column */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">
                            Product
                        </h3>
                        <ul className="space-y-3">
                            {footerSections.product.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-slate-600 hover:text-primary transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">
                            Legal
                        </h3>
                        <ul className="space-y-3">
                            {footerSections.legal.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-slate-600 hover:text-primary transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Connect Column */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">
                            Connect
                        </h3>
                        <ul className="space-y-3">
                            {footerSections.connect.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-slate-600 hover:text-primary transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-slate-200">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-sm text-slate-500">
                            © {new Date().getFullYear()} BizList. All rights reserved.
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                            v 1.00
                        </p>
                        <p className="text-sm text-slate-500 flex items-center">
                            Made with <Heart className="text-red-500 mx-1" size={16} fill="currentColor" /> in Kolkata
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
