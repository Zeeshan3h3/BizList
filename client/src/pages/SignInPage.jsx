import { SignIn } from "@clerk/clerk-react";
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BizListLogo from '../components/ui/BizListLogo';

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-white flex">
            {/* Left Side - Branding & Features */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-[100px] opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>

                {/* Content */}
                <div className="relative z-10">
                    <Link to="/" className="inline-block mb-12">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-xl border border-white/20"
                        >
                            <BizListLogo />
                        </motion.div>
                    </Link>

                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Unlock Your Business Potential
                    </h1>
                    <p className="text-xl text-slate-400 max-w-md">
                        Join thousands of businesses using BizList to audit their presence and grow their reach.
                    </p>
                </div>

                {/* Feature List */}
                <div className="space-y-4 relative z-10">
                    {[
                        "Instant automated business audits",
                        "SEO optimization recommendations",
                        "Competitor analysis & tracking",
                        "Lead generation tools"
                    ].map((feature, i) => (
                        <div key={i} className="flex items-center space-x-3 text-slate-300">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="relative z-10 text-sm text-slate-500">
                    © {new Date().getFullYear()} BizList Inc. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-slate-50">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center lg:text-left">
                        <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6 group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                        <p className="text-slate-500">Please sign in to your dashboard.</p>
                    </div>

                    <div className="flex justify-center">
                        <SignIn
                            path="/sign-in"
                            routing="path"
                            signUpUrl="/sign-up"
                            appearance={{
                                elements: {
                                    rootBox: "w-full",
                                    card: "shadow-none border border-slate-200 rounded-xl w-full",
                                    headerTitle: "hidden", // We use our own header
                                    headerSubtitle: "hidden",
                                    socialButtonsBlockButton: "border border-slate-300 hover:bg-slate-50 text-slate-700",
                                    formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                                    footerActionLink: "text-blue-600 hover:text-blue-700"
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
