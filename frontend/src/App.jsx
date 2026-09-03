import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';

// Import your existing verification components
import CodeInputView from './components/CodeInputView';
import LoadingOverlay from './components/LoadingOverlay';
import ResultView from './components/ResultView';

// --- NEW IMPORT ---
import SignupView from './views/SignupView'; 

// --- Placeholder Views for the new routing system ---
const DashboardView = () => (
  <div className="flex h-full flex-col animate-in fade-in duration-500">
    <h2 className="mb-2 text-2xl font-bold tracking-tight text-zinc-100">Forensic Dashboard</h2>
    <p className="mb-8 text-sm text-zinc-400">System overview and recent verification metrics.</p>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="rounded-xl border border-zinc-800/80 bg-[#121214] p-6 shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Scans</h3>
        <p className="mt-2 text-3xl font-light text-white">1,248</p>
      </div>
      <div className="rounded-xl border border-zinc-800/80 bg-[#121214] p-6 shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Divergences Caught</h3>
        <p className="mt-2 text-3xl font-light text-rose-400">342</p>
      </div>
      <div className="rounded-xl border border-zinc-800/80 bg-[#121214] p-6 shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Engine Uptime</h3>
        <p className="mt-2 text-3xl font-light text-emerald-400">99.9%</p>
      </div>
    </div>
  </div>
);

const PlaceholderView = ({ title, description }) => (
  <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-[#121214]/50 animate-in fade-in duration-500">
    <h2 className="text-lg font-semibold text-zinc-200">{title}</h2>
    <p className="mt-2 text-sm text-zinc-500">{description}</p>
    <div className="mt-6 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-xs font-medium text-indigo-400">
      Module In Development
    </div>
  </div>
);
// ----------------------------------------------------

export default function App() {
  // --- TOP-LEVEL GATEKEEPER STATE ---
  // 'AUTH' displays the waitlist. 'APP' displays the main layout.
  const [globalPhase, setGlobalPhase] = useState('AUTH');

  // Main Navigation State
  const [currentView, setCurrentView] = useState('Verify');
  
  // Verification Engine States
  const [verifyState, setVerifyState] = useState('INPUT'); // 'INPUT' | 'LOADING' | 'RESULT'
  const [sourceCode, setSourceCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  // Mock API Delay
  useEffect(() => {
    if (verifyState === 'LOADING') {
      const timer = setTimeout(() => setVerifyState('RESULT'), 4500);
      return () => clearTimeout(timer);
    }
  }, [verifyState]);

  // Router for the Verification Flow specifically
  const renderVerifyFlow = () => {
    switch (verifyState) {
      case 'INPUT':
        return (
          <CodeInputView 
            sourceCode={sourceCode} setSourceCode={setSourceCode}
            generatedCode={generatedCode} setGeneratedCode={setGeneratedCode}
            onVerify={() => setVerifyState('LOADING')} 
          />
        );
      case 'LOADING':
        return <LoadingOverlay />;
      case 'RESULT':
        return (
          <ResultView 
            sourceCode={sourceCode} generatedCode={generatedCode}
            verificationResult={verificationResult} 
            onReset={() => setVerifyState('INPUT')}
          />
        );
      default: return null;
    }
  };

  // Main App Router
  const renderActiveView = () => {
    switch (currentView) {
      case 'Dashboard':
        return <DashboardView />;
      case 'Verify':
        return renderVerifyFlow();
      case 'Scenarios':
        return <PlaceholderView title="Test Scenarios" description="Batch execute forensic scans against known vulnerable artefacts." />;
      case 'Evaluation':
        return <PlaceholderView title="Evaluation Metrics" description="Deep dive into LLM hallucination rates and confidence scoring." />;
      default:
        return <DashboardView />;
    }
  };

  // --- FINAL RENDER LOGIC ---
  // If we are in the AUTH phase, render ONLY the waitlist.
  if (globalPhase === 'AUTH') {
    return (
      <SignupView 
        onReturnToDashboard={() => {
          setGlobalPhase('APP');        // Switch to the main app
          setCurrentView('Dashboard');  // Start the user on the Dashboard view
        }} 
      />
    );
  }

  // Otherwise, render the full application with the Layout wrapper.
  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {renderActiveView()}
    </Layout>
  );
}