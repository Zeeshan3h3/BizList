import React from 'react';
import { motion } from 'framer-motion';

/**
 * Page Wrapper with Framer Motion Transitions
 * Provides consistent fade-in and slide-up animations for all pages
 */
const PageWrapper = ({ children, className = "" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default PageWrapper;
