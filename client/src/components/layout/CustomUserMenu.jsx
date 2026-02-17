import React, { useState, useRef, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomUserMenu = () => {
    const { user } = useUser();
    const { signOut, openUserProfile } = useClerk();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    // Data Extraction
    // Priority: 1. publicMetadata (Business Name) -> 2. firstName (if overwritten) -> 3. "Business Profile"
    const businessName = user.publicMetadata?.businessName || user.username || "My Business";

    // Founder Name: Try to find a name that isn't the business name, or fallback to "Founder"
    // If user overwrote firstName with BusinessName, we might show BusinessName again unless we hardcode a request to change it back.
    // For now, let's display fullName.
    const founderName = user.fullName || user.username;
    const email = user.primaryEmailAddress?.emailAddress;
    const avatarUrl = user.imageUrl;

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger Button - Bigger Logo */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 focus:outline-none group"
            >
                <div className="relative">
                    <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-12 h-12 rounded-full border-2 border-slate-200 group-hover:border-blue-500 transition-colors object-cover"
                    />
                    <div className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                </div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                    >
                        {/* Header / Business Info */}
                        <div className="p-5 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-start space-x-4">
                                <img
                                    src={avatarUrl}
                                    alt="Business"
                                    className="w-16 h-16 rounded-xl border border-slate-200 object-cover shadow-sm"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-slate-800 truncate leading-tight">
                                        {businessName}
                                    </h3>
                                    <p className="text-sm font-medium text-slate-500 mt-0.5 truncate">
                                        {founderName}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate mt-0.5">
                                        {email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                            <button
                                onClick={() => {
                                    openUserProfile();
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                            >
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:text-blue-600">
                                    <Settings className="w-4 h-4" />
                                </div>
                                <span>Manage Account</span>
                            </button>

                            <div className="h-px bg-slate-100 my-1 mx-3" />

                            <button
                                onClick={() => signOut()}
                                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <div className="p-2 bg-red-100 rounded-lg text-red-500">
                                    <LogOut className="w-4 h-4" />
                                </div>
                                <span>Sign Out</span>
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 text-center">
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                Powered by BizList
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomUserMenu;
