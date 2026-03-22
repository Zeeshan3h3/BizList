import React from 'react';
import logoImage from '../../assets/bizlist-logo.png';

/**
 * BizList Logo Component
 * Uses the uploaded logo image (laptop with shopping cart)
 */
const BizListLogo = ({ className = "", showTagline = false }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <img
                src={logoImage}
                alt="BizList - Make Your Business Official Online"
                className="h-16 w-auto"
            />
            {showTagline && (
                <span className="text-xs text-slate-500 hidden lg:block ml-2">
                    MAKE YOUR BUSINESS OFFICIAL ONLINE
                </span>
            )}
        </div>
    );
};

export default BizListLogo;
