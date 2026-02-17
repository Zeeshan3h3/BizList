import { SignUp } from "@clerk/clerk-react";
import { ArrowLeft, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BizListLogo from '../components/ui/BizListLogo';

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-white flex flex-row-reverse">
            {/* Right Side - Branding (Reversed for visual variety) */}
            <div className="hidden lg:flex w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-between p-12 text-white">
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-[100px] opacity-10 transform -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-[100px] opacity-20 transform translate-x-1/2 translate-y-1/2"></div>

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

                    <div className="mb-12">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                            <Rocket className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold leading-tight mb-6">
                            Start Your Journey Today
                        </h1>
                        <p className="text-lg text-blue-100 max-w-md">
                            Create your free account and get instant access to powerful business auditing and lead generation tools.
                        </p>
                    </div>
                </div>

                {/* Testimonial */}
                <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                    <p className="text-blue-50 italic mb-4">"BizList transformed how we handle our online presence. The automated audits are a game changer."</p>
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-white/20"></div>
                        <div>
                            <p className="font-semibold text-white">Sarah Jenkins</p>
                            <p className="text-xs text-blue-200">Marketing Director, TechFlow</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-slate-50">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center lg:text-left">
                        <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6 group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
                        <p className="text-slate-500">Get started with BizList in seconds.</p>
                    </div>

                    <div className="flex justify-center">
                        <SignUp
                            path="/sign-up"
                            routing="path"
                            signInUrl="/sign-in"
                            appearance={{
                                elements: {
                                    rootBox: "w-full",
                                    card: "shadow-none border border-slate-200 rounded-xl w-full",
                                    headerTitle: "hidden",
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
