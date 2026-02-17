import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Main Layout Wrapper
 * Wraps all pages with Navbar and Footer
 */
const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            {/* Main Content - Add padding-top to account for fixed navbar */}
            <main className="flex-1 pt-20">
                {children}
            </main>

            <Footer />
        </div>
    );
};

export default Layout;
