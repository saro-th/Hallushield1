import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

const STEPS = [
  'Initializing secure execution sandbox',
  'Parsing abstract syntax trees (AST)',
  'Executing behavioural heuristics',
  'Isolating divergence logic',
  'Compiling forensic evidence'
];

export default function LoadingOverlay() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev === STEPS.length - 1 ? prev : prev + 1));
    }, 850);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center animate-in zoom-in-95 duration-500">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
        
        {/* Header Area */}
        <div className="border-b border-slate-800 bg-slate-950/50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 ring-1 ring-blue-500/30">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-bold text-white">Analyzing Artefact</h3>
          <p className="mt-2 text-sm text-slate-400">Please do not close this window.</p>
        </div>

        {/* Graphical Stepper */}
        <div className="p-8">
          <div className="flex flex-col gap-5">
            {STEPS.map((step, idx) => {
              const isCompleted = idx < activeStep;
              const isActive = idx === activeStep;
              const isPending = idx > activeStep;

              return (
                <div key={idx} className="flex items-center gap-4 transition-all duration-300">
                  {/* Status Graphic */}
                  <div className="flex-shrink-0">
                    {isCompleted && <CheckCircle2 className="h-6 w-6 text-emerald-500 animate-in zoom-in duration-300" />}
                    {isActive && <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />}
                    {isPending && <Circle className="h-6 w-6 text-slate-700" />}
                  </div>
                  
                  {/* Step Text */}
                  <span className={`text-[15px] font-medium transition-colors duration-300 ${
                    isCompleted ? 'text-slate-300' : 
                    isActive ? 'text-white' : 'text-slate-600'
                  }`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}