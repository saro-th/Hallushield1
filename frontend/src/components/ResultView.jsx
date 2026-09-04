import React, { useState } from 'react';
import DivergenceList from './DivergenceList';
import VerificationBanner from './VerificationBanner';
import EvidenceDrawer from './EvidenceDrawer';
import AuditModal from './AuditModal';
import { getAudit } from '../api/client';
import { ShieldCheck, FileJson, Bot, CheckCircle2 } from 'lucide-react';

const CodeViewer = ({ title, code, highlightedLines = [] }) => {
  const lines = (code || '// No code provided').split('\n');

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-[#121214] shadow-lg">
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-[#18181b] px-5 py-3">
        <h3 className="text-[13px] font-bold tracking-wide text-zinc-200">{title}</h3>
        <span className="text-[11px] font-mono text-zinc-500">{lines.length} lines</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 font-mono text-[13px]">
        {lines.map((line, index) => {
          const lineNum = index + 1;
          const isHighlighted = highlightedLines.includes(lineNum);

          return (
            <div
              key={lineNum}
              className={`flex px-2 py-0.5 transition-colors ${
                isHighlighted
                  ? 'border-l-[3px] border-rose-500 bg-rose-950/20 text-rose-300'
                  : 'border-l-[3px] border-transparent text-zinc-400 hover:bg-zinc-900/40'
              }`}
            >
              <span className="w-10 select-none pr-4 text-right text-[11px] text-zinc-600 font-mono">
                {lineNum}
              </span>
              <span className="whitespace-pre break-all">{line || ' '}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function ResultView({ sourceCode, generatedCode, verificationResult, onReset }) {
  const [activeDivergence, setActiveDivergence] = useState(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [auditData, setAuditData] = useState(null);

  // Map backend divergences into the list format expected by DivergenceList & EvidenceDrawer
  const rawDivergences = verificationResult?.divergences || [];
  const divergences = rawDivergences.map((d, idx) => ({
    id: d.divergence_id || `div_${idx}`,
    functionName: d.function,
    type: d.type,
    explanation: d.explanation,
    testCase: d.test_case ? JSON.stringify(d.test_case.input_data) : 'Custom Boundary Input',
    expectedOutput: d.test_case ? String(d.test_case.expected_output) : d.expected_behaviour,
    actualOutput: d.test_case ? String(d.test_case.actual_output) : d.actual_behaviour,
    evidence: d.evidence || [],
    highlightLines: [1, 2],
  }));

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

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 w-full pb-10">
      {/* 1. Primary Verdict Banner */}
      <VerificationBanner result={verificationResult} />

      {/* 2. Genuine AI Investigation & Domain Triage Card */}
      {verificationResult?.investigation_trace && (
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Bot className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                AI Investigation & Domain Triage
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-indigo-900/40 text-indigo-300 border border-indigo-800">
              Domain: {verificationResult.investigation_trace.domain_detected}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-semibold text-zinc-400 uppercase text-[10px] tracking-wider block mb-1">
                Triage Hypotheses
              </span>
              <ul className="space-y-1.5 text-zinc-300">
                {(verificationResult.investigation_trace.triage_hypotheses || []).map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-mono">›</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-semibold text-zinc-400 uppercase text-[10px] tracking-wider block mb-1">
                Review Agent Synthesis
              </span>
              <p className="text-zinc-300 leading-relaxed">
                {verificationResult.review_synthesis?.uncertainty_notes ||
                  verificationResult.review_synthesis?.executive_summary ||
                  verificationResult.summary ||
                  'Deterministic sandbox execution completed.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Verifiability & Scopes Sub-header */}
      {verificationResult?.verifiability && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-[#121214] p-4 text-xs">
          <div>
            <span className="font-semibold text-zinc-400">Verifiability Model: </span>
            <span className="font-bold text-indigo-400">{verificationResult.verifiability.verifiable}</span>
            <span className="mx-2 text-zinc-600">|</span>
            <span className="text-zinc-400">{verificationResult.summary}</span>
          </div>
          <button
            onClick={handleOpenAudit}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-all"
          >
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            Inspect Cryptographic Audit
          </button>
        </div>
      )}

      {/* 4. Side-by-Side Dual Code Viewers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[450px]">
        <CodeViewer title="Reference Source" code={sourceCode} />
        <CodeViewer
          title="AI Artefact"
          code={generatedCode}
          highlightedLines={activeDivergence?.highlightLines || []}
        />
      </div>

      {/* 5. Detected Divergences */}
      <div className="pt-2">
        <DivergenceList
          divergences={divergences}
          activeId={activeDivergence?.id}
          onCardClick={(issue) => setActiveDivergence(issue)}
        />
      </div>

      {/* 6. Action Footer */}
      <div className="flex items-center justify-center pb-8 pt-4 gap-4">
        <button
          onClick={onReset}
          className="rounded-xl border border-zinc-700 bg-zinc-800 px-8 py-3 text-[14px] font-semibold text-zinc-200 shadow-sm transition-all hover:bg-zinc-700 active:scale-[0.98]"
        >
          Verify Another Artefact
        </button>
      </div>

      {/* 7. Drawers & Modals */}
      <EvidenceDrawer
        isOpen={activeDivergence !== null}
        onClose={() => setActiveDivergence(null)}
        divergence={activeDivergence}
      />

      <AuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        auditData={auditData}
      />
    </div>
  );
}