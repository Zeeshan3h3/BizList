import { useState, useEffect, useRef } from 'react';
import BusinessCard from './BusinessCard';
import Button from './ui/Button';
import Input from './ui/Input';

/**
 * BusinessSearchSelector Component
 * 
 * Replaces the simple form with a search -> select -> audit flow
 * 1. User searches for businesses
 * 2. Multiple results shown as cards
 * 3. User selects exact business
 * 4. Audit runs on selected business
 */
export default function BusinessSearchSelector({ onAuditStart }) {
    const [businessName, setBusinessName] = useState('');
    const [area, setArea] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    // Autocomplete removed as requested


    const handleSearch = async (e) => {
        e.preventDefault();

        if (!businessName || !area) {
            setSearchError('Please enter both business name and area');
            return;
        }

        setIsSearching(true);
        setSearchError(null);
        setSearchResults([]);
        setSelectedBusiness(null);

        try {
            const response = await fetch('/api/search-businesses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ businessName, area }),
            });

            let data;
            try {
                const text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.error('Failed to parse response as JSON:', text);
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }
            } catch (e) {
                throw new Error(`Network error: ${e.message}`);
            }

            if (!response.ok) {
                console.error('Search failed with status:', response.status, data);
                throw new Error(data.message || data.error || `Search failed (${response.status})`);
            }

            if (data.results.length === 0) {
                setSearchError('No businesses found. Try a different search.');
            } else {
                setSearchResults(data.results);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchError(error.message || 'Failed to search. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectBusiness = (business) => {
        setSelectedBusiness(business);
    };

    const handleRunAudit = () => {
        if (selectedBusiness) {
            // Pass selected business URL and info to parent component
            // IMPORTANT: Use original search `area`, not business address
            onAuditStart({
                placeUrl: selectedBusiness.placeUrl,
                businessName: selectedBusiness.name,
                area: area // Use the original area from search form, not business.address
            });
        }
    };

    return (
        <div className="business-search-selector">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="search-form">
                <div className="search-inputs">
                    <div className="search-input-wrapper">
                        <Input
                            type="text"
                            placeholder="Business Name (e.g., Dominos Pizza)"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            disabled={isSearching}
                        />
                    </div>

                    <Input
                        type="text"
                        placeholder="Area (e.g., Connaught Place, Delhi)"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        disabled={isSearching}
                    />
                </div>
                <Button
                    type="submit"
                    disabled={isSearching}
                    className="search-button"
                >
                    {isSearching ? 'Searching...' : 'Search Businesses'}
                </Button>
            </form>

            {/* Error Message */}
            {searchError && (
                <div className="search-error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {searchError}
                </div>
            )}

            {/* Loading State */}
            {isSearching && (
                <div className="search-loading">
                    <div className="loading-spinner"></div>
                    <p>Searching Google Maps...</p>
                </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="search-results">
                    <h3 className="results-title">
                        Select Your Business ({searchResults.length} found)
                    </h3>
                    <div className="results-grid">
                        {searchResults.map((business) => (
                            <BusinessCard
                                key={business.id}
                                business={business}
                                isSelected={selectedBusiness?.id === business.id}
                                onSelect={() => handleSelectBusiness(business)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Run Audit Button */}
            {selectedBusiness && (
                <div className="audit-action">
                    <div className="selected-business-info">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                        <span>Selected: <strong>{selectedBusiness.name}</strong></span>
                    </div>
                    <Button
                        onClick={handleRunAudit}
                        className="audit-button"
                    >
                        Run Audit on This Business
                    </Button>
                </div>
            )}

            <style>{`
                .business-search-selector {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0;
                }

            .search-form {
                background: transparent;
            padding: 0;
            margin-bottom: 24px;
                }

            /* Fix input styling - Cleaner, Larger */
            .search-form input {
                background: white !important;
            border: 2px solid #e2e8f0 !important;
            color: #1e293b !important;
            font-size: 20px;            /* Larger text */
            padding: 24px 24px;         /* Taller input */
            border-radius: 12px;
            width: 100%;
            transition: all 0.2s;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

            .search-form input::placeholder {
                color: #94a3b8 !important;
                }

            .search-form input:focus {
                outline: none;
            border-color: #3b82f6 !important;
            background: white !important;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
                }

            /* Container for inputs */
            .search-inputs {
                display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
                }

            .search-button {
                width: 100%;
            padding: 24px !important;    /* Taller button */
            font-size: 22px !important;  /* Larger text */
            font-weight: 800 !important; /* Bold */
            letter-spacing: 0.5px;
            text-transform: uppercase;
            box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.4), 0 10px 10px -5px rgba(59, 130, 246, 0.2);
            transition: all 0.3s;
            border-radius: 12px;
                }

            .search-button:hover {
                transform: translateY(-3px);
            box-shadow: 0 25px 30px -5px rgba(59, 130, 246, 0.5);
                }

            /* Autocomplete Wrapper */
            .autocomplete-wrapper {
                position: relative;
            width: 100%;
                }

            /* Autocomplete Dropdown */
            .autocomplete-dropdown {
                position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            margin-top: 12px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            max-height: 300px;
            overflow-y: auto;
            z-index: 1000;
            animation: slideDown 0.2s ease-out;
                }

            @keyframes slideDown {
                from {
                opacity: 0;
            transform: translateY(-10px);
                    }
            to {
                opacity: 1;
            transform: translateY(0);
                    }
                }

            /* Autocomplete Header */
            .autocomplete-header {
                display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
                }

            .autocomplete-header svg {
                stroke - width: 2;
                }

            /* Autocomplete Item */
            .autocomplete-item {
                display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            cursor: pointer;
            transition: all 0.15s;
            border-bottom: 1px solid #f1f5f9;
            color: #1e293b;
                }

            .autocomplete-item:last-child {
                border - bottom: none;
                }

            .autocomplete-item:hover {
                background: linear-gradient(90deg, #f0f9ff 0%, #f8fafc 100%);
            padding-left: 24px;
                }

            .autocomplete-item svg {
                flex - shrink: 0;
            color: #3b82f6;
            stroke-width: 2;
                }

            .autocomplete-item span {
                font - size: 16px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
                }

            /* Autocomplete Loading Indicator */
            .autocomplete-loading {
                position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
                }

            .mini-spinner {
                width: 22px;
            height: 22px;
            border: 2px solid #e2e8f0;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
                }

            @keyframes spin {
                to {transform: rotate(360deg); }
                }

            .search-error {
                display: flex;
            align-items: center;
            gap: 12px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 24px;
                }

            .search-error svg {
                flex - shrink: 0;
                }

            .search-loading {
                text - align: center;
            padding: 40px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

            .loading-spinner {
                width: 48px;
            height: 48px;
            border: 4px solid #e2e8f0;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 16px;
                }

            @keyframes spin {
                to {transform: rotate(360deg); }
                }

            .search-loading p {
                color: #64748b;
            font-size: 16px;
            margin: 0;
                }

            .search-results {
                margin - bottom: 24px;
                }

            .results-title {
                font - size: 20px;
            font-weight: 700;
            color: #ffffff;
            margin: 0 0 20px 0;
            text-align: center;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }

            .results-grid {
                display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 24px;
                }

            .audit-action {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 24px;
            border-radius: 16px;
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
            text-align: center;
                }

            .selected-business-info {
                display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: white;
            font-size: 16px;
            margin-bottom: 16px;
                }

            .selected-business-info svg {
                flex - shrink: 0;
                }

            .audit-button {
                background: white !important;
            color: #10b981 !important;
            font-weight: 700;
            font-size: 18px;
            padding: 16px 32px;
            max-width: 400px;
            margin: 0 auto;
                }

            .audit-button:hover {
                transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
                }

            @media (max-width: 768px) {
                    .search - inputs {
                grid - template - columns: 1fr;
            gap: 16px;
                    }

            .results-grid {
                grid - template - columns: 1fr;
                    }

            .search-form {
                padding: 0;
                    }

            .audit-action {
                padding: 20px;
                    }

            .selected-business-info {
                flex - direction: column;
            gap: 12px;
                    }
                }
            `}</style>
        </div >
    );
}
