import React, { useEffect } from 'react';
import { ArrowRight, Clock, User } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';

const BlogPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const posts = [
        {
            title: "5 SEO Strategies That Still Work in 2026",
            excerpt: "SEO has evolved drastically over the last decade. Here are the 5 core principles that remain effective for local businesses.",
            image: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&q=80&w=800",
            date: "Feb 5, 2026",
            author: "Sarah Chen",
            readTime: "5 min read"
        },
        {
            title: "Why Your Google Business Profile Score Matters",
            excerpt: "A high GMB score correlates directly with in-store visits. Learn how to optimize your profile for maximum visibility.",
            image: "https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&q=80&w=800",
            date: "Jan 28, 2026",
            author: "Alex Morgan",
            readTime: "4 min read"
        },
        {
            title: "The Ultimate Guide to Local Lead Generation",
            excerpt: "Stop buying cold leads. Learn how to generate warm, inbound leads from your local community using simple digital tools.",
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
            date: "Jan 15, 2026",
            author: "Michael Ross",
            readTime: "8 min read"
        },
        {
            title: "Understanding Digital Footprint Analysis",
            excerpt: "What does your digital footprint say about your brand? We break down the key metrics every business owner should know.",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
            date: "Dec 10, 2025",
            author: "Sarah Chen",
            readTime: "6 min read"
        },
        {
            title: "Social Media vs Website: Where to Focus?",
            excerpt: "Should you invest more in Instagram or your own domain? The data might surprise you.",
            image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800",
            date: "Nov 22, 2025",
            author: "Alex Morgan",
            readTime: "5 min read"
        },
        {
            title: "How to Respond to Negative Reviews",
            excerpt: "Turn your biggest critics into your biggest fans. A step-by-step guide to handling online reputation management.",
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
            date: "Nov 05, 2025",
            author: "Michael Ross",
            readTime: "7 min read"
        }
    ];

    return (
        <PageWrapper>
            <div className="bg-slate-50 min-h-screen pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Latest Insights</h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Trends, strategies, and success stories to help your business grow online.
                        </p>
                    </div>

                    {/* Blog Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post, index) => (
                            <article key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition-shadow group flex flex-col h-full">
                                {/* Image Wrapper */}
                                <div className="aspect-video overflow-hidden relative">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                                        Marketing
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center text-xs text-slate-500 mb-3 space-x-4">
                                        <span className="flex items-center"><Clock size={14} className="mr-1" /> {post.readTime}</span>
                                        <span className="flex items-center"><User size={14} className="mr-1" /> {post.author}</span>
                                    </div>

                                    <h2 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                                        {post.title}
                                    </h2>

                                    <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                                        {post.excerpt}
                                    </p>

                                    <div className="pt-6 border-t border-slate-100 mt-auto">
                                        <span className="text-blue-600 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform cursor-pointer">
                                            Read Article <ArrowRight size={16} className="ml-1" />
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Pagination Placeholder */}
                    <div className="mt-16 text-center">
                        <button className="px-6 py-3 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-white hover:border-slate-400 transition-colors">
                            Load More Articles
                        </button>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default BlogPage;
