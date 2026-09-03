import React from 'react';
import { X, Code2 } from 'lucide-react';

export default function EvidenceDrawer({ isOpen, onClose, divergence }) {
  // If no divergence is selected, we provide fallback empty data
  const data = divergence || {};

  return (
    <>
      {/* Backdrop (Optional, but focuses attention on the drawer) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-out Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform border-l border-zinc-800 bg-zinc-950 shadow-2xl transition-transform duration-300 ease-in-out sm:w-96 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-6 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-zinc-100">
              <Code2 className="h-4 w-4 text-indigo-400" />
              Execution Evidence
            </h2>
            <button 
              onClick={onClose}
              className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Target Function
              </h3>
              <div className="rounded border border-zinc-800 bg-zinc-900 p-3 font-mono text-sm text-zinc-300">
                {data.functionName || 'Unknown Function'}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Test Case (Inputs)
              </h3>
              <div className="rounded border border-zinc-800 bg-zinc-900 p-3 font-mono text-sm text-indigo-300">
                {data.testCase || 'price = 100.50, tax_rate = 0.05'}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Expected Output Block */}
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-500/80">
                  Expected Output (Original)
                </h3>
                <div className="rounded-lg border-l-4 border-l-emerald-500 border-y border-r border-y-zinc-800 border-r-zinc-800 bg-emerald-950/10 p-3 font-mono text-sm text-emerald-200 shadow-inner">
                  {data.expectedOutput || '105.525'}
                </div>
              </div>

              {/* Actual Output Block */}
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose-500/80">
                  Actual Output (Generated)
                </h3>
                <div className="rounded-lg border-l-4 border-l-rose-500 border-y border-r border-y-zinc-800 border-r-zinc-800 bg-rose-950/10 p-3 font-mono text-sm text-rose-200 shadow-inner">
                  {data.actualOutput || '100.50'}
                </div>
              </div>
            </div>
            
            <div className="mt-8 rounded-lg border border-indigo-900/50 bg-indigo-950/20 p-4">
              <p className="text-xs leading-relaxed text-indigo-300">
                <strong>Analysis:</strong> {data.explanation || 'Review the inputs and outputs to understand the divergence context.'}
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}