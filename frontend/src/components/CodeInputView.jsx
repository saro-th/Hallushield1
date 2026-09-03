import React, { useState } from 'react';
import { ShieldCheck, FileSearch, ArrowRight, FileJson, AlertTriangle } from 'lucide-react';

const FileTypeToggle = ({ options, active, onChange }) => (
  <div className="flex items-center rounded-md bg-zinc-950/50 p-1 border border-zinc-800">
    {options.map((opt) => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        className={`rounded px-2.5 py-1 text-[10px] font-bold tracking-wider transition-all duration-200 ${
          active === opt 
            ? 'bg-zinc-700 text-white shadow-sm' 
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

const EditorPane = ({ title, description, code, onCodeChange, type }) => {
  const [extension, setExtension] = useState('JS');
  const isFilled = code.trim().length > 0;
  
  const isTarget = type === 'target';
  
  // Detection-focused styling: Reference is stable (Indigo), Target is focus (Amber/Rose)
  const focusRing = isTarget 
    ? 'focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500/50' 
    : 'focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50';

  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-[#121214] shadow-lg transition-all duration-300 ${focusRing}`}>
      
      {/* Pane Header with Micro-copy */}
      <div className="flex items-start justify-between border-b border-zinc-800/80 bg-[#18181b] px-5 py-4">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 rounded-lg p-1.5 ${isTarget ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
            {isTarget ? <FileSearch className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
          </div>
          <div>
            <h3 className="text-[14px] font-bold tracking-wide text-zinc-100">
              {title}
            </h3>
            <p className="mt-1 text-[11px] text-zinc-500">{description}</p>
          </div>
        </div>
        <FileTypeToggle options={['JS', 'PY', 'TS']} active={extension} onChange={setExtension} />
      </div>

      <div className="relative flex-1">
        {/* Graphical Empty State with quick-start hints */}
        {!isFilled && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 transition-opacity">
            <div className="rounded-full bg-zinc-900 p-4 ring-1 ring-white/5">
              <FileJson className="h-8 w-8 text-zinc-600" strokeWidth={1.5} />
            </div>
            <p className="text-[12px] font-medium text-zinc-500">
              {isTarget ? "Paste generated artefact here to scan" : "Paste trusted ground-truth code here"}
            </p>
          </div>
        )}
        
        {/* Code Area with visual line number illusion */}
        <div className="absolute bottom-0 left-0 top-0 w-10 border-r border-zinc-800/50 bg-black/20"></div>
        <textarea
          value={code} onChange={(e) => onCodeChange(e.target.value)} spellCheck={false}
          className="relative z-10 h-full w-full resize-none bg-transparent py-5 pl-14 pr-5 font-mono text-[13px] leading-relaxed text-zinc-300 outline-none"
        />
      </div>
    </div>
  );
};

export default function CodeInputView({ sourceCode, setSourceCode, generatedCode, setGeneratedCode, onVerify }) {
  const isDisabled = !sourceCode && !generatedCode;

  return (
    <div className="flex h-full flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Intro Header */}
      <div className="pb-4 pt-2">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100 mb-2">Forensic Code Analysis</h2>
        <p className="text-[14px] text-zinc-400 max-w-3xl leading-relaxed">
          Establish your trusted baseline, then run a deep execution scan on AI-generated artefacts to surface structural drift, behavioral hallucinations, and logic errors.
        </p>
      </div>

      {/* Asymmetrical Layout: Reference (Narrower) vs Target (Wider) */}
      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        
        <div className="lg:col-span-5">
          <EditorPane 
            title="Reference Code" 
            description="The original, ground-truth implementation."
            code={sourceCode} 
            onCodeChange={setSourceCode} 
            type="source" 
          />
        </div>
        
        {/* Visual Divider on Large Screens */}
        <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-600 shadow-inner">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>

        <div className="lg:col-span-6">
          <EditorPane 
            title="Code to Verify" 
            description="The AI-generated artefact to be analyzed."
            code={generatedCode} 
            onCodeChange={setGeneratedCode} 
            type="target" 
          />
        </div>
      </div>

      {/* Action Anchor */}
      <div className="flex shrink-0 items-center justify-center pt-8 pb-4">
        <button
          onClick={onVerify}
          disabled={isDisabled} 
          className={`group relative flex items-center gap-3 rounded-xl px-12 py-4 font-bold transition-all duration-300
            ${isDisabled 
              ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800' 
              : 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white hover:shadow-[0_0_30px_-5px_rgba(225,29,72,0.4)] hover:-translate-y-0.5 border border-rose-500/30'}`}
        >
          {isDisabled ? <ShieldCheck className="h-5 w-5 opacity-50" /> : <AlertTriangle className="h-5 w-5 animate-pulse text-rose-200" />}
          <span className="text-[15px] tracking-wide">
            {isDisabled ? "Awaiting Input Sequence" : "Scan for Hallucinations"}
          </span>
        </button>
      </div>
    </div>
  );
}