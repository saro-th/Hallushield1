import React, { useState } from 'react';
import VerificationBanner from './VerificationBanner';
import AuditModal from './AuditModal';
import { getAudit } from '../api/client';
import { 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle2, 
  BookOpen, 
  Cpu, 
  ExternalLink,
  Layers
} from 'lucide-react';

export default function ResultView({ sourceCode, generatedCode, verificationResult, onReset }) {
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [auditData, setAuditData] = useState(null);

  const handleOpenAudit = async () => {
    if (verificationResult?.verification_id) {
      try {
        const fullAudit = await getAudit(verificationResult.verification_id);
        setAuditData(fullAudit);
      } catch {
        setAuditData(verificationResult);
      }
    } else {
      setAuditData(verificationResult);
    }
    setIsAuditOpen(true);
  };

  const divergences = verificationResult?.divergences || [];
  const scopes = verificationResult?.verification_scopes || [];
  const trace = verificationResult?.investigation_trace;
  const synthesis = verificationResult?.review_synthesis;
  const steps = verificationResult?.agent_steps || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Return Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Code Editor
        </button>
        <span className="text-xs font-mono text-slate-500">
          ID: {verificationResult?.verification_id || 'LOCAL_RUN'}
        </span>
      </div>

      {/* Prominent Verdict Banner */}
      <VerificationBanner result={verificationResult} onOpenAudit={handleOpenAudit} />

      {/* Forensic Divergence Breakdown */}
      {divergences.length > 0 && (
        <div className="rounded-2xl border border-rose-500/30 bg-[#131017] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-200">
                Where Did It Diverge? ({divergences.length} Discrepancy Found)
              </h3>
              <p className="text-xs text-slate-400">
                Differences isolated by differential sandbox execution
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {divergences.map((div, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-[#0a0c10] p-4 text-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500">#{idx + 1}</span>
                    <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                      {div.function}()
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-800/50">
                      {div.type}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed">{div.explanation}</p>

                {div.test_case && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 font-mono text-[11px]">
                    <div className="rounded-lg border border-slate-800 bg-[#10141d] p-3">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                        Trigger Input
                      </span>
                      <pre className="text-slate-200 whitespace-pre-wrap break-all">
                        {JSON.stringify(div.test_case.input_data, null, 2)}
                      </pre>
                    </div>

                    <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3">
                      <span className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1">
                        Expected Output (Source)
                      </span>
                      <div className="text-emerald-300 font-bold break-all">
                        {String(div.test_case.expected_output)}
                      </div>
                    </div>

                    <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-3">
                      <span className="text-[10px] text-rose-400 uppercase tracking-wider block mb-1">
                        Actual Output (Candidate)
                      </span>
                      <div className="text-rose-300 font-bold break-all">
                        {String(div.test_case.actual_output)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scope and Agent Investigation Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Scopes */}
        <div className="rounded-2xl border border-slate-800 bg-[#10141d] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Evaluated Verification Scopes
              </h3>
              <p className="text-xs text-slate-400">Gated dimensions analyzed by verifier</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {scopes.map((s, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-800/80 bg-[#07090e]"
              >
                <div>
                  <span className="font-semibold text-slate-200 block">{s.name}</span>
                  <span className="text-[11px] text-slate-400">{s.details}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                    s.status === 'PASS'
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                      : s.status === 'FAIL'
                      ? 'bg-rose-950/40 text-rose-400 border-rose-800/60'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Investigation Lifecycle */}
        <div className="rounded-2xl border border-slate-800 bg-[#10141d] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-200">
                Verification Agent Trace
              </h3>
              <p className="text-xs text-slate-400">Deterministic triage actions and synthesis</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-800/80 bg-[#07090e] space-y-1.5 font-mono text-[11px]">
              {steps.slice(0, 5).map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-300">
                  <span className="text-indigo-400">✓</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            {synthesis?.uncertainty_notes && (
              <div className="p-3 rounded-xl border border-slate-800/80 bg-[#07090e]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                  Review Agent Synthesis
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {synthesis.uncertainty_notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        auditData={auditData}
      />
    </div>
  );
}