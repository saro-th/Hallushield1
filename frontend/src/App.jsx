import React, { useState, useEffect } from 'react';
import ResultView from './components/ResultView';
import ScenarioBrowser from './components/ScenarioBrowser';
import EvaluationDashboard from './components/EvaluationDashboard';
import { verifyArtifact, checkHealth } from './api/client';
import { Shield, Play, Loader2, AlertTriangle, Layers, BarChart2, Terminal } from 'lucide-react';

const DEFAULT_SOURCE = `def calculate_tax(amount: float, rate: float) -> float:
    """Calculates total tax using IEEE-754 banker's rounding."""
    return round(amount * (1 + rate), 2)
`;

const DEFAULT_GENERATED = `def calculate_tax(amount: float, rate: float) -> float:
    """Optimized calculation using integer truncation."""
    return int(amount * (1 + rate))
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
    const interval = setInterval(poll, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleRunVerification = async () => {
    if (!sourceCode.trim() || !generatedCode.trim()) {
      setError('Both Source and Generated artefacts are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await verifyArtifact(sourceCode, generatedCode);
      setVerificationResult(result);
    } catch (err) {
      setError(err.message || 'Verification engine failed to respond.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectScenario = (sc) => {
    setSourceCode(sc.source_code || '');
    setGeneratedCode(sc.generated_code || '');
    setVerificationResult(null);
    setError(null);
    setActiveTab('VERIFY');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0d] text-zinc-100 flex flex-col items-center font-sans">
      {/* Global Header */}
      <header className="w-full border-b border-zinc-800/80 bg-[#121216]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-wider uppercase text-zinc-100">
                  Hallucination Hunter
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
                  v1.0.0
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Deterministic Code Artefact Verification Platform
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-[#16161b] p-1">
            <button
              onClick={() => setActiveTab('VERIFY')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'VERIFY' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              Verify Workspace
            </button>
            <button
              onClick={() => setActiveTab('SCENARIOS')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'SCENARIOS' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Scenarios
            </button>
            <button
              onClick={() => setActiveTab('EVALUATION')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'EVALUATION' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              Evaluation
            </button>
          </nav>

          <div className="flex items-center gap-2 text-xs font-mono">
            <div className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className={backendOnline ? 'text-zinc-300' : 'text-rose-400'}>
              {backendOnline ? 'Engine Connected' : 'Engine Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Surface */}
      <main className="w-full max-w-7xl px-6 py-8 flex-1">
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-rose-900/40 bg-rose-950/20 p-4 text-xs text-rose-300">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200 font-bold">
              ✕
            </button>
          </div>
        )}

        {activeTab === 'VERIFY' && (
          <div>
            {!verificationResult ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
                      Artefact Inspection Workspace
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Input Python implementations to execute differential sandbox tests
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSourceCode(DEFAULT_SOURCE);
                        setGeneratedCode(DEFAULT_GENERATED);
                        setError(null);
                      }}
                      className="rounded-xl border border-zinc-800 bg-[#16161b] hover:bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-all"
                    >
                      Reset Example
                    </button>
                    <button
                      onClick={handleRunVerification}
                      disabled={loading || backendOnline === false}
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Executing Sandbox...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 fill-white" />
                          <span>Verify Artefact</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[440px]">
                  <div className="flex flex-col rounded-xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-lg">
                    <div className="border-b border-zinc-800 bg-[#18181c] px-4 py-2.5 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                        Reference Implementation (Source)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                        Trusted
                      </span>
                    </div>
                    <textarea
                      value={sourceCode}
                      onChange={(e) => setSourceCode(e.target.value)}
                      spellCheck={false}
                      className="h-full w-full min-h-[380px] resize-none border-0 bg-[#101012] p-4 font-mono text-xs leading-5 text-zinc-200 outline-none"
                    />
                  </div>

                  <div className="flex flex-col rounded-xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-lg">
                    <div className="border-b border-zinc-800 bg-[#18181c] px-4 py-2.5 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                        AI-Generated Artefact (Candidate)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                        Under Verification
                      </span>
                    </div>
                    <textarea
                      value={generatedCode}
                      onChange={(e) => setGeneratedCode(e.target.value)}
                      spellCheck={false}
                      className="h-full w-full min-h-[380px] resize-none border-0 bg-[#101012] p-4 font-mono text-xs leading-5 text-zinc-200 outline-none"
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

        {activeTab === 'SCENARIOS' && <ScenarioBrowser onSelectScenario={handleSelectScenario} />}
        {activeTab === 'EVALUATION' && <EvaluationDashboard />}
      </main>

      <footer className="w-full border-t border-zinc-800/60 bg-[#0d0d10] py-4 text-center text-[11px] font-mono text-zinc-500">
        Hallucination Hunter • Deterministic Dual-Agent Sandbox Verifier • 100% Credential Independent
      </footer>
    </div>
  );
}