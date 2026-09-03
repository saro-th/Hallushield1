import React, { useState } from 'react';
import DivergenceList from './DivergenceList';
import VerificationBanner from './VerificationBanner';
import EvidenceDrawer from './EvidenceDrawer';

const CodeViewer = ({ title, code, highlightedLines = [] }) => {
  const lines = (code || '// No code provided').split('\n');

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <h3 className="text-[13px] font-bold tracking-wide text-slate-800">
          {title}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto py-4 font-mono text-[14px]">
        {lines.map((line, index) => {
          const lineNum = index + 1;
          const isHighlighted = highlightedLines.includes(lineNum);
          
          return (
            <div 
              key={lineNum} 
              className={`flex px-2 py-0.5 transition-colors ${
                isHighlighted 
                  ? 'border-l-[3px] border-rose-500 bg-rose-50 text-rose-900' 
                  : 'border-l-[3px] border-transparent text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="w-12 select-none pr-4 text-right text-[12px] text-slate-400">
                {lineNum}
              </span>
              <span className="whitespace-pre break-all">
                {line || ' '}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function ResultView({ sourceCode, generatedCode, verificationResult, onReset }) {
  const [activeDivergence, setActiveDivergence] = useState(null);

  const divergences = verificationResult?.issues || [
    {
      id: 'd1',
      functionName: 'calculate_total()',
      type: 'BEHAVIOURAL_MISMATCH',
      explanation: 'The AI omitted the tax calculation multiplier entirely, leading to a net-loss output in edge cases.',
      highlightLines: [4, 5, 6] 
    },
    {
      id: 'd2',
      functionName: 'fetchUserData()',
      type: 'STRUCTURAL_DRIFT',
      explanation: 'Generated code relies on a deprecated async wrapper pattern not present in the original source guidelines.',
      highlightLines: [12, 13]
    }
  ];

  const linesToHighlight = activeDivergence 
    ? activeDivergence.highlightLines 
    : divergences.flatMap(d => d.highlightLines);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 w-full">
      
      <VerificationBanner result={verificationResult} />

      {/* Replaced Flex with strict CSS Grid to prevent overlapping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[450px]">
        <CodeViewer 
          title="Reference Source" 
          code={sourceCode} 
        />
        <CodeViewer 
          title="AI Artefact" 
          code={generatedCode} 
          highlightedLines={linesToHighlight} 
        />
      </div>

      <div className="pt-2">
        <DivergenceList 
          divergences={divergences} 
          activeId={activeDivergence?.id}
          onCardClick={(issue) => setActiveDivergence(issue)} 
        />
      </div>

      <div className="flex items-center justify-center pb-8 pt-4">
        <button
          onClick={onReset}
          className="rounded-xl border border-slate-200 bg-white px-8 py-3 text-[14px] font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 hover:shadow-md"
        >
          Verify Another Artefact
        </button>
      </div>

      <EvidenceDrawer 
        isOpen={activeDivergence !== null} 
        onClose={() => setActiveDivergence(null)}
        divergence={activeDivergence}
      />
    </div>
  );
}