import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'

console.log('App starting...');
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
console.log('Publishable Key exists:', !!PUBLISHABLE_KEY);

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  if (!PUBLISHABLE_KEY) {
    console.error('Missing Publishable Key');
    const root = createRoot(rootElement);
    root.render(
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-700 p-8 font-sans">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center border border-red-100">
          <h1 className="text-2xl font-bold mb-4">Configuration Missing</h1>
          <p className="mb-4">Clerk Publishable Key is not found.</p>
          <div className="bg-slate-100 p-4 rounded text-left text-sm font-mono text-slate-700 mb-6 overflow-x-auto">
            VITE_CLERK_PUBLISHABLE_KEY is undefined
          </div>
          <p className="text-sm text-slate-600">
            Please restart your development server to load the new environment variables.
          </p>
        </div>
      </div>
    );
  } else {
    createRoot(rootElement).render(
      <StrictMode>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
          <App />
        </ClerkProvider>
      </StrictMode>,
    )
  }
} catch (error) {
  console.error("FATAL ERROR DURING APP STARTUP:", error);
  document.body.innerHTML = `<div style="color:red; padding:20px;"><h1>Fatal Error</h1><pre>${error.message}</pre><pre>${error.stack}</pre></div>`;
}
