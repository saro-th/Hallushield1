import React, { useEffect, useState } from 'react';
import { getScenarios } from '../api/client';
import { Layers, Loader2, ArrowRight, AlertTriangle } from 'lucide-react';

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
        if (mounted) setScenarios(data);
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
      <div className="flex items-center justify-center p-12 text-zinc-400 gap-3 text-xs">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
        <span>Loading curated benchmark scenarios from backend...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-900/30 bg-rose-950/20 p-4 text-xs text-rose-300 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
          Curated Benchmark Scenarios ({scenarios.length})
        </h2>
        <p className="text-xs text-zinc-400">
          Select an empirical verification scenario to load real Python artefacts into the workspace
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((sc) => {
          const isDivergent = sc.expected_verdict === 'DIVERGENCE_DETECTED';

          return (
            <div
              key={sc.id}
              onClick={() => onSelectScenario(sc)}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-[#121215] hover:border-indigo-500/50 hover:bg-[#15151a] p-4 text-xs shadow-md transition-all cursor-pointer group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-zinc-500">{sc.id}</span>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isDivergent
                        ? 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                        : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                    }`}
                  >
                    Expected: {sc.expected_verdict}
                  </span>
                </div>

                <h3 className="font-bold text-zinc-200 text-sm group-hover:text-indigo-300 transition-colors">
                  {sc.name}
                </h3>
                <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-3">
                  {sc.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                <span className="text-[10px] font-semibold uppercase tracking-wider">Load Into Editor</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}