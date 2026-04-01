import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import UserSync from './components/auth/UserSync';
import './index.css';

// Eagerly loaded — these are on the critical path
import HomePage from './pages/HomePage';
import ScorePage from './pages/ScorePage';

// Lazy loaded — improves initial bundle size significantly
const ProHome = lazy(() => import('./pages/ProHome'));
const ProPage = lazy(() => import('./pages/ProPage'));
const SignInPage = lazy(() => import('./pages/SignInPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const TemplateDetailPage = lazy(() => import('./pages/TemplateDetailPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const RecentAuditsPage = lazy(() => import('./pages/RecentAuditsPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));

// Minimal loading fallback — keeps layout stable during chunk fetch
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ComingSoon = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-slate-800 mb-4">{title}</h1>
      <p className="text-xl text-slate-500">Coming Soon</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <UserSync />
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Core routes — eagerly loaded */}
            <Route path="/" element={<HomePage />} />
            <Route path="/check" element={<ScorePage />} />

            {/* Pro routes */}
            <Route path="/pro" element={<ProHome />} />
            <Route path="/pro/scan" element={<ProPage />} />
            <Route path="/pro/audits" element={<RecentAuditsPage />} />

            {/* Auth */}
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* Public pages */}
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/audits" element={<RecentAuditsPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/templates/:templateId" element={<TemplateDetailPage />} />
            <Route path="/pricing" element={<PricingPage />} />

            {/* Legal */}
            <Route path="/privacy" element={<LegalPage type="privacy" />} />
            <Route path="/terms" element={<LegalPage type="terms" />} />
            <Route path="/cookies" element={<LegalPage type="cookies" />} />

            {/* Placeholders */}
            <Route path="/listings" element={<ComingSoon title="Listings" />} />
            <Route path="/api" element={<ComingSoon title="API" />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
