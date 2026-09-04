// frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import ResultView from './components/ResultView';
import ScenarioBrowser from './components/ScenarioBrowser';
import EvaluationDashboard from './components/EvaluationDashboard';
import { verifyArtifact, checkHealth } from './api/client';
import { 
  Shield, 
  Play, 
  Loader2, 
  AlertTriangle, 
  Layers, 
  BarChart3, 
  Terminal, 
  RotateCcw 
} from 'lucide-react';

const DEFAULT_SOURCE = `def calculate_invoice(subtotal: float, discount: float, tax_rate: float) -> float:
    """Computes invoice total using standard banker's rounding."""
    discounted = subtotal * (1.0 - discount)
    total = discounted * (1.0 + tax_rate)
    return round(total, 2)
`;

const DEFAULT_GENERATED = `def calculate_invoice(subtotal: float, discount: float, tax_rate: float) -> float:
    """Optimized invoice calculation."""
    discounted = subtotal * (1.0 - discount)
    total = discounted * (1.0 + tax_rate)
    # Truncation mutation introduced
    return float(int(total * 100) / 100)
`;

export default function App() {
  const [activeTab, setActiveTab] = useState('VERIFY');
  const [sourceCode, setSourceCode] = useState(DEFAULT_SOURCE);
  const [generatedCode, setGeneratedCode] = useState(DEFAULT_GENERATED);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null);
  const [error, setError] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function poll() {
      const res = await checkHealth();
      if (mounted) setBackendOnline(res.online);
    }
    poll();
    const interval = setInterval(poll, 12000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleRunVerification = async () => {
    if (!sourceCode.trim() || !generatedCode.trim()) {
      setError('Both source and generated artefacts are required for verification.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await verifyArtifact(sourceCode, generatedCode);
      setVerificationResult(result);
    } catch (err) {
      setError(err.message || 'Verification pipeline encountered an execution error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectScenario = (sc) => {
    // Normalizes across top-level fields, camelCase variations, and nested artifact objects
    const src =
      sc.source_code ||
      sc.sourceArtifact?.files?.[0]?.content ||
      sc.source_artifact?.files?.[0]?.content ||
      sc.source ||
      '';
    const gen =
      sc.generated_code ||
      sc.generatedArtifact?.files?.[0]?.content ||
      sc.generated_artifact?.files?.[0]?.content ||
      sc.generated ||
      '';

    setSourceCode(src);
    setGeneratedCode(gen);
    setVerificationResult(null);
    setError(null);
    setActiveTab('VERIFY');
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-[#10141d]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-[#0b0e14] rounded-[11px] flex items-center justify-center">
                <Shield className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wider uppercase text-white">
                  Hallucination Hunter
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Deterministic v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">AST & Behavioural Differential Verifier</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 rounded-xl border border-slate-800 bg-[#07090e] p-1 shadow-inner">
            <button
              onClick={() => setActiveTab('VERIFY')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'VERIFY'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              Workspace
            </button>
            <button
              onClick={() => setActiveTab('SCENARIOS')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'SCENARIOS'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Scenarios
            </button>
            <button
              onClick={() => setActiveTab('EVALUATION')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'EVALUATION'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Evaluation
            </button>
          </nav>

          {/* Sandbox Health Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800 bg-[#07090e] text-xs font-mono">
            <span
              className={`h-2 w-2 rounded-full ${
                backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className={backendOnline ? 'text-slate-300' : 'text-rose-400'}>
              {backendOnline ? 'Sandbox Active' : 'Engine Disconnected'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-300 flex items-center justify-between backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200 font-mono text-sm px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab 1: Verification Workspace */}
        {activeTab === 'VERIFY' && (
          <div>
            {!verificationResult ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 bg-[#10141d] border border-slate-800/80 p-4 rounded-2xl shadow-sm">
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                      Differential Artefact Verifier
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Submits source and candidate code to AST isolation & boundary sandbox execution
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSourceCode(DEFAULT_SOURCE);
                        setGeneratedCode(DEFAULT_GENERATED);
                        setError(null);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800/60 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-all"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                      Reset
                    </button>
                    <button
                      onClick={handleRunVerification}
                      disabled={loading || backendOnline === false}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Verifying Vectors...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-white" />
                          <span>Verify Artefact</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Two-Column Editor Surface */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-slate-800 bg-[#10141d] overflow-hidden shadow-xl flex flex-col">
                    <div className="border-b border-slate-800/80 bg-[#131824] px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                          Source Artefact (Original)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        Ground Truth
                      </span>
                    </div>
                    <textarea
                      value={sourceCode}
                      onChange={(e) => setSourceCode(e.target.value)}
                      spellCheck={false}
                      rows={16}
                      className="w-full flex-1 p-4 font-mono text-xs text-slate-200 bg-[#07090e] border-0 outline-none resize-none leading-relaxed selection:bg-indigo-500/30"
                      placeholder="Paste reference Python implementation..."
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-[#10141d] overflow-hidden shadow-xl flex flex-col">
                    <div className="border-b border-slate-800/80 bg-[#131824] px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-purple-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                          AI-Generated Artefact (Candidate)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/50">
                        Subject Code
                      </span>
                    </div>
                    <textarea
                      value={generatedCode}
                      onChange={(e) => setGeneratedCode(e.target.value)}
                      spellCheck={false}
                      rows={16}
                      className="w-full flex-1 p-4 font-mono text-xs text-slate-200 bg-[#07090e] border-0 outline-none resize-none leading-relaxed selection:bg-purple-500/30"
                      placeholder="Paste candidate AI Python implementation..."
                    />
                  </div>
                </div>
              </div>
            ) : (
              <ResultView
                sourceCode={sourceCode}
                generatedCode={generatedCode}
                verificationResult={verificationResult}
                onReset={() => setVerificationResult(null)}
              />
            )}
          </div>
        )}

        {/* Tab 2: Scenario Browser */}
        {activeTab === 'SCENARIOS' && (
          <ScenarioBrowser onSelectScenario={handleSelectScenario} />
        )}

        {/* Tab 3: Evaluation Dashboard */}
        {activeTab === 'EVALUATION' && <EvaluationDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-[#0b0e14] py-4 text-center text-xs font-mono text-slate-500">
        Hallucination Hunter • Deterministic Dual-Agent Sandbox Verifier
      </footer>
    </div>
  );
}