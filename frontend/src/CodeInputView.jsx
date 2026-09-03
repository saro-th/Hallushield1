import React, { useState } from 'react';
import { Sparkles, Code2, ArrowRight, FileJson, CheckCircle2 } from 'lucide-react';

const FileTypeToggle = ({ options, active, onChange }) => (
  <div className="flex items-center rounded-lg bg-slate-900 p-1 border border-slate-800">
    {options.map((opt) => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        className={`rounded-md px-3 py-1 text-[11px] font-bold transition-all duration-200 ${
          active === opt 
            ? 'bg-slate-700 text-white shadow-sm' 
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

const EditorPane = ({ title, code, onCodeChange, isAI }) => {
  const [extension, setExtension] = useState('JS');
  const isFilled = code.trim().length > 0;
  
  const focusRing = isAI 
    ? 'focus-within:ring-2 focus-within:ring-violet-500/30 focus-within:border-violet-500/50' 
    : 'focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500/50';

  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0f172a] shadow-xl transition-all duration-300 ${focusRing}`}>
      
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/50 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-1.5 ${isAI ? 'bg-violet-500/10' : 'bg-blue-500/10'}`}>
            {isAI ? <Sparkles className="h-4 w-4 text-violet-400" /> : <Code2 className="h-4 w-4 text-blue-400" />}
          </div>
          <h3 className="text-sm font-bold tracking-wide text-slate-200">
            {title}
          </h3>
        </div>
        <FileTypeToggle options={['JS', 'PY', 'TS']} active={extension} onChange={setExtension} />
      </div>

      <div className="relative flex-1">
        {/* Graphical Empty State - Only shows when code is empty */}
        {!isFilled && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-40 transition-opacity">
            <FileJson className="h-12 w-12 text-slate-500" strokeWidth={1.5} />
            <p className="text-[13px] font-medium text-slate-400">
              {isAI ? "Paste generated artefact here" : "Paste reference source here"}
            </p>
          </div>
        )}
        
        <textarea
          value={code} onChange={(e) => onCodeChange(e.target.value)} spellCheck={false}
          className="relative z-10 h-full w-full resize-none bg-transparent p-6 font-mono text-[14px] leading-relaxed text-slate-300 outline-none"
        />
      </div>
    </div>
  );
};

export default function CodeInputView({ sourceCode, setSourceCode, generatedCode, setGeneratedCode, onVerify }) {
  const isDisabled = !sourceCode && !generatedCode;

  return (
    <div className="flex h-full flex-col gap-6 animate-in fade-in duration-500">
      
      <div className="text-center pb-4 pt-2">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-3">Detect Code Hallucinations</h2>
        <p className="text-[15px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Securely verify AI-generated output against your original source. Our forensic engine detects logic drift, structural anomalies, and semantic errors in milliseconds.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex-1">
          <EditorPane title="Reference Source" code={sourceCode} onCodeChange={setSourceCode} isAI={false} />
        </div>
        <div className="flex-1">
          <EditorPane title="AI Artefact" code={generatedCode} onCodeChange={setGeneratedCode} isAI={true} />
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-center pt-8 pb-4">
        <button
          onClick={onVerify}
          disabled={isDisabled} 
          className={`group relative flex items-center gap-3 rounded-xl px-10 py-4 font-bold transition-all duration-300 shadow-lg
            ${isDisabled 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]'}`}
        >
          {isDisabled ? <CheckCircle2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5 animate-pulse" />}
          <span className="text-base tracking-wide">Execute Verification Scan</span>
          <ArrowRight className={`h-5 w-5 ${isDisabled ? 'opacity-0' : 'transition-transform group-hover:translate-x-1'}`} />
        </button>
      </div>
    </div>
  );
}