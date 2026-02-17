import React from 'react';
import ScoreCard from './ScoreCard';
import BreakdownCard from './BreakdownCard';
import CTASection from './CTASection';
import AiSuggestions from './AiSuggestions';

const ResultsSection = ({ results, onBookingClick }) => {
    if (!results) return null;

    const { totalScore, breakdown } = results;

    // Platform icons
    const platformIcons = {
        google: (
            <img
                src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
                alt="Google"
                className="w-full h-full object-contain"
            />
        ),
        justdial: (
            <div className="w-full h-full flex items-center justify-center bg-orange-500 rounded-lg text-white font-bold text-sm">
                JD
            </div>
        ),
        website: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-blue-400">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2" />
            </svg>
        ),
    };

    return (
        <section className="relative min-h-screen py-20 bg-gradient-to-b from-blue-50 via-white to-green-50">
            <div className="container-custom">
                {/* Score Card */}
                <ScoreCard score={totalScore} />

                {/* Breakdown Grid - 3 platforms: Google Maps, JustDial, Website */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <BreakdownCard
                        platform="Google Maps"
                        icon={platformIcons.google}
                        score={breakdown.google.score}
                        maxScore={breakdown.google.maxScore}
                        breakdown={breakdown.google.details}
                        businessName={results.businessName}
                        businessImage={breakdown.google.businessImage}
                        googleMapsUrl={breakdown.google.googleMapsUrl}
                    />

                    <BreakdownCard
                        platform="JustDial"
                        icon={platformIcons.justdial}
                        score={breakdown.justdial.score}
                        maxScore={breakdown.justdial.maxScore}
                        breakdown={breakdown.justdial.details}
                    />

                    <BreakdownCard
                        platform="Website"
                        icon={platformIcons.website}
                        score={breakdown.website.score}
                        maxScore={breakdown.website.maxScore}
                        breakdown={breakdown.website.details}
                    />
                </div>



                {/* AI Suggestions Section */}
                <AiSuggestions businessData={results} />

                {/* CTA Section */}
                <CTASection onBookingClick={onBookingClick} />
            </div>
        </section >
    );
};

export default ResultsSection;
