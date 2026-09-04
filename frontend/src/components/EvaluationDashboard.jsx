import React, { useEffect, useState } from 'react';
import { getEvaluation, downloadEvaluationExport } from '../api/client';
import { BarChart3, Download, RefreshCw, AlertTriangle, CheckCircle2, ShieldX, Loader2 } from 'lucide-react';

export default function EvaluationDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const fetchBenchmark = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getEvaluation();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch benchmark evaluation metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmark();
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      await downloadEvaluationExport();
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h2 className="text-lg font-bold tracking-wide text-zinc-100">
            Forensic Benchmark Evaluation
          </h2>
          <p className="text-xs text-zinc-400">
            Empirical accuracy, false positive metrics, and sandbox latency across curated test suites
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBenchmark}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Metrics
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
          >
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Export Benchmark Report (.md)
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-4 text-xs text-rose-300 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {loading && !data && (
        <div className="flex items-center justify-center p-16 text-zinc-400 gap-3 text-xs">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <span>Evaluating benchmark dataset across deterministic sandboxes...</span>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-zinc-800 bg-[#121215] p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Detection Accuracy
              </span>
              <div className="text-2xl font-black text-emerald-400">
                {data.accuracy_score !== undefined ? `${(data.accuracy_score * 100).toFixed(1)}%` : '—'}
              </div>
              <span className="text-[11px] text-zinc-400">Deterministic correctness</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#121215] p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Mean Latency
              </span>
              <div className="text-2xl font-black text-indigo-400">
                {data.mean_latency_ms !== undefined ? `${data.mean_latency_ms.toFixed(0)} ms` : '—'}
              </div>
              <span className="text-[11px] text-zinc-400">Subprocess execution</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#121215] p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Divergences Caught
              </span>
              <div className="text-2xl font-black text-rose-400">
                {data.divergence_count ?? 0}
              </div>
              <span className="text-[11px] text-zinc-400">Total verified deviations</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#121215] p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Clean Refactors
              </span>
              <div className="text-2xl font-black text-zinc-200">
                {data.verified_count ?? 0}
              </div>
              <span className="text-[11px] text-zinc-400">Equivalence preserved</span>
            </div>
          </div>

          {data.scenario_results && data.scenario_results.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-lg">
              <div className="border-b border-zinc-800 bg-[#16161b] px-5 py-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Scenario Execution Results ({data.scenario_results.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-800 bg-[#141418] text-zinc-400 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="px-5 py-3">Scenario</th>
                      <th className="px-5 py-3">Expected Verdict</th>
                      <th className="px-5 py-3">Actual Verdict</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                    {data.scenario_results.map((item, idx) => {
                      const match = item.expected_verdict === item.actual_verdict;
                      return (
                        <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="px-5 py-3 font-semibold text-zinc-200">{item.name || item.scenario_id}</td>
                          <td className="px-5 py-3 text-zinc-400">{item.expected_verdict}</td>
                          <td className="px-5 py-3 text-zinc-200 font-bold">{item.actual_verdict}</td>
                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                                match
                                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                                  : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
                              }`}
                            >
                              {match ? <CheckCircle2 className="h-3 w-3" /> : <ShieldX className="h-3 w-3" />}
                              {match ? 'MATCH' : 'MISMATCH'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}