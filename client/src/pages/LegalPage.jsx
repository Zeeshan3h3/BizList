import React, { useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';

const LegalPage = ({ type }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [type]);

    const getContent = () => {
        switch (type) {
            case 'privacy':
                return {
                    title: "Privacy Policy",
                    lastUpdated: "February 8, 2026",
                    content: (
                        <>
                            <p>At BizList, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.</p>

                            <h3>1. Information We Collect</h3>
                            <p>We collect information you provide directly to us, such as when you create an account, search for a business, or contact us. This may include your name, email address, and business details.</p>

                            <h3>2. How We Use Your Information</h3>
                            <p>We use the information we collect to provide, maintain, and improve our services, including:</p>
                            <ul>
                                <li>Processing your business audits.</li>
                                <li>Sending you technical notices and support messages.</li>
                                <li>Communicating with you about products, services, and events.</li>
                            </ul>

                            <h3>3. Data Security</h3>
                            <p>We implement appropriate technical and organizational measures to protect the security of your personal information.</p>
                        </>
                    )
                };
            case 'terms':
                return {
                    title: "Terms & Conditions",
                    lastUpdated: "February 8, 2026",
                    content: (
                        <>
                            <p>Welcome to BizList. By accessing or using our website, you agree to be bound by these Terms and Conditions.</p>

                            <h3>1. Acceptance of Terms</h3>
                            <p>By accessing and using this service, you accept and agree to these terms. If you do not agree to these terms, you should not use this service.</p>

                            <h3>2. Use of Service</h3>
                            <p>You agree to use BizList for lawful purposes only. You must not use our service to transmit any malicious code or interfere with the proper working of the site.</p>

                            <h3>3. Business Audits</h3>
                            <p>Our business audit scores are estimates based on public data. We do not guarantee the absolute accuracy of these scores and they should be used for informational purposes only.</p>
                        </>
                    )
                };
            case 'cookies':
                return {
                    title: "Cookie Policy",
                    lastUpdated: "February 8, 2026",
                    content: (
                        <>
                            <p>This Cookie Policy explains how BizList uses cookies and similar technologies to recognize you when you visit our website.</p>

                            <h3>1. What are Cookies?</h3>
                            <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently.</p>

                            <h3>2. How We Use Cookies</h3>
                            <p>We use cookies for the following purposes:</p>
                            <ul>
                                <li><strong>Essential Cookies:</strong> These are necessary for the website to function properly.</li>
                                <li><strong>Analytics Cookies:</strong> These help us understand how visitors interact with our website.</li>
                                <li><strong>Functionality Cookies:</strong> These allow us to remember usage choices you make.</li>
                            </ul>

                            <h3>3. Managing Cookies</h3>
                            <p>You can control and manage cookies in your browser settings. Please note that removing or blocking cookies may impact your user experience.</p>
                        </>
                    )
                };
            default:
                return {
                    title: "Legal",
                    lastUpdated: "",
                    content: <p>Page not found.</p>
                };
        }
    };

    const { title, lastUpdated, content } = getContent();

    return (
        <PageWrapper>
            <div className="bg-slate-50 min-h-screen py-20 pt-32">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{title}</h1>
                        <p className="text-slate-500 mb-8 border-b border-slate-100 pb-8">
                            Last Updated: {lastUpdated}
                        </p>

                        <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600">
                            {content}
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default LegalPage;
