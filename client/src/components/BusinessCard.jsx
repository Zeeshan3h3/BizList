import { useState } from 'react';

/**
 * BusinessCard Component
 * 
 * Displays a preview of a single business from Google Maps search results
 * Shows thumbnail, name, rating, reviews, and address
 * Allows user to select this business for auditing
 */
export default function BusinessCard({ business, onSelect, isSelected }) {
    const [imageError, setImageError] = useState(false);

    return (
        <div
            className={`business-card ${isSelected ? 'selected' : ''}`}
            onClick={onSelect}
        >
            {/* Thumbnail */}
            <div className="business-card-image">
                {business.thumbnail && !imageError ? (
                    <img
                        src={business.thumbnail}
                        alt={business.name}
                        referrerPolicy="no-referrer"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="business-card-image-placeholder">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Business Info */}
            <div className="business-card-content">
                <h3 className="business-card-name">{business.name}</h3>

                {/* Rating & Reviews */}
                {business.rating && (
                    <div className="business-card-rating">
                        <span className="rating-stars">⭐ {business.rating}</span>
                        {business.reviewCount > 0 && (
                            <span className="rating-count">({business.reviewCount.toLocaleString()})</span>
                        )}
                    </div>
                )}

                {/* Address */}
                <p className="business-card-address">{business.address}</p>

                {/* Selection indicator */}
                {isSelected && (
                    <div className="business-card-selected-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                        Selected
                    </div>
                )}
            </div>

            <style>{`
                .business-card {
                    background: white;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }

                .business-card:hover {
                    border-color: #3b82f6;
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(59, 130, 246, 0.15);
                }

                .business-card.selected {
                    border-color: #10b981;
                    background: #f0fdf4;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
                }

                .business-card-image {
                    width: 100%;
                    height: 150px;
                    overflow: hidden;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .business-card-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .business-card-image-placeholder {
                    color: #94a3b8;
                }

                .business-card-content {
                    padding: 16px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .business-card-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .business-card-rating {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 14px;
                }

                .rating-stars {
                    color: #f59e0b;
                    font-weight: 600;
                }

                .rating-count {
                    color: #64748b;
                }

                .business-card-address {
                    font-size: 13px;
                    color: #64748b;
                    margin: 0;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .business-card-selected-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #10b981;
                    font-size: 14px;
                    font-weight: 600;
                    margin-top: auto;
                    padding-top: 8px;
                }

                @media (max-width: 768px) {
                    .business-card-image {
                        height: 120px;
                    }

                    .business-card-content {
                        padding: 12px;
                    }

                    .business-card-name {
                        font-size: 15px;
                    }
                }
            `}</style>
        </div>
    );
}
