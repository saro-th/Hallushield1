// frontend/src/components/ScenarioBrowser.jsx

import React, { useEffect, useState } from 'react';
import { getScenarios } from '../api/client';
import { Layers, Loader2, ArrowRight, AlertTriangle, Code2, Terminal } from 'lucide-react';

export default function ScenarioBrowser({ onSelectScenario }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await getScenarios();
        if (mounted) {
          // Normalizes across raw array and { total_scenarios, scenarios: [...] }
          const list = Array.isArray(data) ? data : (data?.scenarios || []);
          setScenarios(list);
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load scenarios');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="text-xs font-mono uppercase tracking-wider">
          Loading Curated Benchmark Library...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 text-xs text-rose-300 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <div className="border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
          <h2 className="text-xl font-black tracking-wide text-white uppercase">
            Curated Scenario Library ({scenarios.length})
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          Select a benchmark suite to load source and candidate artefacts directly into the verification workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((sc) => {
          const isDivergent = sc.expected_verdict === 'DIVERGENCE_DETECTED';

          return (
            <div
              key={sc.id}
              onClick={() => onSelectScenario(sc)}
              className="rounded-2xl border border-slate-800 bg-[#10141d] hover:border-indigo-500/50 hover:bg-[#131826] p-6 text-xs shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500 bg-[#0a0c10] px-2.5 py-1 rounded-md border border-slate-800">
                      {sc.id}
                    </span>
                    {sc.category && (
                      <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                        {sc.category}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${
                      isDivergent
                        ? 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                        : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                    }`}
                  >
                    Expected: {sc.expected_verdict}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {sc.name}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed mt-2 line-clamp-2">
                    {sc.description}
                  </p>
                </div>

                {sc.source_code && (
                  <div className="rounded-xl border border-slate-800/80 bg-[#07090e] p-3 font-mono text-[11px] text-slate-400 overflow-hidden select-none">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
                      <Code2 className="h-3 w-3" />
                      <span>Reference Pattern Preview:</span>
                    </div>
                    <p className="truncate text-slate-300">{sc.source_code.split('\n')[0]}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-indigo-400 group-hover:text-indigo-300 transition-colors">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5" />
                  Load Into Verification Workspace
                </span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}