import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ScorePage from './pages/ScorePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import './index.css';

import UserSync from './components/auth/UserSync';
import OnboardingPage from './pages/OnboardingPage';

import LegalPage from './pages/LegalPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';

/**
 * Main App Component
 * Now using React Router for multi-page navigation
 */
function App() {
  return (
    <BrowserRouter>
      <UserSync />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/check" element={<ScorePage />} />

          {/* Auth Routes */}
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Connect Pages */}
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />

          {/* Legal Pages */}
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/cookies" element={<LegalPage type="cookies" />} />

          {/* Placeholder routes */}
          <Route path="/listings" element={<ComingSoon title="Listings" />} />
          <Route path="/api" element={<ComingSoon title="API" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

// Simple Coming Soon page for placeholder routes
const ComingSoon = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-slate-800 mb-4">{title}</h1>
      <p className="text-xl text-slate-500">Coming Soon</p>
    </div>
  </div>
);

export default App;
